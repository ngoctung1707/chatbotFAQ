/**
 * Báo cáo trạng thái trước khi chạy job — trả lời HAI câu hỏi mà `run-weekly.sh`
 * cần để quyết định có phải bảo trì hay không:
 *
 *   1. "chạy pha B bây giờ thì phải embed bao nhiêu chunk?"  -> PHAI EMBED
 *   2. "store.json đang phục vụ đã khớp với kho hiện tại chưa?" -> STORE
 *
 *   npx tsx scripts/crawl/cache-report.ts
 *
 * Cả hai đều chạy được mà không nạp model, nên dùng được cả trong giờ hành
 * chính để ước lượng trước cửa sổ bảo trì.
 *
 * ─── VÌ SAO CÂU THỨ HAI PHẢI TỒN TẠI ─────────────────────────────────────────
 *
 * Trước đây `run-weekly.sh` bỏ qua pha C khi `PHAI EMBED == 0`. Hai câu hỏi đó
 * chỉ trùng nhau khi lần chạy TRƯỚC đã thành công, và đúng chỗ đó có một lỗ:
 *
 *   pha B xong (cache đã đủ vector) -> pha C hoặc cổng QA hỏng -> thoát
 *   tuần sau: mọi chunk đều hit cache -> PHAI EMBED = 0 -> bỏ qua pha C
 *   => nội dung mới nằm sẵn trong crawl-output.jsonl và trong cache,
 *      nhưng KHÔNG BAO GIỜ vào được store.json. Tuần nào cũng vậy.
 *
 * Kiểu hỏng đó hoàn toàn im lặng: chatbot vẫn chạy, vẫn trả lời, chỉ là bằng dữ
 * liệu cũ mãi mãi. Nên điều kiện bỏ qua phải hỏi thẳng store, chứ không suy ra
 * từ cache.
 *
 * So bằng vân tay của NỘI DUNG chứ không bằng cờ đánh dấu "lần trước đã xong":
 * cờ tự nó cũng lạc được, còn vân tay thì bắt được cả trường hợp có người chép
 * tay một bản store cũ đè lên.
 */
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";
import { INDEX_DIR } from "../../src/lib/chatbot/config";

const NL = String.fromCharCode(10);
const PLAN = "data/crawl-plan.json";
/** Dong con so co tham quyen vao crawl-plan.json cho trang admin doc. */
const WRITE_PLAN = process.argv.includes("--write-plan");

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
  url?: string;
  title?: string | null;
  published_at?: string | null;
}

/**
 * Bảy trường mà pha C thật sự ghi vào store và có ảnh hưởng tới hành vi.
 *
 * `dense` và `lexical` cố ý KHÔNG nằm ở đây, không phải vì bỏ sót: dense suy ra
 * từ `content` + `collection` qua `embeddedText`, còn lexical suy ra từ toàn bộ
 * kho — cả hai đều đã bị bảy trường này quyết định. Đưa chúng vào chỉ làm phép
 * so đắt hơn mà không bắt thêm được gì.
 *
 * `raw` phải có mặt dù không được embed: nó là thứ đi tới LLM. Một chunk sửa
 * `raw` mà giữ nguyên `content` vẫn là một store đã cũ.
 */
const identity = (c: Chunk) =>
  JSON.stringify([
    c.chunk_id,
    c.url ?? null,
    c.title ?? null,
    c.published_at ?? null,
    c.collection ?? null,
    c.content ?? null,
    c.raw,
  ]);

/**
 * Vân tay không phụ thuộc thứ tự: sắp hash rồi mới băm lần nữa.
 *
 * Cố ý bỏ qua thứ tự vì thứ tự không ảnh hưởng gì tới truy hồi — IDF, trọng số
 * lexical và điểm cosine đều độc lập với vị trí trong mảng. Mà kho lại có hai
 * chunk trang chủ đảo chỗ giữa các lần chạy do server sắp theo `-createdAt` với
 * mốc thời gian trùng nhau. Tính cả thứ tự thì tuần nào cũng báo lệch và bắt
 * dựng lại store một cách vô ích.
 */
