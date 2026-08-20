'use client'

/**
 * MỤC 6.2 — báo cáo lần chạy gần nhất của job cập nhật dữ liệu.
 *
 * Không ai thức lúc 2h sáng chủ nhật. Tab này để sáng hôm sau liếc một cái là
 * biết đêm qua ổn không, thay vì phải mở file JSON trên máy chủ.
 *
 * Thứ tự hiển thị đi theo thứ tự cần biết: có sự cố gì không, rồi mới đến chi
 * tiết. Ba danh sách đỏ (selector vỡ, lỗi, nội dung đã gỡ) đặt lên trên vì
 * chúng là thứ cần người xử lý; các con số thống kê đặt dưới.
 */

import React, { useCallback, useEffect, useState } from 'react'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

interface CrawlReport {
  ok: boolean
  aborted: string | null
  partial?: string | null
  started_at: string | null
  finished_at: string | null
  duration_sec: number | null
  change_rate: number | null
  totals: Record<string, number>
  sources: { total: number; ok: number; skipped: number; failed: number }
  broken: { source_id: string; lang: string; error: string }[]
  errors: { source_id: string; message: string }[]
  gone: { source_id: string; url: string }[]
  stale?: { source_id: string; fail_runs: number }[]
  pending_routes: number
  maintenance: { active: boolean; message: string; since: string | null }
  reason?: string
}

/** Giờ Việt Nam, vì máy chủ chạy UTC và báo cáo lưu mốc ISO có offset. */
const formatTime = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

const formatDuration = (sec: number | null) => {
  if (sec == null) return '—'
  if (sec < 60) return `${sec} giây`
  return `${Math.floor(sec / 60)} phút ${sec % 60} giây`
}

// Chỉ những khoá có mặt ở đây mới được hiện. Nhờ vậy các bản kế hoạch cũ còn
// mang `from_cache` / `to_embed` — hai con số pha A từng tự suy ra bằng sai
// khoá, luôn cho ra "0 lấy được từ cache" — sẽ lặng lẽ biến mất thay vì hiện
// một con số mâu thuẫn với log của job.
const LABELS: Record<string, string> = {
  chunks: 'Tổng chunk trong kho',
  chunks_this_source: 'Chunk của nguồn vừa chạy tay',
  need_embed: 'Mới hoặc đã đổi so với lần crawl trước',
  // Con số này do `cache-report.ts` đóng dấu vào kế hoạch, vì chỉ nó dùng đúng
  // khoá cache (băm của chuỗi được embed, không phải của riêng `content`).
  must_embed: 'Thật sự phải chạy model',
  to_remove: 'Cần xoá',
  discovered: 'Route mới phát hiện',
}

