/**
 * Dựng lại câu hỏi của người dùng thành MỘT truy vấn tiếng Anh độc lập, bằng
 * một lần gọi LLM, trước khi đem đi nhúng.
 *
 * Thay cho hai cơ chế rời rạc trước đây — expandSelfReference() (nối tên đầy đủ
 * của viện vào câu hỏi thấy alias "viện"/"trường") và toEnglish() (opus-mt-vi-en
 * chạy local qua ONNX Runtime). Ba lý do, đo được cả ba:
 *
 *   - Độ trễ. Hai lần chạy Marian trên một câu hỏi thật tốn ~20s trước khi model
 *     trả lời bắt đầu sinh token. Một call flash-lite sinh ≤64 token tốn
 *     ~0.5–1.5s, và ở cold start nó nằm trọn trong bóng của ~5s nạp BGE-M3.
 *   - RAM. opus-mt là nguồn tiêu thụ RAM chính ở độ dài câu hỏi thực tế, và
 *     arena của ONNX Runtime chỉ nở chứ không co — một câu hỏi dài nâng mức nền
 *     của tiến trình lên vĩnh viễn.
 *   - Chất lượng. Model MT phổ thông dịch sai thuật ngữ domain ("viện" ->
 *     "hospital", "viện trưởng" -> "the Chief"), và không xử lý được hai ca mà
 *     kiến trúc cũ bỏ trắng: câu hỏi gõ không dấu, và câu hỏi phụ thuộc ngữ
 *     cảnh ("còn học phí thì sao?") vốn cần history mới giải được đại từ.
 *
 * Model nhúng KHÔNG đổi (vẫn Xenova/bge-m3), nên index không cần dựng lại.
 */
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { ChatMessage } from "./chatHistory";
import {
  MOCK,
  REWRITE_ANSWER_SNIPPET_CHARS,
  REWRITE_ENABLED,
  REWRITE_HISTORY_PAIRS,
  REWRITE_MAX_LOAD,
  REWRITE_MAX_OUTPUT_TOKENS,
  REWRITE_MODEL,
  REWRITE_TIMEOUT_MS,
  supportsThinkingConfig,
  type ModelLimits,
} from "./config";
import { stripDiacritics } from "./diacritics";
import { errorText, isQuotaError, retryDelayMs } from "./llm";
import { markExhausted, rankModels, reconcile, record } from "./rateLimiter";

// ───────────────────────── Nhận diện tiếng Việt ─────────────────────────
//
// Chuyển nguyên từ translator.ts. Vai trò đổi: nó không còn quyết định "có dịch
// không" mà là "có cần viết lại không" — nên tên hàm cũng đổi theo.

// Characters that exist in Vietnamese and in almost nothing else written here.
const VIETNAMESE_CHARS =
  /[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụỳýỷỹỵ]/;

// Fallback for questions typed without diacritics ("khoa hoc nao phu hop").
// Same short, high-frequency Vietnamese function-word list as translator.py.
const VIETNAMESE_WORDS = new Set([
  "la", "cua", "co", "nao", "gi", "ai", "bao", "nhieu", "nhung", "va", "cho",
  "voi", "khi", "dau", "the", "khong", "duoc", "cac", "mot", "tai", "ve",
  "hoc", "vien", "trong", "lam", "sao", "tim", "muon", "hay", "phai",
]);

export function looksVietnamese(text: string): boolean {
  if (VIETNAMESE_CHARS.test(text)) return true;
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  // Two hits, not one: "the" and "la" both appear in English sentences, so a
  // single match would send English questions off to be translated.
  return words.filter((w) => VIETNAMESE_WORDS.has(w)).length >= 2;
}

// ───────────────────────────── Prompt ─────────────────────────────

/**
 * Chỉ dẫn cho model viết lại. Cố ý viết bằng tiếng Anh: đầu ra cần là tiếng
 * Anh, và chỉ dẫn cùng ngôn ngữ với đầu ra cho kết quả ổn định hơn.
 *
 * Bảng thuật ngữ ở giữa chính là thứ thay cho INSTITUTE_ALIASES: nó nằm ở phần
 * prompt ổn định (provider cache được), không tốn token output, và diễn đạt
 * được sắc thái mà một danh sách alias không diễn đạt nổi — "viện" là BKFintech
 * chứ không phải bệnh viện, "viện trưởng" là một chức danh chứ không phải
 * "the Chief".
 */
