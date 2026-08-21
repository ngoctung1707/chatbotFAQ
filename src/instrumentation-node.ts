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
  // ĐÃ BỎ nhánh "thấy cờ bảo trì thì bỏ preload".
  //
  // Nhánh đó sinh ra cho cơ chế cũ, khi pha B tự nạp một bản BGE-M3 thứ hai
  // trong tiến trình riêng: app phải nhả model ra thì RAM mới đủ, và cách nhả
  // duy nhất là restart. Bây giờ pha B không nạp model nữa mà gọi vào
  // /api/chatbot/embed, nên trong hệ thống chỉ còn ĐÚNG MỘT bản model — chính
  // bản mà dòng dưới nạp.
  //
  // Giữ lại nhánh cũ bây giờ sẽ hỏng theo cách khó lần: app nào tình cờ boot
  // trong lúc đang bảo trì sẽ không có model, và mọi lời gọi /api/chatbot/embed
  // của job sẽ thất bại.
  //
  // Vẫn đọc cờ, nhưng chỉ để ghi log — biết app khởi động giữa cửa sổ bảo trì
  // là thông tin đáng có khi đọc lại data/weekly.log.
  const { readMaintenance } = await import("@/lib/chatbot/maintenance");
  if (readMaintenance().active) {
    console.log(
      "[chatbot] Boot giữa cửa sổ bảo trì — VẪN preload model (job mượn qua " +
        "/api/chatbot/embed). Chatbot trả thông báo bảo trì cho tới khi cờ hết hạn."
    );
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
  // Nạp luôn cả store, không chỉ model. Hai lý do, và lý do thứ hai mới là lý
  // do thật: (1) câu hỏi đầu tiên khỏi phải trả giá parse 20MB JSON; (2)
  // /api/health có `store_version` ngay từ lúc boot, nên job hàng tuần đối
  // chiếu được "store nào đang phục vụ" mà không cần chờ ai đó hỏi một câu.
  // Thiếu (2) thì trên một app vừa khởi động, store_version là null và bước
  // kiểm chứng của job không có gì để so.
  const { getStore } = await import("@/lib/chatbot/vectorStore");
  const results = await Promise.allSettled([loadEmbedder(), getStore()]);

  const names = ["BGE-M3", "store.json"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[chatbot] Preload ${names[i]} THẤT BẠI:`, result.reason);
    }
  });

  const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  console.log(
    `[chatbot] Preload xong sau ${Date.now() - start}ms ` +
      `(${process.uptime().toFixed(1)}s kể từ khi tiến trình khởi động, RSS ${rssMb}MB)`
  );
}
