/**
 * Cổng cho hai route nội bộ: /api/chatbot/embed và /api/chatbot/reload.
 *
 * Chúng tồn tại để job cập nhật hàng tuần gọi vào, và cả hai đều nguy hiểm nếu
 * để hở: /embed cho phép người gọi bắt máy chủ chạy BGE-M3 bao nhiêu lần tuỳ
 * thích (một cách đốt CPU rất rẻ cho kẻ tấn công, rất đắt cho Viện), còn
 * /reload cho phép ép đọc lại file 20MB liên tục.
 *
 * KHOÁ BẰNG BÍ MẬT CHỨ KHÔNG PHẢI BẰNG ĐỊA CHỈ IP. Kiểm "có phải localhost
 * không" nghe chắc chắn hơn thực tế: sau một reverse proxy thì mọi request đều
 * đến từ 127.0.0.1, và header X-Forwarded-For thì client tự đặt được. Một
 * chuỗi bí mật không phụ thuộc vào tầng mạng nên không hỏng theo cách đó.
 *
 * HỎNG THÌ ĐÓNG, KHÔNG MỞ: chưa đặt CHATBOT_INTERNAL_SECRET thì hai route trả
 * 503 chứ không chạy. Mặc định "cho qua khi chưa cấu hình" là cách một biến
 * môi trường bị quên trở thành một lỗ hổng.
 */
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { INTERNAL_SECRET } from "./config";

/** So sánh không rò rỉ thời gian. So bằng `===` thì thời gian trả lời phụ
 *  thuộc số ký tự khớp đầu tiên, và đó là đủ để dò ra bí mật từng ký tự một. */
function secretMatches(got: string): boolean {
  const a = Buffer.from(got, "utf8");
  const b = Buffer.from(INTERNAL_SECRET, "utf8");
  // timingSafeEqual ném lỗi khi hai buffer khác độ dài, nên phải chặn trước —
  // và chính phép chặn đó đã làm lộ độ dài. Chấp nhận được: độ dài bí mật
  // không phải thứ cần giấu, nội dung mới là.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Trả về `null` khi request hợp lệ, hoặc một response lỗi để route trả thẳng.
 *
 * Dạng "trả về response lỗi" thay vì ném exception là cố ý: route gọi nó ở
 * dòng đầu tiên và `if (denied) return denied`, nên không có đường nào chạy
 * tiếp mà quên mất phần kiểm tra.
 */
export function assertInternal(req: Request): NextResponse | null {
  if (!INTERNAL_SECRET) {
    return NextResponse.json(
      {
        error:
          "Chưa đặt CHATBOT_INTERNAL_SECRET — route nội bộ đang bị khoá. " +
          "Đặt biến này trong .env của app và dùng cùng giá trị cho job.",
      },
      { status: 503 }
    );
  }
  const got = req.headers.get("x-internal-secret");
  if (!got || !secretMatches(got)) {
    return NextResponse.json({ error: "Sai hoặc thiếu x-internal-secret" }, { status: 401 });
  }
  return null;
}
