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
  members: {
    embed:
      'Thống kê số lượng nhân sự của viện. Viện có bao nhiêu thành viên, bao nhiêu cán ' +
      'bộ, đếm nhân sự.',
    noun: 'thành viên',
  },
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
