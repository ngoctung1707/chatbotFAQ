/**
 * Đo riêng BGE-M3, tiến trình sạch (không tải model dịch, không nạp index).
 *
 * Vì sao có worker thread ở đây: ONNX Runtime tải model và chạy suy luận ĐỒNG BỘ,
 * chặn event loop của main thread. Một setInterval lấy mẫu trên main thread sẽ
 * không hề chạy trong đúng khoảng thời gian ta cần đo, và báo "đỉnh" thấp hơn cả
 * giá trị đo được sau khi xong. Worker có event loop riêng nên vẫn lấy mẫu được;
 * process.memoryUsage.rss() gọi từ worker trả về RSS của cả tiến trình, đúng thứ
 * ta cần. Đỉnh được ghi vào SharedArrayBuffer để main thread đọc mà không cần
 * postMessage (main thread đang bận, sẽ không xử lý message kịp).
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram-bge.ts
 */
import { Worker } from "worker_threads";
import { EMBEDDING_MODEL_ID } from "../src/lib/chatbot/config";

const MB = 1024 * 1024;
declare const global: typeof globalThis & { gc?: () => void };

// Worker viết bằng JS thuần và nạp qua `eval: true`, không trỏ về file này:
// worker_threads không kế thừa loader của tsx, nên một worker trỏ vào .ts sẽ
// chết với ERR_UNKNOWN_FILE_EXTENSION.
const SAMPLER_SRC = `
  const { workerData } = require("worker_threads");
  const peakView = new Float64Array(workerData.sab);
  setInterval(() => {
    const rss = process.memoryUsage.rss();
    if (rss > peakView[0]) peakView[0] = rss;
  }, 10);
`;

void main();

function mb(bytes: number): string {
  return (bytes / MB).toFixed(0).padStart(5) + " MB";
}

async function main() {
  const sab = new SharedArrayBuffer(8);
  const peakView = new Float64Array(sab);
  const worker = new Worker(SAMPLER_SRC, { eval: true, workerData: { sab } });
  worker.unref();
  await new Promise((r) => setTimeout(r, 200)); // để worker vào vòng lấy mẫu

  /** Chốt số sau khi GC, rồi reset đỉnh về mốc đó cho pha đo tiếp theo. */
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

  console.log(`Node ${process.version} — ${process.platform}/${process.arch}`);
  console.log(`Model: ${EMBEDDING_MODEL_ID}`);
  console.log(`RAM máy: đo trên tiến trình, đơn vị RSS (resident set size)\n`);

  const { pipeline } = await import("@xenova/transformers");
  const baseline = await settle();
  console.log(`Nền — đã import thư viện, chưa có trọng số:  ${mb(baseline)}`);

  // --- Pha 1: tải model ---
  const t0 = Date.now();
  const embedder = await pipeline("feature-extraction", EMBEDDING_MODEL_ID);
  const loadMs = Date.now() - t0;
  const peakLoad = peakView[0];
  const idleLoaded = await settle();

  console.log(`ĐỈNH trong lúc tải:                          ${mb(peakLoad)}   (+${mb(peakLoad - baseline)})`);
  console.log(`Lắng lại sau khi tải xong:                   ${mb(idleLoaded)}   (+${mb(idleLoaded - baseline)})`);
  console.log(`Thời gian tải: ${(loadMs / 1000).toFixed(1)}s (file .onnx đã nằm trong cache đĩa của OS)\n`);

  // --- Pha 2: một truy vấn thật, độ dài điển hình ---
  const q = "Viện trưởng của BK Fintech là ai và viện đào tạo những ngành nào?";
  const t1 = Date.now();
  await embedder(q, { pooling: "mean", normalize: true });
  const ms1 = Date.now() - t1;
  const peak1 = peakView[0];
  const idle1 = await settle();
  console.log(`1 truy vấn (${q.length} ký tự) — đỉnh ${mb(peak1)} (+${mb(peak1 - idleLoaded)}), lắng ${mb(idle1)}, ${ms1} ms`);

  // --- Pha 3: nhiều truy vấn tuần tự, xem RAM có bò lên không ---
  for (let round = 1; round <= 3; round++) {
    const before = peakView[0];
    for (let i = 0; i < 20; i++) {
      await embedder(`${q} câu hỏi số ${i}`, { pooling: "mean", normalize: true });
    }
    const peakR = peakView[0];
    const idleR = await settle();
    console.log(`20 truy vấn tuần tự (vòng ${round}) — đỉnh ${mb(peakR)} (+${mb(peakR - before)}), lắng ${mb(idleR)}`);
  }

  // --- Pha 4: truy vấn đồng thời (nhiều người hỏi cùng lúc) ---
  for (const n of [2, 4, 8]) {
    const idle = await settle();
    const t = Date.now();
    await Promise.all(
      Array.from({ length: n }, (_, i) =>
        embedder(`${q} (người dùng ${i})`, { pooling: "mean", normalize: true })
      )
    );
    const ms = Date.now() - t;
    const peakN = peakView[0];
    console.log(`${String(n).padStart(2)} truy vấn song song — đỉnh ${mb(peakN)} (+${mb(peakN - idle)}), ${ms} ms tổng`);
  }

  // --- Pha 5: ca xấu nhất — người dùng dán một khối văn bản dài ---
  // BGE-M3 có ngữ cảnh 8192 token và attention là O(n²) theo độ dài chuỗi, nên
  // đây là nơi RAM có thể vọt lên nhiều lần so với lúc rảnh.
  for (const chars of [2_000, 8_000, 22_000]) {
    const idle = await settle();
    const text = "Viện Công nghệ và Kinh tế số BK Fintech đào tạo fintech. ".repeat(
      Math.ceil(chars / 57)
    );
    const t = Date.now();
    await embedder(text, { pooling: "mean", normalize: true });
    const ms = Date.now() - t;
    const peakL = peakView[0];
    const idleL = await settle();
    console.log(
      `Văn bản ${String(text.length).padStart(6)} ký tự — đỉnh ${mb(peakL)} ` +
        `(+${mb(peakL - idle)}), lắng ${mb(idleL)}, ${(ms / 1000).toFixed(1)}s`
    );
  }

  const final = await settle();
  console.log(`\n=== Kết luận ===`);
  console.log(`Chi phí thường trực của BGE-M3 (sau tải, lúc rảnh): +${mb(idleLoaded - baseline)}`);
  console.log(`Đỉnh nhất thời lúc tải (cần headroom cho khoảnh khắc này): ${mb(peakLoad)}`);
  console.log(`RSS cuối cùng của tiến trình: ${mb(final)}`);
}
