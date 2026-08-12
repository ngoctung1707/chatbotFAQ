/**
 * Khôi phục dấu tiếng Việt cho câu hỏi, bằng bigram + Viterbi dựng từ chính
 * corpus đã đánh index.
 *
 * Vì sao cần: câu hỏi gõ không dấu ("vien truong la ai") làm sập truy hồi, vì
 * "viện" và "vien" là hai chuỗi khác nhau với cả tầng lexical lẫn tầng dense —
 * tiếng Việt không dấu nằm ngoài phân bố dữ liệu BGE-M3 được huấn luyện. Đo
 * qua /api/chat trên 21 câu hỏi vàng: Recall@7 rơi từ 100% (có dấu) xuống 57%
 * (không dấu), và khôi phục dấu kéo lại lên 86% — cứu 6 câu vốn mất hẳn đoạn
 * đúng khỏi ngữ cảnh.
 *
 * Vì sao là Viterbi chứ không phải cách khác. Đã thử và loại, đo trên 30 câu:
 *   unigram (chọn dạng phổ biến nhất từng từ, không ngữ cảnh)
 *       74% đúng từ · 17% đúng cả câu
 *   masked LM local (bert-base-multilingual-cased chấm ứng viên theo ngữ cảnh)
 *       91% đúng từ · 50% đúng cả câu · 767ms/câu · +1.4GB RAM
 *   viterbi
 *       91% đúng từ · 50% đúng cả câu · ~0.5ms/câu · ~50MB bảng
 * Model local cho cùng độ chính xác (thực ra kém đúng 1 từ) nhưng đòi 767ms
 * mỗi câu và 1.4GB, trên tiến trình vốn đã ~3GB vì BGE-M3 và Marian.
 */
import { readFile } from "fs/promises";
import { INDEX_DIR } from "./config";

// ───────────────────────────── Bỏ dấu ─────────────────────────────

/** Tách ký tự tổ hợp rồi xoá dấu. đ/Đ xử lý riêng vì nó là chữ cái độc lập
 * trong bảng chữ cái tiếng Việt chứ không phải d + dấu phụ. */
export function stripDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Câu này có cần khôi phục dấu không.
 *
 * Trả về false ngay khi thấy MỘT chữ đã có dấu. Đây là quyết định an toàn chứ
 * không phải lười: người gõ có dấu thì gõ có dấu cả câu, nên một chữ có dấu là
 * đủ kết luận người dùng không cần ta đoán hộ. Đoán thêm lúc đó chỉ có thể phá
 * một câu vốn đã đúng — thống kê từ corpus không bao giờ chắc bằng thứ người
 * dùng tự gõ ra. Đã kiểm qua /api/chat trên 8 câu có dấu: danh sách nguồn
 * trước và sau trùng khớp tuyệt đối, từng URL từng điểm số.
 *
 * Đánh đổi đã biết: câu gõ lẫn lộn ("hoc phi ngành fintech") bị bỏ qua hoàn
 * toàn. Chấp nhận được, vì kiểu gõ nửa vời hiếm, còn cái giá của việc phá một
 * câu đúng thì cao hơn cái lợi của việc sửa một câu nửa vời.
 */
export function needsRestoration(text: string): boolean {
  return stripDiacritics(text) === text;
}

// ────────────────────── Bảng thống kê từ corpus ──────────────────────

export interface Tables {
  /** khoá không dấu -> { dạng có dấu -> số lần xuất hiện } */
  uni: Map<string, Map<string, number>>;
  /** "từ_trước|khoá_không_dấu" -> { dạng có dấu -> số lần } */
  bi: Map<string, Map<string, number>>;
  /** tổng số lần xuất hiện mỗi dạng có dấu, cho xác suất tiên nghiệm */
  freq: Map<string, number>;
  total: number;
}

function bump(m: Map<string, Map<string, number>>, key: string, val: string) {
  let inner = m.get(key);
  if (!inner) m.set(key, (inner = new Map()));
  inner.set(val, (inner.get(val) || 0) + 1);
}

const WORD_RE = /[\p{L}\p{N}]+/gu;

/** Quét corpus một lượt, đếm ba thứ Viterbi cần: từ nào có thể là dạng có dấu
 * của khoá nào, cặp từ nào hay đi cạnh nhau, và tần suất tổng của mỗi từ. */
