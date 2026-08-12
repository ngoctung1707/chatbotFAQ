/**
 * Chạy 15 kịch bản trong history-cases.ts qua đúng pipeline production.
 *
 * Vì sao cần script riêng, khi đã có qa-test.ts và test-chat-history.ts:
 * qa-test truyền history rỗng cho mọi câu nên với nó ngữ cảnh không tồn tại;
 * test-chat-history kiểm cơ chế lưu trữ (append/trim/thứ tự) chứ không chấm
 * NỘI DUNG câu trả lời của một lượt phụ thuộc ngữ cảnh. Đây là bài duy nhất
 * hỏi: "bot có thực sự trả lời đúng câu hỏi cần nhớ lượt trước không".
 *
 * Lặp lại đúng trình tự route.ts, kể cả thứ tự: đọc history TRƯỚC → chặn tham
 * chiếu mồ côi → truy hồi → nếu yếu thì dùng lại chunk lượt trước → sinh câu
 * trả lời → ghi history + ghi chunk của lượt.
 *
 * Quyết định "có dùng lại chunk không" gọi thẳng shouldReusePreviousChunks()
 * của production chứ không chép lại điều kiện — một bài test tự chấm theo luật
 * riêng thì đang đo một sản phẩm khác với sản phẩm người dùng chạy.
 *
 * Dùng Mongo thật (session id có tiền tố "test-followup-", dọn sạch ở cuối) để
 * đường ghi/đọc last_chunks cũng nằm trong phạm vi kiểm tra.
 *
 * Chạy: pnpm test:followup
 *       CHATBOT_CONTEXT_FALLBACK=0 pnpm test:followup   (đo đường cơ sở trước
 *                                                        khi có tính năng này)
 */
import { randomUUID } from 'crypto'
import {
  appendMessage,
  deleteSession,
  getHistoryAndModel,
  setLastChunks,
} from '../src/lib/chatbot/chatHistory'
import {
  isOrphanReference,
  shouldReusePreviousChunks,
  topDenseScore,
} from '../src/lib/chatbot/contextQuery'
import { answerStream, isRefusal, NO_ANSWER } from '../src/lib/chatbot/llm'
import { Retriever, type RetrievalChunk } from '../src/lib/chatbot/retriever'
import {
  CONTEXT_FALLBACK_ENABLED,
  CONTEXT_WEAK_DENSE,
  MOCK,
} from '../src/lib/chatbot/config'
import { HISTORY_CASES, type HistoryCase } from './history-cases'

if (MOCK) {
  console.error(
    'CHATBOT_MOCK đang bật — mock trả câu cố định và answerStream bỏ qua history,\n' +
      'nên bài này không đo được gì. Tắt CHATBOT_MOCK rồi chạy lại.',
  )
  process.exit(1)
}

const retriever = new Retriever()

interface TurnResult {
  reply: string
  chunks: RetrievalChunk[]
  topDense: number
  reused: boolean
  blocked: boolean
}

/** Một lượt, giống hệt route.ts. */
async function runTurn(sessionId: string, question: string): Promise<TurnResult> {
  const { history, lastChunks } = await getHistoryAndModel(sessionId)

  if (isOrphanReference(question, history.length)) {
    return { reply: NO_ANSWER, chunks: [], topDense: 0, reused: false, blocked: true }
  }

  let chunks = await retriever.search(question, { history })
  const topDense = topDenseScore(chunks)
  let reused = false
  if (shouldReusePreviousChunks(question, lastChunks.length > 0, topDense)) {
    const previous = await retriever.chunksByIds(lastChunks)
    if (previous.length > 0) {
      chunks = previous
      reused = true
    }
  }

  let reply = ''
  if (chunks.length > 0) {
    const parts: string[] = []
    for await (const t of answerStream(question, chunks, history)) parts.push(t)
    reply = parts.join('')
    await appendMessage(sessionId, 'user', question)
    await appendMessage(sessionId, 'assistant', reply)
    await setLastChunks(
      sessionId,
      chunks.map((c) => ({ id: c.chunk_id, score: c.score })),
    )
  }
  // Free tier 15 RPM.
  await new Promise((r) => setTimeout(r, 4500))
  return { reply, chunks, topDense, reused, blocked: false }
}

function grade(c: HistoryCase, r: TurnResult): { pass: boolean; why: string } {
  const refused = isRefusal(r.reply)
  if (c.mustRefuse) {
    return refused
      ? { pass: true, why: 'từ chối đúng như yêu cầu' }
      : { pass: false, why: 'PHẢI từ chối nhưng đã trả lời (đoán mò)' }
  }
  if (refused) return { pass: false, why: 'bị từ chối' }
  const missing = c.expect.filter(
    (e) => !r.reply.toLowerCase().includes(e.toLowerCase()),
  )
  if (missing.length) return { pass: false, why: `thiếu: ${missing.join(', ')}` }
  return { pass: true, why: '' }
}

async function main() {
  console.log(
    `fallback=${CONTEXT_FALLBACK_ENABLED} ngưỡng yếu=${CONTEXT_WEAK_DENSE} ` +
      `· ${HISTORY_CASES.length} kịch bản\n`,
  )

  const failures: string[] = []
  const byKind = new Map<string, { pass: number; total: number }>()

  for (const c of HISTORY_CASES) {
    const sid = `test-followup-${c.id}-${randomUUID()}`
    for (const s of c.setup) await runTurn(sid, s)

    const r = await runTurn(sid, c.q)
    const { pass, why } = grade(c, r)

    const k = byKind.get(c.kind) ?? { pass: 0, total: 0 }
    k.total++
    if (pass) k.pass++
    byKind.set(c.kind, k)

    const flag = r.blocked ? 'CHẶN ' : r.reused ? 'DÙNGLẠI' : '       '
    console.log(
      `[${String(c.id).padStart(2)}] ${pass ? 'OK' : 'XX'} ${c.kind.padEnd(9)} ` +
        `${flag} dense=${r.topDense.toFixed(3)}  ${c.q.slice(0, 40)}`,
    )
    console.log(`      ${r.reply.replace(/\s+/g, ' ').slice(0, 116)}`)
    if (!pass) {
      failures.push(`[${c.id}] ${c.q} — ${why}`)
      console.log(`      ^^ ${why} (${c.note})`)
    }

    await deleteSession(sid)
  }

  console.log('\n--- theo loại ---')
  for (const [kind, v] of byKind) console.log(`  ${kind.padEnd(10)} ${v.pass}/${v.total}`)

  const total = HISTORY_CASES.length
  console.log(`\nTổng: ${total - failures.length}/${total}`)
  for (const f of failures) console.log(`  XX ${f}`)
  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
