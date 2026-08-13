/**
 * Central config — env-driven constants that were spread across
 * llm.py / retriever.py / translator.py in the Python version.
 * Kept in one file here since a JS/Next.js project has no equivalent of
 * "import time module-level constant" being cheap to scatter everywhere;
 * one source of truth is easier to keep in sync when porting.
 */

// Reuses DATABASE_URI — the same connection string Payload already reads for
// its own MongoDB — instead of inventing a second Mongo config that could
// drift out of sync with it (same reasoning as chat_history.py on the Python
// side). MONGODB_URI is kept as a fallback only for anyone who still has it
// set from the standalone bkft-chatbot-js days.
export const MONGODB_URI =
  process.env.DATABASE_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/bkft";

// 6 messages = 3 Q&A pairs. Same cap as chat_history.py, same reasoning:
// enough for the model to resolve a pronoun back to the prior turn, not so
// much that an old unrelated question keeps steering new answers.
export const HISTORY_MAX_MESSAGES = 6;

// Session TTL, seconds — a backstop, not the delete path. The widget deletes
// its transcript on `pagehide` (see chatHistory.ts deleteSession), so this only
// has to catch sessions whose beacon never arrived: a browser killed mid-tab, a
// device that went offline, a crash.
//
// 1 hour rather than the 7 days chat_history.py used. That figure was chosen
// when expiry was the *only* thing that ever removed a session; it has no
// bearing on how long the data stays useful, which is one page load — the
// session id lives only in the widget's memory, so a reload can never reach an
// older session. Anything past that is retention nobody can read.
export const SESSION_TTL_SECONDS = Number(
  process.env.SESSION_TTL_SECONDS || 3600
);

// --- Model pool ---

export interface ModelLimits {
  id: string;
  rpm: number;
  tpm: number;
  rpd: number;
  /** Ưu tiên chất lượng, 0 = tốt nhất. Phá hòa khi nhiều model còn budget. */
  tier: number;
  /** Gemma phục vụ qua Gemini API KHÔNG nhận system_instruction. */
  supportsSystemInstruction: boolean;
}

// PLACEHOLDER QUOTAS — none of the rpm/tpm/rpd numbers below have been checked
// against this project's own quota page (AI Studio → Rate limits), and free-tier
// figures differ per project, per model version, and change without notice.
// Read the real numbers off that page and set CHATBOT_MODEL_POOL from them
// before trusting rateLimiter.ts to keep a deployment under its limit; until
// then the counters are only as right as these guesses, and BUDGET_HEADROOM is
// what stands between a wrong guess and a wall of 429s.
//
// The model *ids* need the same treatment. Which ones a key can call varies by
// project, and a 404 entry is a silently wasted slot — the pool falls straight
// past it to the next model, so nothing but the log says that choice never
// existed. The third slot was exactly that until now: it held gemma-3-27b-it,
// which answers 404 NOT_FOUND on the key this was developed against, and has
// been swapped for gemma-4-31b-it, which that project does serve. Check against
// ListModels before changing it again.
//
// The order is the fallback order at zero load: quality first (tier), not
// round-robin — see rankModels(). Gemma still sits last, but no longer for the
// reason it used to: gemma-4-31b-it DOES accept a system_instruction through
// @ai-sdk/google — unlike the generation supportsSystemInstruction was written
// for — so it now takes the same prompt shape as the Gemini entries and
// buildCallShape's second branch is currently unused by the default pool. What
// keeps it last is that it is the one model here the prompt was not tuned
// against, and that it spends over a thousand tokens on reasoning before its
// first character of text (see EmptyAnswer in llm.ts) — the entry most likely
// to hit TIMEOUT_MS with nothing to show for it.
const DEFAULT_MODEL_POOL: ModelLimits[] = [
  {
    id: "gemini-3.1-flash-lite",
    rpm: 15,
    tpm: 250000,
    rpd: 1000,
    tier: 0,
    supportsSystemInstruction: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    rpm: 15,
    tpm: 250000,
    rpd: 1000,
    tier: 1,
    supportsSystemInstruction: true,
  },
  {
    id: "gemma-4-31b-it",
    // Ba con số này được mang nguyên từ entry gemma-3-27b-it trước đó và CHƯA
    // đối chiếu với quota thật của gemma-4-31b-it — chúng chỉ là placeholder,
    // giống mọi hạn mức khác trong pool này (xem ghi chú ở trên). Đáng ngờ nhất
    // là tpm 15000: model này đốt hơn một nghìn token suy luận cho mỗi câu trả
    // lời, nên nếu hạn mức thật thấp hơn con số này thì rateLimiter sẽ tưởng
    // còn budget trong khi Google đã trả 429.
    rpm: 30,
    tpm: 15000,
    rpd: 14400,
    tier: 2,
    supportsSystemInstruction: true,
  },
];

