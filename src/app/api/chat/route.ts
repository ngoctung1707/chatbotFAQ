import { NextRequest, NextResponse } from 'next/server'
import {
  appendMessage,
  getHistoryAndModel,
  setSessionModel,
} from '@/lib/chatbot/chatHistory'
import {
  answerStream,
  friendlyError,
  isRefusal,
  preprocessQuery,
} from '@/lib/chatbot/llm'
import { Retriever, type RetrievalChunk } from '@/lib/chatbot/retriever'
import { MOCK } from '@/lib/chatbot/config'
import { MAX_QUESTION_CHARS } from '@/lib/chatbot/limits'

// Runs the retrieval + Gemini-answering pipeline in-process (ported from the
// old chatbot-service FastAPI app — see src/lib/chatbot/*). There is no
// external chatbot service anymore: this route replaces the proxy that used
// to forward to CHATBOT_FAQ_URL.
export const runtime = 'nodejs'
// Free-tier Gemini answers were measured taking up to ~150s on the Python
// side; give this route the same ceiling rather than the platform default.
export const maxDuration = 180

// Built once and reused across requests within a warm process — loading the
// embedding model (BGE-M3, ~1.1GB) costs real time, so this must not happen
// per-request.
let retrieverPromise: Promise<Retriever> | null = null
function getRetriever(): Promise<Retriever> {
  if (!retrieverPromise) retrieverPromise = Promise.resolve(new Retriever())
  return retrieverPromise
}

function logRetrieval(
  question: string,
  standalone: string,
  queryUsed: string,
  chunks: RetrievalChunk[],
) {
  if (process.env.CHATBOT_LOG_CHUNKS === '0') return
  console.log('\n' + '='.repeat(96))
  console.log(`HỎI: ${question}`)
  // Chỉ in khi khác câu gốc, để log của một lượt hỏi độc lập không dài thêm ba
  // dòng nói rằng không có gì xảy ra. Câu viết lại in trước câu dịch vì đó là
  // thứ tự chúng chạy — bản dịch là dịch của câu viết lại, không phải câu gốc.
  if (standalone !== question) console.log(`     viết lại: ${standalone}`)
  if (queryUsed && queryUsed !== standalone) console.log(`     tìm bằng: ${queryUsed}`)
  if (chunks.length === 0) {
    console.log('     (không đoạn nào vượt ngưỡng điểm)')
    console.log('='.repeat(96))
    return
  }
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i]
    const dense = c.dense_score ?? c.score
    const lexical = c.lexical_score ?? 0
    console.log(
      `${i + 1}  score=${c.score.toFixed(4)} dense=${dense.toFixed(4)} lex=${lexical.toFixed(4)}  ${c.collection}  ${c.chunk_id}`,
    )
    console.log(`    ${c.url}`)
  }
  console.log('='.repeat(96))
}

