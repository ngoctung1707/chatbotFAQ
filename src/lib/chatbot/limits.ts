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
 * Con số này là trần RAM chứ không phải giới hạn thẩm mỹ. Model dịch vi->en
 * (Xenova/opus-mt-vi-en) chạy beam search qua ONNX Runtime, và arena của ORT
 * chỉ nở chứ không co lại: một câu hỏi dài nâng mức RAM nền của tiến trình lên
 * vĩnh viễn cho tới khi process restart. Đo trên 10 câu hỏi thật (scripts/
 * measure-ram-10q.ts): ở ~1246 ký tự, RAM nền đi từ 1499MB lên 1774MB và đỉnh
 * chạm 1911MB. Hạ trần xuống đây để giới hạn phần nở đó.
 *
 * Đổi giá trị này thì đo lại bằng scripts/measure-ram-10q.ts trước khi deploy —
 * quan hệ giữa độ dài và RAM không tuyến tính (attention là O(n²)), nên không
 * suy ra được bằng nội suy.
 */
export const MAX_QUESTION_CHARS = 1000