/** Pool read from CHATBOT_MODEL_POOL (a JSON array of ModelLimits), or the
 * default above.
 *
 * Validated rather than trusted: this runs at module import, so a typo in a
 * deployment's env var would otherwise take the whole app down at boot — every
 * page, not just the chatbot — for a value only the chatbot reads. A pool that
 * does not parse is a misconfiguration worth shouting about in the logs, not
 * worth a blank site, so it falls back to the default and keeps serving. */
function parseModelPool(): ModelLimits[] {
  const raw = process.env.CHATBOT_MODEL_POOL;
  if (!raw || !raw.trim()) return DEFAULT_MODEL_POOL;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("phải là mảng JSON không rỗng");
    }
    return parsed.map((entry, i) => {
      const m = entry as Partial<ModelLimits>;
      // Each numeric field is a divisor in Usage.load; a missing or zero one
      // would make load Infinity or NaN and quietly park the model at the back
      // of every ranking, which looks exactly like "that model is always busy".
      if (!m || typeof m.id !== "string" || !m.id.trim()) {
        throw new Error(`phần tử ${i} thiếu "id"`);
      }
      for (const field of ["rpm", "tpm", "rpd"] as const) {
        if (typeof m[field] !== "number" || !(m[field] > 0)) {
          throw new Error(`model ${m.id}: "${field}" phải là số > 0`);
        }
      }
      return {
        id: m.id,
        rpm: m.rpm as number,
        tpm: m.tpm as number,
        rpd: m.rpd as number,
        // Tier defaults to pool position, so a pool listed best-first works
        // without spelling the field out.
        tier: typeof m.tier === "number" ? m.tier : i,
        // Defaults to true: only the Gemma family needs the false path, and a
        // model wrongly marked false still answers (the system prompt just
        // rides in the user turn) whereas one wrongly marked true gets its
        // request rejected outright.
        supportsSystemInstruction: m.supportsSystemInstruction !== false,
      };
    });
  } catch (err) {
    console.warn(
      `CHATBOT_MODEL_POOL không hợp lệ (${err instanceof Error ? err.message : err}) — dùng pool mặc định.`
    );
    return DEFAULT_MODEL_POOL;
  }
}

export const MODEL_POOL: ModelLimits[] = parseModelPool();

// Gemini model id via @ai-sdk/google. Now the *first* entry of MODEL_POOL
// rather than a standalone default — streamAnswer() picks per request out of
// the pool, so this is only what the pool would be asked for first at zero
// load. Còn được export và còn tôn trọng CHATBOT_MODEL vì scripts/qa-test.ts
// cần in ra "model" như một cái tên đơn lẻ trong báo cáo của nó. KHÔNG dùng nó
// cho một call thật — streamAnswer() chọn theo từng request từ pool, và
// buildCallShape() mới là chỗ dựng cấu hình cho đúng model được chọn.
export const CHAT_MODEL =
  process.env.CHATBOT_MODEL || MODEL_POOL[0]?.id || "gemini-3.1-flash-lite";

// Fraction of each published limit the local counters will actually spend.
// 0.8 because those counters and Google's disagree by construction: token
// counts here are estimated from character length (see estimateTokens), the
// minute windows start at different instants, and any second process sharing
// this API key is invisible from here. The 20% gap is what absorbs that drift
// — without it the first request the counters think is fine is routinely the
// one that comes back 429. Also the single knob for the multi-instance problem
// described in the README: N warm instances each believe they own the full
// quota, so ~1/N is the honest setting.
export const BUDGET_HEADROOM = Number(process.env.CHATBOT_BUDGET_HEADROOM || 0.8);

