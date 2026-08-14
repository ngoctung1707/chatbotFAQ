/**
 * Build the grounded prompt and stream the model's answer via the Vercel AI
 * SDK (`ai` + `@ai-sdk/google`). Direct port of llm.py's prompt/streaming
 * logic; the Gemini-specific SDK call is the one substantial rewrite since
 * the Python side spoke to google-genai directly and this speaks through the
 * AI SDK's provider abstraction instead.
 *
 * `raw` is what reaches the model, not a cleaned/embedding-only field — same
 * reasoning as llm.py: any breadcrumb text added purely to steer the
 * *embedding* would just be noise for the model to quote back.
 */
import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import type { ChatMessage } from "./chatHistory";
import {
  MAX_OUTPUT_TOKENS,
  MAX_POINTS,
  MOCK,
  STICKY_SESSION,
  supportsThinkingConfig,
  THINKING_LEVEL,
  TIMEOUT_MS,
  TOTAL_BUDGET_MS,
  type ModelLimits,
} from "./config";
import { markExhausted, rankModels, reconcile, record } from "./rateLimiter";
import type { RetrievalChunk } from "./retriever";

// The exact string the model must return when the passages don't answer the
// question. Fixed and short so it can be detected downstream if needed, and
// so there's no room to soften a refusal into a guess.
export const NO_ANSWER =
  "Tôi chưa rõ câu hỏi của bạn, bạn có thể đặt ra câu hỏi chi tiết hơn được không ạ?";
export const NOT_UPDATED =
  "Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.";

/**
 * Whether the model declined to answer, i.e. returned NO_ANSWER or
 * NOT_UPDATED rather than something the passages support.
 *
 * Substring rather than equality on two counts. The model appends citation
 * markers to these sentences — the NOT_UPDATED rule in SYSTEM_PROMPT actively
 * asks for them ("kèm số nguồn xác nhận đối tượng") — and it sometimes opens
 * with the short "Dạ," the style rules permit. Both strings are long and
 * distinctive enough that containment cannot fire on a real answer.
 *
 * The marker pattern must cover every way the model groups them, not just
 * adjacent brackets ("[1][2]"): comma-grouped ("[1, 2]") and, most commonly in
 * real answers, separate brackets joined by punctuation ("[1], [2], [4]").
 * A trailing marker survives either way because the check is containment, but
 * the model also drops one *inside* the sentence ("…liên hệ trực tiếp với
 * BKFintech [1], [4] để biết…"), and a marker left there splits the string so
 * neither half contains NOT_UPDATED — the refusal reads as a real answer and
 * route.ts attaches sources to it. The separator has to be absorbed along with
 * the brackets for the same reason: stripping brackets alone leaves "…với
 * BKFintech, để biết…", which still fails the containment check.
 *
 * Kept in sync with CITATION_MARKER_RE in ChatbotWidget.tsx; deliberately
 * duplicated rather than shared, since importing this module into a client
 * component would pull the AI SDK into the browser bundle.
 */
const ONE_MARKER = String.raw`\[\s*\d+(?:\s*,\s*\d+)*\s*\](?!\()`;
const CITATION_MARKER_RE = new RegExp(
  String.raw`\s*${ONE_MARKER}(?:\s*[,;]?\s*${ONE_MARKER})*`,
  "g"
);

/**
 * The part of each refusal that survives the model rephrasing around it.
 *
 * Matching the whole constant is too brittle to rely on, and the failure is
 * silent in the worst direction: a refusal that goes undetected gets
 * "Nguồn tham khảo" attached by route.ts, i.e. pages cited for a claim they do
 * not support. Two rewrites were observed in testing, both of which the
 * SYSTEM_PROMPT explicitly forbids and the model produced anyway —
 * "Dạ, xin lỗi, tôi chưa được cập nhật…" (permitted opener glued on, capital
 * lowercased by the comma) and "…mình chưa được cập nhật…" (the style rule's
 * pronoun overriding the fixed text). Anchoring on the middle of each sentence
 * absorbs both: it drops the sentence-initial capital, the opener, and the
 * pronoun, and keeps a phrase long enough that no real answer contains it.
 *
 * Compared case-insensitively for the same reason — the model re-cases the
 * first word whenever it prepends anything.
 */
