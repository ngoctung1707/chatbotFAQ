/**
 * Cho job cập nhật hàng tuần mượn BGE-M3 của app.
 *
 * VÌ SAO CÓ ROUTE NÀY
 * -------------------
 * Trước đây pha B (`scripts/crawl/embed.ts`) tự nạp một bản BGE-M3 trong tiến
 * trình `tsx` của nó. Máy chủ 8GB không chứa nổi hai bản ~1,9GB cùng lúc, nên
 * job buộc phải bắt app nhả model ra trước — tức `docker compose restart app`,
 * rồi restart lần nữa lúc xong. Mỗi lần cập nhật dữ liệu là hai lần cả
 * fintech.hust.edu.vn chớp tắt.
 *
 * Route này đảo ngược chiều đó: app GIỮ model, job đến mượn. Trong toàn hệ
 * thống chỉ còn đúng một bản BGE-M3, sống suốt đời tiến trình app, và không
 * còn lần restart nào.
 *
 * Chuyện này an toàn vì hai luồng công việc không bao giờ chạy cùng lúc: suốt
 * cửa sổ bảo trì, /api/chat chặn ở cờ bảo trì TRƯỚC khi đụng tới truy hồi. Kể
 * cả nếu có chồng nhau thì worker xử lý message tuần tự nên chúng xếp hàng chứ
 * không tranh RAM.
 */
import { NextResponse } from "next/server";
import { embedDenseBatch } from "@/lib/chatbot/embedding";
import { assertInternal } from "@/lib/chatbot/internalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pha B có thể phải embed hàng trăm chunk. Trần này là cho MỘT lô, và job tự
// chia lô nhỏ (xem CHATBOT_EMBED_BATCH), nên 300s là rất rộng rãi — nó chỉ ở
// đây để một worker treo không giữ kết nối vô hạn.
export const maxDuration = 300;

/** Trần số đoạn trong một lô. Không phải để tối ưu mà để chặn: một mảng
 *  100.000 chuỗi trong một request là cách làm app hết RAM chỉ bằng body. */
const MAX_BATCH = 128;

export async function POST(req: Request) {
  const denied = assertInternal(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const texts: unknown = body?.texts;

  if (!Array.isArray(texts) || texts.some((t) => typeof t !== "string")) {
    return NextResponse.json(
      { error: "Body phải là { texts: string[] }" },
      { status: 400 }
    );
  }
  if (texts.length === 0) return NextResponse.json({ vectors: [] });
  if (texts.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Tối đa ${MAX_BATCH} đoạn mỗi lô, nhận được ${texts.length}` },
      { status: 400 }
    );
  }

  try {
    const vectors = await embedDenseBatch(texts as string[]);
    return NextResponse.json({ vectors });
  } catch (err) {
    // Trả 500 kèm nguyên văn lỗi. Đây là route nội bộ đã qua cổng bí mật, và
    // bên gọi là một job chạy lúc 2h sáng ghi vào log — giấu lỗi ở đây chỉ làm
    // người trực sáng hôm sau mất thời gian.
    console.error("[chatbot] /api/chatbot/embed thất bại:", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 }
    );
  }
}
