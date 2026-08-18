/**
 * Mục 1.2 — sinh data/sources.registry.json từ kho chunk hiện có.
 *
 * Registry là thứ điều khiển toàn bộ pipeline cập nhật: thêm một route mới =
 * thêm một entry, không sửa code. Một "source" ở đây là MỘT THỨ CRAWLER ĐI LẤY,
 * nên 83 URL đi đường JSON gom lại thành 9 entry theo collection, còn 24 URL
 * phải bóc từ HTML thì mỗi URL một entry.
 *
 * Nhóm đóng băng KHÔNG có mặt ở đây — chúng nằm trong chunks_frozen.jsonl và
 * không bao giờ được fetch. Registry chỉ chứa thứ sẽ bị đụng tới.
 *
 * Máy suy ra được: baseline_chunks, đếm từ chunks_live.jsonl.
 * Người phải quyết: nhãn collection, nhóm selector, min_items, keep_query.
 *
 * Chạy: node scripts/build-registry.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'

const BASE = 'https://fintech.hust.edu.vn'

// 9 collection công khai. has_drafts quyết định có gắn where[_status] hay không:
// gắn nhầm vào collection KHÔNG bật drafts thì Payload trả HTTP 400 chứ không
// phải 0 document, nên đây không phải cờ trang trí (xem mục 2.1).
//
// upcoming-events chưa có url_template vì chưa xác định trang nào render nó —
// cần điền trước khi bật crawl collection này.
const JSON_SOURCES = [
  ['news', 'news', true, '/news/{slug}', 'news'],
  ['courses', 'course', true, '/courses/{slug}', 'course'],
  // CHÚ Ý: solutions KHÔNG có trường slug. Route /solutions/[slug] tra cứu bằng
  // `where: { title: { equals: slug } }`, nên đoạn URL chính là `title` nguyên
  // văn, giữ nguyên hoa/thường: /solutions/BKOffice, /solutions/V-Chain.
  // Dựng URL từ một trường "slug" không tồn tại sẽ ra undefined trên mọi bản ghi.
  ['solutions', 'solutions', true, '/solutions/{title}', 'solution'],
  ['research-labs', 'lab', true, '/research/r&d-labs/{slug}', 'lab'],
  ['learning-materials', 'research', true, '/research/r&d-funding-projects/cyber-clinic/learning-materials/{slug}', 'material'],
  ['cyber-clinic-videos', 'research', false, '/research/r&d-funding-projects/cyber-clinic/video/{slug}', 'video'],
  ['publications', 'publication', false, '/research/publications', 'publication'],
  ['members', 'people', false, '/members', 'member'],
  ['upcoming-events', 'event', false, null, 'event'],
]

// Tiêu đề khai SONG NGỮ là cố ý, không phải cho đẹp. Tiêu đề đi vào context
// header của chuỗi được embed, và câu hỏi tới bằng tiếng Việt. Đo được: chunk
// "Institute Council" xếp hạng 23 với điểm 0,347 cho câu "Hội đồng viện gồm
// những ai?" — dưới ngưỡng 0,45 nên KHÔNG truy hồi được gì. Đây đúng là lớp lỗi
// mà embeddedText.ts đã mô tả, chỉ ở một tầng khác: một chunk không thể được
// tìm bằng cái tên mà text của nó không bao giờ nhắc tới.
//
// 24 URL phải bóc từ HTML. selector_group chọn bộ trích item; min_items là van
// chống "selector vỡ trông giống hệt nội dung bị xoá" (mục 2.6) — con số lấy từ
// độ dài mảng cứng trong chính file page.tsx tương ứng.
const HTML_SOURCES = [
  ['/', 'home', 'home', 'Trang chủ · Home', 'home', null],
  ['/about/welcome-message', 'static', 'static', 'Welcome Message · Thư ngỏ', 'prose', null],
  ['/about/vision-and-operating-philosophy', 'static', 'static', 'Vision & Operating Philosophy · Tầm nhìn và Triết lý hoạt động', 'prose', null],
  ['/about/board-of-deans', 'people', 'people', 'Board of Dean · Ban Giám đốc Viện · Viện trưởng và Phó Viện trưởng', 'person_cards', 3],
  ['/about/back-office', 'people', 'people', 'Back Office · Bộ phận hành chính', 'person_list', 6],
  ['/about/advisory-board', 'people', 'people', 'Advisory Board · Hội đồng Cố vấn', 'person_list', 6],
  ['/about/institute-council', 'people', 'people', 'Institute Council · Hội đồng Viện', 'person_list', 11],
  ['/about/researchers-and-assistants', 'researchers', 'profile_page', 'Researchers & Assistants · Nhà nghiên cứu và Trợ lý', 'person_list', 21],
  ['/academic', 'academic', 'list_page', 'Academic · Đào tạo', 'prose', null],
  ['/academic/activity', 'academic', 'academic', 'Academic Activity · Hoạt động đào tạo', 'prose', null],
  ['/academic/community', 'academic', 'academic', 'Academic Community · Cộng đồng học thuật', 'prose', null],
  ['/academic/facility', 'academic', 'academic', 'Academic Facility · Cơ sở vật chất', 'prose', null],
  ['/research/r&d-funding-projects/cyber-clinic', 'research', 'list_page', 'Cyber Clinic · Phòng khám số', 'prose', null],
  ['/research/r&d-funding-projects/cyber-clinic/about', 'research', 'research', 'Cyber Clinic — About', 'prose', null],
  ['/research/r&d-funding-projects/cyber-clinic?user=business', 'research', 'research', 'Cyber Clinic — Business', 'prose', null],
  ['/research/r&d-funding-projects/cyber-clinic?user=student', 'research', 'research', 'Cyber Clinic — Student', 'prose', null],
  ['/research/r&d-funding-projects/cyber-clinic?user=teacher', 'research', 'research', 'Cyber Clinic — Teacher', 'prose', null],
  ['/get-involved/club', 'event', 'event', 'Club · Câu lạc bộ', 'prose', null],
  ['/get-involved/hackday', 'event', 'event', 'Hackday · Ngày hội lập trình', 'prose', null],
]

// Ghi chú gắn vào từng nguồn JSON, cho những chỗ mà chỉ đọc endpoint thôi thì
// không thể biết được.
const SOURCE_NOTES = {
  solutions: [
    'Đoạn URL là `title` nguyên văn, PHẢI encodeURIComponent khi dựng: title có dấu cách hay ký tự đặc biệt sẽ tạo URL hỏng.',
    'API trả cả bản en lẫn vi thành hai document riêng, nên KHÔNG cần cookie NEXT_LOCALE — nhưng hai document cho ra cùng một URL, vì vậy chunk_id phải mang lang.',
    'TUYỆT ĐỐI không phát hiện route bằng cách đi theo link trang chủ: section Our Projects chốt cứng `limit: 4` và sắp theo -createdAt, nên nó chỉ hiện 4 sản phẩm mới nhất dù CMS có bao nhiêu. Chỉ /payload/solutions mới cho danh sách thật.',
  ],
  courses: ['Không dùng /api/courses để liệt kê: nó lọc cứng tag=short-course và lang, lại không truyền limit nên dính trần 10.'],
  'research-labs': ['Không dùng /api/research-labs để liệt kê: lọc cứng theo lang và dính trần limit 10.'],
  'upcoming-events': ['Chưa xác định trang nào render collection này — phải điền url_template trước khi bật crawl.'],
}

const live = (await readFile('data/chunks_live.jsonl', 'utf-8'))
  .split(/\r?\n/)
  .filter(Boolean)
  .map((l) => JSON.parse(l))

const countByUrl = new Map()
for (const r of live) countByUrl.set(r.url, (countByUrl.get(r.url) || 0) + 1)

/**
 * Route tĩnh có page.tsx nhưng CHƯA có chunk nào trong kho. Không tự động đưa
 * vào crawl: mỗi cái cần một quyết định của người, đúng như cơ chế hàng chờ ở
 * mục 3.6. Ghi vào registry để chúng không bị im lặng bỏ quên.
 */