const REFUSAL_CORES = [
  "chưa được cập nhật thông tin mới nhất",
  "đặt ra câu hỏi chi tiết hơn",
].map((s) => s.toLowerCase());

export function isRefusal(reply: string): boolean {
  const stripped = reply.replace(CITATION_MARKER_RE, "").trim();
  if (stripped.includes(NO_ANSWER) || stripped.includes(NOT_UPDATED)) {
    return true;
  }
  const lowered = stripped.toLowerCase();
  return REFUSAL_CORES.some((core) => lowered.includes(core));
}

// Rule order and wording follow llm.py's SYSTEM_PROMPT. The "Văn phong" block
// appears twice in the Python source — the second copy is byte-identical to
// the first, i.e. a paste that was never noticed, so it is included once here
// rather than reproduced. Nothing else about the prompt is condensed: the
// model's behaviour is measured against this exact text, so a "tidier"
// rewording is a change to the product, not to the code.
//
// One deliberate divergence from llm.py: the NOT_UPDATED rule now pins the
// *format* of the source numbers it asks for. Python only said "kèm số nguồn
// xác nhận đối tượng", which collides with the rule two lines above demanding
// the fixed sentences stay NGUYÊN VĂN. The model resolved that collision the
// only way that obeys both — leave the sentence untouched, append the numbers
// in a parenthetical of its own invention — and produced "(Nguồn: [1], [4])".
// CITATION_MARKER_RE then strips the brackets and nothing else, so the visible
// answer ended in a bare "(Nguồn:)". The numbers themselves were never the
// problem: route.ts drops sources for any refusal (isRefusal → sources: []),
// so for exactly this rule's case they are discarded downstream no matter what.
// They are still asked for because the demand is what forces the model to
// prove it found the subject, which is what separates NOT_UPDATED from
// NO_ANSWER here — the rule's actual job. Naming the format keeps that lever
// and leaves nothing behind once the markers are stripped. "sau dấu chấm cuối
// câu" also pulls them out of mid-sentence, where a marker used to split the
// string so isRefusal's containment check missed and a refusal got sources.
export const SYSTEM_PROMPT = `\
Bạn là trợ lý BKFintech (Viện Công nghệ và Kinh tế số, ĐH Bách khoa Hà Nội). \
Chỉ dùng thông tin trong <data>. Không dùng kiến thức ngoài, không tra cứu \
ngoài, không suy luận thêm những gì văn bản không nói.
Văn phong — CHỈ áp dụng khi câu hỏi bằng tiếng Việt. Câu hỏi bằng tiếng Anh \
(hay ngôn ngữ khác) → trả lời HOÀN TOÀN bằng ngôn ngữ đó, bỏ cả ba gạch đầu \
dòng dưới đây: không "Dạ,", không xưng "mình", không gọi "bạn".
- Gọi người dùng là "bạn";
- Nói như trò chuyện. Mở đầu ngắn ("Dạ,") được; câu dẫn thủ tục \
("Dựa trên thông tin được cung cấp…", "Theo tài liệu…") không.
- Không chấm than, không nịnh, không xin lỗi dài dòng.
- Ngoại lệ: hai câu cố định ở dưới phải giữ NGUYÊN VĂN từng chữ — giữ "tôi", \
không đổi thành "mình", không thêm "Dạ," phía trước, không diễn đạt lại.
- <data> không đủ trả lời câu hỏi → trả lời đúng một câu, không gì khác: \
"${NOT_UPDATED}"
- nếu như bạn không hiểu câu hỏi của user hoặc phạm vi của câu hỏi quá rộng, hãy trả lời đúng một câu: "${NO_ANSWER}"
- <data> đúng đối tượng hỏi (khóa học, chương trình...) nhưng THIẾU chi tiết \
câu hỏi cần (chi phí, thời lượng, ngày khai giảng, năm thành lập...) → trả lời "${NOT_UPDATED}" \
kèm số nguồn xác nhận đối tượng. Số nguồn viết dạng [n] trần, đặt sau dấu chấm \
cuối câu, ví dụ: "...để biết thông tin chi tiết. [1]" — không bọc trong ngoặc, \
không thêm chữ "Nguồn"/"Source"/"Xem" hay bất kỳ nhãn nào trước số, không chèn \
số vào giữa câu. KHÔNG dùng câu "${NO_ANSWER}" cho trường hợp này.
- Trả lời thẳng vào vấn đề, không dẫn kiểu "Dựa vào văn bản/Theo thông tin cung cấp".
- Tối đa ${MAX_POINTS} gạch đầu dòng; câu đơn giản thì 1 ý là đủ.
- Không bịa ngày tháng, số liệu, tên người, giá tiền ngoài <data>.
- Trả lời đúng ngôn ngữ câu hỏi; nguồn khác ngôn ngữ thì dịch phần cần dùng, \
không xin lỗi vì điều đó.
- Nguồn mâu thuẫn nhau → nêu cả hai, chỉ rõ khác biệt, không tự chọn một bên.
- Lượt hỏi-đáp trước chỉ dùng khi câu hỏi hiện tại phụ thuộc ngữ cảnh (đại từ, \
tham chiếu thứ tự như "người thứ 2"/"cái đầu tiên", hỏi tiếp điều vừa nhắc). \
Chủ đề mới, độc lập → bỏ qua lượt trước.
- Phân vai rõ: lượt trước chỉ để biết câu hỏi đang NHẮC TỚI AI/CÁI GÌ. Mọi dữ \
kiện trả lời vẫn phải lấy từ <data>. Ví dụ "người thứ 2" → tra lượt trước để \
biết đó là ai, rồi trả lời về người đó bằng <data>.
- Câu hỏi nhắc tới thứ gì đó mà KHÔNG có lượt trước nào để tra → trả lời đúng \
một câu: "${NO_ANSWER}". Tuyệt đối không đoán xem đang nói về ai/cái gì dựa \
vào thứ tự xuất hiện trong <data>.`;

