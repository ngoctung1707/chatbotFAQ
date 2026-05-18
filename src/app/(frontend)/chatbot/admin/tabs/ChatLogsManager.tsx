'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { chatLogService, getChatbotErrorDetail } from '@/services/chatbot'
import type { ChatLogDecision, ChatLogResponse, ChatLogSort } from '@/services/chatbot/types'
import styles from '../page.module.css'
import { toast } from 'react-toastify'

const formatTimestamp = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN')
}

const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`

const buildCsv = (rows: ChatLogResponse[]) => {
  const headers = ['Câu hỏi', 'Loại quyết định', 'Trả lời', 'Thời gian']
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      [row.ask, row.decistion_type, row.answer ?? '', formatTimestamp(row.timestamp)]
        .map((value) => escapeCsv(String(value)))
        .join(','),
    ),
  ]

  return `\ufeff${lines.join('\r\n')}`
}

export default function ChatLogsManager({ token }: { token: string }) {
  const [logs, setLogs] = useState<ChatLogResponse[]>([])
  const [loading, setLoading] = useState(false)

  const pageSizeOptions = [20, 200, 500]
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [decisionFilter, setDecisionFilter] = useState<ChatLogDecision | ''>('')
  const [sortTimestamp, setSortTimestamp] = useState<ChatLogSort>('desc')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await chatLogService.list(token, {
        page,
        page_size: pageSize,
        key_word: searchQuery.trim() || undefined,
        decistion_type: decisionFilter || undefined,
        sort_timestamp: sortTimestamp,
      })
      setLogs(data?.items || [])
      setTotalPages(data?.total_pages || 1)
      setTotalItems(data?.total || 0)
    } catch (e) {
      toast.error(getChatbotErrorDetail(e) || 'Không thể tải lịch sử hỏi đáp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, pageSize, searchQuery, decisionFilter, sortTimestamp])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const handlePageSizeChange = (value: string) => {
    const nextSize = parseInt(value) || 20
    setPageSize(nextSize)
    setPage(1)
  }

  const handleDecisionFilterChange = (value: string) => {
    setDecisionFilter(value as ChatLogDecision | '')
    setPage(1)
  }

  const toggleSort = () => {
    setSortTimestamp((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    setPage(1)
  }

  const canExport = logs.length > 0

  const handleExportCsv = () => {
    if (!canExport) return
    const csv = buildCsv(logs)
    downloadFile('chat-logs.csv', csv, 'text/csv;charset=utf-8;')
  }

  const handleExportExcel = () => {
    if (!canExport) return
    const csv = buildCsv(logs)
    downloadFile('chat-logs.xls', csv, 'application/vnd.ms-excel;charset=utf-8;')
  }

  const decisionOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả' },
      { value: 'answer', label: 'Answer' },
      { value: 'ambiguity', label: 'Ambiguity' },
      { value: 'fallback', label: 'Fallback' },
    ],
    [],
  )

  return (
    <div>
      <h2 className={styles.sectionTitle}>Lịch sử hỏi đáp</h2>

      <div className={styles.card}>
        <div className={`${styles.cardHeaderRow} ${styles.cardHeaderSticky}`}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>
            Lịch sử hỏi đáp
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
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo từ khóa"
                aria-label="Tìm kiếm chat log"
              />
            </div>
            <select
              className={styles.headerSelect}
              value={decisionFilter}
              onChange={(e) => handleDecisionFilterChange(e.target.value)}
              aria-label="Lọc theo loại quyết định"
            >
              {decisionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className={styles.btnPrimary} onClick={handleExportCsv} disabled={!canExport}>
              Xuất CSV
            </button>
            <button className={styles.btnPrimary} onClick={handleExportExcel} disabled={!canExport}>
              Xuất Excel
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
                    <th>Câu hỏi</th>
                    <th>Loại quyết định</th>
                    <th>Trả lời</th>
                    <th>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span onClick={toggleSort} style={{ cursor: 'pointer' }}>
                          Thời gian
                        </span>
                        <button
                          type="button"
                          onClick={toggleSort}
                          style={{
                            padding: 0,
                            fontSize: '12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#0066CC',
                          }}
                          aria-label="Sắp xếp theo thời gian"
                        >
                          {sortTimestamp === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item, index) => (
                    <tr key={`${item.timestamp}-${index}`}>
                      <td
                        style={{
                          width: '25%',
                          paddingRight: '16px',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.ask}
                      </td>
                      <td style={{ width: '15%', paddingRight: '16px' }}>{item.decistion_type}</td>
                      <td style={{ width: '40%', paddingRight: '16px' }}>{item.answer || '-'}</td>
                      <td style={{ width: '20%' }}>{formatTimestamp(item.timestamp)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                        Không có lịch sử hỏi đáp
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
    </div>
  )
}
