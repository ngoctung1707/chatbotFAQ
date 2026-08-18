import { notFound } from 'next/navigation'
import CrawlReportManager from '../tabs/CrawlReportManager'
import styles from '../page.module.css'

/**
 * Trang xem thử tab "Cập nhật dữ liệu" mà không cần đăng nhập.
 *
 *   http://localhost:3000/chatbot/admin/preview
 *
 * Vì sao tồn tại: /chatbot/admin xác thực qua API bên ngoài
 * (chatbot-api.bkfin.tech), nên trên máy local không có tài khoản nào để đăng
 * nhập — và codebase này cũng không có hàm đăng ký. Không có đường nào xem được
 * giao diện nếu không có credential của dịch vụ đó.
 *
 * Cố ý KHÔNG nới lỏng cổng xác thực thật ở page.tsx. Một cửa hậu trong luồng
 * đăng nhập, dù có cờ môi trường canh, vẫn là thứ có thể bị bật nhầm. Trang
 * riêng thì chỉ cần xoá file là xong, và không có dòng nào của nó nằm trên
 * đường đi của người dùng thật.
 *
 * `notFound()` ở production là chốt chặn cuối: kể cả khi ai đó quên xoá file và
 * deploy lên, route này trả 404 chứ không lộ gì.
 *
 * XOÁ FILE NÀY khi đã xem xong.
 */
export default function AdminPreview() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className={styles.container}>
      <header className={styles.globalNav}>
        <div>Xem thử — Cập nhật dữ liệu (không cần đăng nhập, chỉ chạy ở dev)</div>
      </header>
      <main className={styles.main}>
        <CrawlReportManager />
      </main>
    </div>
  )
}
