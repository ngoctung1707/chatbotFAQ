# Checklist workflow — cơ chế tự động cập nhật chỉ mục chatbot

Rút ra từ code thực tế: `systemd/*`, `run-weekly.sh`, `healthcheck.sh`, `index.mjs`,
`cache-report.ts`, `embed.ts`, `build-store.ts`, `qa-gate.ts`, `src/lib/chatbot/maintenance.ts`.

Ký hiệu: **[MÁY]** hệ thống tự làm — **[NGƯỜI]** phải có người xác nhận/thao tác.

---

## 0. Cài đặt một lần (trước khi bật lịch)

- [ ] **[NGƯỜI]** `data/sources.registry.json` đã có và đúng — sinh bằng `node scripts/build-registry.mjs`; nhãn `collection`, nhóm selector, `min_items` do người quyết.
- [ ] **[NGƯỜI]** Nạp cache từ chỉ mục cũ: `npx tsx scripts/crawl/seed-cache.ts` — không làm thì lần chạy đầu phải embed lại cả 405 chunk đóng băng.
- [ ] **[NGƯỜI]** Tạo và nạp sẵn **volume cache model** (khác hẳn mục trên — đây là trọng số BGE-M3, không phải vector):
      ```
      mkdir -p /home/hust/bkfintech/model-cache
      scp -r <máy-dev>/node_modules/@xenova/transformers/.cache/* \
             hust@<máy-chủ>:/home/hust/bkfintech/model-cache/
      ```
      Bỏ qua thì container phải tải ~560MB từ huggingface.co ở lần chạy đầu, và **tải lại từ
      đầu sau mỗi `docker compose up -d --build`**; máy chủ chặn egress thì preload hỏng vĩnh
      viễn — website vẫn xanh, chỉ chatbot chết.
      Đã kiểm trong container thật: có cache sẵn thì preload xong sau **9,1 giây**, log in
      `[chatbot] cache model: /app/model-cache`.
- [ ] **[NGƯỜI]** Ghi mốc QA **trên store đang phục vụ**: `CHATBOT_REWRITE=0 npx tsx scripts/crawl/qa-gate.ts --baseline` → `data/qa-baseline.json`.
      Nếu log báo có câu "không truy hồi được gì ngay từ mốc" → sửa bộ câu hỏi, vì câu đó vĩnh viễn không bắt được hồi quy.
- [ ] **[NGƯỜI]** Chạy đầy đủ pha A một lần (không `--source=`) để `data/crawl-output.jsonl` là **toàn bộ kho**, không phải một nguồn.
- [ ] **[NGƯỜI]** Kiểm tra tzdata trên máy chủ: `ls /usr/share/zoneinfo/Asia/Ho_Chi_Minh`. Thiếu → `Timezone=` trong timer hỏng → job chạy 9h sáng chủ nhật.
- [ ] **[NGƯỜI]** Cài unit `bkfintech-index.service` + `.timer`, sửa `WorkingDirectory` cho khớp máy, rồi `systemctl enable --now bkfintech-index.timer`.
- [ ] **[NGƯỜI]** Cài cron healthcheck: `*/5 * * * * cd <app> && bash scripts/crawl/healthcheck.sh >> data/healthcheck.log 2>&1`.
- [x] ~~Đối chiếu `MemoryMax` với thực đo~~ — ĐÃ XONG. Chốt **2G**, chú thích đã viết lại.
      Job không còn nạp model (pha B mượn của app), nên đỉnh RSS của pha nặng nhất còn lại
      là **371MB** (pha C). Con số cũ 3G/4G tính cho thời còn nạp BGE-M3 trong tiến trình job.
- [x] ~~Sau lần deploy đầu, đo `docker stats` rồi chốt lại `mem_limit` của app~~ — ĐÃ ĐO,
      trong container Linux thật (không còn suy từ Windows). Chốt **4g**.
      `docker stats`: app nghỉ ngay sau preload **2,661 GiB**, sau một lô embed 128 đoạn
      **1,484 GiB**, db nhàn rỗi **81 MiB**. Trần cũ 2560m = 2,5 GiB, tức **nhỏ hơn mức
      nghỉ** — container sẽ bị kernel giết ngay sau khi khởi động, trước cả câu hỏi đầu
      tiên; `memswap_limit` bằng `mem_limit` nên chạm trần là bị kill chứ không phải chậm.
      Vẫn nên chạy `docker stats` một lần trên máy chủ để xác nhận, nhưng không còn là
      con số phỏng đoán nữa.