// Ceiling for the whole fallback chain, where TIMEOUT_MS is the ceiling for one
// call. Without it the two are multiplied: three models timing out in sequence
// at 10s each is 30s of a blank bubble, and the user has left long before the
// third one is asked. 25s keeps the worst case just under the point where a
// visitor assumes the widget is broken, while still leaving room for two full
// attempts plus a partial third.
export const TOTAL_BUDGET_MS = Number(
  process.env.CHATBOT_TOTAL_BUDGET_MS || 25000
);

// Keep a session on whichever model answered its first question. On by default:
// the models word things differently (and Gemma phrases the fixed refusals its
// own way — see isRefusal), so switching mid-conversation makes the assistant
// read like two people taking turns. Sticky yields to budget, never the other
// way round — a pinned model that is out of quota is skipped, not waited for.
export const STICKY_SESSION = !["0", "false"].includes(
  (process.env.CHATBOT_STICKY_SESSION || "1").toLowerCase()
);

// Thinking budget, same default and same reasoning as llm.py's THINKING_LEVEL:
// on gemini-3.5-flash-lite the same question took 2.0s at MINIMAL and 148.8s
// at LOW, for answers that differed only in word choice. Lowercased because
// @ai-sdk/google's thinkingConfig takes "minimal"|"low"|"medium"|"high" where
// google-genai took the uppercase enum name.
//
// Gemini-only, exactly as on the Python side — Gemma has no thinking mode and
// rejects the field outright, so llm.ts only attaches it when CHAT_MODEL is a
// Gemini model.
export const THINKING_LEVEL = (
  process.env.CHATBOT_THINKING || "minimal"
).toLowerCase() as "minimal" | "low" | "medium" | "high";

/**
 * Model này có nhận `thinkingConfig` không.
 *
 * KHÔNG còn là "chỉ Gemini", và đây là kết quả đo chứ không phải suy đoán: gọi
 * thẳng generativelanguage.googleapis.com, gemma-4-31b-it nhận field này (HTTP
 * 200) và TUÂN THEO nó — cùng một prompt cho thoughtsTokenCount 37 khi không
 * gửi, và 0 khi gửi thinkingLevel "minimal". Thế hệ Gemma mà quy tắc cũ được
 * viết cho (gemma-3 trở về trước) thì từ chối field, nên vẫn phải gate.
 *
 * Bỏ sót field này KHÔNG phải no-op vô hại: model bỏ qua trần suy luận và tiêu
 * hơn một nghìn token trước ký tự đầu tiên của câu trả lời (xem EmptyAnswer
 * trong llm.ts), nên entry Gemma trong pool sẽ hay chạm TIMEOUT_MS mà không sinh
 * được gì — đúng lúc nó được gọi tới, tức là lúc hai model trên đã hết budget.
 *
 * Sống ở config.ts vì cả llm.ts (call trả lời) và queryRewriter.ts (call viết
 * lại) đều cần đúng một quy tắc này. Trước đây mỗi file tự viết
 * `id.startsWith("gemini")` riêng, và hai bản sao của một luật thì chỉ cần sửa
 * một chỗ là lệch.
 */
export function supportsThinkingConfig(modelId: string): boolean {
  if (modelId.startsWith("gemini")) return true;
  const gemma = /^gemma-(\d+)/.exec(modelId);
  return gemma !== null && Number(gemma[1]) >= 4;
}

export const MAX_OUTPUT_TOKENS = 2048;

// Give up rather than leave the browser watching a stream that will never
// produce a token — same reasoning as llm.py's TIMEOUT_MS. Free-tier latency
// on this model was measured (Python side) anywhere from ~2s to ~150s for the
// same question, so a slow call and a dead one look identical from the
// client; only a hard deadline tells them apart.
export const TIMEOUT_MS = Number(process.env.CHATBOT_TIMEOUT_MS || 10000);

// Bullets the answer may use. Kept small on purpose: the failure mode of a
// grounded assistant is padding thin retrieval into a full-looking answer.
export const MAX_POINTS = Number(process.env.CHATBOT_MAX_POINTS || 5);

