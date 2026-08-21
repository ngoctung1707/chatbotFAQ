/**
 * Chạy bộ 400 câu (scripts/qa-cases-400.ts) qua ĐÚNG đường production, gọi
 * thẳng vào src/lib/chatbot/* — KHÔNG cần dev server, không cần cổng 3000.
 *
 * Cùng lý do tồn tại như qa-test.ts: import chính code đang chạy thật thay vì
 * chép lại, để bài đo không trôi khỏi bản gốc. Khác qa-test.ts ở ba điểm, và
 * cả ba đều do quy mô 400 câu mà ra:
 *
 *   1. GỌI THEO LÔ 10. Mỗi câu tốn ÍT NHẤT hai lượt API (rewrite + trả lời),
 *      câu nhiều lượt còn tốn thêm hai lượt cho mỗi lượt lịch sử phải dựng
 *      lại. Chạy tuần tự 400 câu mất hàng giờ; bắn hết cùng lúc thì chạm trần
 *      RPM và cả loạt trả 429 — lúc đó con số đo được là con số của hạn mức,
 *      không phải của chatbot. Nên: đúng 10 câu chạy song song, ĐỢI CẢ MƯỜI
 *      xong, nghỉ, rồi mới tới lô sau. Bên trong một câu mọi thứ vẫn tuần tự.
 *
 *   2. GHI TIẾN TRÌNH SAU MỖI LÔ. 400 câu là 40 lô; mất điện hay hết quota ở
 *      lô 35 mà không có checkpoint thì mất sạch. File kết quả được ghi đè sau
 *      mỗi lô, và --resume đọc lại nó để bỏ qua những câu đã xong.
 *
 *   3. DỰNG LẠI LỊCH SỬ BẰNG CÁCH CHẠY THẬT các lượt trước, không bịa câu trả
 *      lời của trợ lý. Bịa thì bộ viết lại câu được đọc một hội thoại không
 *      bao giờ tồn tại, và ca "thầy có thành tích gì" sẽ đạt hay trượt tuỳ vào
 *      chất lượng câu bịa chứ không tuỳ vào sản phẩm.
 *
 * Chạy:
 *   npm run qa:400                          chạy hết 600 câu
 *   npm run qa:400 -- --limit=50            chỉ 50 câu đầu (thử nhanh)
 *   npm run qa:400 -- --resume              chạy tiếp phần còn thiếu
 *   npm run qa:400 -- --group=11            chỉ các nhóm có tên chứa "11"
 *   QA_BATCH=5 npm run qa:400               hạ cỡ lô khi đang bị bóp quota
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { Retriever, type RetrievalChunk } from "../src/lib/chatbot/retriever";
import {
  answerStream,
  friendlyError,
  isRefusal,
  NO_ANSWER,
} from "../src/lib/chatbot/llm";
import type { ChatMessage } from "../src/lib/chatbot/chatHistory";
import {
  CHAT_MODEL,
  DEFAULT_TOP_K,
  MOCK,
  REWRITE_ENABLED,
} from "../src/lib/chatbot/config";
import { SAMPLES, GROUPS, type Case, type Expect } from "./qa-samples";


function arg(name: string): string | undefined {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit?.split("=").slice(1).join("=");
}
const flag = (name: string) => process.argv.slice(2).includes(`--${name}`);

const OUT = arg("out") || "docs/qa-results.json";
const BATCH = Number(process.env.QA_BATCH || 10);
const DELAY_MS = Number(process.env.QA_DELAY_MS || 8000);
const LIMIT = arg("limit") ? Number(arg("limit")) : undefined;
const GROUP_FILTER = arg("group");
// Nhóm nối tiếp phải chạy TUẦN TỰ (QA_BATCH=1), nên cần tách nó khỏi lượt chạy
// chung: lô lớn làm cạn ngân sách gemma và pickRewriteModel() bỏ rewrite trong
// im lặng — đo lúc đó là đo một tính năng đang tắt.
const EXCLUDE = arg("exclude");
const RESUME = flag("resume");
// Danh sách id cụ thể, để chạy lại đúng những ca đã sai mà không phải chạy lại
// cả bộ. Nhận cả file JSON (lấy id của các dòng pass=false) lẫn danh sách thẳng.
const IDS = arg("ids");

// Chuỗi route.ts trả về khi retrieval không giữ lại đoạn nào.
const NO_HIT_REPLY =
  "Tôi không tìm thấy thông tin nào liên quan đến câu hỏi này trong dữ liệu của BKFintech.";

// Cùng hình dạng với CITATION_MARKER_RE trong llm.ts, kể cả dấu phân cách. Một
// bản `\[\d+\]` đơn giản là KHÔNG đủ, và chính script này đã chứng minh: model
// trả "…thông tin chi tiết [1], [2]." mà chỉ bóc cặp ngoặc thì còn lại
// "…chi tiết,." — không chứa chuỗi từ chối nào, nên một lượt từ chối ĐÚNG bị
// chấm thành câu trả lời thật.
const ONE_MARKER = String.raw`\[\s*\d+(?:\s*,\s*\d+)*\s*\](?!\()`;
const MARKERS = new RegExp(
  String.raw`\s*${ONE_MARKER}(?:\s*[,;]?\s*${ONE_MARKER})*`,
  "g"
);

/** Là loại từ chối nào, sau khi isRefusal() đã xác nhận đó là từ chối.
 *
 * Câu hỏi "có phải từ chối không" được giao cho isRefusal() của production chứ
 * không tự quyết lại ở đây: một bộ đo tự chấm sản phẩm bằng luật riêng của nó
 * là đang báo cáo về một thứ người dùng không bao giờ thấy. Chỉ phần tách
 * hai-loại-nào là cục bộ. */