export function formatSources(chunks: RetrievalChunk[]): string {
  return chunks
    .map((chunk, i) => {
      const n = i + 1;
      const title = (chunk.title || "").trim();
      const header = title ? `[${n}] ${title}` : `[${n}]`;
      const withDate = chunk.published_at
        ? `${header} (${chunk.published_at})`
        : header;
      return `${withDate}\n${chunk.url}\n${chunk.raw}`;
    })
    .join("\n\n");
}

export function buildUserMessage(
  question: string,
  chunks: RetrievalChunk[]
): string {
  // Nothing retrieved is itself an empty <data> block, so the NOT_UPDATED /
  // NO_ANSWER rules apply on their own without a second code path — same as
  // llm.py's build_user_message.
  if (chunks.length === 0) return `Câu hỏi: ${question}\n\n<data>\n</data>`;
  return `Câu hỏi: ${question}\n\n<data>\n${formatSources(chunks)}\n</data>`;
}

/** Prior turns plus the current question, as the multi-turn message list the
 * AI SDK expects — not one flattened string, so the model can tell where a
 * past answer ends and the live question's <data> block begins. */
export function buildMessages(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[]
): ModelMessage[] {
  const turns: ModelMessage[] = history.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }));
  turns.push({ role: "user", content: buildUserMessage(question, chunks) });
  return turns;
}

export class AnswerTimeout extends Error {}

