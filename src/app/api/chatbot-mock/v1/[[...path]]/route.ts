import { NextRequest, NextResponse } from 'next/server'
import { notFound } from 'next/navigation'

/**
 * Backend giả cho việc phát triển ở máy local — CHỈ phần xác thực.
 *
 * Vì sao cần: trang /chatbot/admin gọi `https://chatbot-api.bkfin.tech/api/v1`,
 * một máy chủ khác (đã kiểm chứng: đang sống ở 202.191.56.58, trả 401). Nó
 * KHÔNG đọc Mongo local, nên tạo tài khoản trong DB trên máy bạn cũng vô ích.
 * Không có credential của dịch vụ đó thì không có đường nào đăng nhập được ở
 * local — kể cả khi mọi thứ khác chạy hoàn hảo.
 *
 * Bật lên bằng hai biến trong .env.local:
 *
 *   NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3000/api/chatbot-mock/v1
 *   CHATBOT_MOCK_ADMIN=admin:matkhau-tuy-y
 *
 * Bỏ hai dòng đó đi là quay lại backend thật, không phải sửa code.
 *
 * Phạm vi cố ý hẹp: chỉ /auth/login, /auth/me, /auth/logout, /auth/refresh.
 * Các tab khác (FAQ, quy tắc, cấu hình, tài khoản, lịch sử) sẽ báo lỗi vì
 * backend giả không có những endpoint đó — chấp nhận được, vì mục đích duy nhất
 * của nó là mở được cánh cửa đăng nhập để xem và thử phân quyền.
 *
 * KHÔNG BAO GIỜ chạy ở production: `notFound()` chặn ngay từ đầu mỗi handler,
 * nên kể cả file này lọt vào bản build thì mọi route của nó vẫn trả 404.
 */

const COOKIE = 'mock_session'

function guard() {
  if (process.env.NODE_ENV === 'production') notFound()
}

/** `username:password` — không có biến thì backend giả coi như tắt. */
function credentials(): { username: string; password: string } | null {
  const raw = process.env.CHATBOT_MOCK_ADMIN
  if (!raw) return null
  const idx = raw.indexOf(':')
  if (idx <= 0) return null
  return { username: raw.slice(0, idx), password: raw.slice(idx + 1) }
}

const me = (username: string) => ({
  id: 1,
  username,
  role: 'admin',
  full_name: 'Quản trị viên (local mock)',
  is_active: true,
})

const tail = (req: NextRequest) =>
  '/' + req.nextUrl.pathname.split('/api/chatbot-mock/v1/')[1]?.replace(/\/$/, '')

/**
 * Đọc thân request ở CẢ HAI dạng.
 *
 * `authService.login()` gửi `application/x-www-form-urlencoded` theo kiểu OAuth2
 * password flow, không phải JSON. Bản mock đầu tiên chỉ gọi `req.json()`, nên
 * nó luôn trả 401 cho trình duyệt — trong khi bài test bằng curl gửi JSON lại
 * "đạt". Bài test đó kiểm sai thứ, và sai theo hướng nguy hiểm nhất: nó báo
 * xanh trong khi đường đi thật thì hỏng.
 */
async function readBody(req: NextRequest): Promise<Record<string, string>> {
  const type = req.headers.get('content-type') ?? ''
  try {
    if (type.includes('application/json')) {
      const j = await req.json()
      return j && typeof j === 'object' ? (j as Record<string, string>) : {}
    }
    const text = await req.text()
    return Object.fromEntries(new URLSearchParams(text))
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  guard()
  const path = tail(req)
  const cred = credentials()

  if (path === '/auth/login') {
    if (!cred) {
      return NextResponse.json(
        { detail: 'Chua dat CHATBOT_MOCK_ADMIN trong .env.local' },
        { status: 500 },
      )
    }
    const body = await readBody(req)
    if (body.username !== cred.username || body.password !== cred.password) {
      // Cùng mã lỗi với backend thật để giao diện xử lý y hệt.
      return NextResponse.json({ detail: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 })
    }
    const res = NextResponse.json({ detail: 'Đăng nhập thành công' })
    res.cookies.set(COOKIE, cred.username, { httpOnly: true, sameSite: 'lax', path: '/' })
    return res
  }

  if (path === '/auth/refresh') {
    const user = req.cookies.get(COOKIE)?.value
    if (!user) return NextResponse.json({ detail: 'Chưa đăng nhập' }, { status: 401 })
    return NextResponse.json({ detail: 'OK' })
  }

  if (path === '/auth/logout') {
    const res = NextResponse.json({ detail: 'Đã đăng xuất' })
    res.cookies.delete(COOKIE)
    return res
  }

  return NextResponse.json({ detail: `Mock khong ho tro ${path}` }, { status: 404 })
}

export async function GET(req: NextRequest) {
  guard()
  const path = tail(req)

  if (path === '/auth/me') {
    const user = req.cookies.get(COOKIE)?.value
    if (!user) return NextResponse.json({ detail: 'Chưa đăng nhập' }, { status: 401 })
    return NextResponse.json(me(user))
  }

  return NextResponse.json({ detail: `Mock khong ho tro ${path}` }, { status: 404 })
}
