/**
 * Mục 3.4 và 3.6 — phát hiện route mới, và hàng chờ duyệt.
 *
 * Ba nguồn phát hiện, xếp theo độ tin cậy:
 *
 *  1. Cây route trong repo. Chắc chắn nhất và miễn phí. Đây là nguồn DUY NHẤT
 *     thấy được route tĩnh mà lập trình viên vừa thêm — API không biết gì về
 *     chúng, và nếu route mới chưa được gắn vào menu thì crawl link cũng không
 *     thấy.
 *
 *  2. Danh sách slug từ API. Với nội dung CMS thì route mới tự vào qua nguồn
 *     json-* rồi, nên ở đây chỉ để đối chiếu.
 *
 *  3. Link nội bộ nhặt được trong lúc crawl. Lưới an toàn.
 *
 * Cố ý KHÔNG dùng cách phổ biến là BFS từ trang chủ làm nguồn chính. Section
 * "Our Projects" chốt cứng `limit: 4`, nên một crawler đi theo link sẽ vĩnh
 * viễn chỉ thấy 4 giải pháp dù CMS có bao nhiêu — và không báo lỗi gì cả.
 *
 * Route mới KHÔNG tự động vào kho. Nó vào hàng chờ để người gán `collection`,
 * vì nhãn đó quyết định context header lúc embed, và gán sai thì hỏng truy hồi
 * mà không có triệu chứng nào.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const APP_DIR = 'src/app/(frontend)'
const PENDING_PATH = 'data/pending-routes.json'

/** Route không bao giờ đưa vào kho, bất kể phát hiện được ở đâu. */
const IGNORE = [
  /^\/chatbot(\/|$)/,
  /^\/error$/,
  /^\/api(\/|$)/,
  /^\/payload(\/|$)/,
  /\/pages\/\[/, // trang phân trang, nội dung đã thuộc collection cha
]

const isIgnored = (route) => IGNORE.some((re) => re.test(route))

/** Quét cây route: mọi thư mục có page.tsx là một route. */
export async function scanRepoRoutes(dir = APP_DIR) {
  const routes = []
  async function walk(current, route) {
    let entries
    try {
      entries = await readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    if (entries.some((e) => e.isFile() && e.name === 'page.tsx')) routes.push(route || '/')
    for (const e of entries) {
      if (!e.isDirectory()) continue
      // (group) của Next không tạo ra đoạn URL nào.
      const seg = e.name.startsWith('(') && e.name.endsWith(')') ? '' : `/${e.name}`
      await walk(path.join(current, e.name), route + seg)
    }
  }
  await walk(dir, '')
  return routes.filter((r) => !isIgnored(r)).sort()
}

/** Chuẩn hoá URL để so sánh: bỏ fragment, bỏ dấu / cuối, giữ query nếu có nghĩa. */
export function normalizeUrl(u, { keepQuery = false } = {}) {
  try {
    const url = new URL(u)
    url.hash = ''
    if (!keepQuery) url.search = ''
    let s = url.toString()
    if (s.endsWith('/') && url.pathname !== '/') s = s.slice(0, -1)
    return s
  } catch {
    return null
  }
}

/**
 * Một URL đã được phủ bởi bất cứ thứ gì trong registry hay chưa.
 *
 * Bốn nguồn phủ, và bỏ sót nguồn nào cũng làm hàng chờ đầy dương tính giả — mà
 * hàng chờ đầy rác thì người sẽ ngừng đọc nó, và route mới thật sự sẽ lọt.
 *
 *  1. `html_sources` — khớp URL tuyệt đối.
 *  2. `pending_sources` và `out_of_scope` — đã có người quyết định rồi.
 *  3. `url_template` KHÔNG có placeholder (publications, members) — cũng là URL
 *     tuyệt đối, chỉ nằm ở nguồn JSON thay vì HTML.
 *  4. `url_template` CÓ placeholder — khớp theo tiền tố và hậu tố, và đoạn ở
 *     giữa không được chứa dấu `/`.
 *  5. `frozen_urls` — nội dung đóng băng, cố ý không crawl.
 */
export function makeKnownMatcher(registry) {
  const exact = new Set()
  for (const s of registry.html_sources) exact.add(normalizeUrl(s.url))
  for (const s of [...(registry.pending_sources ?? []), ...(registry.out_of_scope ?? [])]) {
    if (s.url) exact.add(normalizeUrl(s.url))
  }
  for (const u of registry.frozen_urls ?? []) exact.add(normalizeUrl(u))

  const patterns = []
  for (const s of registry.json_sources) {
    const t = s.url_template
    if (!t) continue
    if (!t.includes('{')) {
      exact.add(normalizeUrl(t))
      continue
    }
    const [head, tail] = t.split(/\{[a-zA-Z]+\}/)
    patterns.push({ head, tail: tail ?? '' })
  }

  return function isKnown(url, { prefixOk = false } = {}) {
    const n = normalizeUrl(url)
    if (!n) return true // URL không parse được thì không đưa vào hàng chờ
    if (exact.has(n)) return true
    // Route ĐỘNG như /vietnam-digital-economy-review/[year]: không có URL cụ thể
    // nào để so, nhưng nếu đã biết .../2024 và .../2025 thì route cha đó rõ ràng
    // đã được phủ. Chỉ bật cờ này cho route động, không dùng cho link thật.
    if (prefixOk) {
      const parent = n.slice(0, n.lastIndexOf('/') + 1)
      for (const k of exact) if (k.startsWith(parent)) return true
    }
    return patterns.some(({ head, tail }) => {
      if (!n.startsWith(head) || !n.endsWith(tail)) return false
      const middle = n.slice(head.length, n.length - (tail.length || 0))
      return middle.length > 0 && !middle.includes('/')
    })
  }
}

/** Đối chiếu route trong repo với registry. */
export function findNewRoutes(repoRoutes, registry) {
  const base = registry.base_url
  const isKnown = makeKnownMatcher(registry)
  const out = []
  for (const route of repoRoutes) {
    const isDynamic = route.includes('[')
    // Route động được đại diện bằng một URL mẫu để đối chiếu với template.
    const probe = base + route.replace(/\[[^\]]+\]/g, 'x')
    if (isKnown(probe, { prefixOk: isDynamic })) continue
    out.push({ route, url: normalizeUrl(base + route), dynamic: isDynamic })
  }
  return out
}

/** Nhặt link nội bộ từ một trang đã crawl — lưới an toàn của mục 3.4. */
export function collectInternalLinks($, base) {
  const host = new URL(base).hostname
  const found = new Set()
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    let u
    try {
      u = new URL(href, base)
    } catch {
      return
    }
    if (u.hostname !== host) return
    if (/\.(pdf|jpe?g|png|gif|svg|zip|docx?|pptx?|xlsx?)$/i.test(u.pathname)) return
    const norm = normalizeUrl(u.toString())
    if (norm && !isIgnored(u.pathname)) found.add(norm)
  })
  return found
}

/**
 * Ghi hàng chờ (3.6).
 *
 * Route khớp một template đã khai thì tự duyệt được — chúng đã vào kho qua
 * nguồn json-*. Phần còn lại nằm chờ người gán `collection` và
 * `selector_group`, và cho tới lúc đó KHÔNG có chunk nào được sinh ra từ chúng.
 */
export async function writePending(items, pathOut = PENDING_PATH) {
  const payload = {
    generated_at: new Date().toISOString(),
    note:
      'Route phat hien duoc nhung chua co trong registry. Gan collection va ' +
      'selector_group roi chuyen sang html_sources thi chung moi vao kho.',
    routes: items,
  }
  await writeFile(pathOut, JSON.stringify(payload, null, 2) + '\n')
  return payload
}

export async function readRegistry(p = 'data/sources.registry.json') {
  return JSON.parse(await readFile(p, 'utf-8'))
}