// Serve canned/mock output instead of calling Gemini, so the UI + retrieval
// can be exercised without an API key or token spend. Retrieval still runs
// for real (see llm.ts mockStream()).
export const MOCK = !["", "0", "false"].includes(
  (process.env.CHATBOT_MOCK || "").toLowerCase()
);

// --- Retrieval ---

// Where the JS-built vector index lives (see scripts/build-index.ts). Not the
// same directory as the Python faiss_index — different format, kept apart on
// purpose so the two pipelines can't silently clobber each other's output.
//
// Ghép chuỗi chứ KHÔNG dùng path.join, và đây không phải chuyện thẩm mỹ: file
// này bị kéo vào bundle EDGE qua instrumentation.ts -> instrumentation-node.ts
// -> embedding.ts. Bundler đi theo cả `await import()` nằm sau cổng chặn
// NEXT_RUNTIME (cổng đó là kiểm tra lúc CHẠY, không phải lúc build), nên một
// `import path from "path"` ở đây thành "Module not found: Can't resolve 'path'"
// trong bản dựng edge — và ở chế độ dev, một lỗi build còn treo khiến MỌI
// request trả 500 với body rỗng, kể cả route đã biên dịch xong.
// Node nhận dấu / trên Windows, nên chuỗi ghép tay chạy đúng ở cả hai hệ.
export const INDEX_DIR =
  process.env.CHATBOT_INDEX_DIR || `${process.cwd()}/data/faiss_index_js`;

// Cosine floor. Same value as retriever.py's DEFAULT_MIN_SCORE — re-measure
// on this corpus if the embedding model changes, since the number is tied to
// BGE-M3's score distribution, not a universal constant.
export const DEFAULT_MIN_SCORE = 0.35;

export const DEFAULT_MAX_PER_URL = 3;
export const DEFAULT_CANDIDATES = 20;
export const DEFAULT_TOP_K = Number(process.env.CHATBOT_TOP_K || 7);

export const DENSE_WEIGHT = Number(process.env.CHATBOT_DENSE_WEIGHT || 0.7);
export const SPARSE_WEIGHT = Number(process.env.CHATBOT_SPARSE_WEIGHT || 0.3);

// --- Query rewriting ---
//
// Một lần gọi LLM dựng lại câu hỏi thành truy vấn tiếng Anh độc lập, thay cho
// cặp expandSelfReference() + toEnglish() (opus-mt chạy local) trước đây. Xem
// queryRewriter.ts để biết vì sao đánh đổi này là net win cả về độ trễ lẫn RAM.

export const REWRITE_ENABLED = !["0", "false"].includes(
  (process.env.CHATBOT_REWRITE || "1").toLowerCase()
);

/**
 * Model dựng lại câu hỏi — GHIM CỐ ĐỊNH, không đi theo rankModels().
 *
 * Ghim vào gemma-4-31b-it chứ không để rỗng (nghĩa cũ: "lấy model đầu bảng"),
 * và lý do chính là tách bucket: mỗi câu hỏi tiêu HAI request, nên khi cả hai
 * bước dùng chung gemini-3.1-flash-lite thì rpm 15 thực chất chỉ còn ~7 câu mỗi
 * phút, và bước phụ trợ này ăn tranh quota của chính câu trả lời. Gemma nằm ở
 * bucket riêng với rpm cao hơn hẳn (30 so với 15) và tier thấp nhất, tức là
 * model mà câu trả lời ít cần tới nhất.
 *
 * Đánh đổi đã cân nhắc: gemma-4 là model duy nhất trong pool mà prompt không
 * được tinh chỉnh theo, nên chất lượng viết lại có thể kém hơn flash-lite. Chấp
 * nhận được vì rewriteQuery() không bao giờ ném lỗi — bản viết lại tệ chỉ làm
 * truy hồi kém đi một chút, còn parseRewrite() đã có sẵn hai lớp chặn (trần 300
 * ký tự cho dòng EN, kiểm tra chuỗi từ cho dòng VI).
 *
 * Vẫn đọc được từ CHATBOT_REWRITE_MODEL để đổi mà không cần deploy; đặt rỗng
 * tường minh (CHATBOT_REWRITE_MODEL=" ") KHÔNG trả về hành vi "đầu bảng" cũ —
 * xem pickRewriteModel(), giờ nó không thay model khác vào nữa.
 */
