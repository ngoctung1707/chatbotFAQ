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
import { Worker } from "node:worker_threads";
import {
  EMBEDDING_MODEL_ID,
  EMBED_CACHE_DIR,
  EMBED_REMOTE_URL,
  EMBED_TIMEOUT_MS,
  EMBED_WORKER_PATH,
  INTERNAL_SECRET,
} from "./config";

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
  var __bkftEmbedWorker: EmbedWorkerHandle | undefined;
}

interface PendingCall {
  resolve: (vectors: number[][]) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface EmbedWorkerHandle {
  worker: Worker;
  /** Resolve đúng một lần khi model nạp xong, rồi giữ nguyên suốt đời worker. */
  ready: Promise<void>;
  modelReady: boolean;
  pending: Map<number, PendingCall>;
  nextId: number;
  spawnedAt: number;
}

/**
 * Mượn model của app qua HTTP thay vì tự nạp.
 *
 * Chỉ dùng cho SCRIPT (xem chốt chặn NEXT_RUNTIME ở EMBED_REMOTE_URL). Đây là
 * thứ giữ cho lời hứa "đúng một bản BGE-M3 trong cả hệ thống" đúng cả ở những
 * pha không phải pha embed — cụ thể là cổng QA, vốn dựng Retriever thật.
 *
 * Chia lô để không vượt trần MAX_BATCH phía route, và cũng để một câu lỗi
 * không kéo theo cả nghìn đoạn phải làm lại.
 */
async function embedViaApp(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  const BATCH = 64;
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const res = await fetch(`${EMBED_REMOTE_URL}/api/chatbot/embed`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify({ texts: slice }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `mượn model qua ${EMBED_REMOTE_URL}/api/chatbot/embed thất bại ` +
          `(${res.status}): ${detail.slice(0, 300)}`
      );
    }
    const body = (await res.json()) as { vectors?: number[][] };
    if (!Array.isArray(body.vectors) || body.vectors.length !== slice.length) {
      throw new Error(
        `app trả ${body.vectors?.length ?? "?"} vector cho ${slice.length} đoạn`
      );
    }
    out.push(...body.vectors);
  }
  return out;
}

/**
 * Giữ tiến trình sống đúng lúc cần, và chỉ lúc cần.
 *
 * Với server thì dòng này không đổi gì — luôn có listener HTTP giữ event loop.
 * Nhưng các script (build-index.ts, qa-*.ts) chạy xong là muốn thoát, mà một
 * worker còn ref sẽ treo tiến trình vô hạn. unref() khi rảnh, ref() khi đang
 * có việc: đó là cách để cùng một đoạn code phục vụ được cả server dài hạn lẫn
 * script chạy một lần.
 */
function syncRef(handle: EmbedWorkerHandle): void {
  if (handle.pending.size > 0 || !handle.modelReady) handle.worker.ref();
  else handle.worker.unref();
}

function failAll(handle: EmbedWorkerHandle, err: Error): void {
  for (const [, call] of handle.pending) {
    clearTimeout(call.timer);
    call.reject(err);
  }
  handle.pending.clear();
}

