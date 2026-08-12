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
