/**
 * Mục 3.1 và 3.5 — bộ nhớ giữa các lần chạy, và luật ân hạn khi nội dung biến mất.
 *
 * `crawl_state.json` là thứ duy nhất khiến job hàng tuần rẻ. Mất nó thì lần
 * chạy sau coi mọi thứ là mới và embed lại toàn bộ kho — downtime nhảy từ giây
 * lên phút. Backup nó cùng với cache embedding.
 *
 * Luật ân hạn (3.5) nằm ở đây vì nó là luật về TRẠNG THÁI, không phải về mạng:
 *
 *   404/410            -> bằng chứng đã bị gỡ. Đánh dấu missing_since.
 *   timeout/5xx/broken -> KHÔNG kết luận gì. Giữ nguyên mọi thứ.
 *   vắng mặt 2 lần liên tiếp -> lúc đó mới xoá chunk.
 *
 * Một lần site sập lúc 2h sáng không được phép xoá nội dung thật, và một
 * selector vỡ cũng không. Đó là lý do `broken` không bao giờ chạm vào
 * missing_since.
 */
import { readFile, writeFile } from 'node:fs/promises'

export const STATE_PATH = 'data/crawl_state.json'

/** Số lần chạy liên tiếp phải vắng mặt trước khi thật sự xoá. */
export const GRACE_RUNS = 2

export async function loadState(path = STATE_PATH) {
  try {
    const raw = JSON.parse(await readFile(path, 'utf-8'))
    return { version: 1, run: 0, sources: {}, ...raw }
  } catch {
    // Lần chạy đầu tiên. Không phải lỗi.
    return { version: 1, run: 0, sources: {} }
  }
}

export async function saveState(state, path = STATE_PATH) {
  await writeFile(path, JSON.stringify(state, null, 2) + '\n')
}

/** Bản ghi rỗng cho một nguồn chưa từng thấy. */
export function emptyEntry() {
  return {
    last_seen_at: null,
    missing_since: null,
    missing_runs: 0,
    updated_at: null, // nguồn JSON
    page_hash: {}, // nguồn HTML, theo lang
    chunks: {}, // chunk_id -> chunk_hash
  }
}

export const entryOf = (state, source_id) => state.sources[source_id] ?? emptyEntry()

/** Lấy được nội dung: xoá mọi dấu vết vắng mặt. */
export function markSeen(entry, at) {
  entry.last_seen_at = at
  entry.missing_since = null
  entry.missing_runs = 0
  return entry
}

/**
 * Nguồn trả 404/410. Tăng bộ đếm; chỉ khi đủ ngưỡng mới cho phép xoá.
 * @returns {boolean} true nếu ĐÃ đủ ân hạn và được phép xoá chunk.
 */
export function markMissing(entry, at) {
  entry.missing_runs = (entry.missing_runs ?? 0) + 1
  if (!entry.missing_since) entry.missing_since = at
  return entry.missing_runs >= GRACE_RUNS
}

/**
 * Nguồn không kiểm tra được (timeout, 5xx, selector vỡ).
 *
 * Cố ý KHÔNG đụng vào missing_runs. Nếu tính lỗi mạng vào ân hạn thì hai chủ
 * nhật site chậm liên tiếp sẽ xoá sạch nội dung thật.
 */
export function markUnknown(entry) {
  return entry
}
