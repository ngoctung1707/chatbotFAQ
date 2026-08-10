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

// Gemini model id via @ai-sdk/google. gemini-3.1-flash-lite matches the
// Python default; override with GOOGLE_GENERATIVE_AI_API_KEY set in env
// (that's the var name @ai-sdk/google reads automatically).
export const CHAT_MODEL = process.env.CHATBOT_MODEL || "gemini-3.1-flash-lite";

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
