/**
 * Node-only half of the instrumentation hook. See instrumentation.ts for why
 * the models are warmed at boot at all.
 *
 * This lives in its own module because Next bundles `instrumentation.ts` for
 * *both* runtimes and statically scans each bundle for Node APIs — the
 * `NEXT_RUNTIME` guard is a runtime check, so it does not stop the edge build
 * from tripping over `process.memoryUsage()` / `process.uptime()`. Reaching
 * this file only through a dynamic `import()` behind that guard keeps it out
 * of the edge bundle entirely, so the APIs below are never scanned there.
 */
export async function registerNode() {
  // Cửa sổ bảo trì hàng tuần (mục 4.5). Bỏ preload là cách duy nhất để website
  // vẫn chạy mà RAM chỉ có ĐÚNG MỘT bản BGE-M3 — bản của job embed. Nếu vẫn
  // preload ở đây thì dừng container mới cứu được RAM, mà dừng container là cả
  // fintech.hust.edu.vn offline chứ không riêng chatbot.
  const { readMaintenance } = await import("@/lib/chatbot/maintenance");
  const maintenance = readMaintenance();
  if (maintenance.active) {
    console.log(
      "[chatbot] CHE DO BAO TRI — bo qua preload BGE-M3. " +
        "Website chay binh thuong, chatbot tra thong bao bao tri."
    );
    return;
  }

  const { loadEmbedder } = await import("@/lib/chatbot/embedding");

  const start = Date.now();
  console.log("[chatbot] Đang preload model (BGE-M3)...");

  // allSettled, not all: a corrupt model file or an unreadable cache dir
  // should degrade the chatbot, not stop the whole site from booting. The
  // promise cache in embedding.ts only memoizes *successful* loads, so a failed
  // preload leaves the normal request path exactly as it was before this file
  // existed. Kept as allSettled with one entry rather than a bare try/catch
  // because that property is what makes preload safe, not the number of models
  // — it was two here until the Marian translator was removed.
  const results = await Promise.allSettled([loadEmbedder()]);

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[chatbot] Preload BGE-M3 THẤT BẠI:", result.reason);
    }
  });

  const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  console.log(
    `[chatbot] Preload xong sau ${Date.now() - start}ms ` +
      `(${process.uptime().toFixed(1)}s kể từ khi tiến trình khởi động, RSS ${rssMb}MB)`
  );
}
