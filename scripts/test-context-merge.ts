/**
 * Kiểm tra cổng chặn (gate) và việc ghép chuỗi của contextQuery.ts.
 *
 * Cùng khuôn với scripts/test-alias-expansion.ts: chạy độc lập, in kết quả ra
 * console, không cần test runner, không cần Mongo hay dev server.
 *
 * Vì sao script này tồn tại: câu hỏi phụ thuộc ngữ cảnh ("Học phí bao nhiêu?"
 * ngay sau "Khóa Fintech Foundation dạy gì?") sau khi embedding không còn từ
 * nào chỉ ra chủ đề, nên retrieval trượt và model buộc phải trả NOT_UPDATED cho
 * thông tin vốn CÓ trong corpus. mergeWithHistory() ghép câu hỏi trước vào làm
 * query thứ tư. Phần dễ sai nhất không phải việc ghép mà là *khi nào* ghép: ghép
 * nhầm vào một câu hỏi độc lập sẽ kéo chunk lạc đề vào tập ứng viên và có thể
 * đẩy chunk đúng ra khỏi top-K. Script này canh đúng chỗ đó.
 *
 * Import thẳng từ src/lib/chatbot/ chứ không chép lại logic — mục đích là kiểm
 * tra đúng code đang chạy production.
 *
 * Chạy: pnpm test:context
 *   --retrieval   đối chiếu top-K của một follow-up thật, có/không history
 *   --regression  chạy bộ CORE của qa-cases và bắt buộc top-K không đổi
 * Hai chế độ sau cần index đã build và sẽ tải BGE-M3 (chậm, vài chục giây trở
 * lên); phần kiểm tra cổng chặn ở trên chạy tức thì và không cần gì cả.
 */
// Đánh dấu file là module. Sau khi chuyển sang dynamic import thì không còn
// import tĩnh nào, mà top-level await chỉ hợp lệ trong module (TS1375).
export {};

// Tự bật cờ TRƯỚC khi import config, vì mặc định production giờ là TẮT (xem
// lý do trong config.ts). Cổng chặn chính là thứ script này kiểm tra, mà cờ tắt
// thì mergeWithHistory() trả null cho mọi thứ và bài test sẽ "xanh" mà không
// kiểm được gì — kiểu hỏng tệ nhất một bài test có thể mắc. Đặt qua env chứ
// không sửa hằng số để vẫn đi đúng đường mà production đi.
// Vẫn tôn trọng giá trị người chạy truyền vào, để còn kiểm được cả nhánh tắt.
process.env.CHATBOT_CONTEXT_MERGE = process.env.CHATBOT_CONTEXT_MERGE || "1";

// Dynamic import: static import bị hoisted lên TRƯỚC dòng gán env ở trên, nên
// config sẽ đọc phải giá trị cũ.
const { isContextDependent, mergeWithHistory } = await import(
  "../src/lib/chatbot/contextQuery"
);
const { CONTEXT_MERGE_ENABLED, CONTEXT_SHORT_QUESTION_WORDS, DEFAULT_TOP_K } =
  await import("../src/lib/chatbot/config");

// `import type` — bị TS xóa lúc compile nên script này không kéo driver mongodb
// vào, y như lý do retriever.ts import kiểu này.
type Msg = import("../src/lib/chatbot/chatHistory").ChatMessage;

const COURSE_Q = "Khóa Fintech Foundation dạy gì?";
const userTurn = (content: string): Msg[] => [{ role: "user", content }];

interface Case {
  name: string;
  history: Msg[];
  question: string;
  /** true = phải ghép, false = phải trả null. */
  merge: boolean;
}

