/**
 * Warm the two local ONNX models (BGE-M3 embeddings + the vi->en Marian
 * translator) once, at server start, instead of on whichever request happens
 * to arrive first.
 *
 * Why here and not lazily: this deploys as a long-lived process on the
 * school's own server (compose.yaml -> `node server.js` from Next's
 * standalone output), not on serverless, so the process outlives every
 * request and the model cache directory survives restarts. Under the lazy
 * loading in embedding.ts/translator.ts the *first* visitor after each deploy
 * paid the whole model load — hundreds of MB of ONNX session init — inside
 * their own request. Loading at boot moves that cost to a moment when nobody
 * is waiting.
 *
 * Next.js runs `register()` once per server process, before it starts
 * serving. `NEXT_RUNTIME` is checked because instrumentation also runs on the
 * edge runtime, where neither model can load at all.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // PHẢI nạp sharp TRƯỚC @xenova/transformers, và thứ tự này là bắt buộc trên
  // Windows chứ không phải sở thích. Hai gói đều kéo theo DLL native, và
  // onnxruntime (đi kèm transformers) nạp bộ GLib che mất thứ libvips của sharp
  // cần: sau đó mọi lần require("sharp") trong cùng tiến trình đều ném
  // ERR_DLOPEN_FAILED "The specified procedure could not be found". Đảo lại thứ
  // tự thì cả hai cùng sống. Đã dựng lại được ngoài Next: nạp sharp trước →
  // chạy; nạp transformers trước → hỏng.
  //
  // Vì sao nó biểu hiện ở ĐÂY: file này chạy lúc server khởi động, trước mọi
  // request. payload.config.ts import sharp, nên khi register() đã nạp
  // transformers xong thì trang Payload đầu tiên trả 500 và cả site sập trong
  // khi /api/chat vẫn chạy — triệu chứng rất dễ đổ nhầm cho Payload hoặc Mongo.
  await import("sharp").catch(() => {
    // Không có sharp cũng không sao đối với chatbot; Payload sẽ tự than phiền
    // nếu nó thực sự cần. Nuốt lỗi ở đây để một lần nạp hỏng không chặn preload.
  });

  const { loadEmbedder } = await import("@/lib/chatbot/embedding");
  const { loadTranslator } = await import("@/lib/chatbot/translator");

  const start = Date.now();
  console.log("[chatbot] Đang preload model (BGE-M3 + model dịch)...");

  // allSettled, not all: a corrupt model file or an unreadable cache dir
  // should degrade the chatbot, not stop the whole site from booting. The
  // promise caches in those two modules only memoize *successful* loads
  // (a rejected promise is still cached, but the lazy path already treats a
  // load failure as "answer without translation" / surfaces it per request),
  // so a failed preload leaves the normal request path exactly as it was
  // before this file existed.
  const results = await Promise.allSettled([loadEmbedder(), loadTranslator()]);

  results.forEach((result, i) => {
    const name = i === 0 ? "BGE-M3" : "model dịch";
    if (result.status === "rejected") {
      console.error(`[chatbot] Preload ${name} THẤT BẠI:`, result.reason);
    }
  });

  const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  console.log(
    `[chatbot] Preload xong sau ${Date.now() - start}ms ` +
      `(${process.uptime().toFixed(1)}s kể từ khi tiến trình khởi động, RSS ${rssMb}MB)`
  );
}
