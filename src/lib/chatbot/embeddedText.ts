/**
 * Chuỗi thực sự được đưa vào model — tách ra khỏi build-index.ts để pha B và
 * pha C của job hàng tuần dùng chung ĐÚNG một định nghĩa.
 *
 * Đây không phải chia file cho gọn. Nếu job embed dựng chuỗi khác một ký tự so
 * với lúc dựng chỉ mục, vector sinh ra sẽ nằm lệch khỏi không gian của những
 * vector còn lại, và hậu quả duy nhất nhìn thấy được là chất lượng trả lời tệ
 * dần — không lỗi, không cảnh báo. Một định nghĩa, hai nơi import.
 *
 * Toàn bộ phần chú thích dưới đây giữ nguyên lý do từ build-index.ts, vì đó
 * mới là thứ giải thích tại sao chuỗi lại có hình dạng này.
 */

/**
 * Loại trang mà chunk đến từ đó, viết bằng cả hai thứ tiếng, ghép trước phần
 * text được embed.
 *
 * Breadcrumb của crawler gọi tên ITEM nhưng không bao giờ gọi tên DANH MỤC: các
 * trang khoá học embed thành "[Fintech]", "[Business Intelligence]" — không cái
 * nào trong 15 trang chứa chữ "khóa học" hay "course". Nên "khoá học ở
 * bkfintech" không có gì để khớp và truy hồi trả về trang chủ, ban cố vấn, danh
 * sách nhân sự; khối <data> tới model không nhắc tới một khoá học nào và nó từ
 * chối trả lời. Một chunk không thể được tìm thấy bằng danh mục mà chính text
 * của nó không bao giờ gọi tên.
 *
 * Cả hai thứ tiếng vì kho trộn lẫn — 11 trong 15 trang khoá học viết tiếng Anh
 * trong khi câu hỏi tới bằng tiếng Việt — và nhãn phải khớp với thứ tiếng mà
 * câu hỏi dùng.
 */
export const COLLECTION_LABEL: Record<string, string> = {
  academic: "Đào tạo · Academic programme",
  application: "Ứng dụng · Application",
  course: "Khóa học · Course · Chương trình đào tạo",
  ecotech: "Hội thảo ECOTECH · ECOTECH conference",
  event: "Sự kiện · Event",
  hackathon: "Cuộc thi Hackathon · Hackathon",
  home: "Trang chủ · Home",
  lab: "Phòng thí nghiệm · Research lab",
  news: "Tin tức · News",
  people: "Nhân sự · People · Ban lãnh đạo",
  publication: "Công bố khoa học · Publication",
  report: "Báo cáo · Report",
  research: "Nghiên cứu · Research",
  researchers: "Nhà nghiên cứu · Researcher · Giảng viên · Tiến sĩ",
  solutions: "Giải pháp · Solution",
  static: "Giới thiệu · About",
  workshop: "Workshop · Chuỗi hội thảo",
};

/** Chỉ cần đúng những trường mà chuỗi embed phụ thuộc vào. */
export interface EmbeddableChunk {
  collection?: string | null;
  content?: string | null;
  raw: string;
}

/**
 * Text được embed: dạng có context header khi crawler dựng được một cái, dạng
 * text trần khi không, cả hai đều mang tiền tố là danh mục và tên viện.
 *
 * Tên viện gắn vào MỌI chunk là cố ý, nghe như sẽ làm từ đó vô dụng — và đó
 * chính là mục đích. Nó vốn đã có trong phần lớn chunk, chỉ là không đều: dày
 * đặc ở trang chủ, trang nhân sự, danh sách ứng dụng, và vắng hẳn ở trang khoá
 * học. Chính sự lệch đó khiến việc thêm "bkfintech" vào câu hỏi lại phản tác
 * dụng, kéo chunk khoá học đúng nhất từ hạng 11 xuống hạng 39 và văng khỏi tập
 * ứng viên. Rải đều thì từ đó ngừng phân biệt giữa các chunk, và phần còn lại
 * của câu hỏi — phần mang ý định thật của người dùng — quyết định thứ hạng.
 */
export function embeddedText(record: EmbeddableChunk): string {
  const label = COLLECTION_LABEL[record.collection ?? ""] ?? record.collection;
  const header = label
    ? `[${label} — BK Fintech, Viện Công nghệ và Kinh tế số]`
    : "[BK Fintech, Viện Công nghệ và Kinh tế số]";
  return `${header}\n${record.content || record.raw}`;
}