export const REWRITE_MODEL =
  process.env.CHATBOT_REWRITE_MODEL || "gemma-4-31b-it";

/**
 * Ngắn hơn TIMEOUT_MS rất nhiều vì đây là bước phụ trợ: quá hạn thì bỏ rewrite
 * và đi tiếp với câu gốc, chứ không phải chờ tiếp.
 *
 * 4s, không còn là 2s. Con số 2s được hiệu chỉnh cho flash-lite ("đủ cho một
 * call sinh ≤64 token ở p95") và không còn đúng sau khi REWRITE_MODEL ghim sang
 * gemma-4-31b-it. Đo 8 câu hỏi thật, gọi thẳng generateText để timeout không
 * cắt: min 1617ms, p50 1768ms, max 3566ms — output chỉ 18–26 token, nên đây
 * thuần là độ trễ chứ không phải model nói dài. Giữ 2s thì khoảng 1/4 số câu bị
 * cắt, tức ghim model xong mà một phần tư số lượt vẫn chạy bằng câu gốc.
 *
 * Cái giá của việc nới: thêm tối đa ~2s cho câu chậm nhất. Đáng, vì bỏ rewrite
 * không phải là hoà — nó có nghĩa là đem nguyên câu tiếng Việt đi nhúng, biến
 * thể truy hồi kém hơn hẳn. Vẫn thấp hơn nhiều TIMEOUT_MS=10000 của call trả
 * lời, nên trần chuỗi fallback không bị ảnh hưởng.
 *
 * n=8, đo từ một vị trí mạng duy nhất — mẫu nhỏ. Đo lại nếu đổi REWRITE_MODEL.
 */
export const REWRITE_TIMEOUT_MS = Number(
  process.env.CHATBOT_REWRITE_TIMEOUT_MS || 4000
);

/** Một truy vấn tìm kiếm dài nhất cũng chỉ vài chục token. Trần thấp là thứ
 * giữ cho call này rẻ và nhanh; parseRewrite() lo phần model vẫn cố nói dài.
 *
 * 128 chứ không phải 64: output giờ có HAI dòng — truy vấn tiếng Anh, và câu
 * hỏi đã khôi phục dấu tiếng Việt. Cắt cụt dòng thứ hai thì nó trượt bài kiểm
 * tra chuỗi từ trong parseRewrite() và bị bỏ, tức trả tiền cho token mà không
 * lấy được gì. */
export const REWRITE_MAX_OUTPUT_TOKENS = 128;

/** Số cặp hỏi-đáp cũ đưa vào prompt rewrite. Bằng HISTORY_MAX_MESSAGES/2, tức
 * đúng bằng những gì model trả lời cũng nhìn thấy — hai bước giải đại từ trên
 * cùng một lượng ngữ cảnh thì không lệch nhau được. */
export const REWRITE_HISTORY_PAIRS = 3;

/** Câu trả lời cũ bị cắt còn ngần này ký tự trong prompt rewrite. Để giải một
 * đại từ, model chỉ cần biết lượt trước nói VỀ CÁI GÌ — chỗ tiết kiệm token
 * lớn nhất của prompt này. */
export const REWRITE_ANSWER_SNIPPET_CHARS = 150;

// --- Câu hỏi phụ thuộc ngữ cảnh ---
//
// Câu hỏi trỏ ngược về lượt trước ("cho tôi thông tin người thứ 2") không tự
// nêu ra mình đang nói về ai, nên truy hồi của chính nó không neo được vào đâu.
// Các knob dưới đây điều khiển hai nhánh xử lý cho việc đó — chặn câu trỏ vào
// hư không, và dùng lại chunk của lượt trước — xem contextQuery.ts. JS-only;
// retriever.py không có gì tương ứng.
//
// Nhóm knob thứ ba (CONTEXT_MERGE_ENABLED, CONTEXT_SHORT_QUESTION_WORDS,
// CONTEXT_PREV_MAX_CHARS, CONTEXT_QUERY_WEIGHT, CONTEXT_MAX_HITS) đã bị xoá
// cùng với query ghép ngữ cảnh mà chúng phục vụ — đo được là có hại, tắt mặc
// định từ lâu, và queryRewriter.ts giải đúng bài toán đó tốt hơn.

