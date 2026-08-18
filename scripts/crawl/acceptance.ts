/**
 * MỤC 7.2 và 7.3 — nghiệm thu bằng cách đối chiếu với kho cũ.
 *
 *   npx tsx scripts/crawl/acceptance.ts
 *
 * Kho cũ do người làm ra, nên nó là "đáp án" duy nhất ta có. Đây là bài kiểm
 * tra giá trị nhất, vì nó bắt được loại lỗi mà hai bài test hash KHÔNG bắt
 * được: hash hoàn toàn có thể ổn định qua mọi lần crawl trên một nội dung sai.
 *
 * 7.2  URL nào có trong kho cũ mà biến mất khỏi bản mới -> crawler bỏ sót.
 * 7.3  Với URL còn lại, text trích ra lệch bao nhiêu so với `raw` cũ.
 *
 * Không nạp model, chạy được bất cứ lúc nào.
 */
import { readFile } from "fs/promises";
import { existsSync } from "fs";

interface Chunk {
  chunk_id: string;
  url: string;
  raw: string;
  collection?: string;
  source?: string;
}

async function readJsonl(p: string): Promise<Chunk[]> {
  if (!existsSync(p)) return [];
  return (await readFile(p, "utf-8"))
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Chunk);
}

/** Chuẩn hoá nhẹ để so nội dung, không so định dạng. */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Tỉ lệ token của bản cũ còn tìm thấy trong bản mới. */
function coverage(oldText: string, newText: string): number {
  const a = new Set(norm(oldText).split(" ").filter((t) => t.length > 2));
  if (!a.size) return 1;
  const b = new Set(norm(newText).split(" ").filter((t) => t.length > 2));
  let hit = 0;
  for (const t of a) if (b.has(t)) hit++;
  return hit / a.size;
}

function groupByUrl(chunks: Chunk[]) {
  const m = new Map<string, string[]>();
  for (const c of chunks) {
    if (!m.has(c.url)) m.set(c.url, []);
    m.get(c.url)!.push(c.raw ?? "");
  }
  return m;
}

async function main() {
  const old = await readJsonl("data/chunks_all.jsonl");
  const fresh = [
    ...(await readJsonl("data/chunks_frozen.jsonl")),
    ...(await readJsonl("data/crawl-output.jsonl")),
  ];
  if (!old.length || !fresh.length) {
    console.error("thieu chunks_all.jsonl hoac crawl-output.jsonl");
    process.exit(1);
  }

  const oldByUrl = groupByUrl(old);
  const newByUrl = groupByUrl(fresh);

  // ---- 7.2 ----
  const registry = JSON.parse(await readFile("data/sources.registry.json", "utf-8"));
  const decided = new Set<string>();
  for (const p of registry.pending_sources ?? []) decided.add(p.url);
  for (const o of registry.out_of_scope ?? []) if (o.url) decided.add(o.url);

  const missing: string[] = [];
  for (const url of oldByUrl.keys()) {
    if (newByUrl.has(url)) continue;
    missing.push(url);
  }
  const explained = missing.filter((u) => decided.has(u));
  const unexplained = missing.filter((u) => !decided.has(u));

  console.log("=== 7.2 — URL cu con trong ban moi khong ===");
  console.log(`  kho cu      : ${oldByUrl.size} URL`);
  console.log(`  ban moi     : ${newByUrl.size} URL`);
  console.log(`  bien mat    : ${missing.length}`);
  console.log(`    co ly do  : ${explained.length} (da quyet dinh trong registry)`);
  console.log(`    CHUA ro   : ${unexplained.length}`);
  for (const u of unexplained) {
    const n = oldByUrl.get(u)!.length;
    console.log(`      ${n} chunk  ${u}`);
  }

  // ---- 7.3 ----
  console.log("\n=== 7.3 — text trich ra so voi `raw` cu ===");
  const rows: { url: string; cov: number; oldLen: number; newLen: number }[] = [];
  for (const [url, oldTexts] of oldByUrl) {
    const newTexts = newByUrl.get(url);
    if (!newTexts) continue;
    const o = oldTexts.join(" ");
    const n = newTexts.join(" ");
    rows.push({ url, cov: coverage(o, n), oldLen: o.length, newLen: n.length });
  }
  rows.sort((a, b) => a.cov - b.cov);

  const bands = { "≥0.9": 0, "0.7–0.9": 0, "0.5–0.7": 0, "<0.5": 0 };
  for (const r of rows) {
    if (r.cov >= 0.9) bands["≥0.9"]++;
    else if (r.cov >= 0.7) bands["0.7–0.9"]++;
    else if (r.cov >= 0.5) bands["0.5–0.7"]++;
    else bands["<0.5"]++;
  }
  console.log(`  so sanh duoc ${rows.length} URL`);
  for (const [k, v] of Object.entries(bands)) console.log(`    do phu ${k.padEnd(8)} ${v} URL`);

  const worst = rows.filter((r) => r.cov < 0.7);
  if (worst.length) {
    console.log(`\n  ${worst.length} URL phu duoi 70% — can xem lai bo trich xuat:`);
    for (const r of worst.slice(0, 15)) {
      console.log(
        `    ${(r.cov * 100).toFixed(0).padStart(3)}%  ${String(r.oldLen).padStart(5)} -> ${String(r.newLen).padEnd(6)} ${r.url.replace("https://fintech.hust.edu.vn", "")}`
      );
    }
  }

  const fail = unexplained.length > 0 || worst.length > 0;
  console.log(fail ? "\nCHUA DAT — xem cac muc o tren." : "\nDAT.");
  if (fail) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
