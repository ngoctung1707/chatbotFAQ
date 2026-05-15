'use client'

import React, { useEffect, useState } from 'react'
import { getChatbotErrorDetail, userService } from '@/services/chatbot'
import type { UserOut } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

export default function UserManager({ token }: { token: string }) {
  const [users, setUsers] = useState<UserOut[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserOut | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const fetchUsers = async () => {
    try {
      const data = await userService.list(token)
      setUsers(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userService.create({ username, password, full_name: fullName || null }, token)
      setUsername('')
      setPassword('')
      setFullName('')
      setShowCreateModal(false)
      fetchUsers()
      toast.success('Đã tạo người dùng')
    } catch (e) {
      toast.error(
        getChatbotErrorDetail(e) || 'Không thể tạo người dùng. Vui lòng dùng tên đăng nhập khác.',
      )
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    try {
      await userService.delete(id, token)
      fetchUsers()
      toast.success('Đã xóa người dùng')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể xóa người dùng')
    }
  }

  const getRandomInt = (max: number) => {
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const array = new Uint32Array(1)
      crypto.getRandomValues(array)
      return array[0] % max
    }
    return Math.floor(Math.random() * max)
  }

  const generateStrongPassword = (length = 12) => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const symbols = '!@#$%^&*()-_=+[]{}<>?'
    const all = `${upper}${lower}${digits}${symbols}`

    const pick = (chars: string) => chars[getRandomInt(chars.length)]
    const result = [pick(upper), pick(lower), pick(digits), pick(symbols)]

    for (let i = result.length; i < length; i++) {
      result.push(pick(all))
    }

    for (let i = result.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1)
      ;[result[i], result[j]] = [result[j], result[i]]
    }

    return result.join('')
  }

  const openEdit = (user: UserOut) => {
    setEditingUser(user)
    setEditFullName(user.full_name || '')
    setEditPassword('')
    setEditIsActive(user.is_active)
    setShowPassword(false)
    setShowEditModal(true)
  }

  const closeEdit = () => {
    setShowEditModal(false)
    setEditingUser(null)
    setEditPassword('')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      await userService.update(
        editingUser.id,
        {
          full_name: editFullName || null,
          is_active: editIsActive,
          password: editPassword ? editPassword : null,
        },
        token,
      )
      closeEdit()
      fetchUsers()
      toast.success('Đã cập nhật người dùng')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể cập nhật người dùng.')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Quản lý quản trị viên</h2>
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Danh sách Quản trị viên
          </h3>
          <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
            Thêm mới
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Mật khẩu</th>
              <th>Họ tên</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style={{ width: '15%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>******</td>
                <td>{u.full_name || '-'}</td>
                <td>
                  <span
                    className={`${styles.statusToggle} ${
                      u.is_active ? styles.statusToggleActive : styles.statusToggleInactive
                    }`}
                    role="switch"
                    aria-checked={u.is_active}
                    aria-label={u.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                  >
                    <span className={styles.statusKnob} />
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className={styles.actionCell}>
                  <button className={styles.btnSecondary} onClick={() => openEdit(u)}>
                    Sửa
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(u.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Thêm Quản trị viên</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleAdd} autoComplete="off">
                <div className={styles.row}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Tên đăng nhập</label>
                    <input
                      className={styles.input}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="new-username"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Mật khẩu</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Họ tên</label>
                    <input
                      className={styles.input}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="off"
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
                    Tạo Quản trị viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cập nhật quản trị viên</h3>
              <button className={styles.modalCloseBtn} onClick={closeEdit} aria-label="Đóng">
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleUpdate}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ tên</label>
                  <input
                    className={styles.input}
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mật khẩu</label>
                  <div style={{ display: 'flex' }}>
                    <div className={styles.passwordField} aria-label="Chỉnh sửa mật khẩu">
                      <input
                        className={`${styles.input} ${styles.inputWithIcons}`}
                        type={showPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Để trống nếu không đổi"
                      />
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.iconButtonLeft}`}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = generateStrongPassword(12)
                        setEditPassword(next)
                        setShowPassword(true)
                      }}
                      aria-label="Tạo mật khẩu mạnh"
                      className={`${styles.iconButtonRight}`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Trạng thái</label>
                  <button
                    type="button"
                    className={`${styles.statusToggle} ${styles.statusToggleButton} ${
                      editIsActive ? styles.statusToggleActive : styles.statusToggleInactive
                    }`}
                    onClick={() => setEditIsActive((prev) => !prev)}
                    role="switch"
                    aria-checked={editIsActive}
                  >
                    <span className={styles.statusKnob} />
                  </button>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={closeEdit}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Lưu thay đổi
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
