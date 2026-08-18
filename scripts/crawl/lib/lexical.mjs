/**
 * Làm phẳng richText của Payload (Lexical) thành văn bản thuần.
 *
 * Mọi trường `content` trong 5 collection đều là richText, nên nếu không có
 * bước này thì thứ đi vào chunk sẽ là một cục JSON lồng nhau — model không đọc
 * được, mà embedding thì sẽ học cấu trúc cây thay vì nội dung.
 *
 * Điều quan trọng với hash: hàm này phải cho ra CHÍNH XÁC cùng một chuỗi khi
 * đưa vào cùng một document. Nên không có chỗ nào phụ thuộc thời gian, thứ tự
 * duyệt object, hay Intl. Mọi thứ chỉ dựa vào mảng `children` vốn đã có thứ tự.
 */

/** Node nào kết thúc một khối và cần xuống dòng sau nó. */
const BLOCK = new Set(['paragraph', 'heading', 'quote', 'listitem', 'list'])

function walk(node, out) {
  if (!node || typeof node !== 'object') return

  if (node.type === 'linebreak') {
    out.push('\n')
    return
  }

  // Node văn bản. Bỏ qua chuỗi rỗng để không sinh ra khoảng trắng thừa.
  if (typeof node.text === 'string') {
    if (node.text) out.push(node.text)
    return
  }

  // Link: giữ phần chữ, bỏ URL. URL đã có ở trường `url` của chunk, nhồi thêm
  // vào nội dung chỉ làm loãng vector và khiến model đọc ra một mớ địa chỉ.
  const children = Array.isArray(node.children) ? node.children : []
  for (const child of children) walk(child, out)

  if (BLOCK.has(node.type)) out.push('\n')
}

/**
 * @param {unknown} rich Giá trị trường richText lấy từ API.
 * @returns {string} Văn bản thuần, đã gộp khoảng trắng, không có dòng trống thừa.
 */
export function richTextToPlain(rich) {
  if (!rich || typeof rich !== 'object') return ''
  const root = rich.root ?? rich
  const out = []
  walk(root, out)
  return out
    .join('')
    .replace(/[ \t ]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}
