/**
 * Kiểm tra định tính sau khi dựng lại chỉ mục: in ra chunk đứng đầu cho vài câu
 * hỏi tiêu biểu.
 *
 *   CHATBOT_REWRITE=0 npx tsx scripts/crawl/spot-check.ts
 *
 * Cổng QA ở mục 5.3 chỉ đếm "có truy hồi được gì không" — nó không biết thứ
 * truy hồi được có ĐÚNG hay không. Bài này để người đọc bằng mắt, vì một chỉ
 * mục trả về 7 chunk sai vẫn qua được cổng đếm.
 */
import { Retriever } from "../../src/lib/chatbot/retriever";

const QUESTIONS = [
  "Viện trưởng của BK Fintech là ai?",
  "Viện có bao nhiêu công bố khoa học?",
  "Viện có những phòng lab nghiên cứu nào?",
  "V-Chain là gì?",
  "Hội đồng viện gồm những ai?",
];

async function main() {
  const r = new Retriever();
  for (const q of QUESTIONS) {
    const res = await r.search(q, { topK: 2 });
    console.log(`\n### ${q}`);
    if (!res.chunks.length) {
      console.log("   (khong truy hoi duoc gi)");
      continue;
    }
    for (const c of res.chunks) {
      const text = (c.raw ?? "").replace(/\s+/g, " ").slice(0, 160);
      console.log(`   [${(c.score ?? 0).toFixed(3)}] ${c.chunk_id}`);
      console.log(`         ${text}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
