/**
 * Đo RAM với 10 câu hỏi dài (~250 từ mỗi câu) đi qua ĐÚNG đường đi production:
 * Retriever.search() — rewrite câu hỏi bằng LLM, nhúng tối đa 3 biến thể truy
 * vấn, quét cosine toàn corpus, rerank lexical.
 *
 * Vì sao 250 từ là ca đáng đo riêng chứ không phải nội suy từ câu ngắn:
 *  1. retriever.ts nhúng tới 3 biến thể cho mỗi câu hỏi (bản tiếng Việt, bản
 *     rewrite tiếng Anh, biến thể ghép ngữ cảnh), nên chi phí thực gấp ~3 lần
 *     một lần nhúng.
 *  2. Attention là O(n²) theo số token, và arena của ONNX Runtime chỉ nở chứ
 *     không co — nên thứ cần theo dõi là mức RAM nền có bị nâng vĩnh viễn
 *     sau mỗi câu hay không, chứ không chỉ đỉnh nhất thời.
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram-10q.ts
 */
import { Worker } from "worker_threads";
import { Retriever } from "../src/lib/chatbot/retriever";
import { QUESTIONS } from "./questions-250w";

const MB = 1024 * 1024;
declare const global: typeof globalThis & { gc?: () => void };

const SAMPLER_SRC = `
  const { workerData } = require("worker_threads");
  const peakView = new Float64Array(workerData.sab);
  setInterval(() => {
    const rss = process.memoryUsage.rss();
    if (rss > peakView[0]) peakView[0] = rss;
  }, 10);
`;

const mb = (b: number) => (b / MB).toFixed(0).padStart(4);
const mb1 = (b: number) => (b / MB).toFixed(1).padStart(6);


const countWords = (s: string) => s.trim().split(/\s+/).length;

async function main() {
  const sab = new SharedArrayBuffer(8);
  const peakView = new Float64Array(sab);
  new Worker(SAMPLER_SRC, { eval: true, workerData: { sab } }).unref();
  await new Promise((r) => setTimeout(r, 200));

  async function settle(): Promise<number> {
    if (typeof global.gc === "function") {
      global.gc();
      global.gc();
    }
    await new Promise((r) => setTimeout(r, 600));
    const rss = process.memoryUsage.rss();
    peakView[0] = rss;
    return rss;
  }

  const words = QUESTIONS.map(countWords);
  const chars = QUESTIONS.map((q) => q.length);
  console.log(`Node ${process.version} — 10 câu hỏi`);
  console.log(
    `Độ dài: ${Math.min(...words)}–${Math.max(...words)} từ ` +
      `(trung bình ${(words.reduce((a, b) => a + b) / 10).toFixed(0)} từ, ` +
      `${(chars.reduce((a, b) => a + b) / 10).toFixed(0)} ký tự)\n`
  );

  const cold = await settle();
  console.log(`Tiến trình rỗng:                    ${mb(cold)} MB`);

  // Nóng máy trước bằng một câu ngắn, để chi phí tải model không bị tính vào
  // câu hỏi số 1 và làm hỏng phép so sánh giữa 10 câu.
  const retriever = new Retriever();
  await retriever.search("viện đào tạo ngành gì", { topK: 3 });
  const warm = await settle();
  console.log(`Đã nóng máy (model + index đã nạp): ${mb(warm)} MB   (+${mb(warm - cold)} MB)\n`);

  console.log("Câu │  từ │ ký tự │ đỉnh RSS │ tăng đỉnh │ lắng RSS │ nền tăng │ thời gian");
  console.log("────┼─────┼───────┼──────────┼───────────┼──────────┼──────────┼──────────");

  let prevIdle = warm;
  const rows: { peak: number; idle: number; ms: number; growth: number }[] = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    const idleBefore = await settle();
    const t = Date.now();
    await retriever.search(QUESTIONS[i]);
    const ms = Date.now() - t;
    const peak = peakView[0];
    const idleAfter = await settle();
    const growth = idleAfter - prevIdle;
    rows.push({ peak, idle: idleAfter, ms, growth });
    console.log(
      ` ${String(i + 1).padStart(2)} │ ${String(words[i]).padStart(3)} │ ` +
        `${String(chars[i]).padStart(5)} │ ${mb(peak)} MB │ ${mb1(peak - idleBefore)} MB │ ` +
        `${mb(idleAfter)} MB │ ${mb1(growth)} MB │ ${(ms / 1000).toFixed(1)}s`
    );
    prevIdle = idleAfter;
  }

  // Chạy lại đúng 10 câu đó: lần hai không còn phải nở arena, nên chênh lệch
  // giữa hai lượt cho biết phần nào là chi phí một lần và phần nào lặp lại.
  console.log("\nLượt 2 (cùng 10 câu, arena đã nở sẵn, rewrite đã có trong cache):");
  const beforeR2 = await settle();
  const t2 = Date.now();
  for (const q of QUESTIONS) await retriever.search(q);
  const ms2 = Date.now() - t2;
  const peakR2 = peakView[0];
  const afterR2 = await settle();
  console.log(
    `  đỉnh ${mb(peakR2)} MB (+${mb1(peakR2 - beforeR2)} MB), ` +
      `lắng ${mb(afterR2)} MB (+${mb1(afterR2 - beforeR2)} MB), ${(ms2 / 1000).toFixed(1)}s tổng`
  );

  const peakOverall = Math.max(...rows.map((r) => r.peak), peakR2);
  const perQ = rows.map((r) => r.peak - warm);
  console.log(`\n=== Kết luận ===`);
  console.log(`RAM nền sau khi nạp model + index:        ${mb(warm)} MB`);
  console.log(`RAM nền sau 10 câu hỏi 250 từ:            ${mb(rows[9].idle)} MB  (+${mb1(rows[9].idle - warm)} MB)`);
  console.log(`Đỉnh cao nhất quan sát được:              ${mb(peakOverall)} MB`);
  console.log(`Chi phí nhất thời của câu tốn nhất:       +${mb1(Math.max(...perQ))} MB so với nền lúc nóng máy`);
  console.log(`Thời gian trung bình mỗi câu (lượt 1):    ${(rows.reduce((a, r) => a + r.ms, 0) / 10 / 1000).toFixed(1)}s`);
  console.log(`Thời gian trung bình mỗi câu (lượt 2):    ${(ms2 / 10 / 1000).toFixed(1)}s`);
}

void main();
