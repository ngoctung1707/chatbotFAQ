/**
 * Giới hạn dùng chung giữa client và server cho ô nhập câu hỏi.
 *
 * Tách khỏi config.ts vì config.ts `import path from "path"` và đọc biến môi
 * trường của MongoDB — một client component import vào sẽ vỡ build. File này
 * cố ý không phụ thuộc gì vào Node để cả route handler lẫn widget cùng dùng
 * được một con số, thay vì mỗi nơi hard-code một bản rồi lệch nhau.
 */

/**
 * Số ký tự tối đa của một câu hỏi.
 *
 * Giờ đây con số này là trần cho INPUT PROMPT — nó chặn cùng lúc hai chỗ: lượt
 * user đi vào bước rewrite (queryRewriter.ts) và lượt user đi vào call trả lời
 * (llm.ts), cả hai đều tính token theo độ dài ký tự để book TPM trước khi gọi.
 * Đồng thời nó là chốt chặn validation dùng chung giữa widget và route handler,
 * nên một câu hỏi dài bất thường bị cắt ở biên chứ không đi sâu vào pipeline.
 *
 * GHI CHÚ LỊCH SỬ — thuộc về kiến trúc TRƯỚC khi bỏ model dịch, không còn là lý
 * do hiện tại: con số 1000 ban đầu được chọn làm trần RAM. Model dịch vi->en
 * (Xenova/opus-mt-vi-en) chạy beam search qua ONNX Runtime, và arena của ORT chỉ
 * nở chứ không co lại, nên một câu hỏi dài nâng mức RAM nền của tiến trình lên
 * vĩnh viễn cho tới khi restart. Đo trên 10 câu hỏi thật (scripts/
 * measure-ram-10q.ts): ở ~1246 ký tự, RAM nền đi từ 1499MB lên 1774MB và đỉnh
 * chạm 1911MB. Model đó đã bị gỡ, nên ràng buộc RAM ấy không còn.
 *
 * Giá trị giữ nguyên 1000 dù lý do đã đổi: BGE-M3 vẫn là encoder có attention
 * O(n²) và vẫn nhúng câu hỏi ở mỗi lượt, nên trần vẫn có tác dụng — chỉ là nó
 * không còn là ràng buộc CHẶT nhất nữa.
 */
export const MAX_QUESTION_CHARS = 1000
