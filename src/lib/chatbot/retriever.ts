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
 *
 * One thing here is NOT a port: the context-merged query variant (the
 * `options.history` path below, see contextQuery.ts). retriever.py has no
 * equivalent and its search() signature does not take history at all — don't go
 * looking for the function it corresponds to.
 */
import {
  CONTEXT_MAX_HITS,
  CONTEXT_QUERY_WEIGHT,
  CONTEXT_TRANSLATE,
  DEFAULT_CANDIDATES,
  DEFAULT_MAX_PER_URL,
  DEFAULT_MIN_SCORE,
  DEFAULT_TOP_K,
  DENSE_WEIGHT,
  INSTITUTE_ALIASES,
  INSTITUTE_FULL_NAME,
  SPARSE_WEIGHT,
} from "./config";
import { mergeWithHistory } from "./contextQuery";
import { embedQuery, lexicalScore, type LexicalWeights } from "./embedding";
import { VectorStore, type SearchHit } from "./vectorStore";
import { toEnglish } from "./translator";
import { restoreQuestion } from "./diacritics";
// `import type`, not a value import, and it has to stay that way: TS erases it
// completely at compile time, so the mongodb driver chatHistory.ts pulls in
// stays out of this module's runtime import graph. Turn it into a plain import
// and every file that touches the retriever drags Mongo along with it, with
// nothing at the call site to explain why the bundle grew.
import type { ChatMessage } from "./chatHistory";

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
    return toEnglish(await restoreQuestion(question));
  }

  /**
   * Rebuild chunks the caller already identified, in the order given — no
   * embedding, no search. Used by the follow-up path: when a question refers
   * back ("người thứ 2") and retrieval on its own found nothing anchored, the
   * passages that answered the *previous* turn are by construction where the
   * referent came from.
   *
   * The scores come from that previous turn and are carried, not recomputed:
   * these passages were never scored against the current question, and inventing
   * a number here would put a fiction in the source list. Ids missing from the
   * index are skipped — the index can be rebuilt between turns.
   */
  async chunksByIds(
    entries: { id: string; score: number }[]
  ): Promise<RetrievalChunk[]> {
    const store = await this.store();
    const out: RetrievalChunk[] = [];
    for (const { id, score } of entries) {
      const index = store.chunkIdToIndex(id);
      if (index === undefined) continue;
      out.push(store.hitAt(index, score));
    }
    return out;
  }

  async search(
    question: string,
    options: {
      topK?: number;
      minScore?: number;
      maxPerUrl?: number;
      candidates?: number;
      rerank?: boolean;
      /** This session's earlier turns, oldest first. Only the last user
       * message is read, and only to build the context-merged variant —
       * omitting it just disables that variant. */
      history?: ChatMessage[];
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
    // replace a correct query with a wrong one. The context-merged variant
    // below is a fourth on the same terms, and rides on the same property:
    // hits merge by best score per chunk, so an unhelpful variant costs one
    // embedding pass instead of displacing a good query.
    //
    // Khôi phục dấu TRƯỚC mọi thứ khác, và thứ tự này quan trọng: Marian dịch
    // "vien truong la ai" ra rác, dịch "viện trưởng là ai" mới đúng — nên đặt
    // ở đây thì cả nhánh dịch lẫn nhánh dense đều được hưởng. Câu vốn đã có
    // dấu đi thẳng qua, không bị đụng vào (xem needsRestoration).
    // Đo qua /api/chat trên 21 câu hỏi vàng gõ không dấu: Recall@7 57% -> 86%.
    // Biến thể ghép ngữ cảnh bên dưới cũng dựng từ `restored` vì cùng lý do:
    // cổng ghép và mergeWithHistory đều khớp mẫu tiếng Việt CÓ dấu.
    const restored = await restoreQuestion(question);

    const queries = [restored];
    // Per-query score multipliers, kept as a parallel array rather than
    // recording each hit's origin: the only thing the merge step needs to know
    // is which factor to apply, and a factor is cheaper to carry than
    // provenance nobody else reads.
    const weights = [1];
    const expanded = expandSelfReference(restored);
    if (expanded) {
      queries.push(expanded);
      weights.push(1);
    }
    const english = await toEnglish(expanded || restored);
    if (english !== restored) {
      queries.push(english);
      weights.push(1);
    }

    // Everything pushed from here on is a context query. Recorded as a
    // boundary index rather than a third parallel array — the queries are
    // appended in order and none of the base variants can follow them.
    const contextFrom = queries.length;

    // Fourth variant: the question glued to the previous user turn, for
    // follow-ups that dropped their subject ("Học phí bao nhiêu?"). Gated —
    // see contextQuery.ts for why merging unconditionally is not safe.
    const contextual = mergeWithHistory(restored, options.history ?? []);
    if (contextual) {
      queries.push(contextual);
      weights.push(CONTEXT_QUERY_WEIGHT);
      if (CONTEXT_TRANSLATE) {
        const contextualEn = await toEnglish(contextual);
        if (contextualEn !== contextual) {
          queries.push(contextualEn);
          weights.push(CONTEXT_QUERY_WEIGHT);
        }
      }
    }

    const hitsByIndex = new Map<number, RankedHit>();
    const lexicals: LexicalWeights[] = [];
    // Which chunks a *base* query found. The merged query's own hits are
    // capped below, and that cap needs to know which chunks would have been
    // retrieved anyway — a chunk both queries found is not the merge's doing
    // and must not be counted against its budget.
    const fromBase = new Set<number>();

    for (let qi = 0; qi < queries.length; qi++) {
      const { dense, lexical } = await embedQuery(queries[qi], store.idf);
      const isContext = qi >= contextFrom;
      // The merged query generates candidates but does NOT get a vote in the
      // rerank. Measured, not assumed: capping how many candidates it may
      // contribute changed nothing at all — even at a cap of 0 the final
      // ranking still moved — because this is where the damage actually came
      // from. lexical_score takes the max over every variant, so the previous
      // turn's tokens were lifting *every* candidate that happened to share
      // them, including ones the plain question had found on its own. No new
      // chunk needed to enter for the order to be rewritten.
      //
      // Which is the right split anyway: rerank answers "of these candidates,
      // which best matches what was asked?", and what was asked is the current
      // question. The merged variant is a recall device for finding candidates,
      // not a statement about relevance.
      if (!isContext) lexicals.push(lexical);
      const found = store.search(dense, Math.max(candidates, topK));
      const weight = weights[qi];
      for (const hit of found) {
        // Floor first, weight after: minScore answers "is this chunk close
        // enough to be a candidate at all", which is a property of the match,
        // not of which variant found it. Weighting before the test would make
        // CONTEXT_QUERY_WEIGHT quietly raise the threshold too instead of only
        // nudging the ranking.
        if (hit.score < minScore) continue;
        if (!isContext) fromBase.add(hit.index);
        // A context query may only ADD chunks, never re-score one a base query
        // already found. The third and last channel by which a merge reached
        // the ranking: hits merge by best score per chunk, so a chunk matching
        // the *previous* turn better than the current one had its dense_score
        // raised by the merged query — no new chunk enters, yet rescale() and
        // the final sort both move. Base queries all run before context ones,
        // so `fromBase` is complete by the time this can fire.
        if (isContext && fromBase.has(hit.index)) continue;
        if (weight !== 1) hit.score *= weight;
        const seen = hitsByIndex.get(hit.index);
        if (!seen || hit.score > seen.score) hitsByIndex.set(hit.index, hit);
      }
    }

    let ranked = Array.from(hitsByIndex.values()).sort((a, b) => b.score - a.score);

    // Cap what the merged query alone may contribute. The gate in
    // contextQuery.ts decides *whether* to merge and cannot be exact — it sees
    // only length, and "các khoá học" (self-sufficient) reads the same as
    // "Học phí bao nhiêu?" (subject dropped). So the gate being wrong has to be
    // survivable, not just unlikely: without this, one bad merge reshapes the
    // whole ranking, because candidates/rescale/maxPerUrl/topK all key off this
    // list. With it, a bad merge costs at most CONTEXT_MAX_HITS slots.
    //
    // Applied before the candidate slice so the dropped chunks never reach
    // rescale() either — leaving them in would still skew the min-max range
    // every other candidate is normalised against, which is half the damage.
    // `ranked` is sorted, so the survivors are the merge's best hits.
    if (queries.length > contextFrom) {
      let budget = CONTEXT_MAX_HITS;
      ranked = ranked.filter((h) => fromBase.has(h.index) || budget-- > 0);
    }

    const hits = ranked.slice(0, candidates);

    const anyLexical = lexicals.some((l) => l.size > 0);
    if (rerank && anyLexical && hits.length > 1) {
      for (const hit of hits) {
        const docLexical = store.lexicalFor(hit.index);
        hit.dense_score = hit.score;
        // Best of both queries, same as retriever.py: the Vietnamese query
        // shares tokens with Vietnamese content, the English one with
        // English pages — neither alone covers both halves of the corpus.
        // Note the context-merged variant is in `lexicals` too and is *not*
        // damped by CONTEXT_QUERY_WEIGHT, which by design only scales dense
        // scores. So the previous turn's tokens can still lift a chunk here
        // even at a low weight — that is the intended path for the proper
        // nouns the merge is mostly there to carry, but it is also why turning
        // the weight down does not fully undo a merge.
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
