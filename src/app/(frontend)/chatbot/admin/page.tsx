'use client'

import React, { useState, useEffect } from 'react'
import {
  authService,
  faqService,
  configService,
  userService,
  rewriteService,
} from '@/services/chatbot'
import type { FAQOut, ConfigOut, UserOut, FAQCsvRow, RewriteOut } from '@/services/chatbot/types'
import styles from './page.module.css'
import ChatWindow from '../components/ChatWindow'

const parseCSV = (text: string): FAQCsvRow[] => {
  const lines = text.split(/\r?\n/)
  if (lines.length === 0) return []

  const parseLine = (line: string) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes
      } else if (line[i] === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += line[i]
      }
    }
    result.push(current)
    return result
  }

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase())
  const data: FAQCsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      let val = values[idx] || ''
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1)
      }
      val = val.replace(/""/g, '"').trim()
      row[h] = val
    })

    if (row.content && row.type) {
      data.push({
        answer_id: parseInt(row.answer_id) || 0,
        category: row.category || '',
        type: row.type || '',
        content: row.content || '',
        answer: row.answer || '',
      })
    }
  }
  return data
}

export default function ChatbotAdmin() {
  const [token, setToken] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Load token from local storage on mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('chatbot_admin_token')
    if (saved) setToken(saved)
  }, [])

  // Avoid hydration mismatch by waiting for mount
  if (!isMounted) return null

  if (!token) {
    return (
      <>
        <LoginView
          onLogin={(t) => {
            setToken(t)
            localStorage.setItem('chatbot_admin_token', t)
          }}
        />
        <ChatWindow />
      </>
    )
  }

  return (
    <>
      <DashboardView
        token={token}
        onLogout={() => {
          setToken(null)
          localStorage.removeItem('chatbot_admin_token')
        }}
      />
      <ChatWindow />
    </>
  )
}

