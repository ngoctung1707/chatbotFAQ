/**
 * Build a search query for a question that only makes sense given the previous
 * turn — "Học phí bao nhiêu?" after "Khóa Fintech Foundation dạy gì?".
 *
 * This has no counterpart in retriever.py; it is JS-only, so the reasoning is
 * written out here rather than referred to.
 *
 * The problem: history only ever reached the *answering* prompt, never
 * retrieval. A follow-up was embedded verbatim, and with the subject dropped
 * there is nothing left in it to match on — the hits either fall under
 * DEFAULT_MIN_SCORE or come from an unrelated page, so <data> arrives empty and
 * SYSTEM_PROMPT correctly makes the model say NOT_UPDATED about information the
 * corpus does contain. From the user's side that reads as the bot forgetting the
 * question it just answered.
 *
 * The fix is a fourth query variant, not a replacement: retriever.search()
 * merges hits by best score per chunk, so the merged query can only add
 * candidates the plain question missed. That also bounds the damage — a bad
 * merge costs one embedding pass, it never displaces a good query.
 *
 * Lives in its own file rather than next to expandSelfReference() in
 * retriever.ts: retriever.ts is long already, and these two change for
 * different reasons (one tracks the institute's names, this one tracks how
 * people phrase follow-ups).
 *
 * Deliberately looks back exactly one turn. Three-turn chains
 * (A → "cái đó" → "còn cái kia") still break, and that is accepted: merging
 * more turns merges more noise, and there is no evidence yet that such chains
 * are frequent enough to pay for.
 */
import {
  CONTEXT_ANAPHORA,
  CONTEXT_FALLBACK_ENABLED,
  CONTEXT_MERGE_ENABLED,
  CONTEXT_ORDINAL_WORDS,
  CONTEXT_ORDINAL_WORDS_EN,
  CONTEXT_PREV_MAX_CHARS,
  CONTEXT_SHORT_QUESTION_WORDS,
  CONTEXT_WEAK_DENSE,
} from "./config";

/** Unicode-aware word split — \w and \b are ASCII-only in JS, so they would
 * both miscount "Học phí bao nhiêu" and break word-boundary matching on any
 * accented anaphora. One tokenizer feeds both the length gate and the anaphora
 * lookup so the two can never disagree about what a word is. */
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/**
 * Does this question look like it depends on the previous turn?
 *
 * Exported separately from mergeWithHistory() so the gate can be tested without
 * a history fixture — it is the part that has to be right. Merging
 * unconditionally is not an option: it would pollute genuinely independent
 * questions (ask about a course, then about the labs, and the merged query
 * drags course chunks into the candidate set).
 *
 * That risk is real rather than theoretical, and the reason is subtler than
 * "merging by max score only adds, never removes". True of the hit *set*, false
 * of the final *ranking*: hits are cut to `candidates` (20) before rerank,
 * rescale() is a min-max over exactly that set, and maxPerUrl + topK trim again
 * at the end. Adding a candidate moves all three. A chunk found only by the
 * merged query can absolutely push a correct chunk out of the top-7.
 *
 * So the gate is required, and the default is tight on purpose: missing a
 * follow-up is cheaper than damaging an independent question.
 */
/**
 * Câu hỏi có chứa tham chiếu TƯỜNG MINH tới lượt trước hay không —
 * từ chỉ xuất ("nó", "đó") hoặc tham chiếu thứ tự ("người thứ 2",
 * "cái đầu tiên").
 *
 * Chặt hơn hẳn isContextDependent(): KHÔNG dùng ngưỡng độ dài. Đó là điểm mấu
 * chốt. Ngưỡng độ dài không phân biệt được "các khoá học" (tự đủ nghĩa) với
 * "Học phí bao nhiêu?" (mất chủ đề) — cả hai đều là danh ngữ ngắn — và chính
 * chỗ đó đã kéo chunk lạc đề vào top-7 trên production. Hai nhánh xử lý mạnh
 * tay (bỏ qua LLM ở route, và dùng lại chunk lượt trước) đều dựa vào hàm này
 * chứ không dựa vào độ dài: một câu chứa "thứ 2" thì gần như chắc chắn đang
 * trỏ về đâu đó, còn một câu chỉ ngắn thì không suy ra được gì.
 *
 * Đánh đổi có chủ đích: "Học phí bao nhiêu?" KHÔNG khớp hàm này. Thà bỏ sót
 * còn hơn lại làm hỏng câu hỏi độc lập — cùng nguyên tắc D2.
 */
