/**
 * Sinh docs/qa-followups.json — hồ sơ riêng cho MỌI câu nối tiếp.
 *
 * Vì sao tách khỏi qa-failures.md: câu nối tiếp không đọc được nếu thiếu lịch
 * sử hội thoại. Nhìn một dòng "nó hỗ trợ những mạng nào?" trong bảng kết quả
 * thì không tra được gì — "nó" là cái gì phụ thuộc hoàn toàn vào lượt trước, và
 * lượt trước không nằm trong file đó. File này gom đủ bốn thứ cho mỗi ca: toàn
 * bộ hội thoại, câu hỏi cuối, chuỗi mà bộ viết lại câu tạo ra, và câu trả lời.
 *
 * VÌ SAO CHẠY TUẦN TỰ MỚI ĐÚNG
 * ----------------------------
 * Đo được: ở lô 10 chỉ 24/40 câu được viết lại, còn lại bị bỏ IM LẶNG vì
 * pickRewriteModel() thấy ngân sách gemma đã cạn và trả null. Ở lô 1 thì
 * 100% được viết lại. Với câu nối tiếp, bỏ rewrite nghĩa là đại từ không được
 * giải — tức đo một đường mà production có tải thấp sẽ không bao giờ đi.
 *
 * Nên kết quả câu nối tiếp CHỈ được lấy từ lượt chạy tuần tự:
 *     QA_BATCH=1 npm run qa:400 -- --group="Nối tiếp"
 *
 * Chạy: npm run qa:followups
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { SAMPLES } from "./qa-samples";

function arg(name: string): string | undefined {
  return process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

const IN = arg("in") || "docs/qa-results.json";
const OUT = arg("out") || "docs/qa-followups.json";

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
  topScore: number | null;
  urls: string[];
  turns: number;
  pass: boolean;
}

async function main() {
  const results = new Map<number, RunRow>();
  const j = JSON.parse(await readFile(IN, "utf-8")) as { rows: RunRow[] };
  for (const r of j.rows) results.set(r.id, r);

  const followups = SAMPLES.filter((c) => c.history?.length);
  const rows = followups.map((c) => {
    const r = results.get(c.id);
    return {
      id: c.id,
      group: c.group,
      // Hội thoại đầy đủ, đánh số lượt — đây là thứ thiếu ở mọi file khác.
      conversation: [
        ...(c.history ?? []).map((h, i) => ({ turn: i + 1, user: h })),
        { turn: (c.history?.length ?? 0) + 1, user: c.q, scored: true },
      ],
      question: c.q,
      /** Chuỗi bộ viết lại câu tạo ra. Bằng đúng `question` = rewrite KHÔNG chạy
       *  (bị bỏ vì hết ngân sách), và khi đó đại từ chưa được giải. */
      searchQuery: r?.searchQuery ?? null,
      rewriteRan: r ? r.searchQuery !== c.q && !!r.searchQuery : null,
      expect: c.expect,
      got: r?.got ?? null,
      pass: r?.pass ?? null,
      model: r?.model ?? null,
      nChunks: r?.nChunks ?? null,
      topScore: r?.topScore ?? null,
      urls: r?.urls ?? [],
      reply: r?.reply ?? null,
      gold: c.gold ?? null,
    };
  });

  const ran = rows.filter((r) => r.got !== null);
  const passed = ran.filter((r) => r.pass).length;
  const rewrote = ran.filter((r) => r.rewriteRan).length;

  const byGroup: Record<string, { n: number; pass: number; rewrote: number }> = {};
  for (const r of ran) {
    const g = (byGroup[r.group] ??= { n: 0, pass: 0, rewrote: 0 });
    g.n++;
    if (r.pass) g.pass++;
    if (r.rewriteRan) g.rewrote++;
  }

  const out = {
    note:
      "Câu nối tiếp. Kết quả chỉ đúng khi lượt chạy dùng QA_BATCH=1 — xem chú thích đầu scripts/qa-followups.ts.",
    total: rows.length,
    ran: ran.length,
    passed,
    rewriteRan: rewrote,
    byGroup,
    when: new Date().toISOString(),
    rows,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2), "utf-8");

  console.log(`Đã ghi ${OUT}`);
  console.log(`  ${rows.length} câu nối tiếp, ${ran.length} đã chạy, đạt ${passed}/${ran.length}`);
  console.log(`  rewrite chạy được: ${rewrote}/${ran.length}` + (rewrote < ran.length ? "  <- phần còn lại bị bỏ vì hết ngân sách" : ""));
  console.log("");
  for (const [g, v] of Object.entries(byGroup)) {
    console.log(`  ${g.padEnd(46)} ${v.pass}/${v.n}  rewrite ${v.rewrote}/${v.n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
