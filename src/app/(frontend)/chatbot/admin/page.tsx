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

export default function ChatbotAdmin() {
  const [token, setToken] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const handleLogout = useCallback((showToast: boolean) => {
    setToken(null)
    setCurrentUser(null)
    localStorage.removeItem('chatbot_admin_token')
    localStorage.removeItem('chatbot_admin_user')
    if (showToast) toast.info('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }, [])

  const isTokenExpired = useCallback((jwt: string): boolean => {
    const payload = parseJwtPayload(jwt)
    if (!payload?.exp) return false
    const nowSeconds = Math.floor(Date.now() / 1000)
    return payload.exp <= nowSeconds
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('chatbot_admin_token')
    const savedUser = localStorage.getItem('chatbot_admin_user')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser) as MeResponse)
      } catch {
        localStorage.removeItem('chatbot_admin_user')
      }
    }
    if (!saved) return

    if (isTokenExpired(saved)) {
      handleLogout(true)
      return
    }

    setToken(saved)
  }, [handleLogout, isTokenExpired])

  useEffect(() => {
    if (!token) return

    let isActive = true
    setIsUserLoading(true)

    authService
      .me(token)
      .then((me) => {
        if (!isActive) return
        setCurrentUser(me)
        localStorage.setItem('chatbot_admin_user', JSON.stringify(me))
      })
      .catch((err) => {
        const status = typeof err === 'object' && err && 'status' in err ? Number(err.status) : null
        if (status === 401) {
          handleLogout(true)
          return
        }
        toast.error(getChatbotErrorDetail(err) || 'Không thể tải thông tin người dùng')
      })
      .finally(() => {
        if (!isActive) return
        setIsUserLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [token, handleLogout])

  useEffect(() => {
    if (!token) return

    const payload = parseJwtPayload(token)
    if (!payload?.exp) return

    const expiresInMs = payload.exp * 1000 - Date.now()
    if (expiresInMs <= 0) {
      handleLogout(true)
      return
    }

    const timeoutId = window.setTimeout(() => {
      handleLogout(true)
    }, expiresInMs)

    return () => window.clearTimeout(timeoutId)
  }, [token, handleLogout])

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
      <DashboardView token={token} currentUser={currentUser} onLogout={() => handleLogout(false)} />
      <ChatWindow />
    </>
  )
}

type JwtPayload = {
  exp?: number
}

const parseJwtPayload = (jwt: string): JwtPayload | null => {
  try {
    const parts = jwt.split('.')
    if (parts.length < 2) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLength = 4 - (base64.length % 4)
    const padded = padLength < 4 ? `${base64}${'='.repeat(padLength)}` : base64
    const json = atob(padded)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
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
        toast.success('Đăng nhập thành công!')
      } else {
        setError('Đăng nhập thất bại: Không nhận được token truy cập')
      }
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
  token,
  currentUser,
  onLogout,
}: {
  token: string
  currentUser: MeResponse | null
  onLogout: () => void
}) {
  const role = currentUser?.role?.toLowerCase() || ''
  const isAdmin = role === 'admin'

  const [activeTab, setActiveTab] = useState<'faq' | 'config' | 'users' | 'rules' | 'logs'>('faq')

  useEffect(() => {
    if (isAdmin) return
    if (activeTab === 'config' || activeTab === 'rules') {
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
          Quản lý Người dùng
        </button>
        <button
          className={activeTab === 'logs' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('logs')}
        >
          Lịch sử hỏi đáp
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'faq' && <FaqManager token={token} />}
        {activeTab === 'rules' && isAdmin && <RuleManager token={token} />}
        {activeTab === 'config' && isAdmin && <ConfigManager token={token} />}
        {activeTab === 'users' && (
          <UserManager token={token} currentUser={currentUser} isAdmin={isAdmin} />
        )}
        {activeTab === 'logs' && <ChatLogsManager token={token} />}
      </main>
    </div>
  )
}
