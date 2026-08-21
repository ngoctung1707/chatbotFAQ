/**
 * Chỉ số CHẤT LƯỢNG TRUY HỒI trên scripts/qa-samples.ts.
 *
 * KHÔNG gọi lượt sinh câu trả lời — đó là phần đắt và dao động.
 *
 * CHẠY KHÔNG TỐN MỘT LƯỢT API NÀO:
 *
 *     CHATBOT_REWRITE=0 npm run qa:metrics
 *
 * Đây là cách nên dùng, không phải cách rút gọn. retriever.search() gọi
 * rewriteQuery() bên trong, nên để nguyên mặc định thì mỗi câu tiếng Việt tốn
 * một lượt gọi model — 600 câu là 600 lượt cho một con số vốn đã biết. Chuỗi
 * mà bộ viết lại câu tạo ra ở lượt chạy thật ĐÃ được ghi trong
 * docs/qa-results.json và được đọc lại ở dưới, nên tắt rewrite ở đây cho ra
 * đúng chuỗi truy vấn của production, tất định, và miễn phí. Chỉ những câu mà
 * lượt chạy thật cũng không rewrite (searchQuery trùng câu gốc) mới rơi về
 * câu thô — tức trùng khớp với production, không phải xấp xỉ.
 *
 * Vì sao tách khỏi qa-batch.ts: qa-batch đo cả đường ống nên mỗi câu tốn hai
 * lượt API, 600 câu mất hàng giờ và kết quả dao động giữa hai lần chạy. Nhưng
 * gần như mọi thứ đáng tinh chỉnh — pooling, trọng số dense/lexical, ngưỡng,
 * số ứng viên, cách cắt chunk — chỉ ảnh hưởng TRUY HỒI. Đo riêng phần đó thì
 * một lượt chạy hết vài phút, lặp lại bao nhiêu lần cũng được, và tất định.
 *
 * Giới hạn, nói thẳng: file này KHÔNG nói gì về chất lượng câu trả lời. Nó trả
 * lời đúng một câu — "đoạn chứa đáp án có lọt vào top-k không" — tức điều kiện
 * CẦN để trả lời đúng, không phải điều kiện đủ. Muốn đo câu trả lời thì dùng
 * qa-batch.ts.
 *
 * BỐN CHỈ SỐ, VÀ VÌ SAO LÀ BỐN
 * ----------------------------
 * Đường ống này lấy top-K rồi nhét CẢ K đoạn vào prompt (formatSources() trong
 * llm.ts map toàn bộ mảng, không cắt, không xếp lại). Nên:
 *
 *   1. Hit@K   CHỈ SỐ CHÍNH. Tiêu chí thành công là nhị phân: đáp án có nằm
 *              trong K đoạn gửi đi hay không. Thứ hạng bên trong K không đổi
 *              việc model đọc được đoạn đó.
 *   2. Dư địa  số câu mà đáp án nằm NGOÀI top-K nhưng vẫn trong top-20. Đây
 *      tăng K  là phần "cứu được chỉ bằng cách nới K", tách khỏi phần hỏng
 *              thật sự. Trả lời trực tiếp câu "K=7 có phải con số đúng không".
 *
 *      KHÔNG dùng P@K (tỉ lệ đoạn "đúng" trong K). Nhãn vàng ở đây là mẫu từ
 *      khoá nhận diện đoạn CHỨA ĐÁP ÁN; một đoạn không khớp mẫu hoàn toàn có
 *      thể vẫn là ngữ cảnh cần thiết để trả lời. Gọi tỉ lệ đó là "độ chính
 *      xác" là gán một ý nghĩa mà nhãn không mang.
 *   3. MRR     chỉ số CHẨN ĐOÁN, không phải điểm chất lượng. Nó cho hạng 1 giá
 *              trị 1.0 và hạng 7 giá trị 0.14, trong khi ở kiến trúc này hai
 *              hạng đó giá trị NHƯ NHAU. Giữ lại vì Hit@K bão hoà quanh 90-95%
 *              nên kém nhạy khi so hai cấu hình; MRR nhúc nhích sớm hơn.
 *   4. Độ tách Đây mới là chỉ số mà bộ đo cũ thiếu: câu NGOÀI PHẠM VI có bị
 *      phạm vi  truy hồi trả về rỗng không. Không có nó thì một cấu hình kéo
 *              mọi thứ về đều trông như Hit@K hoàn hảo.
 *
 * Chạy:
 *   npm run qa:metrics
 *   npm run qa:metrics -- --top-k=10 --min-score=0.5
 *   npm run qa:metrics -- --out=docs/metrics.json
 *   npm run qa:metrics -- --baseline=docs/metrics.json   in bảng chênh lệch
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { Retriever } from "../src/lib/chatbot/retriever";
import { DEFAULT_MIN_SCORE, DEFAULT_TOP_K } from "../src/lib/chatbot/config";
import type { ChatMessage } from "../src/lib/chatbot/chatHistory";
import { SAMPLES, GROUPS, isGold, type Case } from "./qa-samples";

function arg(name: string): string | undefined {
  return process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

const TOP_K = arg("top-k") ? Number(arg("top-k")) : DEFAULT_TOP_K;
const MIN_SCORE = arg("min-score") ? Number(arg("min-score")) : undefined;
const OUT = arg("out") || "docs/qa-metrics.md";
const BASELINE = arg("baseline");
const GROUP_FILTER = arg("group");
/** Kết quả của lượt chạy đầy-đủ, dùng để lấy đúng chuỗi truy vấn của câu nối
 *  tiếp — xem chú thích chỗ đọc file. */
