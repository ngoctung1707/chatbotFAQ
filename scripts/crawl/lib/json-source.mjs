/**
 * Mục 2.1 — thu thập qua endpoint JSON công khai của Payload.
 *
 * Ba cái bẫy đã trả giá để biết, cả ba đều nằm ở đây:
 *
 *  1. `limit` mặc định của Payload là 10 và nó KHÔNG báo lỗi khi cắt bớt. Bỏ
 *     quên tham số này là mất 90% news mà log vẫn xanh. Registry luôn khai
 *     `limit` tường minh, và vòng lặp dưới đây vẫn đi hết `hasNextPage` để
 *     không phụ thuộc vào việc con số đó còn đủ lớn sau vài năm nữa.
 *
 *  2. `where[_status][equals]=published` chỉ được gắn cho collection có bật
 *     drafts. Gắn vào collection không có drafts thì Payload trả HTTP 400 chứ
 *     không phải 0 document — nghĩa là một vòng lặp "cho tất cả" sẽ làm chết 4
 *     nguồn. Cờ `has_drafts` trong registry là thứ quyết định, không suy ra
 *     được từ response.
 *
 *  3. `solutions` không có trường `slug`. Route /solutions/[slug] tra bằng
 *     `title`, nên URL dựng từ `title` và PHẢI encode.
 *
 * Mục 2.2 — cố ý KHÔNG dùng /api/courses và /api/research-labs. Chúng lọc cứng
 * theo tag/lang và không truyền limit, nên trả về một danh sách thiếu mà trông
 * vẫn hợp lệ.
 */
import { getJson, OK } from './http.mjs'
import { richTextToPlain } from './lexical.mjs'

/** Trường của Payload, không phải nội dung. */
const SKIP_FIELDS = new Set([
  'id',
  '_status',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'slug',
  'lang',
  'meta',
  'sizes',
  'rank',
])

const OBJECT_ID = /^[a-f0-9]{24}$/i

/** Quan hệ ở depth=0 chỉ còn lại id — không phải nội dung, phải loại. */
const isRelationId = (v) => typeof v === 'string' && OBJECT_ID.test(v)

const isRichText = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'root' in v

/**
 * Ép một document thành văn bản thuần.
 *
 * Cố ý duyệt chung thay vì khai danh sách trường cho từng collection: khi đội
 * web thêm một trường mới vào CMS, nội dung đó tự có mặt trong kho thay vì im
 * lặng biến mất cho tới khi ai đó nhớ ra phải cập nhật crawler.
 */
export function docToText(doc) {
  const parts = []
  for (const [key, value] of Object.entries(doc)) {
    if (SKIP_FIELDS.has(key)) continue
    if (value == null || isRelationId(value)) continue

    if (isRichText(value)) {
      const t = richTextToPlain(value)
      if (t) parts.push(t)
    } else if (typeof value === 'string') {
      if (value.trim()) parts.push(value.trim())
    } else if (typeof value === 'number') {
      parts.push(String(value))
    } else if (Array.isArray(value)) {
      const inner = value
        .map((v) => (isRichText(v) ? richTextToPlain(v) : typeof v === 'string' && !isRelationId(v) ? v : ''))
        .filter(Boolean)
      if (inner.length) parts.push(inner.join('\n'))
    }
  }
  return parts.join('\n').trim()
}

/** Dựng URL trang từ template registry. `{field}` lấy từ doc và luôn được encode. */
export function buildUrl(template, doc) {
  if (!template) return null
  return template.replace(/\{([a-zA-Z]+)\}/g, (_, field) => {
    const raw = doc[field]
    if (raw == null) throw new Error(`doc thieu truong "${field}" de dung URL (id=${doc.id})`)
    return encodeURIComponent(String(raw))
  })
}

function endpointWithQuery(source, page) {
  const u = new URL(source.endpoint)
  for (const [k, v] of Object.entries(source.query)) u.searchParams.set(k, String(v))
  if (page > 1) u.searchParams.set('page', String(page))
  return u.toString()
}

/**
 * Lấy toàn bộ document của một nguồn JSON.
 *
 * @returns {Promise<{ok: boolean, docs?: object[], error?: string, pages?: number}>}
 *   `ok: false` nghĩa là KHÔNG kiểm tra được — nơi gọi phải giữ nguyên dữ liệu
 *   cũ chứ không được coi collection này là rỗng.
 */
export async function fetchJsonSource(source) {
  const docs = []
  let page = 1
  let pages = 0

  for (;;) {
    const res = await getJson(endpointWithQuery(source, page))
    if (res.state !== OK) {
      return { ok: false, error: `${source.source_id}: ${res.error ?? res.state} (HTTP ${res.status})` }
    }
    const body = res.json
    if (!Array.isArray(body?.docs)) {
      return { ok: false, error: `${source.source_id}: response khong co mang docs` }
    }
    docs.push(...body.docs)
    pages++

    if (!body.hasNextPage) {
      // Chốt chặn: nếu server lờ `limit` hoặc phân trang lệch, con số này sẽ
      // không khớp và ta biết ngay thay vì âm thầm mất dữ liệu.
      if (typeof body.totalDocs === 'number' && docs.length !== body.totalDocs) {
        return {
          ok: false,
          error: `${source.source_id}: lay duoc ${docs.length} doc nhung totalDocs=${body.totalDocs}`,
        }
      }
      return { ok: true, docs, pages }
    }
    page++
    if (page > 200) return { ok: false, error: `${source.source_id}: phan trang khong dung lai` }
  }
}

/**
 * Biến document thành các bản ghi trung gian (chưa cắt chunk).
 *
 * Bản en và vi của cùng một solution cho ra CÙNG một URL, nên `lang` phải nằm
 * trong khoá — nếu chỉ khoá theo URL thì hai bản ghi đè nhau và mất một nửa nội
 * dung mà không có lỗi nào báo.
 */
export function docsToRecords(source, docs) {
  const out = []
  for (const doc of docs) {
    const text = docToText(doc)
    if (!text) continue
    const lang = doc.lang ?? 'en'
    let url
    try {
      url = buildUrl(source.url_template, doc)
    } catch (err) {
      out.push({ error: `${source.source_id}: ${err.message}` })
      continue
    }
    out.push({
      source_id: source.source_id,
      doc_id: doc.id,
      url,
      lang,
      title: doc.title ?? doc.name ?? null,
      updated_at: doc.updatedAt ?? null,
      published_at: doc.publishedAt ?? null,
      collection: source.collection,
      page_type: source.page_type,
      text,
    })
  }
  return out
}
