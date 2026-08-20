/**
 * Mục 2.9 — chunk thống kê sinh tự động.
 *
 * Vì sao bắt buộc chứ không phải tuỳ chọn: retriever chỉ cho tối đa 3 chunk
 * cùng một URL vào <data>, mà cả 45 publications đều nằm trên
 * /research/publications. Dù cắt trang đó thành 5 hay 45 chunk, model cũng
 * không bao giờ nhìn thấy đủ để tự đếm. Chunk viết tay "45 publications" hoạt
 * động được không phải nhờ retrieval giỏi mà vì con số đã được đếm sẵn hộ nó.
 *
 * Mẹo nằm ở chỗ tách hai trường:
 *
 *   content (được embed) — câu mô tả ỔN ĐỊNH, KHÔNG chứa con số
 *   raw     (gửi cho LLM) — con số thật kèm ngày
 *
 * Nhờ vậy vector không bao giờ đổi → hash không đổi → không bao giờ phải embed
 * lại, mà số liệu vẫn cập nhật hàng tuần. Và điều đó còn ĐÚNG HƠN về mặt truy
 * hồi: câu "viện có bao nhiêu publications" khớp trên các từ
 * publications/công bố/số lượng, nó không hề khớp trên chuỗi "45".
 */
import { hashOf } from './chunk.mjs'

/** Mô tả để embed, và nhãn để LLM đọc. Chỉ khai cho collection đáng đếm. */
const SUBJECTS = {
  publications: {
    embed:
      'Thống kê số lượng công bố khoa học của viện. Viện có bao nhiêu publications, ' +
      'tổng số bài báo khoa học, số lượng nghiên cứu đã công bố, đếm publications.',
    noun: 'công bố khoa học (publications)',
    groupBy: 'year',
  },
  news: {
    embed:
      'Thống kê số lượng tin tức của viện. Viện có bao nhiêu bài tin, tổng số tin tức, ' +
      'đếm số bài viết đã đăng.',
    noun: 'bài tin tức',
  },
  courses: {
    embed:
      'Thống kê số lượng khóa học của viện. Viện có bao nhiêu khóa học, tổng số chương ' +
      'trình đào tạo, đếm khóa học.',
    noun: 'khóa học',
  },
  solutions: {
    embed:
      'Thống kê số lượng giải pháp và sản phẩm của viện. Viện có bao nhiêu giải pháp, ' +
      'bao nhiêu sản phẩm, đếm ứng dụng.',
    noun: 'giải pháp / sản phẩm',
  },
  'research-labs': {
    embed:
      'Thống kê số lượng phòng thí nghiệm của viện. Viện có bao nhiêu lab, bao nhiêu ' +
      'nhóm nghiên cứu, đếm phòng thí nghiệm.',
    noun: 'phòng thí nghiệm (lab)',
  },
  // KHÔNG có `members` ở đây, và đó là chủ ý — xem `makePersonnelChunk` bên dưới.
  //
  // Bản trước đếm collection `members` và sinh ra câu "viện có 19 thành viên".
  // Con số đó SAI: collection ấy chỉ gồm Ban Giám đốc (3) và Nhà nghiên cứu
  // (16), thiếu hẳn 5 trợ lý, nên tổng thật là 24. Tệ hơn là nó sai một cách tự
  // tin — chatbot khẳng định "19" chứ không hề tỏ ra lưỡng lự.
  //
  // Nguồn `json-members` nay đã bị đánh `rejected` trong registry (trang
  // /members là route mồ côi, không chỗ nào link tới), nên nhánh này không bao
  // giờ chạy nữa. Vẫn xoá khai báo đi thay vì để lại: còn khai là còn cái bẫy
  // cho người sau bật lại nguồn rồi lấy về đúng con số sai đó.
}

/**
 * Nguồn sự thật cho câu hỏi "viện có những ai / bao nhiêu thành viên".
 *
 * Khoá là `source_id`, hoặc `source_id|<tên nhóm h4>` khi một trang chia nhiều
 * nhóm. Giá trị là nhãn tiếng Việt dùng trong câu trả lời.
 */
const PERSONNEL_GROUPS = {
  'html-about-board-of-deans': 'Ban Giám đốc Viện',
  'html-about-researchers-and-assistants|Researchers': 'Nhà nghiên cứu',
  'html-about-researchers-and-assistants|Assistants': 'Trợ lý',
}