function spawnWorker(): EmbedWorkerHandle {
  const worker = new Worker(EMBED_WORKER_PATH, {
    workerData: { modelId: EMBEDDING_MODEL_ID, cacheDir: EMBED_CACHE_DIR },
  });

  const handle: EmbedWorkerHandle = {
    worker,
    modelReady: false,
    pending: new Map(),
    nextId: 1,
    spawnedAt: Date.now(),
    ready: undefined as unknown as Promise<void>,
  };

  handle.ready = new Promise<void>((resolve, reject) => {
    worker.on("message", (msg) => {
      if (msg?.type === "ready") {
        handle.modelReady = true;
        syncRef(handle);
        resolve();
      } else if (msg?.type === "ready-error") {
        reject(new Error(msg.error));
      }
    });
    worker.once("error", reject);
  });

  worker.on("message", (msg) => {
    if (msg?.type !== "result" && msg?.type !== "error") return;
    const call = handle.pending.get(msg.id);
    if (!call) return;
    handle.pending.delete(msg.id);
    clearTimeout(call.timer);
    syncRef(handle);
    if (msg.type === "result") call.resolve(msg.vectors as number[][]);
    else call.reject(new Error(msg.error));
  });

  worker.on("error", (err) => failAll(handle, err));

  // Worker chết thì bỏ cache đi để lần gọi sau SINH LẠI. Đây là chỗ giữ đúng
  // lời hứa "luôn luôn có model ở đâu đó": worker sập vì bất kỳ lý do gì cũng
  // chỉ làm mất model trong khoảng giữa hai lần gọi, chứ không vĩnh viễn — và
  // không cần restart app để lấy lại.
  worker.on("exit", (code) => {
    failAll(handle, new Error(`embed worker đã thoát với mã ${code}`));
    if (globalThis.__bkftEmbedWorker === handle) {
      globalThis.__bkftEmbedWorker = undefined;
    }
  });

  syncRef(handle);
  return handle;
}

function ensureWorker(): EmbedWorkerHandle {
  if (!globalThis.__bkftEmbedWorker) {
    const handle = spawnWorker();
    globalThis.__bkftEmbedWorker = handle;
    handle.ready.catch(() => {
      // Bỏ cache khi nạp hỏng, để lần sau sinh worker mới. Không có nhánh này
      // thì một lần hết RAM lúc khởi động sẽ làm mọi câu hỏi về sau hỏng theo
      // với đúng cái lỗi cũ — chính thứ mà allSettled ở instrumentation định
      // mua bảo hiểm cho.
      if (globalThis.__bkftEmbedWorker === handle) {
        globalThis.__bkftEmbedWorker = undefined;
      }
      void handle.worker.terminate().catch(() => {});
    });
  }
  return globalThis.__bkftEmbedWorker;
}

/** Sinh worker và chờ model nạp xong. instrumentation gọi lúc boot để cái giá
 *  ~7s đó rơi vào lúc không ai đợi. Vẫn lười cho mọi caller khác — cache nghĩa
 *  là preload và nạp lười đi chung một đường code. */
export function loadEmbedder(): Promise<void> {
  // Chế độ mượn model: không có gì để hâm nóng ở tiến trình này, và gọi
  // ensureWorker() ở đây sẽ SINH RA đúng bản model thứ hai mà chế độ mượn tồn
  // tại để tránh.
  //
  // Đo được: retriever.ts gọi loadEmbedder() trong Promise.all để hâm nóng
  // song song với bước rewrite. Bản đầu của thay đổi này chỉ chặn ở
  // embedDenseBatch, nên `qa-gate.ts` vẫn nạp model — chứng minh bằng cách trỏ
  // CHATBOT_EMBED_WORKER vào một file không tồn tại: đáng lẽ phải chạy bình
  // thường thì nó chết với ERR_MODULE_NOT_FOUND.
  if (EMBED_REMOTE_URL) return Promise.resolve();
  return ensureWorker().ready;
}

/**
 * Model đã sẵn sàng trong worker chưa.
 *
 * Ý nghĩa của hàm này đã ĐỔI kể từ khi model chuyển vào worker. Trước đây job
 * hàng tuần chờ nó về false để biết app đã nhả RAM rồi mới dám nạp bản model
 * của riêng nó. Bây giờ **không còn bước nhả RAM nào** — model sống suốt đời
 * tiến trình, và job không nạp model nữa mà gọi vào /api/chatbot/embed.
 *
 * false giờ chỉ còn hai nghĩa: worker chưa nạp xong, hoặc worker vừa chết và
 * chưa ai gọi lại để nó sinh lại.
 */
export function isEmbedderLoaded(): boolean {
  return globalThis.__bkftEmbedWorker?.modelReady === true;
}

