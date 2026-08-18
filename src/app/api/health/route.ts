import { NextResponse } from 'next/server'
import { poolStatus } from '@/lib/chatbot/rateLimiter'
import { CHAT_MODEL, MOCK } from '@/lib/chatbot/config'
import { readMaintenance } from '@/lib/chatbot/maintenance'
import { isEmbedderLoaded } from '@/lib/chatbot/embedding'

// What to look at first when someone reports that the chatbot "answered
// strangely": the pool falls back silently, so this is the only view of which
// models still have budget and which are sitting in a cooldown after a 429.
// Read together with the `model` field /api/chat returns, it says both which
// model produced a given answer and why that one was picked.
export const runtime = 'nodejs'
// Counters live in this process's memory and change on every question, so a
// cached response would report the state at build time — i.e. all zeroes,
// forever.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Trạng thái bảo trì phải phân biệt được với "đã sập" — không có nó thì sáng
  // chủ nhật nhìn vào chatbot chết, không ai biết là bình thường hay tai nạn.
  // Cron kiểm tra sức khoẻ ở mục 5.5 cũng đọc đúng trường này để quyết định có
  // phải bật lại app hay không.
  const maintenance = readMaintenance()
  return NextResponse.json({
    ok: true,
    maintenance,
    // Job hang tuan cho tin hieu nay truoc khi bat dau pha B: no phai chac RAM
    // da duoc nha, chu khong phai chi chac lenh restart da tra ve.
    model_loaded: isEmbedderLoaded(),
    mock: MOCK,
    // Numbers are per warm instance, not per deployment — see the README's note
    // on the multi-instance limitation before reading them as the whole truth.
    models: poolStatus(),
    preferred: CHAT_MODEL,
  })
}
