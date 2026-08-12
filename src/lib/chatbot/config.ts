/**
 * Central config — env-driven constants that were spread across
 * llm.py / retriever.py / translator.py in the Python version.
 * Kept in one file here since a JS/Next.js project has no equivalent of
 * "import time module-level constant" being cheap to scatter everywhere;
 * one source of truth is easier to keep in sync when porting.
 */

import path from "path";

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
// project: gemma-3-27b-it below answers 404 NOT_FOUND on the key this was
// developed against (that project has gemma-4-31b-it and gemma-4-26b-a4b-it
// instead), and a 404 entry is a silently wasted slot — the pool falls straight
// past it to the next model, so nothing but the log says the third choice never
// existed. Check against ListModels, and re-check supportsSystemInstruction
// while doing so: gemma-4-31b-it accepts a system_instruction through
// @ai-sdk/google, unlike the Gemma generation this flag was written for.
//
// The order is the fallback order at zero load: quality first (tier), not
// round-robin — see rankModels(). Gemma sits last because it is the only one
// that cannot take a system_instruction, so its answers go through a different
// prompt shape (see buildCallShape) and are the least like the ones the prompt
// was tuned against.
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
    id: "gemma-3-27b-it",
    rpm: 30,
    tpm: 15000,
    rpd: 14400,
    tier: 2,
    supportsSystemInstruction: false,
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
// load. Still exported and still honours CHATBOT_MODEL because buildRequest()
// and scripts/qa-test.ts report "the model" as a single name.
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

export const MAX_OUTPUT_TOKENS = 2048;

// Give up rather than leave the browser watching a stream that will never
// produce a token — same reasoning as llm.py's TIMEOUT_MS. Free-tier latency
// on this model was measured (Python side) anywhere from ~2s to ~150s for the
// same question, so a slow call and a dead one look identical from the
// client; only a hard deadline tells them apart.
export const TIMEOUT_MS = Number(process.env.CHATBOT_TIMEOUT_MS || 10000);

// Free-tier requests/minute for CHAT_MODEL — quoted only so the 429 message
// tells the user a number that matches their plan. Nothing here enforces it.
export const FREE_TIER_RPM = Number(process.env.CHATBOT_RPM || 15);

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
export const INDEX_DIR =
  process.env.CHATBOT_INDEX_DIR ||
  path.join(process.cwd(), "data", "faiss_index_js");

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

/** Model dựng lại câu hỏi. Rỗng = dùng model đứng đầu rankModels().
 * Đặt sang một model rẻ hơn model trả lời nếu muốn hai bước tiêu hai bucket
 * RPM khác nhau — mỗi câu hỏi giờ tốn 2 request, nên rpm 15 thực chất chỉ
 * còn ~7 câu/phút nếu cả hai bước dùng chung một model. */
export const REWRITE_MODEL = process.env.CHATBOT_REWRITE_MODEL || "";

/** Ngắn hơn TIMEOUT_MS rất nhiều vì đây là bước phụ trợ: quá hạn thì bỏ
 * rewrite và đi tiếp với câu gốc, chứ không phải chờ tiếp. 2s đủ cho một
 * call flash-lite sinh ≤64 token ở p95. */
export const REWRITE_TIMEOUT_MS = Number(
  process.env.CHATBOT_REWRITE_TIMEOUT_MS || 2000
);

/** Một truy vấn tìm kiếm dài nhất cũng chỉ vài chục token. Trần thấp là thứ
 * giữ cho call này rẻ và nhanh; sanitize() lo phần model vẫn cố nói dài. */
export const REWRITE_MAX_OUTPUT_TOKENS = 64;

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
// A follow-up like "Học phí bao nhiêu?" carries no term that says *which*
// course it is about, so embedding it verbatim retrieves nothing above
// DEFAULT_MIN_SCORE and the model is forced to answer NOT_UPDATED for
// information that *is* in the corpus. These knobs drive the fourth query
// variant that pastes the previous user question in front of it — see
// contextQuery.ts. JS-only; retriever.py has no equivalent.

// TẮT mặc định. Bật bằng CHATBOT_CONTEXT_MERGE=1.
//
// Ban đầu định bật mặc định. Đổi lại sau khi đo, và đo thì không ủng hộ:
//
//   - Không ca nào cải thiện được CÂU TRẢ LỜI. Ca tưởng là điển hình —
//     "cho tôi thông tin người thứ 2" sau một câu trả lời dạng danh sách —
//     vẫn trả lời đúng khi cổng chặn TỪ CHỐI ghép, vì thứ giải quyết nó là
//     history đi vào prompt qua buildMessages(), vốn đã có sẵn. Ca đó chưa
//     bao giờ là bài toán của truy hồi.
//   - Với đúng một câu follow-up thật ("Học phí bao nhiêu?" sau câu hỏi về
//     khóa học), hai chunk query ghép chèn vào là một trang tin workshop và
//     trang ban lãnh đạo — chiếm hai ô đầu, không cái nào là trang khóa học.
//   - 3/15 câu độc lập trong bộ CORE bị chiếm mất ô trong top-7, và một ca
//     production: sau "hoạt động của bkfintech vào 2026", câu "các khoá học."
//     bị ghép và các chunk sự kiện của lượt trước chiếm chỗ trang khóa học.
//
// Tiêu chí nghiệm thu đặt ra từ đầu là top-K phải KHÔNG đổi với mọi câu hỏi
// độc lập. Nó không đạt, và nguyên nhân không sửa được bằng cách siết cổng
// chặn: cổng chỉ nhìn độ dài, mà "các khoá học" (tự đủ nghĩa) và "Học phí bao
// nhiêu?" (mất chủ đề) là hai danh ngữ ngắn như nhau.
//
// Code, trần CONTEXT_MAX_HITS và bộ test (scripts/test-context-merge.ts) giữ
// nguyên: bài toán follow-up mất chủ đề là có thật, chỉ là nối chuỗi không
// giải được nó. Muốn thử lại thì bật cờ và chạy `--regression` trước.
export const CONTEXT_MERGE_ENABLED = ["1", "true"].includes(
  (process.env.CHATBOT_CONTEXT_MERGE || "").toLowerCase()
);