const RESULTS = arg("results") || "docs/qa-results.json";

/** Độ sâu lấy về để tính được đường cong Hit@k cho mọi k <= DEPTH.
 *
 * Lấy một lần ở độ sâu này rồi cắt tiền tố là TƯƠNG ĐƯƠNG với gọi lại ở từng k,
 * vì bộ lọc maxPerUrl trong retriever duyệt theo thứ tự hạng và chỉ phụ thuộc
 * tiền tố — nên top-7 của một lượt lấy 20 giống hệt top-7 của một lượt lấy 7. */
const DEPTH = 20;
const KS = [1, 3, 5, 7, 10, 20].filter((k) => k <= DEPTH);

interface Row {
  id: number;
  q: string;
  group: string;
  /** Chuỗi thật sự đưa vào truy hồi. */
  searched: string;
  /** Thứ hạng của chunk ĐÚNG đầu tiên, null nếu không có trong DEPTH đoạn. */
  rank: number | null;
  /** Số chunk đúng trong top-K. */
  nGoldInK: number;
  nChunks: number;
  topScore: number | null;
  urls: string[];
  ms: number;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

async function main() {
  let cases: Case[] = SAMPLES;
  if (GROUP_FILTER) cases = cases.filter((c) => c.group.includes(GROUP_FILTER));

  const positives = cases.filter((c) => c.gold);
  const negatives = cases.filter((c) => c.expect === "nothing_found");
  // Câu `not_updated` / `no_answer` cố ý nằm ngoài cả hai nhóm: chủ đề của
  // chúng nằm trong phạm vi nên truy hồi trả về đoạn là ĐÚNG; việc từ chối là
  // của LLM, và đo nó ở đây sẽ quy sai lỗi.
  const skipped = cases.length - positives.length - negatives.length;

  console.error(
    `${cases.length} câu | ${positives.length} có nhãn vàng | ${negatives.length} ngoài phạm vi | ` +
      `${skipped} không chấm truy hồi\ntopK=${TOP_K} minScore=${MIN_SCORE ?? DEFAULT_MIN_SCORE} depth=${DEPTH}`
  );

  // CHUỖI TRUY VẤN CỦA CÂU NỐI TIẾP LẤY TỪ LƯỢT CHẠY THẬT
  // ------------------------------------------------------
  // Bản trước dựng lịch sử ở đây từ các lượt HỎI, không có câu trả lời của trợ
  // lý — và đo được là nó đổi kết quả rất mạnh: nhóm "đại từ vật" ra 0% ở đây
  // trong khi lượt chạy đầy đủ (có câu trả lời thật trong lịch sử) cho 5/5.
  // Nguyên nhân: "V-Chain là gì?" một mình không đủ để bộ viết lại câu chắc
  // chắn "nó" = V-Chain; câu trả lời có nhắc lại tên thì đủ.
  //
  // Dựng câu trả lời thật cho từng lượt sẽ biến file này thành một lượt chạy
  // đầy đủ — đúng thứ nó tồn tại để tránh. Nên thay vào đó: đọc lại chuỗi
  // truy vấn mà production ĐÃ tạo ra, ghi trong qa-results.json, và truy hồi
  // bằng chính chuỗi đó. Không tốn thêm lượt gọi nào, và con số khớp với
  // đường thật.
  const realQuery = new Map<number, string>();
  try {
    const rj = JSON.parse(await readFile(RESULTS, "utf-8")) as {
      rows: Array<{ id: number; q: string; searchQuery: string }>;
    };
    for (const r of rj.rows) {
      if (r.searchQuery && r.searchQuery !== r.q) realQuery.set(r.id, r.searchQuery);
    }
    console.error(`đọc ${RESULTS}: ${realQuery.size} chuỗi truy vấn đã ghi`);
  } catch {
    console.error(`(chưa có ${RESULTS} — câu nối tiếp sẽ đo bằng lịch sử rút gọn)`);
  }

  const retriever = new Retriever();
  const rows: Row[] = [];
  const negRows: Array<{ id: number; q: string; nChunks: number; topScore: number | null }> = [];

  let done = 0;
  for (const c of [...positives, ...negatives]) {
    // Truyền lịch sử cho câu nối tiếp. Bản đầu của file này bỏ qua nó và truy
    // hồi trên câu THÔ, nên mọi câu nối tiếp đều bị đo với đại từ chưa giải —
    // tức đo một đường mà production không bao giờ đi. Bộ viết lại câu cần
    // đúng các lượt hỏi TRƯỚC để thay "nó"/"thầy ấy" bằng danh từ thật.
    //
    // Lịch sử ở đây chỉ gồm lượt NGƯỜI DÙNG, không có câu trả lời của trợ lý:
    // giải đại từ chỉ cần tiền ngữ, mà tiền ngữ nằm ở câu hỏi trước. Dựng câu
    // trả lời thật cho từng lượt sẽ biến file này thành một lượt chạy đầy đủ,
    // đúng thứ nó tồn tại để tránh.
    const recorded = realQuery.get(c.id);
    const history: ChatMessage[] = (c.history ?? []).map((h) => ({
      role: "user" as const,
      content: h,
    }));
    // Có chuỗi từ lượt chạy thật thì dùng thẳng, và KHÔNG chạy lại rewrite nữa
    // (truyền history rỗng) — chuỗi đó vốn đã là kết quả của rewrite.
    const searched = recorded ?? c.q;
    const t0 = Date.now();
    const { chunks } = await retriever.search(searched, {
      topK: DEPTH,
      history: recorded ? [] : history,
      ...(MIN_SCORE !== undefined ? { minScore: MIN_SCORE } : {}),
    });
    const ms = Date.now() - t0;

    if (c.gold) {
      let rank: number | null = null;
      let nGoldInK = 0;
      chunks.forEach((ch, i) => {
        if (isGold(ch, c.gold!)) {
          if (rank === null) rank = i + 1;
          if (i < TOP_K) nGoldInK++;
        }
      });
      rows.push({
        id: c.id, q: c.q, group: c.group, searched, rank, nGoldInK,
        nChunks: Math.min(chunks.length, TOP_K),
        topScore: chunks.length ? Number(chunks[0].score.toFixed(4)) : null,
        urls: [...new Set(chunks.slice(0, TOP_K).map((x) => x.url))].slice(0, 3),
        ms,
      });
    } else {
      negRows.push({
        id: c.id, q: c.q,
        nChunks: Math.min(chunks.length, TOP_K),
        topScore: chunks.length ? Number(chunks[0].score.toFixed(4)) : null,
      });
    }

    if (++done % 25 === 0) console.error(`  ${done}/${positives.length + negatives.length}`);
  }

  const n = rows.length;
  const hitAt = (k: number) => rows.filter((r) => r.rank !== null && r.rank <= k).length / n;
  const mrr = rows.reduce((s, r) => s + (r.rank ? 1 / r.rank : 0), 0) / n;
  // Dư địa tăng K: đáp án có trong top-20 nhưng không có trong top-K.
  const headroom = rows.filter(
    (r) => r.rank !== null && r.rank > TOP_K
  ).length;
  const emptyNeg = negRows.filter((r) => r.nChunks === 0).length;
  // Cân bằng hai chiều. Chỉ nhìn tỉ lệ chặn ngoài phạm vi là không đủ: một cấu
  // hình chặn TẤT CẢ sẽ đạt 100% ở đó trong khi giết sạch câu trả lời được.
  const inScopeKept = rows.filter((r) => r.nChunks > 0).length / n;

  const summary = {
    topK: TOP_K,
    minScore: MIN_SCORE ?? DEFAULT_MIN_SCORE,
    n,
    hit: Object.fromEntries(KS.map((k) => [k, hitAt(k)])),
    mrr,
    headroom,
    inScopeKept,
    negatives: negRows.length,
    negativesEmpty: emptyNeg,
    when: new Date().toISOString(),
  };

  const missed = rows.filter((r) => r.rank === null || r.rank > TOP_K);
  const L = console.log;
  L("");
  L("=".repeat(76));
  L(`CHỈ SỐ TRUY HỒI   topK=${TOP_K}  minScore=${summary.minScore}  n=${n}`);
  L("=".repeat(76));
  L("");
  L(`  1. Hit@${TOP_K}  ${pct(hitAt(TOP_K))}   <- CHỈ SỐ CHÍNH: đáp án có trong ${TOP_K} đoạn gửi LLM`);
  L(`  2. Dư địa tăng K: ${headroom} câu có đáp án ở hạng ${TOP_K + 1}-${DEPTH}`);
  L(`  3. MRR     ${mrr.toFixed(3)}   (chẩn đoán, không phải điểm chất lượng)`);
  L("");
  L("  4. CÂN BẰNG CHẶN / GIỮ — phải đọc CÙNG NHAU");
  L(`       chặn được ngoài phạm vi : ${emptyNeg}/${negRows.length} (${pct(negRows.length ? emptyNeg / negRows.length : 0)})`);
  L(`       giữ được câu trong phạm vi: ${pct(inScopeKept)}  <- nới ngưỡng làm số này tụt`);

  L("");
  L("ĐƯỜNG CONG Hit@k — chỗ bão hoà là chỗ tăng K hết tác dụng");
  for (const k of KS) {
    const v = hitAt(k);
    L(`  k=${String(k).padStart(2)}  ${pct(v).padStart(7)}  ${"#".repeat(Math.round(v * 46))}`);
  }

  L("");
  L("THEO NHÓM");
  L(`  ${"nhóm".padEnd(46)} ${"n".padStart(4)} ${`Hit@${TOP_K}`.padStart(8)} ${"MRR".padStart(6)}`);
  for (const gname of GROUPS) {
    const sub = rows.filter((r) => r.group === gname);
    if (!sub.length) continue;
    const h = sub.filter((r) => r.rank !== null && r.rank <= TOP_K).length / sub.length;
    const m = sub.reduce((s, r) => s + (r.rank ? 1 / r.rank : 0), 0) / sub.length;
    L(`  ${gname.slice(0, 46).padEnd(46)} ${String(sub.length).padStart(4)} ${pct(h).padStart(8)} ${m.toFixed(3).padStart(6)}`);
  }

  L("");
  L(`TRƯỢT Hit@${TOP_K}: ${missed.length}`);
  for (const r of missed.slice(0, 20)) {
    L(`  #${r.id} chunk=${r.nChunks} top=${r.topScore ?? "-"}  ${r.q.slice(0, 56)}`);
  }
  if (missed.length > 20) L(`  … và ${missed.length - 20} câu nữa`);

  if (BASELINE) {
    try {
      const txt = await readFile(BASELINE, "utf-8");
      // [\s\S] thay cho cờ /s: cờ đó cần target es2018+, còn tsconfig ở đây thấp hơn.
      const m = txt.match(/<!-- summary:([\s\S]*?) -->/);
      const prev = JSON.parse(m ? m[1] : txt) as typeof summary;
      const d = (a: number, b: number) => `${b - a >= 0 ? "+" : ""}${((b - a) * 100).toFixed(1)}pp`;
      L("");
      L("=".repeat(76));
      L(`CHÊNH LỆCH so với ${path.basename(BASELINE)} (topK=${prev.topK} minScore=${prev.minScore})`);
      L("=".repeat(76));
      for (const k of KS) {
        const a = prev.hit?.[k] ?? 0;
        L(`  Hit@${String(k).padStart(2)}  ${pct(a)} -> ${pct(hitAt(k))}   ${d(a, hitAt(k))}`);
      }
      L(`  giữ trong phạm vi  ${pct(prev.inScopeKept ?? 0)} -> ${pct(inScopeKept)}`);
      L(`  dư địa tăng K      ${prev.headroom ?? "-"} -> ${headroom}`);
      L(`  MRR    ${prev.mrr.toFixed(3)} -> ${mrr.toFixed(3)}`);
      L(`  chặn ngoài phạm vi  ${prev.negativesEmpty}/${prev.negatives} -> ${emptyNeg}/${negRows.length}`);
    } catch {
      L(`\n(không đọc được baseline ${BASELINE})`);
    }
  }

  // Xuất Markdown chứ không phải JSON thô: file này để NGƯỜI đọc — thầy hướng
  // dẫn và khách hàng — nên nó phải tự giải thích được từng con số. Phần
  // `summary` vẫn được nhúng ở cuối dưới dạng JSON cho lần chạy sau đối chiếu
  // bằng --baseline, nên không mất khả năng so máy-đọc-máy.
  await mkdir(path.dirname(OUT), { recursive: true });
  const md: string[] = [];
  md.push("# Chỉ số chất lượng truy hồi");
  md.push("");
  md.push(`Sinh bởi \`npm run qa:metrics\` — ${new Date().toISOString().slice(0, 16).replace("T", " ")}.`);
  md.push("");
  md.push(`Bộ mẫu: **${cases.length} câu** (\`scripts/qa-samples.ts\`), trong đó **${n}** có nhãn vàng`);
  md.push(`và **${negRows.length}** là câu ngoài phạm vi. ${skipped} câu còn lại không chấm ở đây —`);
  md.push("chủ đề của chúng nằm trong phạm vi nên truy hồi trả về đoạn là đúng; việc từ chối");
  md.push("là của LLM và được đo bằng `npm run qa:400`.");
  md.push("");
  md.push(`Cấu hình: \`topK=${TOP_K}\` \`minScore=${summary.minScore}\``);
  md.push("");
  md.push(`Câu nối tiếp được truy hồi bằng đúng chuỗi mà lượt chạy thật đã tạo ra`);
  md.push(`(\`${path.basename(RESULTS)}\`, ${realQuery.size} chuỗi) chứ không dựng lại từ lịch sử`);
  md.push("rút gọn — hai cách cho kết quả rất khác nhau ở nhóm đại từ.");
  md.push("");
  md.push("## Bốn chỉ số");
  md.push("");
  md.push("| Chỉ số | Giá trị | Nghĩa |");
  md.push("|---|---:|---|");
  md.push(`| **Hit@${TOP_K}** | **${pct(hitAt(TOP_K))}** | đáp án có nằm trong ${TOP_K} đoạn gửi cho LLM — **chỉ số chính** |`);
  md.push(`| Dư địa tăng K | ${headroom} câu | đáp án ở hạng ${TOP_K + 1}–${DEPTH}: phần cứu được chỉ bằng nới K |`);
  md.push(`| MRR | ${mrr.toFixed(3)} | chẩn đoán độ nhạy, **không phải** điểm chất lượng |`);
  md.push(`| Chặn ngoài phạm vi | ${emptyNeg}/${negRows.length} (${pct(negRows.length ? emptyNeg / negRows.length : 0)}) | đọc CÙNG dòng dưới |`);
  md.push(`| Giữ câu trong phạm vi | ${pct(inScopeKept)} | nới ngưỡng làm số này tụt |`);
  md.push("");
  md.push("Hai dòng cuối phải đọc cùng nhau: một cấu hình chặn *tất cả* sẽ đạt 100% ở");
  md.push("dòng trên trong khi giết sạch câu trả lời được ở dòng dưới.");
  md.push("");
  md.push("Không dùng P@K. Nhãn vàng ở đây là mẫu từ khoá nhận diện đoạn *chứa đáp án*;");
  md.push("một đoạn không khớp mẫu vẫn có thể là ngữ cảnh cần thiết. Gọi tỉ lệ đó là");
  md.push("\"độ chính xác\" là gán cho nhãn một ý nghĩa nó không mang.");
  md.push("");
  md.push("## Đường cong Hit@k");
  md.push("");
  md.push("| k | Hit@k | |");
  md.push("|---:|---:|---|");
  for (const k of KS) {
    md.push(`| ${k}${k === TOP_K ? " **(đang dùng)**" : ""} | ${pct(hitAt(k))} | ${"█".repeat(Math.round(hitAt(k) * 30))} |`);
  }
  md.push("");
  md.push("Chỗ đường cong bão hoà là chỗ tăng K hết tác dụng.");
  md.push("");
  md.push("## Theo nhóm câu hỏi");
  md.push("");
  md.push(`| Nhóm | n | Hit@${TOP_K} | MRR |`);
  md.push("|---|---:|---:|---:|");
  for (const gname of GROUPS) {
    const sub = rows.filter((r) => r.group === gname);
    if (!sub.length) continue;
    const h = sub.filter((r) => r.rank !== null && r.rank <= TOP_K).length / sub.length;
    const m = sub.reduce((s2, r) => s2 + (r.rank ? 1 / r.rank : 0), 0) / sub.length;
    md.push(`| ${gname} | ${sub.length} | ${pct(h)} | ${m.toFixed(3)} |`);
  }
  md.push("");
  md.push(`## ${missed.length} câu trượt Hit@${TOP_K}`);
  md.push("");
  md.push("| id | câu hỏi | chunk | điểm cao nhất |");
  md.push("|---:|---|---:|---:|");
  for (const r of missed) {
    md.push(`| ${r.id} | ${r.q.replace(/\|/g, "\|")} | ${r.nChunks} | ${r.topScore ?? "—"} |`);
  }
  md.push("");
  md.push("Chi tiết 7 đoạn của từng ca nằm ở `docs/qa-failures.md`.");
  md.push("");
  md.push("<!-- summary:" + JSON.stringify(summary) + " -->");
  await writeFile(OUT, md.join("\n"), "utf-8");
  L("");
  L(`Đã ghi ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
