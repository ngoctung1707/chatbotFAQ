/**
 * Translate a Vietnamese question into English before it is embedded.
 *
 * Port of translator.py. The reasoning for *why* this exists is unchanged:
 * the corpus (solutions, labs, staff, academic, home pages) is written in
 * English while questions arrive in Vietnamese, and searching English
 * passages with an English-translated query beats relying on the embedding
 * model's cross-lingual alignment alone.
 *
 * Runs locally via transformers.js (ONNX Runtime), not through an API — same
 * motivation as the Python side using a local CTranslate2 model instead of a
 * hosted translation API: this shouldn't spend a request from Gemini's
 * free-tier RPM budget just to translate a query.
 *
 * Only the *search* text is translated. The original question still goes to
 * the answering model, so the reply comes back in the language it was asked.
 *
 * Caveat vs. the Python version: this uses a different underlying export
 * (ONNX via Xenova/opus-mt-vi-en) than the CTranslate2 int8 model the Python
 * side used, so exact mistranslations may differ from the three documented
 * in translator.py. The pattern that matters — that this model *will* get
 * some domain terms wrong — should be assumed to still hold; retriever.ts
 * keeps the same "search with both the original and the translation" guard
 * for that reason, not just for parity.
 */
import { pipeline, type TranslationPipeline } from "@xenova/transformers";
import { TRANSLATE_BEAM, TRANSLATE_ENABLED, TRANSLATE_MODEL_ID } from "./config";

const SPECIAL = new Set(["</s>", "<pad>", "<unk>", "<s>"]);

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

export function isVietnamese(text: string): boolean {
  if (VIETNAMESE_CHARS.test(text)) return true;
  const words = (text.toLowerCase().match(/[a-z]+/g) || []);
  // Two hits, not one: "the" and "la" both appear in English sentences, so a
  // single match would send English questions off to be translated.
  return words.filter((w) => VIETNAMESE_WORDS.has(w)).length >= 2;
}

// Loaded once and reused across requests within a warm serverless instance —
// mirrors the Python QueryTranslator's lazy `_engine` cache. There is no
// cross-invocation guarantee on Vercel (a cold start reloads it), but within
// one warm instance this avoids reloading the model per request.
let translatorPromise: Promise<TranslationPipeline> | null = null;
function loadTranslator(): Promise<TranslationPipeline> {
  if (!translatorPromise) {
    translatorPromise = pipeline(
      "translation",
      TRANSLATE_MODEL_ID
    ) as Promise<TranslationPipeline>;
  }
  return translatorPromise;
}

// Small in-memory cache, same intent as the Python side's lru_cache(512): a
// multi-turn session frequently repeats the same question fragments (via
// expand_self_reference's alias expansion), so this avoids re-running the
// model on text already translated this process's lifetime.
const cache = new Map<string, string>();
const CACHE_MAX = 512;

/** The English search text — the question itself when already English or
 * when translation is disabled/unavailable. Returning the original on any
 * failure is deliberate: a translation problem should degrade retrieval,
 * not break the chat. */
export async function toEnglish(question: string): Promise<string> {
  if (!TRANSLATE_ENABLED || !isVietnamese(question)) return question;

  const key = question.trim();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  try {
    const translator = await loadTranslator();
    // num_beams is passed explicitly, matching translator.py's BEAM_SIZE=2.
    // Leaving it off is not the same thing: transformers.js falls back to the
    // beam count in the model's own generation_config, and the Helsinki-NLP
    // Marian exports ship a much wider default — so the search ran wider than
    // the Python side for output measured to be identical at 2.
    const output = await translator(key, {
      max_new_tokens: 72,
      num_beams: TRANSLATE_BEAM,
    });
    const result = Array.isArray(output) ? output[0] : output;
    const text = (result as { translation_text?: string })?.translation_text;
    const cleaned = (text || "")
      .split(" ")
      .filter((tok) => !SPECIAL.has(tok))
      .join(" ")
      .trim();
    const finalText = cleaned || question;

    if (cache.size >= CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, finalText);
    return finalText;
  } catch {
    return question;
  }
}
