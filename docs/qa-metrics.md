# Chỉ số chất lượng truy hồi

Sinh bởi `npm run qa:metrics` — 2026-08-21 02:49.

Bộ mẫu: **616 câu** (`scripts/qa-samples.ts`), trong đó **255** có nhãn vàng
và **30** là câu ngoài phạm vi. 331 câu còn lại không chấm ở đây —
chủ đề của chúng nằm trong phạm vi nên truy hồi trả về đoạn là đúng; việc từ chối
là của LLM và được đo bằng `npm run qa:400`.

Cấu hình: `topK=7` `minScore=0.45`

Câu nối tiếp được truy hồi bằng đúng chuỗi mà lượt chạy thật đã tạo ra
(`qa-results.json`, 347 chuỗi) chứ không dựng lại từ lịch sử
rút gọn — hai cách cho kết quả rất khác nhau ở nhóm đại từ.

## Bốn chỉ số

| Chỉ số | Giá trị | Nghĩa |
|---|---:|---|
| **Hit@7** | **93.3%** | đáp án có nằm trong 7 đoạn gửi cho LLM — **chỉ số chính** |
| Dư địa tăng K | 7 câu | đáp án ở hạng 8–20: phần cứu được chỉ bằng nới K |
| MRR | 0.791 | chẩn đoán độ nhạy, **không phải** điểm chất lượng |
| Chặn ngoài phạm vi | 12/30 (40.0%) | đọc CÙNG dòng dưới |
| Giữ câu trong phạm vi | 100.0% | nới ngưỡng làm số này tụt |

Hai dòng cuối phải đọc cùng nhau: một cấu hình chặn *tất cả* sẽ đạt 100% ở
dòng trên trong khi giết sạch câu trả lời được ở dòng dưới.

Không dùng P@K. Nhãn vàng ở đây là mẫu từ khoá nhận diện đoạn *chứa đáp án*;
một đoạn không khớp mẫu vẫn có thể là ngữ cảnh cần thiết. Gọi tỉ lệ đó là
"độ chính xác" là gán cho nhãn một ý nghĩa nó không mang.

## Đường cong Hit@k

| k | Hit@k | |
|---:|---:|---|
| 1 | 72.2% | ██████████████████████ |
| 3 | 82.7% | █████████████████████████ |
| 5 | 88.6% | ███████████████████████████ |
| 7 **(đang dùng)** | 93.3% | ████████████████████████████ |
| 10 | 95.7% | █████████████████████████████ |
| 20 | 96.1% | █████████████████████████████ |

Chỗ đường cong bão hoà là chỗ tăng K hết tác dụng.

## Theo nhóm câu hỏi

| Nhóm | n | Hit@7 | MRR |
|---|---:|---:|---:|
| 01. Người mới vào trang | 14 | 100.0% | 0.589 |
| 02. Liệt kê | 20 | 75.0% | 0.604 |
| 03. Chi tiết | 38 | 94.7% | 0.894 |
| 04. Thống kê | 12 | 91.7% | 0.830 |
| 05. Về người | 17 | 94.1% | 0.832 |
| 06. Không dấu | 19 | 100.0% | 0.899 |
| 07. Tiếng Anh | 30 | 93.3% | 0.813 |
| 08. Doanh nghiệp hợp tác | 10 | 100.0% | 0.758 |
| 09. Đặt dự án | 2 | 100.0% | 0.267 |
| 10. Người có kinh nghiệm | 12 | 91.7% | 0.917 |
| 11. Nối tiếp — đại từ người | 5 | 100.0% | 1.000 |
| 11. Nối tiếp — đại từ vật | 5 | 100.0% | 1.000 |
| 11. Nối tiếp — chỉ định | 10 | 90.0% | 0.780 |
| 11. Nối tiếp — lược ngữ hoàn toàn | 6 | 100.0% | 0.889 |
| 11. Nối tiếp — ba lượt | 4 | 100.0% | 0.786 |
| 14. Bẫy ngày tháng | 3 | 100.0% | 0.206 |
| 18. Về người — corpus có | 15 | 86.7% | 0.651 |
| 20. Nối tiếp — quay lại chủ đề cũ sau khi lạc | 4 | 100.0% | 1.000 |
| 20. Nối tiếp — hỏi lại chính câu vừa trả lời | 5 | 100.0% | 0.679 |
| 21. Corpus có — không được từ chối | 11 | 81.8% | 0.752 |
| 00. Hồi quy (bộ gốc, từ ngữ bất biến) | 13 | 100.0% | 0.806 |

## 17 câu trượt Hit@7

| id | câu hỏi | chunk | điểm cao nhất |
|---:|---|---:|---:|
| 31 | Liệt kê tất cả các khóa học của Viện | 2 | 0.7 |
| 33 | Kể tên các phòng lab của Viện | 1 | 0.5282 |
| 34 | Viện có mấy phòng lab, tên là gì? | 1 | 0.521 |
| 43 | Các nhà nghiên cứu của Viện gồm những ai? | 7 | 0.7171 |
| 46 | Liệt kê các số báo cáo Vietnam Digital Economy Review | 7 | 0.732 |
| 93 | Báo cáo Vietnam Digital Economy Review 2025 nói về gì? | 7 | 0.7659 |
| 95 | Viện có phòng lab đặt ở đâu? | 7 | 1 |
| 112 | Báo cáo Vietnam Digital Economy Review có mấy số? | 7 | 1 |
| 141 | Các nhà nghiên cứu của Viện đến từ đâu? | 7 | 0.7254 |
| 222 | What is the Vietnam Digital Economy Review? | 7 | 0.7571 |
| 228 | Does the institute collaborate with businesses? | 7 | 0.731 |
| 302 | Vietnam Digital Economy Review 2024 và 2025 khác nhau chỗ nào? | 7 | 0.8094 |
| 338 | số mới nhất nói về gì? | 7 | 0.9512 |
| 519 | Ai phụ trách Business Development? | 7 | 0.9023 |
| 525 | Nhà nghiên cứu nào của Viện đến từ FAMI? | 1 | 0.4513 |
| 588 | Học viên có được thực tập tại doanh nghiệp không? | 7 | 1 |
| 600 | Viện có hỗ trợ đăng ký học bổng và trao đổi học thuật không? | 7 | 0.8727 |

Chi tiết 7 đoạn của từng ca nằm ở `docs/qa-failures.md`.

<!-- summary:{"topK":7,"minScore":0.45,"n":255,"hit":{"1":0.7215686274509804,"3":0.8274509803921568,"5":0.8862745098039215,"7":0.9333333333333333,"10":0.9568627450980393,"20":0.9607843137254902},"mrr":0.7912363834422655,"headroom":7,"inScopeKept":1,"negatives":30,"negativesEmpty":12,"when":"2026-08-21T02:49:32.885Z"} -->