export function buildTables(documents: string[]): Tables {
  const uni = new Map<string, Map<string, number>>();
  const bi = new Map<string, Map<string, number>>();
  const freq = new Map<string, number>();
  let total = 0;

  for (const doc of documents) {
    const words = (doc.toLowerCase().match(WORD_RE) ?? []) as string[];
    let prev = "<s>";
    for (const w of words) {
      const key = stripDiacritics(w);
      bump(uni, key, w);
      bump(bi, `${prev}|${key}`, w);
      freq.set(w, (freq.get(w) || 0) + 1);
      total++;
      prev = w;
    }
  }
  return { uni, bi, freq, total };
}

// Cache trên globalThis chứ không phải biến module, cùng lý do đã ghi dài ở
// embedding.ts: Next biên dịch instrumentation.ts ở webpack layer khác route
// handler nên một file nguồn có thể thành hai module instance trong cùng tiến
// trình. Bảng này tốn ~50MB và mất một lượt quét 152K lượt từ để dựng — trả
// tiền hai lần cho nó là lãng phí thấy rõ.
declare global {
  var __bkftDiacriticTables: Promise<Tables> | undefined;
}

/**
 * Bảng dựng từ store.json — cùng file mà VectorStore nạp.
 *
 * Đọc store.json chứ không phải data/processed/chunks.json là có chủ ý:
 * chunks.json là đầu vào lúc BUILD (sản phẩm của crawler), còn store.json là
 * thứ runtime vốn đã bắt buộc phải có. Một bản deploy có thể chỉ mang theo
 * store.json, nên phụ thuộc vào nó thì an toàn hơn.
 *
 * Cái giá: file 20MB bị parse thêm một lần nữa ngoài lần VectorStore đã parse.
 * Chấp nhận được vì đây là tiến trình sống lâu (`node server.js` từ standalone
 * output) — một lần ~300ms lúc khởi động, cạnh 20s preload model.
 */
export function loadTables(): Promise<Tables> {
  if (!globalThis.__bkftDiacriticTables) {
    globalThis.__bkftDiacriticTables = (async () => {
      const raw = await readFile(`${INDEX_DIR}/store.json`, "utf-8");
      const parsed = JSON.parse(raw) as
        | { chunks: Array<{ raw?: string; content?: string }> }
        | Array<{ raw?: string; content?: string }>;
      const chunks = Array.isArray(parsed) ? parsed : parsed.chunks;
      return buildTables(chunks.map((c) => c.content || c.raw || ""));
    })().catch((e) => {
      // Bỏ cache khi hỏng để lần sau thử lại, thay vì để một lỗi thoáng qua
      // khoá chết tính năng suốt đời tiến trình.
      globalThis.__bkftDiacriticTables = undefined;
      throw e;
    });
  }
  return globalThis.__bkftDiacriticTables;
}

// ───────────────────── Tách câu, giữ nguyên dấu câu ─────────────────────

/** Mảng xen kẽ [ngăn cách, từ, ngăn cách, từ, …] để ghép lại y nguyên khoảng
 * trắng và dấu câu. Vị trí lẻ là từ. */
function splitKeepSeparators(text: string): string[] {
  return text.split(/([\p{L}\p{N}]+)/u);
}

/** Trả lại kiểu viết hoa của bản gốc: "Vien" -> "Viện", "VIEN" -> "VIỆN". */
function matchCase(original: string, restored: string): string {
  if (original === original.toUpperCase() && original.length > 1) {
    return restored.toUpperCase();
  }
  if (original[0] === original[0]?.toUpperCase()) {
    return restored.charAt(0).toUpperCase() + restored.slice(1);
  }
  return restored;
}

/** Vị trí các từ trong mảng parts, kèm ứng viên có dấu lấy từ corpus. Từ nào
 * corpus chưa từng thấy thì ứng viên duy nhất là chính nó — không đoán bừa. */
function layout(text: string, t: Tables) {
  const parts = splitKeepSeparators(text);
  const idx: number[] = [];
  const cands: string[][] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const lower = parts[i].toLowerCase();
    const row = t.uni.get(lower);
    idx.push(i);
    cands.push(row && row.size ? [...row.keys()] : [lower]);
  }
  return { parts, idx, cands };
}

// ──────────────────────── Bigram + Viterbi ────────────────────────

/** Làm mượt cộng, lùi về unigram khi cặp bigram chưa từng thấy:
 *
 *   P(c | p) = (bi(p,c) + α·P_uni(c)) / (Σ bi(p,·) + α)
 *
 * Không có phần lùi thì mọi cặp chưa gặp có xác suất 0, và một câu hỏi hơi lạ
 * sẽ không tìm nổi đường đi hợp lệ nào. α nhỏ nghĩa là tin bigram nhiều hơn;
 * lớn nghĩa là nghiêng về tần suất từ đơn khi bigram thưa. */