const fingerprint = (chunks: Chunk[]) =>
  hashOf(
    chunks
      .map((c) => hashOf(identity(c)))
      .sort()
      .join("\n")
  );

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

  // ── Cau hoi thu hai: store dang phuc vu da khop voi kho hien tai chua? ──
  const corpus: Chunk[] = [];
  for (const [, file] of groups) corpus.push(...(await readJsonl<Chunk>(file)));

  const storeState = await checkStore(corpus);

  // MUC 4.4 — dong dau hai con so CO THAM QUYEN vao ke hoach, de trang admin
  // khong phai tu suy dien.
  //
  // Pha A co ban truoc tu chia `need_embed` thanh "co trong cache" / "phai chay
  // model", nhung no chay bang `node` thuan nen khong import duoc
  // `embeddedText()`, va da tra cache bang `chunk_hash` — bam cua RIENG `content`,
  // trong khi khoa cache la bam cua content CONG header. Hai thu do khong bao gio
  // khop: do tren kho that duoc 0/415 hit. Nen phep chia da bi go khoi pha A, va
  // con so dung di ra tu day, noi co san dinh nghia dung.
  if (WRITE_PLAN) {
    if (!existsSync(PLAN)) {
      console.log(`(--write-plan: chua co ${PLAN}, bo qua)`);
    } else {
      try {
        const plan = JSON.parse(await readFile(PLAN, "utf-8")) as {
          totals?: Record<string, number>;
        };
        plan.totals = { ...(plan.totals ?? {}), must_embed: totalMiss };
        (plan as Record<string, unknown>).store_state = storeState;
        await writeFile(PLAN, JSON.stringify(plan, null, 2) + NL);
        console.log(`(--write-plan: da dong must_embed=${totalMiss}, store_state=${storeState} vao ${PLAN})`);
      } catch (err) {
        // Khong dung ca job chi vi mot con so bao cao khong ghi duoc.
        console.log(`(--write-plan: khong ghi duoc ${PLAN} — ${(err as Error).message})`);
      }
    }
  }
}

/** `khop` neu store dang phuc vu dung bang kho hien tai, `lech` neu khong. */
async function checkStore(corpus: Chunk[]): Promise<"khop" | "lech"> {
  const livePath = path.join(INDEX_DIR, "store.json");
  if (!existsSync(livePath)) {
    console.log(`STORE: lech — chua co ${livePath}`);
    return "lech";
  }

  let stored: Chunk[];
  try {
    stored = (JSON.parse(await readFile(livePath, "utf-8")) as { chunks: Chunk[] }).chunks ?? [];
  } catch (err) {
    // Doc khong duoc thi coi nhu lech, khong coi nhu khop. Nghieng ve phia dung
    // lai pha C mot lan thua con hon bo qua mot lan can thiet.
    console.log(`STORE: lech — khong doc duoc ${livePath} (${(err as Error).message})`);
    return "lech";
  }

  if (fingerprint(corpus) === fingerprint(stored)) {
    console.log(`STORE: khop — ${stored.length} chunk, dung bang kho hien tai`);
    return "khop";
  }

  // Lech thi noi ro lech o dau, vi nguoi doc log can biet co phai su co khong.
  const byId = new Map(stored.map((c) => [c.chunk_id, identity(c)]));
  const added = corpus.filter((c) => !byId.has(c.chunk_id)).length;
  const changed = corpus.filter((c) => {
    const old = byId.get(c.chunk_id);
    return old !== undefined && old !== identity(c);
  }).length;
  const ids = new Set(corpus.map((c) => c.chunk_id));
  const removed = stored.filter((c) => !ids.has(c.chunk_id)).length;

  console.log(
    `STORE: lech — kho ${corpus.length} chunk / store ${stored.length} chunk ` +
      `(+${added} moi, ~${changed} doi, -${removed} thua)`
  );
  console.log("       pha C phai chay lai du PHAI EMBED co bang 0 di nua.");
  return "lech";
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
