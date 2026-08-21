/**
 * Sinh docs/qa-failures.md — hồ sơ đầy đủ cho MỖI câu bị trả lời sai.
 *
 * Vì sao cần một file riêng thay vì đọc log: chẩn đoán một câu sai đòi hỏi bốn
 * mảnh nằm ở bốn chỗ khác nhau — câu hỏi, chuỗi thật sự đem đi tìm, BẢY đoạn
 * lấy về (kèm nội dung, không chỉ URL), và câu model đã nói. Thiếu bất kỳ mảnh
 * nào là đoán. Suốt các lượt đo trước, chính tôi đã quy sai nguyên nhân ba lần
 * vì chỉ nhìn được URL mà không nhìn được nội dung đoạn.
 *
 * Nguồn: các file JSON do qa-batch.ts sinh ra (đã có câu trả lời của LLM), cộng
 * một lượt truy hồi LẶP LẠI để lấy đầy đủ nội dung 7 đoạn.
 *
 * Lưu ý về chi phí: lượt truy hồi lặp lại này VẪN tốn quota, vì
 * retriever.search() gọi rewriteQuery() bên trong. Nó rẻ hơn qa-batch (một lượt
 * gemma thay vì gemma + gemini) nhưng không miễn phí.
 *
 * PHÂN LOẠI NGUYÊN NHÂN
 * ---------------------
 * Mỗi ca được gán một nhãn nguyên nhân, vì bốn kiểu hỏng dưới đây cần bốn cách
 * sửa khác nhau và gộp chung lại thì không sửa được cái nào:
 *
 *   TRUY-HỒI-TRƯỢT   không đoạn nào chứa đáp án -> sửa ở tầng truy hồi/corpus
 *   PROMPT-TỪ-CHỐI   đoạn đúng CÓ trong top-7 mà model vẫn từ chối -> sửa prompt
 *   ẢO-GIÁC          model trả lời từ đoạn nói về CHỦ THỂ KHÁC -> sửa prompt
 *   TỪ-CHỐI-MỀM      thực ra là từ chối, isRefusal() không nhận ra -> sửa hàm
 *   NHÃN-NGỜ         corpus có vẻ CÓ đáp án -> nhãn trong bộ mẫu cần xem lại
 *
 * Chạy: npm run qa:failures
 *       npm run qa:failures -- --in=docs/qa-400.json,docs/qa-200-main.json
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { Retriever } from "../src/lib/chatbot/retriever";
import { DEFAULT_TOP_K } from "../src/lib/chatbot/config";
import { SAMPLES, isGold, type Case } from "./qa-samples";

function arg(name: string): string | undefined {
  return process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

// MỘT nguồn duy nhất. Trước đây file này gộp năm file JSON của năm lượt chạy
// khác nhau, và thứ tự đọc quyết định kết quả — một cách âm thầm để lẫn dữ liệu
// cũ vào báo cáo mới. Giờ qa-batch.ts gộp ngay khi ghi, nên chỉ còn một file.
const IN = [arg("in") || "docs/qa-results.json"];
const OUT = arg("out") || "docs/qa-failures.md";

interface RunRow {
  id: number;
  q: string;
  group: string;
  expect: string;
  got: string;
  reply: string;
  searchQuery: string;
  model?: string | null;
  nChunks: number;
  pass: boolean;
}

/** Model từ chối bằng nhiều cách diễn đạt ngoài hai chuỗi chuẩn. Danh sách này
 * dựng từ các câu trả lời THẬT quan sát được trong các lượt chạy trước. */
const SOFT_REFUSAL =
  /không có trong dữ liệu|không đề cập|không cung cấp|không tìm thấy|chưa được cập nhật|không nêu|không có thông tin|không xác định|chưa đề cập/i;

const REFUSALS = new Set(["not_updated", "no_answer", "nothing_found"]);

function classifyCause(
  c: Case,
  r: RunRow,
  goldInTop: boolean,
  goldAnywhere: boolean
): string {
  if (r.expect === "answer") {
    if (!goldInTop) return goldAnywhere ? "TRUY-HỒI-TRƯỢT" : "NHÃN-NGỜ";
    if (SOFT_REFUSAL.test(r.reply)) return "PROMPT-TỪ-CHỐI";
    return "PROMPT-TỪ-CHỐI";
  }
  // Mong đợi từ chối mà lại trả lời
  if (r.got === "answer") {
    return SOFT_REFUSAL.test(r.reply) ? "TỪ-CHỐI-MỀM" : "ẢO-GIÁC";
  }
  // Không còn rơi vào đây sau khi scorePass() gộp các loại từ chối — giữ nhánh
  // để đọc được file kết quả cũ.
  return "KHÁC-KIỂU-TỪ-CHỐI";
}