/** A call that ended without producing a single character.
 *
 * Not a theoretical case: a model that emits reasoning before text (Gemma 4
 * spends over a thousand tokens on it) and is cut off by the abort signal
 * mid-reasoning ends its stream with no text, no error part and no abort part —
 * observed while testing this pool. Read as success it becomes an empty bubble
 * in the widget with nothing in the logs; named as a failure it falls through
 * to the next model like any other. Safe to fall back on by definition: nothing
 * was yielded, so nothing can be spliced. */
export class EmptyAnswer extends Error {}

// --- Error classification ---
//
// The three helpers below decide whether a failure is worth handing to the next
// model. Getting this wrong is expensive in a way that hides itself: treat
// everything as fallback-worthy and a bad prompt (400 INVALID_ARGUMENT) burns
// all three models, one timeout apiece, before surfacing an error that has
// nothing to do with quota — three times the wait, and the real cause buried
// under two irrelevant retries.

/** An error and everything it was wrapped in, outermost first.
 *
 * The AI SDK does not always hand back the provider's own error: a failure that
 * escapes through one of the result promises arrives as NoOutputGeneratedError
 * with the real APICallError — the only object carrying the status code and the
 * quota body — hanging off `cause`. Classifying the wrapper alone reads every
 * such failure as "unknown error, do not fall back", which is the one verdict
 * that makes the pool useless. Depth-capped because a cause chain can be
 * circular. */
function errorChain(err: unknown): unknown[] {
  const chain: unknown[] = [];
  let current = err;
  for (let depth = 0; depth < 4 && current; depth++) {
    chain.push(current);
    current = (current as { cause?: unknown }).cause;
  }
  return chain;
}

/** HTTP status off an SDK error, from whichever field this provider used.
 * @ai-sdk/google's APICallError carries `statusCode`; other providers and some
 * wrapped errors carry `status`, and code that reads only one of them silently
 * classifies every error from the other as "no status". */
function errorStatus(err: unknown): number | undefined {
  for (const link of errorChain(err)) {
    if (!link || typeof link !== "object") continue;
    const e = link as { statusCode?: unknown; status?: unknown };
    for (const value of [e.statusCode, e.status]) {
      if (typeof value === "number") return value;
      if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
    }
  }
  return undefined;
}

/** Everything text-ish about an error, for pattern matching. The status code
 * alone is not enough — a Gemini 429 says RESOURCE_EXHAUSTED in a JSON body the
 * SDK keeps in `responseBody`, and that body is also the only place retryDelay
 * appears.
 *
 * Exported so queryRewriter.ts can log its own failures the same way rather
 * than growing a second, shallower copy of this walk. */
export function errorText(err: unknown): string {
  const parts: string[] = [];
  for (const link of errorChain(err)) {
    if (link instanceof Error) parts.push(link.name, link.message);
    else if (typeof link !== "object") parts.push(String(link));
    if (!link || typeof link !== "object") continue;
    const e = link as { responseBody?: unknown; data?: unknown };
    if (typeof e.responseBody === "string") parts.push(e.responseBody);
    if (e.data) {
      try {
        parts.push(JSON.stringify(e.data));
      } catch {
        /* circular structures are not worth a throw here */
      }
    }
  }
  return parts.join(" ");
}

/** Out of quota, or the model itself is over capacity — the two cases where
 * another model with the same key is genuinely likely to do better. 503 and
 * "overloaded" are included because Gemini returns them for exactly that on the
 * free tier, and waiting them out is the same waste as waiting out a 429. */
export function isQuotaError(err: unknown): boolean {
  const status = errorStatus(err);
  if (status === 429 || status === 503) return true;
  return /RESOURCE_EXHAUSTED|UNAVAILABLE|overloaded|quota/i.test(errorText(err));
}

