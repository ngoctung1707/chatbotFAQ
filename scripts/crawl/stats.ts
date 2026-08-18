/**
 * Thống kê tổng hợp sau một lần chạy pipeline — dùng để đối chiếu kho cũ với
 * kho mới sau khi chuyển đổi.
 *
 *   npx tsx scripts/crawl/stats.ts
 *
 * Không nạp model, không sửa gì. Chỉ đọc và đếm.
 */
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";

interface Chunk {
  chunk_id: string;
  url: string;
  raw: string;
  content?: string;
  collection?: string;
  lang?: string;
  source?: string;
  source_id?: string;
}

async function readJsonl<T>(p: string): Promise<T[]> {
  if (!existsSync(p)) return [];
  return (await readFile(p, "utf-8"))
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

const mb = async (p: string) => (existsSync(p) ? ((await stat(p)).size / 1048576).toFixed(1) : "-");

function dist(nums: number[]) {
  const a = [...nums].sort((x, y) => x - y);
  const at = (q: number) => a[Math.min(a.length - 1, Math.floor(a.length * q))];
  return { min: a[0], p50: at(0.5), p90: at(0.9), max: a[a.length - 1] };
}

function tally<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = key(i) || "(khong ro)";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1]);
}

const pad = (s: string | number, n: number) => String(s).padStart(n);

async function main() {
  const old = await readJsonl<Chunk>("data/chunks_all.jsonl");
  const frozen = await readJsonl<Chunk>("data/chunks_frozen.jsonl");
  const live = await readJsonl<Chunk>("data/crawl-output.jsonl");
  const fresh = [...frozen, ...live];

  console.log("========== KHO CU vs KHO MOI ==========\n");
  console.log(`                        cu      moi`);
  console.log(`  tong chunk       ${pad(old.length, 7)}  ${pad(fresh.length, 7)}`);
  console.log(`  URL duy nhat     ${pad(new Set(old.map((c) => c.url)).size, 7)}  ${pad(new Set(fresh.map((c) => c.url)).size, 7)}`);

  const dOld = dist(old.map((c) => (c.content ?? c.raw).length));
  const dNew = dist(fresh.map((c) => (c.content ?? c.raw).length));
  console.log(`  do dai p50       ${pad(dOld.p50, 7)}  ${pad(dNew.p50, 7)}`);
  console.log(`  do dai p90       ${pad(dOld.p90, 7)}  ${pad(dNew.p90, 7)}`);
  console.log(`  do dai max       ${pad(dOld.max, 7)}  ${pad(dNew.max, 7)}`);

  console.log("\n---------- kho moi: theo nhom ----------");
  console.log(`  dong bang        ${pad(frozen.length, 5)} chunk / ${new Set(frozen.map((c) => c.url)).size} URL`);
  console.log(`  live (crawl)     ${pad(live.length, 5)} chunk / ${new Set(live.map((c) => c.url)).size} URL`);

  console.log("\n---------- kho moi: theo collection ----------");
  for (const [k, v] of tally(fresh, (c) => c.collection ?? "")) {
    const o = old.filter((c) => (c.collection ?? "") === k).length;
    const delta = v - o;
    const sign = delta > 0 ? `+${delta}` : String(delta);
    console.log(`  ${k.padEnd(14)} ${pad(v, 5)}   (cu ${pad(o, 4)}, ${sign})`);
  }

  console.log("\n---------- kho moi: theo ngon ngu ----------");
  for (const [k, v] of tally(live, (c) => c.lang ?? "")) console.log(`  ${k.padEnd(14)} ${pad(v, 5)}`);

  console.log("\n---------- file ----------");
  for (const f of [
    "data/faiss_index_js/store.json",
    "data/embeddings.cache.jsonl",
    "data/crawl-output.jsonl",
    "data/chunks_frozen.jsonl",
    "data/crawl_state.json",
  ]) {
    console.log(`  ${f.padEnd(38)} ${pad(await mb(f), 6)} MB`);
  }

  const cache = await readJsonl<{ hash: string }>("data/embeddings.cache.jsonl");
  console.log(`\n  cache: ${cache.length} vector (${new Set(cache.map((c) => c.hash)).size} hash duy nhat)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
