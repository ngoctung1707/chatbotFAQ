/**
 * In-memory, brute-force cosine similarity store — the JS replacement for
 * retriever.py's FAISS-backed VectorStore.
 *
 * Deliberately NOT using a native ANN library (faiss-node, hnswlib-node):
 * both need a compiled native addon, which is a real liability on Vercel's
 * serverless build/runtime (arch mismatches between build and execution
 * environment, cold-start cost of loading a native binary). For a single
 * institute's public website — hundreds to a few thousand chunks — a flat
 * O(n) cosine scan over plain JS arrays is fast enough (sub-10ms range) and
 * has zero native-dependency risk. If the corpus grows into the tens of
 * thousands of chunks, revisit this with a real ANN index.
 *
 * The index is built offline by scripts/build-index.ts and loaded here as a
 * single JSON file — analogous to VectorStore.load(index_dir) reading the
 * FAISS binary + sidecar metadata, just one file instead of two formats.
 */
import { readFile, stat } from "fs/promises";
import path from "path";
import { INDEX_DIR } from "./config";
import type { IdfTable, LexicalWeights } from "./embedding";

export interface ChunkRecord {
  chunk_id: string;
  url: string;
  title?: string;
  published_at?: string;
  collection?: string;
  raw: string;
  content?: string;
}

export interface StoredChunk extends ChunkRecord {
  dense: number[];
  // Serialized as an array of pairs for JSON; converted to Map on load.
  lexical: [string, number][];
}

export interface SearchHit extends ChunkRecord {
  index: number;
  score: number;
}

/** On-disk shape of store.json. The IDF table is corpus-wide, so it lives
 * beside the chunks rather than being duplicated into each one — and it has to
 * ship with them: query weights computed from a *different* corpus's IDF would
 * not be comparable to the stored document weights. */
export interface StoredIndex {
  idf: [string, number][];
  chunks: StoredChunk[];
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // Vectors from embedDense() are already L2-normalized at embed time, so a
  // plain dot product *is* cosine similarity — norms are computed here too
  // only as a safety net in case a caller passes in a non-normalized vector.
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) normA += a[i] * a[i];
  for (let i = 0; i < b.length; i++) normB += b[i] * b[i];
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom < 1e-9 ? 0 : dot / denom;
}

export class VectorStore {
  private chunks: StoredChunk[];
  private lexicalCache: LexicalWeights[];
  /** Empty for an index built before IDF existed — lexicalWeights() then falls
   * back to plain term frequency, which is what that index was scored with. */
  readonly idf: IdfTable;

  private constructor(chunks: StoredChunk[], idf: IdfTable) {
    this.chunks = chunks;
    this.lexicalCache = chunks.map((c) => new Map(c.lexical));
    this.idf = idf;
  }

