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
 * `options.history` cũng KHÔNG phải phần port: retriever.py không nhận history
 * và search() bên đó không có tham số tương ứng. Ở đây history chỉ đi đúng một
 * chỗ — bước rewrite, để giải đại từ. Nó từng nuôi thêm một biến thể truy vấn
 * thứ ba (query ghép ngữ cảnh); biến thể đó đã bị xoá, xem contextQuery.ts.
 */
import {
  DEFAULT_CANDIDATES,
  DEFAULT_MAX_PER_URL,
  DEFAULT_MIN_SCORE,
  DEFAULT_TOP_K,
  DENSE_WEIGHT,
  SPARSE_WEIGHT,
} from "./config";
import {
  embedQuery,
  lexicalScore,
  loadEmbedder,
  type LexicalWeights,
} from "./embedding";
import { getStore, VectorStore, type SearchHit } from "./vectorStore";
import { rewriteQuery } from "./queryRewriter";
import { needsRestoration, restoreQuestion } from "./diacritics";
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
  /** Store được ghim cứng do caller truyền vào — chỉ các script đo đạc muốn
   *  một bản bất biến trong suốt lượt chạy mới dùng tới.
   *
   *  null (mặc định, và là đường mà production đi) = dùng store CHUNG của tiến
   *  trình, và store đó tự nạp lại khi store.json trên đĩa đổi. Đây là chỗ bỏ
   *  giả định cũ "store không bao giờ đổi trong đời tiến trình" — giả định đã
   *  buộc phải restart app sau mỗi lần cập nhật dữ liệu. Xem getStore(). */
  private readonly pinned: VectorStore | null;

  constructor(store?: VectorStore) {
    this.pinned = store ?? null;
  }

  private async store(): Promise<VectorStore> {
    return this.pinned ?? getStore();
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
      /** This session's earlier turns, oldest first. Chỉ dùng cho bước rewrite
       * (giải đại từ theo lượt trước). Bỏ qua thì rewrite vẫn chạy, chỉ là
       * không có gì để giải — và với câu hỏi tiếng Anh ở lượt đầu thì bước đó
       * bị bỏ hẳn, xem rewriteQuery(). */
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
    const [store, rewritten, viterbi] = await Promise.all([
      this.store(),
      rewriteQuery(question, options.history ?? []),
      // Khôi phục dấu bằng Viterbi. Vẫn chạy song song vô điều kiện dù bước
      // rewrite thường cho kết quả tốt hơn, vì nó là NGUỒN DUY NHẤT không phụ
      // thuộc mạng: ~0.5ms, không bao giờ hỏng. Câu vốn đã có dấu đi thẳng qua
      // không bị đụng vào (xem needsRestoration).
      restoreQuestion(question),
      loadEmbedder(),
    ]);

    // Dấu do LLM khôi phục thắng Viterbi khi có. Đo trên 29 câu tiếng Việt của
    // qa-cases (bỏ dấu rồi khôi phục, so với chính câu gốc): Viterbi 51.7% đúng
    // cả câu, LLM 93.1%. Quan trọng hơn con số tổng là KIỂU sai của Viterbi —
    // nó biến "khóa học" thành "khoa học" ở 4/29 câu, mà corpus này có cả trang
    // khóa học lẫn trang nghiên cứu khoa học, nên đó là lái truy vấn sang đúng
    // collection sai. Bảng bigram không cứu được: "khoa học" phổ biến hơn hẳn
    // trong chính corpus, tức thống kê corpus phản lại người dùng ở đúng chỗ đó.
    //
    // Chỉ áp dụng khi needsRestoration() đúng — tức đúng lúc Viterbi vốn sẽ
    // chạy. Câu người dùng đã tự gõ dấu thì không ai đoán hộ, giữ nguyên lập
    // trường đã ghi trong diacritics.ts. (Câu gõ lẫn lộn vẫn nằm ngoài, y như
    // trước.) Dòng VI đã qua kiểm tra chuỗi từ ở parseRewrite(), nên tới đây nó
    // chắc chắn là cùng những chữ đó theo cùng thứ tự đó.
    const restored =
      rewritten.vietnamese && needsRestoration(question)
        ? rewritten.vietnamese
        : viterbi;

    // Vẫn tìm bằng CẢ câu tiếng Việt gốc, hai lý do và cả hai đều còn nguyên
    // giá trị sau khi đổi từ dịch máy sang rewrite bằng LLM:
    //   1. một bản viết lại sai chỉ được phép THÊM match, không bao giờ được
    //      thay câu đúng bằng câu sai — hits gộp theo điểm tốt nhất mỗi chunk,
    //      nên một biến thể vô ích tốn đúng một lượt nhúng chứ không đẩy được
    //      query tốt ra ngoài;
    //   2. nửa lexical của hybrid search cần token tiếng Việt. Chunk tiếng Việt
    //      trong corpus không khớp gì với query tiếng Anh, nên bỏ câu gốc là tự
    //      cắt một nửa tín hiệu TF-IDF.
    const queries = [restored];
    if (rewritten.english.toLowerCase() !== restored.toLowerCase()) {
      queries.push(rewritten.english);
    }

    const hitsByIndex = new Map<number, RankedHit>();
    const lexicals: LexicalWeights[] = [];

    for (const query of queries) {
      const { dense, lexical } = await embedQuery(query, store.idf);
      lexicals.push(lexical);
      for (const hit of store.search(dense, Math.max(candidates, topK))) {
        // minScore trả lời "chunk này có đủ gần để làm ứng viên không" — thuộc
        // tính của phép khớp, không phụ thuộc biến thể nào tìm ra nó.
        if (hit.score < minScore) continue;
        const seen = hitsByIndex.get(hit.index);
        if (!seen || hit.score > seen.score) hitsByIndex.set(hit.index, hit);
      }
    }

    const ranked = Array.from(hitsByIndex.values()).sort(
      (a, b) => b.score - a.score
    );
    const hits = ranked.slice(0, candidates);

    const anyLexical = lexicals.some((l) => l.size > 0);
    if (rerank && anyLexical && hits.length > 1) {
      for (const hit of hits) {
        const docLexical = store.lexicalFor(hit.index);
        hit.dense_score = hit.score;
        // Best of both queries, same as retriever.py: the Vietnamese query
        // shares tokens with Vietnamese content, the rewritten English one with
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
    return { chunks: kept, searchQuery: rewritten.english };
  }
}