export default function CrawlReportManager() {
  const [report, setReport] = useState<CrawlReport | null>(null)
  // Khởi tạo `true`, không phải `false`. Lần render đầu xảy ra TRƯỚC khi
  // useEffect chạy, nên để `false` thì nhánh "chưa có report" được hiểu thành
  // lỗi và người dùng thấy chớp một thông báo đỏ "Không đọc được báo cáo" rồi
  // mới thấy dữ liệu.
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chatbot/crawl-report', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReport((await res.json()) as CrawlReport)
    } catch (err) {
      toast.error(`Không đọc được báo cáo: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !report) return <div className={styles.card}>Đang tải…</div>

  if (report && report.reason) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Cập nhật dữ liệu</div>
        <p>Chưa có lần chạy nào. ({report.reason})</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>Cập nhật dữ liệu</div>
        <p className={styles.errorText}>Không đọc được báo cáo.</p>
        <button className={styles.btnSecondary} onClick={() => void load()}>
          Thử lại
        </button>
      </div>
    )
  }

  const hasIssue =
    !report.ok ||
    report.broken.length > 0 ||
    report.errors.length > 0 ||
    (report.stale?.length ?? 0) > 0

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <div className={styles.cardTitle}>Lần cập nhật gần nhất</div>
          <button className={styles.btnSecondary} onClick={() => void load()} disabled={loading}>
            {loading ? 'Đang tải…' : 'Tải lại'}
          </button>
        </div>

        {report.maintenance.active && (
          <p className={styles.errorText}>
            ĐANG BẢO TRÌ — chatbot tạm dừng trả lời
            {report.maintenance.since ? ` từ ${formatTime(report.maintenance.since)}` : ''}.
          </p>
        )}

        {report.partial && (
          <p className={styles.errorText}>
            Đây là một lần <strong>chạy tay một nguồn</strong> (<code>--source={report.partial}</code>),
            không phải lần chạy tuần. Các con số bên dưới chỉ nói về nguồn đó — những nguồn
            khác không được kiểm trong lần này.
          </p>
        )}

        {report.aborted && (
          <p className={styles.errorText}>
            Lần chạy bị HUỶ bởi van an toàn: <code>{report.aborted}</code>. Chỉ mục cũ được
            giữ nguyên.
          </p>
        )}

        {!hasIssue && !report.aborted && !report.partial && (
          <p className={styles.successText}>Chạy sạch, không có sự cố.</p>
        )}

        <table className={styles.table}>
          <tbody>
            <tr>
              <td>Bắt đầu</td>
              <td>{formatTime(report.started_at)}</td>
            </tr>
            <tr>
              <td>Kết thúc</td>
              <td>{formatTime(report.finished_at)}</td>
            </tr>
            <tr>
              <td>Thời lượng</td>
              <td>{formatDuration(report.duration_sec)}</td>
            </tr>
            <tr>
              <td>Nguồn</td>
              <td>
                {report.sources.ok} chạy · {report.sources.skipped} không đổi ·{' '}
                {report.sources.failed} lỗi (tổng {report.sources.total})
              </td>
            </tr>
            <tr>
              <td>Tỉ lệ thay đổi</td>
              <td>
                {report.change_rate == null ? '—' : `${(report.change_rate * 100).toFixed(0)}%`}
                {report.change_rate != null && report.change_rate > 0.3 && ' — cao bất thường'}
              </td>
            </tr>
            <tr>
              <td>Route chờ duyệt</td>
              <td>{report.pending_routes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {(report.stale?.length ?? 0) > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Nguồn đã ngừng cập nhật — cần người xem</div>
          <p>
            Những nguồn này hỏng nhiều lần chạy liên tiếp, nên gần như chắc chắn không còn
            là sự cố mạng nhất thời. Chúng vẫn đang phục vụ bằng chunk cũ, nghĩa là chatbot
            không hề báo lỗi — nó chỉ lặng lẽ trả lời bằng dữ liệu đứng yên từ nhiều tuần
            trước. Kiểm tra selector trong registry hoặc URL đã đổi.
          </p>
          <table className={styles.table}>
            <tbody>
              {report.stale?.map((s, i) => (
                <tr key={i}>
                  <td>{s.source_id}</td>
                  <td>hỏng {s.fail_runs} lần chạy liên tiếp</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.broken.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Selector vỡ — chunk cũ được giữ nguyên</div>
          <p>
            Trang trích được ít hơn ngưỡng khai trong registry. Đây KHÔNG phải nội dung bị
            xoá, mà nhiều khả năng là giao diện web đã đổi.
          </p>
          <table className={styles.table}>
            <tbody>
              {report.broken.map((b, i) => (
                <tr key={i}>
                  <td>{b.source_id}</td>
                  <td>{b.lang}</td>
                  <td>{b.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.errors.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Lỗi</div>
          <table className={styles.table}>
            <tbody>
              {report.errors.map((e, i) => (
                <tr key={i}>
                  <td>{e.source_id}</td>
                  <td>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.gone.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Nội dung trả 404</div>
          <p>Phải vắng mặt hai lần chạy liên tiếp mới bị xoá khỏi kho.</p>
          <table className={styles.table}>
            <tbody>
              {report.gone.map((g, i) => (
                <tr key={i}>
                  <td>{g.source_id}</td>
                  <td>{g.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Số liệu</div>
        <table className={styles.table}>
          <tbody>
            {Object.entries(report.totals)
              .filter(([k]) => k in LABELS)
              .map(([k, v]) => (
                <tr key={k}>
                  <td>{LABELS[k]}</td>
                  <td>{v}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
