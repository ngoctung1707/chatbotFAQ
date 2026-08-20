/**
 * Bộ điều phối — pha A của job hàng tuần.
 *
 * Pha này KHÔNG nạp model và không đụng vào chỉ mục: nó đi lấy nội dung, cắt
 * chunk, băm, rồi SO với lần chạy trước để quyết định đúng những chunk nào phải
 * embed. Nhờ vậy nó chạy được trong giờ hành chính với chatbot vẫn phục vụ bình
 * thường — cửa sổ bảo trì chỉ dành cho pha B.
 *
 *   node scripts/crawl/index.mjs                 # crawl + diff + ghi kế hoạch
 *   node scripts/crawl/index.mjs --dry-run       # không ghi file nào
 *   node scripts/crawl/index.mjs --source=json-news
 *
 * Nguyên tắc xuyên suốt: KHÔNG BAO GIỜ để một lỗi biến thành "nội dung đã bị
 * xoá". Chỉ 404/410 mới là bằng chứng, và ngay cả nó cũng phải lặp lại hai lần
 * chạy liên tiếp mới được phép xoá.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fetchJsonSource, docsToRecords, collapseLangVariants } from './lib/json-source.mjs'
import { fetchHtmlSourceAllLangs } from './lib/html-source.mjs'
import { makeChunks, chunksFromGroups, slugKey } from './lib/chunk.mjs'
import { makeStatsChunk, makePersonnelChunk } from './lib/stats.mjs'
import {
  loadState,
  saveState,
  entryOf,
  markSeen,
  markMissing,
  markUnknown,
  GRACE_RUNS,
  FAIL_RUNS,
} from './lib/state.mjs'
import { diffChunks, chunkMap, latestUpdatedAt, pageHash } from './lib/diff.mjs'
import { scanRepoRoutes, findNewRoutes, writePending, makeKnownMatcher } from './lib/discover.mjs'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const ONLY = args.find((a) => a.startsWith('--source='))?.split('=')[1] ?? null

/**
 * Mục 5.2 — nếu quá tỉ lệ này số nguồn cùng báo "đã đổi" trong một lần chạy thì
 * gần như chắc chắn bộ normalize hỏng hoặc site đổi template, chứ không phải
 * nội dung thật đổi. Thiếu van này, một lần đội web sửa CSS sẽ khiến job embed
 * lại toàn bộ kho lúc 2h sáng và kéo bảo trì từ 30 giây lên 30 phút.
 */
const MAX_CHANGE_RATE = 0.30
const FORCE = args.includes('--force')

const REGISTRY = 'data/sources.registry.json'
const OUT = 'data/crawl-output.jsonl'
const PLAN = 'data/crawl-plan.json'

const NL = String.fromCharCode(10)
const now = new Date().toISOString()
const report = {
  started_at: now,
  finished_at: null,
  dry_run: DRY_RUN,
  sources: [],
  totals: {},
  errors: [],
  gone: [],
  broken: [],
  // Nguồn đã hỏng liên tiếp đủ FAIL_RUNS lần — không còn là sự cố nhất thời.
  stale: [],
  discovered: [],
  // source_id khi chạy tay `--source=`, null khi là lần chạy đầy đủ. Trang admin
  // cần biết để không trình bày một lần chạy một nguồn như thể là lần chạy tuần.
  partial: null,
}

const fail = (source_id, message) => report.errors.push({ source_id, message })

/** Đoạn cuối của path, đã decode — định danh duy nhất của một trang. */
function urlKey(url) {
  try {
    const seg = decodeURIComponent(new URL(url).pathname).split('/').filter(Boolean).pop()
    return seg ? slugKey(seg) : ''
  } catch {
    return ''
  }
}

function chunksFromPerDoc(source, records) {
  const out = []
  for (const r of records) {
    if (r.error) {
      fail(source.source_id, r.error)
      continue
    }
    out.push(
      ...makeChunks({
        source_id: source.source_id,
        // Khoá lấy từ slug URL chứ không từ title: hai bài news khác nhau có thể
        // có 40 ký tự đầu của title slugify ra giống hệt.
        key: urlKey(r.url) || slugKey(r.title ?? r.doc_id),
        url: r.url,
        lang: r.lang,
        title: r.title,
        section: r.title,
        collection: r.collection,
        page_type: r.page_type,
        published_at: r.published_at,
        text: r.text,
      })
    )
  }
  return out
}