export const REWRITE_SYSTEM_PROMPT = `\
Rewrite the user's latest message as ONE standalone English search query for a
vector search over the BKFintech website (Viện Công nghệ và Kinh tế số,
Institute of Technology and Digital Economy, Hanoi University of Science and
Technology).

- Resolve pronouns and ellipsis using the history. The output must still make
  sense with the history deleted.
- Input may be Vietnamese with or without diacritics, or misspelled. Fix it,
  then translate.
- Keep proper nouns, acronyms, course codes, dates and numbers verbatim.
- Terms: viện / trường / nhà trường -> BKFintech Institute. viện trưởng ->
  institute director/ dean / Nguyen Binh Minh/ Nguyễn Bình Minh. bộ môn -> department. đề tài -> research project.
  học phần -> course. câu lạc bộ bkfintech -> Fintech club (doesn't include "bk"). câu lạc bộ -> club.
- If the latest message starts a new topic, ignore the history entirely.


Output exactly one or two lines, nothing else. No quotes, no explanation.
EN: the standalone search query, in English, at most 25 words.
VI: the user's latest message rewritten with correct Vietnamese diacritics —
    the SAME words in the SAME order, only spelling fixed. Do not translate it,
    do not rephrase it, do not resolve pronouns on this line. Omit this line
    entirely if the latest message is not Vietnamese.`;

/**
 * Lượt user duy nhất gửi lên: history đã cắt gọn, rồi câu hỏi hiện tại.
 *
 * Câu trả lời cũ bị cắt còn REWRITE_ANSWER_SNIPPET_CHARS ký tự — đây là chỗ
 * tiết kiệm token lớn nhất. Để giải một đại từ, model chỉ cần biết lượt trước
 * nói VỀ CÁI GÌ, không cần cả năm gạch đầu dòng của nó. Câu hỏi cũ giữ nguyên
 * vì đã bị chặn ở MAX_QUESTION_CHARS từ trước.
 */
function historyForPrompt(history: ChatMessage[]): ChatMessage[] {
  return history.slice(-REWRITE_HISTORY_PAIRS * 2).map((msg) =>
    msg.role === "assistant" && msg.content.length > REWRITE_ANSWER_SNIPPET_CHARS
      ? {
          ...msg,
          content: msg.content.slice(0, REWRITE_ANSWER_SNIPPET_CHARS) + "…",
        }
      : msg
  );
}

function buildRewriteInput(question: string, history: ChatMessage[]): string {
  const recent = historyForPrompt(history);
  // History rỗng thì bỏ hẳn khối [history]: một nhãn trống chỉ mời model đi tìm
  // ngữ cảnh không tồn tại.
  if (recent.length === 0) return `[now]\nU: ${question}`;
  const lines = recent.map(
    (msg) => `${msg.role === "assistant" ? "A" : "U"}: ${msg.content}`
  );
  return `[history]\n${lines.join("\n")}\n\n[now]\nU: ${question}`;
}

// ───────────────────────────── Cache ─────────────────────────────

// LRU thô, giống hệt cách translator.ts làm. Đây là lưới an toàn thứ hai cho
// bug gọi hai lần; lưới thứ nhất là việc retriever.ts chỉ còn một đường dựng
// query (search() trả luôn query đã dùng, không còn queryFor() dựng lại).
const cache = new Map<string, RewriteResult>();
const CACHE_MAX = 256;

/** Khoá phải gồm cả history, vì cùng một câu hỏi với history khác nhau cho ra
 * query khác nhau. Dùng đúng chuỗi history ĐÃ CẮT GỌN chứ không phải history
 * thô: hai câu trả lời dài khác nhau ở phần đuôi bị cắt về cùng một đoạn 150 ký
 * tự sẽ tạo ra cùng một prompt, và hai khoá cho một prompt là một lần miss
 * cache không có lý do. */
function cacheKey(question: string, history: ChatMessage[]): string {
  return [
    question.trim(),
    ...historyForPrompt(history).map((m) => `${m.role}:${m.content}`),
  ].join("\n");
}

function remember(key: string, value: RewriteResult): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

// ──────────────────────────── Gọi model ────────────────────────────

/**
 * Ước lượng token cho MỘT call rewrite.
 *
 * Cố ý không dùng estimateTokens() của llm.ts: hàm đó cộng MAX_OUTPUT_TOKENS
 * (2048) vì nó tính cho một câu trả lời đầy đủ. Dùng nó ở đây sẽ book thừa TPM
 * khoảng 30 lần cho một call chỉ được phép sinh 64 token, và làm pool tưởng
 * mình đã cạn quota trong khi thực tế còn nguyên.
 */
