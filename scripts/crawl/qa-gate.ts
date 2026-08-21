/**
 * MỤC 5.3 — cổng chặn chất lượng truy hồi, chạy TRƯỚC khi store mới được đưa
 * vào phục vụ.
 *
 *   npx tsx scripts/crawl/qa-gate.ts --baseline   # ghi mốc từ store đang chạy
 *   npx tsx scripts/crawl/qa-gate.ts              # so store mới với mốc
 *
 * Vì sao không dùng thẳng `scripts/qa-test.ts`: bộ đó chạy cả LLM. Với một cổng
 * chặn lúc 2h sáng thì như vậy vừa chậm, vừa tốn quota, vừa phụ thuộc mạng ra
 * ngoài — và tệ nhất là nó KHÔNG tách bạch được nguyên nhân: câu trả lời tệ đi
 * có thể do model đổi hành vi chứ không phải do chỉ mục hỏng.
 *
 * Ở đây chỉ đo TRUY HỒI, vốn là thứ duy nhất mà việc dựng lại chỉ mục có thể
 * làm hỏng. Đi qua đúng `Retriever` của production nên bao gồm cả phần hybrid
 * và rerank, không phải một bản mô phỏng.
 *
 * BẮT BUỘC chạy với `CHATBOT_REWRITE=0`. Không tắt thì `Retriever.search()` gọi
 * LLM để viết lại từng câu hỏi — đo thử thấy nó timeout liên tục, tiêu quota, và
 * quan trọng nhất là làm kết quả KHÔNG TẤT ĐỊNH: cùng một chỉ mục cho hai con số
 * khác nhau ở hai lần chạy, nên mốc so sánh mất ý nghĩa. Script tự chặn nếu
 * quên, thay vì âm thầm ghi một mốc vô dụng.
 */
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
// Nhóm hồi quy trong bộ mẫu hợp nhất — trước đây là scripts/qa-cases.ts (đã
// gộp vào qa-samples.ts). Từ ngữ của nhóm này cố ý bất biến, đúng thứ một
// cổng chất lượng cần: nếu câu hỏi đổi thì ngưỡng đạt/trượt không so được.
import { SAMPLES } from "../qa-samples";
const CORE = SAMPLES.filter((c) => c.group.startsWith("00."));
import { Retriever } from "../../src/lib/chatbot/retriever";
import { REWRITE_ENABLED } from "../../src/lib/chatbot/config";

const BASELINE = "data/qa-baseline.json";
const WRITE_BASELINE = process.argv.includes("--baseline");
/** Cho phép bao nhiêu câu mất khả năng truy hồi. 0 = không câu nào. */
const MAX_REGRESSIONS = Number(process.env.QA_MAX_REGRESSIONS ?? 0);

async function main() {
  if (REWRITE_ENABLED) {
    console.error("HUY: phai chay voi CHATBOT_REWRITE=0.");
    console.error("Khong tat thi moi cau hoi deu goi LLM, ket qua khong tat dinh va moc so sanh vo nghia.");
    console.error("  CHATBOT_REWRITE=0 npx tsx scripts/crawl/qa-gate.ts --baseline");
    process.exit(1);
  }

  // Chỉ lấy câu ĐÃ BIẾT là kho có dữ liệu. Câu `not_updated` cố ý không có
  // trong kho nên chúng không nói được gì về việc chỉ mục còn lành hay không.
  const cases = CORE.filter((c) => c.expect === "answer");
  const retriever = new Retriever();

  const result: Record<string, number> = {};
  for (const c of cases) {
    const r = await retriever.search(c.q);
    result[String(c.id)] = r.chunks.length;
  }

  const total = Object.values(result).reduce((a, b) => a + b, 0);
  const empty = Object.entries(result).filter(([, n]) => n === 0);
  console.log(`${cases.length} cau hoi vang | tong ${total} chunk truy hoi duoc`);

  if (WRITE_BASELINE) {
    await writeFile(
      BASELINE,
      JSON.stringify({ saved_at: new Date().toISOString(), result }, null, 2) + "\n"
    );
    console.log(`da ghi moc vao ${BASELINE}`);
    if (empty.length) {
      console.log(
        `CANH BAO: ${empty.length} cau khong truy hoi duoc gi ngay tu moc — ` +
          `chung se khong bao gio bat duoc hoi quy. Xem lai bo cau hoi.`
      );
      for (const [id] of empty) {
        const c = cases.find((x) => String(x.id) === id)!;
        console.log(`    #${c.id} "${c.q}"`);
      }
    }
    return;
  }

  if (!existsSync(BASELINE)) {
    console.error(`chua co ${BASELINE}. Chay voi --baseline tren store DANG PHUC VU truoc.`);
    process.exit(1);
  }
  const base = JSON.parse(await readFile(BASELINE, "utf-8")) as {
    result: Record<string, number>;
  };

  // Hồi quy = câu trước đây truy hồi được, giờ không. Số chunk nhích lên xuống
  // vài đơn vị thì không tính, vì kho vốn đã đổi — bắt cả những thứ đó thì cổng
  // sẽ kêu mỗi tuần và người sẽ tắt nó đi.
  const regressions = cases.filter((c) => {
    const before = base.result[String(c.id)] ?? 0;
    const after = result[String(c.id)] ?? 0;
    return before > 0 && after === 0;
  });

  for (const c of regressions) {
    console.error(`  TUT  #${c.id} "${c.q}" (truoc ${base.result[String(c.id)]} chunk, gio 0)`);
  }

  if (regressions.length > MAX_REGRESSIONS) {
    console.error(
      `\nHUY: ${regressions.length} cau hoi vang mat kha nang truy hoi (nguong ${MAX_REGRESSIONS}).`
    );
    console.error("KHONG dua store moi vao phuc vu.");
    process.exit(1);
  }
  console.log("DAT — khong cau nao mat kha nang truy hoi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