/** Bỏ hậu tố "(phần i/n)" và lấy phần sau dấu — của nhãn ghép. */
function groupKey(chunk) {
  const section = (chunk.section ?? '').replace(/\s*\(phần \d+\/\d+\)\s*$/u, '')
  const tail = section.includes(' — ') ? section.split(' — ').pop().trim() : null
  return tail ? `${chunk.source_id}|${tail}` : chunk.source_id
}

const dmy = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

/**
 * @param {string} slug         payload_collection
 * @param {object[]} docs       document đã lấy về (đã lọc published)
 * @param {object} source       entry registry, để lấy url/collection/page_type
 * @param {Date} now            truyền vào để test có thể cố định ngày
 */
export function makeStatsChunk(slug, docs, source, now = new Date()) {
  const subject = SUBJECTS[slug]
  if (!subject) return null

  // Đếm theo ĐỊNH DANH của mục, không theo số document.
  //
  // Bản en và vi của cùng một giải pháp là hai document nhưng một sản phẩm —
  // đếm thô sẽ nói viện có 8 giải pháp trong khi thực tế là 4.
  //
  // Nhưng cách sửa đầu tiên của tôi (lọc lấy lang === 'en') còn sai tệ hơn, và
  // đo được: news báo 45 bài trong khi thật sự có 111, courses báo 6 trong khi
  // có 14, lab báo 3 trong khi có 6. Lý do: bài tin và khoá học mỗi cái viết
  // bằng MỘT thứ tiếng, không phải cặp song ngữ — lọc theo lang là vứt đi phần
  // lớn nội dung thật.
  //
  // Định danh đúng là thứ tạo ra URL: slug, hoặc title/name khi collection
  // không có slug. Cách này đúng cho cả hai trường hợp mà không cần biết
  // collection nào song ngữ.
  const identity = (d) => d.slug ?? d.title ?? d.name ?? d.id
  const total = new Set(docs.map(identity).filter(Boolean)).size
  const unique = docs

  const lines = [`Tính đến ${dmy(now)}, viện có ${total} ${subject.noun}.`]

  if (subject.groupBy === 'year') {
    const byYear = new Map()
    const seenYear = new Set()
    for (const d of unique) {
      const key = identity(d)
      if (key && seenYear.has(key)) continue
      if (key) seenYear.add(key)
      const y = d.year ?? (d.publishedAt ? new Date(d.publishedAt).getFullYear() : null)
      if (y) byYear.set(y, (byYear.get(y) ?? 0) + 1)
    }
    if (byYear.size) {
      const parts = [...byYear.entries()].sort((a, b) => b[0] - a[0]).map(([y, n]) => `${y}: ${n}`)
      lines.push(`Phân bố theo năm — ${parts.join(', ')}.`)
    }
  }

  const content = `[Thống kê ${subject.noun}]\n${subject.embed}`
  return {
    chunk_id: `stats_${slug}_c01`,
    // source_id PHẢI là của nguồn JSON sở hữu nó, không phải một id riêng.
    // source_id là đơn vị xoá-và-thay, và khi nguồn bị bỏ qua ở tầng thô thì
    // phần mang-sang tra chunk cũ THEO source_id. Đặt id riêng nghĩa là chunk
    // thống kê không thuộc về nguồn nào, không được mang sang, và biến mất ngay
    // lần chạy thứ hai — đo được: state vẫn ghi nhớ nó, nhưng file đầu ra thì
    // không còn, và store dựng ra thiếu hẳn khả năng trả lời câu hỏi đếm.
    source_id: source.source_id,
    content,
    raw: lines.join(' '),
    title: `Thống kê ${subject.noun}`,
    url: source.url_template && !source.url_template.includes('{') ? source.url_template : source.endpoint,
    collection: source.collection,
    page_type: 'stats',
    published_at: null,
    lang: 'vi',
    section: `Thống kê ${subject.noun}`,
    source: 'derived',
    domain: 'fintech.hust.edu.vn',
    // Băm trên content, vốn cố ý KHÔNG chứa con số — nên hash đứng yên vĩnh
    // viễn và chunk này chỉ phải embed đúng một lần trong đời.
    chunk_hash: hashOf(content),
  }
}

