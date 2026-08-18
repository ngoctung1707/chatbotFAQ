/**
 * PHA C — mục 4.3 và 4.7. Dựng lại store.json từ chunk + cache.
 *
 *   npx tsx scripts/crawl/build-store.ts
 *   npx tsx scripts/crawl/build-store.ts --dry-run
 *
 * KHÔNG nạp model. Đây là điểm mấu chốt khiến pha này nằm ngoài cửa sổ bảo trì:
 * `buildIdf` và `lexicalWeights` tách token bằng regex thuần, không đụng tới
 * tokenizer lẫn ONNX. Nên dù phải chạy trên TOÀN BỘ kho, nó chỉ tốn vài giây và
 * vài trăm MB.
 *
 * Vì sao vẫn phải chạy trên toàn bộ: trọng số lexical đã được nhân IDF sẵn khi
 * lưu, mà IDF là đại lượng của cả kho. Thêm hay bớt một chunk là mọi chunk khác
 * lệch trọng số. Dense thì ngược lại — độc lập từng chunk, nên lấy hết từ cache.
 *
 * Nguyên tắc: cache embedding, ĐỪNG cache chỉ mục.
 */
import { readFile, writeFile, rename, readdir, unlink, statfs } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import { buildIdf, lexicalWeights } from "../../src/lib/chatbot/embedding";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";
import { INDEX_DIR } from "../../src/lib/chatbot/config";

const CACHE = "data/embeddings.cache.jsonl";
// Cho phep doi nguon de kiem chung tung phan — vi du dung rieng nhom dong bang
// (von hit cache 100%) de chay thu ca pha C ma khong can nap model lan nao.
const SOURCES = (process.env.CRAWL_STORE_SOURCES ??
  "data/chunks_frozen.jsonl,data/crawl-output.jsonl")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const KEEP_VERSIONS = 3;
/** Muc 5.1 — giam qua nguong nay thi huy, gan nhu chac chan la su co chu khong
 *  phai vien that su xoa mot phan nam kho trong mot tuan. */
const MAX_SHRINK = 0.20;
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

const hashOf = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

interface Chunk {
  chunk_id: string;
  url: string;
  title?: string;
  published_at?: string | null;
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

/** Giữ N bản gần nhất, xoá phần còn lại. Thư mục chỉ mục từng tích 120MB backup tay. */
async function pruneVersions(dir: string) {
  const files = (await readdir(dir))
    .filter((f) => /^store\.\d{8}-\d{6}\.json$/.test(f))
    .sort()
    .reverse();
  for (const f of files.slice(KEEP_VERSIONS)) await unlink(path.join(dir, f));
  return files.length;
}

const stamp = () =>
  new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);

async function main() {
  const cache = new Map<string, number[]>();
  for (const r of await readJsonl<{ hash: string; dense: number[] }>(CACHE)) {
    cache.set(r.hash, r.dense);
  }

  const chunks: Chunk[] = [];
  for (const f of SOURCES) chunks.push(...(await readJsonl<Chunk>(f)));
  if (!chunks.length) {
    console.error("khong co chunk nao — dung lai, KHONG ghi de store cu.");
    process.exit(1);
  }

  const texts = chunks.map(embeddedText);
  const missing = texts.filter((t) => !cache.has(hashOf(t))).length;
  if (missing) {
    // Dựng store thiếu vector là hỏng câm: chunk đó vẫn nằm trong chỉ mục nhưng
    // không bao giờ được truy hồi. Thà dừng hẳn.
    console.error(`THIEU ${missing}/${chunks.length} vector trong cache.`);
    console.error("Chay pha B truoc: npx tsx scripts/crawl/embed.ts");
    process.exit(1);
  }

  // MUC 5.1 — van chong tut so luong.
  const livePath = path.join(INDEX_DIR, "store.json");
  if (existsSync(livePath) && !DRY_RUN) {
    const old = JSON.parse(await readFile(livePath, "utf-8")) as { chunks: unknown[] };
    const before = old.chunks?.length ?? 0;
    const shrink = before ? (before - chunks.length) / before : 0;
    if (shrink > MAX_SHRINK) {
      const pct = (shrink * 100).toFixed(1);
      console.error(`HUY: so chunk tut ${pct}% (${before} -> ${chunks.length}).`);
      console.error("Gan nhu chac chan la site loi hoac crawler bi chan, khong phai noi dung that su bi xoa.");
      console.error("Giu nguyen store cu. Neu that su co y giam, chay lai voi --force.");
      if (!FORCE) process.exit(1);
      console.error("(--force: bo qua van 5.1)");
    }
  }

  // MUC 5.6 — dia day giua luc ghi 20MB la chuyen co that tren may vat ly.
  try {
    const st = await statfs(INDEX_DIR);
    const freeMb = (st.bsize * st.bavail) / 1024 / 1024;
    if (freeMb < 200) {
      console.error(`HUY: chi con ${freeMb.toFixed(0)}MB trong o dia chua chi muc.`);
      console.error("Can it nhat 200MB cho ban moi cong cac ban giu lai.");
      process.exit(1);
    }
  } catch {
    // statfs khong co tren moi nen tang — khong coi la loi.
  }

  console.log(`${chunks.length} chunk, ${cache.size} vector trong cache`);
  const t0 = Date.now();
  const idf = buildIdf(texts);
  const stored = chunks.map((c, i) => ({
    chunk_id: c.chunk_id,
    url: c.url,
    title: c.title,
    published_at: c.published_at,
    collection: c.collection,
    raw: c.raw,
    content: c.content,
    dense: cache.get(hashOf(texts[i]))!,
    lexical: Array.from(lexicalWeights(texts[i], idf).entries()),
  }));
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`IDF ${idf.size} token + lexical cho ${stored.length} chunk trong ${elapsed}s (khong nap model)`);

  if (DRY_RUN) {
    console.log("(dry-run — khong ghi file nao)");
    return;
  }

  const versioned = path.join(INDEX_DIR, `store.${stamp()}.json`);
  const live = path.join(INDEX_DIR, "store.json");
  const payload = JSON.stringify({ idf: Array.from(idf.entries()), chunks: stored });

  // Ghi bản có dấu thời gian trước, rồi mới đưa vào vị trí đang phục vụ. Trên
  // Linux có thể thay bước này bằng symlink để rollback chỉ là trỏ lại; rename
  // là bản tương đương chạy được trên cả Windows, và rollback khi đó là chép
  // một bản cũ đè lên store.json.
  await writeFile(versioned, payload);
  const tmp = live + ".tmp";
  await writeFile(tmp, payload);
  await rename(tmp, live);

  const kept = await pruneVersions(INDEX_DIR);
  const mb = (payload.length / 1024 / 1024).toFixed(1);
  console.log(`da ghi ${versioned} (${mb}MB) va thay ${live}`);
  console.log(`giu ${Math.min(kept, KEEP_VERSIONS)} ban gan nhat, xoa phan cu hon`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