// Đúng bộ ca tối thiểu trong spec. Hai ca cuối canh hai lối vào khác nhau của
// cổng chặn: một câu dài nhưng có anaphora, và một câu tiếng Anh chỉ qua được
// nhờ ngưỡng độ dài (danh sách anaphora cố ý không chứa từ tiếng Anh nào).
const CASES: Case[] = [
  {
    name: "follow-up ngắn, mất chủ đề",
    history: userTurn(COURSE_Q),
    question: "Học phí bao nhiêu?",
    merge: true,
  },
  {
    name: "follow-up có anaphora",
    history: userTurn(COURSE_Q),
    question: "Nó kéo dài bao lâu?",
    merge: true,
  },
  {
    name: "câu hỏi độc lập, tự nêu chủ đề",
    history: userTurn(COURSE_Q),
    question: "Viện có những phòng lab nghiên cứu nào?",
    merge: false,
  },
  {
    name: "chưa có lượt nào",
    history: [],
    question: "Học phí bao nhiêu?",
    merge: false,
  },
  {
    name: "history chỉ có assistant",
    history: [{ role: "assistant", content: "Khóa học kéo dài 8 tuần." }],
    question: "Học phí bao nhiêu?",
    merge: false,
  },
  {
    name: "follow-up tiếng Anh (qua ngưỡng độ dài)",
    history: userTurn("What courses do you offer?"),
    question: "How much?",
    merge: true,
  },
  // Không nằm trong bảng của spec nhưng cùng loại rủi ro với ca "phòng lab":
  // câu dài, tự nêu chủ đề, chỉ khác là bằng tiếng Anh — nơi danh sách anaphora
  // không dấu ("day") dễ bắt nhầm nhất.
  {
    name: "câu hỏi độc lập tiếng Anh, dài",
    history: userTurn(COURSE_Q),
    question: "Which research laboratories does the institute currently operate on campus?",
    merge: false,
  },
];

function runGateCases(): number {
  let failed = 0;
  for (const c of CASES) {
    // Cờ tắt thì kỳ vọng đúng là null cho MỌI ca — đó chính là hợp đồng của
    // nhánh tắt, không phải một ca hỏng.
    const wantMerge = CONTEXT_MERGE_ENABLED && c.merge;
    const merged = mergeWithHistory(c.question, c.history);
    const ok = wantMerge ? merged !== null : merged === null;
    if (!ok) failed++;

    console.log(`${ok ? "OK" : "XX"}  ${c.name}`);
    console.log(`    lượt trước: ${c.history.at(-1)?.content ?? "(rỗng)"}`);
    console.log(`    câu hỏi:    ${c.question}`);
    console.log(`    kỳ vọng:    ${wantMerge ? "ghép" : "null"}`);
    console.log(`    kết quả:    ${merged ?? "null"}`);
    // In riêng cổng chặn: khi một ca hỏng, đây là thứ nói ngay hỏng ở gate hay
    // ở bước lấy message user cuối cùng.
    console.log(`    gate:       isContextDependent=${isContextDependent(c.question)}`);
    console.log();
  }
  return failed;
}

/**
 * Đối chiếu truy hồi thật, có/không có history — thay cho cách kiểm chứng
 * end-to-end bằng CHATBOT_MOCK=1 trong spec.
 *
 * Lý do phải làm ở đây: route /api/chat KHÔNG đọc history khi MOCK bật (và
 * cũng không ghi history trong mock), nên hỏi hai lượt qua widget ở chế độ mock
 * thì lượt thứ hai vẫn thấy history rỗng — không quan sát được tính năng này.
 * Gọi thẳng Retriever với history dựng sẵn cho đúng thứ cần xem: top-K đổi ra
 * sao khi query ghép được thêm vào.
 *
 * Import động để phần gate ở trên chạy được mà không phải tải BGE-M3.
 */
async function runRetrievalCheck(): Promise<void> {
  const { Retriever } = await import("../src/lib/chatbot/retriever");
  const retriever = new Retriever();
  const question = "Học phí bao nhiêu?";
  const history = userTurn(COURSE_Q);

  const show = async (label: string, h: Msg[]) => {
    const t0 = Date.now();
    const chunks = await retriever.search(question, { history: h });
    console.log(`\n--- ${label} (${Date.now() - t0}ms, ${chunks.length} đoạn) ---`);
    chunks.forEach((c, i) =>
      console.log(`${i + 1}  ${c.score.toFixed(4)}  ${c.collection}  ${c.url}`)
    );
  };

  console.log(`\nĐối chiếu truy hồi — topK=${DEFAULT_TOP_K}`);
  console.log(`lượt 1: ${COURSE_Q}`);
  console.log(`lượt 2: ${question}`);
  await show("không history (như trước thay đổi này)", []);
  await show("có history", history);
  console.log(
    "\nHai danh sách phải KHÁC nhau: bản có history cần kéo được trang khóa học lên."
  );
}