/** Whether to try the next model at all.
 *
 * 400/401/403 return false and do so first, before any pattern matching: a
 * malformed request, a missing key or a key without access are properties of
 * *this deployment*, identical for every model in the pool, so trying the rest
 * only multiplies the wait before the developer sees the real message. (401/403
 * in particular can carry the word "quota" in their body, which is why the
 * status check has to come before the text check and not after.)
 *
 * 404 is worth a fallback for the opposite reason: it means this model id does
 * not exist for this key — a stale entry in MODEL_POOL — and the others may
 * well be fine. 500 and timeouts are transient by nature. */
export function shouldFallback(err: unknown): boolean {
  const status = errorStatus(err);
  if (status === 400 || status === 401 || status === 403) return false;
  if (isQuotaError(err)) return true;
  if (status === 404 || status === 500) return true;
  const name = err instanceof Error ? err.name : "";
  return (
    err instanceof AnswerTimeout ||
    err instanceof EmptyAnswer ||
    name === "TimeoutError" ||
    name === "AbortError"
  );
}

/** How long Gemini asked us to wait, from the `retryDelay` it puts in a 429
 * body ("37s"). Preferred over a fixed cooldown because it is the only number
 * in the exchange that reflects the real limit rather than a guess about it;
 * undefined when absent, and the caller falls back to a full minute. */
export function retryDelayMs(err: unknown): number | undefined {
  const match = /"?retryDelay"?\s*[:=]\s*"?(\d+(?:\.\d+)?)s/i.exec(
    errorText(err)
  );
  if (!match) return undefined;
  return Math.round(Number(match[1]) * 1000);
}

/**
 * Rough token count for one call, input plus the output it is allowed to
 * produce.
 *
 * TPM can only be spent ahead of time if the cost is known ahead of time, and
 * the only thing available before the call is the text itself. Characters over
 * 3 rather than the usual 4: Vietnamese with diacritics tokenizes worse than
 * English, and the two failure directions are not symmetric — overestimating
 * moves to another model slightly early, underestimating means booking a
 * request the counters think fits and getting a 429 for it.
 *
 * MAX_OUTPUT_TOKENS is added because TPM counts what the model writes as well
 * as what it reads, and an answer capped at 2048 tokens is a real share of the
 * minute's budget. Charging the cap rather than the actual length keeps the
 * booking conservative; reconcile() replaces the whole figure with the
 * provider's own count as soon as the stream ends.
 */
export function estimateTokens(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[] = []
): number {
  let chars = SYSTEM_PROMPT.length + question.length;
  for (const chunk of chunks) {
    chars += chunk.raw.length + (chunk.title?.length ?? 0) + chunk.url.length;
  }
  for (const msg of history) chars += msg.content.length;
  return Math.ceil(chars / 3) + MAX_OUTPUT_TOKENS;
}

/** Provider-specific options for one call — the AI SDK equivalent of
 * llm.py's build_config().
 *
 * Gated on the model, because the older Gemma generations reject the field
 * outright. The gate itself lives in config.ts — it is no longer the "Gemini
 * only" rule the Python side used, since gemma-4 does accept and honour
 * thinkingConfig, and queryRewriter.ts needs the same answer. Returning
 * undefined rather than an empty object keeps the negative case a no-op instead
 * of an empty `google: {}` block in the request.
 *
 * Takes the model as an argument now that one process talks to several: reading
 * the module-level CHAT_MODEL would attach thinking config based on whichever
 * model is *first in the pool*, not the one actually being called. */
function providerOptions(model: string) {
  if (!supportsThinkingConfig(model)) return undefined;
  return { google: { thinkingConfig: { thinkingLevel: THINKING_LEVEL } } };
}

