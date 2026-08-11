/**
 * Đo đúng phần việc mà instrumentation.ts's register() làm: nạp cả hai model
 * ONNX rồi báo thời gian + RSS. Không dính tới Next.js, nên chạy được cả khi
 * dev server đang giữ .next/.
 *
 * Dùng để: (1) biết preload tốn bao lâu trên máy/ổ đĩa cụ thể, (2) đối chiếu
 * với con số RSS mà instrumentation.ts in ra lúc server khởi động — nếu hai
 * con số lệch nhau nhiều thì preload trong Next đã không nạp cùng số model.
 *
 *   pnpm measure-preload
 */
import { loadEmbedder } from "../src/lib/chatbot/embedding";
import { loadTranslator } from "../src/lib/chatbot/translator";

const mb = (n: number) => Math.round(n / 1024 / 1024);

async function main() {
  console.log(`[measure] RSS trước khi nạp: ${mb(process.memoryUsage().rss)}MB`);
  const start = Date.now();

  const results = await Promise.allSettled([loadEmbedder(), loadTranslator()]);
  results.forEach((r, i) => {
    const name = i === 0 ? "BGE-M3" : "model dịch";
    console.log(
      `[measure] ${name}: ${r.status}` +
        (r.status === "rejected" ? ` -> ${r.reason}` : "")
    );
  });

  console.log(`[measure] Nạp xong cả hai model sau ${Date.now() - start}ms`);
  console.log(`[measure] RSS sau khi nạp: ${mb(process.memoryUsage().rss)}MB`);
  console.log(`[measure] uptime tiến trình: ${process.uptime().toFixed(1)}s`);

  // Lần gọi thứ hai phải trả về ngay (promise đã cache) — đây là thứ khiến
  // request đầu tiên sau preload không phải chờ nạp lại.
  const again = Date.now();
  await Promise.allSettled([loadEmbedder(), loadTranslator()]);
  console.log(`[measure] Gọi lại lần 2 (đã cache): ${Date.now() - again}ms`);
}

main();