/** Trạng thái chi tiết cho /api/health. */
export function embedderStatus(): {
  spawned: boolean;
  model_ready: boolean;
  pending: number;
  uptime_sec: number | null;
} {
  const h = globalThis.__bkftEmbedWorker;
  return {
    spawned: h !== undefined,
    model_ready: h?.modelReady === true,
    pending: h?.pending.size ?? 0,
    uptime_sec: h ? Math.round((Date.now() - h.spawnedAt) / 1000) : null,
  };
}

/**
 * Embed nhiều đoạn trong một lượt gửi sang worker.
 *
 * Gộp lô vì mỗi lượt postMessage phải sao chép chuỗi qua ranh giới luồng: gửi
 * 16 đoạn một lần rẻ hơn hẳn 16 lượt. Trần thời gian cộng thêm theo số đoạn
 * chứ không cố định — một lô 64 đoạn lâu gấp 64 lần một đoạn, mà dùng chung
 * một hằng số thì hoặc quá chặt cho lô lớn, hoặc quá lỏng cho lô nhỏ.
 */
export async function embedDenseBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (EMBED_REMOTE_URL) return embedViaApp(texts);
  const handle = ensureWorker();
  await handle.ready;

  const id = handle.nextId++;
  const budgetMs = EMBED_TIMEOUT_MS + texts.length * 5000;

  return new Promise<number[][]>((resolve, reject) => {
    const timer = setTimeout(() => {
      handle.pending.delete(id);
      syncRef(handle);
      reject(new Error(`embed worker không trả lời trong ${budgetMs}ms`));
    }, budgetMs);
    handle.pending.set(id, { resolve, reject, timer });
    syncRef(handle);
    handle.worker.postMessage({ type: "embed", id, texts });
  });
}

/**
 * CLS-pooled, L2-normalized dense embedding as a plain number[].
 *
 * CLS chứ KHÔNG phải mean, và đây là điểm phải khớp với model: BGE-M3 huấn
 * luyện vector dense bằng token đầu tiên — FlagEmbedding's BGEM3FlagModel lấy
 * `normalize(last_hidden_state[:, 0])`, và 1_Pooling/config.json của BAAI/bge-m3
 * bật pooling_mode_cls_token. Contrastive loss chỉ tối ưu hướng của token đó,
 * nên mean pooling (giá trị mặc định trong ví dụ của transformers.js, và là thứ
 * file này dùng cho tới lần sửa này) đem vector ra khỏi đúng không gian mà model
 * được trả tiền để học. transformers.js cài `pooling: "cls"` thành
 * `last_hidden_state.slice(null, 0)` — chính là phép trên.
 *
 * Đo được trên corpus này TRƯỚC khi đổi, để lần sau còn so: dưới mean pooling,
 * cặp chunk ít giống nhau nhất trong toàn bộ 707 chunk vẫn đạt cosine 0.6420, và
 * chuỗi rác "asdkjh qwe zxcvbn" ăn 0.6706 với chunk gần nhất — cao hơn một câu
 * hỏi tiếng Việt hợp lệ nhưng ngoài phạm vi (nấu phở, 0.6199). Toàn bộ dải điểm
 * bị nén vào ~[0.60, 0.90], nên không sàn tuyệt đối nào vừa an toàn vừa hữu ích.
 * Đó là lý do thật khiến DEFAULT_MIN_SCORE trước đây là dead code.
 *
 * ĐỔI GIÁ TRỊ NÀY LÀ PHẢI BUILD LẠI INDEX (`pnpm build-index`). Query pool bằng
 * CLS đấu với index pool bằng mean là hai không gian khác nhau: kết quả không
 * phải "kém đi" mà là rác. Cùng hạng ràng buộc với việc đổi EMBEDDING_MODEL_ID.
 *
 * Phép pooling thật sự nằm ở workers/embed-worker.mjs kể từ khi model chuyển
 * vào worker thread; hàm này chỉ còn là lối vào. Ràng buộc "đổi pooling là
 * phải build lại index" không đổi — chỉ là chỗ sửa đã chuyển sang file kia.
 */
export async function embedDense(text: string): Promise<number[]> {
  const [vector] = await embedDenseBatch([text]);
  return vector;
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
