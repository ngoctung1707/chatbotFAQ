/**
 * Embeddings for hybrid search: a dense vector for semantic similarity, plus
 * a lexical weight map for exact-token matching. Together they back
 * retriever.ts the same way DataEmbedding backed retriever.py.
 *
 * IMPORTANT DIFFERENCE FROM THE PYTHON SIDE — read before tuning weights:
 * The Python retriever used FlagEmbedding's BGEM3FlagModel, which produces
 * dense, sparse (lexical), *and* ColBERT vectors from one forward pass — the
 * sparse output there is a learned weight per token id, not a raw count.
 * transformers.js's generic feature-extraction pipeline only exposes the
 * pooled dense output; it has no equivalent entry point for BGE-M3's sparse
 * head. Rather than silently drop the lexical half of hybrid search, this
 * file computes lexical weights as plain term-frequency over the model's own
 * tokenizer output — a real but weaker signal than the trained sparse head.
 * If retrieval quality on exact-term queries (e.g. course slugs, acronyms)
 * regresses compared to the Python version, this approximation is the first
 * place to look, and DENSE_WEIGHT/SPARSE_WEIGHT in config.ts are the first
 * knobs to retune for it — the 0.7/0.3 split was tuned for the *learned*
 * sparse signal, not for plain TF.
 */
import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";
import { EMBEDDING_MODEL_ID } from "./config";

export type LexicalWeights = Map<string, number>;

// The cache lives on globalThis, not in a module-level `let`, and that is not
// paranoia: Next compiles instrumentation.ts in a different webpack layer from
// the route handlers, so this one source file ends up as *two* module
// instances inside a single server process. With a plain module variable each
// instance gets its own cache — measured on this project, instrumentation.ts
// preloaded the model into a copy the /api/chat route never touched, so the
// first question still paid the full ~5s load and the process carried ~1.1GB
// of a second, unused model. globalThis is the one registry both instances
// share. The transformers.js library itself is already a singleton (it is in
// serverExternalPackages, so it is a plain Node require, not bundled twice).
declare global {
  var __bkftEmbedderPromise: Promise<FeatureExtractionPipeline> | undefined;
}

/** Exported so instrumentation.ts can warm this at server start — the model is
 * ~560MB and loading it on the first real question makes that question wait for
 * the download plus ONNX session init. Still lazy for every other caller: the
 * cache means preloading and lazy loading are the same code path, so a preload
 * that never ran (or failed) just moves the cost back to first use. */
export function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!globalThis.__bkftEmbedderPromise) {
    globalThis.__bkftEmbedderPromise = (
      pipeline(
        "feature-extraction",
        EMBEDDING_MODEL_ID
      ) as Promise<FeatureExtractionPipeline>
    ).catch((err) => {
      // Uncache a failed load so the next caller retries. Without this the
      // rejected promise is the cache: one transient failure at boot (the
      // observed one was an out-of-memory during ONNX init on a loaded
      // machine) would make every question for the rest of the process's life
      // fail with that same stale error, which is exactly the crash-proofing
      // the preload's allSettled is supposed to buy.
      globalThis.__bkftEmbedderPromise = undefined;
      throw err;
    });
  }
  return globalThis.__bkftEmbedderPromise;
}

/** Mean-pooled, L2-normalized dense embedding as a plain number[]. */
export async function embedDense(text: string): Promise<number[]> {
  const embedder = await loadEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

// Tokenizer for the lexical half: word-level, not the model's subword
// tokenizer. Subword pieces (e.g. "fint" + "ech") would fragment exact
// product/course names across multiple tokens and weaken the one signal this
// half of hybrid search exists to provide, so whole lowercased words are used
// instead — closer in spirit to classic BM25 term matching.
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "for",
  "and", "or", "la", "va", "cua", "co", "cac", "mot", "la", "voi", "cho",
]);

