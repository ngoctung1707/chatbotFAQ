/**
 * Retrieve the passages that should ground an answer. Direct port of
 * retriever.py's two-stage search — see that file's module docstring for the
 * full reasoning; kept here only where the JS port changes something.
 *
 * Stage 0 (query building): the question is turned into two search texts —
 * bản tiếng Việt (khôi phục dấu nếu cần, xem diacritics.ts) và một truy vấn
 * tiếng Anh độc lập do LLM dựng lại (xem queryRewriter.ts). Bước rewrite này
 * thay cho cặp expand_self_reference + bản dịch Marian mà retriever.py dùng;
 * đừng đi tìm hàm tương ứng bên đó.
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
 * One more thing here is NOT a port: the context-merged query variant (the
 * `options.history` path below, see contextQuery.ts). retriever.py has no
 * equivalent and its search() signature does not take history at all.
 */
import {
  CONTEXT_MAX_HITS,
  CONTEXT_QUERY_WEIGHT,
  DEFAULT_CANDIDATES,
  DEFAULT_MAX_PER_URL,
  DEFAULT_MIN_SCORE,
  DEFAULT_TOP_K,
  DENSE_WEIGHT,
  SPARSE_WEIGHT,
} from "./config";
import { mergeWithHistory } from "./contextQuery";
import {
  embedQuery,
  lexicalScore,
  loadEmbedder,
  type LexicalWeights,
} from "./embedding";
import { VectorStore, type SearchHit } from "./vectorStore";
import { rewriteQuery } from "./queryRewriter";
import { restoreQuestion } from "./diacritics";
// `import type`, not a value import, and it has to stay that way: TS erases it
// completely at compile time, so the mongodb driver chatHistory.ts pulls in
// stays out of this module's runtime import graph. Turn it into a plain import
// and every file that touches the retriever drags Mongo along with it, with
// nothing at the call site to explain why the bundle grew.
import type { ChatMessage } from "./chatHistory";

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

export interface RetrievalResult {
  chunks: RetrievalChunk[];
  /** Truy vấn tiếng Anh đã đem đi nhúng, hoặc chính câu hỏi nếu bước rewrite bị
   * bỏ qua. Trả ra ngoài chứ không để caller tự dựng lại: hai đường dựng query
   * độc lập là đúng cái bug vừa sửa ở đây (queryFor() và search() gọi bước dịch
   * hai lần với chuỗi hơi khác nhau, miss cache cả hai lần). Public vì người
   * dùng thấy hỏi tiếng Việt mà khớp tài liệu tiếng Anh thì xứng đáng biết lý
   * do — cùng mục đích như query_for() bên retriever.py. */
  searchQuery: string;
}

export class Retriever {
  private storePromise: Promise<VectorStore>;

  constructor(store?: VectorStore) {
    this.storePromise = store ? Promise.resolve(store) : VectorStore.load();
  }

  private async store(): Promise<VectorStore> {
    return this.storePromise;
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
      /** This session's earlier turns, oldest first. Read twice, for two
       * different things: queryRewriter.ts resolves pronouns against it, and
       * the context-merged variant is built from the last user message.
       * Omitting it disables both. */
      history?: ChatMessage[];
    } = {}
  ): Promise<RetrievalResult> {
    const topK = options.topK ?? DEFAULT_TOP_K;
    const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
    const maxPerUrl = options.maxPerUrl ?? DEFAULT_MAX_PER_URL;
    const candidates = options.candidates ?? DEFAULT_CANDIDATES;
    const rerank = options.rerank ?? true;

    // Song song hoá, và đây là chỗ giấu được gần hết chi phí của bước rewrite:
    // trên cold start, call LLM chạy trọn trong bóng của ~5s nạp BGE-M3 nên
    // gần như miễn phí; trên instance đã nóng nó lộ ra ~1s — nhưng đó là ~1s
    // thay cho ~20s của hai lần chạy model dịch trước đây. loadEmbedder() được
    // gọi ở đây chỉ để hâm nóng song song: nó đã cache trên globalThis nên là
    // no-op nếu instrumentation đã nạp, và kết quả không dùng tới ở đây.
    //
    // rewriteQuery() nhận câu hỏi THÔ chứ không phải bản đã khôi phục dấu: nó
    // tự xử lý được câu không dấu (xem REWRITE_SYSTEM_PROMPT), và nhận câu thô
    // là thứ cho phép nó chạy song song với chính bước khôi phục dấu.
    const [store, rewritten, restored] = await Promise.all([
      this.store(),
      rewriteQuery(question, options.history ?? []),
      // Khôi phục dấu cho nhánh tiếng Việt, và câu vốn đã có dấu đi thẳng qua
      // không bị đụng vào (xem needsRestoration). Đo qua /api/chat trên 21 câu
      // hỏi vàng gõ không dấu: Recall@7 57% -> 86%. Biến thể ghép ngữ cảnh bên
      // dưới cũng dựng từ `restored` vì cùng lý do: cổng ghép và
      // mergeWithHistory đều khớp mẫu tiếng Việt CÓ dấu.
      restoreQuestion(question),
      loadEmbedder(),
    ]);

    // Vẫn tìm bằng CẢ câu tiếng Việt gốc, hai lý do và cả hai đều còn nguyên
    // giá trị sau khi đổi từ dịch máy sang rewrite bằng LLM:
    //   1. một bản viết lại sai chỉ được phép THÊM match, không bao giờ được
    //      thay câu đúng bằng câu sai — hits gộp theo điểm tốt nhất mỗi chunk,
    //      nên một biến thể vô ích tốn đúng một lượt nhúng chứ không đẩy được
    //      query tốt ra ngoài;
    //   2. nửa lexical của hybrid search cần token tiếng Việt. Chunk tiếng Việt
    //      trong corpus không khớp gì với query tiếng Anh, nên bỏ câu gốc là tự
    //      cắt một nửa tín hiệu TF-IDF.
    // Biến thể ghép ngữ cảnh bên dưới là biến thể thứ ba, trên cùng điều kiện.
    const queries = [restored];
    // Per-query score multipliers, kept as a parallel array rather than
    // recording each hit's origin: the only thing the merge step needs to know
    // is which factor to apply, and a factor is cheaper to carry than
    // provenance nobody else reads.
    const weights = [1];
    if (rewritten.toLowerCase() !== restored.toLowerCase()) {
      queries.push(rewritten);
      weights.push(1);
    }

    // Everything pushed from here on is a context query. Recorded as a
    // boundary index rather than a third parallel array — the queries are
    // appended in order and none of the base variants can follow them.
    const contextFrom = queries.length;

    // Biến thể cuối: câu hỏi dán sau lượt user trước, cho follow-up bị mất chủ
    // đề ("Học phí bao nhiêu?"). Có cổng chặn — xem contextQuery.ts để biết vì
    // sao ghép vô điều kiện là không an toàn. Không còn bản dịch của biến thể
    // này (CHATBOT_CONTEXT_TRANSLATE cũ) vì bước rewrite đã đọc chính history
    // đó rồi: nó giải đại từ ngay trong truy vấn tiếng Anh, đúng việc mà biến
    // thể ghép-rồi-dịch cố làm bằng cách nối chuỗi.
    const contextual = mergeWithHistory(restored, options.history ?? []);
    if (contextual) {
      queries.push(contextual);
      weights.push(CONTEXT_QUERY_WEIGHT);
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
        // shares tokens with Vietnamese content, the rewritten English one with
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
    return { chunks: kept, searchQuery: rewritten };
  }
}
