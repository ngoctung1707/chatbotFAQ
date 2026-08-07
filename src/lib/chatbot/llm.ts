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
import { streamText, type ModelMessage } from "ai";
import { google } from "@ai-sdk/google";
import {
  CHAT_MODEL,
  MAX_OUTPUT_TOKENS,
  MAX_POINTS,
  MOCK,
  TIMEOUT_MS,
} from "./config";
import type { RetrievalChunk } from "./retriever";
import type { ChatMessage } from "./chatHistory";

// The exact string the model must return when the passages don't answer the
// question. Fixed and short so it can be detected downstream if needed, and
// so there's no room to soften a refusal into a guess.
export const NO_ANSWER =
  "Tôi chưa rõ câu hỏi của bạn, bạn có thể đặt ra câu hỏi chi tiết hơn được không ạ?";
export const NOT_UPDATED =
  "Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.";

export const SYSTEM_PROMPT = `\
Bạn là trợ lý BKFintech (Viện Công nghệ và Kinh tế số, ĐH Bách khoa Hà Nội). \
Chỉ dùng thông tin trong <data>. Không dùng kiến thức ngoài, không tra cứu \
ngoài, không suy luận thêm những gì văn bản không nói.

- <data> không đủ trả lời câu hỏi → trả lời đúng một câu, không gì khác: \
"${NOT_UPDATED}"
- nếu như bạn không hiểu câu hỏi của user hoặc phạm vi của câu hỏi quá rộng, hãy trả lời đúng một câu: "${NO_ANSWER}"
- <data> đúng đối tượng hỏi (khóa học, chương trình...) nhưng THIẾU chi tiết \
câu hỏi cần (chi phí, thời lượng, ngày khai giảng, năm thành lập...) → trả lời "${NOT_UPDATED}" \
kèm số nguồn xác nhận đối tượng. KHÔNG dùng câu "${NO_ANSWER}" cho trường hợp này.
- Trả lời thẳng vào vấn đề, không dẫn kiểu "Dựa vào văn bản/Theo thông tin cung cấp".
- Tối đa ${MAX_POINTS} gạch đầu dòng, mỗi ý một dòng; câu đơn giản thì 1 ý là đủ.
- Cuối mỗi ý ghi số nguồn: [1] hoặc [2][5].
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

export class AnswerTimeout extends Error {}

/** Yield answer text as it's generated, or give up at TIMEOUT_MS.
 *
 * Two guards, same as llm.py, because they catch different failures: the AI
 * SDK call itself can hang before the first byte (network/provider issue),
 * and a slow-but-live stream can trickle past the deadline — on the free
 * tier the same question was measured (Python side) at 2s once and ~150s
 * another time, and the slow case looks identical to a hang from the
 * client's side. Both are treated the same way here: stop yielding and throw.
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
    // would — same reasoning as MockAnswerer.stream()'s per-line sleep.
    for (const line of block.split(/(?<=\n)/)) {
      await new Promise((r) => setTimeout(r, 5));
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
  const isTimeout = err instanceof AnswerTimeout || /timeout/i.test(text);
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