/**
 * Nguồn "một trang, nhiều mục". Publications cắt theo `year` — thêm một công bố
 * năm 2025 chỉ chạm chunk 2025, các năm cũ giữ nguyên hash và dùng lại vector.
 */
function chunksFromAggregate(source, docs) {
  // Gộp bản dịch, KHÔNG lọc theo ngôn ngữ. Bản trước giữ lại `lang === 'en'`
  // khi collection có lẫn hai thứ tiếng, nên một mục chỉ có tiếng Việt — bài
  // admin vừa thêm mà chưa dịch — không có bản nào để giữ và biến mất câm lặng.
  // Xem chú thích dài ở `collapseLangVariants`.
  const unique = collapseLangVariants(docs)

  const groups = new Map()
  for (const d of unique) {
    const year = d.year ?? (d.publishedAt ? new Date(d.publishedAt).getFullYear() : null)
    const key = source.payload_collection === 'publications' && year ? String(year) : 'all'
    const line = [d.title ?? d.name, d.authors, d.role, d.school, d.abstract]
      .filter((x) => typeof x === 'string' && x.trim())
      .join(' — ')
    if (!line) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(line)
  }

  const out = []
  for (const [key, items] of [...groups].sort((a, b) => b[0].localeCompare(a[0]))) {
    const section = key === 'all' ? source.collection : `${source.collection} ${key}`
    out.push(
      ...makeChunks({
        source_id: source.source_id,
        key: key === 'all' ? '' : key,
        url: source.url_template ?? source.endpoint,
        // Nhãn CỐ ĐỊNH, không phải khai báo về nội dung: chunk gộp có thể trộn
        // cả hai thứ tiếng. `lang` nằm trong chunk_id, nên suy nó ra từ dữ liệu
        // sẽ khiến id đổi mỗi khi tỉ lệ ngôn ngữ trong collection đổi — tức là
        // xoá-và-thêm lại toàn bộ chunk của nguồn mà không thêm thông tin nào.
        lang: 'en',
        title: section,
        section,
        collection: source.collection,
        page_type: source.page_type,
        text: items.join('\n'),
      })
    )
  }
  return out
}

async function runJsonSource(source, entry) {
  const res = await fetchJsonSource(source)
  if (!res.ok) {
    fail(source.source_id, res.error)
    return { state: 'unknown', chunks: [] }
  }

  // Tầng lọc thô (3.2). `updatedAt` chỉ dùng để BỎ QUA, không bao giờ để kết
  // luận "có thay đổi" — nó bị chạm cả khi chỉ đổi ảnh bìa.
  const latest = latestUpdatedAt(res.docs)
  if (latest && entry.updated_at && latest === entry.updated_at) {
    return { state: 'skipped', chunks: [], latest, docs: res.docs.length }
  }

  const perDoc = source.url_template?.includes('{')
  const chunks = perDoc
    ? chunksFromPerDoc(source, docsToRecords(source, res.docs))
    : chunksFromAggregate(source, res.docs)

  const stats = makeStatsChunk(source.payload_collection, res.docs, source)
  if (stats) chunks.push(stats)

  return { state: 'ok', chunks, latest, docs: res.docs.length, pages: res.pages }
}

async function runHtmlSource(source, entry) {
  const results = await fetchHtmlSourceAllLangs(source)
  const chunks = []
  const links = new Set()
  const hashes = {}
  let ok = 0
  let gone = 0
  let broken = 0

  for (const r of results) {
    if (r.state === 'gone') {
      gone++
      report.gone.push({ source_id: source.source_id, url: r.url, lang: r.lang })
      continue
    }
    if (r.state === 'broken') {
      broken++
      report.broken.push({ source_id: source.source_id, lang: r.lang, error: r.error })
      continue
    }
    if (r.state !== 'ok') {
      fail(source.source_id, `${r.lang}: ${r.error}`)
      continue
    }
    ok++
    for (const l of r.links) links.add(l)
    hashes[r.lang] = pageHash(r.text)
    chunks.push(
      ...chunksFromGroups(
        {
          source_id: source.source_id,
          key: '',
          url: source.url,
          lang: r.lang,
          title: source.title,
          section: source.title,
          collection: source.collection,
          page_type: source.page_type,
        },
        r.groups
      )
    )
  }

  // Selector vỡ ở BẤT KỲ ngôn ngữ nào cũng đủ để không tin lần chạy này. Ghi đè
  // bằng một nửa dữ liệu còn tệ hơn giữ nguyên bản cũ.
  if (broken) return { state: 'broken', chunks: [], links }
  if (!ok && gone) return { state: 'gone', chunks: [], links }
  if (!ok) return { state: 'unknown', chunks: [], links }

  // Tầng lọc thô cho HTML (3.2): mọi ngôn ngữ đều trùng page_hash cũ -> bỏ qua.
  const same =
    Object.keys(hashes).length > 0 &&
    Object.entries(hashes).every(([lang, h]) => entry.page_hash?.[lang] === h)
  if (same) return { state: 'skipped', chunks: [], links, hashes }

  return { state: 'ok', chunks, links, hashes }
}

