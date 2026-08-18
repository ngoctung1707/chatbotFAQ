/**
 * Muc 1.1 — tach data/chunks_all.jsonl lam hai file theo CHINH SACH CAP NHAT.
 * Chay mot lan: `node scripts/split-chunks.mjs`
 *
 * chunks_all.jsonl duoc giu nguyen lam ban goc, khong sua, khong xoa.
 *
 * chunks_frozen.jsonl — job cron KHONG co quyen ghi vao file nay. Day la diem
 * mau chot: "khong sua doi" tro thanh dam bao vat ly thay vi mot co metadata ma
 * mot dong code loi co the pha.
 *
 * Hai tieu chi dong bang, doc lap nhau:
 *
 *   1. source === 'pdf' — 379 chunk tu bao cao VDER 2024/2025, nam tren dung 2
 *      URL. Khong crawl lai duoc vi chung den tu PDF.
 *
 *   2. domain !== 'fintech.hust.edu.vn' — 26 chunk tren 4 domain ngoai:
 *        ecotech.bkfin.tech (19) — site tinh cua hoi thao ECOTECH 2025 da dien ra
 *        soict.hust.edu.vn  (4)  — trang ho so giang vien cua vien khac
 *        sem.hust.edu.vn    (2)  — nhu tren
 *        www.facebook.com   (1)  — khong crawl duoc, va noi dung la mot cau viet tay
 *      Rang buoc cua du an la chi crawl fintech.hust.edu.vn. Ngoai ra day la site
 *      cua nguoi khac: layout doi luc nao khong biet, va van dem item toi thieu
 *      o muc 2.6 khong phu duoc 4 thiet ke site khac nhau.
 */
import { readFile, writeFile } from 'node:fs/promises'

const SRC = 'data/chunks_all.jsonl'
const OWN_DOMAIN = 'fintech.hust.edu.vn'

const parse = (t) =>
  t.split(/\r?\n/).map((l, i) => ({ l: l.trim(), n: i + 1 }))
    .filter(({ l }) => l)
    .map(({ l, n }) => {
      try { return JSON.parse(l) } catch (e) { throw new Error(`${SRC} dong ${n}: ${e}`) }
    })

const domainOf = (u) => { try { return new URL(u).hostname } catch { return null } }

const rows = parse(await readFile(SRC, 'utf-8'))
const frozen = [], live = []
for (const r of rows) {
  const d = domainOf(r.url)
  ;(r.source === 'pdf' || d !== OWN_DOMAIN ? frozen : live).push(r)
}

const dump = (rs) => rs.map((r) => JSON.stringify(r)).join('\n') + '\n'
await writeFile('data/chunks_frozen.jsonl', dump(frozen))
await writeFile('data/chunks_live.jsonl', dump(live))

const urls = (rs) => new Set(rs.map((r) => r.url)).size
console.log(`doc  ${rows.length} chunk tu ${SRC}`)
console.log(`  frozen : ${frozen.length} chunk / ${urls(frozen)} URL -> data/chunks_frozen.jsonl`)
console.log(`  live   : ${live.length} chunk / ${urls(live)} URL -> data/chunks_live.jsonl`)
if (frozen.length + live.length !== rows.length) throw new Error('mat chunk khi tach!')
