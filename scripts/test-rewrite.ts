/**
 * In ra truy vấn mà queryRewriter.ts dựng cho một câu hỏi, tách rời khỏi truy
 * hồi. Đây là bài kiểm tra phải ĐỌC BẰNG MẮT: không có nhãn vàng cho "truy vấn
 * đúng", nên thứ script này làm là bày kết quả ra đủ nhanh để soi được cả bộ.
 *
 * Ba thứ cần soi, đều là kiểu hỏng mà một truy vấn nhìn thoáng qua vẫn "trông
 * hợp lý":
 *   1. tên riêng, acronym, mã học phần bị dịch hoặc biến dạng — chunk khớp
 *      bằng chính những token đó, dịch chúng đi là tự cắt tín hiệu mạnh nhất;
 *   2. câu hỏi mở chủ đề MỚI sau một history dài bị dính ngữ cảnh cũ (prompt
 *      có rule chống, nhưng rule trong prompt không phải là bảo đảm);
 *   3. câu hỏi vốn đã là tiếng Anh bị viết lại thành thứ tệ hơn bản gốc.
 *
 * Chạy cả bộ mặc định:
 *   pnpm test:rewrite
 * Một câu bất kỳ, kèm history tuỳ chọn (xen kẽ user/assistant, cũ nhất trước):
 *   pnpm test:rewrite "học phí thế nào?" "Viện có chương trình nào?" "Có 3 CT…"
 *
 * Cần CHATBOT_MOCK tắt và có GOOGLE_GENERATIVE_AI_API_KEY — rewrite là một call
 * thật, và MOCK cố ý bỏ qua nó (xem rewriteQuery).
 */
import type { ChatMessage } from "../src/lib/chatbot/chatHistory";
import { MOCK, REWRITE_ENABLED, REWRITE_MODEL } from "../src/lib/chatbot/config";
import { looksVietnamese, rewriteQuery } from "../src/lib/chatbot/queryRewriter";

/** History dựng từ argv: câu đầu là câu hỏi hiện tại, phần còn lại là các lượt
 * cũ theo thứ tự cũ->mới, xen kẽ bắt đầu bằng user. */
function historyFromArgs(rest: string[]): ChatMessage[] {
  return rest.map((content, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content,
  })) as ChatMessage[];
}

const H = (...turns: string[]): ChatMessage[] => historyFromArgs(turns);

/** Bộ mặc định. Mỗi ca nhắm đúng một thứ có thể hỏng, và ghi rõ thứ đó ra để
 * người đọc log biết mình đang phải soi cái gì thay vì đọc lướt. */
