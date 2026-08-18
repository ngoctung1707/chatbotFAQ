/**
 * Mục 2.8 — cắt chunk theo đơn vị ngữ nghĩa, và băm chúng.
 *
 * Bản ghi sinh ra ở đây phải TRÙNG SCHEMA với chunks_all.jsonl, để
 * scripts/build-index.ts đọc được mà không phải sửa dòng nào:
 *
 *   content — chuỗi được EMBED, có context header dạng "[Tiêu đề]\n..."
 *   raw     — chuỗi gửi cho LLM, không có header
 *
 * Hai trường này không thay thế được cho nhau: header tồn tại để lái embedding
 * (một chunk nói về Viện trưởng mà bản thân nó không nhắc tên viện thì không
 * câu hỏi nào chứa "BK Fintech" tìm ra được), còn đưa header cho model thì chỉ
 * là nhiễu nó có thể chép lại. Xem chú thích đầu build-index.ts.
 *
 * Thêm hai trường mới so với kho cũ: `source_id` để xoá-thay theo nhóm, và
 * `chunk_hash` để quyết định có phải embed lại không.
 */
import { createHash } from 'node:crypto'

/**
 * Trần độ dài. Chi phí attention tăng theo BÌNH PHƯƠNG độ dài, nên một trang
 * mới crawl về mà không cắt có thể ngốn vài GB và giết job giữa cửa sổ bảo trì.
 * 1800 chọn theo PHÂN BỐ của kho hiện có (p50 = 1234, p90 = 1503, p99 = 1855),
 * không phải theo mức an toàn về RAM. Lý do: DEFAULT_MIN_SCORE = 0.35 trong
 * config.ts được đo trên phân bố đó. Chunk dài gấp rưỡi sẽ pha loãng vector,
 * kéo điểm cosine xuống dưới ngưỡng và làm retriever trả về ít kết quả hơn —
 * một cách âm thầm, không lỗi nào báo.
 */
export const MAX_CHARS = 1800

/**
 * Cắt văn bản tại ranh giới dòng, không cắt giữa câu.
 *
 * Một đoạn đơn lẻ dài hơn trần vẫn được giữ nguyên thay vì chặt đôi: chặt giữa
 * chừng tạo ra hai nửa vô nghĩa mà không nửa nào trả lời được câu hỏi nào, còn
 * một đoạn 3000 ký tự thì vẫn nằm xa ngưỡng gây nổ RAM.
 */
export function splitText(text, maxChars = MAX_CHARS) {
  const lines = text.split('\n').filter((l) => l.trim())
  const out = []
  let buf = []
  let len = 0
  for (const line of lines) {
    if (len && len + line.length + 1 > maxChars) {
      out.push(buf.join('\n'))
      buf = []
      len = 0
    }
    buf.push(line)
    len += line.length + 1
  }
  if (buf.length) out.push(buf.join('\n'))
  return out.length ? out : []
}

export const hashOf = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

const pad = (n) => String(n).padStart(2, '0')

/**
 * Dựng các chunk cho MỘT đơn vị nội dung (một trang, một document, một nhóm
 * `h4`, hoặc một năm của danh sách publications).
 *
 * `section` là tiêu đề dùng làm context header. Với trang nhân sự thì đó là tên
 * trang ("Board of Dean"), với nhóm h4 là tên nhóm, với publications là năm.
 */
export function makeChunks({
  source_id,
  key = '',
  url,
  lang,
  title,
  section,
  collection,
  page_type,
  published_at = null,
  text,
  maxChars = MAX_CHARS,
}) {
  const header = section || title || null
  // Ngân sách phải trừ phần header, vì `content` là header ghép với piece. Không
  // trừ thì chunk vượt trần đúng bằng độ dài header — đo được 42/313 chunk vượt.
  const budget = Math.max(400, maxChars - ((header?.length ?? 0) + 24))
  const pieces = splitText(text, budget)
  const multi = pieces.length > 1

  return pieces.map((piece, i) => {
    // Số thứ tự phần CHỈ xuất hiện khi thật sự có nhiều phần. Kho cũ nhét
    // "(part 1/5)" vào mọi chunk của trang publications, khiến thêm một công bố
    // là cả 5 chunk đổi hash dù 4 chunk không đổi một chữ nào.
    const label = header ? (multi ? `${header} (phần ${i + 1}/${pieces.length})` : header) : null
    const content = label ? `[${label}]\n${piece}` : piece
    const idParts = [source_id, key, lang, `c${pad(i + 1)}`].filter(Boolean)
    return {
      chunk_id: idParts.join('_'),
      source_id,
      content,
      raw: piece,
      title: title ?? null,
      url,
      collection,
      page_type,
      published_at,
      lang,
      section: header,
      source: 'crawl',
      domain: url ? new URL(url).hostname : null,
      // Băm trên CHUỖI ĐƯỢC EMBED, không phải trên raw: nếu sau này đổi cách
      // dựng header thì vector phải đổi theo, và cache phải miss chứ không được
      // trả về vector cũ.
      chunk_hash: hashOf(content),
    }
  })
}

/** Gộp nhiều nhóm (mỗi nhóm là một `h4` hoặc một section) thành chunk. */
export function chunksFromGroups(base, groups) {
  const out = []
  for (const g of groups) {
    const text = g.items.join('\n')
    if (!text.trim()) continue
    out.push(
      ...makeChunks({
        ...base,
        section: g.heading ?? base.section ?? base.title,
        key: [base.key, g.heading ? slugKey(g.heading) : ''].filter(Boolean).join('-'),
        text,
      })
    )
  }
  return out
}

/**
 * Khoá ngắn, đọc được, và KHÔNG va chạm.
 *
 * Phần đuôi 6 ký tự hash không phải để cho đẹp: cắt cụt ở 40 ký tự từng làm hai
 * bài news khác nhau ra cùng một chunk_id — cả hai đều bắt đầu bằng
 * "chuc-mung-hoc-vien-chuong-trinh-dao-tao-". Khi chunk_id trùng, bản sau ghi
 * đè bản trước lúc dựng chỉ mục và một bài biến mất khỏi kho mà không lỗi nào
 * báo. Chỉ gắn đuôi khi thật sự phải cắt, để khoá của phần lớn trang vẫn sạch.
 */
export function slugKey(s, max = 40) {
  const full = String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (full.length <= max) return full
  return `${full.slice(0, max).replace(/-$/, '')}-${hashOf(full).slice(0, 6)}`
}
