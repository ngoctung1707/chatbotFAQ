'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './ChatbotWidget.module.css'

type ChatMessage = {
  id: string
  role: 'user' | 'bot'
  content: string
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  content: 'Xin chào! Tôi là trợ lý ảo của BK Fintech. Tôi có thể giúp gì cho bạn?',
}

let idCounter = 0
const nextId = () => `msg-${Date.now()}-${idCounter++}`

const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.19 4.53 3.08 6.02-.1.98-.5 2.28-1.58 3.48-.15.16-.03.42.19.4 1.94-.19 3.55-.98 4.63-1.7.83.19 1.72.3 2.68.3 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
      fill="currentColor"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
  </svg>
)

async function fetchBotReply(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    throw new Error(`Chat API error ${res.status}`)
  }

  const data = await res.json()
  return data.reply ?? data.answer ?? ''
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const reply = await fetchBotReply(text)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'bot', content: reply || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          content: 'Xin lỗi, hiện tôi chưa thể kết nối tới máy chủ. Vui lòng thử lại sau.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <ChatIcon />
              </div>
              <div>
                <p className={styles.headerTitle}>BK Fintech Assistant</p>
                <p className={styles.headerSubtitle}>Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chatbot"
            >
              <CloseIcon />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${msg.role === 'user' ? styles.user : styles.bot}`}
              >
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.messageRow} ${styles.bot}`}>
                <div className={styles.bubble}>
                  <span className={styles.typingDots}>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <form
              className={styles.inputWrapper}
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || loading}
                aria-label="Gửi tin nhắn"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          className={styles.triggerBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Mở chatbot"
        >
          <ChatIcon />
        </button>
      )}
    </div>
  )
}
