/**
 * Mục 2.3–2.6 — thu thập 19 trang phải bóc từ HTML.
 *
 * 2.3  Mỗi URL fetch hai lượt, một cho `en` một cho `vi`. Ngôn ngữ của site nằm
 *      trong cookie NEXT_LOCALE chứ không trong URL, nên không gửi cookie thì
 *      vĩnh viễn chỉ lấy được tiếng Anh. Hai lượt cho cùng một URL, nên `lang`
 *      phải nằm trong khoá — nếu không, bản này ghi đè bản kia không báo lỗi.
 *
 * 2.5  Hai bộ trích item cho trang nhân sự, vì chúng dùng hai kiểu markup khác
 *      nhau (đã đối chiếu với DOM thật, không phải đoán).
 *
 * 2.6  Van `min_items`: trích được ít hơn ngưỡng khai trong registry thì coi là
 *      SELECTOR VỠ, không phải nội dung bị xoá. Đây là điểm khác biệt sống còn —
 *      một trang rỗng do selector hỏng trông y hệt một trang bị xoá sạch nhân
 *      sự, và van 20%/30% ở giai đoạn 5 không cứu được vì 4 trang này quá nhỏ
 *      để chạm ngưỡng đó.
 */
import { get, OK, GONE } from './http.mjs'
import { normalizeHtml, blockText, collapse } from './normalize.mjs'
import { collectInternalLinks } from './discover.mjs'

/** Trang nhân sự kiểu thẻ card: /about/board-of-deans */
function extractPersonCards($) {
  const items = []
  $('.member-item').each((_, el) => {
    const name = collapse($(el).find('h5').first().text())
    const role = collapse($(el).find('p').first().text())
    if (name) items.push(role ? `${name} — ${role}` : name)
  })
  return [{ heading: null, items }]
}

/**
 * Trang nhân sự kiểu danh sách: back-office, advisory-board, institute-council,
 * researchers-and-assistants.
 *
 * Các thẻ span đã được ghép sẵn thành câu hoàn chỉnh dạng "Tên (Chức vụ)", nên
 * lấy thẳng text của `li` là đủ, không cần tách từng span. Thẻ `<i>` icon không
 * có text nên không lẫn vào.
 *
 * researchers-and-assistants có HAI khối, mỗi khối mở đầu bằng `h4`
 * (Researchers / Assistants) — trả về hai nhóm để tầng chunk cắt theo đó.
 */
function extractPersonList($) {
  const groups = []
  $('.about__list-box').each((_, box) => {
    const heading = collapse($(box).find('h4').first().text()) || null
    const items = []
    $(box)
      .find('ul.list-wrap > li')
      .each((_, li) => {
        const t = collapse($(li).text())
        if (t) items.push(t)
      })
    if (items.length) groups.push({ heading, items })
  })
  return groups
}

/** Trang chủ: mỗi `section` là một khối nội dung riêng, cắt theo đó. */
function extractHomeSections($) {
  const groups = []
  $('section').each((_, el) => {
    const heading = collapse($(el).find('h1,h2').first().text()) || null
    const text = blockText($, $(el))
    if (text.length > 40) groups.push({ heading, items: [text] })
  })
  return groups
}

/** Trang văn xuôi: lấy nguyên phần còn lại sau khi gỡ khung. */
function extractProse($, fallbackText) {
  return fallbackText ? [{ heading: null, items: [fallbackText] }] : []
}

const EXTRACTORS = {
  person_cards: extractPersonCards,
  person_list: extractPersonList,
  home: extractHomeSections,
  prose: extractProse,
}

/**
 * Lấy một nguồn HTML ở một ngôn ngữ.
 *
 * @returns một trong ba dạng:
 *   {state:'ok', groups, text}          — trích được
 *   {state:'gone'}                      — 404/410, bằng chứng đã bị gỡ
 *   {state:'unknown'|'broken', error}   — KHÔNG kết luận được, giữ nguyên dữ liệu cũ
 */
export async function fetchHtmlSource(source, lang) {
  const res = await get(source.url, { lang })
  if (res.state === GONE) return { state: 'gone', url: source.url, lang }
  if (res.state !== OK) return { state: 'unknown', url: source.url, lang, error: res.error }

  const { $, text } = normalizeHtml(res.body)
  const extractor = EXTRACTORS[source.selector_group] ?? extractProse
  const groups = extractor($, text)
  const count = groups.reduce((n, g) => n + g.items.length, 0)
  // Link nội bộ nhặt luôn ở đây vì ta đã có DOM trong tay — dùng làm lưới an
  // toàn cho việc phát hiện route mới (mục 3.4), không phải nguồn chính.
  const links = collectInternalLinks($, source.url)

  // Van 2.6. Cố ý trả 'broken' chứ không phải 'gone': nơi gọi phải GIỮ chunk cũ
  // và báo động, tuyệt đối không ghi đè bằng một trang rỗng.
  if (source.min_items != null && count < source.min_items) {
    return {
      state: 'broken',
      url: source.url,
      lang,
      error: `trich duoc ${count} item, khai toi thieu ${source.min_items} — selector nhieu kha nang da vo`,
    }
  }
  if (count === 0) {
    return { state: 'broken', url: source.url, lang, error: 'trich duoc 0 item' }
  }

  return { state: 'ok', url: source.url, lang, groups, text, links }
}

/**
 * Lấy cả hai ngôn ngữ của một nguồn.
 *
 * Nhiều trang viết cứng tiếng Anh trong JSX nên cookie `vi` không đổi được gì —
 * khi đó hai lượt cho ra text giống hệt và ta chỉ giữ một bản. Đó là lý do kho
 * cũ có 82 chunk `en` mà chỉ 22 chunk `vi`, chứ không phải vì crawler cũ bỏ sót.
 */
export async function fetchHtmlSourceAllLangs(source) {
  const results = []
  const seen = new Map()
  for (const lang of source.langs ?? ['en']) {
    const r = await fetchHtmlSource(source, lang)
    if (r.state !== 'ok') {
      results.push(r)
      continue
    }
    const prev = seen.get(r.text)
    if (prev) {
      for (const l of r.links) prev.links.add(l)
      // Nội dung trùng khít bản đã lấy — ghi nhận ngôn ngữ vào bản cũ thay vì
      // tạo chunk thứ hai y hệt.
      prev.also_langs.push(lang)
      continue
    }
    const rec = { ...r, also_langs: [] }
    seen.set(r.text, rec)
    results.push(rec)
  }
  return results
}
