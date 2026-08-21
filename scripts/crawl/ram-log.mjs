/**
 * Lấy mẫu RAM trong suốt cửa sổ bảo trì.
 *
 *   node scripts/crawl/ram-log.mjs             # chạy nền, ghi tới khi bị kill
 *   node scripts/crawl/ram-log.mjs --summary   # đọc log, in đỉnh và headroom
 *
 * ─── VÌ SAO KHÔNG DÙNG CON SỐ CỦA `embed.ts` LÀ ĐỦ ───────────────────────────
 *
 * `embed.ts` đã in `RSS: ... -> dinh 2240MB`, nhưng đó là RSS của RIÊNG tiến
 * trình embed, và chỉ có đúng một con số ở cuối. Nó không trả lời được ba câu
 * mà cả thiết kế bảo trì dựa vào:
 *
 *   1. Máy còn bao nhiêu chỗ trống lúc căng nhất? (RSS của một tiến trình không
 *      nói lên điều đó — MongoDB và tiến trình web vẫn đang chạy bên cạnh)
 *   2. Đỉnh rơi vào pha nào?
 *   3. Model có còn nguyên vẹn trong app suốt cửa sổ bảo trì không?
 *
 * ⚠️ BẤT BIẾN CỦA CÂU 3 ĐÃ ĐẢO CHIỀU so với bản đầu của file này.
 *
 * Trước đây `model_loaded` PHẢI là `false` suốt cửa sổ bảo trì, vì pha B tự nạp
 * một bản BGE-M3 thứ hai trong tiến trình riêng — nên `true` nghĩa là hai bản
 * cùng lúc. Bây giờ pha B (và cả cổng QA) mượn model của app qua
 * /api/chatbot/embed, nên chỉ còn MỘT bản duy nhất, và nó phải sống suốt.
 *
 * Bất biến mới: `model_loaded` phải là `true` ở MỌI mẫu. Thấy `false` nghĩa là
 * worker giữ model vừa chết, và pha B sẽ thất bại.
 *
 * Ghi đè log ở mỗi lần chạy: một cửa sổ bảo trì là một file. Phần tóm tắt đi ra
 * stdout của `run-weekly.sh`, tức là vào `weekly.log` mà systemd giữ — đó mới là
 * chỗ người vận hành thật sự đọc.
 */
import { writeFile, appendFile, readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import os from 'node:os'

const LOG = 'data/ram-maintenance.log'
const SUMMARY = process.argv.includes('--summary')
const EVERY_MS = Number(process.env.RAM_SAMPLE_SEC || 2) * 1000
const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:3003/api/health'
/**
 * Dưới ngưỡng này thì máy sắp chạm OOM killer.
 *
 * Cố ý KHÔNG so với `MemoryMax=3G` của systemd: trần đó áp cho cgroup của RIÊNG
 * job, còn con số ở đây là bộ nhớ toàn máy. So hai đại lượng khác nhau thì cảnh
 * báo sẽ nổ ở mọi lần chạy và thành vô nghĩa — RSS của job thì `embed.ts` đã
 * báo riêng rồi.
 */
const MIN_FREE_MB = Number(process.env.RAM_MIN_FREE_MB || 500)

/**
 * Tự dừng sau ngần này phút, kể cả khi không ai kill.
 *
 * Đặt cao hơn watchdog 15 phút của `run-weekly.sh` nên nó không bao giờ cắt
 * ngang một cửa sổ bảo trì hợp lệ. Nó chỉ tồn tại cho trường hợp tiến trình cha
 * chết mà không kịp dọn — trên Linux bẫy `kill -- -$$` lo được, nhưng chạy tay ở
 * Git Bash trên Windows thì giết theo nhóm không đáng tin, và một bộ lấy mẫu mồ
 * côi sẽ lặng lẽ ghi đè log của lần chạy sau.
 */
const MAX_MIN = Number(process.env.RAM_MAX_MIN || 20)

const mb = (bytes) => Math.round(bytes / 1024 / 1024)

/**
 * Bộ nhớ còn dùng được, tính bằng MB.
 *
 * Trên Linux đọc `MemAvailable` chứ KHÔNG dùng `os.freemem()`: freemem trả về
 * MemFree, vốn không tính page cache có thể thu hồi, nên nó báo máy sắp hết RAM
 * trong khi thực tế còn rất nhiều. Chênh nhau vài GB trên một máy chủ đang chạy.
 * Nền tảng không có /proc thì mới lùi về os.freemem().
 */
function memory() {
  try {
    const info = readFileSync('/proc/meminfo', 'utf-8')
    const kb = (key) => {
      const m = info.match(new RegExp(`^${key}:\\s+(\\d+) kB`, 'm'))
      return m ? Number(m[1]) * 1024 : null
    }
    const total = kb('MemTotal')
    const avail = kb('MemAvailable')
    if (total && avail) return { total: mb(total), used: mb(total - avail), src: 'meminfo' }
  } catch {
    /* không phải Linux */
  }
  return { total: mb(os.totalmem()), used: mb(os.totalmem() - os.freemem()), src: 'os' }
}

/** `model_loaded` của app, hoặc null nếu không hỏi được. */
async function modelLoaded() {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return null
    return (await res.json())?.model_loaded ?? null
  } catch {
    // App đang restart giữa chu kỳ là chuyện bình thường ở đầu cửa sổ bảo trì.
    return null
  }
}