function LoginView({ onLogin }: { onLogin: (t: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await authService.login({ username, password })
      if (res.access_token) {
        onLogin(res.access_token)
      } else {
        setError('Login failed: No access token received')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Admin Portal</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles.errorText}>{error}</div>}
          <div style={{ marginTop: '32px' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}>
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DashboardView({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'faq' | 'config' | 'users' | 'rules'>('faq')

  return (
    <div className={styles.container}>
      <header className={styles.globalNav}>
        <div>Chatbot Management System</div>
        <button onClick={onLogout}>Sign Out</button>
      </header>

      <nav className={styles.subNav}>
        <button
          className={activeTab === 'faq' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('faq')}
        >
          FAQ Management
        </button>
        <button
          className={activeTab === 'rules' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('rules')}
        >
          Rule Management
        </button>
        <button
          className={activeTab === 'config' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={activeTab === 'users' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('users')}
        >
          Admin Users
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'faq' && <FaqManager token={token} />}
        {activeTab === 'rules' && <RuleManager token={token} />}
        {activeTab === 'config' && <ConfigManager token={token} />}
        {activeTab === 'users' && <UserManager token={token} />}
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// FAQ Manager
// ──────────────────────────────────────────────────────────────────────────────
function FaqManager({ token }: { token: string }) {
  const [faqs, setFaqs] = useState<FAQOut[]>([])
  const [loading, setLoading] = useState(false)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [variantsInput, setVariantsInput] = useState('')

  // Inline edit state for FAQ list
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ category: '', question: '', answer: '' })
  const [newVariantText, setNewVariantText] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // CSV Import state
  const [previewData, setPreviewData] = useState<FAQCsvRow[] | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      try {
        const parsed = parseCSV(text)
        setPreviewData(parsed.length > 0 ? parsed : null)
      } catch (err) {
        alert('Lỗi khi đọc file CSV')
      }
    }
    reader.readAsText(file)
  }

  const handlePreviewEdit = (index: number, field: string, value: string) => {
    setPreviewData((prev) => {
      if (!prev) return prev
      const newD = [...prev]
      const oldRow = newD[index]

      const parsedValue = field === 'answer_id' ? parseInt(value) || 0 : value
      newD[index] = { ...oldRow, [field]: parsedValue } as FAQCsvRow

      // Cập nhật đồng bộ các biến thể nếu sửa thông tin chung trên câu hỏi chính
      if (
        oldRow.type?.toLowerCase() === 'question' &&
        ['answer_id', 'category', 'answer'].includes(field)
      ) {
        for (let i = 0; i < newD.length; i++) {
          if (
            i !== index &&
            newD[i].answer_id === oldRow.answer_id &&
            newD[i].type?.toLowerCase() !== 'question'
          ) {
            newD[i] = { ...newD[i], [field]: parsedValue } as FAQCsvRow
          }
        }
      }
      return newD
    })
  }

  const handlePreviewDelete = (index: number) => {
    setPreviewData((prev) => {
      if (!prev) return prev
      const itemToDelete = prev[index]

      if (itemToDelete.type?.toLowerCase() === 'question') {
        const newD = prev.filter((item) => item.answer_id !== itemToDelete.answer_id)
        return newD.length > 0 ? newD : null
      } else {
        const newD = [...prev]
        newD.splice(index, 1)
        return newD.length > 0 ? newD : null
      }
    })
  }

  const handleAddPreviewVariant = (answerId: number, insertIdx: number) => {
    setPreviewData((prev) => {
      if (!prev) return prev
      const newD = [...prev]
      const groupRows = newD.filter(
        (r) => r.answer_id === answerId && r.type?.toLowerCase() !== 'question',
      )
      const variantType = `variant_${groupRows.length + 1}`
      const parentRow = newD.find(
        (r) => r.answer_id === answerId && r.type?.toLowerCase() === 'question',
      )

      const newRow: FAQCsvRow = {
        answer_id: answerId,
        category: parentRow?.category || '',
        type: variantType,
        content: '',
        answer: parentRow?.answer || '',
      }
      newD.splice(insertIdx + 1, 0, newRow)
      return newD
    })
  }

  const handlePreviewSubmit = async () => {
    if (!previewData || previewData.length === 0) return
    try {
      await faqService.addRows(previewData, token)
      setPreviewData(null)
      fetchFaqs()
      alert('Nhập dữ liệu thành công!')
    } catch (e) {
      alert('Lỗi khi import FAQ qua file')
    }
  }

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const data = await faqService.list()
      setFaqs(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const variants = variantsInput
        .split('\n')
        .map((v) => v.trim())
        .filter((v) => v)
      await faqService.create(
        {
          question,
          answer,
          category: category || null,
          variants: variants.length > 0 ? variants : undefined,
        },
        token,
      )
      setQuestion('')
      setAnswer('')
      setCategory('')
      setVariantsInput('')
      fetchFaqs()
    } catch (e) {
      alert('Failed to add FAQ. Are you sure you have permission?')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    try {
      await faqService.delete(id, token)
      fetchFaqs()
    } catch (e) {
      alert('Failed to delete FAQ')
    }
  }
  const startEdit = (faq: FAQOut) => {
    setEditingId(faq.answer_id)
    setEditForm({
      category: faq.category || '',
      question: faq.question,
      answer: faq.answer,
    })
    setNewVariantText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await faqService.update(
        editingId,
        {
          category: editForm.category || null,
          question: editForm.question,
          answer: editForm.answer,
        },
        token,
      )
      setEditingId(null)
      fetchFaqs()
    } catch (e) {
      alert('Failed to save FAQ')
    }
  }

  const handleAddVariantAPI = async (answerId: number) => {
    if (!newVariantText.trim()) return
    try {
      await faqService.addVariant(answerId, { variant_text: newVariantText.trim() }, token)
      setNewVariantText('')
      fetchFaqs()
    } catch (e) {
      alert('Failed to add variant')
    }
  }

  const handleDeleteVariantAPI = async (answerId: number, variantId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biến thể này?')) return
    try {
      await faqService.deleteVariant(answerId, variantId, token)
      fetchFaqs()
    } catch (e) {
      alert('Failed to delete variant')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>FAQ Management</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Tạo câu hỏi mới</h3>
        <form onSubmit={handleAdd}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Câu hỏi chính (Question)</label>
            <input
              className={styles.input}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="VD: Mật khẩu mạnh cần đáp ứng những yêu cầu gì?"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Câu trả lời (Answer)</label>
            <textarea
              className={styles.textarea}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="VD: Mật khẩu mạnh cần ít nhất 12 ký tự, kết hợp chữ hoa,..."
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Biến thể câu hỏi (Variants)</label>
            <textarea
              className={styles.textarea}
              value={variantsInput}
              onChange={(e) => setVariantsInput(e.target.value)}
              placeholder="Nhập mỗi biến thể trên 1 dòng"
              style={{ minHeight: '60px' }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Danh mục (Category)</label>
            <input
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Mật khẩu"
            />
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Lưu FAQ
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Nhập dữ liệu từ File (CSV)</h3>
        <div className={styles.formGroup}>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
        {previewData && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h4 style={{ margin: 0 }}>Dữ liệu xem trước</h4>
              <div>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setPreviewData(null)}
                  style={{ marginRight: '8px' }}
                >
                  Hủy
                </button>
                <button className={styles.btnPrimary} onClick={handlePreviewSubmit}>
                  Thêm dữ liệu
                </button>
              </div>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '500px', marginBottom: '16px' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th style={{ width: '15%' }}>Danh mục</th>
                    <th>Loại</th>
                    <th style={{ width: '25%' }}>Nội dung (Content)</th>
                    <th style={{ width: '40%' }}>Câu trả lời (Answer)</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => {
                    const isQuestion = row.type?.toLowerCase() === 'question'
                    const isLastInGroup =
                      idx === previewData.length - 1 ||
                      previewData[idx + 1].answer_id !== row.answer_id

                    return (
                      <React.Fragment key={idx}>
                        <tr style={!isQuestion ? { backgroundColor: '#fafafc' } : {}}>
                          <td style={{ verticalAlign: 'top' }}>
                            {isQuestion && (
                              <input
                                className={styles.input}
                                style={{ width: '100%', padding: '8px' }}
                                type="number"
                                value={row.answer_id}
                                onChange={(e) =>
                                  handlePreviewEdit(idx, 'answer_id', e.target.value)
                                }
                              />
                            )}
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            {isQuestion && (
                              <input
                                className={styles.input}
                                style={{ width: '100%', padding: '8px' }}
                                value={row.category || ''}
                                onChange={(e) => handlePreviewEdit(idx, 'category', e.target.value)}
                              />
                            )}
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            <input
                              className={styles.input}
                              style={{ width: '100%', padding: '8px' }}
                              value={row.type}
                              onChange={(e) => handlePreviewEdit(idx, 'type', e.target.value)}
                            />
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            {!isQuestion ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <textarea
                                  className={styles.textarea}
                                  style={{ width: '100%', minHeight: '60px', padding: '8px' }}
                                  value={row.content}
                                  onChange={(e) =>
                                    handlePreviewEdit(idx, 'content', e.target.value)
                                  }
                                />
                              </div>
                            ) : (
                              <textarea
                                className={styles.textarea}
                                style={{ width: '100%', minHeight: '60px', padding: '8px' }}
                                value={row.content}
                                onChange={(e) => handlePreviewEdit(idx, 'content', e.target.value)}
                              />
                            )}
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            {isQuestion && (
                              <textarea
                                className={styles.textarea}
                                style={{ width: '100%', minHeight: '110px', padding: '8px' }}
                                value={row.answer || ''}
                                onChange={(e) => handlePreviewEdit(idx, 'answer', e.target.value)}
                              />
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <div className={styles.actionCell}>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handlePreviewDelete(idx)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isLastInGroup && (
                          <tr style={{ backgroundColor: '#fafafc' }}>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td colSpan={1} style={{ padding: '8px' }}>
                              <button
                                className={styles.btnSecondary}
                                onClick={() => handleAddPreviewVariant(row.answer_id, idx)}
                                style={{
                                  width: '100%',
                                  borderStyle: 'dashed',
                                  textAlign: 'center',
                                }}
                              >
                                + Thêm variant
                              </button>
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Danh sách Hỏi đáp
          </h3>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Danh mục</th>
                  <th style={{ width: '30%' }}>Câu hỏi</th>
                  <th style={{ width: '40%' }}>Câu trả lời</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {faqs
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((f) => (
                    <React.Fragment key={f.answer_id}>
                      <tr>
                        <td>{f.answer_id}</td>
                        <td>
                          {editingId === f.answer_id ? (
                            <input
                              className={styles.input}
                              style={{ padding: '8px', width: '100%' }}
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({ ...editForm, category: e.target.value })
                              }
                            />
                          ) : (
                            f.category || '-'
                          )}
                        </td>
                        <td style={{ paddingRight: '16px' }}>
                          {editingId === f.answer_id ? (
                            <textarea
                              className={styles.textarea}
                              style={{ padding: '8px', minHeight: '60px', width: '100%' }}
                              value={editForm.question}
                              onChange={(e) =>
                                setEditForm({ ...editForm, question: e.target.value })
                              }
                            />
                          ) : (
                            f.question
                          )}
                        </td>
                        <td style={{ paddingRight: '16px' }}>
                          {editingId === f.answer_id ? (
                            <textarea
                              className={styles.textarea}
                              style={{ padding: '8px', minHeight: '110px', width: '100%' }}
                              value={editForm.answer}
                              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                            />
                          ) : (
                            f.answer
                          )}
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div className={styles.actionCell}>
                            {editingId === f.answer_id ? (
                              <>
                                <button className={styles.btnPrimary} onClick={saveEdit}>
                                  Lưu
                                </button>
                                <button className={styles.btnSecondary} onClick={cancelEdit}>
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className={styles.btnSecondary}
                                  onClick={() => startEdit(f)}
                                >
                                  Sửa
                                </button>
                                <button
                                  className={styles.btnDanger}
                                  onClick={() => handleDelete(f.answer_id)}
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {f.variants?.length > 0 &&
                        f.variants.map((v) => (
                          <tr key={`var-${v.variant_id}`} style={{ backgroundColor: '#fafafc' }}>
                            <td></td>
                            <td></td>
                            <td
                              style={{ paddingRight: '16px', color: '#7a7a7a', fontSize: '14px' }}
                            >
                              ↳ {v.variant_text}
                            </td>
                            <td></td>
                            <td style={{ verticalAlign: 'middle' }}>
                              {editingId === f.answer_id && (
                                <button
                                  className={styles.btnDanger}
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  onClick={() => handleDeleteVariantAPI(f.answer_id, v.variant_id)}
                                >
                                  Xóa
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {editingId === f.answer_id && (
                        <tr style={{ backgroundColor: '#fafafc' }}>
                          <td></td>
                          <td></td>
                          <td style={{ paddingRight: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ color: '#7a7a7a' }}>↳</span>
                              <input
                                className={styles.input}
                                style={{ width: '100%', padding: '8px' }}
                                placeholder="Thêm variant"
                                value={newVariantText}
                                onChange={(e) => setNewVariantText(e.target.value)}
                              />
                            </div>
                          </td>
                          <td></td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <button
                              className={styles.btnPrimary}
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleAddVariantAPI(f.answer_id)}
                            >
                              + Thêm
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                {faqs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      Không có câu hỏi nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {faqs.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: '16px',
                  padding: '8px 0',
                }}
              >
                <button
                  className={styles.btnSecondary}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  Trang trước
                </button>
                <span style={{ fontSize: '14px', margin: '0 16px', color: '#555' }}>
                  Trang {currentPage} / {Math.ceil(faqs.length / itemsPerPage)}
                </span>
                <button
                  className={styles.btnSecondary}
                  disabled={currentPage === Math.ceil(faqs.length / itemsPerPage)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Configuration Manager
// ──────────────────────────────────────────────────────────────────────────────
function ConfigManager({ token }: { token: string }) {
  const [config, setConfig] = useState<ConfigOut | null>(null)
  const [msg, setMsg] = useState('')

  const fetchConfig = async () => {
    try {
      const data = await configService.get()
      setConfig(data)
    } catch (e) {
      console.error('Failed to fetch config', e)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return
    setMsg('')
    try {
      await configService.update(
        {
          similarity_threshold: config.similarity_threshold,
          margin_threshold: config.margin_threshold,
          log_retention_days: config.log_retention_days,
        },
        token,
      )
      setMsg('Cập nhật cấu hình thành công.')
    } catch (e) {
      setMsg('Lỗi khi cập nhật cấu hình.')
    }
  }

  if (!config) return <p>Đang tải cấu hình hệ thống...</p>

  return (
    <div>
      <h2 className={styles.sectionTitle}>System Configuration</h2>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Tham số AI Chatbot</h3>
        <form onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ngưỡng tương đồng (Similarity Threshold)</label>
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
            <label className={styles.label}>Ngưỡng chênh lệch (Margin Threshold)</label>
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
            <label className={styles.label}>Thời gian lưu Log (Log Retention Days)</label>
            <input
              className={styles.input}
              type="number"
              value={config.log_retention_days}
              onChange={(e) =>
                setConfig({ ...config, log_retention_days: parseInt(e.target.value) })
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <button type="submit" className={styles.btnPrimary}>
              Cập nhật tham số
            </button>
            {msg && (
              <span className={msg.includes('thành công') ? styles.successText : styles.errorText}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// User Manager
// ──────────────────────────────────────────────────────────────────────────────
function UserManager({ token }: { token: string }) {
  const [users, setUsers] = useState<UserOut[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

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
      fetchUsers()
    } catch (e) {
      alert('Failed to create user. Make sure the username is unique.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await userService.delete(id, token)
      fetchUsers()
    } catch (e) {
      alert('Failed to delete user')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Admin Users</h2>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Thêm Quản trị viên</h3>
        <form onSubmit={handleAdd}>
          <div className={styles.row}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className={styles.btnPrimary} style={{ marginTop: '8px' }}>
            Tạo Quản trị viên
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Danh sách Quản trị viên</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className={styles.actionCell}>
                  <button className={styles.btnDanger} onClick={() => handleDelete(u.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Rule Manager
// ──────────────────────────────────────────────────────────────────────────────
function RuleManager({ token }: { token: string }) {
  const [rules, setRules] = useState<RewriteOut[]>([])
  const [loading, setLoading] = useState(false)

  const [rawText, setRawText] = useState('')
  const [normalizedText, setNormalizedText] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ raw_text: '', normalized_text: '' })

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
      await rewriteService.create({ raw_text: rawText, normalized_text: normalizedText }, token)
      setRawText('')
      setNormalizedText('')
      fetchRules()
    } catch (e) {
      alert('Failed to create rule')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa rule này?')) return
    try {
      await rewriteService.delete(id, token)
      fetchRules()
    } catch (e) {
      alert('Failed to delete rule')
    }
  }

  const startEdit = (rule: RewriteOut) => {
    setEditingId(rule.id)
    setEditForm({
      raw_text: rule.raw_text,
      normalized_text: rule.normalized_text,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await rewriteService.update(editingId, editForm, token)
      setEditingId(null)
      fetchRules()
    } catch (e) {
      alert('Failed to update rule')
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Rule Management (Rewrite)</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Tạo Rule mới</h3>
        <form onSubmit={handleCreate}>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Câu hỏi gốc (Raw Text)</label>
              <input
                className={styles.input}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="VD: mk"
                required
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Câu hỏi chuẩn hóa (Normalized Text)</label>
              <input
                className={styles.input}
                value={normalizedText}
                onChange={(e) => setNormalizedText(e.target.value)}
                placeholder="VD: mật khẩu"
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.btnPrimary} style={{ marginTop: '8px' }}>
            Thêm Rule
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Danh sách Rules</h3>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th style={{ width: '35%' }}>Câu gốc (Raw)</th>
                  <th style={{ width: '35%' }}>Câu chuẩn hóa (Normalized)</th>
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
                    <td>{r.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
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
                      Không có Rules nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