const PENDING = [
  ['/about', 'hub', 'hub_only', 'Trang index. Dùng cho việc phát hiện route con, không sinh chunk'],
  ['/get-involved', 'hub', 'hub_only', 'Như trên'],
  ['/news', 'hub', 'hub_only', 'Hub phân trang của news, dùng để đối chiếu danh sách slug'],
  ['/get-involved/vietnam-digital-economy-review', 'hub', 'hub_only', 'Hub các bản VDER — nội dung báo cáo đã đóng băng'],
  ['/research/r&d-funding-projects', 'hub', 'hub_only', 'Trang index'],
  ['/research/r&d-funding-projects/cyber-clinic/learning-materials', 'hub', 'hub_only', 'Hub của collection learning-materials'],
  ['/research/r&d-funding-projects/cyber-clinic/video', 'hub', 'hub_only', 'Hub của collection cyber-clinic-videos'],

  // Năm trang dưới đây là redirect thuần — thân hàm chỉ có một lệnh redirect(),
  // không có nội dung nào của riêng chúng. Chunk cũ của chúng thực ra là nội
  // dung của TRANG ĐÍCH, mà trang đích thì đã được nguồn JSON phủ rồi. Giữ lại
  // sẽ tạo bản sao tranh chỗ trong top-k.
  ['/research', 'redirect', 'redirect_only', 'redirect -> /research/publications, đã phủ bởi json-publications'],
  ['/research/r&d-labs', 'redirect', 'redirect_only', 'redirect -> một lab cụ thể, đã phủ bởi json-research-labs'],
  ['/get-involved/ecotech', 'redirect', 'redirect_only', 'redirect -> ecotech/pages/1, vốn là news phân trang theo tag — đã phủ bởi json-news'],
  ['/get-involved/hackathon', 'redirect', 'redirect_only', 'redirect -> hackathon/pages/1, như trên'],
  ['/get-involved/workshop-series', 'redirect', 'redirect_only', 'redirect -> workshop-series/pages/1, như trên'],

  // Bốn trang dưới đây mô tả CÙNG sản phẩm với bản CMS, chỉ khác hoa/thường.
  // Chuẩn là bản CMS: chỉ nó có updatedAt (phát hiện thay đổi rẻ và chính xác,
  // không phải bóc HTML), và nó đã tách sẵn en/vi thành hai document nên không
  // cần trò cookie NEXT_LOCALE. Crawl cả hai bản sẽ tạo hai bộ chunk cho một
  // sản phẩm, tranh nhau chỗ trong top-k và có thể mô tả lệch nhau.
  ['/solutions/bkoffice', 'solution_duplicate', 'rejected', 'Chuẩn là /solutions/BKOffice từ CMS'],
  ['/solutions/bksign', 'solution_duplicate', 'rejected', 'Chuẩn là /solutions/BKSign từ CMS'],
  ['/solutions/ediploma', 'solution_duplicate', 'rejected', 'Chuẩn là /solutions/eDiploma từ CMS'],
  ['/solutions/vchain', 'solution_duplicate', 'rejected', 'Chuẩn là /solutions/V-Chain từ CMS'],

  // Ba sản phẩm chỉ tồn tại dưới dạng trang hardcode. Đã chốt phạm vi: chatbot
  // chỉ phủ 4 sản phẩm có trên CMS. Ba trang này KHÔNG crawl — giữ lại ở đây để
  // ghi rằng đó là quyết định có chủ đích, không phải bỏ sót.
  ['/solutions/b4e', 'solution_hardcoded', 'out_of_scope', 'Ngoài phạm vi: chatbot chỉ phủ 4 sản phẩm trên CMS'],
  ['/solutions/bagri', 'solution_hardcoded', 'out_of_scope', 'Như trên'],
  ['/solutions/bsign', 'solution_hardcoded', 'out_of_scope', 'Như trên'],
]