const CASES: { q: string; history: ChatMessage[]; watch: string }[] = [
  // --- Alias của viện: thứ INSTITUTE_ALIASES từng làm bằng cách nối chuỗi ---
  { q: "Viện trưởng là ai?", history: [], watch: "'viện trưởng' phải ra institute director, KHÔNG phải hospital/chief" },
  { q: "giới thiệu về viện", history: [], watch: "'viện' phải neo vào BKFintech" },
  { q: "Trường có những phòng lab nào?", history: [], watch: "'trường' cũng là BKFintech, không phải university chung chung" },

  // --- Không dấu: ca mà kiến trúc cũ (Marian) bỏ trắng hoàn toàn ---
  { q: "vien co nhung san pham nao", history: [], watch: "không dấu -> product, không được dịch bừa" },
  { q: "hoc phi nganh fintech bao nhieu", history: [], watch: "không dấu + thuật ngữ ngành" },
  { q: "ai la giang vien nganh khoa hoc du lieu", history: [], watch: "không dấu, danh từ chỉ người" },

  // --- Tên riêng / acronym / số: phải giữ NGUYÊN VĂN ---
  { q: "Chương trình Fintech Foundation khai giảng khi nào?", history: [], watch: "'Fintech Foundation' phải còn nguyên" },
  { q: "Hoạt động của BKFintech năm 2026 gồm những gì?", history: [], watch: "'BKFintech' và '2026' phải còn nguyên" },
  { q: "Viện có hợp tác với ĐHBK Hà Nội thế nào?", history: [], watch: "acronym ĐHBK không được nuốt mất" },

  // --- Follow-up: việc mà bản dịch máy không bao giờ làm được ---
  {
    q: "học phí thế nào?",
    history: H("Viện có những chương trình đào tạo nào?", "Viện có ba chương trình: Fintech Foundation, Data Science cho tài chính, và Blockchain ứng dụng."),
    watch: "phải mang được TÊN CHƯƠNG TRÌNH sang, không chỉ mỗi 'tuition fee'",
  },
  {
    q: "còn thời lượng thì sao?",
    history: H("Khóa Fintech Foundation học phí bao nhiêu?", "Học phí khóa Fintech Foundation là 12 triệu đồng."),
    watch: "ellipsis 'còn … thì sao' phải giải ra được khóa học đang nói tới",
  },
  {
    q: "cho tôi thông tin người thứ 2",
    history: H("Ban lãnh đạo viện gồm những ai?", "Ban lãnh đạo gồm PGS. Nguyễn Văn A (viện trưởng) và TS. Trần Thị B (phó viện trưởng)."),
    watch: "tham chiếu thứ tự phải giải ra ĐÚNG TÊN, không để nguyên 'the second person'",
  },

  // --- Chủ đề mới sau history dài: rule "ignore the history entirely" ---
  {
    q: "Viện có tuyển thực tập sinh không?",
    history: H("Khóa Fintech Foundation học phí bao nhiêu?", "Học phí là 12 triệu đồng cho 3 tháng.", "Có học bổng không?", "Có, viện cấp học bổng 30% cho học viên xuất sắc."),
    watch: "KHÔNG được dính học phí/học bổng của lượt trước",
  },
  {
    q: "địa chỉ viện ở đâu?",
    history: H("Các đề tài nghiên cứu khoa học của viện?", "Viện đang triển khai các đề tài về blockchain, AI trong tài chính và dữ liệu lớn."),
    watch: "chủ đề mới hoàn toàn, phải bỏ ngữ cảnh nghiên cứu",
  },

  // --- Tiếng Anh: có history thì vẫn gọi, và không được làm tệ đi ---
  { q: "What research labs does the institute run?", history: [], watch: "lượt đầu + tiếng Anh -> BỎ QUA, phải trả về y nguyên" },
  {
    q: "how much does it cost?",
    history: H("Tell me about the Fintech Foundation course.", "It is a 3-month applied fintech course covering payments, lending and data."),
    watch: "'it' phải được giải ra tên khóa học",
  },
];

async function run(q: string, history: ChatMessage[], watch?: string) {
  const t0 = Date.now();
  const out = await rewriteQuery(q, history);
  const ms = Date.now() - t0;
  const skipped = out === q;
  console.log(`\n  hỏi   : ${q}`);
  if (history.length) {
    console.log(`  history: ${history.length} message (lượt cuối: ${history[history.length - 1].content.slice(0, 60)}…)`);
  }
  console.log(`  vi?   : ${looksVietnamese(q) ? "có" : "không"}`);
  console.log(`  ra    : ${out}${skipped ? "   ← KHÔNG đổi (bỏ qua hoặc thất bại)" : ""}`);
  console.log(`  ${ms}ms`);
  if (watch) console.log(`  soi   : ${watch}`);
}

async function main() {
  console.log(
    `rewrite=${REWRITE_ENABLED} mock=${MOCK} model=${REWRITE_MODEL || "(đầu bảng rankModels)"}`
  );
  if (MOCK) {
    console.log(
      "\n!! CHATBOT_MOCK đang bật — rewriteQuery() sẽ trả về câu gốc cho MỌI ca.\n" +
        "   Chạy lại với CHATBOT_MOCK=0 thì script này mới có ý nghĩa."
    );
  }

  const args = process.argv.slice(2);
  if (args.length > 0) {
    await run(args[0], historyFromArgs(args.slice(1)));
    return;
  }

  for (const c of CASES) await run(c.q, c.history, c.watch);
  console.log(
    `\n${CASES.length} ca. Không có PASS/FAIL tự động ở đây — đọc cột "ra" ` +
      `cạnh cột "soi".`
  );
}

main();
