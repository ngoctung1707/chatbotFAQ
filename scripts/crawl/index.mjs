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
import { fetchJsonSource, docsToRecords } from './lib/json-source.mjs'
import { fetchHtmlSourceAllLangs } from './lib/html-source.mjs'
import { makeChunks, chunksFromGroups, slugKey } from './lib/chunk.mjs'
import { makeStatsChunk } from './lib/stats.mjs'
import { loadState, saveState, entryOf, markSeen, markMissing, GRACE_RUNS } from './lib/state.mjs'
import { diffChunks, chunkMap, latestUpdatedAt, pageHash, planEmbedding } from './lib/diff.mjs'
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
const CACHE = 'data/embeddings.cache.jsonl'

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
  discovered: [],
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
  const langs = new Set(docs.map((d) => d.lang).filter(Boolean))
  const unique = langs.size > 1 ? docs.filter((d) => (d.lang ?? 'en') === 'en') : docs

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

async function loadCacheHashes() {
  try {
    const raw = await readFile(CACHE, 'utf-8')
    const set = new Set()
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      const h = JSON.parse(line).hash
      if (h) set.add(h)
    }
    return set
  } catch {
    return new Set()
  }
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY, 'utf-8'))
  const state = await loadState()
  const cached = await loadCacheHashes()
  state.run = (state.run ?? 0) + 1

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
      // Giữ nguyên mọi thứ: state không đổi, chunk cũ được mang sang nguyên vẹn.
      allChunks.push(...dedup(previous.get(s.source_id) ?? []))
      line.note = 'giu nguyen chunk cu'
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

  // Mục 3.3 — chunk nào tra được cache thì không phải chạy model.
  const uniqueNeed = [...new Map(needEmbed.map((c) => [c.chunk_hash, c])).values()]
  const { fromCache, toEmbed } = planEmbedding(uniqueNeed, cached)

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
  const checked = report.sources.filter((r) => ['ok', 'skipped'].includes(r.state))
  const changed = checked.filter((r) => (r.added ?? 0) + (r.changed ?? 0) > 0)
  const rate = checked.length ? changed.length / checked.length : 0
  report.change_rate = Number(rate.toFixed(3))
  if (rate > MAX_CHANGE_RATE && state.run > 1) {
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

  report.totals = {
    chunks: allChunks.length,
    need_embed: uniqueNeed.length,
    from_cache: fromCache.length,
    to_embed: toEmbed.length,
    to_remove: toRemove.length,
    discovered: report.discovered.length,
  }
  report.finished_at = new Date().toISOString()

  if (!DRY_RUN) {
    await writeFile(OUT, allChunks.map((c) => JSON.stringify(c)).join('\n') + '\n')
    await writeFile(
      PLAN,
      JSON.stringify(
        { ...report, to_embed: toEmbed.map((c) => c.chunk_id), to_remove: toRemove },
        null,
        2
      ) + '\n'
    )
    await saveState(state)
    if (report.discovered.length) await writePending(report.discovered)
  }

  console.log(`\nlan chay #${state.run}`)
  console.log(`  chunk tong        ${allChunks.length}`)
  console.log(`  moi/doi so voi lan truoc  ${uniqueNeed.length}`)
  console.log(`    da co trong cache       ${fromCache.length}`)
  console.log(`    chua co trong cache     ${toEmbed.length}`)
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
    console.log(`\nROUTE MOI CHO DUYET (${report.discovered.length}) -> data/pending-routes.json`)
    for (const d of report.discovered.slice(0, 12)) console.log(`  [${d.found_by}] ${d.route ?? d.url}`)
    if (report.discovered.length > 12) console.log(`  ... con ${report.discovered.length - 12}`)
  }
  console.log(DRY_RUN ? '\n(dry-run — khong ghi file nao)' : `\nda ghi ${OUT}, ${PLAN}, crawl_state.json`)
  if (report.broken.length || report.errors.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
