/**
 * Nhận ra câu hỏi trỏ ngược về lượt trước ("người thứ 2", "cái đó"), và quyết
 * định hai nhánh xử lý dựa trên đó: chặn câu trỏ vào hư không, và dùng lại
 * chunk của lượt trước khi truy hồi lượt này không neo được vào đâu.
 *
 * Không có bản tương ứng bên retriever.py; đây là phần JS-only nên lý do được
 * ghi thẳng ở đây thay vì trỏ sang.
 *
 * LỊCH SỬ — file này từng chứa một cơ chế thứ ba, query ghép ngữ cảnh: dán câu
 * hỏi trước vào trước câu hiện tại rồi nhúng cả cụm, để cứu follow-up mất chủ
 * đề ("Học phí bao nhiêu?"). Nó đã bị xoá, vì hai lý do cộng lại:
 *
 *   - Đo được là có hại và đã tắt mặc định từ trước khi bị xoá. Cổng chặn chỉ
 *     nhìn ĐỘ DÀI, mà "các khoá học" (tự đủ nghĩa) và "Học phí bao nhiêu?"
 *     (mất chủ đề) là hai danh ngữ ngắn như nhau — không tách được. Trên
 *     production, sau "hoạt động của bkfintech vào 2026" thì câu "các khoá
 *     học." bị ghép và chunk sự kiện của lượt trước chiếm chỗ trang khóa học.
 *   - queryRewriter.ts giải đúng bài toán đó, ở tầng ngữ nghĩa: nó đọc history
 *     rồi VIẾT RA một truy vấn tự đủ nghĩa, thay vì nối chuỗi và hy vọng vector
 *     đi đúng hướng.
 *
 * Hai cơ chế còn lại KHÔNG thừa theo cùng lập luận đó, và đây là chỗ dễ nhầm:
 * rewriteQuery() là best-effort — hỏng thì trả về câu gốc (timeout, hết quota,
 * hoặc CHATBOT_REWRITE=0). Đúng những lượt đó là lúc cần lưới an toàn ở dưới.
 */
import {
  CONTEXT_ANAPHORA,
  CONTEXT_FALLBACK_ENABLED,
  CONTEXT_ORDINAL_WORDS,
  CONTEXT_ORDINAL_WORDS_EN,
  CONTEXT_WEAK_DENSE,
} from "./config";

/** Unicode-aware word split — \w and \b are ASCII-only in JS, so they would
 * both miscount "Học phí bao nhiêu" and break word-boundary matching on any
 * accented anaphora. One tokenizer feeds both the length gate and the anaphora
 * lookup so the two can never disagree about what a word is. */
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/**
 * Câu hỏi có chứa tham chiếu TƯỜNG MINH tới lượt trước hay không —
 * từ chỉ xuất ("nó", "đó") hoặc tham chiếu thứ tự ("người thứ 2",
 * "cái đầu tiên").
 *
 * KHÔNG dùng ngưỡng độ dài, và đó là điểm mấu chốt — nó chính là thứ đã làm
 * hỏng cơ chế ghép ngữ cảnh cũ (xem docblock đầu file). Độ dài không phân biệt
 * được "các khoá học" (tự đủ nghĩa) với "Học phí bao nhiêu?" (mất chủ đề). Hai
 * nhánh xử lý mạnh tay bên dưới đều dựa vào hàm này chứ không dựa vào độ dài:
 * một câu chứa "thứ 2" thì gần như chắc chắn đang trỏ về đâu đó, còn một câu
 * chỉ ngắn thì không suy ra được gì.
 *
 * Đánh đổi có chủ đích: "Học phí bao nhiêu?" KHÔNG khớp hàm này. Thà bỏ sót còn
 * hơn làm hỏng câu hỏi độc lập — và ca đó giờ đã có queryRewriter.ts lo.
 */
export function hasExplicitReference(question: string): boolean {
  const tokens = tokenize(question);
  if (tokens.some((t) => CONTEXT_ANAPHORA.includes(t))) return true;
  if (tokens.some((t) => CONTEXT_ORDINAL_WORDS_EN.includes(t))) return true;

  // Tham chiếu thứ tự khớp theo CẶP token, không theo token đơn: "hai" đứng
  // một mình là số đếm ("hai khóa học"), chỉ "thứ hai" mới là tham chiếu.
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a === "thứ" && (/^\d+$/.test(b) || CONTEXT_ORDINAL_WORDS.includes(b))) {
      return true;
    }
    if (a === "đầu" && b === "tiên") return true;
    if (a === "cuối" && b === "cùng") return true;
  }
  return false;
}

/** Điểm dense cao nhất trong tập chunk — thước đo "truy hồi có neo được vào
 * đâu không". Phải là `dense_score` (cosine thô) chứ không phải `score`: sau
 * rerank, `score` đi qua rescale() min-max nên đỉnh luôn ≈ DENSE_WEIGHT bất kể
 * câu hỏi tốt hay tệ. `dense_score` chỉ có mặt khi rerank đã chạy, nên có
 * fallback về `score` cho đường không rerank. */
export function topDenseScore(
  chunks: { score: number; dense_score?: number }[]
): number {
  if (chunks.length === 0) return 0;
  return Math.max(...chunks.map((c) => c.dense_score ?? c.score));
}

/**
 * Câu hỏi trỏ về một lượt trước không tồn tại.
 *
 * Đo được: gặp tình huống này model KHÔNG từ chối — nó chọn đại người xuất
 * hiện thứ hai trong <data> rồi khẳng định chắc nịch (3/3 lần, sai tên). Trả
 * lời sai mà không có dấu hiệu gì thì tệ hơn một câu từ chối, nên chặn ở code
 * chứ không giao cho prompt: luật trong SYSTEM_PROMPT vẫn nên có (và đã thêm),
 * nhưng nó là lớp phòng thủ thứ hai, không phải lớp duy nhất.
 */
export function isOrphanReference(
  question: string,
  historyLength: number
): boolean {
  return historyLength === 0 && hasExplicitReference(question);
}

/**
 * Có nên bỏ tập chunk vừa truy hồi để dùng lại tập của lượt trước không.
 *
 * Hai điều kiện, cố ý độc lập với nhau:
 *
 *   1. câu hỏi có tham chiếu TƯỜNG MINH — không phải chỉ "ngắn". Chính phép
 *      thử độ dài đã kéo chunk lạc đề vào "các khoá học" trên production.
 *   2. truy hồi của chính lượt này không neo được vào đâu (topDense dưới
 *      CONTEXT_WEAK_DENSE).
 *
 * Điều kiện 2 là phần kiểm duyệt: một câu follow-up mà truy hồi vốn đã tốt thì
 * không bị đụng tới gì cả.
 *
 * Xuất khẩu để route.ts và bài test dùng CHUNG một luật — một bài test tự chấm
 * theo luật riêng của nó thì đang đo một sản phẩm khác với sản phẩm người dùng
 * chạy (xem chú thích cùng ý trong scripts/qa-test.ts).
 */
export function shouldReusePreviousChunks(
  question: string,
  hasPrevious: boolean,
  topDense: number
): boolean {
  return (
    CONTEXT_FALLBACK_ENABLED &&
    hasPrevious &&
    hasExplicitReference(question) &&
    topDense < CONTEXT_WEAK_DENSE
  );
}
