/**
 * Central config — env-driven constants that were spread across
 * llm.py / retriever.py / translator.py in the Python version.
 * Kept in one file here since a JS/Next.js project has no equivalent of
 * "import time module-level constant" being cheap to scatter everywhere;
 * one source of truth is easier to keep in sync when porting.
 */

// KHÔNG `import path from "path"` ở đây. File này nằm trong đồ thị bundle của
// instrumentation.ts (qua embedding.ts / translator.ts), mà Next biên dịch
// instrumentation cho CẢ edge runtime — nơi không có module "path" của Node.
// Lỗi không dừng ở instrumentation: nó làm hỏng luôn bản dịch của /api/chat và
// endpoint trả 500 "Module not found: Can't resolve 'path'". Đã dựng lại được
// trên HEAD nguyên bản nên đây là bug có sẵn, không phải hệ quả của thay đổi
// nào gần đây. Nối chuỗi thủ công là đủ: Node nhận dấu / trên cả Windows.
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
    // Đã đối chiếu ListModels trên key của dự án (2026-08-12): gemma-3-27b-it
    // KHÔNG tồn tại và trả 404 — đúng cảnh báo ở khối chú thích trên. Key này
    // có gemma-4-26b-a4b-it và gemma-4-31b-it. Một entry 404 là một suất bỏ
    // không: pool rơi thẳng qua nó sang model kế tiếp và chỉ dòng log nói rằng
    // lựa chọn thứ ba chưa bao giờ tồn tại.
    //
    // supportsSystemInstruction vẫn để false dù gemma-4 nhận được field đó:
    // nhánh false (gộp SYSTEM_PROMPT vào lượt user đầu — xem buildCallShape)
    // chạy đúng với mọi model, còn nhánh true thì không, nên nó là mặc định
    // an toàn hơn cho một entry chưa ai đo chất lượng câu trả lời.
    id: "gemma-4-31b-it",
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
// load. Still exported and still honours CHATBOT_MODEL because
// scripts/qa-test.ts reports "the model" as a single name.
export const CHAT_MODEL =
  process.env.CHATBOT_MODEL || MODEL_POOL[0]?.id || "gemini-3.1-flash-lite";

// --- Tiền xử lý câu hỏi bằng LLM (preprocessQuery trong llm.ts) ---

// Bật/tắt bước viết lại. Đây là knob duy nhất tắt được hẳn MỘT API call mỗi
// lượt hỏi có ngữ cảnh, nên nó phải tồn tại: khi quota căng, thà mất khả năng
// giải đại từ còn hơn mất luôn câu trả lời.
export const CONDENSE_ENABLED = !["0", "false"].includes(
  (process.env.CHATBOT_CONDENSE || "1").toLowerCase()
);

// Gemma chứ không phải Gemini, và không phải vì chất lượng. Viết lại câu hỏi là
// việc dễ — chép lại một câu và thay đại từ bằng danh từ đã có sẵn trong hội
// thoại — nên model yếu nhất pool cũng làm được. Cái quyết định là NGÂN SÁCH:
// Gemma ở rpm 30 / rpd 14400 so với 15 / 1000 của hai model Gemini, tức là bước
// này gần như không ăn vào hạn mức dành cho việc thực sự khó là sinh câu trả
// lời. Đặt nó lên Gemini thì mỗi lượt hỏi có ngữ cảnh sẽ tiêu HAI trong 1000
// request/ngày thay vì một.
//
// Cảnh báo giống hệt phần MODEL_POOL ở trên: id này chưa chắc tồn tại trên key
// của bạn. Sai id thì call trả 404, preprocessQuery() nuốt lỗi rồi trả null, và
// gốc — tức là tính năng im lặng không chạy, chỉ có dòng log nói ra. Đối chiếu
// ListModels rồi set CHATBOT_CONDENSE_MODEL nếu lệch.
export const CONDENSE_MODEL =
  process.env.CHATBOT_CONDENSE_MODEL ||
  MODEL_POOL.find((m) => /gemma/i.test(m.id))?.id ||
  MODEL_POOL[MODEL_POOL.length - 1]?.id ||
  "gemma-3-27b-it";

// Ngắn hơn hẳn TIMEOUT_MS (10s) vì call này nằm CHẶN TRƯỚC mọi thứ khác: người
// dùng chưa thấy một ký tự nào cho tới khi nó xong, rồi mới tới truy hồi và tới
// lượt sinh câu trả lời với ngân sách TOTAL_BUDGET_MS riêng của nó. Một câu hỏi
// viết lại chỉ dài vài chục token, nên 5s là rộng rãi; quá mốc đó thì gần như
// chắc chắn là call hỏng chứ không phải call chậm, và bỏ qua nó rẻ hơn nhiều so
// với cộng thêm 10s chờ vào trước mỗi câu trả lời.
export const CONDENSE_TIMEOUT_MS = Number(
  process.env.CHATBOT_CONDENSE_TIMEOUT_MS || 7000
);

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

// Same alias list as retriever.py — kept short and hand-reviewed rather than
// inferred, because a wrong entry here silently pollutes every query that
// contains it.
export const INSTITUTE_ALIASES = ["viện", "trường"];
export const INSTITUTE_FULL_NAME = "Viện Công nghệ và Kinh tế số BK Fintech";

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
export const EMBEDDING_MODEL_ID =
  process.env.CHATBOT_EMBEDDING_MODEL || "Xenova/bge-m3";

// vi->en translation. transformers.js needs an ONNX build; Xenova's mirror of
// Helsinki-NLP/opus-mt-vi-en is the closest match to the CTranslate2 model
// the Python side used. Swap via env if a different ONNX export is preferred.
export const TRANSLATE_MODEL_ID =
  process.env.CHATBOT_TRANSLATE_MODEL || "Xenova/opus-mt-vi-en";

export const TRANSLATE_ENABLED = !["0", "false"].includes(
  (process.env.CHATBOT_TRANSLATE || "1").toLowerCase()
);

// Beam width for the vi->en query translation. 2 rather than the model's own
// (wider) default, same as translator.py's BEAM_SIZE: measured identical
// output on the questions that matter, and it finishes sooner.
export const TRANSLATE_BEAM = Number(process.env.CHATBOT_TRANSLATE_BEAM || 2);
