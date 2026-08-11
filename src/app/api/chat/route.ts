import { NextRequest, NextResponse } from 'next/server'
import {
  appendMessage,
  getHistoryAndModel,
  setSessionModel,
} from '@/lib/chatbot/chatHistory'
import { answerStream, friendlyError, isRefusal } from '@/lib/chatbot/llm'
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

function logRetrieval(question: string, queryUsed: string, chunks: RetrievalChunk[]) {
  if (process.env.CHATBOT_LOG_CHUNKS === '0') return
  console.log('\n' + '='.repeat(96))
  console.log(`HỎI: ${question}`)
  if (queryUsed && queryUsed !== question) console.log(`     tìm bằng: ${queryUsed}`)
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

  let chunks: RetrievalChunk[]
  try {
    const retriever = await getRetriever()
    const queryUsed = await retriever.queryFor(question)
    chunks = await retriever.search(question)
    logRetrieval(question, queryUsed, chunks)
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

  const { history, model: pinnedModel } = MOCK
    ? { history: [], model: null }
    : await getHistoryAndModel(session_id)

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
