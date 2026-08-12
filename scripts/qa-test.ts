/**
 * Chạy một bộ câu hỏi qua đúng pipeline production (Retriever + answerStream),
 * gọi thẳng vào src/lib/chatbot/* nên không cần dev server hay Mongo. Mỗi câu
 * là một lượt độc lập (history rỗng), giống lượt đầu của một session mới.
 *
 * Đo ba thứ trong CÙNG một lượt chạy, và đó là chủ ý: độ chính xác, thời gian
 * và RAM đánh đổi lẫn nhau, nên đo rời từng cái ở ba lượt khác nhau thì không
 * kết luận được gì về cái giá của một thay đổi.
 *
 * Import thẳng code đang chạy production thay vì chép lại, để bài test không
 * trôi khỏi bản gốc.
 *
 * Chạy: pnpm tsx --expose-gc --env-file-if-exists=.env scripts/qa-test.ts [suite] > out.json
 * suite: "core" (mặc định, bộ hồi quy) hoặc "bkfintech" — xem qa-cases.ts.
 * (stderr in tiến độ + bảng tổng kết, stdout in JSON để bước thống kê đọc lại)
 *
 * --expose-gc không bắt buộc nhưng nên có: thiếu nó thì cột RAM "lắng" lẫn cả
 * rác chưa thu, và phần "nền tăng" — con số duy nhất cho biết tiến trình có bò
 * lên theo từng câu hay không — sẽ nhiễu.
 */
import { Worker } from "worker_threads";
import { Retriever, type RetrievalChunk } from "../src/lib/chatbot/retriever";
import {
  answerStream,
  friendlyError,
  isRefusal,
  NO_ANSWER,
  NOT_UPDATED,
} from "../src/lib/chatbot/llm";
import {
  CHAT_MODEL,
  DEFAULT_TOP_K,
  MOCK,
  REWRITE_ENABLED,
  TIMEOUT_MS,
} from "../src/lib/chatbot/config";
import { SUITES, type Expect } from "./qa-cases";

const SUITE = process.argv[2] || "core";
const CASES = SUITES[SUITE];
if (!CASES) {
  console.error(`Suite không tồn tại: ${SUITE}. Chọn: ${Object.keys(SUITES).join(", ")}`);
  process.exit(1);
}

// Chuỗi route.ts trả về khi retrieval không giữ lại đoạn nào.
const NO_HIT_REPLY =
  "Tôi không tìm thấy thông tin nào liên quan đến câu hỏi này trong dữ liệu của BKFintech.";

// Same shape as llm.ts's CITATION_MARKER_RE, separator and all. A simpler
// `\[\d+\]` pass is not good enough and this script proved it: the model
// answers "…thông tin chi tiết [1], [2]." and stripping the brackets alone
// leaves "…chi tiết,." — which contains neither refusal string, so a correct
// refusal gets scored as a real answer.
const ONE_MARKER = String.raw`\[\s*\d+(?:\s*,\s*\d+)*\s*\](?!\()`;
const MARKERS = new RegExp(
  String.raw`\s*${ONE_MARKER}(?:\s*[,;]?\s*${ONE_MARKER})*`,
  "g"
);

// --- Đo RAM ---------------------------------------------------------------

const MB = 1024 * 1024;
declare const global: typeof globalThis & { gc?: () => void };

// Lấy mẫu RSS từ một worker thread chứ không phải setInterval trong luồng
// chính, và đây là điểm bắt buộc chứ không phải cầu kỳ: suy luận ONNX của
// BGE-M3 chặn event loop, nên đúng lúc RAM lên đỉnh thì một timer ở luồng
// chính không bao giờ được chạy. Worker chia sẻ cùng tiến trình nên
// process.memoryUsage.rss() ở đó đọc ra đúng con số của cả tiến trình.
const SAMPLER_SRC = `
  const { workerData } = require("worker_threads");
  const peakView = new Float64Array(workerData.sab);
  setInterval(() => {
    const rss = process.memoryUsage.rss();
    if (rss > peakView[0]) peakView[0] = rss;
  }, 10);
`;

const mb = (b: number) => (b / MB).toFixed(0);
const mb1 = (b: number) => (b / MB).toFixed(1);

/** RSS ở trạng thái đã lắng: ép thu rác rồi chờ, để con số đọc ra là mức nền
 * thật chứ không phải rác chưa dọn của câu vừa chạy. */
async function settle(): Promise<number> {
  if (typeof global.gc === "function") {
    global.gc();
    global.gc();
  }
  await new Promise((r) => setTimeout(r, 500));
  return process.memoryUsage().rss;
}