function tokenize(text: string): string[] {
  const matches: string[] = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return matches.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Inverse document frequency over the indexed corpus, built once offline.
 *
 * Why this exists: BGE-M3's own sparse head (what Data_embedding.py used via
 * `return_sparse=True`) emits *learned* per-token weights that already know
 * "institute" is uninformative on this corpus and "minh" is not.
 * transformers.js exposes only the dense head, so the JS port scored lexical
 * overlap on raw term frequency — which rewards whichever chunk is longest and
 * most generic. Measured on "Viện trưởng là ai": the homepage chunk scored
 * lex=0.41 and the three-line board-of-deans chunk that actually answers it
 * scored 0.08, purely because the homepage repeats common terms more often.
 * IDF is the classic stand-in for those learned weights: same intent — damp
 * tokens that appear everywhere, keep the ones that discriminate.
 */
export type IdfTable = Map<string, number>;

/** BM25's robust IDF: always positive, unlike log(N/df), which goes negative
 * for a token present in more than half the corpus and would then *subtract*
 * from the score of a chunk that legitimately contains it. */
export function buildIdf(documents: string[]): IdfTable {
  const df = new Map<string, number>();
  for (const doc of documents) {
    for (const tok of new Set(tokenize(doc))) {
      df.set(tok, (df.get(tok) || 0) + 1);
    }
  }
  const n = documents.length;
  const idf: IdfTable = new Map();
  for (const [tok, freq] of df) {
    idf.set(tok, Math.log(1 + (n - freq + 0.5) / (freq + 0.5)));
  }
  return idf;
}

// A query token absent from the corpus is treated as maximally rare. The value
// barely matters: such a token matches no document, so it only ever scales the
// query's L2 norm — and that scale cancels out in retriever.ts's rescale(),
// which is min-max over one query's candidates. Kept principled anyway so the
// weights mean what they claim to.
const maxIdfCache = new WeakMap<IdfTable, number>();
function fallbackIdf(idf: IdfTable): number {
  let max = maxIdfCache.get(idf);
  if (max === undefined) {
    max = 0;
    for (const v of idf.values()) if (v > max) max = v;
    maxIdfCache.set(idf, max);
  }
  return max;
}

/** TF-IDF weights, L2-normalized so lexicalScore() is a cosine-like dot
 * product rather than being dominated by document length. Without `idf` this
 * degrades to plain term frequency — the pre-IDF behaviour, kept so an index
 * built before the IDF table existed still scores rather than throwing. */
export function lexicalWeights(text: string, idf?: IdfTable): LexicalWeights {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }
  const weighted = new Map<string, number>();
  for (const [tok, tf] of counts) {
    const w = idf ? tf * (idf.get(tok) ?? fallbackIdf(idf)) : tf;
    if (w > 0) weighted.set(tok, w);
  }
  let normSq = 0;
  for (const v of weighted.values()) normSq += v * v;
  const norm = Math.sqrt(normSq) || 1;
  const weights: LexicalWeights = new Map();
  for (const [k, v] of weighted) weights.set(k, v / norm);
  return weights;
}

/** Sparse dot product between a query's and a document's lexical weights. */
export function lexicalScore(
  queryWeights: LexicalWeights,
  docWeights: LexicalWeights
): number {
  const [shorter, longer] =
    queryWeights.size <= docWeights.size
      ? [queryWeights, docWeights]
      : [docWeights, queryWeights];
  let score = 0;
  for (const [tok, w] of shorter) {
    const other = longer.get(tok);
    if (other !== undefined) score += w * other;
  }
  return score;
}

/** Both representations in one call, since a caller almost always wants both
 * (matches DataEmbedding.embed_query's dense+lexical tuple return). */
export async function embedQuery(
  text: string,
  idf?: IdfTable
): Promise<{ dense: number[]; lexical: LexicalWeights }> {
  const [dense, lexical] = await Promise.all([
    embedDense(text),
    // Must be the same IDF table the index was built with, or query and
    // document weights are on different scales and their dot product is
    // meaningless. The store carries it for exactly that reason.
    Promise.resolve(lexicalWeights(text, idf)),
  ]);
  return { dense, lexical };
}