function estimateRewriteTokens(input: string): number {
  return (
    Math.ceil((REWRITE_SYSTEM_PROMPT.length + input.length) / 3) +
    REWRITE_MAX_OUTPUT_TOKENS
  );
}

/**
 * Model cho bước rewrite, hoặc null nếu không nên gọi.
 *
 * MỘT model duy nhất — REWRITE_MODEL — chứ không phải "ưu tiên nó rồi lùi về
 * đầu bảng". Trước đây có nhánh lùi đó, và nó vô hiệu hoá chính mục đích của
 * việc ghim: đúng lúc model ghim hết budget là lúc bước rewrite tràn sang
 * bucket của câu trả lời, tức là lúc nó gây hại nhất. Ghim mà lùi được thì
 * không phải ghim.
 *
 * Một lần thử duy nhất, KHÔNG có vòng fallback như streamAnswer(). Khác biệt
 * then chốt: ở đó "nothing is ever dropped from the list" là đúng vì đó là call
 * bắt buộc — không có nó thì không có câu trả lời. Ở đây, khi model ghim cạn
 * budget thì lượt request phải để dành cho CÂU TRẢ LỜI, không phải cho bước phụ
 * trợ này. Nên hết budget là bỏ rewrite, không tiêu nốt lượt cuối.
 *
 * Ngưỡng nhường là REWRITE_MAX_LOAD chứ không phải "cạn hẳn", và đó là thay đổi
 * quan trọng nhất ở đây: từ khi pool rút còn hai model, gemma vừa là bể rewrite
 * vừa là fallback DUY NHẤT cho câu trả lời. Nhường ở mốc load = 1 nghĩa là chỉ
 * dừng lại khi đã vét sạch — quá muộn, vì lúc đó fallback cũng không còn gì để
 * tiêu. Xem REWRITE_MAX_LOAD trong config.ts.
 *
 * Trả null khi REWRITE_MODEL không có trong MODEL_POOL. Bỏ rewrite ở đây là
 * đúng: nó best-effort theo thiết kế, và không có ModelLimits thì cũng không có
 * hạn mức nào để rateLimiter đếm.
 *
 * Mọi nhánh trả null đều LOG một dòng. Trước đây chúng im lặng tuyệt đối, nên
 * "rewrite biến mất khi tải cao" — chính xác là triệu chứng REWRITE_MAX_LOAD
 * gây ra nhiều hơn — là thứ không quan sát được từ log.
 */
function pickRewriteModel(estTokens: number): ModelLimits | null {
  const pinned = rankModels(estTokens).find(
    (r) => r.limits.id === REWRITE_MODEL
  );
  if (!pinned) {
    console.log(
      `    → bỏ rewrite: ${REWRITE_MODEL} không có trong MODEL_POOL — dùng câu gốc`
    );
    return null;
  }
  if (pinned.usage.cooldownMs > 0) {
    console.log(
      `    → bỏ rewrite: ${REWRITE_MODEL} đang cooldown ` +
        `${Math.ceil(pinned.usage.cooldownMs / 1000)}s — dùng câu gốc`
    );
    return null;
  }
  // REWRITE_MAX_LOAD, KHÔNG phải 1: bể này chia chung với câu trả lời fallback,
  // và hai bên hỏng không đối xứng — bỏ rewrite thì người dùng vẫn có câu trả
  // lời, mất fallback thì họ nhận thông báo lỗi. Xem REWRITE_MAX_LOAD trong
  // config.ts để biết tỷ giá (1 câu fallback ≈ 7,5 lượt rewrite).
  if (pinned.usage.load >= REWRITE_MAX_LOAD) {
    console.log(
      `    → bỏ rewrite: ${REWRITE_MODEL} đã tiêu ` +
        `${(pinned.usage.load * 100).toFixed(0)}% ngân sách ` +
        `(trần rewrite ${(REWRITE_MAX_LOAD * 100).toFixed(0)}%, ` +
        `để dành cho câu trả lời) — dùng câu gốc`
    );
    return null;
  }
  return pinned.limits;
}

export interface RewriteResult {
  /** Truy vấn tiếng Anh độc lập, hoặc chính câu hỏi nếu bỏ qua/thất bại. */
  english: string;
  /** Câu hỏi với dấu tiếng Việt đã sửa, hoặc null nếu model không trả dòng đó
   * (câu không phải tiếng Việt) hoặc dòng đó không qua được kiểm tra. Người gọi
   * lùi về restoreQuestion() của diacritics.ts khi null. */
  vietnamese: string | null;
}