export function hasExplicitReference(question: string): boolean {
  const tokens = tokenize(question);
  if (tokens.some((t) => CONTEXT_ANAPHORA.includes(t))) return true;
  if (tokens.some((t) => CONTEXT_ORDINAL_WORDS_EN.includes(t))) return true;

  // Tham chiếu thứ tự khớp theo CẶP token, không theo token đơn: "hai" đứng
  // một mình là số đếm ("hai khóa học"), chỉ "thứ hai" mới là tham chiếu.
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a === "thứ" && (/^\d+$/.test(b) || CONTEXT_ORDINAL_WORDS.includes(b))) {
      return true;
    }
    if (a === "đầu" && b === "tiên") return true;
    if (a === "cuối" && b === "cùng") return true;
  }
  return false;
}

export function isContextDependent(question: string): boolean {
  const tokens = tokenize(question);
  if (tokens.length === 0) return false;
  if (tokens.length <= CONTEXT_SHORT_QUESTION_WORDS) return true;
  return tokens.some((t) => CONTEXT_ANAPHORA.includes(t));
}

/** Điểm dense cao nhất trong tập chunk — thước đo "truy hồi có neo được vào
 * đâu không". Phải là `dense_score` (cosine thô) chứ không phải `score`: sau
 * rerank, `score` đi qua rescale() min-max nên đỉnh luôn ≈ DENSE_WEIGHT bất kể
 * câu hỏi tốt hay tệ. `dense_score` chỉ có mặt khi rerank đã chạy, nên có
 * fallback về `score` cho đường không rerank. */
export function topDenseScore(
  chunks: { score: number; dense_score?: number }[]
): number {
  if (chunks.length === 0) return 0;
  return Math.max(...chunks.map((c) => c.dense_score ?? c.score));
}

/**
 * Câu hỏi trỏ về một lượt trước không tồn tại.
 *
 * Đo được: gặp tình huống này model KHÔNG từ chối — nó chọn đại người xuất
 * hiện thứ hai trong <data> rồi khẳng định chắc nịch (3/3 lần, sai tên). Trả
 * lời sai mà không có dấu hiệu gì thì tệ hơn một câu từ chối, nên chặn ở code
 * chứ không giao cho prompt: luật trong SYSTEM_PROMPT vẫn nên có (và đã thêm),
 * nhưng nó là lớp phòng thủ thứ hai, không phải lớp duy nhất.
 */
export function isOrphanReference(
  question: string,
  historyLength: number
): boolean {
  return historyLength === 0 && hasExplicitReference(question);
}

/**
 * Có nên bỏ tập chunk vừa truy hồi để dùng lại tập của lượt trước không.
 *
 * Hai điều kiện, cố ý độc lập với nhau:
 *
 *   1. câu hỏi có tham chiếu TƯỜNG MINH — không phải chỉ "ngắn". Chính phép
 *      thử độ dài đã kéo chunk lạc đề vào "các khoá học" trên production.
 *   2. truy hồi của chính lượt này không neo được vào đâu (topDense dưới
 *      CONTEXT_WEAK_DENSE).
 *
 * Điều kiện 2 là phần kiểm duyệt: một câu follow-up mà truy hồi vốn đã tốt thì
 * không bị đụng tới gì cả.
 *
 * Xuất khẩu để route.ts và bài test dùng CHUNG một luật — một bài test tự chấm
 * theo luật riêng của nó thì đang đo một sản phẩm khác với sản phẩm người dùng
 * chạy (xem chú thích cùng ý trong scripts/qa-test.ts).
 */
export function shouldReusePreviousChunks(
  question: string,
  hasPrevious: boolean,
  topDense: number
): boolean {
  return (
    CONTEXT_FALLBACK_ENABLED &&
    hasPrevious &&
    hasExplicitReference(question) &&
    topDense < CONTEXT_WEAK_DENSE
  );
}

/**
 * The merged query, or null when there is nothing to merge.
 *
 * Returns null rather than the unchanged question for the same reason
 * expandSelfReference() does: the caller can tell "nothing to add" from "added
 * and it's a no-op" without a second check. Keeping the two contracts identical
 * is what lets search() read the same way for every query variant.
 *
 * Only the last *user* message is used, never an assistant one. Answers run to
 * MAX_OUTPUT_TOKENS (2048) — pasting one into a query would dilute the
 * embedding until the actual question stopped influencing it at all.
 */
export function mergeWithHistory(
  question: string,
  history: { role: string; content: string }[]
): string | null {
  if (!CONTEXT_MERGE_ENABLED) return null;
  if (!history.length) return null;
  if (!isContextDependent(question)) return null;

  let prev = "";
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user") {
      prev = (history[i].content || "").trim();
      break;
    }
  }
  if (!prev) return null;

  // Previous question first: in that order the result reads like one complete
  // question ("Khóa Fintech Foundation dạy gì? Học phí bao nhiêu?") rather than
  // a fragment with context bolted on the end. Order shifts a dense embedding
  // only slightly and means nothing at all to the lexical branch, so the tie is
  // broken on which form is easier to read in a retrieval log.
  return `${prev.slice(0, CONTEXT_PREV_MAX_CHARS)} ${question}`;
}
