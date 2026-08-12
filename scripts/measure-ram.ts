/**
 * Đo RAM tiêu tốn khi tải BGE-M3 (và các thành phần khác của đường đi truy vấn)
 * vào bộ nhớ tiến trình.
 *
 * Vì sao đo RSS chứ không phải heap V8: trọng số ONNX không nằm trong heap
 * JavaScript. onnxruntime-node mmap/đọc file .onnx rồi cấp phát arena ở phía
 * native, nên `heapUsed` gần như không nhúc nhích trong khi tiến trình thực tế
 * chiếm thêm hàng trăm MB. Chỉ RSS (resident set size) mới nhìn thấy phần đó.
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram.ts
 * (--expose-gc không bắt buộc; có thì số heap sạch hơn vì gọi được global.gc)
 */
import { EMBEDDING_MODEL_ID } from "../src/lib/chatbot/config";

const MB = 1024 * 1024;

interface Snapshot {
  label: string;
  rss: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

const snapshots: Snapshot[] = [];

declare const global: typeof globalThis & { gc?: () => void };

async function snap(label: string): Promise<Snapshot> {
  // GC trước khi đọc: nếu không, rác của bước trước bị tính vào bước này.
  if (typeof global.gc === "function") {
    global.gc();
    global.gc();
  }
  // Cho ORT/GC một nhịp để trả lại bộ nhớ tạm trước khi chốt số.
  await new Promise((r) => setTimeout(r, 300));
  const m = process.memoryUsage();
  const s: Snapshot = {
    label,
    rss: m.rss,
    heapUsed: m.heapUsed,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  };
  snapshots.push(s);
  return s;
}

function fmt(bytes: number): string {
  return (bytes / MB).toFixed(1).padStart(8) + " MB";
}

function report() {
  console.log("\n=== RSS theo từng bước (mỗi dòng: tổng | tăng so với bước trước) ===");
  let prev: Snapshot | null = null;
  for (const s of snapshots) {
    const delta = prev ? s.rss - prev.rss : 0;
    const deltaStr = prev
      ? `  (+${(delta / MB).toFixed(1)} MB)`
      : "  (mốc gốc)";
    console.log(`${s.label.padEnd(38)} RSS ${fmt(s.rss)}${deltaStr}`);
    prev = s;
  }

  console.log("\n=== Chi tiết (RSS / heap V8 / external / ArrayBuffer) ===");
  for (const s of snapshots) {
    console.log(
      `${s.label.padEnd(38)} rss=${fmt(s.rss)}  heap=${fmt(s.heapUsed)}  ` +
        `ext=${fmt(s.external)}  ab=${fmt(s.arrayBuffers)}`
    );
  }
}

async function main() {
  console.log(`Node ${process.version} — ${process.platform}/${process.arch}`);
  console.log(`Embedding model: ${EMBEDDING_MODEL_ID}`);
  console.log(`global.gc: ${typeof global.gc === "function" ? "có" : "không (chạy với --expose-gc để chính xác hơn)"}\n`);

  await snap("1. Node khởi động (mốc gốc)");

  // Import động để tách được chi phí của chính thư viện khỏi chi phí trọng số.
  const { pipeline } = await import("@xenova/transformers");
  await snap("2. + import @xenova/transformers");

  // --- BGE-M3: đây là con số người dùng hỏi ---
  const t0 = Date.now();
  const embedder = await pipeline("feature-extraction", EMBEDDING_MODEL_ID);
  const loadMs = Date.now() - t0;
  const afterLoad = await snap("3. + tải BGE-M3 (session ONNX)");

  // Lần chạy đầu cấp phát arena cho activation — chưa tính vào bước tải.
  const t1 = Date.now();
  await embedder("Viện trưởng của BK Fintech là ai?", {
    pooling: "mean",
    normalize: true,
  });
  const firstMs = Date.now() - t1;
  await snap("4. + suy luận lần đầu (1 câu hỏi)");

  // Nhiều câu hỏi liên tiếp: kiểm tra RAM có bò lên theo từng truy vấn không.
  const questions = [
    "Các khóa học fintech gồm những gì?",
    "Học phí bao nhiêu?",
    "Địa chỉ của viện ở đâu?",
    "Chương trình đào tạo blockchain có không?",
    "Liên hệ tuyển sinh thế nào?",
    "What research labs does the institute run?",
    "Ai là giảng viên ngành khoa học dữ liệu?",
    "Thời gian đào tạo kéo dài bao lâu?",
    "Có học bổng cho sinh viên quốc tế không?",
    "Đối tác doanh nghiệp của viện là ai?",
  ];
  const t2 = Date.now();
  for (const q of questions) {
    await embedder(q, { pooling: "mean", normalize: true });
  }
  const batchMs = Date.now() - t2;
  await snap(`5. + ${questions.length} truy vấn nữa`);

  // Câu dài: chuỗi token dài hơn => activation lớn hơn, xem đỉnh RAM tới đâu.
  const longText = questions.join(" ").repeat(8);
  await embedder(longText, { pooling: "mean", normalize: true });
  await snap("6. + 1 truy vấn văn bản dài");

  // --- Các thành phần còn lại của một request thật, để có bức tranh đầy đủ ---
  const { VectorStore } = await import("../src/lib/chatbot/vectorStore");
  try {
    const store = await VectorStore.load();
    await snap(`7. + nạp vector index (${store.size} chunk)`);
  } catch (e) {
    console.log(`\n[bỏ qua bước 7 - chưa có index: ${(e as Error).message}]`);
    await snap("7. (không nạp được vector index)");
  }

  // Trước đây có bước 8 và 9 đo model dịch vi->en (Xenova/opus-mt-vi-en) chạy
  // cạnh BGE-M3 trong cùng tiến trình. Model đó đã bị gỡ — bước dựng query giờ
  // là một lần gọi LLM (queryRewriter.ts), không nạp trọng số nào — nên số của
  // báo cáo này chính là toàn bộ RAM model của tiến trình phục vụ chat.

  report();

  const base = snapshots[1].rss; // sau khi import thư viện, trước khi có trọng số
  console.log("\n=== Tóm tắt ===");
  console.log(`Riêng BGE-M3 (tải trọng số):        ${fmt(afterLoad.rss - base)}`);
  console.log(
    `BGE-M3 + đã chạy suy luận (ổn định): ${fmt(snapshots[5].rss - base)}`
  );
  console.log(`Toàn bộ tiến trình lúc đỉnh:         ${fmt(Math.max(...snapshots.map((s) => s.rss)))}`);
  console.log(`\nThời gian tải BGE-M3: ${(loadMs / 1000).toFixed(1)}s`);
  console.log(`Suy luận lần đầu:      ${firstMs} ms`);
  console.log(
    `Suy luận về sau:       ${(batchMs / questions.length).toFixed(0)} ms/truy vấn (trung bình ${questions.length} lần)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
