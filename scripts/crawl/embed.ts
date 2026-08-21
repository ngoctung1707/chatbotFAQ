/**
 * PHA B — mục 4.2. Pha duy nhất cần tới model.
 *
 *   npx tsx scripts/crawl/embed.ts            # embed phần còn thiếu
 *   npx tsx scripts/crawl/embed.ts --dry-run  # chỉ đếm, không gọi model
 *
 * FILE NÀY KHÔNG CÒN NẠP BGE-M3 NỮA.
 * ----------------------------------
 * Trước đây nó `import { embedDense }` rồi nạp một ONNX session ~1,9GB trong
 * chính tiến trình tsx này. Máy chủ 8GB không chứa nổi bản đó CÙNG bản mà app
 * đang giữ để trả lời câu hỏi, nên job buộc phải bắt app nhả model ra trước —
 * tức `docker compose restart app`, rồi restart lần nữa lúc xong. Hai lần cả
 * website chớp tắt cho mỗi lần cập nhật dữ liệu.
 *
 * Bây giờ nó gửi chuỗi sang /api/chatbot/embed và app embed hộ bằng bản model
 * nằm sẵn trong worker thread của nó. Trong toàn hệ thống chỉ còn ĐÚNG MỘT bản
 * BGE-M3, và không còn lần restart nào.
 *
 * Ranh giới trách nhiệm phải giữ đúng: BÊN NÀY dựng chuỗi bằng embeddedText(),
 * app chỉ nhận chuỗi thô rồi embed. Để app tự dựng lại chuỗi thì vector sinh ra
 * sẽ lệch khỏi thứ build-index.ts từng tạo, và cache trượt sạch.
 *
 * Ghi cache theo kiểu nối thêm từng dòng và flush ngay: job bị kill giữa chừng
 * (watchdog ở mục 5.4) vẫn giữ được phần đã embed, lần sau chạy tiếp chứ không
 * làm lại từ đầu.
 */
import { readFile, appendFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { embeddedText } from "../../src/lib/chatbot/embeddedText";
import { embedDenseBatch } from "../../src/lib/chatbot/embedding";
import { EMBED_REMOTE_URL } from "../../src/lib/chatbot/config";

const CACHE = "data/embeddings.cache.jsonl";
const SOURCES = ["data/chunks_frozen.jsonl", "data/crawl-output.jsonl"];
const DRY_RUN = process.argv.includes("--dry-run");

/** Số đoạn mỗi lượt gọi. 16 là cân bằng giữa hai thứ: lô càng lớn thì càng ít
 *  chi phí HTTP, nhưng cũng càng lâu mới ghi được vào cache — mà ghi sớm chính
 *  là thứ giữ lại tiến độ khi bị kill giữa chừng. Trần phía app là 128. */
const BATCH = Math.max(1, Number(process.env.CHATBOT_EMBED_BATCH || 16));

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
    console.log("(dry-run — khong goi model)");
    return;
  }

  // Chặn sớm, trước khi làm bất cứ việc gì. Thiếu bí mật thì app trả 503 cho
  // MỌI lô, và phát hiện ra điều đó ở lô thứ nhất thay vì sau khi đã chạy nửa
  // tiếng là khác biệt đáng kể lúc 2h sáng.
  if (!EMBED_REMOTE_URL) {
    console.error("HUY: chua dat CHATBOT_EMBED_REMOTE.");
    console.error("  Khong co bien nay, embedding.ts se NAP MOT BAN BGE-M3 RIENG trong tien");
    console.error("  trinh nay — dung thu ma ca thiet ke muon model cua app sinh ra de tranh.");
    console.error("  Vi du: CHATBOT_EMBED_REMOTE=http://localhost:3003 CHATBOT_INTERNAL_SECRET=... \\");
    console.error("         npx tsx scripts/crawl/embed.ts");
    process.exit(1);
  }

  // Không đo RSS của tiến trình này nữa: model không còn ở đây. Con số đáng
  // theo dõi bây giờ là RSS của app, và ram-log.mjs vẫn đang lấy nó.
  console.log(`muon model cua app tai ${EMBED_REMOTE_URL} (lo ${BATCH} doan)`);
  const started = Date.now();
  const entries = [...todo];
  let done = 0;

  for (let i = 0; i < entries.length; i += BATCH) {
    const slice = entries.slice(i, i + BATCH);
    const vectors = await embedDenseBatch(slice.map(([, text]) => text));

    // Ghi ngay từng dòng thay vì gom cuối: bị kill giữa chừng vẫn giữ được
    // phần đã làm. Vẫn đúng khi chia lô — mỗi lô ghi xong mới sang lô sau.
    for (let k = 0; k < slice.length; k++) {
      await appendFile(
        CACHE,
        JSON.stringify({ hash: slice[k][0], dense: vectors[k] }) + "\n"
      );
    }

    done += slice.length;
    const s = (Date.now() - started) / 1000;
    const eta = ((s / done) * (entries.length - done)).toFixed(0);
    console.log(`  ${done}/${entries.length}  ${s.toFixed(1)}s  con ~${eta}s`);
  }

  const total = (Date.now() - started) / 1000;
  console.log(`xong ${done} chunk trong ${total.toFixed(1)}s`);
  console.log(`  ${((total / done) * 1000).toFixed(0)}ms moi chunk`);
  console.log(`=> cua so bao tri that su cua tuan nay: ~${total.toFixed(0)}s (KHONG con lan restart nao)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
