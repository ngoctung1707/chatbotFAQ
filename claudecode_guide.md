# Task: Thêm chat history (session-based) dùng MongoDB vào chatbot-service

## Mục tiêu
Thêm khả năng chatbot nhớ được 3 cặp hội thoại (Q&A) gần nhất của mỗi session, dùng MongoDB làm nơi lưu trữ, tự động cắt bớt message cũ khi vượt quá giới hạn.

## Yêu cầu chi tiết

### 1. Tạo `chat_history.py`
- Kết nối MongoDB qua biến môi trường `DATABASE_URI` (đọc từ `.env` bằng python-dotenv, fallback "mongodb://localhost:27017")
- Database: `chatbot_db`, collection: `chat_sessions`
- Hàm `append_message(session_id: str, role: str, content: str) -> None`:
  - Dùng `update_one` với `$push` + `$each` + `$slice: -6` để chỉ giữ lại 6 message gần nhất (3 cặp Q&A)
  - `upsert=True`, set `updated_at` mỗi lần ghi, `setOnInsert` cho `created_at`
  - Mỗi message có field: `role` ("user" hoặc "assistant"), `content`, `timestamp` (UTC, timezone-aware, dùng `datetime.now(timezone.utc)`)
- Hàm `get_history(session_id: str) -> list[dict]`:
  - Trả về field `messages` của document, hoặc list rỗng nếu session chưa tồn tại
- Tạo TTL index trên `updated_at` với `expireAfterSeconds` đọc từ biến môi trường `SESSION_TTL_SECONDS` (mặc định 604800 = 7 ngày), gọi `create_index` ngay khi module được import (idempotent, an toàn khi gọi lại nhiều lần)
- `_id` của document PHẢI là `session_id` do client truyền vào, KHÔNG dùng ObjectId tự sinh

### 2. Tạo `chatbot-service/services/llm.py`
- Hàm `call_llm(history: list[dict], chunks: list[dict], question: str) -> str`
- Dùng Anthropic SDK (`anthropic` package — thêm vào requirements.txt nếu chưa có), đọc `ANTHROPIC_API_KEY` từ env
- Build `system` prompt gồm: vai trò trợ lý FAQ của Viện Công nghệ và Kinh tế số (HUST), chỉ trả lời dựa trên context, nếu không có thông tin thì nói rõ và đề nghị liên hệ Viện. Chèn `chunks` (list dict có field `content`) vào phần "Ngữ cảnh"
- Build `messages`: map trực tiếp từng phần tử `history` thành `{"role": ..., "content": ...}` (loại bỏ field `timestamp`), rồi append `{"role": "user", "content": question}` vào cuối
- Gọi `client.messages.create(model="claude-sonnet-4-6", max_tokens=1000, system=system_prompt, messages=messages)`, trả về `response.content[0].text`
- Bọc try/except, nếu lỗi thì log lỗi và trả về câu thông báo lỗi thân thiện cho user (không raise ra ngoài, tránh crash endpoint)

### 3. Tạo `chatbot-service/routers/chat.py`
- Định nghĩa router FastAPI (`APIRouter`)
- Pydantic model `ChatRequest`: `session_id: str`, `message: str` (validate không rỗng)
- Endpoint `POST /chat`:
  1. Lấy `history` từ `get_history(session_id)`
  2. Gọi hàm `retrieve_chunks(question)` (nếu module retrieval đã tồn tại trong codebase — kiểm tra trước; nếu chưa có thì để `chunks = []` và comment `# TODO: nối module retrieval khi sẵn sàng`)
  3. Gọi `call_llm(history, chunks, req.message)` lấy `answer`
  4. Lưu lần lượt `append_message(session_id, "user", req.message)` rồi `append_message(session_id, "assistant", answer)`
  5. Trả về JSON `{"answer": answer, "session_id": session_id}`

### 4. Đăng ký router
- Tìm file entrypoint chính của FastAPI app (thường là `main.py` hoặc `app.py`) và `include_router` cho router chat vừa tạo, giữ nguyên convention đặt tên/prefix đang có trong project

### 5. Cập nhật `requirements.txt`
- Thêm `anthropic`, `python-dotenv` (nếu chưa có), giữ nguyên format hiện tại — CHỈ thêm tên package hợp lệ trên PyPI, không thêm lệnh bash hoặc package không tồn tại

### 6. Kiểm tra cuối
- Chạy thử app bằng lệnh khởi động hiện có của project (kiểm tra README hoặc script khởi động nếu có)
- Gửi thử 2-3 request liên tiếp tới `/chat` với cùng `session_id` (dùng `curl` hoặc httpx trong 1 script test nhỏ), xác nhận:
  - Document trong `chat_sessions` collection có đúng tối đa 6 message sau nhiều lượt
  - `get_history` trả về đúng thứ tự thời gian (cũ → mới)
  - Session mới với `session_id` khác không bị lẫn lộn dữ liệu

## Ràng buộc quan trọng
- KHÔNG động vào production database — mọi thứ chạy trên MongoDB local Docker đã có
- Giữ nguyên style code hiện tại của project (đặt tên biến, cấu trúc thư mục `services/`, `routers/`)
- Nếu phát hiện project đã dùng `motor` (async driver) ở nơi khác thay vì `pymongo`, ưu tiên nhất quán theo cái đã có, không tự ý trộn 2 driver
- Không tự sửa các file crawler/parser đã có sẵn trừ khi cần thiết để tích hợp