/**
 * Ghép kết quả của một lần chạy `--source=X` vào kho đang có.
 *
 * ─── VÌ SAO CẦN HÀM NÀY ──────────────────────────────────────────────────────
 *
 * `--source=X` chỉ lọc danh sách nguồn, nên `allChunks` cuối vòng lặp chứa ĐÚNG
 * chunk của X. Trước đây bước ghi đem thẳng mảng đó đè lên `crawl-output.jsonl`
 * — tức là xoá sạch chunk của 27 nguồn còn lại.
 *
 * Và lần chạy đầy đủ kế tiếp KHÔNG cứu được: các nguồn khác báo `skipped` (state
 * của chúng có đổi gì đâu) nên đi lấy chunk cũ từ chính file vừa bị xoá. Kho tụt
 * xuống còn vài chục chunk, van 20% ở pha C chặn lại, và chatbot đứng nguyên cho
 * tới khi có người crawl lại toàn bộ.
 *
 * Giữ đúng vị trí cũ của nguồn trong file thay vì đẩy xuống cuối: thứ tự không
 * ảnh hưởng tới truy hồi, nhưng giữ nguyên thì `diff` giữa hai lần chạy đọc được
 * bằng mắt.
 */
function mergeIntoPrevious(previous, only, fresh) {
  const out = []
  let replaced = false
  for (const [source_id, chunks] of previous) {
    if (source_id === only) {
      out.push(...fresh)
      replaced = true
    } else {
      out.push(...chunks)
    }
  }
  if (!replaced) out.push(...fresh)
  return out
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY, 'utf-8'))
  const state = await loadState()
  // Chạy tay một nguồn không phải một "lần chạy" của lịch tuần: nó không kiểm
  // hết kho, nên đếm nó vào sẽ làm sai số thứ tự lần chạy trong mọi báo cáo.
  if (!ONLY) state.run = (state.run ?? 0) + 1

  const sources = [...registry.json_sources, ...registry.html_sources].filter(
    (s) => !ONLY || s.source_id === ONLY
  )
  if (!sources.length) {
    console.error(ONLY ? `khong co nguon nao ten "${ONLY}"` : 'registry rong')
    process.exit(1)
  }

  // Chunk của lần chạy trước, để mang theo cho nguồn không đổi hoặc không kiểm
  // tra được. crawl-output.jsonl phải luôn là TOÀN BỘ kho hiện hành, không phải
  // phần chênh lệch — nếu không, một tuần yên ả sẽ ghi đè nó bằng file rỗng.
  const previous = new Map()
  try {
    for (const line of (await readFile(OUT, 'utf-8')).split(NL)) {
      if (!line.trim()) continue
      const c = JSON.parse(line)
      if (!previous.has(c.source_id)) previous.set(c.source_id, [])
      previous.get(c.source_id).push(c)
    }
  } catch {
    /* lần chạy đầu */
  }

  // Khử trùng lặp phải chạy TRƯỚC khi ghi state, không phải sau. Bản en và vi
  // của một section trang chủ có thể giống hệt nhau; nếu state ghi cả hai mà
  // file đầu ra chỉ giữ một, thì lần chạy sau mang sang thiếu đúng phần chênh
  // lệch đó — mỗi tuần rụng vài chunk mà không lỗi nào báo. Đo được: 414 -> 408
  // ngay ở lần chạy thứ hai.
  const seenHash = new Set()
  const dedup = (chunks) => {
    const out = []
    for (const c of chunks) {
      if (seenHash.has(c.chunk_hash)) continue
      seenHash.add(c.chunk_hash)
      out.push(c)
    }
    return out
  }

  const allChunks = []
  const needEmbed = []
  const toRemove = []
  const allLinks = new Set()

  for (const s of sources) {
    if (s.kind === 'json' && !s.url_template) {
      report.sources.push({ source_id: s.source_id, state: 'skipped', reason: 'chua co url_template' })
      continue
    }

    const entry = entryOf(state, s.source_id)
    const r = s.kind === 'json' ? await runJsonSource(s, entry) : await runHtmlSource(s, entry)
    for (const l of r.links ?? []) allLinks.add(l)

    let line = { source_id: s.source_id, kind: s.kind, state: r.state }

    if (r.state === 'gone') {
      // Luật ân hạn (3.5). Chỉ 404/410 mới tới được đây.
      const mayDelete = markMissing(entry, now)
      line.missing_runs = entry.missing_runs
      if (mayDelete) {
        toRemove.push(...Object.keys(entry.chunks))
        entry.chunks = {}
        line.deleted = true
      } else {
        line.note = `vang mat ${entry.missing_runs}/${GRACE_RUNS} lan — chua xoa`
      }
    } else if (r.state === 'broken' || r.state === 'unknown') {
      // Giữ nguyên mọi thứ: chunk cũ được mang sang nguyên vẹn, updated_at và
      // page_hash không đổi nên lần sau vẫn crawl lại nguồn này.
      allChunks.push(...dedup(previous.get(s.source_id) ?? []))
      const persistent = markUnknown(entry)
      line.fail_runs = entry.fail_runs
      line.note = persistent
        ? `HONG ${entry.fail_runs} lan chay lien tiep — giu nguyen chunk cu`
        : `giu nguyen chunk cu (hong ${entry.fail_runs}/${FAIL_RUNS})`
      if (persistent) report.stale.push({ source_id: s.source_id, fail_runs: entry.fail_runs })
    } else if (r.state === 'skipped') {
      markSeen(entry, now)
      allChunks.push(...dedup(previous.get(s.source_id) ?? []))
      line.note = 'khong doi — bo qua truoc khi cat chunk'
    } else {
      markSeen(entry, now)
      const fresh = dedup(r.chunks)
      const d = diffChunks(entry.chunks, fresh)
      allChunks.push(...fresh)
      needEmbed.push(...d.needEmbed)
      toRemove.push(...d.removed)
      entry.chunks = chunkMap(fresh)
      if (r.latest) entry.updated_at = r.latest
      if (r.hashes) entry.page_hash = r.hashes
      line = { ...line, added: d.added.length, changed: d.changed.length, unchanged: d.unchanged.length, removed: d.removed.length }
    }

    state.sources[s.source_id] = entry
    report.sources.push(line)
    const bits = line.added != null ? `+${line.added} ~${line.changed} =${line.unchanged} -${line.removed}` : line.state
    process.stdout.write(`  ${s.source_id.padEnd(40)} ${bits}\n`)
  }

  // Mục luục nhân sự — dựng SAU vòng lặp vì nó tổng hợp từ hai nguồn.
  //
  // Phải loại bản mang-sang trước: chunk này mang `source_id` của trang
  // researchers-and-assistants, nên khi nguồn đó bị bỏ qua ở tầng thô thì bản cũ
  // đã được đưa vào `allChunks` rồi. Không loại thì có hai chunk trùng
  // `chunk_id`, và bản cũ có thể mang con số cũ của một nhóm vừa đổi ở trang kia.
  const personnelIdx = allChunks.findIndex((c) => c.chunk_id === 'stats_personnel_c01')
  if (personnelIdx >= 0) allChunks.splice(personnelIdx, 1)
  const personnel = makePersonnelChunk(allChunks)
  if (personnel) allChunks.push(personnel)

  // Mục 3.3 — "mới hoặc đã đổi so với lần crawl trước". Khử trùng theo
  // `chunk_hash` vì hai nguồn có thể sinh ra cùng một đoạn chữ.
  //
  // Cố ý KHÔNG tự chia con số này thành "có trong cache" / "phải chạy model" ở
  // đây. Khoá của cache là băm của CHUỖI ĐƯỢC EMBED — `content` cộng thêm header
  // `[nhãn — BK Fintech, ...]` mà `embeddedText()` ghép vào — chứ không phải
  // `chunk_hash` vốn chỉ băm `content`. Bản trước so hai thứ đó với nhau và
  // không bao giờ khớp: đo trên kho thật được 0/415 hit, trong khi khoá đúng cho
  // 415/415. Hậu quả là trang admin luôn hiện "lấy được từ cache: 0" và mâu
  // thuẫn với log của job.
  //
  // Không sửa bằng cách chép `embeddedText()` sang đây: file này chạy bằng
  // `node` thuần nên không import được module TypeScript, mà chép ra bản thứ hai
  // thì đúng vào cái bẫy mà `src/lib/chatbot/embeddedText.ts` sinh ra để tránh —
  // lệch một ký tự là vector nằm sai không gian, không lỗi, không cảnh báo.
  // Câu hỏi về cache thuộc về `cache-report.ts`, nơi có sẵn định nghĩa đúng và
  // chạy ngay sau pha A.
  const uniqueNeed = [...new Map(needEmbed.map((c) => [c.chunk_hash, c])).values()]

  // Mục 3.4 — phát hiện route mới.
  const repoRoutes = await scanRepoRoutes()
  const newRoutes = findNewRoutes(repoRoutes, registry)
  const isKnown = makeKnownMatcher(registry)
  const linkOnly = [...allLinks].filter((u) => !isKnown(u) && !newRoutes.some((r) => r.url === u))
  report.discovered = [
    ...newRoutes.map((r) => ({ ...r, found_by: 'repo-scan' })),
    ...linkOnly.map((url) => ({ url, found_by: 'internal-link' })),
  ]

  // MUC 5.2 — van chong "moi thu deu doi".
  //
  // Van nay do TI LE nguon bao da doi, nen no vo nghia khi chi kiem mot nguon:
  // ti le chi co the la 0 hoac 1, va 1 > 0.30 nghia la moi lan chay tay tren
  // mot nguon that su co thay doi deu bi huy voi ly do "vuot nguong 30%".
  const checked = report.sources.filter((r) => ['ok', 'skipped'].includes(r.state))
  const changed = checked.filter((r) => (r.added ?? 0) + (r.changed ?? 0) > 0)
  const rate = checked.length ? changed.length / checked.length : 0
  report.change_rate = Number(rate.toFixed(3))
  if (rate > MAX_CHANGE_RATE && state.run > 1 && !ONLY) {
    const pct = (rate * 100).toFixed(0)
    console.error(`${NL}HUY: ${changed.length}/${checked.length} nguon (${pct}%) cung bao da doi.`)
    console.error('Vuot nguong 30% — gan nhu chac chan la normalize hong hoac site doi template.')
    console.error('KHONG ghi ke hoach, KHONG dung toi chi muc. Chay lai voi --force neu that su co y.')
    if (!FORCE) {
      report.aborted = 'change_rate'
      await writeFile(PLAN, JSON.stringify(report, null, 2) + NL)
      process.exit(1)
    }
    console.error('(--force: bo qua van 5.2)')
  }

  // `crawl-output.jsonl` PHAI luon la toan bo kho song. Voi --source= thi
  // allChunks chi la mot nguon, nen phai ghep vao ban cu thay vi de len.
  const outChunks = ONLY ? mergeIntoPrevious(previous, ONLY, allChunks) : allChunks
  if (ONLY) {
    report.partial = ONLY
    if (!previous.size) {
      console.error(`\nCANH BAO: ${OUT} dang rong hoac chua co.`)
      console.error(`  Ghi ra day se chi co chunk cua "${ONLY}", khong phai toan kho.`)
      console.error('  Chay day du mot lan truoc khi dung --source=.')
    }
  }

  report.totals = {
    chunks: outChunks.length,
    chunks_this_source: ONLY ? allChunks.length : undefined,
    need_embed: uniqueNeed.length,
    to_remove: toRemove.length,
    discovered: report.discovered.length,
  }
  report.finished_at = new Date().toISOString()

  if (!DRY_RUN) {
    await writeFile(OUT, outChunks.map((c) => JSON.stringify(c)).join('\n') + '\n')
    await writeFile(
      PLAN,
      JSON.stringify(
        { ...report, to_remove: toRemove },
        null,
        2
      ) + '\n'
    )
    await saveState(state)
    // Cung ly do nhu tren: mot lan chay tay chi thay link cua dung mot nguon,
    // nen ghi de danh sach cho duyet se lam mat route ma cac nguon khac tim ra.
    if (report.discovered.length && !ONLY) await writePending(report.discovered)
  }

  console.log(ONLY ? `\nchay tay mot nguon: ${ONLY} (lan chay van la #${state.run})` : `\nlan chay #${state.run}`)
  if (ONLY) {
    console.log(`  chunk cua nguon nay  ${allChunks.length}`)
    console.log(`  giu nguyen tu cac nguon khac  ${outChunks.length - allChunks.length}`)
  }
  console.log(`  chunk tong        ${outChunks.length}`)
  console.log(`  moi/doi so voi lan truoc  ${uniqueNeed.length}`)
  // Con so o tren tra loi "co gi doi so voi LAN CRAWL TRUOC". No KHONG phai do
  // dai cua so bao tri: store van co the thieu vector cho nhung chunk khong he
  // doi (vi du lan dau chuyen sang pipeline moi). Con so co tham quyen la cua
  // cache-report.ts, von so toan bo kho voi cache.
  console.log(`  (do dai cua so bao tri: xem npx tsx scripts/crawl/cache-report.ts)`)
  console.log(`  can xoa           ${toRemove.length}`)
  if (report.broken.length) {
    console.log(`\nSELECTOR VO (${report.broken.length}) — giu nguyen chunk cu:`)
    for (const b of report.broken) console.log(`  ${b.source_id} [${b.lang}] ${b.error}`)
  }
  if (report.gone.length) console.log(`\n404/410: ${report.gone.length} (an han ${GRACE_RUNS} lan chay)`)
  if (report.errors.length) {
    console.log(`\nLOI (${report.errors.length}):`)
    for (const e of report.errors) console.log(`  ${e.source_id}: ${e.message}`)
  }
  if (report.discovered.length) {
    console.log(
      ONLY
        ? `\nROUTE MOI THAY DUOC (${report.discovered.length}) — KHONG ghi de pending-routes.json khi chay tay mot nguon`
        : `\nROUTE MOI CHO DUYET (${report.discovered.length}) -> data/pending-routes.json`
    )
    for (const d of report.discovered.slice(0, 12)) console.log(`  [${d.found_by}] ${d.route ?? d.url}`)
    if (report.discovered.length > 12) console.log(`  ... con ${report.discovered.length - 12}`)
  }
  if (report.stale.length) {
    console.log(`\nNGUON DA NGUNG CAP NHAT (${report.stale.length}) — hong tu ${FAIL_RUNS} lan chay tro len:`)
    for (const s of report.stale) console.log(`  ${s.source_id}  (${s.fail_runs} lan lien tiep)`)
    console.log('  Chung dang phuc vu bang chunk cu. Can nguoi vao xem selector hoac URL.')
  }
  console.log(DRY_RUN ? '\n(dry-run — khong ghi file nao)' : `\nda ghi ${OUT}, ${PLAN}, crawl_state.json`)

  // ─── MA THOAT: HONG MOT NGUON KHONG DUOC PHEP HUY CA TUAN ──────────────────
  //
  // Ban truoc dat mã 1 khi co BAT KY nguon nao hong, va `run-weekly.sh` hieu
  // mã khac 0 la "dung lai, khong vao bao tri". Nghia la mot request trong so
  // ~47 request timeout luc 2h sang se vut bo ca 27 nguon con lai da cap nhat
  // dung. Va neu selector vo that su — kieu hong co xac suat cao nhat, vi doi
  // web doi markup luc nao khong bao — thi chi muc DONG BANG VINH VIEN, tuan
  // nao cung thoat mã 1, khong ai biet.
  //
  // Mia mai la pha A da xu ly tung nguon rat dung roi: giu nguyen chunk cu,
  // khong dung toi state, nen dau ra VAN LA MOT KHO HOP LE. Khong co ly do gi
  // de khong dem no di embed.
  //
  // Ba mức, tach bach:
  //
  //   0  sach
  //   2  co nguon hong nhung ket qua dung duoc -> B va C CU CHAY
  //   1  khong dung duoc lan chay nay (van 30% o tren, hoac ngoai le)
  //
  // Mã 2 van la khac 0 nen systemd đanh dau unit that bai va nguoi van thay.
  // Thu doi la HANH DONG, khong phai tin hieu: du lieu van chay, canh bao van
  // keu.
  const failed = report.sources.filter((s) => s.state === 'broken' || s.state === 'unknown').length
  // `errors` bat them mot truong hop ma `failed` khong thay: nguon co mot ngon
  // ngu lay duoc va mot ngon ngu timeout van tra ve 'ok', nhung kho lan nay
  // thieu mot nua. Do la du lieu khong day du chu khong phai nguon hong.
  if (failed || report.errors.length) {
    console.log(
      `\n${failed}/${report.sources.length} nguon khong kiem tra duoc` +
        (report.errors.length ? `, ${report.errors.length} loi le` : '') +
        ' — cac nguon con lai VAN duoc cap nhat va se di tiep sang pha B.'
    )
    process.exitCode = 2
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
