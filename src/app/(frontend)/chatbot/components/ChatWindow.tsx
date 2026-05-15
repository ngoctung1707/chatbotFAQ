'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './ChatWindow.module.css'
import { chatService } from '@/services/chatbot'
import type { Suggestion, ChatDecision } from '@/services/chatbot/types'
import RobotIcon from '../icons/RobotIcon'
import { Saira } from 'next/font/google'

type Message = {
  id: string
  sender: 'user' | 'bot'
  text?: string | null
  suggestions?: Suggestion[] | null
  type?: ChatDecision
  fallbackMsg?: string | null
  contact?: string | null
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white" />
  </svg>
)

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      type: 'ambiguity',
      text: null,
      suggestions: [], // Initial state can just be empty suggestions or none, we will render "Chúng tôi có thể giúp gì cho bạn?" specially if it's the only message.
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await chatService.query({ query: userMsg.text! })
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.answer,
        suggestions: res.suggestions,
        type: res.decision,
        fallbackMsg: res.fallback_message,
        contact: res.contact,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Xin lỗi, có lỗi xảy ra.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: suggestion.question,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await chatService.selectAnswer(suggestion.answer_id)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.answer,
        suggestions: res.suggestions,
        type: res.decision,
        fallbackMsg: res.fallback_message,
        contact: res.contact,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Xin lỗi, có lỗi xảy ra.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleOpen = () => setIsOpen((prev) => !prev)

  return (
    <div className={`${styles.container}`}>
      {!isOpen && (
        <button className={styles.triggerBtn} onClick={toggleOpen} aria-label="Open Chatbot">
          <RobotIcon style={{ transform: 'scale(1.2)' }} />
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <RobotIcon />
              <h3 className={`${styles.headerTitle}`}>Chatbot</h3>
            </div>
            <button className={styles.closeBtn} onClick={toggleOpen} aria-label="Close Chatbot">
              ✕
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className={`${styles.messageRow} ${styles.user}`}>
                    <div className={styles.bubble}>{msg.text}</div>
                  </div>
                )
              }

              if (msg.id === 'welcome' && messages.length > 1) {
                return null
              }

              // Bot Message Render
              const isWelcomeMessage = msg.id === 'welcome'

              return (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${styles.bot} ${
                    isWelcomeMessage ? styles.welcomeRow : ''
                  }`}
                >
                  <div className={styles.bubble}>
                    {msg.type === 'answer' || msg.text ? (
                      <div className={styles.botText}>{msg.text}</div>
                    ) : null}

                    {msg.type === 'ambiguity' && (
                      <>
                        {isWelcomeMessage && (
                          <div className={styles.botTextLarge}>
                            Chúng tôi có thể
                            <br />
                            giúp gì cho bạn?
                          </div>
                        )}
                        {!isWelcomeMessage && !msg.text && (
                          <div className={styles.botText}>
                            Bạn có thể tham khảo các câu hỏi sau:
                          </div>
                        )}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className={styles.suggestionList}>
                            {msg.suggestions.map((s) => (
                              <button
                                key={s.answer_id}
                                className={styles.suggestionBtn}
                                onClick={() => handleSuggestionClick(s)}
                              >
                                {s.question}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {msg.type === 'fallback' && (
                      <>
                        {msg.fallbackMsg && (
                          <div className={styles.fallbackMsg}>{msg.fallbackMsg}</div>
                        )}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className={styles.suggestionList}>
                            {msg.suggestions.map((s) => (
                              <button
                                key={s.answer_id}
                                className={styles.suggestionBtn}
                                onClick={() => handleSuggestionClick(s)}
                              >
                                {s.question}
                              </button>
                            ))}
                          </div>
                        )}
                        {msg.contact && <div className={styles.contactInfo}>{msg.contact}</div>}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {loading && <div className={styles.loadingIndicator}>Đang suy nghĩ...</div>}
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
                placeholder="Bạn muốn hỏi về vấn đề gì"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || loading}
                aria-label="Send Message"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
