/**
 * Mục 2.7 — hai bài kiểm tra bắt buộc cho bộ normalize.
 *
 * Đây là thứ duy nhất đứng giữa "job hàng tuần gần như không tốn gì" và "tuần
 * nào cũng embed lại cả kho". Nếu normalize không ổn định thì mọi thứ phía sau
 * — hash, cache, chế độ bảo trì ngắn — đều vô nghĩa.
 *
 *   node scripts/crawl/test-normalize.mjs
 *
 * BÀI 1 — ỔN ĐỊNH GIỮA HAI LẦN CRAWL
 *   Crawl cùng một URL hai lần cách nhau vài giây. Hash phải giống hệt. Thất
 *   bại nghĩa là còn sót thứ gì đó thay đổi theo mỗi request: token CSRF, id
 *   ngẫu nhiên, khối "tin mới nhất", hay payload RSC chứa buildId.
 *
 * BÀI 2 — ỔN ĐỊNH QUA MỘT LẦN DEPLOY
 *   Không tự động hoá được, vì cần một lần deploy thật. Script lưu hash vào
 *   data/normalize-baseline.json; sau khi đội web deploy mà KHÔNG sửa nội dung,
 *   chạy lại với --check và nó so với mốc đã lưu.
 *
 *   node scripts/crawl/test-normalize.mjs            # ghi mốc
 *   node scripts/crawl/test-normalize.mjs --check    # so với mốc sau khi deploy
 *
 * Bài 2 quan trọng không kém bài 1: buildId của Next đổi mỗi lần build, và nó
 * nằm trong HTML. Chỉ bài 1 thì không bao giờ phát hiện ra.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { get, OK } from './lib/http.mjs'
import { normalizeHtml } from './lib/normalize.mjs'
import { hashOf } from './lib/chunk.mjs'

const CHECK = process.argv.includes('--check')
const BASELINE = 'data/normalize-baseline.json'

/** Mẫu thử phủ đủ các kiểu trang: văn xuôi, thẻ card, danh sách, trang chủ, query. */
const SAMPLE = [
  'https://fintech.hust.edu.vn/',
  'https://fintech.hust.edu.vn/about/welcome-message',
  'https://fintech.hust.edu.vn/about/board-of-deans',
  'https://fintech.hust.edu.vn/about/institute-council',
  'https://fintech.hust.edu.vn/academic/activity',
  'https://fintech.hust.edu.vn/research/r&d-funding-projects/cyber-clinic?user=student',
]

async function hashOne(url, lang = 'en') {
  const res = await get(url, { lang })
  if (res.state !== OK) return { url, lang, error: `${res.state} ${res.status} ${res.error ?? ''}`.trim() }
  const { text } = normalizeHtml(res.body)
  return { url, lang, hash: hashOf(text), length: text.length }
}

async function main() {
  console.log('BAI 1 — on dinh giua hai lan crawl\n')
  const first = []
  for (const url of SAMPLE) first.push(await hashOne(url))
  // Cách nhau vài giây để rơi vào một request khác hẳn, không phải cache.
  await new Promise((r) => setTimeout(r, 3000))
  const second = []
  for (const url of SAMPLE) second.push(await hashOne(url))

  let failed = 0
  for (let i = 0; i < SAMPLE.length; i++) {
    const a = first[i]
    const b = second[i]
    const path = new URL(SAMPLE[i]).pathname + (new URL(SAMPLE[i]).search || '')
    if (a.error || b.error) {
      console.log(`  BO QUA  ${path} — ${a.error ?? b.error}`)
      continue
    }
    const same = a.hash === b.hash
    if (!same) failed++
    console.log(
      `  ${same ? 'DAT   ' : 'HONG  '} ${path.padEnd(52)} ${a.hash.slice(0, 12)} ${
        same ? '' : '!= ' + b.hash.slice(0, 12)
      }`
    )
  }

  if (failed) {
    console.log(`\n${failed} trang KHONG on dinh giua hai lan crawl.`)
    console.log('Con sot thu gi do doi theo moi request. Xem lai CHROME_SELECTORS trong normalize.mjs.')
    process.exitCode = 1
    return
  }
  console.log('\nBai 1 DAT — toan bo mau thu cho hash giong het qua hai lan crawl.')

  console.log('\nBAI 2 — on dinh qua mot lan deploy')
  const current = Object.fromEntries(first.filter((r) => r.hash).map((r) => [r.url, r.hash]))

  if (!CHECK) {
    await writeFile(BASELINE, JSON.stringify({ saved_at: new Date().toISOString(), hashes: current }, null, 2) + '\n')
    console.log(`  Da ghi moc vao ${BASELINE}.`)
    console.log('  Sau khi doi web deploy mà KHONG sua noi dung, chay lai voi --check.')
    return
  }

  let base
  try {
    base = JSON.parse(await readFile(BASELINE, 'utf-8'))
  } catch {
    console.log(`  Chua co ${BASELINE}. Chay khong co --check truoc de ghi moc.`)
    process.exitCode = 1
    return
  }

  let drift = 0
  for (const [url, hash] of Object.entries(current)) {
    const old = base.hashes[url]
    if (!old) continue
    if (old !== hash) drift++
    console.log(`  ${old === hash ? 'DAT   ' : 'DOI   '} ${new URL(url).pathname}`)
  }
  console.log(
    drift
      ? `\n${drift} trang doi hash. Neu noi dung khong sua thi normalize dang bat phai thu gi do cua ban build (buildId, hash asset...).`
      : `\nBai 2 DAT — hash khong doi qua lan deploy (moc ghi ${base.saved_at}).`
  )
  if (drift) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
