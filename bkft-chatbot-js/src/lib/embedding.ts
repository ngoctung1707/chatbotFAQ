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

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;
function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedderPromise) {
    embedderPromise = pipeline(
      "feature-extraction",
      EMBEDDING_MODEL_ID
    ) as Promise<FeatureExtractionPipeline>;
  }
  return embedderPromise;
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
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(
    (t) => t.length > 1 && !STOPWORDS.has(t)
  );
}

/** Term-frequency weights, L2-normalized so lexicalScore() is a cosine-like
 * dot product rather than being dominated by document length. */
export function lexicalWeights(text: string): LexicalWeights {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }
  let normSq = 0;
  for (const v of counts.values()) normSq += v * v;
  const norm = Math.sqrt(normSq) || 1;
  const weights: LexicalWeights = new Map();
  for (const [k, v] of counts) weights.set(k, v / norm);
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
  text: string
): Promise<{ dense: number[]; lexical: LexicalWeights }> {
  const [dense, lexical] = await Promise.all([
    embedDense(text),
    Promise.resolve(lexicalWeights(text)),
  ]);
  return { dense, lexical };
}