const ADVICE: Record<string, string> = {
  "TRUY-HỒI-TRƯỢT":
    "Đoạn chứa đáp án không lọt top-7. Xem 7 đoạn dưới: nếu chúng cùng chủ đề nhưng sai trang, vấn đề là xếp hạng (thử nới `--candidates`, hoặc thêm bigram vào tầng lexical). Nếu chúng lạc chủ đề hẳn, vấn đề là câu truy vấn — xem dòng `TÌM BẰNG`.",
  "PROMPT-TỪ-CHỐI":
    "Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.",
  "ẢO-GIÁC":
    "Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.",
  "TỪ-CHỐI-MỀM":
    "Model THỰC SỰ đã từ chối, chỉ dùng cách diễn đạt mà `isRefusal()` không nhận. Ảnh hưởng cả sản phẩm: route.ts dùng chính hàm đó để ẩn khối 'Nguồn tham khảo', nên người dùng đang thấy danh sách nguồn dưới một câu từ chối.",
  "KHÁC-KIỂU-TỪ-CHỐI":
    "Model từ chối đúng, chỉ khác loại từ chối so với nhãn. Người dùng thấy hành vi như nhau — ưu tiên thấp, cân nhắc sửa NHÃN thay vì sửa code.",
  "NHÃN-NGỜ":
    "Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.",
};

