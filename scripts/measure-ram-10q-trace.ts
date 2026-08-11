/**
 * Truy vết từng bước bên trong Retriever.search() cho câu hỏi ~250 từ, để biết
 * 11.7s/câu đo được ở measure-ram-10q.ts thực sự đi đâu. Tái dựng đúng các bước
 * của retriever.ts (dịch, nhúng từng biến thể, quét cosine, rerank) thay vì gọi
 * search() như hộp đen.
 *
 * Chạy:  npx tsx --expose-gc scripts/measure-ram-10q-trace.ts
 */
import { QUESTIONS } from "./questions-250w";
import { expandSelfReference } from "../src/lib/chatbot/retriever";
import { toEnglish } from "../src/lib/chatbot/translator";
import { embedQuery } from "../src/lib/chatbot/embedding";
import { VectorStore } from "../src/lib/chatbot/vectorStore";

async function main() {
  const store = await VectorStore.load();
  await toEnglish("viện đào tạo ngành gì");
  await embedQuery("viện đào tạo ngành gì", store.idf);

  console.log("Câu │ mở rộng │  dịch  │ nhúng×3 │ cosine │  tổng");
  console.log("────┼─────────┼────────┼─────────┼────────┼───────");

  const totals = { expand: 0, translate: 0, embed: 0, cosine: 0 };

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const tAll = Date.now();

    const t0 = Date.now();
    const expanded = expandSelfReference(q);
    const msExpand = Date.now() - t0;

    // Chính xác như retriever.ts:107 — dịch bản ĐÃ mở rộng, không phải câu gốc.
    const t1 = Date.now();
    const english = await toEnglish(expanded || q);
    const msTranslate = Date.now() - t1;

    const queries = [q];
    if (expanded) queries.push(expanded);
    if (english !== q) queries.push(english);

    let msEmbed = 0;
    let msCosine = 0;
    for (const text of queries) {
      const t2 = Date.now();
      const { dense } = await embedQuery(text, store.idf);
      msEmbed += Date.now() - t2;
      const t3 = Date.now();
      store.search(dense, 20);
      msCosine += Date.now() - t3;
    }

    const msTotal = Date.now() - tAll;
    totals.expand += msExpand;
    totals.translate += msTranslate;
    totals.embed += msEmbed;
    totals.cosine += msCosine;

    console.log(
      ` ${String(i + 1).padStart(2)} │ ${String(msExpand).padStart(5)}ms │ ` +
        `${(msTranslate / 1000).toFixed(1).padStart(4)}s │ ${(msEmbed / 1000).toFixed(1).padStart(6)}s │ ` +
        `${String(msCosine).padStart(4)}ms │ ${(msTotal / 1000).toFixed(1).padStart(4)}s`
    );
  }

  const grand = totals.expand + totals.translate + totals.embed + totals.cosine;
  console.log(`\n=== Trung bình mỗi câu (${QUESTIONS.length} câu) ===`);
  const pct = (v: number) => `${((v / grand) * 100).toFixed(0)}%`.padStart(4);
  console.log(`Dịch vi->en (Marian, beam=2): ${(totals.translate / 10 / 1000).toFixed(2)}s  ${pct(totals.translate)}`);
  console.log(`Nhúng BGE-M3 (3 biến thể):    ${(totals.embed / 10 / 1000).toFixed(2)}s  ${pct(totals.embed)}`);
  console.log(`Quét cosine 694 chunk × 3:    ${(totals.cosine / 10 / 1000).toFixed(2)}s  ${pct(totals.cosine)}`);
  console.log(`Mở rộng tên viện (chuỗi):     ${(totals.expand / 10 / 1000).toFixed(2)}s  ${pct(totals.expand)}`);
}

void main();