function classify(reply: string, nChunks: number): Expect {
  if (nChunks === 0) return "nothing_found";
  if (!isRefusal(reply)) return "answer";
  const lowered = reply.replace(MARKERS, "").trim().toLowerCase();
  if (
    lowered.includes(NO_ANSWER.toLowerCase()) ||
    lowered.includes("đặt ra câu hỏi chi tiết hơn")
  ) {
    return "no_answer";
  }
  return "not_updated";
}

interface Row {
  id: number;
  q: string;
  group: string;
  expect: Expect;
  turns: number;
  searchQuery: string;
  /** Model đã sinh câu trả lời; null khi truy hồi rỗng nên không gọi model nào. */
  model: string | null;
  nChunks: number;
  topScore: number | null;
  urls: string[];
  totalMs: number;
  error: string | null;
  reply: string;
  got: Expect | "error";
  pass: boolean;
  exactMatch?: boolean;
}

const retriever = new Retriever();

/** Một lượt hỏi, đi đúng đường route.ts đi. */
async function askOnce(question: string, history: ChatMessage[]) {
  const { chunks, searchQuery } = await retriever.search(question, { history });
  let reply: string;
  // Model NÀO thật sự trả lời. Pool tự lùi sang model khác khi model đầu cạn
  // ngân sách, và nó lùi trong im lặng — không ghi lại thì hai câu trả lời rất
  // khác nhau cho cùng một câu hỏi trông như model dao động, trong khi thật ra
  // chúng đến từ hai model khác nhau. Với pool hiện tại điều này càng quan
  // trọng: gemma-4-31b-it có tpm 15k, thấp hơn gemini-3.5-flash-lite 16 lần,
  // nên nó chỉ nhận được vài lượt mỗi phút rồi nhường lại.
  let model: string | null = null;
  if (chunks.length === 0) {
    reply = NO_HIT_REPLY;
  } else {
    const parts: string[] = [];
    for await (const t of answerStream(question, chunks, history, {
      onModel: (m) => {
        model = m;
      },
    })) {
      parts.push(t);
    }
    reply = parts.join("");
  }
  return { chunks, searchQuery, reply, model };
}

