/**
 * Chẩn đoán: với một câu hỏi, chunk mà ta MONG ĐỢI đang xếp hạng bao nhiêu?
 *
 *   CHATBOT_REWRITE=0 npx tsx scripts/crawl/diagnose.ts
 *
 * Cổng QA đếm số chunk truy hồi được, nên nó không phân biệt "trả về 7 chunk
 * đúng" với "trả về 7 chunk sai". Bài này chỉ ra chunk mong đợi nằm ở đâu trong
 * bảng xếp hạng, và điểm của nó so với chunk đang đứng đầu.
 */
import { VectorStore } from "../../src/lib/chatbot/vectorStore";
import { embedQuery } from "../../src/lib/chatbot/embedding";
import { DEFAULT_MIN_SCORE } from "../../src/lib/chatbot/config";

const CASES: { q: string; expect: string }[] = [
  { q: "Viện trưởng của BK Fintech là ai?", expect: "board-of-deans" },
  { q: "Viện có bao nhiêu công bố khoa học?", expect: "stats_publications" },
  { q: "Hội đồng viện gồm những ai?", expect: "institute-council" },
  { q: "Ban lãnh đạo viện gồm những ai?", expect: "board-of-deans" },
];

async function main() {
  const store = await VectorStore.load();
  console.log(`store: ${store.size} chunk | MIN_SCORE ${DEFAULT_MIN_SCORE}\n`);

  for (const c of CASES) {
    const { dense, lexical } = await embedQuery(c.q, store.idf);
    const hits = store.search(dense, 200);
    const rank = hits.findIndex((h) => h.chunk_id.includes(c.expect));
    console.log(`### ${c.q}`);
    console.log(`   mong doi: *${c.expect}*`);
    if (rank < 0) {
      console.log(`   KHONG co trong 200 ket qua dau`);
    } else {
      const h = hits[rank];
      console.log(`   hang ${rank + 1}/200, diem ${h.score.toFixed(3)} ${h.score < DEFAULT_MIN_SCORE ? "(DUOI NGUONG)" : ""}`);
      console.log(`   id: ${h.chunk_id}`);
    }
    console.log(`   dung dau: [${hits[0].score.toFixed(3)}] ${hits[0].chunk_id}`);
    console.log();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
