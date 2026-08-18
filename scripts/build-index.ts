/**
 * Build data/faiss_index_js/store.json from data/processed/chunks.json.
 *
 * chunks.json is still produced by the existing Python crawl/parse pipeline
 * (BaseCrawler -> parsers -> CrawlAndParseOrchestrator) — that side is not
 * being rewritten, only what happens to the chunks *after* they exist. This
 * script is the JS equivalent of whatever script built the Python FAISS
 * index: it embeds each chunk once, offline, and writes a single JSON file
 * vectorStore.ts loads at request time.
 *
 * Field names (chunk_id, url, title, published_at, collection, raw, content)
 * verified against the crawler's real output (data/chunks_all.jsonl, 694
 * records). If a future crawler run uses different key names, adjust the
 * `toChunkRecord()` mapping below rather than the rest of the pipeline.
 *
 * `content` and `raw` are NOT interchangeable, and which one goes where is the
 * whole point of chunking.py's build_context_header():
 *
 *   content = "[BK Fintech]\nAssoc. Prof. Nguyen Binh Minh Dean | ..."  -> embedded
 *   raw     = "Assoc. Prof. Nguyen Binh Minh Dean | ..."                -> sent to the LLM
 *
 * The breadcrumb exists to steer the *embedding*: that chunk answers "who is
 * the Dean of the institute?" but its own text never names the institute, so
 * embedded without the header it cannot be retrieved by any question that
 * mentions BK Fintech. Feeding the header to the LLM instead would just be
 * noise it might quote back, which is why llm.ts reads `raw` (same split as
 * llm.py). Embedding `raw` here was the original port bug — it silently cost
 * retrieval the header on 681 of 694 chunks.
 *
 * Run with: npm run build-index
 * (loads the ~1.1GB BGE-M3 model — expect this to take a while and use
 * several GB of RAM; not something to run inside a serverless function)
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { buildIdf, embedDense, lexicalWeights } from "../src/lib/chatbot/embedding";
import type {
  ChunkRecord,
  StoredChunk,
  StoredIndex,
} from "../src/lib/chatbot/vectorStore";
import { INDEX_DIR } from "../src/lib/chatbot/config";
// COLLECTION_LABEL + embeddedText da chuyen sang src/lib/chatbot/embeddedText.ts
// de pha B cua job hang tuan (scripts/crawl/embed.ts) dung CHUNG mot dinh nghia.
// Hai noi dung chuoi khac nhau mot ky tu la vector nam lech khoi khong gian cua
// nhung vector con lai, va trieu chung duy nhat la chat luong tra loi te dan.
import { embeddedText } from "../src/lib/chatbot/embeddedText";

// data/chunks_all.jsonl, KHÔNG phải data/processed/chunks.json như trước. File
// kia không tồn tại trong repo — `npm run build-index` chạy trần luôn chết ngay
// ở readFile với ENOENT, và cách duy nhất để build được là tự set
// CHATBOT_CHUNKS_PATH, một bước không ghi ở đâu cả. Mặc định phải là file thật
// mà crawler đang sinh ra; parseChunks() bên dưới vốn đã đọc được JSONL nên
// không cần đổi gì thêm. Env var vẫn còn để trỏ sang file khác khi cần.
const CHUNKS_PATH =
  process.env.CHATBOT_CHUNKS_PATH ||
  path.join(process.cwd(), "data", "chunks_all.jsonl");

interface RawChunk {
  chunk_id?: string;
  id?: string;
  url: string;
  title?: string;
  published_at?: string;
  collection?: string;
  raw?: string;
  content?: string;
  text?: string;
}

function toChunkRecord(raw: RawChunk, fallbackIndex: number): ChunkRecord {
  // `||`, not `??`: the crawler emits `raw: ""` (not a missing key) on chunks
  // whose text never got a context header — 6 of them as of this run. `??`
  // would take the empty string and trip the guard below, aborting the build.
  // Falling through to `content` reproduces exactly what these chunks held in
  // the previous index, where raw and content were the same string.
  const text = raw.raw || raw.content || raw.text || "";
  if (!text) {
    throw new Error(
      `Chunk #${fallbackIndex} (url=${raw.url}) has no raw/content/text field — ` +
        `check chunks.json's actual field name and update toChunkRecord().`
    );
  }
  return {
    chunk_id: raw.chunk_id ?? raw.id ?? `chunk_${fallbackIndex}`,
    url: raw.url,
    title: raw.title,
    published_at: raw.published_at,
    collection: raw.collection,
    raw: text,
    // Kept alongside `raw`, not merged into it — see the header comment.
    content: raw.content,
  };
}

/**
 * Accepts both shapes the crawler has been seen to emit: a single JSON array
 * (chunks.json) and one-object-per-line JSONL (chunks_all.jsonl). Detected by
 * content rather than file extension, so a mis-named file still works.
 * Line-level parse errors name the line number — with hundreds of records, "is
 * not valid JSON" alone is not enough to find the bad one.
 */
function parseChunks(text: string): RawChunk[] {
  if (text.trimStart().startsWith("[")) return JSON.parse(text) as RawChunk[];
  return text
    .split(/\r?\n/)
    .map((line, i) => ({ line: line.trim(), n: i + 1 }))
    .filter(({ line }) => line)
    .map(({ line, n }) => {
      try {
        return JSON.parse(line) as RawChunk;
      } catch (err) {
        throw new Error(`${CHUNKS_PATH} dòng ${n}: JSON không hợp lệ — ${err}`);
      }
    });
}

async function main() {
  console.log(`Đọc chunks từ ${CHUNKS_PATH} ...`);
  const raw = parseChunks(await readFile(CHUNKS_PATH, "utf-8"));
  console.log(`  ${raw.length} chunk. Bắt đầu embedding (BGE-M3, lần đầu sẽ tải model) ...`);

  const records = raw.map(toChunkRecord);
  const indexedTexts = records.map(embeddedText);

  // IDF needs the whole corpus before any single document can be weighted, so
  // it is a separate pass — cheap next to embedding (tokenizing 694 chunks is
  // milliseconds, embedding them is minutes).
  const idf = buildIdf(indexedTexts);
  console.log(`  từ vựng: ${idf.size} token. Bắt đầu embedding (BGE-M3, lần đầu sẽ tải model) ...`);

  const stored: StoredChunk[] = [];
  const started = Date.now();
  for (let i = 0; i < records.length; i++) {
    // Both halves of the hybrid score must see the same text, or the lexical
    // rerank would match on tokens the dense vector never saw.
    const indexed = indexedTexts[i];
    const dense = await embedDense(indexed);
    const lexical = Array.from(lexicalWeights(indexed, idf).entries());
    stored.push({ ...records[i], dense, lexical });
    if ((i + 1) % 25 === 0 || i === records.length - 1) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`  ${i + 1}/${records.length} (${elapsed}s)`);
    }
  }

  await mkdir(INDEX_DIR, { recursive: true });
  const outPath = path.join(INDEX_DIR, "store.json");
  const index: StoredIndex = { idf: Array.from(idf.entries()), chunks: stored };
  await writeFile(outPath, JSON.stringify(index));
  console.log(`Đã ghi ${stored.length} chunk + ${idf.size} token IDF vào ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
