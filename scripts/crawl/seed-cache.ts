/**
 * Nạp cache embedding từ chỉ mục hiện có. Chạy MỘT LẦN khi chuyển sang pipeline
 * mới:
 *
 *   npx tsx scripts/crawl/seed-cache.ts
 *
 * Vì sao đáng làm: 405 chunk đóng băng (báo cáo VDER + 4 domain ngoài) sẽ không
 * bao giờ được crawl lại, nhưng pha C vẫn cần vector của chúng để dựng store.
 * Vector đó đã nằm sẵn trong data/faiss_index_js/store.json từ lần build trước.
 * Không nạp thì lần chạy đầu của pipeline mới phải embed lại cả 405 chunk —
 * vài phút bảo trì hoàn toàn vô ích.
 *
 * Khoá cache là hash của CHUỖI ĐƯỢC EMBED, không phải chunk_id. Nhờ vậy chunk
 * nào có nội dung không đổi vẫn hit dù id đã đổi theo lược đồ mới.
 */
import { readFile, appendFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import { INDEX_DIR } from "../../src/lib/chatbot/config";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";

const CACHE = "data/embeddings.cache.jsonl";
const hashOf = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

interface StoredChunk {
  chunk_id: string;
  collection?: string;
  content?: string;
  raw: string;
  dense: number[];
}

async function main() {
  const storePath = path.join(INDEX_DIR, "store.json");
  if (!existsSync(storePath)) {
    console.error(`khong tim thay ${storePath} — chua co chi muc de nap.`);
    process.exit(1);
  }

  console.log(`doc ${storePath} ...`);
  const store = JSON.parse(await readFile(storePath, "utf-8")) as {
    chunks: StoredChunk[];
  };

  const existing = new Set<string>();
  if (existsSync(CACHE)) {
    for (const line of (await readFile(CACHE, "utf-8")).split("\n")) {
      if (!line.trim()) continue;
      existing.add(JSON.parse(line).hash);
    }
  }

  const lines: string[] = [];
  let dims = 0;
  let skipped = 0;
  for (const c of store.chunks) {
    if (!Array.isArray(c.dense) || !c.dense.length) {
      skipped++;
      continue;
    }
    dims = c.dense.length;
    const hash = hashOf(embeddedText(c));
    if (existing.has(hash)) continue;
    existing.add(hash);
    lines.push(JSON.stringify({ hash, dense: c.dense }));
  }

  if (lines.length) await appendFile(CACHE, lines.join("\n") + "\n");
  else if (!existsSync(CACHE)) await writeFile(CACHE, "");

  console.log(`  ${store.chunks.length} chunk trong store, ${dims} chieu`);
  console.log(`  them ${lines.length} vector vao ${CACHE}`);
  console.log(`  cache hien co ${existing.size} vector`);
  if (skipped) console.log(`  bo qua ${skipped} chunk khong co dense`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