async function main() {
  const byId = new Map<number, Case>(SAMPLES.map((c) => [c.id, c]));
  const runs = new Map<number, RunRow>();

  for (const f of IN) {
    try {
      const j = JSON.parse(await readFile(f.trim(), "utf-8")) as { rows: RunRow[] };
      // File sau ghi đè file trước: các lượt chạy lại (lô nhỏ hơn) mới hơn và
      // đúng hơn lượt chạy đầu.
      for (const r of j.rows) runs.set(r.id, r);
      console.error(`đọc ${f.trim()}: ${j.rows.length} dòng`);
    } catch {
      console.error(`bỏ qua ${f.trim()} (không đọc được)`);
    }
  }

  // Loại câu NỐI TIẾP: chúng không đọc được nếu thiếu lịch sử hội thoại, và
  // kết quả của chúng chỉ đúng khi chạy tuần tự (QA_BATCH=1). Cả hai điều đó
  // khiến chúng thuộc về một file riêng — docs/qa-followups.json, sinh bởi
  // `npm run qa:followups`.
  const isFollowup = new Set(
    SAMPLES.filter((c) => c.history?.length).map((c) => c.id)
  );
  const failures = [...runs.values()].filter((r) => !r.pass && !isFollowup.has(r.id));
  console.error(
    `${failures.length} ca sai (đã loại ${isFollowup.size} câu nối tiếp) / ${runs.size} ca đã chạy`
  );

  const retriever = new Retriever();
  const blocks: string[] = [];
  const causeCount: Record<string, number> = {};

  let i = 0;
  for (const r of failures.sort((a, b) => a.id - b.id)) {
    const c = byId.get(r.id);
    if (!c) continue;

    const { chunks } = await retriever.search(c.q, { topK: DEFAULT_TOP_K });
    const deep = await retriever.search(c.q, { topK: 20 });

    const goldInTop = c.gold ? chunks.some((ch) => isGold(ch, c.gold!)) : false;
    const goldAnywhere = c.gold ? deep.chunks.some((ch) => isGold(ch, c.gold!)) : false;
    const cause = classifyCause(c, r, goldInTop, goldAnywhere);
    causeCount[cause] = (causeCount[cause] || 0) + 1;

    const lines: string[] = [];
    lines.push(`## #${r.id} — ${cause}`);
    lines.push("");
    lines.push(`**Nhóm:** ${r.group}`);
    if (c.history?.length) {
      lines.push("");
      lines.push("**Hội thoại trước đó:**");
      for (const h of c.history) lines.push(`> ${h}`);
    }
    lines.push("");
    lines.push(`**Hỏi:** ${r.q}`);
    lines.push(`**Tìm bằng:** \`${r.searchQuery || "(câu gốc)"}\``);
    lines.push(`**Mong đợi:** \`${r.expect}\` — **Nhận được:** \`${r.got}\``);
    lines.push(
      `**Model trả lời:** \`${
        r.model === undefined
          ? "(lượt chạy cũ — chưa ghi lại model)"
          : (r.model ?? "(truy hồi rỗng, không gọi model nào)")
      }\``
    );
    if (c.gold) {
      lines.push(
        `**Nhãn vàng:** \`${JSON.stringify(c.gold)}\` — có trong top-${DEFAULT_TOP_K}: **${goldInTop ? "CÓ" : "KHÔNG"}**` +
          (!goldInTop && goldAnywhere ? " (nhưng có trong top-20)" : "")
      );
    }
    lines.push("");
    lines.push("**Nội dung trả lời:**");
    lines.push("");
    lines.push("> " + (r.reply || "(rỗng)").replace(/\s+/g, " ").slice(0, 600));
    lines.push("");
    lines.push(`**${chunks.length} đoạn gần nhất được gửi cho LLM:**`);
    lines.push("");
    lines.push("| # | điểm | đúng? | nguồn | trích nội dung |");
    lines.push("|---|---|---|---|---|");
    chunks.forEach((ch, idx) => {
      const g = c.gold && isGold(ch, c.gold) ? "**✓**" : "";
      const url = (ch.url || "").replace("https://fintech.hust.edu.vn", "").slice(0, 46);
      const txt = (ch.raw || "").replace(/\s+/g, " ").slice(0, 150).replace(/\|/g, "\\|");
      lines.push(`| ${idx + 1} | ${ch.score.toFixed(3)} | ${g} | \`${url}\` | ${txt}… |`);
    });
    if (!chunks.length) lines.push("| — | — | — | *(không đoạn nào vượt ngưỡng)* | |");
    lines.push("");
    lines.push(`**Hướng sửa:** ${ADVICE[cause]}`);
    lines.push("");
    lines.push("---");
    blocks.push(lines.join("\n"));

    if (++i % 20 === 0) console.error(`  ${i}/${failures.length}`);
  }

  const head = [
    "# Hồ sơ các câu trả lời sai",
    "",
    `Sinh tự động bởi \`npm run qa:failures\` — ${new Date().toISOString().slice(0, 10)}.`,
    "",
    `**${failures.length} ca sai / ${runs.size} ca đã chạy.**`,
    "",
    `Không tính ${isFollowup.size} câu nối tiếp — chúng nằm ở \`docs/qa-followups.json\`,`,
    "kèm toàn bộ lịch sử hội thoại (thiếu lịch sử thì không tra được câu nào cả).",
    "",
    "## Phân loại nguyên nhân",
    "",
    "| Nguyên nhân | Số ca | Sửa ở đâu |",
    "|---|---:|---|",
    `| TRUY-HỒI-TRƯỢT | ${causeCount["TRUY-HỒI-TRƯỢT"] || 0} | tầng truy hồi / corpus |`,
    `| PROMPT-TỪ-CHỐI | ${causeCount["PROMPT-TỪ-CHỐI"] || 0} | SYSTEM_PROMPT |`,
    `| ẢO-GIÁC | ${causeCount["ẢO-GIÁC"] || 0} | SYSTEM_PROMPT (ràng buộc chủ thể) |`,
    `| TỪ-CHỐI-MỀM | ${causeCount["TỪ-CHỐI-MỀM"] || 0} | \`isRefusal()\` |`,
    `| KHÁC-KIỂU-TỪ-CHỐI | ${causeCount["KHÁC-KIỂU-TỪ-CHỐI"] || 0} | nhãn trong bộ mẫu |`,
    `| NHÃN-NGỜ | ${causeCount["NHÃN-NGỜ"] || 0} | nhãn trong bộ mẫu |`,
    "",
    "Đọc bảng này trước khi đọc từng ca: hai hàng cuối là lỗi của BỘ ĐO, không",
    "phải của sản phẩm, và sửa chúng trước sẽ làm mọi lần đo sau bớt nhiễu.",
    "",
    "---",
    "",
  ].join("\n");

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, head + blocks.join("\n\n"), "utf-8");
  console.log(`Đã ghi ${OUT} — ${failures.length} ca`);
  console.log(JSON.stringify(causeCount, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
