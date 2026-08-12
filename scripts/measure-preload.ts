/**
 * Đo đúng phần việc mà instrumentation.ts's register() làm: nạp model ONNX rồi
 * báo thời gian + RSS. Không dính tới Next.js, nên chạy được cả khi dev server
 * đang giữ .next/.
 *
 * Dùng để: (1) biết preload tốn bao lâu trên máy/ổ đĩa cụ thể, (2) đối chiếu
 * với con số RSS mà instrumentation.ts in ra lúc server khởi động — nếu hai
 * con số lệch nhau nhiều thì preload trong Next đã không nạp cùng thứ.
 *
 * Chỉ còn BGE-M3 kể từ khi model dịch vi->en bị thay bằng một lần gọi LLM
 * (queryRewriter.ts) — bước dựng query giờ không nạp gì cả, nên nó không có
 * phần nào để preload.
 *
 *   pnpm measure-preload
 */
import { loadEmbedder } from "../src/lib/chatbot/embedding";

const mb = (n: number) => Math.round(n / 1024 / 1024);

async function main() {
  console.log(`[measure] RSS trước khi nạp: ${mb(process.memoryUsage().rss)}MB`);
  const start = Date.now();

  const [result] = await Promise.allSettled([loadEmbedder()]);
  console.log(
    `[measure] BGE-M3: ${result.status}` +
      (result.status === "rejected" ? ` -> ${result.reason}` : "")
  );

  console.log(`[measure] Nạp xong model sau ${Date.now() - start}ms`);
  console.log(`[measure] RSS sau khi nạp: ${mb(process.memoryUsage().rss)}MB`);
  console.log(`[measure] uptime tiến trình: ${process.uptime().toFixed(1)}s`);

  // Lần gọi thứ hai phải trả về ngay (promise đã cache) — đây là thứ khiến
  // request đầu tiên sau preload không phải chờ nạp lại.
  const again = Date.now();
  await loadEmbedder();
  console.log(`[measure] Gọi lại lần 2 (đã cache): ${Date.now() - again}ms`);
}

main();
