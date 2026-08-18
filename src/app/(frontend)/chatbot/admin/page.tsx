'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { authService, getChatbotErrorDetail } from '@/services/chatbot'
import type { MeResponse } from '@/services/chatbot/types'
import styles from './page.module.css'
import ChatWindow from '../components/ChatWindow'
import { toast } from 'react-toastify'
import FaqManager from './tabs/FaqManager'
import RuleManager from './tabs/RuleManager'
import ConfigManager from './tabs/ConfigManager'
import UserManager from './tabs/UserManager'
import ChatLogsManager from './tabs/ChatLogsManager'
import CrawlReportManager from './tabs/CrawlReportManager'

export default function ChatbotAdmin() {
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const handleLogout = useCallback((showToast: boolean) => {
    authService.logout().catch(() => {})
    setCurrentUser(null)
    if (showToast) toast.info('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }, [])

  const loadCurrentUser = useCallback(
    async (showToastOnFailure: boolean) => {
      setIsUserLoading(true)
      try {
        const me = await authService.me()
        setCurrentUser(me)
        return true
      } catch (err) {
        const status = typeof err === 'object' && err && 'status' in err ? Number(err.status) : null
        if (status === 401) {
          try {
            await authService.refresh()
            const me = await authService.me()
            setCurrentUser(me)
            return true
          } catch {
            handleLogout(showToastOnFailure)
            return false
          }
        }
        toast.error(getChatbotErrorDetail(err) || 'Không thể tải thông tin người dùng')
        setCurrentUser(null)
        return false
      } finally {
        setIsUserLoading(false)
      }
    },
    [handleLogout],
  )

  useEffect(() => {
    setIsMounted(true)
    void loadCurrentUser(false)
  }, [loadCurrentUser])

  if (!isMounted) return null

  if (!currentUser && !isUserLoading) {
    return (
      <>
        <LoginView
          onLogin={() => {
            void loadCurrentUser(false)
          }}
        />
        <ChatWindow />
      </>
    )
  }

  if (isUserLoading && !currentUser) {
    return (
      <>
        <LoadingView onLogout={() => handleLogout(false)} />
        <ChatWindow />
      </>
    )
  }

  return (
    <>
      <DashboardView currentUser={currentUser} onLogout={() => handleLogout(false)} />
      <ChatWindow />
    </>
  )
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await authService.login({ username, password })
      onLogin()
      toast.success('Đăng nhập thành công!')
    } catch (err) {
      const detail = getChatbotErrorDetail(err)
      const fallback =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
      setError(detail || fallback)
    }
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Đăng nhập</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu</label>
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
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoadingView({ onLogout }: { onLogout: () => void }) {
  return (
    <div className={styles.container}>
      <header className={styles.globalNav}>
        <div>Hệ thống quản lý Chatbot</div>
        <button onClick={onLogout}>Đăng xuất</button>
      </header>
      <main className={styles.main}>
        <p>Đang tải thông tin người dùng...</p>
      </main>
    </div>
  )
}

function DashboardView({
  currentUser,
  onLogout,
}: {
  currentUser: MeResponse | null
  onLogout: () => void
}) {
  const role = currentUser?.role?.toLowerCase() || ''
  const isAdmin = role === 'admin'

  const [activeTab, setActiveTab] = useState<'faq' | 'config' | 'users' | 'rules' | 'logs' | 'crawl'>('faq')

  useEffect(() => {
    if (isAdmin) return
    if (activeTab === 'config' || activeTab === 'rules' || activeTab === 'crawl') {
      setActiveTab('faq')
    }
  }, [activeTab, isAdmin])

  return (
    <div className={styles.container}>
      <header className={styles.globalNav}>
        <div>Hệ thống quản lý Chatbot</div>
        <button onClick={onLogout}>Đăng xuất</button>
      </header>

      <nav className={styles.subNav}>
        <button
          className={activeTab === 'faq' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('faq')}
        >
          Quản lý FAQ
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'rules' ? styles.subNavTabActive : styles.subNavTab}
            onClick={() => setActiveTab('rules')}
          >
            Quản lý quy tắc
          </button>
        )}
        {isAdmin && (
          <button
            className={activeTab === 'config' ? styles.subNavTabActive : styles.subNavTab}
            onClick={() => setActiveTab('config')}
          >
            Cấu hình hệ thống
          </button>
        )}
        <button
          className={activeTab === 'users' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('users')}
        >
          Quản lý tài khoản
        </button>
        <button
          className={activeTab === 'logs' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('logs')}
        >
          Lịch sử hỏi đáp
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'crawl' ? styles.subNavTabActive : styles.subNavTab}
            onClick={() => setActiveTab('crawl')}
          >
            Cập nhật dữ liệu
          </button>
        )}
      </nav>

      <main className={styles.main}>
        {activeTab === 'faq' && <FaqManager />}
        {activeTab === 'rules' && isAdmin && <RuleManager />}
        {activeTab === 'config' && isAdmin && <ConfigManager />}
        {activeTab === 'users' && <UserManager currentUser={currentUser} isAdmin={isAdmin} />}
        {activeTab === 'logs' && <ChatLogsManager />}
        {activeTab === 'crawl' && isAdmin && <CrawlReportManager />}
      </main>
    </div>
  )
}
