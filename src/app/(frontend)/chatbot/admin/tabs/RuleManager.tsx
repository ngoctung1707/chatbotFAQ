'use client'

import React, { useEffect, useState } from 'react'
import { getChatbotErrorDetail, rewriteService } from '@/services/chatbot'
import type { RewriteOut } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

export default function RuleManager() {
  const [rules, setRules] = useState<RewriteOut[]>([])
  const [loading, setLoading] = useState(false)

  const [rawText, setRawText] = useState('')
  const [normalizedText, setNormalizedText] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ raw_text: '', normalized_text: '', is_active: true })

  const fetchRules = async () => {
    setLoading(true)
    try {
      const data = await rewriteService.list()
      setRules(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await rewriteService.create({ raw_text: rawText, normalized_text: normalizedText })
      setRawText('')
      setNormalizedText('')
      setShowCreateModal(false)
      fetchRules()
      toast.success('Đã tạo quy tắc')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể tạo quy tắc')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) return
    try {
      await rewriteService.delete(id)
      fetchRules()
      toast.success('Đã xóa quy tắc')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể xóa quy tắc')
    }
  }

  const startEdit = (rule: RewriteOut) => {
    setEditingId(rule.id)
    setEditForm({
      raw_text: rule.raw_text,
      normalized_text: rule.normalized_text,
      is_active: rule.is_active,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await rewriteService.update(editingId, editForm)
      setEditingId(null)
      fetchRules()
      toast.success('Đã cập nhật quy tắc')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể cập nhật quy tắc')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Quản lý quy tắc (Chuẩn hóa)</h2>

      <div className={styles.card}>
        <div className={`${styles.cardHeaderRow} ${styles.cardHeaderSticky}`}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Danh sách quy tắc
          </h3>
          <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
            Thêm mới
          </button>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th style={{ width: '35%' }}>Câu gốc</th>
                  <th style={{ width: '35%' }}>Câu chuẩn hóa</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td style={{ paddingRight: '16px' }}>
                      {editingId === r.id ? (
                        <input
                          className={styles.input}
                          style={{ width: '100%', padding: '8px' }}
                          value={editForm.raw_text}
                          onChange={(e) => setEditForm({ ...editForm, raw_text: e.target.value })}
                        />
                      ) : (
                        r.raw_text
                      )}
                    </td>
                    <td style={{ paddingRight: '16px' }}>
                      {editingId === r.id ? (
                        <input
                          className={styles.input}
                          style={{ width: '100%', padding: '8px' }}
                          value={editForm.normalized_text}
                          onChange={(e) =>
                            setEditForm({ ...editForm, normalized_text: e.target.value })
                          }
                        />
                      ) : (
                        r.normalized_text
                      )}
                    </td>
                    <td>
                      {editingId === r.id ? (
                        <button
                          type="button"
                          className={`${styles.statusToggle} ${styles.statusToggleButton} ${
                            editForm.is_active
                              ? styles.statusToggleActive
                              : styles.statusToggleInactive
                          }`}
                          onClick={() =>
                            setEditForm({ ...editForm, is_active: !editForm.is_active })
                          }
                          role="switch"
                          aria-checked={editForm.is_active}
                        >
                          <span className={styles.statusKnob} />
                        </button>
                      ) : (
                        <span
                          className={`${styles.statusToggle} ${
                            r.is_active ? styles.statusToggleActive : styles.statusToggleInactive
                          }`}
                          role="switch"
                          aria-checked={r.is_active}
                          aria-label={r.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                        >
                          <span className={styles.statusKnob} />
                        </span>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className={styles.actionCell}>
                        {editingId === r.id ? (
                          <>
                            <button className={styles.btnPrimary} onClick={saveEdit}>
                              Lưu
                            </button>
                            <button
                              className={styles.btnSecondary}
                              onClick={() => setEditingId(null)}
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button className={styles.btnSecondary} onClick={() => startEdit(r)}>
                              Sửa
                            </button>
                            <button className={styles.btnDanger} onClick={() => handleDelete(r.id)}>
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      Không có quy tắc nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo quy tắc mới</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleCreate}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Câu hỏi gốc</label>
                    <input
                      className={styles.input}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="VD: mk"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Câu chuẩn hóa</label>
                    <input
                      className={styles.input}
                      value={normalizedText}
                      onChange={(e) => setNormalizedText(e.target.value)}
                      placeholder="VD: mật khẩu"
                      required
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Lưu quy tắc
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