/**
 * Hồi quy: câu hỏi độc lập phải truy hồi y hệt như trước khi có tính năng này.
 *
 * So sánh bằng cách chạy cùng một câu hai lần, một lần history rỗng và một lần
 * có lượt trước — chứ không phải bật/tắt CHATBOT_CONTEXT_MERGE. Hai cách này
 * tương đương về mặt quan sát (không có history thì mergeWithHistory() luôn trả
 * null, đúng như khi tắt cờ) nhưng cách này chạy được trong MỘT process:
 * CONTEXT_MERGE_ENABLED đọc env lúc import module, đổi process.env giữa chừng
 * không có tác dụng, nên bật/tắt cờ sẽ phải tải BGE-M3 hai lần.
 *
 * Dùng lại bộ CORE của qa-cases để bài hồi quy này bám cùng tập câu với bộ QA,
 * thay vì trôi thành một tập riêng.
 *
 * Danh sách top-K phải GIỐNG HỆT cho mọi câu độc lập. Khác một dòng nghĩa là
 * cổng chặn D2 đang bắt nhầm và phải siết lại trước khi merge.
 */
async function runRegression(): Promise<number> {
  const { Retriever } = await import("../src/lib/chatbot/retriever");
  const { CORE } = await import("./qa-cases");
  const retriever = new Retriever();

  // Lượt trước dựng sẵn, cố tình chọn câu lạc chủ đề nhất so với bộ CORE: nếu
  // cổng chặn hở, đây là thứ sẽ kéo chunk khóa học vào câu hỏi về lab/nhân sự.
  const prior = userTurn(COURSE_Q);
  const ids = (chunks: { chunk_id: string }[]) =>
    chunks.map((c) => c.chunk_id).join(" | ");

  let differed = 0;
  for (const c of CORE) {
    const before = ids(await retriever.search(c.q, { history: [] }));
    const after = ids(await retriever.search(c.q, { history: prior }));
    const merged = mergeWithHistory(c.q, prior);
    const same = before === after;
    if (!same) differed++;

    console.log(
      `${same ? "==" : "!!"} [${c.id}] ${merged ? "ghép " : "     "} ${c.q.slice(0, 56)}`
    );
    if (!same) {
      console.log(`     trước: ${before}`);
      console.log(`     sau:   ${after}`);
    }
  }

  console.log(
    differed === 0
      ? "\nMọi câu giữ nguyên top-K — cổng chặn không bắt nhầm câu độc lập."
      : `\n${differed} câu đổi top-K. Xem lại: câu nào có "ghép" mà không phải follow-up thật thì cổng chặn đang hở.`
  );
  return differed;
}

async function main() {
  console.log(
    `CONTEXT_MERGE_ENABLED=${CONTEXT_MERGE_ENABLED} ` +
      `CONTEXT_SHORT_QUESTION_WORDS=${CONTEXT_SHORT_QUESTION_WORDS}\n`
  );
  if (!CONTEXT_MERGE_ENABLED) {
    console.log(
      "Cờ đang tắt — mọi ca sẽ trả null. Bỏ CHATBOT_CONTEXT_MERGE=0 để test gate.\n"
    );
  }

  const failed = runGateCases();
  console.log(failed === 0 ? "Tất cả ca gate đều đúng." : `${failed} ca gate SAI.`);

  if (process.argv.includes("--retrieval")) await runRetrievalCheck();

  let differed = 0;
  if (process.argv.includes("--regression")) {
    console.log("\n=== Hồi quy: câu hỏi độc lập ===");
    differed = await runRegression();
  }

  // Exit code khác 0 để còn dùng được trong pipeline nếu sau này cần.
  if (failed > 0 || differed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
