'use client'

import React, { useEffect, useState } from 'react'
import { authService, getChatbotErrorDetail } from '@/services/chatbot'
import styles from './page.module.css'
import ChatWindow from '../components/ChatWindow'
import { toast } from 'react-toastify'
import FaqManager from './tabs/FaqManager'
import RuleManager from './tabs/RuleManager'
import ConfigManager from './tabs/ConfigManager'
import UserManager from './tabs/UserManager'

export default function ChatbotAdmin() {
  const [token, setToken] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('chatbot_admin_token')
    if (saved) setToken(saved)
  }, [])

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

function DashboardView({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'faq' | 'config' | 'users' | 'rules'>('faq')

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
        <button
          className={activeTab === 'rules' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('rules')}
        >
          Quản lý quy tắc
        </button>
        <button
          className={activeTab === 'config' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('config')}
        >
          Cấu hình hệ thống
        </button>
        <button
          className={activeTab === 'users' ? styles.subNavTabActive : styles.subNavTab}
          onClick={() => setActiveTab('users')}
        >
          Quản lý Người dùng
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
