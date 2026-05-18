'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { faqService, getChatbotErrorDetail } from '@/services/chatbot'
import type { FAQCsvRow, FAQOut } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

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

export default function FaqManager({ token }: { token: string }) {
  const [faqs, setFaqs] = useState<FAQOut[]>([])
  const [loading, setLoading] = useState(false)

  const pageSizeOptions = [20, 200, 500]
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [showCreateModal, setShowCreateModal] = useState(false)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [variantsInput, setVariantsInput] = useState('')

  const [createTab, setCreateTab] = useState<'manual' | 'import'>('manual')

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ category: '', question: '', answer: '' })
  const [newVariantText, setNewVariantText] = useState('')
  const [editVariants, setEditVariants] = useState<FAQOut['variants']>([])

  const [isPreviewSubmitting, setIsPreviewSubmitting] = useState(false)
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
        toast.error('Lỗi khi đọc file CSV')
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
      }
      const newD = [...prev]
      newD.splice(index, 1)
      return newD.length > 0 ? newD : null
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
    setIsPreviewSubmitting(true)
    try {
      await faqService.addRows(previewData, token)
      setPreviewData(null)
      fetchFaqs()
      toast.success('Nhập dữ liệu thành công!')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Lỗi khi import FAQ qua tệp')
    } finally {
      setIsPreviewSubmitting(false)
    }
  }

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const data = await faqService.list({
        page,
        page_size: pageSize,
        category: categoryFilter || undefined,
      })
      setFaqs(data?.items || [])
      setTotalPages(data?.total_pages || 1)
      setTotalItems(data?.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [page, pageSize, categoryFilter])

  const categories = useMemo(() => {
    const categorySet = new Set(
      faqs.map((f) => f.category).filter((value): value is string => Boolean(value)),
    )
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b))
  }, [faqs])

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return faqs.filter((faq) => {
      if (!query) return true
      const questionText = (faq.question || '').toLowerCase()
      const answerText = (faq.answer || '').toLowerCase()
      return questionText.includes(query) || answerText.includes(query)
    })
  }, [faqs, searchQuery])

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
      setShowCreateModal(false)
      fetchFaqs()
      toast.success('Đã thêm FAQ')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể thêm FAQ. Bạn có chắc có quyền?')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa FAQ này?')) return
    try {
      await faqService.delete(id, token)
      fetchFaqs()
      toast.success('Đã xóa FAQ')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể xóa FAQ')
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
    setEditVariants(faq.variants ? [...faq.variants] : [])
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditVariants([])
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      if (editVariants.length > 0) {
        await faqService.bulkUpdateVariants(
          editVariants.map((variant) => ({
            variant_id: variant.variant_id,
            variant_text: variant.variant_text,
            is_active: variant.is_active,
          })),
          token,
        )
      }
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
      toast.success('Đã cập nhật FAQ')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể lưu FAQ')
    }
  }

  const handleAddVariantAPI = async (answerId: number) => {
    if (!newVariantText.trim()) return
    try {
      await faqService.addVariant(answerId, { variant_text: newVariantText.trim() }, token)
      setNewVariantText('')
      fetchFaqs()
      toast.success('Đã thêm biến thể')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể thêm biến thể')
    }
  }

  const handleDeleteVariantAPI = async (answerId: number, variantId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biến thể này?')) return
    try {
      await faqService.deleteVariant(answerId, variantId, token)
      fetchFaqs()
      toast.success('Đã xóa biến thể')
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể xóa biến thể')
    }
  }

  const handleVariantTextChange = (variantId: number, value: string) => {
    setEditVariants((prev) =>
      prev.map((variant) =>
        variant.variant_id === variantId ? { ...variant, variant_text: value } : variant,
      ),
    )
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const handlePageSizeChange = (value: string) => {
    const nextSize = parseInt(value) || 20
    setPageSize(nextSize)
    setPage(1)
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setPage(1)
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Quản lý FAQ</h2>

      <div className={styles.card}>
        <div className={`${styles.cardHeaderRow} ${styles.cardHeaderSticky}`}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Danh sách Hỏi đáp
          </h3>
          <div className={styles.headerActions}>
            <div className={styles.searchField}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M21 21L16.65 16.65M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                className={styles.headerInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi, câu trả lời"
                aria-label="Tìm kiếm câu hỏi"
              />
            </div>
            <select
              className={styles.headerSelect}
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              aria-label="Lọc theo danh mục"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
              Thêm mới
            </button>
          </div>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div>
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
                  {filteredFaqs.map((f) => (
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
                              {editingId === f.answer_id ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ color: '#7a7a7a' }}>↳</span>
                                  <input
                                    className={styles.input}
                                    style={{ width: '100%', padding: '8px' }}
                                    value={
                                      editVariants.find((item) => item.variant_id === v.variant_id)
                                        ?.variant_text || ''
                                    }
                                    onChange={(e) =>
                                      handleVariantTextChange(v.variant_id, e.target.value)
                                    }
                                  />
                                </div>
                              ) : (
                                <>↳ {v.variant_text}</>
                              )}
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
                                placeholder="Thêm biến thể"
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
                  {filteredFaqs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                        {faqs.length === 0 ? 'Không có câu hỏi nào' : 'Không có kết quả phù hợp'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div
              className={styles.tableFooterSticky}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  className={styles.headerSelect}
                  value={String(pageSize)}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  aria-label="Số dòng mỗi trang"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}/trang
                    </option>
                  ))}
                </select>
                <div style={{ color: '#666', fontSize: '14px' }}>Tổng: {totalItems} bản ghi</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    transform: 'rotate(180deg)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <svg width="14px" height="14px" viewBox="0 0 1024 1024">
                    <path
                      fill="#0066CC"
                      d="M338.752 104.704a64 64 0 000 90.496l316.8 316.8-316.8 316.8a64 64 0 0090.496 90.496l362.048-362.048a64 64 0 000-90.496L429.248 104.704a64 64 0 00-90.496 0z"
                    />
                  </svg>
                </button>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Trang {page} / {totalPages}
                </div>
                <button
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <svg width="14px" height="14px" viewBox="0 0 1024 1024">
                    <path
                      fill="#0066CC"
                      d="M338.752 104.704a64 64 0 000 90.496l316.8 316.8-316.8 316.8a64 64 0 0090.496 90.496l362.048-362.048a64 64 0 000-90.496L429.248 104.704a64 64 0 00-90.496 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.modalContent} ${styles.modalContentFaq}`}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo câu hỏi mới</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalTabs} role="tablist" aria-label="Tạo câu hỏi">
                <button
                  type="button"
                  className={createTab === 'manual' ? styles.modalTabActive : styles.modalTab}
                  onClick={() => setCreateTab('manual')}
                  role="tab"
                  aria-selected={createTab === 'manual'}
                >
                  Thêm thủ công
                </button>
                <button
                  type="button"
                  className={createTab === 'import' ? styles.modalTabActive : styles.modalTab}
                  onClick={() => setCreateTab('import')}
                  role="tab"
                  aria-selected={createTab === 'import'}
                >
                  Nhập từ tệp
                </button>
              </div>
              {createTab === 'manual' && (
                <div className={styles.modalTabPanel}>
                  <form onSubmit={handleAdd}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Câu hỏi chính</label>
                      <input
                        className={styles.input}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="VD: Mật khẩu mạnh cần đáp ứng những yêu cầu gì?"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Câu trả lời</label>
                      <textarea
                        className={styles.textarea}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="VD: Mật khẩu mạnh cần ít nhất 12 ký tự, kết hợp chữ hoa,..."
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Biến thể câu hỏi</label>
                      <textarea
                        className={styles.textarea}
                        value={variantsInput}
                        onChange={(e) => setVariantsInput(e.target.value)}
                        placeholder="Nhập mỗi biến thể trên 1 dòng"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Danh mục</label>
                      <input
                        className={styles.input}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="VD: Mật khẩu"
                      />
                    </div>
                    <div className={`${styles.modalActions} ${styles.modalActionsBetween}`}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => setShowCreateModal(false)}
                      >
                        Hủy
                      </button>
                      <button type="submit" className={styles.btnPrimary}>
                        Lưu FAQ
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {createTab === 'import' && (
                <div className={styles.modalTabPanel}>
                  <div className={styles.modalImport}>
                    <div>
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
                          <h5 style={{ margin: 0 }}>Dữ liệu xem trước</h5>
                          <div>
                            <button
                              className={styles.btnSecondary}
                              onClick={() => setPreviewData(null)}
                              style={{ marginRight: '8px' }}
                            >
                              Hủy
                            </button>
                            <button
                              className={styles.btnPrimary}
                              onClick={handlePreviewSubmit}
                              disabled={isPreviewSubmitting}
                            >
                              {isPreviewSubmitting ? 'Đang thêm...' : 'Thêm dữ liệu'}
                            </button>
                          </div>
                        </div>
                        <div className={styles.previewTableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th style={{ width: '15%' }}>Danh mục</th>
                                <th>Loại</th>
                                <th style={{ width: '25%' }}>Nội dung</th>
                                <th style={{ width: '40%' }}>Câu trả lời</th>
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
                                            onChange={(e) =>
                                              handlePreviewEdit(idx, 'category', e.target.value)
                                            }
                                          />
                                        )}
                                      </td>
                                      <td style={{ verticalAlign: 'top' }}>
                                        <input
                                          className={styles.input}
                                          style={{ width: '100%', padding: '8px' }}
                                          value={row.type}
                                          onChange={(e) =>
                                            handlePreviewEdit(idx, 'type', e.target.value)
                                          }
                                        />
                                      </td>
                                      <td style={{ verticalAlign: 'top' }}>
                                        {!isQuestion ? (
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <textarea
                                              className={styles.textarea}
                                              style={{
                                                width: '100%',
                                                minHeight: '60px',
                                                padding: '8px',
                                              }}
                                              value={row.content}
                                              onChange={(e) =>
                                                handlePreviewEdit(idx, 'content', e.target.value)
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <textarea
                                            className={styles.textarea}
                                            style={{
                                              width: '100%',
                                              minHeight: '60px',
                                              padding: '8px',
                                            }}
                                            value={row.content}
                                            onChange={(e) =>
                                              handlePreviewEdit(idx, 'content', e.target.value)
                                            }
                                          />
                                        )}
                                      </td>
                                      <td style={{ verticalAlign: 'top' }}>
                                        {isQuestion && (
                                          <textarea
                                            className={styles.textarea}
                                            style={{
                                              width: '100%',
                                              minHeight: '110px',
                                              padding: '8px',
                                            }}
                                            value={row.answer || ''}
                                            onChange={(e) =>
                                              handlePreviewEdit(idx, 'answer', e.target.value)
                                            }
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
                                            onClick={() =>
                                              handleAddPreviewVariant(row.answer_id, idx)
                                            }
                                            style={{
                                              width: '100%',
                                              borderStyle: 'dashed',
                                              textAlign: 'center',
                                            }}
                                          >
                                            + Thêm biến thể
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
