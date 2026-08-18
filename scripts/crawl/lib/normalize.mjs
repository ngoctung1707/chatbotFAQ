/**
 * Mục 2.7 — biến HTML thành văn bản ổn định.
 *
 * Đây là phần giòn nhất của cả pipeline. Nếu hàm này cho ra chuỗi khác nhau
 * giữa hai lần crawl cùng một trang không đổi, thì mọi cơ chế tiết kiệm phía
 * sau sụp đổ: hash đổi → chunk đổi → embed lại → chatbot tắt mỗi tuần dù không
 * có nội dung mới nào.
 *
 * Cách tiếp cận là NGƯỢC với kế hoạch ban đầu. Định dùng chung một content root
 * (`section.blog__details-area > .container`), nhưng quét thật cả 24 URL thì chỉ
 * 8 trang có selector đó — các nhóm trang dùng template khác nhau. Nên thay vì
 * chọn phần cần giữ, ta bỏ phần khung và giữ tất cả phần còn lại. Danh sách
 * khung vẫn đóng và biết trước vì mọi trang đều bọc trong `Layout`.
 *
 * Đo trên 19 URL: text sinh ra khớp kho cũ với tỉ lệ 0,88–1,07 trên phần lớn
 * trang, nên cách này bám sát thứ crawler cũ từng lấy.
 */
import * as cheerio from 'cheerio'

/**
 * Khung của site — mọi thứ lặp lại trên mọi trang.
 *
 * `script` đứng đầu danh sách và là mục quan trọng nhất: Next nhét payload RSC
 * vào `<script>self.__next_f.push(...)</script>`, trong đó có `buildId` đổi mỗi
 * lần deploy. Quên nó thì hash đổi sau mỗi lần deploy dù nội dung y nguyên, và
 * job sẽ embed lại toàn bộ kho.
 */
export const CHROME_SELECTORS = [
  'script',
  'style',
  'noscript',
  'svg',
  'iframe',
  'link',
  'header',
  'footer',
  '.tg-header__area',
  '.tg-footer__area',
  '.tgmenu__wrap',
  '.breadcrumb__area',
  '.Toastify',
  '.loader-container',
  '#scrollUp',
  '.scroll-top',
  '.back-to-top',
  '[class*="chatbot"]',
  '[id*="chatbot"]',
]

/** Thẻ kết thúc một khối — cần xuống dòng sau nó, nếu không chữ dính liền nhau. */
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'aside', 'main', 'li', 'ul', 'ol',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'blockquote', 'pre', 'figure', 'figcaption', 'form', 'label',
])

/**
 * Lấy text kèm ranh giới khối.
 *
 * `$.text()` của cheerio nối thẳng mọi text node, biến một danh sách nhân sự
 * thành "Vu Thi Thu Ha (Chief Accountant)Tran Minh Phuong (Accountant)..." —
 * đọc được với người thì tạm, nhưng tokenizer sẽ ghép "Accountant)Tran" thành
 * một token rác và embedding học sai.
 */
export function blockText($, el) {
  const out = []
  const walk = (node) => {
    if (node.type === 'text') {
      out.push(node.data)
      return
    }
    if (node.type !== 'tag') return
    if (node.name === 'br') {
      out.push('\n')
      return
    }
    for (const child of node.children ?? []) walk(child)
    if (BLOCK_TAGS.has(node.name)) out.push('\n')
  }
  const root = el?.[0] ?? el
  if (Array.isArray(el) || el?.length > 1) {
    el.each((_, e) => walk(e))
  } else if (root) {
    walk(root)
  }
  return collapse(out.join(''))
}

/**
 * Gộp khoảng trắng theo một quy tắc duy nhất.
 *
 * Bắt buộc phải xác định: HTML render ra có thể chứa nbsp, tab, xuống dòng do
 * xuống dòng trong JSX. Không chuẩn hoá thì hai lần render cùng nội dung vẫn có
 * thể cho hash khác nhau.
 */
export function collapse(text) {
  return text
    .replace(/ /g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/**
 * Nạp HTML, gỡ khung, trả về cả `$` (để bộ trích item dùng tiếp) lẫn text.
 */
export function normalizeHtml(html) {
  const $ = cheerio.load(html)
  $(CHROME_SELECTORS.join(',')).remove()
  // Bỏ comment HTML: chúng vô hình với người đọc nhưng vẫn vào hash nếu ai đó
  // để lại một dấu thời gian trong đó.
  $('*')
    .contents()
    .filter((_, n) => n.type === 'comment')
    .remove()
  return { $, text: blockText($, $('body')) }
}
