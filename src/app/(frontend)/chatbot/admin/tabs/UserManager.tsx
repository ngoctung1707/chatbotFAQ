'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { authService, getChatbotErrorDetail, userService } from '@/services/chatbot'
import type { UserOut } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

type UserManagerProps = {
  currentUser?: { username: string; role: string } | null
  isAdmin?: boolean
}

export default function UserManager({ currentUser, isAdmin = false }: UserManagerProps) {
  const [users, setUsers] = useState<UserOut[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserOut | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false)
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false)

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const data = await userService.list()
        setUsers(data || [])
      } else {
        const data = await authService.me()
        if (data) {
          const userOut: UserOut = {
            id: data.id,
            username: data.username,
            full_name: data.full_name,
            is_active: data.is_active,
            role: data.role,
            created_at: null,
          }
          setUsers([userOut])
        } else {
          setUsers([])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Bạn không có quyền tạo người dùng')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp. Vui lòng nhập lại.')
      return
    }
    try {
      await userService.create({ username, password, full_name: fullName || null })
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setShowCreatePassword(false)
      setShowCreateConfirmPassword(false)
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
    if (!isAdmin) {
      toast.error('Bạn không có quyền xóa người dùng')
      return
    }
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    try {
      await userService.delete(id)
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

  const canEditUser = useMemo(() => {
    return (user: UserOut) => {
      if (isAdmin) return true
      if (!currentUser?.username) return false
      return user.username === currentUser.username
    }
  }, [currentUser?.username, isAdmin])

  const visibleUsers = useMemo(() => {
    if (isAdmin) return users
    if (!currentUser?.username) return []
    return users.filter((user) => user.username === currentUser.username)
  }, [currentUser?.username, isAdmin, users])

  const openEdit = (user: UserOut) => {
    if (!canEditUser(user)) {
      toast.error('Bạn chỉ có thể chỉnh sửa tài khoản của mình')
      return
    }
    setEditingUser(user)
    setEditFullName(user.full_name || '')
    setEditPassword('')
    setEditConfirmPassword('')
    setEditIsActive(user.is_active)
    setShowPassword(false)
    setShowEditConfirmPassword(false)
    setShowEditModal(true)
  }

  const closeEdit = () => {
    setShowEditModal(false)
    setEditingUser(null)
    setEditPassword('')
    setEditConfirmPassword('')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    if (!isAdmin && editingUser.username !== currentUser?.username) {
      toast.error('Bạn chỉ có thể chỉnh sửa tài khoản của mình')
      return
    }
    if (editPassword && editPassword !== editConfirmPassword) {
      toast.error('Mật khẩu không khớp. Vui lòng nhập lại.')
      return
    }
    try {
      await userService.update(editingUser.id, {
        full_name: editFullName || null,
        is_active: isAdmin ? editIsActive : undefined,
        password: editPassword ? editPassword : null,
      })
      closeEdit()
      fetchUsers()
      toast.success('Đã cập nhật người dùng')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể cập nhật người dùng.')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Quản lý tài khoản</h2>
      <div className={styles.card}>
        <div className={`${styles.cardHeaderRow} ${styles.cardHeaderSticky}`}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Danh sách tài khoản
          </h3>
          {isAdmin && (
            <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
              Thêm mới
            </button>
          )}
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Mật khẩu</th>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style={{ width: '15%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>******</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.role || '-'}</td>
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
                <td>
                  {new Date(u.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td className={styles.actionCell}>
                  {canEditUser(u) && (
                    <button className={styles.btnSecondary} onClick={() => openEdit(u)}>
                      Sửa
                    </button>
                  )}
                  {isAdmin && u.role !== 'admin' && (
                    <button className={styles.btnDanger} onClick={() => handleDelete(u.id)}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && isAdmin && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Thêm tài khoản</h3>
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
                    <label className={styles.label}>Họ và tên</label>
                    <input
                      className={styles.input}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
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
                    <div className={styles.passwordField} aria-label="Nhap mat khau">
                      <input
                        className={`${styles.input} ${styles.inputWithIcons}`}
                        type={showCreatePassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.iconButtonLeft}`}
                        onClick={() => setShowCreatePassword((prev) => !prev)}
                        aria-label={showCreatePassword ? 'An mat khau' : 'Hien mat khau'}
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
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Nhập lại mật khẩu</label>
                    <div className={styles.passwordField} aria-label="Nhập lại mật khẩu">
                      <input
                        className={`${styles.input} ${styles.inputWithIcons}`}
                        type={showCreateConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.iconButtonLeft}`}
                        onClick={() => setShowCreateConfirmPassword((prev) => !prev)}
                        aria-label={showCreateConfirmPassword ? 'An mat khau' : 'Hien mat khau'}
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
                    Tạo tài khoản
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
              <h3 className={styles.modalTitle}>Cập nhật tài khoản</h3>
              <button className={styles.modalCloseBtn} onClick={closeEdit} aria-label="Đóng">
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleUpdate}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ và tên</label>
                  <input
                    className={styles.input}
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <label className={styles.label}>Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = generateStrongPassword(12)
                        setEditPassword(next)
                        setEditConfirmPassword('')
                        setShowPassword(true)
                      }}
                      aria-label="Tạo mật khẩu mạnh"
                      className={`${styles.iconButtonRight}`}
                    >
                      Reset
                    </button>
                  </div>
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
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nhập lại mật khẩu</label>
                  <div className={styles.passwordField} aria-label="Nhập lại mật khẩu">
                    <input
                      className={`${styles.input} ${styles.inputWithIcons}`}
                      type={showEditConfirmPassword ? 'text' : 'password'}
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      placeholder="Để trống nếu không đổi"
                    />
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonLeft}`}
                      onClick={() => setShowEditConfirmPassword((prev) => !prev)}
                      aria-label={showEditConfirmPassword ? 'An mat khau' : 'Hien mat khau'}
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
                </div>
                {isAdmin && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Trạng thái</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        className={`${styles.statusToggle} ${styles.statusToggleButton} ${
                          editIsActive ? styles.statusToggleActive : styles.statusToggleInactive
                        }`}
                        onClick={() => setEditIsActive((prev) => !prev)}
                        role="switch"
                        aria-checked={editIsActive}
                        disabled={editingUser?.role === 'admin'}
                      >
                        <span className={styles.statusKnob} />
                      </button>
                      <span style={{ fontSize: '14px' }}>
                        {editIsActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                      </span>
                    </div>
                  </div>
                )}
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