  static async load(indexDir: string = INDEX_DIR): Promise<VectorStore> {
    const file = path.join(indexDir, "store.json");
    let raw: string;
    try {
      raw = await readFile(file, "utf-8");
    } catch {
      throw new Error(
        `Không tìm thấy index tại ${file}. Chạy \`npm run build-index\` trước ` +
          `(đọc data/processed/chunks.json và tạo file này).`
      );
    }
    // A bare array is the pre-IDF format. Accepted rather than rejected so an
    // older index keeps working (degraded to term-frequency scoring) instead
    // of taking the chat down until someone reruns a 4-minute rebuild.
    const parsed: StoredIndex | StoredChunk[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new VectorStore(parsed, new Map())
      : new VectorStore(parsed.chunks, new Map(parsed.idf));
  }

  get size(): number {
    return this.chunks.length;
  }

  /** Brute-force top-k by cosine similarity against the dense query vector. */
  search(queryDense: number[], topK: number): SearchHit[] {
    const scored = this.chunks.map((chunk, index) => ({
      index,
      score: cosine(queryDense, chunk.dense),
      chunk_id: chunk.chunk_id,
      url: chunk.url,
      title: chunk.title,
      published_at: chunk.published_at,
      collection: chunk.collection,
      raw: chunk.raw,
      content: chunk.content,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  lexicalFor(index: number): LexicalWeights {
    return this.lexicalCache[index];
  }

  /** Look a chunk up by its stored id, for callers that already know which
   * passage they want and are not searching for one — currently the follow-up
   * path in route.ts, which reuses the chunks the previous turn was answered
   * from. Index built on first use rather than in the constructor: every other
   * caller goes through search() and would pay for a map it never reads. */
  private idIndex: Map<string, number> | null = null;
  chunkIdToIndex(chunkId: string): number | undefined {
    if (!this.idIndex) {
      this.idIndex = new Map(this.chunks.map((c, i) => [c.chunk_id, i]));
    }
    return this.idIndex.get(chunkId);
  }

  /** The stored record at `index`, shaped like a search hit but carrying the
   * score the caller supplies — there is no query here to score against, so a
   * score computed locally would be a fiction. */
  hitAt(index: number, score: number): SearchHit {
    const chunk = this.chunks[index];
    return {
      index,
      score,
      chunk_id: chunk.chunk_id,
      url: chunk.url,
      title: chunk.title,
      published_at: chunk.published_at,
      collection: chunk.collection,
      raw: chunk.raw,
      content: chunk.content,
    };
  }
}

// ---------------------------------------------------------------------------
// Store dùng chung cho cả tiến trình, có tự nạp lại
// ---------------------------------------------------------------------------
//
// VÌ SAO PHẢI CÓ PHẦN NÀY
// -----------------------
// Trước đây mỗi Retriever tự gọi VectorStore.load() một lần trong constructor,
// và route.ts giữ đúng một Retriever suốt đời tiến trình. Hệ quả: `store.json`
// mới do pha C ghi ra nằm sờ sờ trên đĩa nhưng tiến trình không bao giờ ngó
// lại — muốn chatbot thấy dữ liệu mới thì phải restart app.
//
// Đặt cache ở cấp module (trên globalThis) thay vì trong từng Retriever, để
// mọi Retriever — kể cả cái mà script tự tạo — dùng chung một bản, và để
// /api/chatbot/reload có thứ cụ thể mà ép nạp lại.
//
// globalThis chứ không phải `let` module-level, cùng lý do đã ghi ở
// embedding.ts: Next biên dịch instrumentation và route handler ở hai lớp
// webpack khác nhau, nên một file nguồn có thể thành HAI instance module trong
// cùng một tiến trình. Với `let` thì mỗi instance ôm một store 122MB riêng.

interface StoreHandle {
  promise: Promise<VectorStore>;
  /** mtimeMs của store.json ứng với bản đang giữ. */
  version: number | null;
  checkedAt: number;
  reloading: Promise<void> | null;
  chunks: number;
}

declare global {
  var __bkftStore: StoreHandle | undefined;
}

/** Chặn tần suất stat(). Job ghi store.json mỗi tuần một lần, nên trễ vài giây
 *  là hoàn toàn chấp nhận được — còn stat() mỗi request thì là một syscall
 *  thừa trên đường nóng. Đường nhanh vẫn có: /api/chatbot/reload ép ngay. */
const CHECK_INTERVAL_MS = 5000;

function storeFile(): string {
  return path.join(INDEX_DIR, "store.json");
}

async function storeMtime(): Promise<number | null> {
  try {
    const { mtimeMs } = await stat(storeFile());
    return mtimeMs;
  } catch {
    return null;
  }
}

/**
 * Nạp lại nếu store.json đã đổi.
 *
 * DỰNG XONG RỒI MỚI THAY, không phải ngược lại. Nếu VectorStore.load() ném lỗi
 * — file ghi dở, JSON hỏng — thì tham chiếu cũ còn nguyên và chatbot vẫn trả
 * lời được bằng dữ liệu cũ, thay vì chết hẳn. Pha C vốn ghi nguyên tử bằng
 * rename nên chuyện đó hiếm, nhưng "hiếm" không phải "không".
 *
 * Và KHÔNG cập nhật `version` khi hỏng: lần kiểm sau vẫn thấy mtime khác nên
 * còn thử lại. Ghi version trong nhánh lỗi là tự khoá mình vào bản cũ vĩnh
 * viễn.
 */
async function maybeReload(h: StoreHandle, force: boolean): Promise<boolean> {
  const now = Date.now();
  if (!force && now - h.checkedAt < CHECK_INTERVAL_MS) return false;
  h.checkedAt = now;

  const mtime = await storeMtime();
  if (mtime === null) return false; // file mất tạm thời -> giữ bản đang chạy

  // mtime luôn có quyền phủ quyết, KỂ CẢ khi force. `force` chỉ có nghĩa "kiểm
  // ngay, đừng đợi hết cửa sổ chặn" — không phải "đọc lại bất kể thế nào".
  //
  // Phân biệt này quan trọng vì hai lý do, và lý do thứ hai mới nặng: (1)
  // /reload gọi vô hại bao nhiêu lần cũng được, không phải parse lại 20MB mỗi
  // lần; (2) `changed` trong response mới nói thật. Job hàng tuần ghi giá trị
  // đó vào log để tách "đã cập nhật" khỏi "tưởng là đã cập nhật" — mà một hàm
  // luôn trả về true thì không tách được gì.
  if (mtime === h.version) return false;

  // Đã có một lượt nạp lại đang chạy: chờ nó thay vì dựng bản thứ hai. Không
  // có nhánh này thì hai request cùng lúc sẽ ôm 2 x 122MB một cách vô ích.
  if (h.reloading) {
    await h.reloading;
    return h.version === mtime;
  }

  h.reloading = (async () => {
    try {
      const next = await VectorStore.load();
      h.promise = Promise.resolve(next);
      h.version = mtime;
      h.chunks = next.size;
      console.log(
        `[chatbot] đã nạp store mới — ${next.size} chunk (mtime ${mtime})`
      );
    } catch (err) {
      console.error(
        "[chatbot] nạp store mới THẤT BẠI, giữ nguyên bản đang chạy:",
        err
      );
    } finally {
      h.reloading = null;
    }
  })();

  await h.reloading;
  return h.version === mtime;
}

/** Store đang phục vụ, đã kiểm tra tươi. Mọi Retriever không được truyền store
 *  tường minh đều đi qua đây. */
export async function getStore(): Promise<VectorStore> {
  const existing = globalThis.__bkftStore;
  if (existing) {
    await maybeReload(existing, false);
    return existing.promise;
  }

  const handle: StoreHandle = {
    promise: undefined as unknown as Promise<VectorStore>,
    version: null,
    checkedAt: Date.now(),
    reloading: null,
    chunks: 0,
  };
  handle.promise = (async () => {
    // Đọc mtime TRƯỚC khi nạp. Nếu file bị ghi đè trong lúc đang nạp thì mtime
    // ghi lại sẽ cũ hơn thực tế, và lần kiểm sau bắt được — an toàn theo chiều
    // đúng. Làm ngược lại thì ta ghi mtime của bản mới cho nội dung bản cũ, và
    // lần cập nhật đó mất luôn.
    const version = await storeMtime();
    const store = await VectorStore.load();
    handle.version = version;
    handle.chunks = store.size;
    return store;
  })().catch((err) => {
    // Không cache lần nạp hỏng — lần gọi sau còn thử lại.
    if (globalThis.__bkftStore === handle) globalThis.__bkftStore = undefined;
    throw err;
  });
  globalThis.__bkftStore = handle;
  return handle.promise;
}

/** Ép kiểm và nạp lại ngay, bỏ qua cửa sổ chặn. Đường nhanh cho
 *  /api/chatbot/reload, để job không phải chờ tới nhịp stat tiếp theo. */
export async function reloadStore(): Promise<{
  version: number | null;
  chunks: number;
  changed: boolean;
}> {
  // Chốt phiên bản TRƯỚC khi làm gì cả, và so ở cuối.
  //
  // Đo được vì sao không thể chỉ lấy kết quả của maybeReload(): getStore() ở
  // dòng dưới tự nó đã có thể nạp lại (nó chạy kiểm mtime bên trong). Khi điều
  // đó xảy ra, lần maybeReload(force) sau thấy mtime đã khớp nên trả false —
  // và /reload báo "khong co gi doi" ngay sau khi vừa đổi. Quan sát thật:
  // store_version nhảy từ ...212736 sang ...457144 kèm changed:false.
  //
  // `changed` là thứ job hàng tuần ghi vào log để phân biệt "đã cập nhật" với
  // "tưởng là đã cập nhật", nên nó sai là hỏng đúng chỗ nó sinh ra để phục vụ.
  const before = globalThis.__bkftStore?.version ?? null;
  await getStore();
  const h = globalThis.__bkftStore;
  if (!h) return { version: null, chunks: 0, changed: false };
  await maybeReload(h, true);
  return { version: h.version, chunks: h.chunks, changed: h.version !== before };
}

/** Ảnh chụp trạng thái cho /api/health. Không chạm đĩa, không nạp gì. */
export function storeInfo(): { version: number | null; chunks: number } | null {
  const h = globalThis.__bkftStore;
  return h ? { version: h.version, chunks: h.chunks } : null;
}
