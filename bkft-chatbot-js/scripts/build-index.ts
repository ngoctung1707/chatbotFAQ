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
 * ASSUMPTION TO VERIFY: the field names below (chunk_id, url, title,
 * published_at, collection, raw) are inferred from how llm.py and
 * retriever.py *read* chunks — format_sources() reads title/published_at/
 * url/raw, MockAnswerer reads collection/chunk_id. If the real
 * chunks.json from the crawler uses different key names, adjust the
 * `toChunkRecord()` mapping below rather than the rest of the pipeline.
 *
 * Run with: npm run build-index
 * (loads the ~1.1GB BGE-M3 model — expect this to take a while and use
 * several GB of RAM; not something to run inside a serverless function)
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { embedDense, lexicalWeights } from "../src/lib/embedding";
import type { ChunkRecord, StoredChunk } from "../src/lib/vectorStore";
import { INDEX_DIR } from "../src/lib/config";

const CHUNKS_PATH =
  process.env.CHATBOT_CHUNKS_PATH ||
  path.join(process.cwd(), "data", "processed", "chunks.json");

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
  const text = raw.raw ?? raw.content ?? raw.text ?? "";
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
  };
}

async function main() {
  console.log(`Đọc chunks từ ${CHUNKS_PATH} ...`);
  const raw = JSON.parse(await readFile(CHUNKS_PATH, "utf-8")) as RawChunk[];
  console.log(`  ${raw.length} chunk. Bắt đầu embedding (BGE-M3, lần đầu sẽ tải model) ...`);

  const stored: StoredChunk[] = [];
  const started = Date.now();
  for (let i = 0; i < raw.length; i++) {
    const record = toChunkRecord(raw[i], i);
    const dense = await embedDense(record.raw);
    const lexical = Array.from(lexicalWeights(record.raw).entries());
    stored.push({ ...record, dense, lexical });
    if ((i + 1) % 25 === 0 || i === raw.length - 1) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`  ${i + 1}/${raw.length} (${elapsed}s)`);
    }
  }

  await mkdir(INDEX_DIR, { recursive: true });
  const outPath = path.join(INDEX_DIR, "store.json");
  await writeFile(outPath, JSON.stringify(stored));
  console.log(`Đã ghi ${stored.length} chunk vào ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
