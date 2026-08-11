/**
 * Tổng RAM của một tiến trình phục vụ chat thật, sau khi đã "nóng máy":
 * BGE-M3 + model dịch vi->en + vector index, đo ở trạng thái lắng (đã chạy
 * suy luận ít nhất một lần, nên arena của ORT đã ở kích thước thật của nó —
 * ảnh chụp ngay sau khi tải model luôn sai, xem measure-ram-bge.ts).
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram-full.ts
 */
import { Worker } from "worker_threads";
import { EMBEDDING_MODEL_ID, TRANSLATE_MODEL_ID } from "../src/lib/chatbot/config";

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

const mb = (b: number) => (b / MB).toFixed(0).padStart(5) + " MB";

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

  const base = await settle();
  console.log(`Tiến trình rỗng:                     ${mb(base)}`);

  const { embedQuery } = await import("../src/lib/chatbot/embedding");
  const { toEnglish } = await import("../src/lib/chatbot/translator");
  const { VectorStore } = await import("../src/lib/chatbot/vectorStore");
  const afterImports = await settle();
  console.log(`+ import module chatbot:             ${mb(afterImports)}   (+${mb(afterImports - base)})`);

  const store = await VectorStore.load();
  const afterStore = await settle();
  console.log(`+ vector index (${store.size} chunk):        ${mb(afterStore)}   (+${mb(afterStore - afterImports)})`);

  // Một câu hỏi tiếng Việt thật: đi qua cả model dịch lẫn model embedding,
  // đúng như route /api/chat làm.
  const q = "Viện trưởng của viện là ai?";
  const en = await toEnglish(q);
  const afterTranslate = await settle();
  console.log(`+ model dịch, đã dịch 1 câu:         ${mb(afterTranslate)}   (+${mb(afterTranslate - afterStore)})`);
  console.log(`    "${q}" -> "${en}"`);

  await embedQuery(en, store.idf);
  const afterEmbed = await settle();
  console.log(`+ BGE-M3, đã nhúng 1 câu:            ${mb(afterEmbed)}   (+${mb(afterEmbed - afterTranslate)})`);

  // 30 câu hỏi nữa để chắc chắn con số đã bão hoà chứ không còn bò lên.
  const before30 = peakView[0];
  for (let i = 0; i < 30; i++) {
    const t = await toEnglish(`${q} Câu hỏi thứ ${i} về ngành đào tạo và học phí.`);
    await embedQuery(t, store.idf);
  }
  const peak30 = peakView[0];
  const after30 = await settle();
  console.log(`+ 30 câu hỏi nữa:                    ${mb(after30)}   (đỉnh ${mb(peak30)}, +${mb(peak30 - before30)})`);

  // Ca xấu nhất còn tới được qua API: câu hỏi 2000 ký tự (route.ts cắt ở đây).
  const idleBefore = await settle();
  const long = "Cho tôi hỏi về chương trình đào tạo fintech của viện. ".repeat(38).slice(0, 2000);
  const t0 = Date.now();
  await embedQuery(long, store.idf);
  const ms = Date.now() - t0;
  const peakLong = peakView[0];
  const afterLong = await settle();
  console.log(
    `+ câu hỏi dài nhất API cho phép (2000 ký tự): đỉnh ${mb(peakLong)} ` +
      `(+${mb(peakLong - idleBefore)}), lắng ${mb(afterLong)}, ${ms} ms`
  );

  console.log(`\n=== Tổng cho một worker phục vụ chat ===`);
  console.log(`Thường trực (ổn định, đã nóng máy): ${mb(afterLong)}`);
}

void main();
