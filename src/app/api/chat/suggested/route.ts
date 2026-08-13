import { NextRequest, NextResponse } from 'next/server'
import { appendMessage } from '@/lib/chatbot/chatHistory'
import { findSuggestedQA } from '@/lib/chatbot/suggestedQuestions'
import { MOCK } from '@/lib/chatbot/config'

/**
 * Ghi một câu hỏi gợi ý (đã bấm) vào history của phiên.
 *
 * Tách khỏi /api/chat vì lượt này không có gì để truy hồi và không gọi model —
 * câu trả lời đã nằm sẵn trong suggestedQuestions.ts và widget hiện nó ngay,
 * trước cả khi request này đi. Đẩy nó qua /api/chat sẽ bắt người dùng chờ toàn
 * bộ pipeline chỉ để nhận lại đúng câu chữ mà họ đã đọc xong.
 *
 * Vẫn phải ghi history vì phiên chat là bộ nhớ của lượt sau: nếu lượt bấm không
 * được ghi, người dùng bấm "BK Fintech là đơn vị nào?" rồi hỏi tiếp "Viện đó ở
 * đâu?" sẽ gặp một history rỗng — queryRewriter không có gì để phân giải "Viện
 * đó", và câu hỏi đi vào truy hồi trong tình trạng không còn chủ ngữ.
 *
 * Body chỉ nhận `id`, không nhận nội dung: xem ghi chú trong
 * suggestedQuestions.ts — client chỉ được nói ĐÃ BẤM CÁI NÀO, nội dung do server
 * tự tra. Nếu không, đây là một route cho phép ghi chữ tuỳ ý vào transcript của
 * bất kỳ session_id nào đoán được.
 */
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let session_id: unknown
  let id: unknown
  try {
    ;({ session_id, id } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof session_id !== 'string' || !session_id.trim()) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }
  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const qa = findSuggestedQA(id.trim())
  if (!qa) {
    // Tab mở từ trước lúc deploy vẫn giữ danh sách cũ. Người dùng đã thấy câu
    // trả lời rồi và không có gì để sửa được ở phía họ, nên đây là 404 lặng lẽ
    // chứ không phải lỗi hiển thị lên màn hình.
    return NextResponse.json({ error: 'Câu hỏi gợi ý không tồn tại.' }, { status: 404 })
  }

  // MOCK bỏ qua ghi DB, khớp với /api/chat — ở chế độ đó không có Mongo để ghi.
  if (MOCK) return NextResponse.json({ ok: true })

  try {
    await appendMessage(session_id.trim(), 'user', qa.question)
    await appendMessage(session_id.trim(), 'assistant', qa.answer)
  } catch (err) {
    // Không trả lỗi ra widget: câu trả lời đã hiện trên màn hình, hỏng ở đây chỉ
    // làm lượt SAU mất ngữ cảnh chứ không làm lượt này sai. Nhưng phải thấy được
    // ở server, vì triệu chứng bên ngoài (câu hỏi tiếp theo bỗng "quên" mất
    // context) không chỉ về đây chút nào.
    console.error('    !! không ghi được câu hỏi gợi ý vào history:', err)
    return NextResponse.json({ error: 'Không ghi được vào lịch sử phiên.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