- [ ] **[NGƯỜI]** *(bảo mật, làm SAU khi container đã chạy được)* Thêm `USER nextjs` vào
      `Dockerfile`. Hiện container **chạy bằng root** — đo được: `id` trong image trả
      `uid=0(root)`. Dockerfile có tạo user `nextjs` (uid 1001) và `chown`, nhưng không bao
      giờ `USER` sang. Không gây crash, nên cố ý tách khỏi bản vá lỗi container để một thay
      đổi có thể làm hỏng upload không đi kèm bản vá đang cần gấp.
      Điều kiện bắt buộc trước khi bật, nếu không Payload hết upload được ảnh:
      ```
      sudo chown -R 1001:1001 /home/hust/bkfintech/media
      sudo chown -R 1001:1001 /home/hust/bkfintech/model-cache   # chỉ cần nếu để container tự tải model
      ```
      `/home/hust/bkfintech/data` mount `:ro` nên chỉ cần đọc được, không cần chown.

---
      
## 1. Kích hoạt — [MÁY]

- [ ] Timer bắn `Sun *-*-* 02:00:00`, `Timezone=Asia/Ho_Chi_Minh`, lệch ngẫu nhiên ≤ 5 phút.
- [ ] `Persistent=true` → máy tắt lúc đến giờ thì chạy bù khi bật lên.
- [ ] Service `Type=oneshot`, chạy `bash scripts/crawl/run-weekly.sh`, log dồn vào `data/weekly.log`.
- [ ] Hàng rào tài nguyên: `MemoryMax`, `MemorySwapMax=0`, `Nice=10`, `IOSchedulingClass=idle`, `CPUWeight=50`, `TimeoutStartSec=25min`.

## 2. Tự kiểm tra đầu job — [MÁY]

- [ ] In song song mốc UTC và mốc VN (tính bằng số học `UTC+7`, **không** tin `TZ=`).
- [ ] Cảnh báo nếu `TZ=Asia/Ho_Chi_Minh` cho giờ khác `UTC+7` → thiếu tzdata.
- [ ] Cảnh báo nếu giờ VN nằm ngoài khung **1h–4h sáng**.
- [ ] Chống chạy chồng: có `data/.weekly.lock` → thoát ngay mã 1, **không** gỡ lock của lần chạy kia.
- [ ] Đặt bẫy `trap cleanup EXIT INT TERM` **trước** mọi việc nặng.

---

## 3. PHA A — crawl + diff (chatbot vẫn phục vụ, KHÔNG bảo trì)

`node scripts/crawl/index.mjs`

- [ ] **[MÁY]** Duyệt từng nguồn trong registry (json + html), mỗi nguồn xử lý độc lập.
- [ ] **[MÁY]** Lọc thô trước khi cắt chunk: JSON so `updated_at`, HTML so `page_hash` theo từng ngôn ngữ → trùng thì `skipped`, mang nguyên chunk cũ sang.
- [ ] **[MÁY]** Selector vỡ ở **bất kỳ** ngôn ngữ nào → `broken`, giữ nguyên chunk cũ, **không** đụng state (lần sau vẫn crawl lại).
- [ ] **[MÁY]** Chỉ 404/410 mới tính là "biến mất", và phải lặp **GRACE_RUNS = 2** lần chạy liên tiếp mới được xoá chunk.
- [ ] **[MÁY]** Nguồn hỏng liên tiếp **FAIL_RUNS = 3** lần → vào danh sách `NGUON DA NGUNG CAP NHAT`, in cuối log.
- [ ] **[MÁY]** Khử trùng lặp theo `chunk_hash` **trước** khi ghi state (làm ngược thì mỗi tuần rụng vài chunk: đo được 414 → 408).
- [ ] **[MÁY]** Dựng lại `stats_personnel_c01` sau vòng lặp, sau khi loại bản mang-sang.
- [ ] **[MÁY]** 🚦 **Van 5.2**: > **30%** số nguồn kiểm được cùng báo "đã đổi" → HỦY, không ghi kế hoạch, thoát 1. (Bỏ qua khi `run == 1` hoặc chạy `--source=`; ép chạy bằng `--force`.)
- [ ] **[MÁY]** Ghi `data/crawl-output.jsonl` (**luôn là toàn bộ kho**), `data/crawl-plan.json`, `data/crawl_state.json`, `data/pending-routes.json`.