/** Đếm chunk khớp một url_template. `{...}` khớp một đoạn path bất kỳ. */
function baselineFor(template) {
  if (!template) return 0
  const full = BASE + template
  const m = full.match(/\{[a-z]+\}/)
  if (!m) return countByUrl.get(full) ?? 0
  const [head, tail] = full.split(m[0])
  let total = 0
  for (const [url, n] of countByUrl) {
    if (!url.startsWith(head) || !url.endsWith(tail)) continue
    const middle = url.slice(head.length, url.length - tail.length)
    if (middle && !middle.includes('/')) total += n
  }
  return total
}

const slugify = (p) =>
  p
    .replace(/^\//, '')
    .replace(/[?=&/]+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/-$/, '') || 'home'

const json_sources = JSON_SOURCES.map(([slug, collection, has_drafts, tpl, page_type]) => ({
  source_id: `json-${slug}`,
  kind: 'json',
  payload_collection: slug,
  endpoint: `${BASE}/payload/${slug}`,
  // limit tường minh: mặc định của Payload là 10 và nó KHÔNG báo lỗi khi cắt bớt.
  query: {
    limit: 200,
    depth: 0,
    ...(has_drafts ? { 'where[_status][equals]': 'published' } : {}),
  },
  has_drafts,
  paginate: 'hasNextPage',
  url_template: tpl ? BASE + tpl : null,
  collection,
  page_type,
  notes: SOURCE_NOTES[slug] ?? [],
  baseline_chunks: baselineFor(tpl),
}))

const html_sources = HTML_SOURCES.map(([path, collection, page_type, title, selector_group, min_items]) => ({
  source_id: `html-${slugify(path)}`,
  kind: 'html',
  url: BASE + path,
  // Query ở cyber-clinic MANG NGHĨA: cùng path, ba nội dung khác nhau theo vai
  // trò người xem. Không được chuẩn hoá bỏ đi như query cache-busting.
  keep_query: path.includes('?'),
  // Ngôn ngữ nằm trong cookie NEXT_LOCALE chứ không trong URL, nên mỗi URL fetch
  // hai lượt, và source_id/chunk_hash phải mang cả lang (mục 2.3).
  langs: ['en', 'vi'],
  collection,
  page_type,
  // Khai ở đây thay vì cào từ breadcrumb, vì breadcrumb nằm trong phần bị loại bỏ.
  title,
  selector_group,
  content_root: 'section.blog__details-area > .container',
  min_items,
  baseline_chunks: countByUrl.get(BASE + path) ?? 0,
}))

const pending_sources = PENDING.map(([path, role, status, reason]) => ({
  source_id: `pending-${slugify(path)}`,
  url: BASE + path,
  role,
  status,
  reason,
  baseline_chunks: countByUrl.get(BASE + path) ?? 0,
}))

// Những thứ cố ý để ngoài phạm vi. Ghi lại để lần sau ai đọc registry không
// tưởng là bỏ sót rồi đi "sửa" lại.
const out_of_scope = [
  {
    subject: 'AiPad',
    external_url: 'https://aipad.vn/',
    found_in: 'src/components/layout/Menu.tsx — solutionsLinks',
    reason:
      'Chỉ tồn tại như link ngoài trong menu, không có bản ghi CMS lẫn trang nội bộ. ' +
      'Nằm ngoài phạm vi đã chốt (4 sản phẩm trên CMS), nên chatbot sẽ không nhắc tới.',
  },
  {
    subject: 'B4E, BAgri, BSign',
    external_url: null,
    found_in: 'src/app/(frontend)/solutions/{b4e,bagri,bsign}/page.tsx',
    reason:
      'Chỉ có trang hardcode, không có trên CMS. Ngoài phạm vi đã chốt. Nếu sau này ' +
      'muốn phủ, đường rẻ nhất là đội web thêm vào CMS solutions — khi đó chúng tự ' +
      'vào qua nguồn json-solutions mà không phải sửa gì ở registry.',
  },
]

// URL cua nhom dong bang. Discovery phai biet chung de khong bao "route moi"
// cho nhung trang ta co y khong crawl — hang cho day duong tinh gia thi nguoi
// se ngung doc no, va route moi that su se lot.
const NL = String.fromCharCode(10)
const frozen = (await readFile('data/chunks_frozen.jsonl', 'utf-8'))
  .split(NL)
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l).url)
const frozen_urls = [...new Set(frozen)].sort()

