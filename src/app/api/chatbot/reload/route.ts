/**
 * Ép app nạp lại store.json ngay, không chờ nhịp kiểm mtime tiếp theo.
 *
 * Đây là ĐƯỜNG NHANH, không phải đường duy nhất. getStore() vốn đã tự kiểm
 * mtime mỗi 5 giây, nên dữ liệu mới sẽ tới nơi kể cả khi route này không bao
 * giờ được gọi. Hai cơ chế bù cho đúng điểm yếu của nhau:
 *
 *   - gọi tường minh  -> tức thì và xác định, nhưng hỏng nếu job chết trước
 *                        khi kịp gọi
 *   - tự kiểm mtime   -> không bao giờ bỏ sót, nhưng trễ vài giây
 *
 * Cả hai đổ về cùng một hàm nạp lại, nên đây không phải hai đường code — chỉ
 * là hai cái cò cho cùng một khẩu súng.
 *
 * Trả về số chunk để job KIỂM CHỨNG được thay vì phải tin. `changed: false`
 * kèm số chunk không đổi nghĩa là pha C chưa ghi gì mới — đáng ghi vào log
 * hàng tuần, vì nó tách "đã cập nhật" khỏi "tưởng là đã cập nhật".
 */
import { NextResponse } from "next/server";
import { reloadStore } from "@/lib/chatbot/vectorStore";
import { assertInternal } from "@/lib/chatbot/internalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = assertInternal(req);
  if (denied) return denied;

  try {
    const info = await reloadStore();
    console.log(
      `[chatbot] /reload: ${info.changed ? "ĐÃ nạp bản mới" : "không có gì đổi"} — ` +
        `${info.chunks} chunk (mtime ${info.version})`
    );
    return NextResponse.json(info);
  } catch (err) {
    console.error("[chatbot] /api/chatbot/reload thất bại:", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 }
    );
  }
}