**Cổng mã thoát pha A — ba mức, không phải hai:**

| Mã | Nghĩa | Hành động |
|----|-------|-----------|
| `0` | sạch | chạy tiếp |
| `2` | có nguồn hỏng nhưng kho vẫn dùng được | **vẫn chạy tiếp**, `DEGRADED=1`, kết thúc job bằng mã 2 |
| khác | không dùng được lần chạy này | dừng, giữ nguyên chỉ mục, **không** vào bảo trì |

---

## 4. Quyết định có bảo trì hay không — [MÁY]

`npx tsx scripts/crawl/cache-report.ts --write-plan` (bỏ `--write-plan` khi `--dry-run`)

- [ ] Giữ **cả stderr** và in nguyên báo cáo ra log — không `2>/dev/null`.
- [ ] Lệnh lỗi (mã ≠ 0) → **dừng mã 1**. Tuyệt đối không hiểu thành "tuần này không có gì đổi".
- [ ] Không đọc được dòng `PHAI EMBED:` → dừng mã 1 (định dạng đầu ra đã đổi).
- [ ] `TO_EMBED` phải là **số nguyên không âm**, nếu không → dừng.
- [ ] Không đọc được dòng `STORE:`, hoặc giá trị không thuộc `khop|lech` → dừng.

**Bảng quyết định:**

| `PHAI EMBED` | `STORE` | Kết quả |
|---|---|---|
| `0` | `khop` | ⏭️ **Bỏ qua hoàn toàn pha B + C** — tuần này chatbot không tắt phút nào. Thoát `DEGRADED*2`. |
| `0` | `lech` | 🔁 **Khôi phục**: lần chạy trước đứt sau pha B. Vẫn vào bảo trì, chạy lại pha C. |
| `> 0` | bất kỳ | ▶️ Vào bảo trì bình thường. |

- [ ] `--dry-run` → dừng tại đây, không vào bảo trì.

---

## 5. Vào cửa sổ bảo trì — [MÁY]

- [ ] **Cấp giấy phép có hạn** (`data/maintenance.flag`): hạn `LEASE_SEC=300`s, gia hạn mỗi `RENEW_SEC=60`s (chịu được 5 nhịp trễ liên tiếp).
      Ghi **nguyên tử**: ghi `.tmp` → `mv -f`. Ghi đè trực tiếp sẽ để lộ file rỗng.
      `since` đặt **một lần** ở `start_renewer` và giữ nguyên qua mọi lần gia hạn.
- [ ] Vòng gia hạn nằm ở **shell**, không nằm trong `embed.ts` — job treo mà vẫn giữ RAM thì bảo trì phải **tiếp tục**.
- [ ] Bật đo RAM nền: `node scripts/crawl/ram-log.mjs` → `data/ram-maintenance.log`, mẫu mỗi `RAM_SAMPLE_SEC=2`s.
- [ ] **KHÔNG restart app.** Model nằm trong worker thread của app và ở nguyên đó; pha B mượn nó qua `/api/chatbot/embed` thay vì tự nạp bản thứ hai.
- [ ] `/api/chat` trả thẳng câu thông báo bảo trì. Lý do đã đổi: không còn nguy cơ nạp bản model thứ hai, nhưng worker đang bận chạy pha B nên một câu hỏi lọt vào sẽ xếp hàng rất lâu.
- [ ] **Chờ xác nhận model SẴN SÀNG** (`require_model_ready`): poll `/api/health` tới 120s cho tới khi `"model_loaded":true`. Không đạt → dừng, vì pha B chắc chắn sẽ thất bại.
- [ ] `CHATBOT_INTERNAL_SECRET` phải có ở cả app lẫn môi trường chạy job — thiếu thì hai route nội bộ trả 503.

---

## 6. PHA B — embed (pha DUY NHẤT cần model) — [MÁY]

`timeout 15m npx tsx scripts/crawl/embed.ts`

- [ ] Chỉ embed chunk **cache chưa có**; gộp theo hash của chuỗi-được-embed, không theo `chunk_id`.
- [ ] Ghi cache **nối thêm từng dòng, flush ngay** → bị kill giữa chừng vẫn giữ được phần đã làm.
- [ ] ⏱️ Mã `124` = watchdog `TIMEOUT_MIN=15` cắt → giữ store cũ, thoát 1.
- [ ] Mã khác 0 = thất bại → giữ store cũ, thoát 1.