const registry = {
  version: 1,
  base_url: BASE,
  frozen_urls,
  note: 'Nhóm đóng băng nằm ở data/chunks_frozen.jsonl và không bao giờ được fetch.',
  json_sources,
  html_sources,
  pending_sources,
  out_of_scope,
}

await writeFile('data/sources.registry.json', JSON.stringify(registry, null, 2) + '\n')

const sum = (a) => a.reduce((s, x) => s + x.baseline_chunks, 0)
const active = sum(json_sources) + sum(html_sources)
const dropped = sum(pending_sources)
console.log(`json_sources: ${json_sources.length} entry, baseline ${sum(json_sources)} chunk`)
console.log(`html_sources: ${html_sources.length} entry, baseline ${sum(html_sources)} chunk`)
console.log(`pending_sources: ${pending_sources.length} route`)
for (const [st, n] of Object.entries(
  pending_sources.reduce((a, p) => ({ ...a, [p.status]: (a[p.status] || 0) + 1 }), {})
))
  console.log(`    ${st}: ${n}`)

// Mọi chunk trong kho phải hoặc thuộc một nguồn đang hoạt động, hoặc thuộc một
// route đã bị loại CÓ CHỦ ĐÍCH. Chênh lệch nghĩa là có nội dung sẽ biến mất mà
// không ai quyết định điều đó — đúng loại hỏng mà cả kế hoạch cố tránh.
console.log(`
phu ${active} + bo co chu dich ${dropped} = ${active + dropped} / ${live.length} chunk`)
if (active + dropped !== live.length) {
  console.log(`LECH ${live.length - active - dropped} chunk khong ai nhan — kiem tra lai.`)
  process.exitCode = 1
}
