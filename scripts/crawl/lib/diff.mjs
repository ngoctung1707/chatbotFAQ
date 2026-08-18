/**
 * Mục 3.2 và 3.3 — hai tầng lọc quyết định phải embed lại cái gì.
 *
 *   Tầng thô  — "trang nào cần xem lại?"    updatedAt (CMS) / page_hash (HTML)
 *   Tầng tinh — "đoạn nào thật sự phải embed?"  chunk_hash
 *
 * Vì sao phải có cả hai: `updatedAt` bị chạm khi BẤT KỲ trường nào đổi — thay
 * ảnh bìa, sửa tag, hay chỉ bấm Save. Tin nó tuyệt đối thì sẽ tắt chatbot để
 * embed lại cả bài chỉ vì ai đó đổi ảnh. Tầng tinh cho ra 0 chunk trong đúng
 * trường hợp đó.
 *
 * Và ngược lại, chỉ có tầng tinh thì mỗi tuần phải tải toàn bộ 28 nguồn về mới
 * biết có gì đổi. Tầng thô cắt phần lớn công việc đó.
 */
import { hashOf } from './chunk.mjs'

/**
 * So bộ chunk mới của MỘT nguồn với bộ đã lưu trong state.
 *
 * @returns {{added, changed, unchanged, removed, needEmbed}}
 *   `needEmbed` là danh sách chunk phải chạy model — phần còn lại lấy vector từ
 *   cache. Đây chính là con số quyết định cửa sổ bảo trì dài bao nhiêu.
 */
export function diffChunks(previousChunks, nextChunks) {
  const prev = new Map(Object.entries(previousChunks ?? {}))
  const added = []
  const changed = []
  const unchanged = []
  const seen = new Set()

  for (const c of nextChunks) {
    seen.add(c.chunk_id)
    const old = prev.get(c.chunk_id)
    if (old == null) added.push(c)
    else if (old !== c.chunk_hash) changed.push(c)
    else unchanged.push(c)
  }

  const removed = [...prev.keys()].filter((id) => !seen.has(id))
  return { added, changed, unchanged, removed, needEmbed: [...added, ...changed] }
}

/** Bản đồ chunk_id -> chunk_hash để ghi vào state. */
export const chunkMap = (chunks) => Object.fromEntries(chunks.map((c) => [c.chunk_id, c.chunk_hash]))

/**
 * Tầng thô cho nguồn JSON.
 *
 * `updatedAt` mới nhất trong toàn bộ document đại diện cho cả collection. Không
 * đổi so với lần trước nghĩa là chắc chắn không có gì mới — bỏ qua được cả việc
 * cắt chunk.
 *
 * Lưu ý: điều ngược lại KHÔNG đúng. `updatedAt` đổi không có nghĩa nội dung
 * đổi, nên nó chỉ được dùng để BỎ QUA, không bao giờ để kết luận "có thay đổi".
 */
export function latestUpdatedAt(docs) {
  let max = null
  for (const d of docs) {
    const t = d.updatedAt ?? d.createdAt
    if (t && (!max || t > max)) max = t
  }
  return max
}

/** Tầng thô cho nguồn HTML: hash của toàn bộ text sau khi gỡ khung. */
export const pageHash = (text) => hashOf(text)

/**
 * Cache vector, khoá bằng chunk_hash.
 *
 * Khoá suy từ NỘI DUNG chứ không từ vị trí: đổi slug mà không sửa chữ nào thì
 * chunk_id đổi hết nhưng hash không đổi, nên vẫn hit toàn bộ và không tốn giây
 * embed nào. Khoá theo chunk_id thì trường hợp đó miss sạch.
 */
export function planEmbedding(needEmbed, cachedHashes) {
  const fromCache = []
  const toEmbed = []
  for (const c of needEmbed) {
    if (cachedHashes.has(c.chunk_hash)) fromCache.push(c)
    else toEmbed.push(c)
  }
  return { fromCache, toEmbed }
}
