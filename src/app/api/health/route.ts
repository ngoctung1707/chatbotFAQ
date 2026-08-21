import { NextResponse } from 'next/server'
import { poolStatus } from '@/lib/chatbot/rateLimiter'
import { CHAT_MODEL, MOCK } from '@/lib/chatbot/config'
import { readMaintenance } from '@/lib/chatbot/maintenance'
import { embedderStatus, isEmbedderLoaded } from '@/lib/chatbot/embedding'
import { storeInfo } from '@/lib/chatbot/vectorStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const maintenance = readMaintenance()
  const store = storeInfo()

  return NextResponse.json({
    ok: true,
    maintenance,
    // Giữ nguyên tên trường cũ để không phá thứ đang đọc nó. Ý nghĩa đã đổi kể
    // từ khi model vào worker thread — xem chú thích ở isEmbedderLoaded().
    model_loaded: isEmbedderLoaded(),
    embedder: embedderStatus(),
    // mtimeMs của store.json ứng với bản ĐANG PHỤC VỤ, không phải bản trên đĩa.
    // Đây là thứ cho phép job hàng tuần kiểm chứng "store mới đã vào phục vụ"
    // thay vì restart app rồi cho là xong. null = chưa ai chạm tới store.
    store_version: store?.version ?? null,
    store_chunks: store?.chunks ?? null,
    rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    mock: MOCK,
    models: poolStatus(),
    preferred: CHAT_MODEL,
  })
}