// Từ chỉ thứ tự, dùng cùng CONTEXT_ANAPHORA để nhận ra tham chiếu TƯỜNG MINH
// (xem hasExplicitReference trong contextQuery.ts). Tách khỏi CONTEXT_ANAPHORA
// vì chúng khớp theo CẶP token ("thứ" + "hai") chứ không khớp một token đơn —
// "hai" đứng một mình chỉ là số đếm, không phải tham chiếu.
export const CONTEXT_ORDINAL_WORDS = [
  "nhất",
  "hai",
  "ba",
  "tư",
  "bốn",
  "năm",
  "sáu",
  "bảy",
];

// Tham chiếu thứ tự bằng tiếng Anh. Cần vì corpus song ngữ và SYSTEM_PROMPT
// yêu cầu trả lời đúng ngôn ngữ câu hỏi, nên "tell me about the second one" là
// câu hỏi hợp lệ hệt như "cho tôi thông tin người thứ 2" — mà bộ nhận diện
// tiếng Việt không thấy nó (không có token "thứ").
//
// Khớp token đơn chứ không khớp cặp như bên tiếng Việt: tiếng Anh không có cấu
// trúc "thứ + số", bản thân "second"/"third" đã mang nghĩa thứ tự. Rủi ro đổi
// lại: một câu độc lập kiểu "What is the first course you offer?" cũng khớp.
// Chấp nhận được vì điều kiện thứ hai — truy hồi phải YẾU — vẫn chặn: câu đó
// tự nêu chủ đề nên truy hồi của nó sẽ tốt. Cố tình BỎ "it"/"they"/"that":
// chúng quá phổ biến trong câu tiếng Anh bình thường.
export const CONTEXT_ORDINAL_WORDS_EN = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "last",
  "former",
  "latter",
];

// Dưới ngưỡng dense này thì coi như truy hồi KHÔNG neo được vào đâu, và mới
// được phép dùng lại chunk của lượt trước (xem route.ts). Đây là vế "kiểm
// duyệt": không đụng vào câu hỏi mà truy hồi vốn đã tốt.
//
// So `dense_score` (cosine thô) chứ KHÔNG so `score` — sau rerank, `score` đi
// qua rescale() min-max trên đúng tập ứng viên nên đỉnh luôn ≈ DENSE_WEIGHT
// bất kể câu hỏi tốt hay tệ; nó vô dụng làm thước đo tuyệt đối.
//
// Phân bố đo được (bộ CORE + 6 câu tham chiếu dựng tay):
//   - câu độc lập TRONG phạm vi : 0.7502 .. 0.8903
//   - câu chứa tham chiếu       : 0.6781 .. 0.7588
//   - câu độc lập NGOÀI phạm vi : 0.6535 .. 0.6932  (giá vàng, nấu phở)
//
// 0.77, không phải 0.74 như lần đặt đầu. Lý do: ngưỡng này chỉ được xét SAU
// KHI hasExplicitReference() đã đúng, nên phân bố cần tách không phải "mọi câu
// hỏi" mà là "câu hỏi có tham chiếu" — dải đó tối đa 0.7588. Đặt 0.74 cắt
// ngang chính dải cần phủ và bỏ sót phần trên của nó; đo được: 10/15 ở 0.74 so
// với 12/15 ở 0.77 trên scripts/history-cases.ts, đối chứng câu độc lập vẫn
// nguyên ở cả hai.
//
// Rủi ro còn lại: một câu VỪA tự đủ nghĩa VỪA chứa từ chỉ thứ tự ("Phòng lab
// đầu tiên của viện là gì?") sẽ bị dùng lại chunk nếu điểm của nó dưới 0.77.
// Loại câu đó thường đạt 0.83+ (xem dải trên) nên nằm ngoài, nhưng đây là chỗ
// hỏng trước tiên nếu con số này bị nới thêm.
export const CONTEXT_WEAK_DENSE = Number(
  process.env.CHATBOT_CONTEXT_WEAK_DENSE || 0.77
);

