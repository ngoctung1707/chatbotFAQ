# Hồ sơ các câu trả lời sai

Sinh tự động bởi `npm run qa:failures` — 2026-08-21.

**39 ca sai / 600 ca đã chạy.**

Không tính 70 câu nối tiếp — chúng nằm ở `docs/qa-followups.json`,
kèm toàn bộ lịch sử hội thoại (thiếu lịch sử thì không tra được câu nào cả).

## Phân loại nguyên nhân

| Nguyên nhân | Số ca | Sửa ở đâu |
|---|---:|---|
| TRUY-HỒI-TRƯỢT | 1 | tầng truy hồi / corpus |
| PROMPT-TỪ-CHỐI | 9 | SYSTEM_PROMPT |
| ẢO-GIÁC | 21 | SYSTEM_PROMPT (ràng buộc chủ thể) |
| TỪ-CHỐI-MỀM | 1 | `isRefusal()` |
| KHÁC-KIỂU-TỪ-CHỐI | 0 | nhãn trong bộ mẫu |
| NHÃN-NGỜ | 7 | nhãn trong bộ mẫu |

Đọc bảng này trước khi đọc từng ca: hai hàng cuối là lỗi của BỘ ĐO, không
phải của sản phẩm, và sửa chúng trước sẽ làm mọi lần đo sau bớt nhiễu.

---
## #38 — NHÃN-NGỜ

**Nhóm:** 02. Liệt kê

**Hỏi:** Các sự kiện thường niên của Viện là gì?
**Tìm bằng:** `Các sự kiện thường niên của Viện là gì?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, bạn ơi, các thông tin trong tài liệu không đề cập đến các sự kiện thường niên của Viện.

**2 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `/get-involved/club` | 🔥 Regular seminars on academic topics, as well as workshops on studying and research. 🏆 Support and guidance for members participating in technology… |
| 2 | 0.300 |  | `/news/tong-ket-hoi-thao-nang-cao-nang-suat-lao` | Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội ra mắt Chuyên san Khoa học Thường thức Kinh tế số (Vietnam D-Economy Review). Chuyên san là nhữ… |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #42 — NHÃN-NGỜ

**Nhóm:** 02. Liệt kê

**Hỏi:** Hội đồng Viện có những thành viên nào?
**Tìm bằng:** `Who are the members of the BKFintech Institute Council?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `gemini-3.5-flash-lite`
**Nhãn vàng:** `{"url":["about/institute-council"]}` — có trong top-7: **KHÔNG**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**2 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `/about/board-of-deans` | Assoc. Prof. Nguyen Binh Minh Dean \| Assoc. Prof. Nguyen Thi Xuan Hoa Vice-Dean \| Dr. Do Ba Lam Vice-Dean… |
| 2 | 0.300 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Với 28 năm kinh nghiệm trong lĩnh vực giảng dạy và tư vấn cải tiến năng suất, bà là chuyên gia hàng đầu tại nhiều lĩnh vực trong các tổ chức như: chuy… |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #45 — NHÃN-NGỜ

**Nhóm:** 02. Liệt kê

