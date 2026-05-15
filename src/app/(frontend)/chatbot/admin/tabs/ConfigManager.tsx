'use client'

import React, { useEffect, useState } from 'react'
import { configService, getChatbotErrorDetail } from '@/services/chatbot'
import type { ConfigOut } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

export default function ConfigManager({ token }: { token: string }) {
  const [config, setConfig] = useState<ConfigOut | null>(null)

  const fetchConfig = async () => {
    try {
      const data = await configService.get()
      setConfig(data)
    } catch (e) {
      console.error('Không thể tải cấu hình', e)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return
    try {
      await configService.update(
        {
          similarity_threshold: config.similarity_threshold,
          margin_threshold: config.margin_threshold,
          log_retention_days: config.log_retention_days,
          support_email: config.support_email || null,
        },
        token,
      )
      toast.success('Cập nhật cấu hình thành công.')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Lỗi khi cập nhật cấu hình.')
    }
  }

  if (!config) return <p>Đang tải cấu hình hệ thống...</p>

  return (
    <div>
      <h2 className={styles.sectionTitle}>Cấu hình hệ thống</h2>
      <div className={styles.card}>
        <form onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ngưỡng tương đồng</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              value={config.similarity_threshold}
              onChange={(e) =>
                setConfig({ ...config, similarity_threshold: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ngưỡng chênh lệch</label>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              value={config.margin_threshold}
              onChange={(e) =>
                setConfig({ ...config, margin_threshold: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Thời gian lưu log (ngày)</label>
            <input
              className={styles.input}
              type="number"
              value={config.log_retention_days}
              onChange={(e) =>
                setConfig({ ...config, log_retention_days: parseInt(e.target.value) })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email hỗ trợ</label>
            <input
              className={styles.input}
              type="email"
              value={config.support_email || ''}
              onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
              placeholder="support@example.com"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <button type="submit" className={styles.btnPrimary}>
              Cập nhật tham số
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