/**
 * The per-model half of a streamText() call, ready to spread into it.
 *
 * Exists because Gemma served through the Gemini API does not accept a
 * system_instruction, so the same prompt has to reach two models by two
 * different routes. For those models SYSTEM_PROMPT is prepended to the first
 * user turn instead.
 *
 * Not a synthetic `role: "system"` message: the Google provider maps that onto
 * system_instruction anyway (landing back on the rejected field), and a
 * provider that instead let it through would show the model an opening turn
 * from a third speaker in what is otherwise a two-party transcript. Folding the
 * text into the first user turn keeps the conversation shape the prompt was
 * written for.
 */
export function buildCallShape(
  limits: ModelLimits,
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[] = []
) {
  const messages = buildMessages(question, chunks, history);
  const common = {
    model: google(limits.id),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: providerOptions(limits.id),
  };
  if (limits.supportsSystemInstruction) {
    return { ...common, system: SYSTEM_PROMPT, messages };
  }
  // The first *user* turn, not messages[0]: with history in play the list can
  // open with either role, and the rules have to arrive before the model is
  // asked to follow them.
  const first = messages.findIndex((m) => m.role === "user");
  if (first >= 0) {
    messages[first] = {
      role: "user",
      content: `${SYSTEM_PROMPT}\n\n${messages[first].content as string}`,
    };
  }
  return { ...common, messages };
}

/** One line per model that failed, so the log shows the whole walk down the
 * pool rather than only its outcome. */
function logModelFailure(model: string, err: unknown): void {
  // 200 characters: enough for the status and the start of Google's message
  // (which names the limit that was hit), short enough that three of these do
  // not bury the retrieval log above them. Without this line there is no way to
  // tell a fallback that happened from one that never fired — the user sees the
  // same answer either way.
  console.error(
    `    !! model ${model} thất bại: ${errorText(err).slice(0, 200)}`
  );
}

/**
 * Yield answer text as it's generated, walking down the model pool until one
 * answers or the budget runs out.
 *
 * Per-call guards are unchanged from the single-model version, and still two of
 * them because they catch different failures: the abort signal handles a
 * request that never starts (while the SDK waits on the first byte the loop
 * below has not run once, so a wall-clock check inside it can never fire), and
 * the in-loop deadline handles a stream that starts and then trickles. Free-tier
 * latency for one question was measured (Python side) at 2s once and ~150s
 * another time, so a slow call and a dead one look identical from the client.
 *
 * The chain-level guard is new and independent: TOTAL_BUDGET_MS caps the whole
 * walk, because per-call ceilings multiply — three models timing out in
 * sequence is three times TIMEOUT_MS of blank screen.
 */