export async function POST(req: NextRequest) {
  let message: unknown
  let session_id: unknown
  try {
    ;({ message, session_id } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }
  if (typeof session_id !== 'string' || !session_id.trim()) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }
  const question = message.trim().slice(0, MAX_QUESTION_CHARS)

  // Đọc trước truy hồi, không phải sau như trước đây: preprocessQuery() cần
  // hội thoại để giải đại từ, và nó phải chạy xong TRƯỚC khi retriever nhìn
  // thấy câu hỏi — cả bước khôi phục dấu lẫn bước dịch vi->en đều làm việc trên
  // kết quả của nó. Cái giá của việc chuyển lên đây là một lượt đọc Mongo trên
  // nhánh không truy hồi được đoạn nào, tức là một findOne cho một phiên vốn đã
  // nằm sẵn trong bộ nhớ của cùng một connection pool.
  const { history, model: pinnedModel } = MOCK
    ? { history: [], model: null }
    : await getHistoryAndModel(session_id)

  // Một lượt LLM làm cả ba việc tiền xử lý: khôi phục dấu, viết lại thành câu
  // độc lập theo hội thoại, và dịch sang tiếng Anh. `null` nghĩa là lượt gọi
  // không dùng được (hết hạn mức, quá hạn, JSON vỡ, hoặc chế độ mock) — khi đó
  // retriever tự dựng biến thể bằng chuỗi model cục bộ Viterbi + Marian, tức là
  // đúng hành vi trước khi có bước này. Không có nhánh nào ở đây phải xử lý
  // riêng cho trường hợp đó.
  const pre = await preprocessQuery(question, history)
  const standalone = pre?.vi ?? question

  let chunks: RetrievalChunk[]
  try {
    const retriever = await getRetriever()
    // pre.en có sẵn rồi thì đừng bắt Marian dịch lại — queryFor() chạy nguyên
    // chuỗi cục bộ, tốn thêm một lượt suy luận ONNX cho kết quả sẽ bị bỏ đi.
    const queryUsed = pre ? pre.en : await retriever.queryFor(standalone)
    chunks = await retriever.search(standalone, { pre: pre ?? undefined })
    logRetrieval(question, standalone, queryUsed, chunks)
  } catch (err) {
    // Most commonly: the vector index hasn't been built yet (no
    // data/faiss_index_js/store.json — see `npm run build-index`). Treated
    // the same as "found nothing" rather than a hard 500 so the widget stays
    // usable while the index/data pipeline catches up; the real cause is
    // still visible server-side.
    console.error('    !! retrieval unavailable:', err)
    retrieverPromise = null
    chunks = []
  }

  const sources = chunks.map((c, i) => ({
    n: i + 1,
    title: c.title ?? null,
    url: c.url,
    score: Math.round(c.score * 10000) / 10000,
    collection: c.collection ?? null,
  }))

  if (chunks.length === 0) {
    // Not saved to history — same reasoning as the old Python service: a
    // reply with no retrieved knowledge carries nothing for a later question
    // to refer back to, so it isn't worth spending one of the history slots.
    return NextResponse.json({
      reply:
        'Tôi không tìm thấy thông tin nào liên quan đến câu hỏi này trong dữ liệu của BKFintech.',
      sources,
    })
  }

  // Câu đã được viết lại thành độc lập thì lượt sinh câu trả lời không cần
  // history nữa — đó chính là ý nghĩa của "độc lập", và mọi thứ cần thiết đã
  // được nhấc vào trong câu hỏi rồi. Bỏ history đi ở đây trả lại phần token mà
  // bước tiền xử lý vừa tiêu, và bỏ luôn cơ hội model bám vào một chủ đề cũ.
  //
  // Điều kiện là `!==` chứ không phải "pre khác null": khi model chép lại
  // nguyên văn (quy tắc 2a/2b/2c của prompt) hoặc khi call hỏng và standalone
  // rơi về câu gốc, hai trường hợp đó không phân biệt được từ đây và cũng không
  // cần phân biệt — cả hai đều có nghĩa là chưa có gì được nhấc vào câu hỏi,
  // nên history vẫn là thứ duy nhất giữ ngữ cảnh. Sai về phía giữ history chỉ
  // tốn token; sai về phía bỏ nó thì mất hẳn khả năng trả lời.
  //
  // Một chỗ không chính xác đã biết: câu gõ KHÔNG dấu mà vốn đã độc lập cũng
  // làm `!==` đúng, chỉ vì dấu được thêm vào. Nó bỏ history ở một lượt lẽ ra
  // không cần bỏ — nhưng câu đó tự đủ nghĩa nên hậu quả chỉ là tiết kiệm thêm
  // token, không phải mất ngữ cảnh.
  const askHistory = standalone !== question ? [] : history

  // Held in an object rather than a bare `let` so the assignment inside the
  // callback and the read after the loop are plainly the same slot.
  const used: { model: string | null } = { model: null }
  const onModel = (model: string) => {
    used.model = model
    // Fire-and-forget: this runs at the first token, with the rest of the
    // answer still streaming out of the model. Awaiting a Mongo write here
    // would stall the answer behind it, and a write that fails is worth a log
    // line — the next question just picks a model again — but never worth
    // killing a reply that is already on its way.
    if (!MOCK && model !== pinnedModel) {
      setSessionModel(session_id as string, model).catch((err) =>
        console.error('    !! không ghi được model của phiên:', err),
      )
    }
  }

  const started = Date.now()
  const parts: string[] = []
  try {
    for await (const text of answerStream(standalone, chunks, askHistory, {
      pinnedModel,
      onModel,
    })) {
      parts.push(text)
    }
  } catch (err) {
    const elapsed = ((Date.now() - started) / 1000).toFixed(1)
    console.error(`    !! lỗi sau ${elapsed}s:`, err)
    return NextResponse.json({ error: friendlyError(err), sources }, { status: 502 })
  }

  const reply = parts.join('')
  if (!MOCK) {
    await appendMessage(session_id, 'user', question)
    await appendMessage(session_id, 'assistant', reply)
  }

  // A refusal states that the passages did not answer the question, so the
  // passages are not sources for it. Returning them anyway would let the UI
  // put "Nguồn tham khảo" under "tôi chưa được cập nhật thông tin" — citing
  // pages for a claim they do not support, which is worse than citing nothing.
  // Dropped here rather than in the widget so every client behaves the same
  // and the refusal strings stay in one place.
  // `model` is which model in the pool actually produced this answer, and it is
  // the first thing worth knowing when someone reports an odd reply — the pool
  // falls back silently by design, so nothing else in the response says whether
  // the answer came from the usual model or the third choice. Added as an extra
  // field rather than replacing anything: the widget reads `reply`/`sources` off
  // the parsed body and ignores what it does not know, so this is invisible to
  // every existing client. Null in mock mode, where no model was called.
  return NextResponse.json({
    reply,
    sources: isRefusal(reply) ? [] : sources,
    model: used.model,
  })
}