/**
 * Chunk "mục lục nhân sự" — câu trả lời cho "viện có những ai", "liệt kê tất cả
 * thành viên", "viện có trợ lý không".
 *
 * ─── VÌ SAO PHẢI CÓ MỘT CHUNK RIÊNG ──────────────────────────────────────────
 *
 * Thành viên của viện nằm rải trên HAI trang và BA nhóm: Ban Giám đốc, Nhà
 * nghiên cứu, Trợ lý. Retriever chỉ cho tối đa 3 chunk cùng một URL vào <data>
 * và top-k là 7, nên không câu hỏi nào kéo được đủ cả ba nhóm về cùng lúc — y
 * hệt lý do chunk thống kê publications phải tồn tại. Không có chunk này thì
 * "liệt kê tất cả thành viên" chỉ có thể trả lời đúng MỘT phần, và người hỏi
 * không có cách nào biết là còn thiếu.
 *
 * ─── KHÁC VỚI `makeStatsChunk` Ở HAI CHỖ ─────────────────────────────────────
 *
 * 1. Nó dựng từ `allChunks` SAU vòng lặp, không từ một nguồn. Nếu gắn nó vào
 *    một nguồn thì lần chạy nào nguồn đó bị bỏ qua ở tầng thô, chunk này sẽ
 *    được mang sang nguyên bản CŨ — kể cả khi trang kia vừa thêm người. Dựng
 *    lại mỗi lần từ kho hiện hành thì không có đường nào lệch.
 * 2. `source_id` vẫn phải là một nguồn CÓ THẬT (xem chú thích dài ở
 *    `makeStatsChunk`), nên nó mượn id của trang nhân sự lớn nhất. Bên gọi có
 *    trách nhiệm loại bản mang-sang trước khi thêm bản mới, nếu không sẽ có hai
 *    bản trùng chunk_id.
 *
 * Vẫn giữ nguyên nguyên tắc hai trường: `content` không chứa con số nên vector
 * đứng yên vĩnh viễn, `raw` mang số nên tuần nào cũng đúng.
 */
export function makePersonnelChunk(allChunks, now = new Date()) {
  const OWNER = 'html-about-researchers-and-assistants'

  // Trang nhân sự viết tiếng Anh; chỉ đếm một thứ tiếng để không nhân đôi.
  const relevant = allChunks.filter((c) => groupKey(c) in PERSONNEL_GROUPS)
  if (!relevant.length) return null
  const lang = relevant.some((c) => c.lang === 'en') ? 'en' : relevant[0].lang

  const counts = new Map()
  for (const c of relevant) {
    if (c.lang !== lang) continue
    const label = PERSONNEL_GROUPS[groupKey(c)]
    const n = c.raw.split('\n').filter((l) => l.trim()).length
    counts.set(label, (counts.get(label) ?? 0) + n)
  }
  if (!counts.size) return null

  // Giữ đúng thứ tự khai trong PERSONNEL_GROUPS, không theo thứ tự crawl.
  const order = [...new Set(Object.values(PERSONNEL_GROUPS))]
  const parts = order.filter((l) => counts.has(l)).map((l) => `${l} ${counts.get(l)} người`)
  const total = [...counts.values()].reduce((a, b) => a + b, 0)

  const content =
    '[Thống kê thành viên viện]\n' +
    'Thống kê nhân sự của viện. Viện có bao nhiêu thành viên, bao nhiêu người, bao nhiêu ' +
    'cán bộ, đếm nhân sự. Danh sách toàn bộ thành viên của viện gồm Ban Giám đốc Viện, ' +
    'các nhà nghiên cứu và các trợ lý. Liệt kê tất cả thành viên, kể tên nhân sự, ' +
    'viện có trợ lý không, viện có nhà nghiên cứu không, viện có những ai.'

  return {
    chunk_id: 'stats_personnel_c01',
    source_id: OWNER,
    content,
    raw:
      `Tính đến ${dmy(now)}, viện có ${total} thành viên, gồm ${parts.join(', ')}. ` +
      'Thành viên của viện gồm ba nhóm: Ban Giám đốc Viện, các nhà nghiên cứu, và các trợ lý. ' +
      'Danh sách tên từng người nằm ở trang /about/board-of-deans và ' +
      '/about/researchers-and-assistants.',
    title: 'Thống kê thành viên viện',
    url: 'https://fintech.hust.edu.vn/about/researchers-and-assistants',
    collection: 'people',
    page_type: 'stats',
    published_at: null,
    lang: 'vi',
    section: 'Thống kê thành viên viện',
    source: 'derived',
    domain: 'fintech.hust.edu.vn',
    chunk_hash: hashOf(content),
  }
}