## 7. PHA C — dựng IDF + ghi store (không cần model) — [MÁY]

`npx tsx scripts/crawl/build-store.ts`

- [ ] Kho rỗng → dừng, **không** ghi đè store cũ.
- [ ] Thiếu vector trong cache → dừng, báo chạy pha B trước.
- [ ] 🚦 **Van 5.1**: số chunk tụt > **20%** so với store đang chạy → HỦY, giữ store cũ (`--force` để ép).
- [ ] 🚦 Đĩa còn < **200MB** ở `INDEX_DIR` → HỦY.
- [ ] Ghi bản có dấu thời gian `store.YYYYMMDD-HHMMSS.json`, rồi ghi `.tmp` → `rename` sang `store.json` (nguyên tử).
- [ ] Dọn bản cũ, giữ **KEEP_VERSIONS = 3**.

## 8. Cổng chất lượng truy hồi — [MÁY]

`CHATBOT_REWRITE=0 npx tsx scripts/crawl/qa-gate.ts`

- [ ] **Bắt buộc** `CHATBOT_REWRITE=0` — script tự chặn nếu quên (rewrite bật thì kết quả không tất định, mốc so sánh vô nghĩa).
- [ ] Chỉ đo **truy hồi**, đi qua đúng `Retriever` của production (gồm cả hybrid + rerank), không phải bản mô phỏng.
- [ ] Hồi quy = câu **trước có, giờ 0 chunk**. Ngưỡng `QA_MAX_REGRESSIONS = 0`.
- [ ] ❌ **Trượt** → khôi phục `store.json` từ bản áp chót (`ls -1t store.*.json | sed -n 2p`), thoát 1.
      Không tìm thấy bản trước → cảnh báo và vẫn thoát 1. **[NGƯỜI]** phải vào xem.

## 9. Dọn dẹp sau khi đã qua cổng — [MÁY]

- [ ] `prune-cache.ts` — dọn vector mồ côi. Chạy **sau** cổng QA (xoá vector không lùi được) và **trước** backup (để bản sao là bản đã dọn). Hỏng ở đây chỉ cảnh báo.
- [ ] `backup-state.sh` — sao lưu `embeddings.cache.jsonl`, `crawl_state.json`, `qa-baseline.json`, `normalize-baseline.json` vào `data/backups`, giữ `KEEP_BACKUPS=8` mốc. Hỏng chỉ cảnh báo.

## 10. Thoát bảo trì — [MÁY], qua `trap cleanup EXIT`

Chạy **dù job thành công hay chết ở bất kỳ đâu**:

- [ ] Dừng vòng gia hạn + dừng bộ đo RAM.
- [ ] In tóm tắt RAM **trước** khi thu hồi giấy phép (để nó có mặt cả khi job hỏng).
- [ ] `rm -f data/maintenance.flag*` → thu hồi giấy phép. **Chỉ thế là đủ**: app vẫn đang chạy, vẫn giữ model, và store mới thì đã nạp ở bước `reload_store` sau cổng QA.
- [ ] **KHÔNG restart app** (trước đây có, đã bỏ — đó là lần restart thứ hai trong hai lần).
- [ ] `rm -f data/.weekly.lock`.
- [ ] `kill -- -$$` → giết cả nhóm tiến trình (tránh `tsx` mồ côi còn giữ model).
- [ ] Lưới cuối: `ExecStopPost` của service xoá flag + lock nếu bẫy EXIT không chạy được (`kill -9`, OOM, quá `TimeoutStartSec`).
      ⚠️ `ExecStopPost` **cố ý không** restart app — làm vậy sẽ restart hai lần liên tiếp mỗi chủ nhật.

## 11. Mã thoát của job — [MÁY]

- [ ] `0` — sạch (đã cập nhật, hoặc không có gì đổi).
- [ ] `2` — đã cập nhật **nhưng có nguồn hỏng**; systemd đánh dấu unit thất bại để người vận hành nhìn thấy.
- [ ] `1` — dừng giữa chừng, chỉ mục giữ nguyên bản cũ.

---

## 12. Giám sát liên tục (cron 5 phút) — [MÁY]

`bash scripts/crawl/healthcheck.sh`

