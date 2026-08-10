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
  CHAT_MODEL,
  MAX_OUTPUT_TOKENS,
  MAX_POINTS,
  MOCK,
  THINKING_LEVEL,
  TIMEOUT_MS,
} from "./config";
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
export const SYSTEM_PROMPT = `\
Bạn là trợ lý BKFintech (Viện Công nghệ và Kinh tế số, ĐH Bách khoa Hà Nội). \
Chỉ dùng thông tin trong <data>. Không dùng kiến thức ngoài, không tra cứu \
ngoài, không suy luận thêm những gì văn bản không nói.
Văn phong — CHỈ áp dụng khi câu hỏi bằng tiếng Việt. Câu hỏi bằng tiếng Anh \
(hay ngôn ngữ khác) → trả lời HOÀN TOÀN bằng ngôn ngữ đó, bỏ cả ba gạch đầu \
dòng dưới đây: không "Dạ,", không xưng "mình", không gọi "bạn".
- Xưng "mình", gọi người dùng là "bạn";
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
kèm số nguồn xác nhận đối tượng. KHÔNG dùng câu "${NO_ANSWER}" cho trường hợp này.
- Trả lời thẳng vào vấn đề, không dẫn kiểu "Dựa vào văn bản/Theo thông tin cung cấp".
- Tối đa ${MAX_POINTS} gạch đầu dòng; câu đơn giản thì 1 ý là đủ.
- Không bịa ngày tháng, số liệu, tên người, giá tiền ngoài <data>.
- Trả lời đúng ngôn ngữ câu hỏi; nguồn khác ngôn ngữ thì dịch phần cần dùng, \
không đổi ngôn ngữ trả lời, không xin lỗi vì điều đó.
- Nguồn mâu thuẫn nhau → nêu cả hai, chỉ rõ khác biệt, không tự chọn một bên.
- Lượt hỏi-đáp trước chỉ dùng khi câu hỏi hiện tại phụ thuộc ngữ cảnh (đại từ, \
hỏi tiếp điều vừa nhắc). Chủ đề mới, độc lập → bỏ qua lượt trước.`;

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

/** What would be sent to the model, as a plain object — port of llm.py's
 * build_request(). Kept separate from the call itself for the same reason as
 * on the Python side: the prompt can be inspected without constructing SDK
 * objects or holding an API key. */
export function buildRequest(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[] = []
) {
  const config: Record<string, unknown> = {
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  };
  if (CHAT_MODEL.startsWith("gemini")) config.thinkingLevel = THINKING_LEVEL;
  return {
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: buildMessages(question, chunks, history),
    config,
  };
}

export class AnswerTimeout extends Error {}

/** Provider-specific options for one call — the AI SDK equivalent of
 * llm.py's build_config().
 *
 * Gated on the model name for the same reason the Python side gates it:
 * thinking is a Gemini-only feature and Gemma rejects the field outright, so
 * a deployment that switches CHATBOT_MODEL to a Gemma id must not send it.
 * Returning undefined rather than an empty object keeps that a no-op instead
 * of an empty `google: {}` block in the request. */
function providerOptions() {
  if (!CHAT_MODEL.startsWith("gemini")) return undefined;
  return { google: { thinkingConfig: { thinkingLevel: THINKING_LEVEL } } };
}

/** Yield answer text as it's generated, or give up at TIMEOUT_MS.
 *
 * Two guards, same as llm.py, because they catch different failures. The
 * abort signal handles a request that never starts — while the SDK is still
 * waiting on the first byte the loop below has not run once, so a wall-clock
 * check inside it can never fire. The deadline in the loop handles the
 * opposite case, a stream that starts and then trickles: on the free tier the
 * same question was measured (Python side) at 2s once and ~150s another time,
 * and from the client's side a slow call and a dead one look identical.
 * Both end the same way — stop yielding and throw.
 */
export async function* streamAnswer(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[] = []
): AsyncGenerator<string> {
  const deadline = Date.now() + TIMEOUT_MS;
  const result = streamText({
    model: google(CHAT_MODEL),
    system: SYSTEM_PROMPT,
    messages: buildMessages(question, chunks, history),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: providerOptions(),
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });

  for await (const delta of result.textStream) {
    yield delta;
    if (Date.now() > deadline) {
      throw new AnswerTimeout(
        `Model không trả lời xong trong ${Math.round(TIMEOUT_MS / 1000)} giây.`
      );
    }
  }
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
  if (/429|RESOURCE_EXHAUSTED/.test(text)) {
    return (
      "Đã chạm giới hạn câu hỏi mỗi phút của gói miễn phí. " +
      "Đợi khoảng một phút rồi hỏi lại."
    );
  }
  const name = err instanceof Error ? err.constructor.name : "Error";
  return `${name}: ${text.slice(0, 200)}`;
}

export function answerStream(
  question: string,
  chunks: RetrievalChunk[],
  history: ChatMessage[]
): AsyncGenerator<string> {
  return MOCK ? mockStreamAnswer(chunks) : streamAnswer(question, chunks, history);
}
