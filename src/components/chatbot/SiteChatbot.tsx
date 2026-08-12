'use client'

import { usePathname } from 'next/navigation'
import ChatbotWidget from './ChatbotWidget'
import { BASE_PATH as CYBER_CLINIC_BASE } from '@/modules/cyber-clinic/constants'

/**
 * Cổng gác cho widget chat toàn site.
 *
 * ChatbotWidget gắn ở root layout nên có mặt trên MỌI trang. Một vài khu vực
 * lại mang chatbot riêng: cyber-clinic dựng <ChatWindow /> trong layout của nó,
 * và cái đó gọi sang một backend khác hẳn (chatbot-api.bkfin.tech) chứ không
 * phải /api/chat. Trên các trang đó người dùng thấy hai nút chat cạnh nhau, hỏi
 * cùng một câu ra hai câu trả lời từ hai hệ thống khác nhau.
 *
 * Lọc ở client bằng usePathname() chứ không lọc ngay trong root layout: root
 * layout là server component, mà App Router không cho server component biết
 * đường dẫn hiện tại — không có API nào tương đương usePathname ở phía server.
 * usePathname vẫn chạy đúng trong lúc SSR của client component, nên widget bị
 * loại ngay từ HTML đầu tiên chứ không phải hiện lên rồi mới biến mất.
 *
 * Tách thành component riêng thay vì `return null` ngay trong ChatbotWidget để
 * cả cây con không mount trên các route này: ChatbotWidget sinh session id và
 * đăng ký listener 'pagehide' ngay khi mount, đều là việc thừa ở nơi nó không
 * hiển thị. Đổi lại ChatbotWidget không phải biết gì về routing.
 */

// Các khu vực tự có chatbot riêng. So khớp theo TIỀN TỐ nên phủ luôn mọi route
// con (/about, /learning-materials/[slug], /video/[slug]...). Thêm route mới
// vào đây khi nó có chatbot của riêng nó.
//
// Lưu ý: trang /chatbot/admin cũng dựng <ChatWindow /> nên cũng đang có hai
// widget. Cố ý CHƯA đưa vào đây — nó là trang quản trị, và ở đó có thể lại là
// chủ đích để so sánh hai backend cạnh nhau.
const ROUTES_WITH_OWN_CHATBOT = [CYBER_CLINIC_BASE]

export default function SiteChatbot() {
  const pathname = usePathname()
  // Optional chaining vì usePathname có thể trả về giá trị rỗng ở vài ngữ cảnh
  // render; khi chưa biết đang ở đâu thì cứ hiện widget — mặc định an toàn là
  // thừa một chatbot, không phải mất chatbot trên toàn site.
  if (ROUTES_WITH_OWN_CHATBOT.some((base) => pathname?.startsWith(base))) {
    return null
  }
  return <ChatbotWidget />
}