export async function* streamAnswer(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[] = [],
  opts: { pinnedModel?: string | null; onModel?: (m: string) => void } = {}
): AsyncGenerator<string> {
  const budgetEnd = Date.now() + TOTAL_BUDGET_MS;
  const estTokens = estimateTokens(question, chunks, history);

  let ranked = rankModels(estTokens);
  // Sticky moves the session's model to the front; it never shortens the list.
  // A session pinned to a model that has just run dry still has to reach the
  // others, so "stick to one model" and "only ever use one model" must not be
  // the same thing — the second one turns a busy minute into a failed answer.
  if (STICKY_SESSION && opts.pinnedModel) {
    const pinned = ranked.findIndex(
      (r) => r.limits.id === opts.pinnedModel && r.usage.load < 1
    );
    if (pinned > 0) ranked = [ranked[pinned], ...ranked.filter((_, i) => i !== pinned)];
  }

  let lastError: unknown;
  for (const { limits } of ranked) {
    const remaining = budgetEnd - Date.now();
    // A model that cannot be given a meaningful slice of time is not worth the
    // request: it would be aborted mid-first-token and cost the pool a booked
    // request for nothing.
    if (remaining <= 0) break;

    const perCall = Math.min(TIMEOUT_MS, remaining);
    const deadline = Date.now() + perCall;
    // Booked before the call, not after it — see record()'s note on concurrent
    // requests both reading an empty budget.
    record(limits.id, estTokens, "answer");

    // True from the instant the first token reaches the caller. Everything
    // after that point is unrecoverable by design: bytes already in the
    // browser's bubble cannot be taken back, so a mid-stream failure has to
    // surface as a failure. Switching models there would splice half a sentence
    // from one model onto half a sentence from another inside one answer.
    let committed = false;
    try {
      // Test-only: there is no convenient way to provoke a real 429, and a
      // fallback path that has never been exercised is a fallback path that
      // does not work. Off unless CHATBOT_FORCE_FAIL is set.
      if (process.env.CHATBOT_FORCE_FAIL?.split(",").includes(limits.id)) {
        throw Object.assign(new Error("RESOURCE_EXHAUSTED (forced)"), {
          statusCode: 429,
        });
      }

      const result = streamText({
        ...buildCallShape(limits, question, chunks, history),
        abortSignal: AbortSignal.timeout(perCall),
        // The SDK's default onError writes the whole error, stack and request
        // body included, straight to the console. Every failure here is already
        // logged by logModelFailure() in one line, and during a fallback there
        // are up to three of them; silencing the default keeps the log readable
        // and loses nothing, since the error itself is re-thrown below.
        onError: () => {},
      });

      // `result.stream`, not `result.textStream`: the text stream deliberately
      // does not surface error parts (SDK docs: "Error parts are not surfaced
      // in this stream"), so a 429 arrives there as a stream that simply ends
      // with no text. Iterating it would make every provider failure look like
      // an empty but successful answer — no fallback, and an empty bubble in
      // the widget. Errors have to be pulled off the full stream and thrown to
      // become failures again.
      for await (const part of result.stream) {
        if (part.type === "error") throw part.error;
        // An aborted call sometimes ends the stream with this part instead of
        // an error one — observed with a slow model and an abortSignal that
        // fired before the first token. Left unhandled the loop just ends, and
        // a call that ran out of time is indistinguishable from one that
        // answered with nothing: no fallback, no error, an empty bubble.
        if (part.type === "abort") {
          throw new AnswerTimeout(
            `Model không trả lời xong trong ${Math.round(perCall / 1000)} giây.`
          );
        }
        if (part.type !== "text-delta") continue;
        if (!committed) {
          committed = true;
          opts.onModel?.(limits.id);
        }
        yield part.text;
        if (Date.now() > deadline) {
          throw new AnswerTimeout(
            `Model không trả lời xong trong ${Math.round(perCall / 1000)} giây.`
          );
        }
      }

      if (!committed) {
        throw new EmptyAnswer(`Model ${limits.id} không trả về nội dung nào.`);
      }

      // The provider's own count, replacing the character-length estimate. Both
      // halves matter: TPM is charged on input plus output, and the input side
      // is the larger of the two for a RAG prompt.
      const usage = await result.usage;
      reconcile(
        limits.id,
        (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0)
      );
      return;
    } catch (err) {
      lastError = err;
      logModelFailure(limits.id, err);
      if (isQuotaError(err)) markExhausted(limits.id, retryDelayMs(err));
      if (committed) throw err;
      if (!shouldFallback(err)) throw err;
    }
  }

  // Ran out of models, or out of TOTAL_BUDGET_MS before reaching one. The
  // second case has no error of its own to report, so it gets a timeout —
  // which is what it is from the caller's side, and what friendlyError() will
  // render.
  throw (
    lastError ??
    new AnswerTimeout(
      `Không model nào trả lời trong ${Math.round(TOTAL_BUDGET_MS / 1000)} giây.`
    )
  );
}

/** Stand-in for streamAnswer() that never calls Gemini. Retrieval still runs
 * for real; the passages the model *would* have received are echoed back
 * verbatim, line by line, so the window the grounding actually reaches the
 * model is readable in the browser. Matches llm.py's MockAnswerer, including
 * its SHOW cap of 7 to mirror the retriever's default top_k. */