// Token count at or below which a question is treated as context-dependent.
// A guess, not a measurement: context-dependent follow-ups are nearly always
// short ("Học phí bao nhiêu?", "Khi nào khai giảng?", "Ở đâu?") while a
// question that opens a new topic has to name that topic and so runs longer.
// Re-check it against the length distribution of real logged follow-ups before
// treating the number as tuned.
//
// 6, not the 8 this was first written with, because the counter splits on
// /[\p{L}\p{N}]+/u and Vietnamese is written one syllable per space: "Viện có
// những phòng lab nghiên cứu nào?" is six words to a reader but eight tokens
// here, so 8 merged history into an obviously independent question. Roughly
// 1.5x inflation against what a person would call a word, so the ceiling has to
// sit that much lower. English questions count nearer to one token per word and
// are the reason this is not lower still ("How much?" must still pass).
export const CONTEXT_SHORT_QUESTION_WORDS = Number(
  process.env.CHATBOT_CONTEXT_WORDS || 6
);

// How much of the previous question is pasted in front of the current one.
// Capped because the merged text is embedded as one query: let the older turn
// grow without limit and it out-weighs the question actually being asked. 200
// chars comfortably holds a full question in either language, so in practice
// this only ever truncates something pathological.
export const CONTEXT_PREV_MAX_CHARS = 200;

// Multiplier applied to the dense score of hits found *only* by the merged
// query. 1.0 is a deliberate no-op: the knob exists so that if the merged query
// turns out to displace correct chunks after deploy, the fix is one env var
// rather than a logic change under time pressure.
//
// Not calibrated, but no longer entirely unmeasured. On the CORE suite with a
// prior turn forced into every question (scripts/test-context-merge.ts
// --regression), the questions whose top-7 moved were 3 at 1.0, 3 at 0.95, 2 at
// 0.9. So it does what it claims and 0.9 is where it starts to bite — but it
// does not close the gap on its own, because the leak it is damping is the
// gate admitting a short *independent* question, not the merged query scoring
// too high. Turn it down as a stopgap, tighten the gate as the fix.
export const CONTEXT_QUERY_WEIGHT = Number(
  process.env.CHATBOT_CONTEXT_WEIGHT || 1
);

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

// Bật/tắt việc dùng lại chunk của lượt trước. Khác với CONTEXT_MERGE_ENABLED
// (nối chuỗi, đã tắt vì đo cho thấy có hại): nhánh này không sinh query mới,
// không tốn embedding, và chỉ kích hoạt khi CẢ HAI điều kiện cùng đúng —
// câu hỏi có tham chiếu tường minh, VÀ truy hồi hiện tại yếu.
export const CONTEXT_FALLBACK_ENABLED = !["0", "false"].includes(
  (process.env.CHATBOT_CONTEXT_FALLBACK || "1").toLowerCase()
);

// Trần cứng: nhiều nhất bao nhiêu ứng viên được phép đến từ RIÊNG query ghép
// (chunk mà không query gốc nào tìm ra). Đây là lớp kiểm duyệt thứ hai, độc lập
// với cổng chặn, và cần thiết vì cổng chặn về nguyên tắc không thể chính xác:
// nó chỉ nhìn độ dài, mà "các khoá học" (tự đủ chủ đề) và "Học phí bao nhiêu?"
// (mất chủ đề) đều là danh ngữ ngắn — không tách được bằng độ dài.
//
// Quan sát thực tế đã thúc đẩy con số này: sau câu "hoạt động của bkfintech vào
// 2026", câu "các khoá học." bị ghép và top-7 bị các chunk sự kiện/tin tức của
// lượt trước chiếm chỗ của chính các trang khóa học. Không có trần thì một cổng
// chặn bắt nhầm sẽ định hình lại toàn bộ top-K; có trần thì thiệt hại luôn bị
// chặn ở đúng ngần này ô, dù cổng chặn sai đến đâu.
//
// Đặt 0 = tắt hẳn đóng góp của query ghép (vẫn tốn một lượt embedding), tức
// dùng CHATBOT_CONTEXT_MERGE=0 sẽ gọn hơn nếu muốn tắt hẳn tính năng.
export const CONTEXT_MAX_HITS = Number(
  process.env.CHATBOT_CONTEXT_MAX_HITS || 2
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
// anyway purely on "nay". Undiacriticised questions stay covered by
// CONTEXT_SHORT_QUESTION_WORDS, which does most of the work here regardless;
// this list only has to catch the long-but-dependent case.
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
