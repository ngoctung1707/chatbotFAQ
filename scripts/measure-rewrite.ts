/**
 * Bóc tách độ trễ của một lượt truy hồi sau khi thay model dịch bằng bước
 * rewrite LLM, và đo mức RAM nền của tiến trình quanh 10 câu hỏi.
 *
 * Đối chứng với measure-ram-10q.ts (cùng bộ câu, cùng cách đo RSS): con số cần
 * so là cột thời gian ở đó — kiến trúc cũ chạy Marian HAI lần cho mỗi câu hỏi
 * (queryFor + search dựng chuỗi hơi khác nhau nên miss cache cả hai lần).
 *
 * Cách đọc bảng, vì hai cột không đo cùng một lượt:
 *   t_rewrite  — gọi rewriteQuery() TRƯỚC, khi cache còn rỗng cho khoá này.
 *   t_embed    — nhúng các biến thể truy vấn (số biến thể in ở cột n_q).
 *   t_search   — quét cosine toàn corpus cho từng biến thể.
 *   t_e2e      — retriever.search() đầy đủ chạy NGAY SAU, nên rewrite đã nằm
 *                trong cache: đây là "mọi thứ trừ call LLM", gồm cả rerank và
 *                các bộ lọc.
 *   t_total    — t_rewrite + t_e2e. Đây là mô hình đúng của một instance đã
 *                nóng: bước nhúng phải chờ rewrite trả về mới có query để
 *                nhúng, nên hai phần cộng tuyến tính. Trên cold start thì con
 *                số này BI QUAN: ở đó call LLM chạy trong bóng của ~5s nạp
 *                BGE-M3 (xem Promise.all trong retriever.search).
 *
 * Chạy:  npx tsx --expose-gc --env-file-if-exists=.env scripts/measure-rewrite.ts
 *        thêm --core để dùng 10 câu hỏi NGẮN thật thay cho bộ 250 từ.
 */
import { Retriever } from "../src/lib/chatbot/retriever";
import { VectorStore } from "../src/lib/chatbot/vectorStore";
import { embedQuery } from "../src/lib/chatbot/embedding";
import { needsRestoration, restoreQuestion } from "../src/lib/chatbot/diacritics";
import { rewriteQuery } from "../src/lib/chatbot/queryRewriter";
import {
  DEFAULT_CANDIDATES,
  DEFAULT_TOP_K,
  MOCK,
  REWRITE_ENABLED,
} from "../src/lib/chatbot/config";
import { QUESTIONS as LONG_QUESTIONS } from "./questions-250w";

const MB = 1024 * 1024;
declare const global: typeof globalThis & { gc?: () => void };

// Bộ ngắn: câu hỏi thật, độ dài thật. Bộ 250 từ ở questions-250w là ca biên đo
// RAM, không phải thứ người dùng gõ — nên cả hai đều có mặt, chọn bằng cờ.
const SHORT_QUESTIONS = [
  "Viện trưởng là ai?",
  "vien co nhung san pham nao",
  "Viện có những chương trình đào tạo nào?",
  "Học phí khóa Fintech Foundation bao nhiêu?",
  "Các phòng lab nghiên cứu của viện gồm những gì?",
  "Ai là giảng viên ngành khoa học dữ liệu?",
  "Viện có hợp tác doanh nghiệp nào?",
  "Hoạt động của BKFintech vào 2026 gồm những gì?",
  "What research labs does the institute run?",
  "Địa chỉ liên hệ của viện ở đâu?",
];

const pad = (s: string | number, n: number) => String(s).padStart(n);
const mb = (b: number) => (b / MB).toFixed(0);

async function settle(): Promise<number> {
  if (typeof global.gc === "function") {
    global.gc();
    global.gc();
  }
  await new Promise((r) => setTimeout(r, 400));
  return process.memoryUsage().rss;
}

