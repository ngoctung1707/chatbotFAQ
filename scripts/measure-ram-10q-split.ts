/**
 * Bóc tách 11.7s/câu của measure-ram-10q.ts: bao nhiêu là model dịch, bao nhiêu
 * là BGE-M3, và mỗi phần tốn bao nhiêu RAM riêng — với cùng 10 câu hỏi ~250 từ.
 *
 * Cần bóc tách vì hai model có đặc tính hoàn toàn khác nhau ở input dài:
 * BGE-M3 chạy encoder một lượt, còn Marian (dịch) là seq2seq có beam search,
 * chạy decoder lặp từng token với num_beams=2 — chi phí của nó không tỉ lệ với
 * độ dài input theo cùng một cách.
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram-10q-split.ts
 */
import { Worker } from "worker_threads";
import { QUESTIONS } from "./questions-250w";
import { toEnglish } from "../src/lib/chatbot/translator";
import { embedQuery } from "../src/lib/chatbot/embedding";
import { VectorStore } from "../src/lib/chatbot/vectorStore";

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

  const store = await VectorStore.load();
  // Nóng máy cả hai model bằng câu ngắn, để chi phí nạp không rơi vào câu số 1.
  await toEnglish("viện đào tạo ngành gì");
  await embedQuery("viện đào tạo ngành gì", store.idf);
  const warm = await settle();
  console.log(`Nền lúc nóng máy (cả 2 model + index): ${mb(warm)} MB\n`);

  console.log("Câu │ DỊCH (Marian)          │ NHÚNG (BGE-M3, 3 biến thể)");
  console.log("    │ thời gian │ đỉnh RAM   │ thời gian │ đỉnh RAM");
  console.log("────┼───────────┼────────────┼───────────┼───────────");

  let tTranslate = 0;
  let tEmbed = 0;
  let peakTranslate = 0;
  let peakEmbed = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];

    const idle1 = await settle();
    const t1 = Date.now();
    const en = await toEnglish(q);
    const ms1 = Date.now() - t1;
    const dTranslate = peakView[0] - idle1;

    // 3 lần nhúng: retriever.ts nhúng câu gốc, bản mở rộng tên viện, và bản dịch.
    const idle2 = await settle();
    const t2 = Date.now();
    await embedQuery(q, store.idf);
    await embedQuery(`${q} Viện Công nghệ và Kinh tế số BK Fintech`, store.idf);
    await embedQuery(en, store.idf);
    const ms2 = Date.now() - t2;
    const dEmbed = peakView[0] - idle2;

    tTranslate += ms1;
    tEmbed += ms2;
    peakTranslate = Math.max(peakTranslate, dTranslate);
    peakEmbed = Math.max(peakEmbed, dEmbed);

    console.log(
      ` ${String(i + 1).padStart(2)} │ ${(ms1 / 1000).toFixed(1).padStart(7)}s │ ` +
        `${mb1(dTranslate)} MB │ ${(ms2 / 1000).toFixed(1).padStart(7)}s │ ${mb1(dEmbed)} MB`
    );
  }

  const final = await settle();
  console.log(`\n=== Kết luận ===`);
  console.log(`Dịch  — tổng ${(tTranslate / 1000).toFixed(1)}s (${(tTranslate / 10 / 1000).toFixed(1)}s/câu), đỉnh RAM thêm tối đa ${mb1(peakTranslate)} MB`);
  console.log(`Nhúng — tổng ${(tEmbed / 1000).toFixed(1)}s (${(tEmbed / 10 / 1000).toFixed(1)}s/câu cho 3 biến thể), đỉnh RAM thêm tối đa ${mb1(peakEmbed)} MB`);
  console.log(`Tỉ lệ thời gian: dịch ${((tTranslate / (tTranslate + tEmbed)) * 100).toFixed(0)}% / nhúng ${((tEmbed / (tTranslate + tEmbed)) * 100).toFixed(0)}%`);
  console.log(`RAM nền cuối: ${mb(final)} MB (+${mb1(final - warm)} MB so với lúc nóng máy)`);
}

void main();
