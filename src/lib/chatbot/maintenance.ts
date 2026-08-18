/**
 * Chế độ bảo trì — mục 4.5 và 4.6 của kế hoạch cập nhật dữ liệu hàng tuần.
 *
 * Vì sao KHÔNG dừng container: service `app` phục vụ TOÀN BỘ website, không
 * riêng chatbot. `docker compose stop app` nghĩa là fintech.hust.edu.vn offline
 * suốt cửa sổ bảo trì, chứ không phải "chatbot tạm nghỉ".
 *
 * Vì sao cũng KHÔNG để app chạy nguyên trạng rồi chỉ hiện banner: tiến trình
 * web preload BGE-M3 lúc boot và giữ thường trực (~1,1–2,2GB). Job embed nạp
 * bản thứ hai -> hai bản model trong RAM cùng lúc, đúng thứ cả kế hoạch tránh.
 *
 * ─── GIẤY PHÉP CÓ HẠN, KHÔNG PHẢI CỜ TỒN TẠI ────────────────────────────────
 *
 * Bản đầu tiên dùng "có file = đang bảo trì". Nó không diễn đạt được điều quan
 * trọng nhất: job còn sống hay đã chết. Nên phải đi hỏi kernel bằng
 * `kill -0 $PID` — và câu hỏi đó TRẢ LỜI SAI khi cron chạy khác user với job:
 * kernel báo EPERM, script hiểu thành "đã chết", rồi gỡ cờ và restart app ngay
 * giữa lúc pha B đang embed. Hai bản model trong RAM, đúng lúc RAM căng nhất.
 *
 * Giấy phép thay câu hỏi "tiến trình này còn sống không?" bằng "có ai vừa gia
 * hạn gần đây không?". Câu thứ hai không cần quyền gì cả, chạy đúng qua ranh
 * giới user lẫn container, và tự phục hồi: job chết thì hạn tự hết.
 *
 *   Job  : ghi hạn = bây giờ + 5 phút, và gia hạn mỗi 60 giây
 *   App  : đang bảo trì  ⟺  bây giờ < hạn
 *
 * Tỉ lệ 5 lần là cố ý. Gia hạn diễn ra đúng lúc máy căng nhất (đang embed, RAM
 * sát trần), nên phải chịu được vài nhịp trễ. Và hai hướng sai lệch nhau rất
 * xa: hạn quá ngắn -> app tưởng job chết -> nạp model -> có thể OOM giữa đợt
 * cập nhật; hạn quá dài -> chatbot nghỉ thêm vài phút lúc 2h sáng chủ nhật.
 * Khi phân vân thì luôn nghiêng về hạn dài hơn.
 *
 * Lưu ý: job TREO (còn sống, không tiến) vẫn gia hạn, nên bảo trì vẫn tiếp tục
 * — và đó là hành vi ĐÚNG, vì nó vẫn đang giữ 2GB model. Xử lý job treo là việc
 * của watchdog 15 phút, không phải của cơ chế này.
 */
import { existsSync, readFileSync, statSync } from "fs";
import { INDEX_DIR } from "./config";

/**
 * Đặt cạnh chỉ mục để dùng chung một volume — thứ duy nhất job và app cùng
 * nhìn thấy. `CHATBOT_MAINTENANCE_FLAG` chỉ để test cục bộ trỏ đi chỗ khác.
 */
export const MAINTENANCE_FLAG =
  process.env.CHATBOT_MAINTENANCE_FLAG || `${INDEX_DIR}/../maintenance.flag`;

/** Hạn của một giấy phép, tính từ lúc ghi. Job phải gia hạn trước khi hết. */
export const LEASE_MS = 5 * 60 * 1000;

/** Khoảng gia hạn mà job phải tuân thủ. Chỉ để tài liệu hoá; job tự đặt. */
export const RENEW_MS = 60 * 1000;

export interface MaintenanceState {
  active: boolean;
  /** Câu hiển thị cho người dùng. Job có thể ghi câu riêng vào file. */
  message: string;
  since: string | null;
  /** Mốc hết hạn. `null` khi không đọc được và phải suy từ mtime. */
  expires_at: string | null;
  /** Còn bao nhiêu giây nữa hết hạn. Âm nghĩa là đã hết. */
  expires_in_sec: number | null;
}

const DEFAULT_MESSAGE =
  "Chatbot đang cập nhật dữ liệu, bạn quay lại sau ít phút nhé.";

const inactive = (): MaintenanceState => ({
  active: false,
  message: "",
  since: null,
  expires_at: null,
  expires_in_sec: null,
});

/**
 * Đọc giấy phép. Cố ý dùng bản đồng bộ và đọc lại mỗi lần gọi thay vì cache:
 * file chỉ vài chục byte, còn cache thì sẽ giữ trạng thái cũ sau khi job xoá
 * giấy phép — đúng lúc cần chatbot sống lại nhất.
 */
export function readMaintenance(now: number = Date.now()): MaintenanceState {
  try {
    if (!existsSync(MAINTENANCE_FLAG)) return inactive();

    const raw = readFileSync(MAINTENANCE_FLAG, "utf-8").trim();
    let parsed: Partial<MaintenanceState> | null = null;
    try {
      parsed = raw ? (JSON.parse(raw) as Partial<MaintenanceState>) : null;
    } catch {
      parsed = null;
    }

    // Nội dung hỏng hoặc file rỗng (đọc trúng lúc đang ghi). Suy hạn từ mtime:
    // nó vẫn đọc được kể cả khi nội dung không parse nổi. Nhờ vậy một file hỏng
    // KHÔNG khoá chatbot vĩnh viễn — nó chỉ giữ bảo trì thêm tối đa một hạn.
    const expiresMs = parsed?.expires_at
      ? Date.parse(parsed.expires_at)
      : statSync(MAINTENANCE_FLAG).mtimeMs + LEASE_MS;

    if (!Number.isFinite(expiresMs) || now >= expiresMs) {
      // Giấy phép đã hết hạn. File có thể còn nằm đó (job bị kill -9, máy
      // reboot) nhưng nó không còn hiệu lực — app tự trở lại phục vụ mà không
      // cần ai can thiệp.
      return inactive();
    }

    return {
      active: true,
      message: parsed?.message || DEFAULT_MESSAGE,
      since: parsed?.since ?? null,
      expires_at: new Date(expiresMs).toISOString(),
      expires_in_sec: Math.round((expiresMs - now) / 1000),
    };
  } catch {
    // Lỗi hệ thống tệp không lường trước. Nghiêng về "đang bảo trì" vì hậu quả
    // ngược lại tệ hơn: app nạp model trong lúc job đang embed. Nhưng lần đọc
    // sau sẽ thử lại từ đầu, nên một lỗi nhất thời không kẹt vĩnh viễn.
    return {
      active: true,
      message: DEFAULT_MESSAGE,
      since: null,
      expires_at: null,
      expires_in_sec: null,
    };
  }
}

export const isMaintenance = () => readMaintenance().active;
