/**
 * Câu hỏi gợi ý hiện ngay khi mở popup chat, kèm sẵn câu trả lời.
 *
 * Người dùng bấm là thấy trả lời tức thì — KHÔNG đi qua pipeline truy hồi +
 * gọi model của /api/chat. Đó là toàn bộ lý do các câu trả lời nằm cứng ở đây
 * chứ không phải là "câu hỏi mẫu" điền vào ô nhập: mấy câu này ai cũng hỏi, câu
 * trả lời không đổi, và bắt người mới mở popup chờ vài giây cho một câu trả lời
 * đã biết trước là lãng phí cả thời gian của họ lẫn quota model.
 *
 * File này CỐ Ý không phụ thuộc gì vào Node — cùng lý do với limits.ts: widget
 * (client component) import để render nút và hiện câu trả lời, route handler
 * import để tra lại nội dung khi ghi vào history. Một nguồn sự thật duy nhất,
 * nên không có cách nào câu hiện trên màn hình lệch với câu ghi xuống DB.
 *
 * `id` mới là thứ đi qua mạng khi ghi history, không phải nội dung: client chỉ
 * nói "người dùng bấm câu này", server tự tra ra cặp Q&A. Nếu gửi thẳng
 * question/answer thì /api/chat/suggested trở thành một cái cửa cho phép ghi
 * nội dung tuỳ ý vào transcript của một phiên bất kỳ.
 *
 * Sửa nội dung = sửa file này rồi deploy lại. Giữ 2-3 câu: danh sách dài hơn thì
 * người dùng đọc thay vì hỏi, mà mục đích của nó chỉ là mồi cho câu đầu tiên.
 * Đường dẫn trong ngoặc () có thể là đường dẫn nội bộ dạng "/about/..." —
 * widget tự phân biệt link nội bộ với link ngoài.
 */

export interface SuggestedQA {
  /** Định danh bền, đi qua mạng thay cho nội dung. Đổi id = mất liên kết với
   * các phiên đang mở, nên chỉ đổi khi thực sự thay câu hỏi. */
  id: string
  question: string
  answer: string
}

export const SUGGESTED_QUESTIONS: readonly SuggestedQA[] = [
  {
    id: 'gioi-thieu',
    question: 'BK Fintech là đơn vị nào?',
    answer:
      'BK Fintech là Viện Công nghệ số và Kinh tế số (Institute for Digital Technology and Economy) thuộc Đại học Bách khoa Hà Nội. Viện nghiên cứu và phát triển các giải pháp công nghệ tài chính, mô hình kinh tế số và các sáng kiến về xã hội số.\n\nXem thêm tại [trang giới thiệu](/about/welcome-message).',
  },
  {
    id: 'giai-phap',
    question: 'Viện có những giải pháp nào?',
    answer:
      'Một số giải pháp do Viện phát triển: B4E, BAgri, BKOffice, BKSign, BSign, eDiploma và VChain.\n\nChi tiết từng giải pháp có ở [danh mục giải pháp](/#solutions).',
  },
  {
    id: 'lien-he',
    question: 'Làm sao để liên hệ với Viện?',
    answer:
      'Bạn có thể gửi email tới fintech@hust.edu.vn, hoặc tới trực tiếp phòng 609, Thư viện Tạ Quang Bửu, Đại học Bách khoa Hà Nội.\n\nCác chương trình hợp tác, câu lạc bộ và sự kiện được cập nhật ở [trang Get Involved](/get-involved).',
  },
]

/** Tra cặp Q&A theo id, `undefined` nếu id không còn tồn tại — trường hợp thật
 * chứ không phải phòng xa: một tab mở từ trước lúc deploy vẫn giữ danh sách cũ
 * trong bộ nhớ và có thể gửi lên id vừa bị xoá. */
export function findSuggestedQA(id: string): SuggestedQA | undefined {
  return SUGGESTED_QUESTIONS.find((qa) => qa.id === id)
}