function pct(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

/** Which of the two refusals it is, once isRefusal() has said it is one.
 *
 * The "is it a refusal at all" question is delegated to production isRefusal()
 * rather than re-decided here — this script scored a refusal as a real answer
 * once already by reimplementing that test slightly differently, and a harness
 * that grades the product by its own private rules reports on something the
 * users never see. Only the which-one split is local, and it matches on the
 * same rephrase-tolerant cores isRefusal() uses. */
function classify(reply: string, nChunks: number): Expect {
  if (nChunks === 0) return "nothing_found";
  if (!isRefusal(reply)) return "answer";
  const lowered = reply.replace(MARKERS, "").trim().toLowerCase();
  if (
    lowered.includes(NO_ANSWER.toLowerCase()) ||
    lowered.includes("đặt ra câu hỏi chi tiết hơn")
  ) {
    return "no_answer";
  }
  return "not_updated";
}

async function main() {
  console.error(
    `model=${CHAT_MODEL} mock=${MOCK} timeout=${TIMEOUT_MS}ms topK=${DEFAULT_TOP_K} ` +
      `rewrite=${REWRITE_ENABLED} gc=${typeof global.gc === "function" ? "có" : "KHÔNG"}`
  );

  const sab = new SharedArrayBuffer(8);
  const peakView = new Float64Array(sab);
  new Worker(SAMPLER_SRC, { eval: true, workerData: { sab } }).unref();
  await new Promise((r) => setTimeout(r, 200));

  const rssCold = await settle();
  console.error(`RSS tiến trình rỗng: ${mb(rssCold)} MB`);

  const retriever = new Retriever();
  // Nóng máy TRƯỚC vòng lặp. Không có bước này thì toàn bộ chi phí nạp BGE-M3
  // (~1GB, vài giây) rơi vào câu số 1 và cột thời gian của nó đo một thứ khác
  // hẳn 14 câu còn lại — đọc bảng sẽ tưởng câu 1 là câu chậm.
  const tWarm = Date.now();
  await retriever.search("viện đào tạo ngành gì", { topK: 3 });
  const warmMs = Date.now() - tWarm;
  const rssWarm = await settle();
  console.error(
    `RSS sau khi nạp model + index: ${mb(rssWarm)} MB (+${mb(rssWarm - rssCold)} MB, ${warmMs}ms)\n`
  );

  const results: unknown[] = [];
  let prevIdle = rssWarm;

  for (const c of CASES) {
    const idleBefore = await settle();
    peakView[0] = idleBefore;
    const t0 = Date.now();
    let chunks: RetrievalChunk[] = [];
    let queryUsed = "";
    let retrievalMs = 0;
    let reply = "";
    let error: string | null = null;

    try {
      const result = await retriever.search(c.q);
      chunks = result.chunks;
      queryUsed = result.searchQuery;
      retrievalMs = Date.now() - t0;

      if (chunks.length === 0) {
        reply = NO_HIT_REPLY;
      } else {
        const parts: string[] = [];
        for await (const t of answerStream(c.q, chunks, [])) parts.push(t);
        reply = parts.join("");
      }
    } catch (err) {
      error = friendlyError(err);
    }

    const totalMs = Date.now() - t0;
    const peak = peakView[0];
    const idleAfter = await settle();
    const growth = idleAfter - prevIdle;
    prevIdle = idleAfter;

    const got = error ? "error" : classify(reply, chunks.length);
    const row = {
      ...c,
      queryUsed,
      // Bằng câu hỏi gốc nghĩa là bước rewrite đã bị bỏ qua hoặc thất bại —
      // cần biết để không quy một câu sai cho retrieval khi thủ phạm là rewrite.
      rewritten: queryUsed !== c.q,
      peakRssMb: Number((peak / MB).toFixed(1)),
      idleRssMb: Number((idleAfter / MB).toFixed(1)),
      rssGrowthMb: Number((growth / MB).toFixed(1)),
      nChunks: chunks.length,
      topScore: chunks.length ? Number(chunks[0].score.toFixed(4)) : null,
      lowScore: chunks.length
        ? Number(chunks[chunks.length - 1].score.toFixed(4))
        : null,
      collections: [...new Set(chunks.map((x) => x.collection))],
      urls: [...new Set(chunks.map((x) => x.url))].slice(0, 4),
      retrievalMs,
      llmMs: totalMs - retrievalMs,
      totalMs,
      error,
      reply,
      got,
      pass: got === c.expect,
      refusalFlag: error ? null : isRefusal(reply),
    };
    results.push(row);

    console.error(
      `[${String(c.id).padStart(2)}/${CASES.length}] ${row.pass ? "OK" : "XX"} ` +
        `exp=${c.expect.padEnd(13)} got=${got.padEnd(13)} chunks=${String(row.nChunks).padStart(2)} ` +
        `${String(retrievalMs).padStart(5)}+${String(totalMs - retrievalMs).padStart(5)}=${String(totalMs).padStart(6)}ms ` +
        `đỉnh=${mb(peak)}MB nền${growth >= 0 ? "+" : ""}${mb1(growth)}MB  ${c.q.slice(0, 40)}`
    );

    // Giãn nhịp cho free tier. 9s chứ không phải 4.5s như trước: mỗi câu hỏi
    // giờ tốn HAI request (rewrite + trả lời), nên nhịp cũ là ~27 req/phút trên
    // hạn mức 15 RPM — đủ để chính bài đo tự tạo ra 429 rồi báo cáo nhầm thành
    // lỗi chất lượng.
    if (!MOCK) await new Promise((r) => setTimeout(r, 9000));
  }

  summarize(results as Row[], { rssCold, rssWarm, idleEnd: prevIdle });
  console.log(JSON.stringify(results, null, 2));
}

interface Row {
  id: number;
  group: string;
  expect: Expect;
  got: string;
  pass: boolean;
  rewritten: boolean;
  retrievalMs: number;
  llmMs: number;
  totalMs: number;
  peakRssMb: number;
  rssGrowthMb: number;
  q: string;
  note: string;
}

function summarize(
  rows: Row[],
  ram: { rssCold: number; rssWarm: number; idleEnd: number }
): void {
  const line = "─".repeat(78);
  const passed = rows.filter((r) => r.pass).length;

  console.error(`\n${line}\nĐỘ CHÍNH XÁC`);
  console.error(
    `  ${passed}/${rows.length} đúng kỳ vọng (${((passed / rows.length) * 100).toFixed(1)}%)`
  );
  // Tách theo nhóm vì bốn nhóm hỏng theo bốn kiểu khác nhau và một con số tổng
  // che mất điều đó: trả lời sai câu CÓ dữ liệu là hỏng truy hồi, còn trả lời
  // được câu NGOÀI phạm vi là hỏng phần từ chối — hai lỗi ngược hướng nhau.
  const groups = [...new Set(rows.map((r) => r.group))].sort();
  for (const g of groups) {
    const inGroup = rows.filter((r) => r.group === g);
    const ok = inGroup.filter((r) => r.pass).length;
    console.error(`    ${g.padEnd(20)} ${ok}/${inGroup.length}`);
  }
  for (const r of rows.filter((x) => !x.pass)) {
    console.error(`    XX [${r.id}] exp=${r.expect} got=${r.got} — ${r.q}`);
  }

  const retrieval = rows.map((r) => r.retrievalMs);
  const total = rows.map((r) => r.totalMs);
  const avg = (v: number[]) => Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  console.error(`\nTHỜI GIAN (ms, model đã nóng)`);
  console.error(`  ${"".padEnd(12)} ${"TB".padStart(7)} ${"p50".padStart(7)} ${"p95".padStart(7)} ${"max".padStart(7)}`);
  console.error(
    `  truy hồi     ${String(avg(retrieval)).padStart(7)} ${String(pct(retrieval, 50)).padStart(7)} ` +
      `${String(pct(retrieval, 95)).padStart(7)} ${String(Math.max(...retrieval)).padStart(7)}`
  );
  const llm = rows.map((r) => r.llmMs);
  console.error(
    `  trả lời LLM  ${String(avg(llm)).padStart(7)} ${String(pct(llm, 50)).padStart(7)} ` +
      `${String(pct(llm, 95)).padStart(7)} ${String(Math.max(...llm)).padStart(7)}`
  );
  console.error(
    `  tổng         ${String(avg(total)).padStart(7)} ${String(pct(total, 50)).padStart(7)} ` +
      `${String(pct(total, 95)).padStart(7)} ${String(Math.max(...total)).padStart(7)}`
  );
  console.error(
    `  rewrite chạy: ${rows.filter((r) => r.rewritten).length}/${rows.length} câu`
  );

  const peak = Math.max(...rows.map((r) => r.peakRssMb));
  console.error(`\nRAM`);
  console.error(`  tiến trình rỗng      ${mb(ram.rssCold).padStart(5)} MB`);
  console.error(
    `  sau khi nạp model    ${mb(ram.rssWarm).padStart(5)} MB  (+${mb(ram.rssWarm - ram.rssCold)} MB)`
  );
  console.error(`  đỉnh trong khi chạy  ${peak.toFixed(0).padStart(5)} MB`);
  console.error(
    `  nền sau ${rows.length} câu       ${mb(ram.idleEnd).padStart(5)} MB  ` +
      `(${ram.idleEnd - ram.rssWarm >= 0 ? "+" : ""}${mb1(ram.idleEnd - ram.rssWarm)} MB so với lúc nạp xong)`
  );
  // Con số đáng theo dõi nhất: mức nền bò lên đều theo từng câu nghĩa là có thứ
  // gì đó chỉ nở chứ không co — đúng triệu chứng của arena ONNX Runtime.
  console.error(
    `  nền tăng nhiều nhất trong một câu: ` +
      `${Math.max(...rows.map((r) => r.rssGrowthMb)).toFixed(1)} MB`
  );
  console.error(line);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