// Bật/tắt việc dùng lại chunk của lượt trước. Nhánh này không sinh query mới,
// không tốn embedding, và chỉ kích hoạt khi CẢ HAI điều kiện cùng đúng — câu
// hỏi có tham chiếu tường minh, VÀ truy hồi hiện tại yếu. Đó là khác biệt so
// với query ghép ngữ cảnh (đã xoá): cái kia đụng vào MỌI câu qua được cổng
// chặn, còn cái này chỉ đụng vào câu mà truy hồi vốn đã hỏng.
export const CONTEXT_FALLBACK_ENABLED = !["0", "false"].includes(
  (process.env.CHATBOT_CONTEXT_FALLBACK || "1").toLowerCase()
);

// Anaphora — words that point at something named in an earlier turn. Matched
// against whole tokens, never substrings ("đó" must not fire on "đóng").
//
// Diacritics-only, and every entry hand-checked, because a wrong entry here
// silently pollutes every query containing it — the same reason the old
// INSTITUTE_ALIASES list was kept short and hand-reviewed before the LLM
// rewrite step replaced it (see queryRewriter.ts). Undiacriticised spellings of
// the obvious candidates are all
// common words in something this corpus contains — "no"/"the"/"do" are English
// (nó/thế/đó) and half these pages are English.
//
// This list was first written with three bare-ASCII exceptions, "vay"/"day"/
// "nay", on the grounds that they collide with no English word. They were
// dropped: the check was run against the wrong language. Each one collides with
// a high-frequency word in *this* corpus's own domain — "vay" is to borrow
// (lãi suất cho vay, in a fintech corpus), "day" strips from "dạy" as in what a
// course teaches (and is an English word after all), and "nay" is half of "hôm
// nay". The regression run caught the last one live: "Giá vàng SJC hôm nay bao
// nhiêu một lượng?" is nine tokens, way over the length gate, and merged
// anyway purely on "nay". Undiacriticised questions are covered a layer
// earlier: diacritics.ts restores the accents before this list is consulted.
// Hai entry đã bị gỡ sau khi đối chiếu với bộ câu hỏi thật, và cả hai đều là
// đúng kiểu hỏng mà chú thích trên cảnh báo:
//   - "thế" nằm trong "như thế nào", một trong những cách hỏi phổ biến nhất
//     tiếng Việt. Nó làm "Cơ sở vật chất phục vụ học tập của Viện như thế
//     nào?" — câu hoàn toàn độc lập — bị coi là có tham chiếu.
//   - "chúng" hầu như luôn là "chúng tôi"/"chúng ta", tức ngôi thứ nhất, không
//     trỏ về lượt trước. Dạng trỏ ngược thật sự là "chúng nó", mà "nó" đã có.
// Nghĩa chỉ xuất của "thế" đã được "vậy" phủ, nên không mất gì.
export const CONTEXT_ANAPHORA = [
  "nó",
  "đó",
  "đấy",
  "này",
  "kia",
  "ấy",
  "vậy",
  "họ",
];

// --- Models (transformers.js / ONNX) ---

// Dense embedding model. Xenova/bge-m3 — the ONNX mirror of BAAI/bge-m3, same
// weights — because transformers.js v2 defaults to quantized:true and so asks
// for onnx/model_quantized.onnx, which the upstream BAAI repo does not publish
// (it ships only fp32 onnx/model.onnx + external data). Pointing at BAAI
// directly fails at load with "Could not locate file". Same reason the
// translation model below uses a Xenova mirror.
// ~560MB quantized — see README "Serverless caveats" before deploying to Vercel.
// NOTE: the index and query-time embeddings must come from the same model and
// quantization, or cosine scores are not comparable. Both go through
// embedding.ts, so changing this value means rebuilding the index
// (`pnpm build-index`) and re-checking DEFAULT_MIN_SCORE above.
//
// Đây giờ là model ONNX DUY NHẤT của tiến trình. Model dịch vi->en
// (Xenova/opus-mt-vi-en) đã bị gỡ — xem queryRewriter.ts.
export const EMBEDDING_MODEL_ID =
  process.env.CHATBOT_EMBEDDING_MODEL || "Xenova/bge-m3";
