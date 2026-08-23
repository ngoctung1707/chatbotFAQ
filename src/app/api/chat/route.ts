import { NextRequest, NextResponse } from 'next/server'
import {
  appendMessage,
  getHistoryAndModel,
  setLastChunks,
  setSessionModel,
  type ChatMessage,
  type StoredChunkRef,
} from '@/lib/chatbot/chatHistory'
import { answerStream, friendlyError, isRefusal, NO_ANSWER } from '@/lib/chatbot/llm'
import {
  isOrphanReference,
  shouldReusePreviousChunks,
  topDenseScore,
} from '@/lib/chatbot/contextQuery'
import { Retriever, type RetrievalChunk } from '@/lib/chatbot/retriever'
import { CONTEXT_WEAK_DENSE, MOCK } from '@/lib/chatbot/config'
import { MAX_QUESTION_CHARS } from '@/lib/chatbot/limits'
import { readMaintenance } from '@/lib/chatbot/maintenance'

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
  queryUsed: string,
  chunks: RetrievalChunk[],
  sessionId: string,
  history: ChatMessage[],
  followUp: { topDense: number; reusedPrevious: boolean },
) {
  if (process.env.CHATBOT_LOG_CHUNKS === '0') return
  console.log('\n' + '='.repeat(96))
  console.log(`HỎI: ${question}`)
  // Session + history size first, because three different failures all look
  // identical from the answer alone: the session never carried history (a new
  // session id every turn — the widget mints one per mount, so a remount or a
  // dev hot-reload silently starts over), the gate declined to merge, or the
  // merge happened and did not help. Without this line the first case is
  // invisible, and it is the one that is not a retrieval bug at all.
  console.log(
    `     phiên ${sessionId.slice(0, 8)}… — history ${history.length} message` +
      (history.length === 0 ? ' (lượt đầu HOẶC session mới)' : ''),
  )
  // Bằng nhau nghĩa là bước rewrite đã bị bỏ qua hoặc thất bại và truy hồi
  // chạy bằng chính câu người dùng gõ — đúng thứ cần biết đầu tiên khi một câu
  // hỏi truy hồi ra kết quả lạ.
  if (queryUsed && queryUsed !== question) console.log(`     tìm bằng: ${queryUsed}`)
  else console.log('     tìm bằng: (câu gốc — rewrite bị bỏ qua hoặc thất bại)')
  // topDense là thước đo "truy hồi có neo được vào đâu không" — in kèm ngưỡng
  // để đọc log biết ngay vì sao nhánh dùng lại chunk có/không kích hoạt, thay
  // vì phải chạy lại mới biết.
  console.log(
    `     dense đỉnh=${followUp.topDense.toFixed(4)} (ngưỡng yếu ${CONTEXT_WEAK_DENSE})` +
      (followUp.reusedPrevious ? ' → DÙNG LẠI chunk lượt trước' : ''),
  )
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
  // Cửa sổ bảo trì hàng tuần.
  //
  // LÝ DO ĐÃ ĐỔI kể từ khi model vào worker thread. Trước đây phải chặn ở đây
  // để câu hỏi đầu tiên không lazy-load một bản BGE-M3 THỨ HAI vào tiến trình
  // web trong lúc job đang giữ bản của nó. Bây giờ chỉ còn đúng một bản model
  // trong cả hệ thống, nên nguy cơ đó không còn.
  //
  // Vẫn giữ, vì lý do thứ hai: trong cửa sổ bảo trì, worker đang chạy hết công
  // suất cho pha B. Một câu hỏi lọt vào sẽ xếp hàng sau cả lô embed và có thể
  // chờ rất lâu. Trả ngay một câu thông báo rõ ràng thì thành thật hơn là để
  // người dùng nhìn ô chat quay vòng.
  //
  // Và nó phải nằm TRƯỚC mọi thứ chạm tới truy hồi — đó là thứ giữ cho website
  // vẫn phục vụ bình thường suốt lúc cập nhật dữ liệu.
  const maintenance = readMaintenance()
  if (maintenance.active) {
    return NextResponse.json({ reply: maintenance.message, sources: [], maintenance: true })
  }

  const question = message.trim().slice(0, MAX_QUESTION_CHARS)

  // History is read BEFORE retrieval, not alongside it, because search() needs
  // it twice over: the LLM rewrite step resolves pronouns against it (see
  // queryRewriter.ts) and the context-merged query variant is built from the
  // last user turn (see contextQuery.ts). Do not "optimise" this into a
  // Promise.all with the retrieval below — `history` would be undefined at the
  // call, search() would run perfectly happily without either, and both
  // features would be silently off with no error anywhere to trace. The cost is
  // one findOne by _id on chat_sessions, a few ms against retrieval's seconds.
  // Mongo chết thì chatbot MẤT TRÍ NHỚ, không chết theo.
  //
  // Truy hồi và sinh câu trả lời không cần Mongo một chút nào — nó chỉ phục vụ
  // hội thoại nhiều lượt. Nên khi nó hỏng, hành vi đúng là trả lời từng câu
  // độc lập chứ không phải ném 500 với body rỗng và để widget vỡ.
  //
  // Trước khi có nhánh này, một lỗi Mongo ở đây bay thẳng ra khỏi route: người
  // dùng không nhận được câu thông báo nào, và log phía họ chỉ có mã 500.
  const { history, model: pinnedModel, lastChunks } = MOCK
    ? { history: [] as ChatMessage[], model: null, lastChunks: [] as StoredChunkRef[] }
    : await getHistoryAndModel(session_id).catch((err) => {
        console.error('    !! không đọc được lịch sử, trả lời không ngữ cảnh:', err)
        return {
          history: [] as ChatMessage[],
          model: null,
          lastChunks: [] as StoredChunkRef[],
        }
      })

  // Refers to something ("người thứ 2", "cái đó") with no earlier turn to
  // resolve it against. Answered here rather than sent to the model, because
  // measurement showed the model does not refuse in this situation — it picks
  // whoever happens to be listed second in <data> and states it confidently.
  // A wrong answer with no signal is worse than a refusal, and this also skips
  // a retrieval plus a model call that could only produce one.
  if (isOrphanReference(question, history.length)) {
    console.log(`\nHỎI: ${question}\n     tham chiếu nhưng history rỗng → NO_ANSWER`)
    return NextResponse.json({ reply: NO_ANSWER, sources: [] })
  }

  let chunks: RetrievalChunk[]
  let reusedPrevious = false
  try {
    const retriever = await getRetriever()
    // Một lời gọi duy nhất, và search() trả luôn query nó đã dùng. Trước đây
    // đây là hai lời gọi (queryFor + search) cùng dựng query một cách độc lập,
    // và đó chính là nguyên nhân gốc của bug gọi bước dịch hai lần: hai chuỗi
    // hơi khác nhau nên miss cache cả hai lần, ~20s cho mỗi câu hỏi.
    const result = await retriever.search(question, { history })
    chunks = result.chunks

    // Reuse the previous turn's passages instead of these — but only when both
    // conditions hold, and they are deliberately independent:
    //
    //   1. the question carries an explicit reference (not merely "is short" —
    //      that test is what pulled off-topic chunks into "các khoá học"), and
    //   2. this turn's own retrieval found nothing anchored.
    //
    // Condition 2 is the vetting: a follow-up whose retrieval already works is
    // left completely alone. Measured on this corpus, in-scope questions score
    // 0.7502+ dense while referring questions sit at 0.6781–0.7588 — see
    // CONTEXT_WEAK_DENSE.
    //
    // Replace, never blend: mixing the two sets was tried and turned a correct
    // answer into a refusal, because candidates/rescale/maxPerUrl all key off
    // this one list and a half-merged list satisfies none of them.
    const topDense = topDenseScore(chunks)
    if (shouldReusePreviousChunks(question, lastChunks.length > 0, topDense)) {
      const previous = await retriever.chunksByIds(lastChunks)
      if (previous.length > 0) {
        chunks = previous
        reusedPrevious = true
      }
    }

    logRetrieval(question, result.searchQuery, chunks, session_id, history, {
      topDense,
      reusedPrevious,
    })
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
    for await (const text of answerStream(question, chunks, history, {
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
    // Ghi hỏng thì lượt SAU mất ngữ cảnh, không phải lượt NÀY mất câu trả lời.
    //
    // Câu trả lời tới đây đã sinh xong và đã tốn một lượt gọi LLM. Để một lệnh
    // ghi lịch sử thất bại vứt nó đi là trả tiền cho một thứ rồi ném vào sọt.
    // Cùng cách xử lý với setLastChunks ngay bên dưới — trước đây hai dòng này
    // là ngoại lệ duy nhất trong khối, và không có lý do gì để chúng khác.
    // Tuần tự chứ KHÔNG Promise.all: hai lệnh cùng $push vào một document, và
    // thứ tự mang nghĩa — lượt hỏi phải nằm trước lượt trả lời. Chạy song song
    // thì chúng có thể vào ngược, và lượt sau đọc ra một hội thoại lộn xộn.
    try {
      await appendMessage(session_id, 'user', question)
      await appendMessage(session_id, 'assistant', reply)
    } catch (err) {
      console.error('    !! không ghi được lịch sử lượt này:', err)
    }
    // Whatever actually grounded this answer becomes the context a follow-up
    // may fall back to — including when this turn itself reused the previous
    // set. That is what lets a three-turn chain work: the passages stay put
    // until a turn retrieves something anchored of its own and replaces them.
    //
    // Not awaited for the same reason setSessionModel is not: the answer is
    // already complete, and a failed write costs the next turn its fallback,
    // never this turn its reply.
    setLastChunks(
      session_id,
      chunks.map((c) => ({ id: c.chunk_id, score: c.score })),
    ).catch((err) => console.error('    !! không ghi được chunk của lượt:', err))
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