const ALPHA = 0.4;

function logProb(t: Tables, prev: string, key: string, cand: string): number {
  const pUni = (t.freq.get(cand) || 0.5) / t.total;
  const row = t.bi.get(`${prev}|${key}`);
  if (!row) return Math.log(pUni);
  let sum = 0;
  for (const n of row.values()) sum += n;
  return Math.log(((row.get(cand) || 0) + ALPHA * pUni) / (sum + ALPHA));
}

/**
 * Chọn tổ hợp dấu cho CẢ CÂU sao cho tổng log xác suất cao nhất, thay vì chọn
 * từng từ riêng lẻ.
 *
 * Vì sao phải xét cả câu: đứng một mình "viên" phổ biến hơn "viện" (183 so với
 * 164 trong corpus này) và "trường" phổ biến hơn "trưởng" (442 so với 200) —
 * chọn từng từ sẽ ra "viên trường", sai cả hai. Nhưng cặp "viện trưởng" xuất
 * hiện 9 lần còn "viên trường" chỉ 2, nên xét cả câu thì phần thắng ở bước
 * chuyển tiếp bù được phần thua ở từ đầu.
 *
 * Viterbi được vì đây là chuỗi Markov bậc 1: điểm của một từ chỉ phụ thuộc từ
 * ngay trước nó. Nhờ đó quy hoạch động chạy O(n·k²) thay vì duyệt hết k^n tổ
 * hợp — câu 8 từ mỗi từ 4 ứng viên là ~128 phép tính thay vì 65.536.
 */
function viterbiChoose(cands: string[][], t: Tables): string[] {
  if (!cands.length) return [];

  // score[j] = log xác suất của đường đi TỐT NHẤT kết thúc ở ứng viên j.
  let score = cands[0].map((c) => logProb(t, "<s>", stripDiacritics(c), c));
  // back[i][j] = ở bước i, đường tốt nhất tới ứng viên j đến từ ứng viên nào
  // của bước i-1. Cần để lần ngược ra đáp án sau khi đi hết câu.
  const back: number[][] = [cands[0].map(() => -1)];

  for (let i = 1; i < cands.length; i++) {
    const key = stripDiacritics(cands[i][0]);
    const next: number[] = [];
    const ptr: number[] = [];
    for (const cand of cands[i]) {
      let bestScore = -Infinity;
      let bestPrev = 0;
      for (let p = 0; p < cands[i - 1].length; p++) {
        const s = score[p] + logProb(t, cands[i - 1][p], key, cand);
        if (s > bestScore) { bestScore = s; bestPrev = p; }
      }
      next.push(bestScore);
      ptr.push(bestPrev);
    }
    score = next;
    back.push(ptr);
  }

  let j = 0;
  for (let k = 1; k < score.length; k++) if (score[k] > score[j]) j = k;
  const chosen: string[] = new Array(cands.length);
  for (let i = cands.length - 1; i >= 0; i--) {
    chosen[i] = cands[i][j];
    j = back[i][j];
  }
  return chosen;
}

/** Khôi phục dấu cho một câu, với bảng đã dựng sẵn. Câu đã có dấu trả về y
 * nguyên. Đồng bộ, không I/O — dùng khi caller đã tự giữ bảng. */
export function restoreViterbi(text: string, t: Tables): string {
  if (!needsRestoration(text)) return text;
  const { parts, idx, cands } = layout(text, t);
  if (!idx.length) return text;
  const chosen = viterbiChoose(cands, t);
  for (let i = 0; i < idx.length; i++) {
    parts[idx[i]] = matchCase(parts[idx[i]], chosen[i]);
  }
  return parts.join("");
}

/**
 * Điểm vào cho tầng truy hồi: khôi phục dấu cho câu hỏi, tự lo bảng.
 *
 * Kiểm tra needsRestoration TRƯỚC khi chạm tới bảng là có chủ ý — câu hỏi có
 * dấu (đa số) thoát ra ngay mà không kích hoạt việc đọc và parse store.json
 * lần nào.
 *
 * Hỏng thì trả lại câu gốc chứ không ném lỗi: thiếu dấu chỉ làm giảm chất
 * lượng truy hồi, không đáng để làm sập cả lượt chat. Cùng lập trường với
 * rewriteQuery() khi call LLM hỏng.
 */
export async function restoreQuestion(question: string): Promise<string> {
  if (!needsRestoration(question)) return question;
  try {
    return restoreViterbi(question, await loadTables());
  } catch (err) {
    console.error("    !! khôi phục dấu thất bại, dùng câu gốc:", err);
    return question;
  }
}
