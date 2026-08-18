/**
 * Báo cáo độ phủ của cache embedding — trả lời đúng một câu hỏi:
 * "nếu chạy pha B ngay bây giờ thì phải embed bao nhiêu chunk?"
 *
 *   npx tsx scripts/crawl/cache-report.ts
 *
 * Con số đó chính là độ dài cửa sổ bảo trì. Chạy được mà không cần nạp model,
 * nên dùng được cả trong giờ hành chính để ước lượng trước.
 */
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";

const hashOf = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

async function readJsonl<T>(p: string): Promise<T[]> {
  if (!existsSync(p)) return [];
  return (await readFile(p, "utf-8"))
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

interface Chunk {
  chunk_id: string;
  collection?: string;
  content?: string;
  raw: string;
}

async function main() {
  const cache = new Set<string>();
  for (const r of await readJsonl<{ hash: string }>("data/embeddings.cache.jsonl")) {
    cache.add(r.hash);
  }

  const groups: [string, string][] = [
    ["dong bang", "data/chunks_frozen.jsonl"],
    ["live (moi crawl)", "data/crawl-output.jsonl"],
  ];

  let totalMiss = 0;
  console.log(`cache: ${cache.size} vector\n`);
  for (const [label, file] of groups) {
    const chunks = await readJsonl<Chunk>(file);
    const miss = chunks.filter((c) => !cache.has(hashOf(embeddedText(c))));
    totalMiss += miss.length;
    const hit = chunks.length - miss.length;
    const pct = chunks.length ? ((hit / chunks.length) * 100).toFixed(1) : "0.0";
    console.log(`${label.padEnd(18)} ${String(hit).padStart(4)}/${String(chunks.length).padEnd(5)} hit (${pct}%)`);
    if (miss.length) {
      const byCollection = new Map<string, number>();
      for (const c of miss) {
        const k = c.collection ?? "(khong ro)";
        byCollection.set(k, (byCollection.get(k) ?? 0) + 1);
      }
      for (const [k, n] of [...byCollection].sort((a, b) => b[1] - a[1])) {
        console.log(`                   thieu ${String(n).padStart(4)}  ${k}`);
      }
    }
  }
  console.log(`\nPHAI EMBED: ${totalMiss} chunk  <- do dai cua so bao tri phu thuoc con so nay`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