**Hỏi:** Viện có những ấn phẩm nào?
**Tìm bằng:** `What publications does BKFintech Institute have?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, thông tin được cung cấp không đề cập đến việc Viện có những ấn phẩm nào.

**0 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| — | — | — | *(không đoạn nào vượt ngưỡng)* | |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #53 — PROMPT-TỪ-CHỐI

**Nhóm:** 02. Liệt kê

**Hỏi:** Kể tên các trường đại học hợp tác với Viện
**Tìm bằng:** `List of universities collaborating with BKFintech Institute`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"text":["partners|đối tác","Rikkeisoft"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Dạ, Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.987 | **✓** | `/news/hack-cx-in-banking-together-2026-khep-la` | Chương trình có sự tham gia của Ngân hàng TMCP Sài Gòn – Hà Nội (SHB) trong vai trò Đối tác Chiến lược, Công ty Cổ phần LEAD Consulting trong vai trò … |
| 2 | 0.710 | **✓** | `/news/le-ky-ket-tai-tro-nghien-cuu-khoa-hoc` | Sáng ngày 10/05/2024, Lễ ký kết tài trợ các dự án nghiên cứu khoa học giữa Trung tâm Công nghệ và Kinh tế số - Đại học Bách khoa Hà Nội (BK Fintech) v… |
| 3 | 0.694 | **✓** | `/news/le-ky-ket-tai-tro-nghien-cuu-khoa-hoc` | Một mặt, tập thể lãnh đạo Rikkeisoft vốn là các cựu sinh viên của Đại học Bách Khoa Hà Nội, nên mong muốn đóng góp, hỗ trợ Nhà trường. Mặc khác, với v… |
| 4 | 0.637 | **✓** | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Viện Công nghệ và Kinh tế số (BK Fintech) - Đại học Bách khoa Hà Nội trân trọng thông báo nhận đề xuất dự án nghiên cứu khoa học thực hiện trong năm 2… |
| 5 | 0.504 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | COMMITTEE: Assoc. Prof. David Tran (University of Massachusetts Boston) Prof. Nguyen Thanh Thuy (Vietnam National University) Prof. Ho Tu Bao (Vietnam… |
| 6 | 0.465 | **✓** | `/news/bk-fintech-hackday-season-6` | The success of the program was made possible through the valuable support of our partners: Organizers: Institute for Digital Technology and Economy – … |
| 7 | 0.417 | **✓** | `/get-involved/vietnam-digital-economy-review/2` | năm phát triển, Đại học Bách khoa Hà Nội không ngừng đổi mới, xây dựng môi trường giáo dục hiện đại và phát triển theo định hướng "Đại học số chia sẻ"… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #66 — PROMPT-TỪ-CHỐI

**Nhóm:** 03. Chi tiết

**Hỏi:** Khóa Fintech dành cho đối tượng nào?
**Tìm bằng:** `Who is the target audience for the Fintech course?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["courses/fintech-course"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [1]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.780 |  | `/get-involved/vietnam-digital-economy-review/2` | ĐÁNH GIÁ MỨC ĐỘ PHÁT TRIỂN CÔNG NGHỆ TÀI CHÍNH TẠI VIỆT NAM: ỨNG DỤNG TRIỂN KHAI XÂY DỰNG BỘ CHỈ SỐ FINTECH INDEX CẤP TỈNH Hà Thị Thư Trang1,2, Thái M… |
| 2 | 0.767 |  | `/get-involved/vietnam-digital-economy-review/2` | giới về từ khóa “fintech” cũng cho thấy mối quan tâm ngày càng cao đối với lĩnh vực này, với mức tăng đáng kể từ đầu năm 2014 và đạt ngưỡng đỉnh vào n… |
| 3 | 0.742 | **✓** | `/courses/fintech-course-en` | Hands-on Workshop: The Hands-on Workshop is a key component of the Fintech Course, designed to give learners the opportunity to explore new trends in … |
| 4 | 0.653 |  | `/get-involved/vietnam-digital-economy-review/2` | Trong đó, dịch vụ thanh toán điện tử vẫn là phân khúc lớn nhất, chiếm 31% số lượng các công ty khởi nghiệp Fintech. Tính đến tháng 10/2020, Việt Nam c… |
| 5 | 0.616 |  | `/news/cuoc-thi-fintech-innovation-competition-` | Mô tả: Cuộc thi là cơ hội cho cá nhân và đội thi thuyết trình ý tưởng sáng tạo của mình trong lĩnh vực Công nghệ tài chính (Fintech) trước các chuyên … |
| 6 | 0.455 |  | `/news/workshop-ai-blockchain-and-fintech-a-beg` | Thời gian: 8h00 - 16h45 ngày 08/06 & 09/06/2024 (Thứ 7 & Chủ nhật) Địa điểm: Tòa nhà HUST-MB Digital Hub, Đại học Bách khoa Hà Nội. Đối tượng tham dự:… |
| 7 | 0.359 |  | `/courses/ai-for-everyone-eng` | With two public lectures held in 2023 and 2024, the program has attracted over 600 participants. More than 400 of them have been awarded digital certi… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #95 — PROMPT-TỪ-CHỐI

**Nhóm:** 03. Chi tiết

**Hỏi:** Viện có phòng lab đặt ở đâu?
**Tìm bằng:** `Where are the BKFintech Institute labs located?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["r&d-labs/"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [3]

**3 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.937 |  | `/research/r&d-labs` | BK Fintech has 3 R&D Labs: Smart Finance and Digital Banking Lab(https://fintech.hust.edu.vn/research/r&d-labs/smart-finance-and-digital-banking), Sof… |
| 2 | 0.761 | **✓** | `/research/r&d-labs/smart-finance-and-digital-b` | The Smart Finance and Digital Banking Laboratory is established with the mission to conduct research, development, and application of advanced digital… |
| 3 | 0.000 | **✓** | `/research/r&d-labs/oe-fin-lab-operational-effi` | The Operational Efficiency in Finance Laboratory (OEFin Lab) is a research facility established under the Institute for Digital Technology and Economy… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #129 — PROMPT-TỪ-CHỐI

**Nhóm:** 05. Về người

**Hỏi:** Ai là Phó Viện trưởng phụ trách đào tạo?
**Tìm bằng:** `Who is the Deputy Director of BKFintech Institute in charge of training?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"text":["Xuan Hoa|Xuân Hoa","Do Ba Lam|Đỗ Bá Lâm"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [1]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.853 | **✓** | `/about/board-of-deans` | Assoc. Prof. Nguyen Binh Minh Dean \| Assoc. Prof. Nguyen Thi Xuan Hoa Vice-Dean \| Dr. Do Ba Lam Vice-Dean… |
| 2 | 0.780 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Vũ Minh Khương hiện đang công tác tại Trường Chính sách Công Lý Quang Diệu, Đại học Quốc gia Singapore. Nghiên cứu của ông tập trung vào các lĩnh vực … |
| 3 | 0.390 |  | `https://ecotech.bkfin.tech/ecotech2025/speaker` | Vice President at FPT University ABOUT Mr. Hoang Nam Tien is the Vice President of FPT University and a prominent figure in Vietnam's technology educa… |
| 4 | 0.367 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Cường là tiến sĩ lĩnh vực Kinh tế học, với trình độ lý luận chính trị cao cấp, và từng là Phó Trưởng ban Ban Quản lý Khu Công nghệ cao Hoà Lạc (Bộ Kho… |
| 5 | 0.336 | **✓** | `/about/institute-council` | Dr. Nguyen Van Cuong \| (Vice Chairman in Charge, Management Council of Vietnam Social Security) \| - Chairman \| Prof. David Tran \| (University of Massa… |
| 6 | 0.328 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Train-the-Trainer (ToT): Chuyên môn Phương pháp Hướng dẫn Vận hành Kết nối Hướng dẫn & mentoring Đồng hành cùng sinh viên trong hoạt động học tập, thự… |
| 7 | 0.316 |  | `/research/r&d-funding-projects/cyber-clinic?us` | CYBER CAMP KHÓA 01 & 02: KHỞI ĐỘNG HÀNH TRÌNH - BỨT PHÁ KỸ NĂNG: Cyber Camp Khóa 01 & 02 BK Fintech Cyber Clinic diễn ra tại Thảo Viên Resort với các … |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #139 — NHÃN-NGỜ

**Nhóm:** 05. Về người

**Hỏi:** Ai là Chánh văn phòng của Viện?
**Tìm bằng:** `Who is the Chief of Staff of BKFintech Institute?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `gemini-3.5-flash-lite`
**Nhãn vàng:** `{"url":["about/back-office"]}` — có trong top-7: **KHÔNG**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**4 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `/about/board-of-deans` | Assoc. Prof. Nguyen Binh Minh Dean \| Assoc. Prof. Nguyen Thi Xuan Hoa Vice-Dean \| Dr. Do Ba Lam Vice-Dean… |
| 2 | 0.479 |  | `/about/institute-council` | Dr. Nguyen Van Cuong \| (Vice Chairman in Charge, Management Council of Vietnam Social Security) \| - Chairman \| Prof. David Tran \| (University of Massa… |
| 3 | 0.363 |  | `/get-involved/vietnam-digital-economy-review/2` | NHÀ XUẤT BẢN BÁCH KHOA HÀ NỘI Số 1 − Đại Cồ Việt − Phường Bạch Mai − Hà Nội VPGD: Ngõ 17 – Tạ Quang Bửu – Phường Bạch Mai – Hà Nội ĐT: 024. 38684569; … |
| 4 | 0.300 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #140 — PROMPT-TỪ-CHỐI

**Nhóm:** 05. Về người

**Hỏi:** Bộ phận đào tạo do ai phụ trách?
**Tìm bằng:** `Who is in charge of the training department at BKFintech Institute?`
**Mong đợi:** `answer` — **Nhận được:** `no_answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["about/back-office"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Tôi chưa rõ câu hỏi của bạn, bạn có thể đặt ra câu hỏi chi tiết hơn được không ạ?

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.887 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Train-the-Trainer (ToT): Chuyên môn Phương pháp Hướng dẫn Vận hành Kết nối Hướng dẫn & mentoring Đồng hành cùng sinh viên trong hoạt động học tập, thự… |
| 2 | 0.700 |  | `/news/cyber-clinic-train-the-trainer-enhancing` | Delivering the opening remarks, Assoc. Prof. Huynh Quyet Thang, Vice President of Hanoi University of Science and Technology, emphasised the role of h… |
| 3 | 0.700 |  | `/get-involved/vietnam-digital-economy-review/2` | tạo tri thức, phát triển công nghệ, chuyển giao và hình thành doanh nghiệp đổi mới sáng tạo. Các nghiên cứu của OECD và World Bank khẳng định rằng, nă… |
| 4 | 0.587 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Câu hỏi thường gặp: Sinh viên sẽ học tập và thực hành theo hình thức nào? Chương trình kết hợp giữa đào tạo trực tuyến, học tập trực tiếp, mentoring v… |
| 5 | 0.580 | **✓** | `/about/back-office` | Vu Thi Thu Ha \| (Chief Accountant) \| Tran Minh Phuong \| (Accountant) \| Nguyen Thuy Hang \| (Office Manager) \| Nguyen Phuong Anh \| (Training Manager) \| … |
| 6 | 0.488 |  | `/courses/business-intelligence-en` | Course Structure: The Business Intelligence training program is designed with three modules: Module 1: Data-driven mindset and BI applications in ente… |
| 7 | 0.472 |  | `/research/r&d-funding-projects/cyber-clinic?us` | CYBER CAMP KHÓA 01 & 02: KHỞI ĐỘNG HÀNH TRÌNH - BỨT PHÁ KỸ NĂNG: Cyber Camp Khóa 01 & 02 BK Fintech Cyber Clinic diễn ra tại Thảo Viên Resort với các … |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #146 — PROMPT-TỪ-CHỐI

**Nhóm:** 05. Về người

**Hỏi:** Ai đại diện Viện phát biểu tại hội thảo ECOTECH?
**Tìm bằng:** `Who represented BKFintech Institute as a speaker at the ECOTECH workshop?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"text":["ECOTECH"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [1]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.852 | **✓** | `/news/hoi-thao-ecotech-2025` | TS. Trương Việt Anh – Trưởng Ban Khoa học Công nghệ, Đại học Bách khoa Hà Nội - Bà Nguyễn Thị Thu Ngọc - Giám đốc Cao cấp Sản phẩm Dữ liệu, Ngân hàng … |
| 2 | 0.683 | **✓** | `/news/hoi-thao-ecotech-2025` | ⏰ Thời gian: 8h00 - 18h00, Thứ Bảy ngày 21 tháng 06 năm 2025 📍Địa điểm: Tầng 6, tòa nhà Thư viện Tạ Quang Bửu, Đại học Bách khoa Hà Nội Ngày 21/6/202… |
| 3 | 0.622 | **✓** | `https://ecotech.bkfin.tech/ecotech2025/index.h` | KEYNOTE SPEAKERS: PROF. DR. VU MINH KHUONG National University of Singapore MR. HOANG NAM TIEN Vice President at FPT University MS. OLENA KHLON Genera… |
| 4 | 0.590 | **✓** | `/news/ecotech-2026-vie` | Khép lại chương trình là phiên tọa đàm với sự tham gia của các chuyên gia đến từ Hiệp hội Dữ liệu Quốc gia, Viện Nghiên cứu cao cấp về Toán, Viện Kinh… |
| 5 | 0.571 | **✓** | `/news/ecotech-2026-vie` | Ngày 03/6/2026, tại Thư viện Tạ Quang Bửu, Đại học Bách khoa Hà Nội, Viện Công nghệ và Kinh tế số phối hợp cùng Viện Nghiên cứu cao cấp về Toán (VIASM… |
| 6 | 0.562 | **✓** | `/news/hoi-thao-ecotech-2025` | Vũ Minh Khương, Đại học Quốc gia Singapore“Reflections on Vietnam’s Science and Technology” – GS. Hồ Tú Bảo, Viện Nghiên cứu cao cấp về Toán“SHBFinanc… |
| 7 | 0.497 | **✓** | `/news/ecotech-2025-en` | ⏰Time: 8:00 AM – 6:00 PM, Saturday, June 21, 2025 📍Venue: 6th Floor, Ta Quang Buu Library Building, Hanoi University of Science and Technology On Jun… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #193 — NHÃN-NGỜ

**Nhóm:** 06. Không dấu

**Hỏi:** hoc phi bao nhieu
**Tìm bằng:** `What are the tuition fees at BKFintech Institute?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [3]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.806 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Thành viên đề tài bao gồm cán bộ, giảng viên, nghiên cứu sinh, học viên, sinh viên có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, nghiên cứu bên ng… |
| 2 | 0.759 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Điều kiện tham gia: Có kiến thức nền tảng về công nghệ thông tin Sẵn sàng tham gia các khóa đào tạo của dự án Đạt yêu cầu đánh giá đầu vào hoặc phỏng … |
| 3 | 0.704 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 4 | 0.635 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Thời gian thực hiện đề tài: 12 thángThời hạn nộp đề xuất: đến hết ngày 7/12/2025Thông báo kết quả xét chọn: 22/12/2025Thực hiện đề tài: 01/01/2026 – 3… |
| 5 | 0.526 |  | `https://ecotech.bkfin.tech/ecotech2025/speaker` | Vietnam Institute for Advanced Study in Mathematics ABOUT Prof. Ho Tu Bao is the Director of the Data Science Lab at the Vietnam Institute for Advance… |
| 6 | 0.387 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Câu hỏi thường gặp: Sinh viên sẽ học tập và thực hành theo hình thức nào? Chương trình kết hợp giữa đào tạo trực tuyến, học tập trực tiếp, mentoring v… |
| 7 | 0.360 |  | `/courses/level-up-it-vie` | Mục tiêu chương trình: Chương trình hướng tới các mục tiêu sau: Giúp học sinh hiểu tổng quan về ngành Công nghệ Thông tin và các lĩnh vực tiêu biểu tr… |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #276 — ẢO-GIÁC

**Nhóm:** 09. Đặt dự án — corpus không có

**Hỏi:** Tôi muốn đặt một dự án 500 triệu, quy trình thế nào?
**Tìm bằng:** `Process for applying for a 500 million research project at BKFintech Institute`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, để thực hiện đề tài mức 500 triệu đồng, bạn cần đáp ứng các yêu cầu về cam kết đầu ra tùy theo thông báo nộp đề xuất nghiên cứu, cụ thể: - Theo thông báo ngày 06/11/2025, kinh phí tối đa 500 triệu đồng (bao gồm 10% chi phí quản lý) yêu cầu có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn hợp lệ, và có ít nhất 01 bài báo được chấp nhận đăng trên hội thảo quốc tế lập chỉ mục bởi Scopus hoặc tạp chí thuộc danh mục Scopus từ Q3 trở lên. [1] - Theo thông báo năm 2024, kinh phí từ 400 đến 500 triệu đồng yêu cầu cam kết đầu ra bao gồm mức 300 đến 400 triệu đồng 

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Thành viên đề tài bao gồm cán bộ, giảng viên, nghiên cứu sinh, học viên, sinh viên có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, nghiên cứu bên ng… |
| 2 | 0.821 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 3 | 0.575 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Thời gian thực hiện đề tài: 12 thángThời hạn nộp đề xuất: đến hết ngày 7/12/2025Thông báo kết quả xét chọn: 22/12/2025Thực hiện đề tài: 01/01/2026 – 3… |
| 4 | 0.420 |  | `/news/assoc-prof-nguyen-binh-minh-shares-insig` | Assoc. Prof. Nguyen Binh Minh also shared his assessment of the implementation and operational capacity of entities participating in the pilot program… |
| 5 | 0.366 |  | `/get-involved/vietnam-digital-economy-review/2` | như một kết quả gián tiếp, hoặc hoàn toàn không đưa KPI vào mô hình phân bổ nguồn lực. Mối quan hệ định lượng giữa quyết định giao việc và mức độ hoàn… |
| 6 | 0.341 |  | `/news/final-round-hack-cx-together-2025` | With a customer-centric approach, the challenge topics were designed based on real business needs from a leading bank, covering areas such as: AI-gene… |
| 7 | 0.304 |  | `/get-involved/vietnam-digital-economy-review/2` | nghiệm làm việc trong ngành. Họ biết vấn đề nhức nhối là gì, ai sẽ trả tiền để giải quyết, cũng như cơ hội thuyết phục người dùng và khách hàng. Nhà s… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #279 — ẢO-GIÁC

**Nhóm:** 09. Đặt dự án — corpus không có

**Hỏi:** Tôi cần chuẩn bị hồ sơ gì để đề xuất dự án?
**Tìm bằng:** `Required documents for proposing a research project at BKFintech Institute`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, để chuẩn bị bản đề xuất dự án tham gia cuộc thi BKFintech Hackday, bạn cần gửi hồ sơ định dạng .pdf bao gồm các nội dung chính: - Thông tin đội thi - Mô tả sản phẩm [3]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.799 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 2 | 0.771 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Trung tâm Công nghệ và Kinh tế số (BK Fintech) thông báo về việc nộp đề xuất đề tài nghiên cứu khoa học trong khuôn khổ hợp tác giữa Trung tâm và công… |
| 3 | 0.703 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Thành viên đề tài bao gồm cán bộ, giảng viên, nghiên cứu sinh, học viên, sinh viên có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, nghiên cứu bên ng… |
| 4 | 0.682 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Thời gian thực hiện đề tài: 12 thángThời hạn nộp đề xuất: đến hết ngày 7/12/2025Thông báo kết quả xét chọn: 22/12/2025Thực hiện đề tài: 01/01/2026 – 3… |
| 5 | 0.607 |  | `/news/cuoc-thi-bkfintech-hackday-lan-thu-i-nam` | Thời hạn đăng ký: hết ngày 09/5/2024 2. Thủ tục đăng ký: - Đăng ký tham gia cá nhân hoặc theo đội. - Gửi hồ sơ đăng ký tại Link IV. CÁC VÒNG THI VÀ HO… |
| 6 | 0.473 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Chủ nhiệm đề tài: • Cán bộ/giảng viên thuộc Đại học Bách khoa Hà Nội Thành viên nghiên cứu: • Có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, viện n… |
| 7 | 0.322 |  | `/get-involved/vietnam-digital-economy-review/2` | Âu). Chưa thấy giải pháp công khai rộng rãi tại Việt Nam. Kinh nghiệm thực tiễn: Cấp chứng nhận số đầu tiên vào tháng 11/2022. Đã triển khai tại BKHN,… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #280 — ẢO-GIÁC

**Nhóm:** 09. Đặt dự án — corpus không có

**Hỏi:** Viện có mẫu đề xuất dự án không?
**Tìm bằng:** `Does BKFintech Institute have a research project proposal template?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, viện có biểu mẫu nộp đề xuất.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.929 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 2 | 0.772 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Viện Công nghệ và Kinh tế số (BK Fintech) - Đại học Bách khoa Hà Nội trân trọng thông báo nhận đề xuất dự án nghiên cứu khoa học thực hiện trong năm 2… |
| 3 | 0.710 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Trung tâm Công nghệ và Kinh tế số (BK Fintech) thông báo về việc nộp đề xuất đề tài nghiên cứu khoa học trong khuôn khổ hợp tác giữa Trung tâm và công… |
| 4 | 0.562 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Thành viên đề tài bao gồm cán bộ, giảng viên, nghiên cứu sinh, học viên, sinh viên có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, nghiên cứu bên ng… |
| 5 | 0.523 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Thời gian thực hiện đề tài: 12 thángThời hạn nộp đề xuất: đến hết ngày 7/12/2025Thông báo kết quả xét chọn: 22/12/2025Thực hiện đề tài: 01/01/2026 – 3… |
| 6 | 0.404 |  | `/get-involved/vietnam-digital-economy-review/2` | như một kết quả gián tiếp, hoặc hoàn toàn không đưa KPI vào mô hình phân bổ nguồn lực. Mối quan hệ định lượng giữa quyết định giao việc và mức độ hoàn… |
| 7 | 0.364 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #301 — PROMPT-TỪ-CHỐI

**Nhóm:** 10. Người có kinh nghiệm

**Hỏi:** V-Chain khác gì với việc dùng trực tiếp Ethereum?
**Tìm bằng:** `Difference between V-Chain and using Ethereum directly`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["solutions/V-Chain"],"text":["V-Chain"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [1] [2] [3]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 | **✓** | `/solutions/V-Chain` | V-Chain is a platform that supports programmers in developing and deploying decentralized applications on a variety of existing blockchain networks. C… |
| 2 | 0.868 | **✓** | `/solutions/V-Chain` | A platform that supports programmers in developing and deploying decentralized applications on a variety of existing blockchain networks. Exploding in… |
| 3 | 0.836 | **✓** | `/solutions/V-Chain` | Some notable core services include: Smart contract: V-Chain uses a common, consistent format for users to generate smart contracts for different block… |
| 4 | 0.284 |  | `/get-involved/vietnam-digital-economy-review/2` | các lĩnh vực như: tài chính phi tập trung (Decentralized Finance), trò chơi trực tuyến (GameFi), hệ thống quản trị phi tập trung (DAO), v.v.. Sự phá… |
| 5 | 0.235 |  | `/get-involved/vietnam-digital-economy-review/2` | ra một môi trường an toàn hơn, bảo mật và hiệu quả hơn cho các giao dịch thương mại quốc tế. Mô hình này trước đây đã được xây dựng và triển khai trên… |
| 6 | 0.226 | **✓** | `/` | OUR PROJECTS - Innovative Solutions includes four projects: V-Chain(A platform that supports programmers in developing and deploying decentralized app… |
| 7 | 0.196 |  | `/get-involved/vietnam-digital-economy-review/2` | định nêu ra trong thư tín dụng (L/C). Cho đến hiện nay, L/C vẫn là một phương thức thanh toán phổ biến trong hoạt động ngoại thương, đặc biệt là tại c… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #302 — NHÃN-NGỜ

**Nhóm:** 10. Người có kinh nghiệm

**Hỏi:** Vietnam Digital Economy Review 2024 và 2025 khác nhau chỗ nào?
**Tìm bằng:** `differences between Vietnam Digital Economy Review 2024 and Vietnam Digital Economy Review 2025`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"text":["Chuyên san Khoa học Thường thức","D-Economy Review"]}` — có trong top-7: **KHÔNG**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.921 |  | `/get-involved/vietnam-digital-economy-review/2` | Google, Temasek, & Bain & Company. (2025). From Digital Decade to AI Reality: Accelerating the Future in ASEAN. e-Conomy SEA. [2] DataReportal. (2024)… |
| 2 | 0.784 |  | `/get-involved/vietnam-digital-economy-review/2` | của nền kinh tế số Việt Nam. Trân trọng cảm ơn! LỜI KẾT DANH MỤC HÌNH Hình 1.1. Tổng giá trị giao dịch (GMV) và doanh thu kinh tế số tại Đông Nam Á gi… |
| 3 | 0.773 |  | `/news/hoi-thao-va-le-ra-mat-bao-cao-thuong-nie` | Hoang Van Cuong also shared: “This publication not only reports the Institute’s activities in digital economy-related fields but also provides a compr… |
| 4 | 0.712 |  | `/get-involved/vietnam-digital-economy-review/2` | đang ở giai đoạn tái cấu trúc, chờ đợi sự hoàn thiện của khung pháp lý (sandbox ngân hàng, thị trường tài sản mã hóa) để bứt phá trong những năm tới. … |
| 5 | 0.567 |  | `/news/hoi-thao-va-le-ra-mat-bao-cao-thuong-nie` | SCIENTIFIC CONFERENCE AND LAUNCH OF THE VIETNAM DIGITAL ECONOMY REVIEW 2025: NEW DEVELOPMENT FRAMEWORKS FOR ADVANCING THE DIGITAL ECONOMY On January 1… |
| 6 | 0.365 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | ABOUT ECOTECH 2025: Event Name: Conference on Digital Economy and Technology (ECOTECH) 2025 Theme: Digital Economy and Technology for Vietnamese Initi… |
| 7 | 0.323 |  | `/research/publications` | "Bibliometric Method for Reviewing Smart Flexible Manufacturing Systems in Disruption Contexts" 2025 \| "DASF-Net: A Multimodal Framework for Stock Pri… |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #310 — PROMPT-TỪ-CHỐI

**Nhóm:** 10. Người có kinh nghiệm

**Hỏi:** Chương trình Cyber Clinic chia thành mấy giai đoạn?
**Tìm bằng:** `How many phases does the Cyber Clinic program have?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["cyber-clinic"],"text":["Cyber Clinic"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [1, 2, 3, 4, 5, 6, 7]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.958 | **✓** | `/news/cyber-clinic-train-the-trainer-enhancing` | Nguyễn Thị Xuân Hòa, Deputy Director of the Institute for Digital Technology and Economy and Project Lead of the Cyber Clinic Incubator, stated that t… |
| 2 | 0.911 | **✓** | `/news/cyber-clinic-train-the-trainer-enhancing` | In the final session, Dr. Vũ Văn Thiệu, lecturer at the Faculty of Computer Science, School of Information and Communication Technology (SoICT), Hanoi… |
| 3 | 0.789 | **✓** | `/news/launch-of-the-cyber-clinics-incubation-p` | Representing The Asia Foundation, Ms. Anthea Mulakala, Senior Director for International Development Cooperation, highlighted that the Cyber Clinic is… |
| 4 | 0.769 | **✓** | `/news/cyber-clinic-train-the-trainer-enhancing` | As digital transformation continues to accelerate, the need to develop high-quality human resources in information security has become increasingly ur… |
| 5 | 0.717 | **✓** | `/research/r&d-funding-projects/cyber-clinic?us` | CYBER CAMP KHÓA 01 & 02: KHỞI ĐỘNG HÀNH TRÌNH - BỨT PHÁ KỸ NĂNG: Cyber Camp Khóa 01 & 02 BK Fintech Cyber Clinic diễn ra tại Thảo Viên Resort với các … |
| 6 | 0.628 | **✓** | `/news/launch-of-the-cyber-clinics-incubation-p` | On the morning of April 16, 2026, Hanoi University of Science and Technology officially announced the launch of the Cyber Clinics Incubation Program f… |
| 7 | 0.583 | **✓** | `/research/r&d-funding-projects/cyber-clinic` | R&D-funding-projects Cyber Clinic for Students, Lecturers, and Businesses.… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #372 — ẢO-GIÁC

**Nhóm:** 12. Mơ hồ

**Hỏi:** hello
**Tìm bằng:** `hello`
**Mong đợi:** `no_answer` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Hello! Bạn có cần hỗ trợ thông tin gì từ BKFintech không

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `/news/hack-cx-together-2025` | Bạn có ý tưởng ứng dụng AI đầy tiềm năng trong ngành ngân hàng? Bạn khao khát biến ý tưởng thành hiện thực và được mentor bởi các chuyên gia fintech h… |
| 2 | 0.503 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | We welcome interested companies and partners to contact us for further discussion on potential collaboration opportunities!… |
| 3 | 0.418 |  | `/news/hack-cx-together-2025` | • Thử sức với thách thức thực tế từ Techcombank – một trong những ngân hàng hàng đầu Việt Nam. • Xây dựng MVP (Minimum Viable Product) thực thụ trong … |
| 4 | 0.332 |  | `/news/unihackfest-2026-hanoi-campus-workshop-b` | Time: 8:00 a.m.–12:00 p.m., 24 July 2026 Venue: HUST – MB Digital Hub, Hanoi University of Science and Technology Workshop registration: https://docs.… |
| 5 | 0.290 |  | `/get-involved/vietnam-digital-economy-review/2` | trúc Transformer trong bài báo "Attention Is All You Need" [9]. Sự ra đời của Transformer đã mở đường cho việc phát triển các mô hình ngôn ngữ quy mô … |
| 6 | 0.134 |  | `/news/bk-fintech-hackday-season-12` | First Prize: BrandFlow A Multi-Agent AI ecosystem empowering businesses to develop expert-level marketing strategies in just 10 minutes. Second Prize:… |
| 7 | 0.120 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | Discover the Potential of AI Technology in Banking at HACK <CX> TOGETHER 2025 – where tech talents unite to shape the future of digital banking experi… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #374 — ẢO-GIÁC

**Nhóm:** 12. Mơ hồ

**Hỏi:** bạn giúp được gì?
**Tìm bằng:** `bạn giúp được gì?`
**Mong đợi:** `no_answer` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, tôi là trợ lý BKFintech, tôi có thể cung cấp thông tin và hỗ trợ bạn trong các vấn đề liên quan đến: - Chương trình hỗ trợ doanh nghiệp nâng cao nhận thức về an toàn thông tin, bảo mật dữ liệu và chuyển đổi số [1], [6]. - Thông tin về các sự kiện công nghệ, hackathon như Hack <CX> Together 2025 – Thử thách AI trong ngân hàng [3], [4]. - Kiến thức về trí tuệ nhân tạo, blockchain và các giải pháp trợ lý tài chính chứng khoán như Ensa [5], [7].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.771 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Câu hỏi thường gặp: Doanh nghiệp sẽ nhận được những hình thức hỗ trợ nào? Doanh nghiệp có thể được hỗ trợ nâng cao nhận thức về an toàn thông tin, bảo… |
| 2 | 0.658 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | We welcome interested companies and partners to contact us for further discussion on potential collaboration opportunities!… |
| 3 | 0.647 |  | `/news/hack-cx-together-2025` | Bạn có ý tưởng ứng dụng AI đầy tiềm năng trong ngành ngân hàng? Bạn khao khát biến ý tưởng thành hiện thực và được mentor bởi các chuyên gia fintech h… |
| 4 | 0.428 |  | `/news/hack-cx-together-2025` | • Thử sức với thách thức thực tế từ Techcombank – một trong những ngân hàng hàng đầu Việt Nam. • Xây dựng MVP (Minimum Viable Product) thực thụ trong … |
| 5 | 0.427 |  | `/get-involved/vietnam-digital-economy-review/2` | chịu trách nhiệm xử lý thông tin, ra quyết định và điều phối các hoạt động. Các tác nhân này thể hiện khả năng tự chủ cao như quan sát môi trường, phâ… |
| 6 | 0.239 |  | `/research/r&d-funding-projects/cyber-clinic/ab` | Mục tiêu của dự án: Với sự đồng hành của Quỹ Châu Á tại Việt Nam (TAF), Hội đồng Doanh nhân nữ Việt Nam (VWEC) triển khai Dự án hỗ trợ các doanh nghiệ… |
| 7 | 0.207 |  | `/get-involved/vietnam-digital-economy-review/2` | cá nhân hóa. Họ không chỉ đơn thuần trả lời câu hỏi mà còn chủ động đề xuất các giải pháp đầu tư phù hợp với từng cá nhân. 4. Giới thiệu Ensa − trợ lý… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #391 — ẢO-GIÁC

**Nhóm:** 13. Ngoài phạm vi

**Hỏi:** Học Python bắt đầu từ đâu?
**Tìm bằng:** `where to start learning Python at BKFintech Institute`
**Mong đợi:** `nothing_found` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, bạn có thể học Python thông qua khóa học ngắn hạn Data Analysis để làm chủ việc ra quyết định dựa trên dữ liệu với các công cụ như SQL, Power BI và Python [3].

**3 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.885 |  | `/get-involved/vietnam-digital-economy-review/2` | hỗ trợ các doanh nghiệp đưa ra quyết định dựa trên dữ liệu. Theo báo cáo của Exploding Topics, thị trường phân tích dữ liệu lớn toàn cầu được định giá… |
| 2 | 0.404 |  | `/courses/level-up-it-vie` | Mục tiêu chương trình: Chương trình hướng tới các mục tiêu sau: Giúp học sinh hiểu tổng quan về ngành Công nghệ Thông tin và các lĩnh vực tiêu biểu tr… |
| 3 | 0.000 |  | `/courses/level-up-it-vie` | Trong bối cảnh công nghệ số, trí tuệ nhân tạo và chuyển đổi số đang phát triển mạnh mẽ, ngành Công nghệ Thông tin ngày càng mở ra nhiều cơ hội học tập… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #404 — ẢO-GIÁC

**Nhóm:** 14. Bẫy ngày tháng

**Hỏi:** Bao giờ khóa AI for Everyone khai giảng?
**Tìm bằng:** `When does the AI for Everyone course start?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Khóa Private Intelligence: AI for Everyone khai giảng vào ngày 31/05/2025.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.952 |  | `/courses/ai-for-everyone-eng` | With two public lectures held in 2023 and 2024, the program has attracted over 600 participants. More than 400 of them have been awarded digital certi… |
| 2 | 0.810 |  | `/courses/ai-for-everyone-eng` | Overview: Type: Public lecture - Free of charge Format: Available in Offline (On-site) formats Location: Conference Room, 3rd floor, C1 Building, Hano… |
| 3 | 0.504 |  | `/news/workshop-ai-blockchain-and-fintech-a-beg` | Thời gian: 8h00 - 16h45 ngày 08/06 & 09/06/2024 (Thứ 7 & Chủ nhật) Địa điểm: Tòa nhà HUST-MB Digital Hub, Đại học Bách khoa Hà Nội. Đối tượng tham dự:… |
| 4 | 0.334 |  | `/courses/ai-blockchain-fintech-for-beginners` | Overview: Type: Public lecture - Free of charge Format: Only available in Offline (On-site) formats Location: HUST-MB Digital Hub or Conference Room, … |
| 5 | 0.323 |  | `/news/workshop-ai-blockchain-and-fintech-a-beg` | - TS. Nguyễn Thúc Hương Giang, Viện Kinh tế và Quản lý, Trung tâm Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội. - TS. Trần Vĩnh Đức, Trường Công … |
| 6 | 0.323 |  | `/news/workshop-ai-blockchain-and-fintech` | Tại phòng học HUST-MB Digital, Hơn 60 giảng viên và sinh viên đến từ Institute of Technical Education (ITE)-Singapore đã có mặt để cùng nhau tham dự W… |
| 7 | 0.279 |  | `/academic` | Short-term courses includes three courses: Business Intelligence(Drive automation and optimize organizational productivity through a comprehensive too… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #406 — ẢO-GIÁC

**Nhóm:** 14. Bẫy ngày tháng

**Hỏi:** Hạn chót đăng ký khóa Business Intelligence là ngày nào?
**Tìm bằng:** `What is the registration deadline for the Business Intelligence course at BKFintech Institute?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, hạn chót đăng ký tham gia buổi Public Lecture của khóa Business Intelligence (AI-Powered Insights) là trước ngày 18 tháng 8 năm 2025 [1].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.815 |  | `/courses/business-intelligence-ai-powered-insi` | Overview: Type: Free Course Format: Offline (In-person) combined with Online (Virtual) Location: MB Digital Hub Building, Hanoi University of Science … |
| 2 | 0.772 |  | `/courses/business-intelligence-en` | Overview: 1. Type: Short-term course 2. Format: Available in both Online and Offline (On-site) formats 3. Location (for offline classes): HUST-MB Digi… |
| 3 | 0.735 |  | `/courses/business-intelligence-en` | Course Structure: The Business Intelligence training program is designed with three modules: Module 1: Data-driven mindset and BI applications in ente… |
| 4 | 0.689 |  | `/academic` | Short-term courses includes three courses: Business Intelligence(Drive automation and optimize organizational productivity through a comprehensive too… |
| 5 | 0.656 |  | `/news/hoc-bong-khoa-hoc-vuon-uom-nhan-luc-an-t` | - Các phần quà hấp dẫn khác từ chương trình 3.Quy trình đăng ký: Đăng ký hồ sơ thông qua Google Form: https://forms.gle/EYVAFsMAajxC66uZ6 4.Tiêu chí ư… |
| 6 | 0.624 |  | `/academic` | Business Intelligence: Drive automation and optimize organizational productivity through a comprehensive toolkit combining Power BI, AI/ML, Power Auto… |
| 7 | 0.606 |  | `/news/cuoc-thi-bkfintech-hackday-lan-thu-i-nam` | Thời hạn đăng ký: hết ngày 09/5/2024 2. Thủ tục đăng ký: - Đăng ký tham gia cá nhân hoặc theo đội. - Gửi hồ sơ đăng ký tại Link IV. CÁC VÒNG THI VÀ HO… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #417 — ẢO-GIÁC

**Nhóm:** 14. Bẫy ngày tháng

**Hỏi:** Workshop tiếp theo của Viện vào ngày nào?
**Tìm bằng:** `When is the next BKFintech Institute workshop?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, workshop tiếp theo của Viện diễn ra vào ngày 20/03/2026 với chủ đề "Blockchain in Vietnam – Practical Applications and Solution Development". [2]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.920 |  | `/get-involved/workshop-series` | WORKSHOP: APPLYING AI IN IDEA RESEARCH AND PRODUCT DEVELOPMENT: READ MORE 06/04/2026 WORKSHOP: “DATA ANALYTICS IN BANKING INDUSTRY” – DECODING THE POW… |
| 2 | 0.778 |  | `/get-involved/workshop-series` | BKFintech Workshop Series includes 10 workshops: APPLYING AI IN IDEA RESEARCH AND PRODUCT DEVELOPMENT, DATA ANALYTICS IN BANKING INDUSTRY” – DECODING … |
| 3 | 0.661 |  | `/news/workshop-buc-tranh-nhan-su-nganh-data-an` | Từ đó, giúp các bạn góc nhìn cụ thể về toàn cảnh ngành và xây dựng cho bản thân lộ trình phát triển đúng đắn trong tương lai. Thời gian: 18h - 20h00, … |
| 4 | 0.493 |  | `/news/workshop-bkfintech-mb-agile-the-new-way-` | On September 25, 2025, at the HUST–MB Digital Hub, Hanoi University of Science and Technology, the atmosphere was full of energy and excitement with t… |
| 5 | 0.410 |  | `/news/recap-workshop-buc-tranh-nhan-su-nganh-d` | Ngày 16/01/2023 buổi Workshop "Bức tranh nhân sự ngành Data Analysis 2024" đã diễn ra thành công tốt đẹp. PGS. TS Nguyễn Bình Minh - Giám đốc Trung tâ… |
| 6 | 0.334 |  | `/news/workshop-applying-ai-in-idea-research-an` | • Time: 18:00 – 20:00, April 8, 2026 • Venue: HUST Building – MB Digital Hub, Hanoi University of Science and Technology • Registration: https://forms… |
| 7 | 0.306 |  | `/news/unihackfest-2026-hanoi-campus-workshop-b` | Time: 8:00 a.m.–12:00 p.m., 24 July 2026 Venue: HUST – MB Digital Hub, Hanoi University of Science and Technology Workshop registration: https://docs.… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #418 — ẢO-GIÁC

**Nhóm:** 14. Bẫy ngày tháng

**Hỏi:** Báo cáo Vietnam Digital Economy Review 2026 phát hành khi nào?
**Tìm bằng:** `When will the Vietnam Digital Economy Review 2026 report be released?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, báo cáo Vietnam Digital Economy Review 2025 (hay còn gọi là báo cáo thường niên về công nghệ số và kinh tế số Việt Nam) được ra mắt vào ngày 16 tháng 1 năm 2026.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.843 |  | `/news/hoi-thao-va-le-ra-mat-bao-cao-thuong-nie` | Hoang Van Cuong also shared: “This publication not only reports the Institute’s activities in digital economy-related fields but also provides a compr… |
| 2 | 0.701 |  | `/news/hoi-thao-va-le-ra-mat-bao-cao-thuong-nie` | SCIENTIFIC CONFERENCE AND LAUNCH OF THE VIETNAM DIGITAL ECONOMY REVIEW 2025: NEW DEVELOPMENT FRAMEWORKS FOR ADVANCING THE DIGITAL ECONOMY On January 1… |
| 3 | 0.587 |  | `/news/hoi-thao-va-le-ra-mat-bao-cao-thuong-nie` | Nguyen Binh Minh, focused on key issues of Vietnam’s digital economy in the coming period. The discussion aimed to clarify bottlenecks, challenges, ba… |
| 4 | 0.513 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | VIETNAM DIGITAL ECONOMY REVIEW: Vietnam Digital Economy Review is a popular science journal on the digital economy and technology, published b BK Fint… |
| 5 | 0.443 |  | `/news/ecotech-2026-international-scientific-co` | In the context where artificial intelligence and data are becoming the core foundations of the digital economy, a key question arises: How can AI and … |
| 6 | 0.322 |  | `/get-involved/vietnam-digital-economy-review/2` | Google, Temasek, & Bain & Company. (2025). From Digital Decade to AI Reality: Accelerating the Future in ASEAN. e-Conomy SEA. [2] DataReportal. (2024)… |
| 7 | 0.264 |  | `/get-involved/vietnam-digital-economy-review/2` | THƯ NGỎ CỦA GIÁM ĐỐC ĐẠI HỌC BÁCH KHOA HÀ NỘI Chào mừng quý độc giả đến với Vietnam Digital Economy Review 2025! Tiếp nối thành công của năm đầu tiên,… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #424 — ẢO-GIÁC

**Nhóm:** 14. Bẫy ngày tháng

**Hỏi:** Khi nào Viện công bố kết quả xét duyệt đề tài?
**Tìm bằng:** `When will BKFintech Institute announce the research project approval results?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, Viện công bố kết quả xét duyệt (hoặc xét chọn) đề tài vào các thời gian sau: - Ngày 22/12/2025 (đối với thông báo ngày 06/11/2025) [3]. - Tháng 04/2024 (đối với thông báo ngày 31/01/2024) [4].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.836 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Thành viên đề tài bao gồm cán bộ, giảng viên, nghiên cứu sinh, học viên, sinh viên có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, nghiên cứu bên ng… |
| 2 | 0.818 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Thời gian thực hiện đề tài: 12 thángThời hạn nộp đề xuất: đến hết ngày 7/12/2025Thông báo kết quả xét chọn: 22/12/2025Thực hiện đề tài: 01/01/2026 – 3… |
| 3 | 0.557 |  | `/news/thong-bao-nop-de-xuat-de-tai` | Trung tâm Công nghệ và Kinh tế số (BK Fintech) thông báo về việc nộp đề xuất đề tài nghiên cứu khoa học trong khuôn khổ hợp tác giữa Trung tâm và công… |
| 4 | 0.487 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 5 | 0.404 |  | `/news/hack-cx-together-2025` | • Chủ đề chính thức: Sẽ được công bố chi tiết tại: https://www.hacktogether.org • Hình thức: Theo đội 3-5 người – cùng nhau kiến tạo! • Thời gian vàng… |
| 6 | 0.371 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Viện Công nghệ và Kinh tế số (BK Fintech) - Đại học Bách khoa Hà Nội trân trọng thông báo nhận đề xuất dự án nghiên cứu khoa học thực hiện trong năm 2… |
| 7 | 0.344 |  | `/news/cuoc-thi-fintech-innovation-competition-` | Đối tượng tham gia: Người Việt Nam, đang học tập, sinh sống, làm việc tại Việt Nam và nước ngoài. Ưu tiên các đội thi có sinh viên tham gia. Cam kết: … |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #432 — TỪ-CHỐI-MỀM

**Nhóm:** 15. Bẫy thực thể gần giống

**Hỏi:** Số điện thoại liên hệ của Viện là gì?
**Tìm bằng:** `contact phone number of BKFintech Institute`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, văn bản không cung cấp số điện thoại chung của Viện, chỉ có số điện thoại liên hệ cho cuộc thi BKFintech Hackday lần thứ I năm 2024 của chị Nguyễn Thị Thúy Hằng (0396416699) và anh Quế Đình Huy (0946712407) [2].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `/news/announcement-for-phd-admissions-2026-int` | Applicants are requested to submit their CV and list of published papers to: Assoc. Prof. Nguyen Thi Xuan Hoa Vice Dean, Institute for Digital Technol… |
| 2 | 0.641 |  | `/news/cuoc-thi-bkfintech-hackday-lan-thu-i-nam` | - Trong quá trình tổ chức Cuộc thi, nếu gặp những vấn đề phát sinh ngoài quy định của Thể lệ này, Ban tổ chức sẽ xem xét sửa đổi, bổ sung cho phù hợp … |
| 3 | 0.583 |  | `/get-involved/vietnam-digital-economy-review/2` | NHÀ XUẤT BẢN BÁCH KHOA HÀ NỘI Số 1 − Đại Cồ Việt − Phường Bạch Mai − Hà Nội VPGD: Ngõ 17 – Tạ Quang Bửu – Phường Bạch Mai – Hà Nội ĐT: 024. 38684569; … |
| 4 | 0.520 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |
| 5 | 0.436 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Giới thiệu chung Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội đang tìm kiếm các ứng viên là Chuyên gia đầu ngành trong và ngoài nước ứng tuy… |
| 6 | 0.402 |  | `https://ecotech.bkfin.tech/` | → Ra vào tự động qua Cổng Parabol, đường Giải Phóng (miễn phí) → Đỗ xe tại khu vực C9 và C1 ⚠️ Vui lòng đăng ký biển số xe trước trong form tham dự ho… |
| 7 | 0.391 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Trân trọng kính mời Quý thầy cô và các bạn sinh viên tham dự để cùng trao đổi, học hỏi và cập nhật những kiến thức mới nhất trong kỷ nguyên số. #HUST … |

**Hướng sửa:** Model THỰC SỰ đã từ chối, chỉ dùng cách diễn đạt mà `isRefusal()` không nhận. Ảnh hưởng cả sản phẩm: route.ts dùng chính hàm đó để ẩn khối 'Nguồn tham khảo', nên người dùng đang thấy danh sách nguồn dưới một câu từ chối.

---

## #439 — ẢO-GIÁC

**Nhóm:** 15. Bẫy thực thể gần giống

**Hỏi:** Viện tuyển dụng vị trí nào hiện nay?
**Tìm bằng:** `current job openings and recruitment positions at BKFintech Institute`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, - Chuyên gia - Trưởng nhóm Nghiên cứu và phát triển sản phẩm [2]

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |
| 2 | 0.715 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Giới thiệu chung Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội đang tìm kiếm các ứng viên là Chuyên gia đầu ngành trong và ngoài nước ứng tuy… |
| 3 | 0.309 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Chương trình Vườn ươm Nhân lực An toàn Thông tin… |
| 4 | 0.231 |  | `/news/announcement-for-phd-admissions-2026-int` | The Institute for Digital Technology and Economy, Hanoi University of Science and Technology, announces the recruitment of PhD candidates (doctoral re… |
| 5 | 0.226 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Vũ Minh Khương hiện đang công tác tại Trường Chính sách Công Lý Quang Diệu, Đại học Quốc gia Singapore. Nghiên cứu của ông tập trung vào các lĩnh vực … |
| 6 | 0.174 |  | `/about/institute-council` | Dr. Nguyen Van Cuong \| (Vice Chairman in Charge, Management Council of Vietnam Social Security) \| - Chairman \| Prof. David Tran \| (University of Massa… |
| 7 | 0.157 |  | `/news/workshop-buc-tranh-nhan-su-nganh-data-an` | Từ đó, giúp các bạn góc nhìn cụ thể về toàn cảnh ngành và xây dựng cho bản thân lộ trình phát triển đúng đắn trong tương lai. Thời gian: 18h - 20h00, … |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #445 — ẢO-GIÁC

**Nhóm:** 15. Bẫy thực thể gần giống

**Hỏi:** Viện trực thuộc phòng ban nào của trường?
**Tìm bằng:** `Which department of Hanoi University of Science and Technology does BKFintech Institute belong to?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, Viện Công nghệ và Kinh tế số (BKFintech) là đơn vị đào tạo và nghiên cứu liên ngành trực thuộc Trường Đại học Bách khoa Hà Nội, quy tụ giảng viên và nhà nghiên cứu từ các đơn vị: - Trường Công nghệ Thông tin và Truyền thông [1, 3] - Trường Kinh tế [1] (hoặc Trường Quản lý và Kinh tế [3]) - Khoa Toán - Tin [1] (hoặc Bộ môn Toán - Tin [3])

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 |  | `/about/board-of-deans` | Assoc. Prof. Nguyen Binh Minh Dean \| Assoc. Prof. Nguyen Thi Xuan Hoa Vice-Dean \| Dr. Do Ba Lam Vice-Dean… |
| 2 | 0.720 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |
| 3 | 0.441 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Giới thiệu chung Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội đang tìm kiếm các ứng viên là Chuyên gia đầu ngành trong và ngoài nước ứng tuy… |
| 4 | 0.420 |  | `/get-involved/vietnam-digital-economy-review/2` | năm phát triển, Đại học Bách khoa Hà Nội không ngừng đổi mới, xây dựng môi trường giáo dục hiện đại và phát triển theo định hướng "Đại học số chia sẻ"… |
| 5 | 0.313 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Chủ nhiệm đề tài: • Cán bộ/giảng viên thuộc Đại học Bách khoa Hà Nội Thành viên nghiên cứu: • Có thể đến từ ĐHBK Hà Nội hoặc các cơ sở đào tạo, viện n… |
| 6 | 0.234 |  | `/news/announcement-for-phd-admissions-2026-int` | Applicants will apply to Hanoi University of Science and Technology and conduct their research at the Institute in the following disciplines: • Comput… |
| 7 | 0.167 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Train-the-Trainer (ToT): Chuyên môn Phương pháp Hướng dẫn Vận hành Kết nối Hướng dẫn & mentoring Đồng hành cùng sinh viên trong hoạt động học tập, thự… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #455 — ẢO-GIÁC

**Nhóm:** 15. Bẫy thực thể gần giống

**Hỏi:** Viện dùng nền tảng đám mây nào?
**Tìm bằng:** `Which cloud platform does BKFintech Institute use?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, Viện sử dụng nền tảng Google Cloud để xử lý luồng dữ liệu và truy vấn dữ liệu cho nền tảng BK Fintech Datahub [7].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.986 |  | `/get-involved/vietnam-digital-economy-review/2` | bảo đảm khả năng liên thông và khai thác dữ liệu thứ cấp; thiết lập bộ tiêu chí chất lượng dữ liệu (data quality framework) cho BAĐT, gắn với chỉ số đ… |
| 2 | 0.590 |  | `/get-involved/vietnam-digital-economy-review/2` | bác sĩ và các cơ sở y tế uy tín tư vấn mọi lúc mọi nơi để chăm lo sức khỏe cho bản thân và gia đình. 4. Mô hình đề xuất 4.1. Ěịnh hướng chung Từ các b… |
| 3 | 0.554 |  | `/get-involved/vietnam-digital-economy-review/2` | [4] trên Google Cloud để xử lý luồng dữ liệu và truy vấn dữ liệu. • Các cụm máy chủ để phân tích dữ liệu bao gồm các hệ thống học máy thống kê, hệ thố… |
| 4 | 0.514 |  | `/get-involved/vietnam-digital-economy-review/2` | trúc dữ liệu lớn, ví dụ giao diện quản trị, giao diện người dùng, giao diện tích hợp (API), các công cụ theo dõi và đảm bảo sự vận hành ổn định của hệ… |
| 5 | 0.388 |  | `/get-involved/vietnam-digital-economy-review/2` | dữ liệu” theo từng phần mềm; kiến trúc hướng dịch vụ (SOA/microservices) giúp dễ dàng thay thế, nâng cấp từng thành phần mà không ảnh hưởng toàn hệ th… |
| 6 | 0.360 |  | `/get-involved/vietnam-digital-economy-review/2` | tận dụng các nền tảng công nghệ tiên tiến như đám mây AI để triển khai các mô hình học sâu, xây dựng hệ sinh thái tài chính thông minh. Điều này sẽ tạ… |
| 7 | 0.254 |  | `/` | OUR PROJECTS - Innovative Solutions includes four projects: V-Chain(A platform that supports programmers in developing and deploying decentralized app… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #456 — ẢO-GIÁC

**Nhóm:** 16. Bẫy số liệu suy diễn

**Hỏi:** Tổng số giờ học của tất cả các khóa cộng lại là bao nhiêu?
**Tìm bằng:** `total learning hours of all courses at BKFintech Institute`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, tổng số giờ học của tất cả các khóa học ngắn hạn là 178 giờ (gồm 30 giờ cho khóa Business Intelligence, 76 giờ học và 8 giờ workshop cho khóa Fintech, cùng 72 giờ cho khóa Data Analysis).

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.706 |  | `/courses/business-intelligence-en` | Overview: 1. Type: Short-term course 2. Format: Available in both Online and Offline (On-site) formats 3. Location (for offline classes): HUST-MB Digi… |
| 2 | 0.700 |  | `/academic` | Short-term courses includes three courses: Business Intelligence(Drive automation and optimize organizational productivity through a comprehensive too… |
| 3 | 0.556 |  | `/courses/fintech-course-en` | Overview: Type: Short-term Course Format: Available in both Online and Offline (On-site) formats Location (for offline classes): HUST-MB Digital Hub o… |
| 4 | 0.526 |  | `/academic` | Business Intelligence: Drive automation and optimize organizational productivity through a comprehensive toolkit combining Power BI, AI/ML, Power Auto… |
| 5 | 0.505 |  | `/courses/ai-for-everyone-eng` | With two public lectures held in 2023 and 2024, the program has attracted over 600 participants. More than 400 of them have been awarded digital certi… |
| 6 | 0.390 |  | `/courses/business-intelligence-en` | Course Structure: The Business Intelligence training program is designed with three modules: Module 1: Data-driven mindset and BI applications in ente… |
| 7 | 0.316 |  | `/news/final-round-hack-cx-together-2025` | With a customer-centric approach, the challenge topics were designed based on real business needs from a leading bank, covering areas such as: AI-gene… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #458 — ẢO-GIÁC

**Nhóm:** 16. Bẫy số liệu suy diễn

**Hỏi:** Khóa nào của Viện dài nhất và dài hơn khóa ngắn nhất bao nhiêu giờ?
**Tìm bằng:** `Khóa nào của Viện dài nhất và dài hơn khóa ngắn nhất bao nhiêu giờ?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `gemini-3.5-flash-lite`

**Nội dung trả lời:**

> Dạ, khóa dài nhất là Fintech với 76 giờ và dài hơn khóa ngắn nhất (Business Intelligence với 30 giờ) là 46 giờ. [1]

**1 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.456 |  | `/academic` | Short-term courses includes three courses: Business Intelligence(Drive automation and optimize organizational productivity through a comprehensive too… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #478 — ẢO-GIÁC

**Nhóm:** 16. Bẫy số liệu suy diễn

**Hỏi:** Khóa học nào của Viện đông học viên nhất?
**Tìm bằng:** `Which BKFintech Institute course has the highest number of students?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, khóa học đông học viên nhất là Business Intelligence: AI-Powered Insights với gần 800 người tham gia [2].

**6 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.997 |  | `/research/r&d-funding-projects/cyber-clinic?us` | CYBER CAMP KHÓA 01 & 02: KHỞI ĐỘNG HÀNH TRÌNH - BỨT PHÁ KỸ NĂNG: Cyber Camp Khóa 01 & 02 BK Fintech Cyber Clinic diễn ra tại Thảo Viên Resort với các … |
| 2 | 0.821 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Train-the-Trainer (ToT): Chuyên môn Phương pháp Hướng dẫn Vận hành Kết nối Hướng dẫn & mentoring Đồng hành cùng sinh viên trong hoạt động học tập, thự… |
| 3 | 0.593 |  | `/courses/ai-for-everyone-eng` | With two public lectures held in 2023 and 2024, the program has attracted over 600 participants. More than 400 of them have been awarded digital certi… |
| 4 | 0.353 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Điều kiện tham gia: Có kiến thức nền tảng về công nghệ thông tin Sẵn sàng tham gia các khóa đào tạo của dự án Đạt yêu cầu đánh giá đầu vào hoặc phỏng … |
| 5 | 0.323 |  | `/news/cyber-clinic-train-the-trainer-enhancing` | Nguyễn Thị Xuân Hòa, Deputy Director of the Institute for Digital Technology and Economy and Project Lead of the Cyber Clinic Incubator, stated that t… |
| 6 | 0.000 |  | `/news/cyber-clinic-train-the-trainer-enhancing` | In the final session, Dr. Vũ Văn Thiệu, lecturer at the Faculty of Computer Science, School of Information and Communication Technology (SoICT), Hanoi… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #502 — ẢO-GIÁC

**Nhóm:** 17. Tiền đề sai

**Hỏi:** Bãi gửi xe của Viện thu phí bao nhiêu?
**Tìm bằng:** `What are the parking fees at BKFintech Institute?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> - Ra vào qua Cổng Parabol (đường Giải Phóng): miễn phí [1] - Gửi xe tại nhà xe D3 (Cổng Trần Đại Nghĩa): 3.000 VNĐ [1]

**2 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 |  | `https://ecotech.bkfin.tech/` | → Ra vào tự động qua Cổng Parabol, đường Giải Phóng (miễn phí) → Đỗ xe tại khu vực C9 và C1 ⚠️ Vui lòng đăng ký biển số xe trước trong form tham dự ho… |
| 2 | 0.000 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #503 — ẢO-GIÁC

**Nhóm:** 17. Tiền đề sai

**Hỏi:** App di động của Viện tải ở đâu?
**Tìm bằng:** `Where to download the BKFintech Institute mobile application?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, BK Fintech có 4 ứng dụng với địa chỉ truy cập như sau: - BKOffice: https://bkoffice.hust.edu.vn/ - eDiploma: https://ediploma.vn/vi - BKSign: https://bksign.hust.edu.vn/ - AiPad: https://aipad.vn/

**1 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.502 |  | `/` | BK Fintech has 4 applications: BKOffice(https://bkoffice.hust.edu.vn/), eDiploma(https://ediploma.vn/vi), BKSign(https://bksign.hust.edu.vn/), AiPad(h… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #517 — NHÃN-NGỜ

**Nhóm:** 18. Về người — corpus có

**Hỏi:** Ai làm Chánh văn phòng?
**Tìm bằng:** `Who is the Chief of Office of BKFintech Institute?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["about/back-office"]}` — có trong top-7: **KHÔNG**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết. [6]

**0 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| — | — | — | *(không đoạn nào vượt ngưỡng)* | |

**Hướng sửa:** Không tìm thấy đoạn nào chứa đáp án theo nhãn hiện tại, kể cả ở độ sâu 20. Nhiều khả năng nhãn trong bộ mẫu sai hoặc corpus thật sự không có. Kiểm lại nhãn TRƯỚC khi sửa code.

---

## #519 — PROMPT-TỪ-CHỐI

**Nhóm:** 18. Về người — corpus có

**Hỏi:** Ai phụ trách Business Development?
**Tìm bằng:** `Who is in charge of Business Development at BKFintech Institute?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`
**Nhãn vàng:** `{"url":["about/back-office"]}` — có trong top-7: **CÓ**

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.848 |  | `https://ecotech.bkfin.tech/ecotech2025/speaker` | Managing Director at Lead Consulting ABOUT Mr. Cuong has over 20 years of management experience across various business sectors, including Infrastruct… |
| 2 | 0.715 |  | `/get-involved/vietnam-digital-economy-review/2` | quản dữ liệu y tế quốc gia (health data authority) chịu trách nhiệm kiến trúc tổng thể, chuẩn dữ liệu, phân quyền truy cập và giám sát việc khai thác … |
| 3 | 0.579 |  | `/courses/business-intelligence-en` | Course Structure: The Business Intelligence training program is designed with three modules: Module 1: Data-driven mindset and BI applications in ente… |
| 4 | 0.488 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Cường là tiến sĩ lĩnh vực Kinh tế học, với trình độ lý luận chính trị cao cấp, và từng là Phó Trưởng ban Ban Quản lý Khu Công nghệ cao Hoà Lạc (Bộ Kho… |
| 5 | 0.413 | **✓** | `/about/back-office` | Vu Thi Thu Ha \| (Chief Accountant) \| Tran Minh Phuong \| (Accountant) \| Nguyen Thuy Hang \| (Office Manager) \| Nguyen Phuong Anh \| (Training Manager) \| … |
| 6 | 0.377 |  | `/get-involved/vietnam-digital-economy-review/2` | ngành bách hóa – thực phẩm tăng hơn 50%, điện thoại – máy tính bảng tăng 25%, phản ánh nhu cầu ổn định của sản phẩm thiết yếu và công nghệ. Khi bước s… |
| 7 | 0.300 |  | `/get-involved/vietnam-digital-economy-review/2` | a service) trong việc giảm gánh nặng đầu tư cho cơ sở y tế và cho phép linh hoạt mở rộng hoặc thu hẹp năng lực hệ thống theo nhu cầu [12]. Điều này đặ… |

**Hướng sửa:** Truy hồi ĐÃ làm xong việc — đoạn đúng nằm trong 7 đoạn gửi đi — nhưng model vẫn từ chối. Sửa ở prompt, không phải ở truy hồi. Thường gặp khi đáp án nằm rải nhiều đoạn và model không chịu tổng hợp, hoặc khi đoạn dùng tiếng Anh còn câu hỏi tiếng Việt.

---

## #528 — ẢO-GIÁC

**Nhóm:** 18. Về người — chỉ có chức danh, không có mảng phụ trách

**Hỏi:** Thầy Đỗ Bá Lâm phụ trách mảng nào của Viện?
**Tìm bằng:** `What area of BKFintech Institute is Dr. Do Ba Lam in charge of?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, thầy Đỗ Bá Lâm giữ chức vụ Phó Viện trưởng Viện Công nghệ và Kinh tế số.

**5 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 1.000 |  | `/news/hoi-thao-nang-cao-nang-suat-lao-dong-va-` | Với 28 năm kinh nghiệm trong lĩnh vực giảng dạy và tư vấn cải tiến năng suất, bà là chuyên gia hàng đầu tại nhiều lĩnh vực trong các tổ chức như: chuy… |
| 2 | 0.218 |  | `https://ecotech.bkfin.tech/ecotech2025/speaker` | Vietnam Institute for Advanced Study in Mathematics ABOUT Prof. Ho Tu Bao is the Director of the Data Science Lab at the Vietnam Institute for Advance… |
| 3 | 0.121 |  | `/news/congratulations-to-dr-do-ba-lam-on-his-a` | He has also been an active contributor to the research activities of the Institute for Digital Technology and Economy, helping to strengthen the conne… |
| 4 | 0.095 |  | `/news/congratulations-to-dr-do-ba-lam-on-his-a` | The Institute for Digital Technology and Economy, Hanoi University of Science and Technology, extends its warmest congratulations to Dr. Do Ba Lam on … |
| 5 | 0.000 |  | `/about/board-of-deans` | Assoc. Prof. Nguyen Binh Minh Dean \| Assoc. Prof. Nguyen Thi Xuan Hoa Vice-Dean \| Dr. Do Ba Lam Vice-Dean… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #532 — ẢO-GIÁC

**Nhóm:** 18. Về người — chỉ có chức danh, không có mảng phụ trách

**Hỏi:** Ai là đầu mối cho doanh nghiệp muốn hợp tác?
**Tìm bằng:** `Who is the contact person for businesses wanting to cooperate with BKFintech Institute?`
**Mong đợi:** `not_updated` — **Nhận được:** `answer`
**Model trả lời:** `(lượt chạy cũ — chưa ghi lại model)`

**Nội dung trả lời:**

> Dạ, tài liệu chưa cung cấp thông tin cụ thể về cá nhân hay bộ phận làm đầu mối cho doanh nghiệp muốn hợp tác mà chỉ nêu lời mời các công ty và đối tác quan tâm liên hệ để thảo luận về cơ hội hợp tác [4].

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.700 |  | `https://ecotech.bkfin.tech/ecotech2025/index.h` | We welcome interested companies and partners to contact us for further discussion on potential collaboration opportunities!… |
| 2 | 0.582 |  | `/news/ecotech-2026-vie` | Trong đó, công nghiệp dữ liệu đóng vai trò trung tâm trong việc thu thập, chuẩn hóa, làm giàu, phân tích và thương mại hóa dữ liệu để tạo ra các sản p… |
| 3 | 0.434 |  | `/get-involved/vietnam-digital-economy-review/2` | phải nhớ rằng những phiên bản đầu tiên luôn có khoảng cách với nhu cầu thực sự của người dùng và khách hàng. Cũng như thế, sự thấu hiểu ngành không đả… |
| 4 | 0.366 |  | `/get-involved/vietnam-digital-economy-review/2` | nghiệm làm việc trong ngành. Họ biết vấn đề nhức nhối là gì, ai sẽ trả tiền để giải quyết, cũng như cơ hội thuyết phục người dùng và khách hàng. Nhà s… |
| 5 | 0.339 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Kết nối sinh viên & doanh nghiệp: Doanh nghiệp tham gia các buổi kết nối cùng giảng viên và sinh viên để trao đổi nhu cầu, phạm vi hỗ trợ và hình thức… |
| 6 | 0.276 |  | `/news/le-ky-ket-hop-tac-giua-trung-tam-cong-ng` | Hợp tác giữa BK FINTECH và EWAY đặc biệt có ý nghĩa trong bối cảnh nhu cầu thị trường đòi hỏi việc ứng dụng công nghệ trong lĩnh vực tài chính, kinh t… |
| 7 | 0.269 |  | `/get-involved/vietnam-digital-economy-review/2` | như Tổng Công ty Cảng hàng không Việt Nam (ACV), Tập đoàn Điện lực Việt Nam (EVN), v.v.. Trong vai trò là đối tác chiến lược của hơn 50 hãng công nghệ… |

**Hướng sửa:** Model trả lời từ một đoạn nói về CHỦ THỂ KHÁC (sự kiện khác, tổ chức khác, mục tham khảo). Đây là kiểu hỏng nguy hiểm nhất vì câu trả lời có cả số trích dẫn. Cần thêm ràng buộc kiểm chủ thể vào SYSTEM_PROMPT.

---

## #600 — TRUY-HỒI-TRƯỢT

**Nhóm:** 21. Corpus có — không được từ chối

**Hỏi:** Viện có hỗ trợ đăng ký học bổng và trao đổi học thuật không?
**Tìm bằng:** `Does BKFintech Institute support scholarship applications and academic exchanges?`
**Mong đợi:** `answer` — **Nhận được:** `not_updated`
**Model trả lời:** `gemini-3.5-flash-lite`
**Nhãn vàng:** `{"text":["học bổng|scholarship"]}` — có trong top-7: **KHÔNG** (nhưng có trong top-20)

**Nội dung trả lời:**

> Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết.

**7 đoạn gần nhất được gửi cho LLM:**

| # | điểm | đúng? | nguồn | trích nội dung |
|---|---|---|---|---|
| 1 | 0.769 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Câu hỏi thường gặp: Sinh viên sẽ học tập và thực hành theo hình thức nào? Chương trình kết hợp giữa đào tạo trực tuyến, học tập trực tiếp, mentoring v… |
| 2 | 0.505 |  | `/research/r&d-funding-projects/cyber-clinic?us` | Điều kiện tham gia: Có kiến thức nền tảng về công nghệ thông tin Sẵn sàng tham gia các khóa đào tạo của dự án Đạt yêu cầu đánh giá đầu vào hoặc phỏng … |
| 3 | 0.488 |  | `/news/thong-bao-nop-de-xuat-de-tai-nghien-cuu` | Tối đa 500 triệu đồng (bao gồm cả chi phí quản lý 10%), yêu cầu: Có 01 đăng ký sáng chế hoặc giải pháp hữu ích được Cục Sở hữu trí tuệ chấp nhận đơn h… |
| 4 | 0.464 |  | `/research/r&d-funding-projects/cyber-clinic?us` | CYBER CAMP KHÓA 01 & 02: KHỞI ĐỘNG HÀNH TRÌNH - BỨT PHÁ KỸ NĂNG: Cyber Camp Khóa 01 & 02 BK Fintech Cyber Clinic diễn ra tại Thảo Viên Resort với các … |
| 5 | 0.381 |  | `/news/hoc-bong-khoa-hoc-vuon-uom-nhan-luc-an-t` | - Các phần quà hấp dẫn khác từ chương trình 3.Quy trình đăng ký: Đăng ký hồ sơ thông qua Google Form: https://forms.gle/EYVAFsMAajxC66uZ6 4.Tiêu chí ư… |
| 6 | 0.376 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Ngay tại thời điểm thành lập, Viện có sự tham gia của các nhà nghiên cứu, người học từ ba đơn vị chính của Đại học Bách khoa Hà Nội, bao gồm Trường Cô… |
| 7 | 0.341 |  | `/news/thong-bao-tuyen-dung-theo-de-an-hust-tal` | Giới thiệu chung Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội đang tìm kiếm các ứng viên là Chuyên gia đầu ngành trong và ngoài nước ứng tuy… |

**Hướng sửa:** Đoạn chứa đáp án không lọt top-7. Xem 7 đoạn dưới: nếu chúng cùng chủ đề nhưng sai trang, vấn đề là xếp hạng (thử nới `--candidates`, hoặc thêm bigram vào tầng lexical). Nếu chúng lạc chủ đề hẳn, vấn đề là câu truy vấn — xem dòng `TÌM BẰNG`.

---