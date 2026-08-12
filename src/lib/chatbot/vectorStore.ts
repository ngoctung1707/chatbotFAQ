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
import { readFile } from "fs/promises";
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