const MOCK_SHOW = 7;
export async function* mockStreamAnswer(
  chunks: RetrievalChunk[]
): AsyncGenerator<string> {
  const shown = chunks.slice(0, MOCK_SHOW);
  yield (
    `[CHẾ ĐỘ MOCK — không gọi LLM] Nội dung ${shown.length} đoạn gần ` +
    `nhất với câu hỏi, trên tổng ${chunks.length} đoạn truy hồi được:\n`
  );
  for (let i = 0; i < shown.length; i++) {
    const chunk = shown[i];
    const title = (chunk.title || "").trim() || "(không có tiêu đề)";
    const block =
      `\n${"─".repeat(60)}\n` +
      `[${i + 1}] score ${chunk.score.toFixed(4)} · ${chunk.collection} · ${chunk.chunk_id}\n` +
      `${title}\n${chunk.url}\n\n${chunk.raw}\n`;
    // Line by line rather than the whole block at once, so the mock stream
    // still exercises the SSE "delta" path the same shape a real answer
    // would. Same 10ms per line as MockAnswerer.stream(), and the same reason
    // it is per line and not per word: five full chunks streamed a word at a
    // time would take half a minute to finish drawing.
    for (const line of block.split(/(?<=\n)/)) {
      await new Promise((r) => setTimeout(r, 10));
      yield line;
    }
  }
}

/** Says which of the two likely failures happened, in the user's language.
 * The distinction matters: a timeout is worth retrying immediately, a quota
 * error is not — waiting is the only thing that helps. Port of llm.py's
 * friendly_error / main.py usage of it. */
export function friendlyError(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  // The abort signal surfaces as a DOMException named "TimeoutError" (or
  // "AbortError" once the SDK re-wraps it) whose message does not always
  // contain the word "timeout", so the name is checked too — otherwise a
  // request that hung before the first byte would be reported to the user as
  // an unnamed internal error instead of "thử hỏi lại".
  const errorName = err instanceof Error ? err.name : "";
  const isTimeout =
    err instanceof AnswerTimeout ||
    errorName === "TimeoutError" ||
    errorName === "AbortError" ||
    /timeout|aborted/i.test(text);
  if (isTimeout) {
    return (
      `Model không phản hồi trong ${Math.round(TIMEOUT_MS / 1000)} giây. ` +
      "Nguồn tham khảo ở trên vẫn đúng — thử hỏi lại."
    );
  }
  // Reached only after every model in the pool has been tried and refused, so
  // the message has to say that. The old wording ("đã chạm giới hạn") was
  // written when there was one model and would now understate the situation:
  // waiting is still the only cure, but there is no other model left to switch
  // to in the meantime.
  if (isQuotaError(err) || /429|RESOURCE_EXHAUSTED/.test(text)) {
    return (
      "Tất cả model đang tạm hết lượt của gói miễn phí. " +
      "Đợi khoảng một phút rồi hỏi lại."
    );
  }
  // Only reached when every model in the pool returned nothing, since one
  // empty answer just moves to the next model. Phrased as "thử hỏi lại" for the
  // same reason as the timeout above: it is transient, and the retrieved
  // sources shown alongside are still correct.
  if (err instanceof EmptyAnswer) {
    return "Model không trả về nội dung nào. Nguồn tham khảo ở trên vẫn đúng — thử hỏi lại.";
  }
  const name = err instanceof Error ? err.constructor.name : "Error";
  return `${name}: ${text.slice(0, 200)}`;
}

export function answerStream(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[],
  opts: { pinnedModel?: string | null; onModel?: (m: string) => void } = {}
): AsyncGenerator<string> {
  // Mock mode never reaches a model, so it reports none: onModel stays uncalled
  // and the caller's "which model answered" is null, which is the truth rather
  // than a model name nobody spoke to.
  return MOCK
    ? mockStreamAnswer(chunks)
    : streamAnswer(question, chunks, history, opts);
}
