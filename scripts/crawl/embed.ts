/**
 * PHA B — mục 4.2. Pha DUY NHẤT cần model, và là pha duy nhất cần bảo trì.
 *
 *   npx tsx scripts/crawl/embed.ts            # embed phần còn thiếu
 *   npx tsx scripts/crawl/embed.ts --dry-run  # chỉ đếm, không nạp model
 *
 * Chỉ embed những chunk mà cache CHƯA có. Thời lượng tỉ lệ với lượng nội dung
 * mới trong tuần chứ không với kích thước kho — đó là lý do mục 4.4 bỏ hẳn được
 * pha này ở những tuần không có gì đổi.
 *
 * Ghi cache theo kiểu nối thêm từng dòng và flush ngay: job bị kill giữa chừng
 * (watchdog ở mục 5.4) vẫn giữ được phần đã embed, lần sau chạy tiếp chứ không
 * làm lại từ đầu.
 */
import { readFile, appendFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { embedDense } from "../../src/lib/chatbot/embedding";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";

const CACHE = "data/embeddings.cache.jsonl";
const SOURCES = ["data/chunks_frozen.jsonl", "data/crawl-output.jsonl"];
const DRY_RUN = process.argv.includes("--dry-run");

const hashOf = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

interface Chunk {
  chunk_id: string;
  collection?: string;
  content?: string;
  raw: string;
}

async function readJsonl<T>(p: string): Promise<T[]> {
  if (!existsSync(p)) return [];
  return (await readFile(p, "utf-8"))
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

async function main() {
  const cache = new Set<string>();
  for (const r of await readJsonl<{ hash: string }>(CACHE)) cache.add(r.hash);

  // Gộp theo hash, không theo chunk_id: hai chunk có nội dung y hệt chỉ tốn một
  // lần chạy model.
  const todo = new Map<string, string>();
  for (const file of SOURCES) {
    for (const c of await readJsonl<Chunk>(file)) {
      const text = embeddedText(c);
      const h = hashOf(text);
      if (!cache.has(h)) todo.set(h, text);
    }
  }

  console.log(`cache co ${cache.size} vector`);
  console.log(`can embed ${todo.size} chunk`);
  if (!todo.size) {
    console.log("khong co gi de embed — pha B duoc bo qua hoan toan (muc 4.4)");
    return;
  }
  if (DRY_RUN) {
    console.log("(dry-run — khong nap model)");
    return;
  }

  console.log("nap BGE-M3 ...");
  const rss0 = process.memoryUsage().rss;
  const started = Date.now();
  let done = 0;
  let peakRss = rss0;
  for (const [h, text] of todo) {
    const dense = await embedDense(text);
    // Ghi ngay từng dòng thay vì gom cuối: bị kill giữa chừng vẫn giữ được
    // phần đã làm.
    await appendFile(CACHE, JSON.stringify({ hash: h, dense }) + "\n");
    done++;
    const rss = process.memoryUsage().rss;
    if (rss > peakRss) peakRss = rss;
    if (done % 25 === 0 || done === todo.size) {
      const s = (Date.now() - started) / 1000;
      const eta = ((s / done) * (todo.size - done)).toFixed(0);
      console.log(`  ${done}/${todo.size}  ${s.toFixed(1)}s  con ~${eta}s`);
    }
  }
  const total = (Date.now() - started) / 1000;
  const mb = (b: number) => (b / 1024 / 1024).toFixed(0);
  console.log(`xong ${done} chunk trong ${total.toFixed(1)}s`);
  console.log(`  ${((total / done) * 1000).toFixed(0)}ms moi chunk`);
  console.log(`  RSS: truoc khi nap model ${mb(rss0)}MB -> dinh ${mb(peakRss)}MB`);
  console.log(`=> cua so bao tri that su cua tuan nay: ~${total.toFixed(0)}s cong thoi gian restart`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