async function runCase(c: Case): Promise<Row> {
  const t0 = Date.now();
  let error: string | null = null;
  let reply = "";
  let searchQuery = "";
  let model: string | null = null;
  let chunks: RetrievalChunk[] = [];

  try {
    const history: ChatMessage[] = [];
    for (const prev of c.history ?? []) {
      const r = await askOnce(prev, history);
      history.push({ role: "user", content: prev });
      history.push({ role: "assistant", content: r.reply });
    }
    const final = await askOnce(c.q, history);
    searchQuery = final.searchQuery;
    chunks = final.chunks;
    reply = final.reply;
    model = final.model;
  } catch (err) {
    error = friendlyError(err);
  }

  const got = error ? "error" : classify(reply, chunks.length);
  return {
    id: c.id,
    q: c.q,
    group: c.group,
    expect: c.expect,
    turns: (c.history?.length ?? 0) + 1,
    searchQuery,
    model,
    nChunks: chunks.length,
    topScore: chunks.length ? Number(chunks[0].score.toFixed(4)) : null,
    urls: [...new Set(chunks.map((x) => x.url))].slice(0, 3),
    totalMs: Date.now() - t0,
    error,
    reply,
    got,
    pass: scorePass(c.expect, got),
    /** Có khớp CHÍNH XÁC loại từ chối không. Giữ lại để vẫn soi được sự khác
     *  biệt, dù nó không tính vào pass. */
    exactMatch: got === c.expect,
  };
}

/** Ba nhãn `not_updated` / `no_answer` / `nothing_found` đều là TỪ CHỐI — người
 * dùng thấy hành vi như nhau: chatbot không đưa ra thông tin. Chúng chỉ khác
 * nhau ở chuỗi model chọn và ở việc truy hồi có trả về đoạn nào không, mà cả
 * hai đều là chi tiết bên trong.
 *
 * Đo được vì sao phải gộp: 21/66 ca "sai" là ca model TỪ CHỐI ĐÚNG nhưng bằng
 * loại từ chối khác nhãn. Chấm chúng là sai làm điểm tổng thấp đi vì một khác
 * biệt không ai nhìn thấy, và tệ hơn — nó chôn những ca sai THẬT dưới một đống
 * nhiễu. */
const REFUSALS = new Set<Expect>(["not_updated", "no_answer", "nothing_found"]);