async function main() {
  const useCore = process.argv.includes("--core");
  const QUESTIONS = useCore ? SHORT_QUESTIONS : LONG_QUESTIONS;

  console.log(
    `Node ${process.version} — bộ ${useCore ? "NGẮN (câu thật)" : "DÀI (~250 từ)"}, ` +
      `${QUESTIONS.length} câu · rewrite=${REWRITE_ENABLED} mock=${MOCK} topK=${DEFAULT_TOP_K}`
  );
  if (MOCK) {
    console.log(
      "!! CHATBOT_MOCK bật — rewriteQuery() bỏ qua call LLM, t_rewrite sẽ ~0ms " +
        "và bảng này không so được với gì cả."
    );
  }

  const rssStart = await settle();
  console.log(`RSS trước khi nạp model: ${mb(rssStart)} MB\n`);

  const store = await VectorStore.load();
  const retriever = new Retriever(store);
  // Nóng máy: chi phí nạp BGE-M3 không được rơi vào câu số 1.
  await retriever.search("viện đào tạo ngành gì", { topK: 3 });
  const rssWarm = await settle();
  console.log(`RSS sau khi nóng máy (BGE-M3 + index): ${mb(rssWarm)} MB\n`);

  console.log(
    "câu │ n_q │ t_rewrite │ t_embed │ t_search │  t_e2e │ t_total │ đoạn"
  );
  console.log(
    "────┼─────┼───────────┼─────────┼──────────┼────────┼─────────┼─────"
  );

  const totals = { rewrite: 0, embed: 0, search: 0, e2e: 0 };

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];

    const t0 = Date.now();
    const rewritten = await rewriteQuery(q, []);
    const tRewrite = Date.now() - t0;

    // Dựng lại đúng danh sách biến thể mà search() dùng, để cột n_q khớp với
    // thứ thật sự được nhúng thay vì một con số giả định.
    const restored =
      rewritten.vietnamese && needsRestoration(q)
        ? rewritten.vietnamese
        : await restoreQuestion(q);
    const variants = [restored];
    if (rewritten.english.toLowerCase() !== restored.toLowerCase()) {
      variants.push(rewritten.english);
    }

    let tEmbed = 0;
    let tSearch = 0;
    for (const v of variants) {
      const tE = Date.now();
      const { dense } = await embedQuery(v, store.idf);
      tEmbed += Date.now() - tE;
      const tS = Date.now();
      store.search(dense, DEFAULT_CANDIDATES);
      tSearch += Date.now() - tS;
    }

    // Rewrite đã nằm trong cache ở lượt này — cố ý, xem docblock đầu file.
    const tR = Date.now();
    const { chunks } = await retriever.search(q);
    const tE2e = Date.now() - tR;

    totals.rewrite += tRewrite;
    totals.embed += tEmbed;
    totals.search += tSearch;
    totals.e2e += tE2e;

    console.log(
      ` ${pad(i + 1, 2)} │ ${pad(variants.length, 3)} │ ${pad(tRewrite, 7)}ms │ ` +
        `${pad(tEmbed, 5)}ms │ ${pad(tSearch, 6)}ms │ ${pad(tE2e, 4)}ms │ ` +
        `${pad(tRewrite + tE2e, 5)}ms │ ${pad(chunks.length, 4)}`
    );
  }

  const n = QUESTIONS.length;
  const avg = (v: number) => (v / n).toFixed(0);
  console.log(
    "────┴─────┴───────────┴─────────┴──────────┴────────┴─────────┴─────"
  );
  console.log(
    `TB  │       │ ${pad(avg(totals.rewrite), 7)}ms │ ${pad(avg(totals.embed), 5)}ms │ ` +
      `${pad(avg(totals.search), 6)}ms │ ${pad(avg(totals.e2e), 4)}ms │ ` +
      `${pad(avg(totals.rewrite + totals.e2e), 5)}ms`
  );

  const rssEnd = await settle();
  console.log(
    `\nRSS sau ${n} câu: ${mb(rssEnd)} MB ` +
      `(nền tăng ${((rssEnd - rssWarm) / MB).toFixed(1)} MB kể từ lúc nóng máy)`
  );
  console.log(
    "So với kiến trúc cũ: mức nền phải thấp hơn hẳn vì không còn opus-mt, và " +
      "phần 'nền tăng' phải gần như đứng yên — arena ORT của model dịch là thứ " +
      "trước đây chỉ nở chứ không co."
  );
}

main();