async function sample() {
  const started = Date.now()
  // Đầu cửa sổ bảo trì app CHƯA restart xong, nên `model_loaded: true` lúc đó là
  // bình thường chứ không phải sự cố. Chỉ sau khi thấy `false` một lần — tức app
  // đã boot lại ở chế độ bỏ preload — thì `true` mới có nghĩa là nó lỡ nạp bản
  // thứ hai. Không phân biệt hai giai đoạn này thì cảnh báo nổ ở mọi lần chạy.
  await writeFile(
    LOG,
    `# bat dau ${new Date().toISOString()} | lay mau moi ${EVERY_MS / 1000}s | nguon bo nho: ${memory().src}\n` +
      `# giay  da_dung_MB  tong_MB  model_loaded  ghi_chu\n`
  )

  for (;;) {
    if (Date.now() - started > MAX_MIN * 60 * 1000) {
      await appendFile(LOG, `# tu dung sau ${MAX_MIN} phut — tien trinh cha co le da chet ma khong kip don
`)
      process.exit(0)
    }
    const m = memory()
    const loaded = await modelLoaded()
    const flag = loaded === null ? '?' : loaded ? 'co-model' : 'MAT-MODEL'
    // Đánh dấu ngay trên dòng, để đọc log không phải tự đối chiếu: mất model
    // giữa lúc bảo trì là sự cố, không phải số liệu.
    const note = flag === 'MAT-MODEL' ? '  <== APP MAT MODEL GIUA LUC BAO TRI' : ''
    const sec = String(Math.round((Date.now() - started) / 1000)).padStart(5)
    await appendFile(
      LOG,
      `${sec}  ${String(m.used).padStart(9)}  ${String(m.total).padStart(7)}  ${flag.padStart(12)}${note}\n`
    )
    await new Promise((r) => setTimeout(r, EVERY_MS))
  }
}

async function summary() {
  if (!existsSync(LOG)) {
    console.log('chua co du lieu RAM cho cua so nay')
    return
  }
  const rows = (await readFile(LOG, 'utf-8'))
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.trim().split(/\s+/))
    .filter((f) => f.length >= 4)

  if (!rows.length) {
    console.log('log RAM rong — bo lay mau chua kip chay mau nao')
    return
  }

  const used = rows.map((f) => Number(f[1]))
  const total = Number(rows[0][2])
  const peak = Math.max(...used)
  const peakAt = rows[used.indexOf(peak)][0]
  const avg = Math.round(used.reduce((a, b) => a + b, 0) / used.length)
  const secs = Number(rows[rows.length - 1][0])
  const lost = rows.filter((f) => f[3] === 'MAT-MODEL').length
  const unknown = rows.filter((f) => f[3] === '?').length

  console.log(`RAM trong cua so bao tri (${rows.length} mau / ${secs}s):`)
  console.log(`  dinh        ${peak}MB / ${total}MB  (o giay thu ${peakAt})`)
  console.log(`  trung binh  ${avg}MB`)
  console.log(`  con trong   ${total - peak}MB luc cang nhat`)
  const freeAtPeak = total - peak
  if (freeAtPeak < MIN_FREE_MB) {
    console.log(`  CANH BAO: chi con ${freeAtPeak}MB luc cang nhat (nguong ${MIN_FREE_MB}MB).`)
    console.log('    OOM killer co the chon bat ky dich vu nao cua may, khong rieng job nay.')
  }
  if (lost) {
    console.log(`  LOI NGHIEM TRONG: ${lost}/${rows.length} mau thay app MAT model giua luc bao tri.`)
    console.log('    Pha B muon model cua app, nen mat model la pha B that bai. Xem worker o')
    console.log('    workers/embed-worker.mjs va log cua app.')
  } else if (unknown === rows.length) {
    console.log(`  khong doc duoc /api/health lan nao trong ${secs}s — app co dang chay khong?`)
  } else {
    console.log(`  app giu model suot ${rows.length - unknown}/${rows.length} mau — dung nhu thiet ke.`)
    console.log('    Chi mot ban BGE-M3 ton tai trong toan bo cua so bao tri.')
    if (unknown) console.log(`    (${unknown} mau khong doc duoc health, khong tinh la loi)`)
  }
  console.log(`  chi tiet tung mau: ${LOG}`)
}

if (SUMMARY) {
  await summary()
} else {
  await sample()
}
