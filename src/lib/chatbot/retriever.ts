/**
 * Retrieve the passages that should ground an answer. Direct port of
 * retriever.py's two-stage search — see that file's module docstring for the
 * full reasoning; kept here only where the JS port changes something.
 *
 * Stage 1 (dense): VectorStore.search() over the whole corpus.
 * Stage 2 (lexical rerank): re-score the dense candidates against the
 * query's lexical weights and blend the two — see embedding.ts's top comment
 * for how the lexical signal here differs from the Python version's learned
 * BGE-M3 sparse output.
 *
 * Three filters apply after that, same as retriever.py and same reasons:
 *   - weak matches dropped below DEFAULT_MIN_SCORE
 *   - no single URL takes more than DEFAULT_MAX_PER_URL of the final slots
 *   - candidates are over-fetched so both filters have room to trim
 */
import {
  DEFAULT_CANDIDATES,
  DEFAULT_MAX_PER_URL,
  DEFAULT_MIN_SCORE,
  DEFAULT_TOP_K,
  DENSE_WEIGHT,
  INSTITUTE_ALIASES,
  INSTITUTE_FULL_NAME,
  SPARSE_WEIGHT,
} from "./config";
import { embedQuery, lexicalScore, type LexicalWeights } from "./embedding";
import { VectorStore, type SearchHit } from "./vectorStore";
import { toEnglish } from "./translator";

/** A second query variant with the institute's full name appended, for
 * questions that refer to it only as "viện"/"trường". Returns null (not the
 * unchanged question) so callers can tell "nothing to add" apart from
 * "added and it's a no-op" without a second check — same contract as
 * retriever.py's expand_self_reference(). */
export function expandSelfReference(question: string): string | null {
  const q = question.toLowerCase();
  if (q.includes(INSTITUTE_FULL_NAME.toLowerCase())) return null;
  if (INSTITUTE_ALIASES.some((alias) => q.includes(alias))) {
    return `${question} ${INSTITUTE_FULL_NAME}`;
  }
  return null;
}

function rescale(values: number[]): number[] {
  if (values.length === 0) return values;
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (high - low < 1e-9) return values.map(() => 0);
  return values.map((v) => (v - low) / (high - low));
}

interface RankedHit extends SearchHit {
  dense_score?: number;
  lexical_score?: number;
}

export interface RetrievalChunk extends SearchHit {
  dense_score?: number;
  lexical_score?: number;
}

export class Retriever {
  private storePromise: Promise<VectorStore>;

  constructor(store?: VectorStore) {
    this.storePromise = store ? Promise.resolve(store) : VectorStore.load();
  }

  private async store(): Promise<VectorStore> {
    return this.storePromise;
  }

  /** The text actually embedded — English if the question was translated.
   * Public so the API layer can surface it, same as retriever.py's
   * query_for(): a user seeing Vietnamese-in/English-matches deserves to
   * know why. */
  async queryFor(question: string): Promise<string> {
    return toEnglish(question);
  }

  async search(
    question: string,
    options: {
      topK?: number;
      minScore?: number;
      maxPerUrl?: number;
      candidates?: number;
      rerank?: boolean;
    } = {}
  ): Promise<RetrievalChunk[]> {
    const topK = options.topK ?? DEFAULT_TOP_K;
    const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
    const maxPerUrl = options.maxPerUrl ?? DEFAULT_MAX_PER_URL;
    const candidates = options.candidates ?? DEFAULT_CANDIDATES;
    const rerank = options.rerank ?? true;

    const store = await this.store();

    // Search with the question and, when it was translated, the English
    // version too — same three-query strategy as retriever.py, same reason:
    // a mistranslation should only ever add a missed match back in, never
    // replace a correct query with a wrong one.
    const queries = [question];
    const expanded = expandSelfReference(question);
    if (expanded) queries.push(expanded);
    const english = await toEnglish(expanded || question);
    if (english !== question) queries.push(english);

    const hitsByIndex = new Map<number, RankedHit>();
    const lexicals: LexicalWeights[] = [];

    for (const text of queries) {
      const { dense, lexical } = await embedQuery(text, store.idf);
      lexicals.push(lexical);
      const found = store.search(dense, Math.max(candidates, topK));
      for (const hit of found) {
        if (hit.score < minScore) continue;
        const seen = hitsByIndex.get(hit.index);
        if (!seen || hit.score > seen.score) hitsByIndex.set(hit.index, hit);
      }
    }

    const hits = Array.from(hitsByIndex.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, candidates);

    const anyLexical = lexicals.some((l) => l.size > 0);
    if (rerank && anyLexical && hits.length > 1) {
      for (const hit of hits) {
        const docLexical = store.lexicalFor(hit.index);
        hit.dense_score = hit.score;
        // Best of both queries, same as retriever.py: the Vietnamese query
        // shares tokens with Vietnamese content, the English one with
        // English pages — neither alone covers both halves of the corpus.
        hit.lexical_score = docLexical.size
          ? Math.max(...lexicals.map((q) => lexicalScore(q, docLexical)), 0)
          : 0;
      }
      const dense = rescale(hits.map((h) => h.dense_score ?? h.score));
      const lexical = rescale(hits.map((h) => h.lexical_score ?? 0));
      hits.forEach((hit, i) => {
        hit.score = DENSE_WEIGHT * dense[i] + SPARSE_WEIGHT * lexical[i];
      });
      hits.sort((a, b) => b.score - a.score);
    }

    const kept: RetrievalChunk[] = [];
    const perUrl = new Map<string, number>();
    for (const hit of hits) {
      const url = hit.url || "";
      const count = perUrl.get(url) || 0;
      if (count >= maxPerUrl) continue;
      perUrl.set(url, count + 1);
      kept.push(hit);
      if (kept.length >= topK) break;
    }
    return kept;
  }
}