- [ ] Health **không phản hồi** + **đang có** giấy phép → bỏ qua (app đang restart giữa chu kỳ).
- [ ] Health **không phản hồi** + **không có** giấy phép → đợi `RETRY_SEC=90`s, kiểm tra lại **cả flag lẫn curl**, vẫn im → `docker compose restart app`.
      (Phải hỏng **hai lần** mới kết luận — một lần curl hỏng từng đủ để cắt ngang lúc app đang nạp model.)
- [ ] Đang bảo trì → đọc `since` **từ `/api/health`**, không stat mtime (mtime bị `mv -f` mỗi 60s làm mới nên vô dụng).
- [ ] Không đọc được `since` → nói thẳng "chưa kiểm tra được job treo", không im lặng bỏ qua.
- [ ] Bảo trì ≥ `STUCK_MIN=20` phút mà giấy phép **vẫn được gia hạn** → job **treo chứ không chết**, watchdog 15 phút cũng hỏng.
      ⚠️ **KHÔNG tự restart** (job đang giữ model trong RAM) — thoát 1, **[NGƯỜI]** phải vào xem.
- [ ] Không bảo trì mà flag còn nằm đó ≥ `STALE_MIN=60` phút → dọn file.
- [ ] ⚠️ **BẤT BIẾN NÀY ĐÃ BỊ ĐẢO NGƯỢC.** Suốt cửa sổ bảo trì, `/api/health` phải cho `model_loaded == true` — model sống trong worker thread của app suốt đời tiến trình, và pha B mượn chính nó. Thấy `false` giữa lúc bảo trì nghĩa là worker chết, và pha B sẽ hỏng.
      Bản cũ đòi `false` vì hồi đó pha B tự nạp một bản BGE-M3 thứ hai trong tiến trình riêng, nên hai bản cùng lúc là dấu hiệu hỏng. Bây giờ chỉ còn **một** bản, mọi lúc — xem `workers/embed-worker.mjs`.

---

## 13. Việc của người sau mỗi lần chạy — [NGƯỜI]

- [ ] Đọc `data/weekly.log`: mã thoát, độ dài cửa sổ bảo trì thật, tóm tắt RAM (headroom lúc căng nhất).
- [ ] Nếu mã 2 → xem danh sách `SELECTOR VO` / `LOI` / `NGUON DA NGUNG CAP NHAT`, sửa selector hoặc URL trong registry.
- [ ] Duyệt `data/pending-routes.json` → route nào nhận thì thêm vào `sources.registry.json`, route nào không thì đẩy sang `out_of_scope`.
- [ ] Kiểm tra định tính (cổng QA chỉ **đếm**, không biết kết quả có **đúng** không):
      `CHATBOT_REWRITE=0 npx tsx scripts/crawl/spot-check.ts` và `.../diagnose.ts`.
- [ ] Sau thay đổi lớn về pipeline: `npx tsx scripts/crawl/acceptance.ts` (đối chiếu với kho cũ do người làm).
- [ ] Xem tab Crawl Report trong admin (`/api/chatbot/crawl-report`) — số liệu lấy từ `crawl-plan.json`.
- [ ] Sau khi cố ý đổi bộ câu hỏi hoặc pipeline truy hồi → **ghi lại mốc QA**, nếu không cổng sẽ so với mốc lỗi thời.

---

## 14. Chạy tay / gỡ rối

```bash
bash scripts/crawl/run-weekly.sh --dry-run        # tới trước bảo trì rồi dừng
node scripts/crawl/index.mjs --source=<id>        # một nguồn; KHÔNG ghi đè pending-routes
npx tsx scripts/crawl/cache-report.ts             # bao nhiêu chunk phải embed + store khớp chưa
npx tsx scripts/crawl/embed.ts --dry-run          # đếm, không nạp model
npx tsx scripts/crawl/build-store.ts --dry-run    # dựng IDF, không ghi file
node scripts/crawl/ram-log.mjs --summary          # đỉnh RAM + headroom lần bảo trì gần nhất
```

- [ ] Chạy tay `--source=` **không** tăng số lần chạy và **không** kích van 30% — nhớ điều đó khi đọc log.
- [ ] Job chết bẩn để lại lock → xoá `data/.weekly.lock` trước lần chạy sau (`ExecStopPost` thường đã lo).
- [ ] Không sửa `store.json` bằng tay — pha C ghi nguyên tử, sửa tay sẽ lệch với `crawl_state.json`.