/** Đúng ở mức người dùng cảm nhận: khớp chính xác, HOẶC cả hai đều là từ chối. */
function scorePass(expect: Expect, got: Expect | "error"): boolean {
  if (got === "error") return false;
  if (expect === got) return true;
  return REFUSALS.has(expect) && REFUSALS.has(got);
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function report(rows: Row[]) {
  const L = console.log;
  const done = rows.filter((r) => r.got !== "error");
  const passed = rows.filter((r) => r.pass).length;

  L("");
  L("=".repeat(78));
  L(`BÁO CÁO 400 CÂU   model=${CHAT_MODEL}  topK=${DEFAULT_TOP_K}  rewrite=${REWRITE_ENABLED}`);
  L("=".repeat(78));
  L("");
  L(`Đã chạy : ${rows.length}`);
  L(`Lỗi     : ${rows.length - done.length}`);
  const loose = rows.filter((r) => r.pass && r.exactMatch === false).length;
  L(`ĐẠT     : ${passed}/${rows.length}  (${pct(passed / Math.max(rows.length, 1))})`);
  if (loose) {
    L(`          trong đó ${loose} ca từ chối ĐÚNG nhưng khác loại từ chối so với nhãn`);
  }

  // Ma trận mong đợi x nhận được — chỗ này nói nhiều hơn một con số tổng: nó
  // phân biệt "trả lời khi lẽ ra phải từ chối" với "từ chối khi lẽ ra trả lời
  // được", hai lỗi có mức nghiêm trọng rất khác nhau.
  const kinds: Array<Expect | "error"> = [
    "answer",
    "not_updated",
    "no_answer",
    "nothing_found",
    "error",
  ];
  L("");
  L("MA TRẬN  (hàng = mong đợi, cột = nhận được)");
  L(`  ${"".padEnd(15)}${kinds.map((k) => k.slice(0, 11).padStart(13)).join("")}`);
  for (const e of kinds.slice(0, 4)) {
    const sub = rows.filter((r) => r.expect === e);
    if (!sub.length) continue;
    const cells = kinds
      .map((k) => String(sub.filter((r) => r.got === k).length).padStart(13))
      .join("");
    L(`  ${e.padEnd(15)}${cells}`);
  }

  // Model nào trả lời bao nhiêu câu, và đạt bao nhiêu. Pool lùi model trong im
  // lặng, nên nếu không tách ra thì một model yếu kéo tụt điểm chung mà không
  // ai biết là do đâu.
  L("");
  L("THEO MODEL TRẢ LỜI");
  L(`  ${"model".padEnd(26)} ${"n".padStart(4)} ${"đạt".padStart(5)} ${"tỉ lệ".padStart(7)}`);
  const models = [...new Set(rows.map((r) => r.model ?? "(không gọi model)"))];
  for (const m of models) {
    const sub = rows.filter((r) => (r.model ?? "(không gọi model)") === m);
    const ok = sub.filter((r) => r.pass).length;
    L(`  ${m.padEnd(26)} ${String(sub.length).padStart(4)} ${String(ok).padStart(5)} ${pct(ok / sub.length).padStart(7)}`);
  }

  L("");
  L("THEO NHÓM");
  L(`  ${"nhóm".padEnd(44)} ${"n".padStart(4)} ${"đạt".padStart(5)} ${"tỉ lệ".padStart(7)}`);
  for (const gname of GROUPS) {
    const sub = rows.filter((r) => r.group === gname);
    if (!sub.length) continue;
    const ok = sub.filter((r) => r.pass).length;
    L(
      `  ${gname.slice(0, 44).padEnd(44)} ${String(sub.length).padStart(4)} ` +
        `${String(ok).padStart(5)} ${pct(ok / sub.length).padStart(7)}`
    );
  }

  // Nguy hiểm nhất: câu ngoài phạm vi mà model vẫn trả lời.
  const hallucinated = rows.filter(
    (r) => (r.expect === "nothing_found" || r.expect === "not_updated") && r.got === "answer"
  );
  L("");
  L(`TRẢ LỜI KHI LẼ RA PHẢI TỪ CHỐI : ${hallucinated.length}`);
  for (const r of hallucinated.slice(0, 15)) {
    L(`  #${r.id} [${r.expect}] ${r.q.slice(0, 58)}`);
    L(`        → ${r.reply.replace(/\s+/g, " ").slice(0, 96)}`);
  }
  if (hallucinated.length > 15) L(`  … và ${hallucinated.length - 15} câu nữa`);

  const overRefused = rows.filter((r) => r.expect === "answer" && r.got !== "answer");
  L("");
  L(`TỪ CHỐI KHI LẼ RA TRẢ LỜI ĐƯỢC : ${overRefused.length}`);
  for (const r of overRefused.slice(0, 15)) {
    L(`  #${r.id} [${r.got}] chunk=${r.nChunks} ${r.q.slice(0, 56)}`);
  }
  if (overRefused.length > 15) L(`  … và ${overRefused.length - 15} câu nữa`);

  const ms = rows.map((r) => r.totalMs).sort((a, b) => a - b);
  if (ms.length) {
    const q = (k: number) => ms[Math.min(ms.length - 1, Math.floor(k * ms.length))];
    L("");
    L(`ĐỘ TRỄ  trung vị ${(q(0.5) / 1000).toFixed(1)}s · p90 ${(q(0.9) / 1000).toFixed(1)}s · max ${(ms[ms.length - 1] / 1000).toFixed(1)}s`);
  }
}

/** Đọc file kết quả cũ, thay các ca vừa chạy, ghi lại. */
async function mergeWrite(fresh: Row[]) {
  const merged = new Map<number, Row>();
  try {
    const prev = JSON.parse(await readFile(OUT, "utf-8")) as { rows: Row[] };
    for (const r of prev.rows ?? []) merged.set(r.id, r);
  } catch {
    /* chưa có file — lượt chạy đầu tiên */
  }
  for (const r of fresh) merged.set(r.id, r);
  const rows = [...merged.values()].sort((a, b) => a.id - b.id);
  await writeFile(
    OUT,
    JSON.stringify(
      { model: CHAT_MODEL, topK: DEFAULT_TOP_K, when: new Date().toISOString(), n: rows.length, rows },
      null,
      2
    ),
    "utf-8"
  );
}

async function main() {
  let cases = SAMPLES;
  if (GROUP_FILTER) cases = cases.filter((c) => c.group.includes(GROUP_FILTER));
  if (EXCLUDE) cases = cases.filter((c) => !c.group.includes(EXCLUDE));
  if (IDS) {
    let wanted: Set<number>;
    if (IDS.endsWith(".json")) {
      const j = JSON.parse(await readFile(IDS, "utf-8")) as { rows: Array<{ id: number; pass: boolean }> };
      wanted = new Set(j.rows.filter((r) => !r.pass).map((r) => r.id));
    } else {
      wanted = new Set(IDS.split(",").map((x) => Number(x.trim())));
    }
    cases = cases.filter((c) => wanted.has(c.id));
  }
  if (LIMIT) cases = cases.slice(0, LIMIT);

  let rows: Row[] = [];
  if (RESUME) {
    try {
      const prev = JSON.parse(await readFile(OUT, "utf-8")) as { rows: Row[] };
      rows = (prev.rows ?? []).filter((r) => r.pass !== undefined);
      const doneIds = new Set(rows.map((r) => r.id));
      cases = cases.filter((c) => !doneIds.has(c.id));
      console.error(`--resume: đã có ${rows.length} câu, còn ${cases.length} câu`);
    } catch {
      console.error(`--resume: chưa có ${OUT}, chạy từ đầu`);
    }
  }

  const totalBatches = Math.ceil(cases.length / BATCH);
  console.error(
    `model=${CHAT_MODEL} mock=${MOCK} topK=${DEFAULT_TOP_K} rewrite=${REWRITE_ENABLED} ` +
      `| ${cases.length} câu, lô ${BATCH}, nghỉ ${DELAY_MS}ms → ${totalBatches} lô`
  );
  const extraTurns = cases.reduce((s, c) => s + (c.history?.length ?? 0), 0);
  console.error(
    `ước tính ~${(cases.length + extraTurns) * 2} lượt gọi API ` +
      `(mỗi lượt hỏi tốn 2: rewrite + trả lời; ${extraTurns} lượt lịch sử phải dựng lại)`
  );

  await mkdir(path.dirname(OUT), { recursive: true });
  const started = Date.now();

  for (let i = 0; i < cases.length; i += BATCH) {
    const batch = cases.slice(i, i + BATCH);
    const n = Math.floor(i / BATCH) + 1;

    // Promise.all trên đúng `batch.length` câu, và KHÔNG câu nào của lô sau
    // được bắt đầu trước khi cả lô này xong. Đó là toàn bộ ý nghĩa của "theo
    // lô" ở đây — chặn số lượt gọi đang bay, không phải gom cho đẹp log.
    const done = await Promise.all(batch.map(runCase));
    rows.push(...done);

    const ok = done.filter((r) => r.pass).length;
    const elapsed = ((Date.now() - started) / 1000).toFixed(0);
    console.error(
      `lô ${n}/${totalBatches}  đạt ${ok}/${done.length}  ` +
        `(cộng dồn ${rows.filter((r) => r.pass).length}/${rows.length})  ${elapsed}s`
    );
    for (const r of done.filter((x) => !x.pass)) {
      console.error(
        `    XX #${r.id} exp=${r.expect} got=${r.got} chunk=${r.nChunks} ` +
          `model=${r.model ?? "-"}  ${r.q.slice(0, 40)}`
      );
    }

    // Ghi sau MỖI lô, không phải ở cuối: hỏng ở lô gần cuối thì mất sạch.
    //
    // GỘP chứ không ghi đè. Chạy lại một nhóm nhỏ (--group, --ids) phải cập
    // nhật đúng những ca đó trong file kết quả chung, không được xoá 500 ca
    // còn lại. Trước đây mỗi lượt chạy đẻ ra một file JSON riêng và docs/ phình
    // lên sáu file trùng nhau; giờ chỉ còn một nguồn.
    await mergeWrite(rows);

    if (i + BATCH < cases.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  report(rows);
  console.log("");
  console.log(`Đã ghi ${rows.length} kết quả vào ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
