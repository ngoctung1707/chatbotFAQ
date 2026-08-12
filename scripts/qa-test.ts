/**
 * Chạy một bộ câu hỏi qua đúng pipeline production (Retriever + answerStream),
 * gọi thẳng vào src/lib/chatbot/* nên không cần dev server hay Mongo. Mỗi câu
 * là một lượt độc lập (history rỗng), giống lượt đầu của một session mới.
 *
 * Import thẳng code đang chạy production thay vì chép lại, để bài test không
 * trôi khỏi bản gốc.
 *
 * Chạy: pnpm tsx --env-file-if-exists=.env scripts/qa-test.ts [suite] > out.json
 * suite: "core" (mặc định, bộ hồi quy) hoặc "bkfintech" — xem qa-cases.ts.
 * (stderr in tiến độ, stdout in JSON kết quả để bước thống kê đọc lại)
 */
import { Retriever, type RetrievalChunk } from "../src/lib/chatbot/retriever";
import {
  answerStream,
  friendlyError,
  isRefusal,
  NO_ANSWER,
  NOT_UPDATED,
} from "../src/lib/chatbot/llm";
import {
  CHAT_MODEL,
  DEFAULT_TOP_K,
  MOCK,
  TIMEOUT_MS,
} from "../src/lib/chatbot/config";
import { SUITES, type Expect } from "./qa-cases";

const SUITE = process.argv[2] || "core";
const CASES = SUITES[SUITE];
if (!CASES) {
  console.error(`Suite không tồn tại: ${SUITE}. Chọn: ${Object.keys(SUITES).join(", ")}`);
  process.exit(1);
}

// Chuỗi route.ts trả về khi retrieval không giữ lại đoạn nào.
const NO_HIT_REPLY =
  "Tôi không tìm thấy thông tin nào liên quan đến câu hỏi này trong dữ liệu của BKFintech.";

// Same shape as llm.ts's CITATION_MARKER_RE, separator and all. A simpler
// `\[\d+\]` pass is not good enough and this script proved it: the model
// answers "…thông tin chi tiết [1], [2]." and stripping the brackets alone
// leaves "…chi tiết,." — which contains neither refusal string, so a correct
// refusal gets scored as a real answer.
const ONE_MARKER = String.raw`\[\s*\d+(?:\s*,\s*\d+)*\s*\](?!\()`;
const MARKERS = new RegExp(
  String.raw`\s*${ONE_MARKER}(?:\s*[,;]?\s*${ONE_MARKER})*`,
  "g"
);

/** Which of the two refusals it is, once isRefusal() has said it is one.
 *
 * The "is it a refusal at all" question is delegated to production isRefusal()
 * rather than re-decided here — this script scored a refusal as a real answer
 * once already by reimplementing that test slightly differently, and a harness
 * that grades the product by its own private rules reports on something the
 * users never see. Only the which-one split is local, and it matches on the
 * same rephrase-tolerant cores isRefusal() uses. */
function classify(reply: string, nChunks: number): Expect {
  if (nChunks === 0) return "nothing_found";
  if (!isRefusal(reply)) return "answer";
  const lowered = reply.replace(MARKERS, "").trim().toLowerCase();
  if (
    lowered.includes(NO_ANSWER.toLowerCase()) ||
    lowered.includes("đặt ra câu hỏi chi tiết hơn")
  ) {
    return "no_answer";
  }
  return "not_updated";
}

async function main() {
  console.error(
    `model=${CHAT_MODEL} mock=${MOCK} timeout=${TIMEOUT_MS}ms topK=${DEFAULT_TOP_K}`
  );
  const retriever = new Retriever();
  const results: unknown[] = [];

  for (const c of CASES) {
    const t0 = Date.now();
    let chunks: RetrievalChunk[] = [];
    let queryUsed = "";
    let retrievalMs = 0;
    let reply = "";
    let error: string | null = null;

    try {
      const result = await retriever.search(c.q);
      chunks = result.chunks;
      queryUsed = result.searchQuery;
      retrievalMs = Date.now() - t0;

      if (chunks.length === 0) {
        reply = NO_HIT_REPLY;
      } else {
        const parts: string[] = [];
        for await (const t of answerStream(c.q, chunks, [])) parts.push(t);
        reply = parts.join("");
      }
    } catch (err) {
      error = friendlyError(err);
    }

    const totalMs = Date.now() - t0;
    const got = error ? "error" : classify(reply, chunks.length);
    const row = {
      ...c,
      queryUsed,
      nChunks: chunks.length,
      topScore: chunks.length ? Number(chunks[0].score.toFixed(4)) : null,
      lowScore: chunks.length
        ? Number(chunks[chunks.length - 1].score.toFixed(4))
        : null,
      collections: [...new Set(chunks.map((x) => x.collection))],
      urls: [...new Set(chunks.map((x) => x.url))].slice(0, 4),
      retrievalMs,
      llmMs: totalMs - retrievalMs,
      totalMs,
      error,
      reply,
      got,
      pass: got === c.expect,
      refusalFlag: error ? null : isRefusal(reply),
    };
    results.push(row);

    console.error(
      `[${c.id}/${CASES.length}] ${row.pass ? "OK" : "XX"} exp=${c.expect} got=${got} ` +
        `chunks=${row.nChunks} ${totalMs}ms  ${c.q.slice(0, 48)}`
    );

    // Free tier 15 RPM — giãn nhịp để không dính 429.
    await new Promise((r) => setTimeout(r, 4500));
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
