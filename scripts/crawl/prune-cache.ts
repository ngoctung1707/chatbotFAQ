/**
 * MỤC 5.7 — dọn vector mồ côi khỏi `embeddings.cache.jsonl`.
 *
 *   npx tsx scripts/crawl/prune-cache.ts
 *   npx tsx scripts/crawl/prune-cache.ts --dry-run
 *
 * Cache chỉ được ghi nối thêm ([embed.ts] ghi từng dòng ngay sau mỗi chunk, để
 * bị kill giữa chừng vẫn giữ được phần đã làm), và trước script này thì không
 * có chỗ nào xoá bớt. Mỗi lần một bài viết được sửa, vector của bản cũ nằm lại
 * vĩnh viễn. Đo được sau vài lần chạy thử: 1148 vector cho 820 chunk đang dùng
 * — 328 cái mồ côi, tức 28%.
 *
 * Bản thân 25MB không phải vấn đề. Vấn đề là nó KHÔNG BAO GIỜ giảm, và
 * `backup-state.sh` giữ 8 mốc nên mỗi MB thừa được nhân lên tám lần. Van đĩa của
 * pha C là 200MB, tức cùng bậc độ lớn với tốc độ phình này trong khoảng một năm.
 *
 * ─── VÌ SAO CHẠY SAU CỔNG QA, KHÔNG PHẢI TRƯỚC ───────────────────────────────
 *
 * Xoá vector là việc không lùi được: lấy lại đúng nghĩa là chạy model lại. Nên
 * nó chỉ được phép chạy khi kho mới đã qua mọi van và đã vào vị trí phục vụ. Nếu
 * cổng QA trượt và store cũ được khôi phục thì cache PHẢI còn nguyên — lần chạy
 * sau còn dùng lại.
 *
 * Và nó phải chạy TRƯỚC `backup-state.sh`, để bản sao lưu là bản đã dọn chứ
 * không phải bản còn rác.
 */
import { readFile, writeFile, rename, stat } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";

const CACHE = "data/embeddings.cache.jsonl";
/** Cùng danh sách nguồn mà pha B và pha C dùng, để ba nơi không lệch nhau. */
const SOURCES = (process.env.CRAWL_STORE_SOURCES ??
  "data/chunks_frozen.jsonl,data/crawl-output.jsonl")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const DRY_RUN = process.argv.includes("--dry-run");
const NL = String.fromCharCode(10);
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
    .split(NL)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

async function main() {
  if (!existsSync(CACHE)) {
    console.log(`khong co ${CACHE} — khong co gi de don.`);
    return;
  }

  // Khoá phải là băm của CHUỖI ĐƯỢC EMBED, giống hệt `embed.ts`. Dùng
  // `chunk_hash` ở đây sẽ không khớp dòng nào và xoá sạch cache.
  const needed = new Set<string>();
  let corpusSize = 0;
  for (const file of SOURCES) {
    const chunks = await readJsonl<Chunk>(file);
    corpusSize += chunks.length;
    for (const c of chunks) needed.add(hashOf(embeddedText(c)));
  }

  // Chốt chặn quan trọng nhất của script này. Kho rỗng nghĩa là có gì đó đã sai
  // từ trước (file thiếu, đường dẫn lệch, chạy nhầm thư mục) — và nếu cứ chạy
  // tiếp thì mọi vector đều "mồ côi" và cache bị xoá sạch. Lấy lại là phải chạy
  // model cho toàn bộ kho: cửa sổ bảo trì tuần sau nhảy từ giây lên phút.
  if (!corpusSize) {
    console.error("HUY: khong doc duoc chunk nao tu " + SOURCES.join(", "));
    console.error("  Don cache luc nay se xoa sach. Kiem tra duong dan va thu muc lam viec.");
    process.exit(1);
  }

  const before = await stat(CACHE);
  const rows = await readJsonl<{ hash: string }>(CACHE);
  const keep = rows.filter((r) => needed.has(r.hash));
  const dropped = rows.length - keep.length;

  console.log(`kho       ${corpusSize} chunk, ${needed.size} vector can dung`);
  console.log(`cache     ${rows.length} vector, ${mb(before.size)}MB`);

  if (!dropped) {
    console.log("khong co vector mo coi — khong ghi gi.");
    return;
  }

  const pct = ((dropped / rows.length) * 100).toFixed(1);
  console.log(`mo coi    ${dropped} vector (${pct}%)`);

  if (DRY_RUN) {
    console.log("(dry-run — khong ghi file nao)");
    return;
  }

  // Ghi file tạm rồi đổi tên: `embed.ts` ghi nối vào chính file này, nên ghi đè
  // tại chỗ sẽ để lại một cache cụt nếu tiến trình chết giữa chừng.
  const payload = keep.map((r) => JSON.stringify(r)).join(NL) + NL;
  const tmp = CACHE + ".tmp";
  await writeFile(tmp, payload);
  await rename(tmp, CACHE);

  const after = await stat(CACHE);
  console.log(`da don    ${mb(before.size)}MB -> ${mb(after.size)}MB (tiet kiem ${mb(before.size - after.size)}MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
