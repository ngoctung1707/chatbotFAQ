/**
 * Tầng HTTP dùng chung cho cả hai đường thu thập.
 *
 * Ba thứ ở đây không phải trang trí:
 *
 *  - Concurrency chốt ở 3. Job chạy 2h sáng chủ nhật trên chính máy chủ đang
 *    phục vụ website; bắn 60 request song song là tự DDoS site của mình.
 *  - User-Agent nhận diện được, để nếu sau này ai đó xem log truy cập và thấy
 *    một client lạ quét cả site lúc nửa đêm thì biết đó là ai.
 *  - Phân biệt "không tìm thấy" với "không kiểm tra được". 404/410 là bằng
 *    chứng nội dung đã bị gỡ; timeout, 5xx, đứt mạng thì KHÔNG phải — chúng chỉ
 *    có nghĩa là lần này không biết. Toàn bộ cơ chế ân hạn ở mục 3.5 dựa vào
 *    việc phân biệt này, nên nó nằm ngay ở tầng thấp nhất thay vì để mỗi nơi
 *    gọi tự đoán.
 */

export const USER_AGENT =
  'BKFintechChatbotIndexer/1.0 (+https://fintech.hust.edu.vn; cap nhat du lieu chatbot hang tuan)'

const CONCURRENCY = 3
const TIMEOUT_MS = 20_000
const RETRIES = 3

/** Kết quả fetch: một trong ba trạng thái, không bao giờ ném lỗi ra ngoài. */
export const OK = 'ok'
export const GONE = 'gone' // 404/410 — bằng chứng đã bị gỡ
export const UNKNOWN = 'unknown' // timeout/5xx/mạng — không kết luận được gì

let inFlight = 0
const queue = []

function acquire() {
  if (inFlight < CONCURRENCY) {
    inFlight++
    return Promise.resolve()
  }
  return new Promise((resolve) => queue.push(resolve))
}

function release() {
  const next = queue.shift()
  if (next) next()
  else inFlight--
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * GET một URL. `lang` nếu có sẽ được gửi qua cookie NEXT_LOCALE — ngôn ngữ của
 * site nằm trong cookie chứ không trong URL, nên đây là cách duy nhất lấy được
 * bản tiếng Việt của một trang.
 */
export async function get(url, { lang, accept = 'text/html' } = {}) {
  await acquire()
  try {
    let lastStatus = 0
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), TIMEOUT_MS)
      try {
        const res = await fetch(url, {
          signal: ac.signal,
          redirect: 'follow',
          headers: {
            'user-agent': USER_AGENT,
            accept,
            ...(lang ? { cookie: `NEXT_LOCALE=${lang}` } : {}),
          },
        })
        lastStatus = res.status

        if (res.status === 404 || res.status === 410) {
          return { state: GONE, status: res.status, url }
        }
        if (res.ok) {
          return {
            state: OK,
            status: res.status,
            url,
            body: await res.text(),
            etag: res.headers.get('etag'),
            lastModified: res.headers.get('last-modified'),
          }
        }
        // 4xx khác (403, 400...) không tự khỏi khi thử lại — dừng ngay.
        if (res.status < 500) {
          return { state: UNKNOWN, status: res.status, url, error: `HTTP ${res.status}` }
        }
      } catch (err) {
        lastStatus = 0
        if (attempt === RETRIES) {
          return { state: UNKNOWN, status: 0, url, error: String(err?.message ?? err) }
        }
      } finally {
        clearTimeout(timer)
      }
      // Backoff 1s, 2s, 4s. Chỉ tới đây khi 5xx hoặc lỗi mạng còn lượt thử.
      await sleep(1000 * 2 ** (attempt - 1))
    }
    return { state: UNKNOWN, status: lastStatus, url, error: `het luot thu (HTTP ${lastStatus})` }
  } finally {
    release()
  }
}

/** GET và parse JSON. Trả cùng ba trạng thái như `get`. */
export async function getJson(url) {
  const res = await get(url, { accept: 'application/json' })
  if (res.state !== OK) return res
  try {
    return { ...res, json: JSON.parse(res.body) }
  } catch (err) {
    // JSON hỏng là "không kiểm tra được", không phải "đã bị gỡ".
    return { state: UNKNOWN, status: res.status, url, error: `JSON khong hop le: ${err.message}` }
  }
}
