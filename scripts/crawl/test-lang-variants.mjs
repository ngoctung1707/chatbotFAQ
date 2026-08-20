/**
 * Test hồi quy cho MỘT lớp lỗi: mục chỉ có tiếng Việt biến mất khỏi kho.
 *
 *   node scripts/crawl/test-lang-variants.mjs
 *
 * Vì sao đáng có một file riêng cho đúng một hàm: lỗi này không tạo ra triệu
 * chứng nào. Nguồn vẫn báo `ok`, `updated_at` vẫn được ghi nhận, số chunk vẫn
 * hợp lý, mọi van an toàn ở giai đoạn 5 vẫn xanh — chỉ có một bài viết là không
 * bao giờ vào chỉ mục. Không có bài test thì cách duy nhất phát hiện là có người
 * tình cờ hỏi chatbot về đúng bài đó.
 *
 * Bản trước lọc `docs.filter(d => d.lang === 'en')` để khử trùng cặp song ngữ.
 * Nó đúng với cặp song ngữ và sai với mọi thứ khác, nên phần lớn ca dưới đây là
 * để chốt rằng việc khử trùng KHÔNG được lan sang những thứ nó không có quyền
 * đụng vào.
 */
import { collapseLangVariants, docIdentity } from './lib/json-source.mjs'

let fail = 0
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`)
}
const ids = (docs) => collapseLangVariants(docs).map((d) => `${d.slug}/${d.lang ?? '-'}`)

// ─── Ca chính: đúng thứ đã hỏng ────────────────────────────────────────────
check(
  'muc chi co tieng Viet khong bi vut di',
  ids([{ slug: 'a', lang: 'en' }, { slug: 'b', lang: 'vi' }]),
  ['a/en', 'b/vi']
)
check(
  'cap song ngu + mot muc vi-only: gop cap, giu muc kia',
  ids([{ slug: 'a', lang: 'en' }, { slug: 'a', lang: 'vi' }, { slug: 'b', lang: 'vi' }]),
  ['a/en', 'b/vi']
)
check(
  'ca collection chi co tieng Viet: giu nguyen',
  ids([{ slug: 'a', lang: 'vi' }, { slug: 'b', lang: 'vi' }]),
  ['a/vi', 'b/vi']
)

// ─── Việc khử trùng vẫn phải làm đúng ──────────────────────────────────────
check('cap song ngu cung dinh danh: gop lam mot', ids([{ slug: 'a', lang: 'vi' }, { slug: 'a', lang: 'en' }]), ['a/en'])
check('uu tien en du en dung sau', ids([{ slug: 'a', lang: 'vi' }, { slug: 'a', lang: 'en' }]), ['a/en'])

// ─── Không được lan sang thứ khác ──────────────────────────────────────────
// publications không có trường `lang`: hai bản ghi trùng tiêu đề là hai công bố
// khác nhau, gộp chúng mới là mất dữ liệu.
check(
  'khong khai lang, trung dinh danh: giu ca hai',
  collapseLangVariants([{ title: 'X', year: 2024 }, { title: 'X', year: 2019 }]).map((d) => d.year),
  [2024, 2019]
)
check(
  'cung mot lang, trung dinh danh: giu ca hai',
  collapseLangVariants([{ title: 'X', lang: 'vi', year: 1 }, { title: 'X', lang: 'vi', year: 2 }]).map((d) => d.year),
  [1, 2]
)

// Thứ tự quyết định thứ tự dòng trong chunk, thứ tự dòng quyết định hash, và
// hash quyết định có phải embed lại hay không. Xáo trộn = embed lại vô cớ.
check(
  'giu nguyen thu tu goc',
  ids([{ slug: 'c', lang: 'vi' }, { slug: 'a', lang: 'en' }, { slug: 'a', lang: 'vi' }, { slug: 'b', lang: 'vi' }]),
  ['c/vi', 'a/en', 'b/vi']
)

check('mang rong', collapseLangVariants([]), [])
check(
  'docIdentity: slug > title > name > id',
  [docIdentity({ slug: 's', title: 't' }), docIdentity({ title: 't', name: 'n' }), docIdentity({ name: 'n', id: 'i' }), docIdentity({ id: 'i' })],
  ['s', 't', 'n', 'i']
)

console.log(fail ? `\n${fail} test HONG` : '\nTat ca PASS')
process.exitCode = fail ? 1 : 0
