/**
 * 15 kịch bản hội thoại mà lượt cuối KHÔNG tự đứng được — phải nhớ lượt trước
 * mới trả lời đúng.
 *
 * Tách khỏi script chạy vì cùng lý do qa-cases.ts tách khỏi qa-test.ts: đây là
 * đường cơ sở để so trước/sau mỗi lần đụng vào tầng ngữ cảnh, nên đổi câu trong
 * đây là mất đường cơ sở.
 *
 * `expect` đặt theo dữ kiện đã xác minh trực tiếp trên corpus này trong lúc
 * dựng bộ test (tên trong /about/board-of-deans, thời lượng khóa BI, thời hạn
 * Cyber Clinic). Chỗ nào chưa chắc corpus có thì để `expect` rỗng và chỉ đòi
 * "không được từ chối" — thà kiểm ít mà đúng còn hơn dựng kỳ vọng sai rồi đi
 * sửa code cho khớp một sự thật không tồn tại.
 */

export type Kind =
  | 'reference' // lượt cuối chứa tham chiếu tường minh (nó / đó / thứ N)
  | 'topic' // phụ thuộc ngữ cảnh nhưng KHÔNG có tham chiếu tường minh
  | 'control' // đối chứng: lượt cuối độc lập, history không được phép làm hỏng
  | 'orphan' // tham chiếu mà không có lượt trước → phải từ chối

export interface HistoryCase {
  id: number
  /** Các lượt hỏi trước, chạy tuần tự để dựng history thật. */
  setup: string[]
  /** Câu hỏi được chấm. */
  q: string
  kind: Kind
  /** Chuỗi bắt buộc phải xuất hiện trong câu trả lời (không phân biệt hoa
   * thường). Rỗng = chỉ cần không phải câu từ chối. */
  expect: string[]
  /** true = câu trả lời BẮT BUỘC là một trong hai câu từ chối cố định. */
  mustRefuse?: boolean
  note: string
}

const LEADERS = 'viện phó'

export const HISTORY_CASES: HistoryCase[] = [
  // --- Tham chiếu thứ tự: lớp mà nối chuỗi câu hỏi trước không thể giải ---
  {
    id: 1,
    setup: [LEADERS],
    q: 'cho tôi thông tin người thứ 2.',
    kind: 'reference',
    expect: ['Đỗ Bá Lâm'],
    note: 'ca gốc người dùng báo hỏng',
  },
  {
    id: 2,
    setup: [LEADERS],
    q: 'còn người đầu tiên thì sao?',
    kind: 'reference',
    expect: ['Xuân Hoa'],
    note: 'tham chiếu "đầu tiên"',
  },
  {
    id: 3,
    setup: ['Ban lãnh đạo BK Fintech gồm những ai?'],
    q: 'người thứ nhất giữ chức vụ gì?',
    kind: 'reference',
    expect: [],
    note: 'thứ tự trên danh sách dài hơn',
  },
  {
    id: 4,
    setup: [LEADERS],
    q: 'họ làm việc ở đâu?',
    kind: 'reference',
    expect: [],
    note: 'đại từ số nhiều — dense 0.7588, sát ngưỡng yếu',
  },
  // --- Đại từ trỏ vào chủ đề của lượt trước ---
  {
    id: 5,
    setup: ['V-Chain là gì?'],
    q: 'nó giải quyết vấn đề gì?',
    kind: 'reference',
    expect: [],
    note: '"nó" → V-Chain',
  },
  {
    id: 6,
    setup: ['Khóa Business Intelligence kéo dài bao nhiêu giờ?'],
    q: 'nó dạy những nội dung gì?',
    kind: 'reference',
    expect: [],
    note: '"nó" → khóa BI',
  },
  {
    id: 7,
    setup: ['Dự án Cyber Clinic kéo dài trong bao lâu?'],
    q: 'nó bắt đầu từ khi nào?',
    kind: 'reference',
    expect: [],
    note: '"nó" → Cyber Clinic',
  },
  {
    id: 8,
    setup: ['eDiploma giải quyết vấn đề gì?'],
    q: 'cái đó dành cho ai?',
    kind: 'reference',
    expect: [],
    note: '"cái đó" → eDiploma',
  },
  {
    id: 9,
    setup: ['Viện có những phòng lab nghiên cứu nào?'],
    q: 'phòng lab thứ hai nghiên cứu gì?',
    kind: 'reference',
    expect: [],
    note: 'thứ tự trên danh sách lab',
  },
  // --- Chuỗi ba lượt: rủi ro đã biết từ đầu, giờ đo được ---
  {
    id: 10,
    setup: [LEADERS, 'người thứ 2 là ai?'],
    q: 'chức vụ của ông ấy là gì?',
    kind: 'reference',
    expect: [],
    note: 'ba lượt liên tiếp cùng phụ thuộc nhau',
  },
  // --- Tiếng Anh ---
  {
    id: 11,
    setup: ['Who are the vice deans of BK Fintech?'],
    q: 'tell me about the second one',
    kind: 'reference',
    expect: ['Lam'],
    note: 'tham chiếu thứ tự bằng tiếng Anh',
  },
  // --- Phụ thuộc ngữ cảnh nhưng KHÔNG có tham chiếu tường minh ---
  // Cổng chặn chặt cố tình bỏ sót lớp này. Đưa vào để biết cái giá của lựa
  // chọn đó, không phải để coi là lỗi.
  {
    id: 12,
    setup: ['Tầm nhìn của viện là gì?'],
    q: 'còn sứ mệnh?',
    kind: 'topic',
    expect: [],
    note: 'không có từ chỉ xuất — nhánh dùng lại chunk KHÔNG kích hoạt',
  },
  {
    id: 13,
    setup: ['BK Fintech có những khóa học ngắn hạn nào?'],
    q: 'học phí bao nhiêu?',
    kind: 'topic',
    expect: [],
    note: 'ca kinh điển, cũng không có tham chiếu tường minh',
  },
  // --- Đối chứng: history không được làm hỏng câu hỏi độc lập ---
  {
    id: 14,
    setup: [LEADERS],
    q: 'BK Fintech có những khóa học ngắn hạn nào?',
    kind: 'control',
    expect: [],
    note: 'chủ đề mới hoàn toàn sau một lượt về nhân sự',
  },
  // --- Tham chiếu mồ côi: phải từ chối, không được đoán ---
  {
    id: 15,
    setup: [],
    q: 'cho tôi thông tin người thứ 2.',
    kind: 'orphan',
    expect: [],
    mustRefuse: true,
    note: 'không có lượt trước — đo được là model sẽ đoán sai nếu không chặn',
  },
]
