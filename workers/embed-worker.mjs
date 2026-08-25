/**
 * Worker thread giữ BGE-M3 — bản model DUY NHẤT của cả tiến trình.
 *
 * VÌ SAO LÀ WORKER CHỨ KHÔNG PHẢI LUỒNG CHÍNH
 * -------------------------------------------
 * Đo được trên chính máy này: tỉ lệ song song/tuần tự của truy hồi là 0.91,
 * tức inference ONNX CHẶN event loop — chạy model ở luồng chính thì cả website
 * đứng theo. Chuyện đó chấp nhận được khi chỉ có câu hỏi lẻ (vài trăm ms),
 * nhưng không chấp nhận được ở pha embed hàng tuần: hàng chục tới hàng trăm
 * chunk liên tiếp sẽ làm trang Payload treo suốt thời gian đó.
 *
 * Đẩy model xuống một worker thì luồng chính chỉ còn postMessage rồi chờ, và
 * nó rảnh để phục vụ HTTP suốt lúc embed.
 *
 * VÌ SAO ĐÚNG MỘT WORKER, KHÔNG PHẢI POOL
 * ---------------------------------------
 * Mỗi worker giữ một ONNX session riêng, tức mỗi worker là thêm ~1,9GB RAM.
 * Đo được: app sau preload đã chiếm ~2,3-2,4GB, nên bản thứ hai sẽ vượt trần
 * container ngay. Một worker cũng đủ, vì hai luồng công việc
 * dùng tới nó — trả lời câu hỏi và embed dữ liệu mới — theo thiết kế KHÔNG BAO
 * GIỜ chạy cùng lúc: trong cửa sổ bảo trì thì /api/chat đã chặn ở cờ bảo trì
 * trước khi đụng tới truy hồi.
 *
 * Và vì worker xử lý message tuần tự, hàng đợi là thứ có sẵn chứ không phải
 * thứ phải viết. Nếu hai bên có lỡ gọi cùng lúc thì chúng xếp hàng, không
 * tranh RAM.
 *
 * File này CỐ Ý nằm ngoài src/ và là .mjs thuần: nó không được bundler của
 * Next đụng vào, mà được nạp thẳng bằng đường dẫn tuyệt đối lúc chạy. Vì vậy
 * next.config.ts phải khai nó trong outputFileTracingIncludes, nếu không bản
 * build `output: 'standalone'` sẽ thiếu file này.
 */
import { parentPort, workerData } from "node:worker_threads";
import { env, pipeline } from "@xenova/transformers";

if (!parentPort) {
  throw new Error("embed-worker.mjs chỉ chạy được bên trong worker_threads");
}

const MODEL_ID = workerData?.modelId;
if (!MODEL_ID) {
  throw new Error("Thiếu workerData.modelId khi tạo embed worker");
}

// Đặt TRƯỚC lời gọi pipeline() đầu tiên — thư viện đọc env.cacheDir tại thời
// điểm tải, nên đặt sau là không có tác dụng.
//
// Mặc định của thư viện nằm trong node_modules, mà thư mục đó trong image
// Docker là rỗng (Dockerfile chỉ chép .next/standalone). Trỏ ra một volume gắn
// từ host thì model tải đúng một lần rồi sống qua mọi lần dựng lại image.
if (workerData?.cacheDir) {
  env.cacheDir = workerData.cacheDir;
  console.log(`[chatbot] cache model: ${workerData.cacheDir}`);
}

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", MODEL_ID).catch((err) => {
      // Bỏ cache khi nạp hỏng, để lần gọi sau còn thử lại. Không có dòng này
      // thì một lần hết RAM lúc khởi động sẽ đóng băng worker vĩnh viễn với
      // đúng cái lỗi cũ.
      embedderPromise = null;
      throw err;
    });
  }
  return embedderPromise;
}

parentPort.on("message", async (msg) => {
  if (!msg || msg.type !== "embed") return;
  const { id, texts } = msg;
  try {
    const embedder = await getEmbedder();
    const vectors = [];
    // Tuần tự chứ không Promise.all: chúng dùng chung một ONNX session, gọi
    // song song không nhanh hơn mà chỉ làm đỉnh RAM cao hơn.
    for (const text of texts) {
      const out = await embedder(text, { pooling: "cls", normalize: true });
      vectors.push(Array.from(out.data));
    }
    parentPort.postMessage({ type: "result", id, vectors });
  } catch (err) {
    parentPort.postMessage({
      type: "error",
      id,
      error: String(err?.stack ?? err),
    });
  }
});

// Nạp model ngay khi worker sinh ra, đừng đợi câu hỏi đầu tiên. Luồng chính
// chờ đúng tín hiệu này để biết "model đã sẵn sàng" mà báo ra /api/health.
getEmbedder().then(
  () => parentPort.postMessage({ type: "ready" }),
  (err) =>
    parentPort.postMessage({
      type: "ready-error",
      error: String(err?.stack ?? err),
    })
);