/** Gọt một dòng truy vấn: bỏ nhãn thừa, bỏ nháy bao ngoài. */
function clean(line: string): string {
  return (line || "")
    .trim()
    .replace(/^(search\s+)?query\s*:\s*/i, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

/** Chuỗi từ đã bỏ dấu, bỏ hoa/thường và dấu câu — dùng để so "có phải cùng
 * những chữ đó, cùng thứ tự đó" mà không quan tâm phần dấu đang được sửa. */
function wordSkeleton(text: string): string {
  return (stripDiacritics(text).toLowerCase().match(/[a-z0-9]+/g) ?? []).join(" ");
}

/**
 * Tách hai dòng EN/VI từ output của model.
 *
 * Dòng VI bị KIỂM TRA chứ không tin: chỉ nhận khi bỏ dấu đi thì nó trùng khít
 * chuỗi từ của câu hỏi gốc. Đây là chỗ chặn đúng thứ đắt nhất có thể xảy ra —
 * model "tiện tay" dịch, diễn đạt lại, hoặc giải đại từ ngay trên dòng đó, và
 * ta đem thứ đó đi nhúng như thể nó là câu người dùng vừa gõ. Không qua được
 * thì trả null và người gọi lùi về Viterbi, tức đúng hành vi trước đây.
 *
 * Kiểm tra này chặt hơn mức cần thiết ở vài ca vô hại ("BK Fintech" ->
 * "BKFintech" bị loại vì chuỗi từ đổi), và như vậy là đúng hướng: cái giá của
 * việc loại nhầm là quay về Viterbi, còn cái giá của việc nhận nhầm là một
 * truy vấn tiếng Việt bịa ra.
 */
function parseRewrite(raw: string, question: string): RewriteResult {
  const lines = (raw || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let english = "";
  let vietnamese: string | null = null;
  for (const line of lines) {
    const en = /^EN\s*[:-]\s*(.+)$/i.exec(line);
    if (en && !english) {
      english = clean(en[1]);
      continue;
    }
    const vi = /^VI\s*[:-]\s*(.+)$/i.exec(line);
    if (vi && vietnamese === null) vietnamese = clean(vi[1]);
  }

  // Model bỏ nhãn hẳn: coi dòng đầu là truy vấn tiếng Anh, đúng như hợp đồng
  // một dòng trước đây. Rẻ hơn nhiều so với vứt cả câu trả lời đi.
  if (!english && lines.length > 0) english = clean(lines[0]);

  // Trần 300 ký tự: prompt yêu cầu ≤25 từ, nên dài hơn thế là dấu hiệu model đã
  // đi giải thích thay vì trả query — câu gốc an toàn hơn một đoạn văn lạc đề.
  if (!english || english.length > 300) english = question;

  if (vietnamese && wordSkeleton(vietnamese) !== wordSkeleton(question)) {
    vietnamese = null;
  }

  return { english, vietnamese };
}

/**
 * Truy vấn tiếng Anh độc lập cho câu hỏi này, hoặc chính câu hỏi nếu bỏ qua.
 *
 * KHÔNG BAO GIỜ ném lỗi. Mọi thất bại (timeout, 429, thiếu API key, output rác)
 * đều trả về câu gốc: rewrite hỏng chỉ làm truy hồi kém đi một chút, còn ném lỗi
 * ra ngoài sẽ làm hỏng cả câu trả lời vì một bước phụ trợ.
 */
export async function rewriteQuery(
  question: string,
  history: ChatMessage[] = []
): Promise<RewriteResult> {
  const skip: RewriteResult = { english: question, vietnamese: null };

  if (!REWRITE_ENABLED) return skip;
  // MOCK tồn tại để chạy được UI + truy hồi mà không tốn API key hay token;
  // rewrite cũng là một call thật, nên nó phải nằm trong phạm vi của công tắc đó.
  if (MOCK) return skip;
  if (!question.trim()) return skip;
  // Lượt đầu + đã là tiếng Anh: không có đại từ nào để giải, không có gì để
  // dịch, không có dấu nào để khôi phục. Có history thì LUÔN gọi, kể cả câu
  // tiếng Anh — lúc đó việc cần làm là giải đại từ. Cố ý không viết heuristic
  // đoán "câu này có phụ thuộc ngữ cảnh không": đó đúng là việc đang trả tiền
  // cho LLM làm.
  if (history.length === 0 && !looksVietnamese(question)) return skip;

  const key = cacheKey(question, history);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const input = buildRewriteInput(question, history);
  const estTokens = estimateRewriteTokens(input);
  const limits = pickRewriteModel(estTokens);
  if (!limits) return skip;

  // system + prompt là một lượt user duy nhất. Gemma qua Gemini API không nhận
  // system_instruction, nên với những model đó chỉ dẫn được gộp thẳng vào lượt
  // user — cùng cách buildCallShape() trong llm.ts xử lý, nhưng ở đây chỉ có
  // một message nên không đáng để generalize hàm kia cho cả hai chỗ.
  const shape = limits.supportsSystemInstruction
    ? { system: REWRITE_SYSTEM_PROMPT, prompt: input }
    : { prompt: `${REWRITE_SYSTEM_PROMPT}\n\n${input}` };

  const started = Date.now();
  // Book trước khi gọi, không phải sau — cùng lý do như record() trong
  // streamAnswer(). Bỏ bước này thì counter nói dối đúng một nửa: mỗi câu hỏi
  // giờ tốn 2 request chứ không phải 1.
  record(limits.id, estTokens, "rewrite");
  try {
    const result = await generateText({
      model: google(limits.id),
      maxOutputTokens: REWRITE_MAX_OUTPUT_TOKENS,
      // "minimal" cứng, KHÔNG đọc THINKING_LEVEL từ config: viết lại một câu
      // hỏi không cần suy luận, mà mức thinking lại là biến số ảnh hưởng độ trễ
      // lớn nhất của call này (đo bên llm.py: 2.0s ở MINIMAL so với 148.8s ở
      // LOW cho cùng một câu).
      //
      // Cùng một cổng gate với llm.ts, xem supportsThinkingConfig(). Ở call này
      // nó còn quan trọng hơn: REWRITE_MAX_OUTPUT_TOKENS chỉ có 128, nên một
      // model tiêu vài chục tới vài trăm token cho suy luận sẽ hết sạch trần
      // trước khi kịp in ra dòng EN — và một rewrite rỗng thì parseRewrite() lùi
      // về câu gốc, tức trả tiền cho một call không thu lại gì.
      providerOptions: supportsThinkingConfig(limits.id)
        ? { google: { thinkingConfig: { thinkingLevel: "minimal" } } }
        : undefined,
      // Ngắn hơn TIMEOUT_MS rất nhiều vì đây là bước phụ trợ: quá hạn thì bỏ
      // rewrite và đi tiếp với câu gốc, chứ không phải chờ tiếp.
      abortSignal: AbortSignal.timeout(REWRITE_TIMEOUT_MS),
      // Không thử lại, và đây KHÔNG phải mặc định — AI SDK tự retry 2 lần kèm
      // backoff. Đo được: một call gặp lỗi tạm thời mất 7486ms dù abortSignal
      // đặt ở 2000ms, vì signal cắt được lượt gọi chứ không cắt được vòng
      // retry bọc ngoài nó. Cả trần thời gian lẫn lập luận "hết budget thì để
      // dành lượt cuối cho câu trả lời" đều vô nghĩa nếu một lần rewrite có
      // thể âm thầm tiêu ba lượt request và bảy giây.
      maxRetries: 0,
      ...shape,
    });

    const usage = await result.usage;
    reconcile(limits.id, (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0));

    const rewritten = parseRewrite(result.text, question);
    remember(key, rewritten);
    console.log(
      `    → rewrite (${limits.id}, ${Date.now() - started}ms): ` +
        `"${question}" -> "${rewritten.english}"` +
        (rewritten.vietnamese ? `\n      dấu: "${rewritten.vietnamese}"` : "")
    );
    return rewritten;
  } catch (err) {
    // 429 vẫn phải báo cho rate limiter, dù ta không thử model khác: lần gọi
    // TIẾP THEO — kể cả call trả lời của chính request này — cần biết model đó
    // đang trong cooldown.
    if (isQuotaError(err)) markExhausted(limits.id, retryDelayMs(err));
    // Log ngắn, không stack trace: đây là bước có thể hỏng mà không ai mất gì,
    // nên nó không đáng chiếm chỗ của log truy hồi ngay bên dưới.
    console.error(
      `    !! rewrite thất bại (${limits.id}): ` +
        `${errorText(err).slice(0, 120)} — dùng câu gốc`
    );
    return skip;
  }
}
