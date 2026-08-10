/**
 * Bộ câu hỏi cho scripts/qa-test.ts.
 *
 * Tách khỏi script chạy vì hai suite phục vụ hai mục đích khác nhau và không
 * thay thế cho nhau: `core` là bộ hồi quy — cùng 15 câu đó đã đo trước và sau
 * đợt port cho khớp llm.py, nên đổi câu trong đó là mất đường cơ sở để so.
 * `bkfintech` là bộ phủ nội dung, toàn bộ câu hỏi đều nằm trong phạm vi trang
 * BKFintech.
 *
 * `expect` được đặt sau khi tra corpus (data/faiss_index_js/store.json), không
 * phải đoán: câu gắn `not_updated` là câu đã kiểm tra chắc chắn corpus KHÔNG
 * chứa dữ liệu (học phí, lịch khai giảng — 0 chunk khớp), nên model trả lời
 * được mới là lỗi.
 */

export type Expect = "answer" | "not_updated" | "no_answer" | "nothing_found";

export interface Case {
  id: number;
  q: string;
  group: string;
  expect: Expect;
  note: string;
}

/** Bộ hồi quy: có dữ liệu / thiếu chi tiết / ngoài phạm vi / mơ hồ. */
export const CORE: Case[] = [
  { id: 1, q: "Viện trưởng của BK Fintech là ai?", group: "A. Có dữ liệu", expect: "answer", note: "about/board-of-deans" },
  { id: 2, q: "BK Fintech có những khóa học ngắn hạn nào?", group: "A. Có dữ liệu", expect: "answer", note: "home + course" },
  { id: 3, q: "V-Chain là gì?", group: "A. Có dữ liệu", expect: "answer", note: "solutions/V-Chain" },
  { id: 4, q: "eDiploma giải quyết vấn đề gì?", group: "A. Có dữ liệu", expect: "answer", note: "solutions/eDiploma" },
  { id: 5, q: "Viện có những phòng lab nghiên cứu nào?", group: "A. Có dữ liệu", expect: "answer", note: "lab + alias 'viện'" },
  { id: 6, q: "Tầm nhìn của viện là gì?", group: "A. Có dữ liệu", expect: "answer", note: "about/vision" },
  { id: 7, q: "Hội thảo ECOTECH 2026 có chủ đề gì?", group: "A. Có dữ liệu", expect: "answer", note: "news/ecotech" },
  { id: 8, q: "Khóa Business Intelligence kéo dài bao nhiêu giờ?", group: "A. Có dữ liệu", expect: "answer", note: "Duration: 30 hours" },
  { id: 9, q: "What certificates do learners receive after completing a course?", group: "A. Có dữ liệu", expect: "answer", note: "tiếng Anh — kiểm tra trả lời đúng ngôn ngữ" },
  { id: 10, q: "Chương trình trải nghiệm ngành IT cho học sinh THPT có mục tiêu gì?", group: "A. Có dữ liệu", expect: "answer", note: "courses/level-up-it-vie" },
  { id: 11, q: "Học phí khóa Business Intelligence là bao nhiêu tiền?", group: "B. Thiếu chi tiết", expect: "not_updated", note: "corpus không có giá" },
  { id: 12, q: "Viện Công nghệ và Kinh tế số được thành lập vào năm nào?", group: "B. Thiếu chi tiết", expect: "not_updated", note: "corpus không có năm thành lập" },
  { id: 13, q: "Giá vàng SJC hôm nay bao nhiêu một lượng?", group: "C. Ngoài phạm vi", expect: "nothing_found", note: "không liên quan BKFintech" },
  { id: 14, q: "Hướng dẫn tôi cách nấu phở bò ngon", group: "C. Ngoài phạm vi", expect: "nothing_found", note: "không liên quan BKFintech" },
  { id: 15, q: "cho tôi hỏi cái này với", group: "D. Mơ hồ", expect: "no_answer", note: "không rõ nội dung hỏi" },
];

/** Bộ phủ nội dung: 15 câu đều về BKFintech, trải khắp các collection của
 * corpus (people, solutions, lab, course, news, event, report, academic). */
export const BKFINTECH: Case[] = [
  // Con người & tổ chức
  { id: 1, q: "Phó Viện trưởng của BK Fintech gồm những ai?", group: "A. Con người", expect: "answer", note: "board-of-deans: Xuan Hoa, Do Ba Lam" },
  { id: 2, q: "Chủ tịch Hội đồng cố vấn của Viện là ai?", group: "A. Con người", expect: "answer", note: "advisory-board: Prof. David Tran" },

  // Sản phẩm / giải pháp
  { id: 3, q: "BKSign là giải pháp gì?", group: "B. Giải pháp", expect: "answer", note: "solutions/BKSign" },
  { id: 4, q: "BKOffice dùng để làm gì?", group: "B. Giải pháp", expect: "answer", note: "solutions/BKOffice" },

  // Nghiên cứu
  { id: 5, q: "Phòng lab Smart Finance and Digital Banking nghiên cứu về lĩnh vực gì?", group: "C. Nghiên cứu", expect: "answer", note: "r&d-labs/sfdb" },
  { id: 6, q: "Dự án Cyber Clinic kéo dài trong bao lâu?", group: "C. Nghiên cứu", expect: "answer", note: "15 months, 4/2026–3/2027" },
  { id: 7, q: "Điều kiện để học viên tham gia dự án Cyber Clinic là gì?", group: "C. Nghiên cứu", expect: "answer", note: "cyber-clinic?user=student" },

  // Đào tạo
  { id: 8, q: "Khóa học Fintech kéo dài bao nhiêu giờ?", group: "D. Đào tạo", expect: "answer", note: "76 study + 8 workshop hours" },
  { id: 9, q: "Cơ sở vật chất phục vụ học tập của Viện như thế nào?", group: "D. Đào tạo", expect: "answer", note: "academic/facility" },

  // Sự kiện
  { id: 10, q: "BK Fintech Hackday đã tổ chức đến mùa thứ mấy?", group: "E. Sự kiện", expect: "answer", note: "Season 12 xong, 13 sắp tới" },
  { id: 11, q: "Tổng giải thưởng của HACK CX IN BANKING TOGETHER 2026 là bao nhiêu?", group: "E. Sự kiện", expect: "answer", note: "VND 150.000.000 — chỉ 1 chunk chứa" },

  // Ấn phẩm & liên hệ
  { id: 12, q: "Vietnam Digital Economy Review là ấn phẩm gì?", group: "F. Ấn phẩm", expect: "answer", note: "report, 12 chunk" },
  { id: 13, q: "Email và địa chỉ liên hệ của BK Fintech là gì?", group: "F. Ấn phẩm", expect: "answer", note: "fintech@hust.edu.vn, P.609 Thư viện Tạ Quang Bửu" },

  // Đúng đối tượng nhưng corpus thiếu chi tiết → phải từ chối
  { id: 14, q: "Học phí khóa học Fintech là bao nhiêu?", group: "G. Thiếu chi tiết", expect: "not_updated", note: "0 chunk có giá khóa học" },
  { id: 15, q: "Khóa Business Intelligence khai giảng vào ngày nào?", group: "G. Thiếu chi tiết", expect: "not_updated", note: "0 chunk khớp 'khai giảng'/'start date'" },
];

export const SUITES: Record<string, Case[]> = { core: CORE, bkfintech: BKFINTECH };
