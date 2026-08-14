'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './ChatbotWidget.module.css'
import { MAX_QUESTION_CHARS } from '@/lib/chatbot/limits'
import { SUGGESTED_QUESTIONS, type SuggestedQA } from '@/lib/chatbot/suggestedQuestions'

// Shape returned by /api/chat alongside `reply` — one entry per retrieved
// passage, already ranked. `n` is what the answer's [n] markers refer to.
type Source = {
  n: number
  title: string | null
  url: string
  score: number
  collection: string | null
}

type ChatMessage = {
  id: string
  role: 'user' | 'bot'
  content: string
  sources?: Source[]
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

// The backend answer carries [n] citation markers indexing into the `sources`
// array the same response returns. They are stripped from the visible text and
// used instead to decide which sources get listed under the answer — the
// numbers themselves mean nothing to a reader.
//
// The model groups them four different ways and all four have to be covered,
// because a form that isn't matched here leaks into the answer verbatim:
// adjacent ("[1][2]"), comma-separated inside one bracket ("[1, 2]" / "[1,2]"),
// padded ("[ 1 ]"), and — the one seen most in real answers — separate brackets
// joined by punctuation ("[1], [2], [4]"). That last form is why the separator
// is part of the repetition rather than the brackets alone: stripping only the
// brackets leaves the commas stranded ("…chi tiết,,.").
const ONE_MARKER = String.raw`\[\s*\d+(?:\s*,\s*\d+)*\s*\](?!\()`
const CITATION_MARKER_RE = new RegExp(
  String.raw`\s*${ONE_MARKER}(?:\s*[,;]?\s*${ONE_MARKER})*`,
  'g',
)
// Bỏ marker xong vẫn còn phần nhãn chữ mà model tự viết quanh chúng:
// "(Nguồn: [1], [4])" → "(Nguồn:)". Regex trên chỉ nhận ra dấu ngoặc vuông,
// còn "(Nguồn:" và ")" là văn bản thường nên đi thẳng ra màn hình. Nguồn gốc
// nằm ở luật NOT_UPDATED trong SYSTEM_PROMPT (xem chú thích tại đó); prompt đã
// được ghim định dạng để không sinh ra dạng này nữa, nên đây là lưới đỡ cho
// những biến thể model tự nghĩ ra — "(Source: [2])", "[Xem: [1]]" — chứ không
// phải cách sửa chính.
//
// Chỉ xoá đúng cái vỏ đã rỗng: bên trong ngoặc không được còn gì ngoài một nhãn
// tuỳ chọn và dấu câu. Chính ràng buộc đó giữ lại mọi ngoặc hợp lệ — "(2024)"
// có chữ số, "(Viện Công nghệ và Kinh tế số)" có chữ ngoài danh sách nhãn — nên
// không cái nào khớp được. Dạng không ngoặc ("...chi tiết. Nguồn: [1]") chỉ cắt
// khi nhãn đứng cuối chuỗi, để một chữ "Nguồn:" giữa câu không bị mất oan.
const SOURCE_LABEL = String.raw`(?:nguồn|nguon|source|sources|tham khảo|xem)`
const EMPTY_CITATION_SHELL_RE = new RegExp(
  [
    String.raw`\(\s*${SOURCE_LABEL}?\s*[:：]?\s*[,;.]*\s*\)`,
    String.raw`\[\s*${SOURCE_LABEL}\s*[:：]?\s*[,;.]*\s*\]`,
    String.raw`${SOURCE_LABEL}\s*[:：]\s*$`,
  ]
    .map((branch) => String.raw`\s*(?:${branch})`)
    .join('|'),
  'gi',
)
// Same negative lookahead so a genuine markdown link "[x](url)" is never
// mistaken for a citation — it also keeps a numeric link label like
// "[2024](https://…)" intact, which the digits alone would not. No separator
// handling needed here: this one only collects the numbers, so each bracket
// can be matched on its own.
const CITATION_NUMBER_RE = /\[\s*(\d+(?:\s*,\s*\d+)*)\s*\](?!\()/g
// Nhánh thứ hai ("/..." ) là cho câu trả lời gợi ý trong suggestedQuestions.ts:
// chúng trỏ vào chính site này, nên viết đường dẫn tương đối thay vì đóng cứng
// tên miền — bản dev ở localhost sẽ không văng người dùng sang production. Câu
// trả lời từ model đi qua đúng nhánh cũ; nó luôn trả về URL tuyệt đối.
const LINK_RE = /\[([^[\]]+)\]\((https?:\/\/[^\s()]+|\/[^\s()]*)\)/g

// At most two links under an answer. The backend returns every passage it
// retrieved (7 by default) and the model routinely cites four of them, which
// buries a three-line answer under a longer list of links than answer. Two is
// enough to let a reader verify the claim; `sources` is already ranked, so
// these are the two the retriever was most confident in.
const MAX_SOURCES_SHOWN = 2

/**
 * The sources the answer actually cited, deduplicated by URL, best first.
 *
 * Only cited ones: listing passages the answer never used would attribute it
 * to pages it did not draw on. Dedup by URL because one page routinely
 * contributes several chunks — the homepage alone supplies two — and the same
 * link twice reads like a bug.
 */
function citedSources(content: string, sources: Source[]): Source[] {
  const cited = new Set<number>()
  let match: RegExpExecArray | null
  CITATION_NUMBER_RE.lastIndex = 0
  while ((match = CITATION_NUMBER_RE.exec(content)) !== null) {
    // One bracket can hold several numbers ("[1, 2]"), so every capture is a
    // list — a single "[1]" is just the one-element case of it.
    for (const n of match[1].split(',')) cited.add(Number(n.trim()))
  }
  const seen = new Set<string>()
  return sources
    .filter((s) => {
      if (!cited.has(s.n) || seen.has(s.url)) return false
      seen.add(s.url)
      return true
    })
    .slice(0, MAX_SOURCES_SHOWN)
}

/**
 * Readable label for a source link.
 *
 * News pages carry a real headline, but every /about/* page the crawler saw
 * reports its title as the site name ("BK Fintech"), which identifies nothing
 * — three sources would all render as the same word. Such titles are dropped
 * in favour of the path, so "/about/board-of-deans" is what the user reads.
 *
 * "Generic" is decided by length plus a hostname match rather than a hardcoded
 * string: a genuine headline that happens to mention BK Fintech is far longer
 * than the bare brand, so the length guard keeps it.
 */
function sourceLabel(source: Source): string {
  const title = (source.title || '').trim()
  let pathname = ''
  let brand = ''
  try {
    const url = new URL(source.url)
    pathname = url.pathname
    brand = url.hostname.split('.')[0].toLowerCase()
  } catch {
    return title || source.url
  }

  const normalized = title.toLowerCase().replace(/[^a-z0-9]/g, '')
  const isSiteName = normalized.length <= 20 && brand !== '' && normalized.includes(brand)

  if (title && !isSiteName) return title
  return pathname === '/' || pathname === '' ? 'Trang chủ' : pathname
}

function renderMessageContent(content: string): React.ReactNode[] {
  // Thứ tự bắt buộc: bỏ marker trước, rồi mới tới cái vỏ vừa rỗng ra. Và cả
  // hai chỉ được chạy ở tầng hiển thị — citedSources đọc `content` thô để biết
  // nguồn nào được trích, nên dọn số sớm hơn sẽ làm rỗng luôn "Nguồn tham khảo".
  const cleaned = content
    .replace(CITATION_MARKER_RE, '')
    .replace(EMPTY_CITATION_SHELL_RE, '')
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  LINK_RE.lastIndex = 0
  while ((match = LINK_RE.exec(cleaned)) !== null) {
    if (match.index > lastIndex) nodes.push(cleaned.slice(lastIndex, match.index))
    // Chỉ link ra ngoài mới mở tab mới. Link nội bộ mở ngay trong tab hiện tại
    // là hành vi người dùng chờ đợi, và quan trọng hơn: mở tab mới sẽ bỏ lại
    // popup chat cùng cả đoạn hội thoại ở tab cũ.
    const isExternal = match[2].startsWith('http')
    nodes.push(
      <a
        key={key++}
        href={match[2]}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {match[1]}
      </a>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < cleaned.length) nodes.push(cleaned.slice(lastIndex))
  return nodes
}

async function fetchBotReply(
  message: string,
  sessionId: string,
): Promise<{ reply: string; sources: Source[] }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  })

  if (!res.ok) {
    throw new Error(`Chat API error ${res.status}`)
  }

  const data = await res.json()
  return {
    reply: data.reply ?? data.answer ?? '',
    sources: Array.isArray(data.sources) ? data.sources : [],
  }
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Generated once per mount, kept only in memory: pairs this browser tab
  // with up to 3 Q&A turns of server-side history so a follow-up question
  // can refer back to what was just asked, without needing a login.
  const sessionIdRef = useRef<string>('')
  // Whether this session ever reached the database. Only /api/chat writes
  // there, so a visitor who opened the widget and typed nothing has nothing to
  // delete and should not cost a request on the way out.
  const persistedRef = useRef(false)

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID()
  }, [])

  // Delete the transcript when the tab goes away. `pagehide` rather than
  // `beforeunload`: beforeunload does not fire reliably on mobile Safari or
  // Chrome for Android, which kill backgrounded tabs outright, and it blocks
  // the bfcache. sendBeacon rather than fetch, because a fetch started here is
  // cancelled as the document tears down — the browser only guarantees
  // delivery for a beacon.
  //
  // Refs, not state, are read inside the handler: it is registered once, so a
  // closure over state would still see the values from first render.
  useEffect(() => {
    const endSession = () => {
      if (!persistedRef.current || !sessionIdRef.current) return
      // Fires at most once — a tab can pagehide and come back via bfcache, and
      // the second delete would be a wasted request against a document the
      // first one already removed.
      persistedRef.current = false
      navigator.sendBeacon(
        '/api/chat/session',
        new Blob([JSON.stringify({ session_id: sessionIdRef.current })], {
          type: 'application/json',
        }),
      )
    }
    window.addEventListener('pagehide', endSession)
    return () => {
      window.removeEventListener('pagehide', endSession)
      // Unmounting is the end of the conversation too — the widget is removed
      // on navigation within the app, where no pagehide fires at all.
      endSession()
    }
  }, [])

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
      const { reply, sources } = await fetchBotReply(text, sessionIdRef.current)
      // The route persisted this turn, so there is now a document to clean up.
      persistedRef.current = true
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          content: reply || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.',
          sources: reply ? citedSources(reply, sources) : [],
        },
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

  /**
   * Bấm một câu hỏi gợi ý: hiện câu trả lời ngay, ghi history ở nền.
   *
   * Không setLoading và không await gì trước khi render — câu trả lời đã nằm
   * sẵn trong bundle, nên hiện "đang gõ..." rồi mới hiện nó ra chỉ là giả vờ có
   * độ trễ. Việc ghi xuống DB chỉ phục vụ lượt hỏi TIẾP THEO (xem
   * /api/chat/suggested), nên nó không được đứng chắn trước màn hình.
   */
  const handleSuggestionClick = (qa: SuggestedQA) => {
    if (loading) return
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content: qa.question },
      { id: nextId(), role: 'bot', content: qa.answer },
    ])

    const sessionId = sessionIdRef.current
    if (!sessionId) return
    // Đánh dấu TRƯỚC khi fetch xong, không phải trong .then: nếu tab đóng lúc
    // request còn bay thì bản ghi vẫn có thể đã nằm trong DB mà pagehide lại bỏ
    // qua việc xoá, và transcript ở lại tới khi TTL dọn. Xoá nhầm một session
    // chưa từng tồn tại là no-op — lệch về phía dọn dẹp mới đúng.
    persistedRef.current = true
    fetch('/api/chat/suggested', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, id: qa.id }),
      // Sống sót qua điều hướng: người dùng bấm gợi ý rồi bấm luôn link trong
      // câu trả lời là một chuỗi thao tác rất thường, và fetch thường sẽ bị huỷ
      // giữa chừng ở đúng lúc đó.
      keepalive: true,
    }).catch(() => {
      // Không có gì để nói với người dùng: câu trả lời đã ở trên màn hình. Hậu
      // quả duy nhất là lượt sau không có ngữ cảnh của lượt này.
    })
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
                <div className={styles.bubble}>
                  {msg.role === 'bot' ? renderMessageContent(msg.content) : msg.content}
                  {msg.role === 'bot' && msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sources}>
                      <p className={styles.sourcesLabel}>Nguồn tham khảo</p>
                      <ul className={styles.sourcesList}>
                        {msg.sources.map((source) => (
                          <li key={source.url}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              {sourceLabel(source)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Chỉ hiện khi lời chào còn là tin nhắn duy nhất. Đây là gợi ý cho
                câu hỏi ĐẦU TIÊN — sau khi hội thoại đã bắt đầu thì một danh sách
                câu hỏi cố định vừa không liên quan tới điều đang nói, vừa đẩy
                phần trả lời thật lên khỏi tầm nhìn. Suy ra từ messages thay vì
                giữ thêm một state riêng: một khi có lượt hỏi đầu tiên, dù bấm
                gợi ý hay tự gõ, điều kiện này tự sai vĩnh viễn. */}
            {messages.length === 1 && (
              <div className={styles.suggestions}>
                <p className={styles.suggestionsLabel}>Câu hỏi thường gặp</p>
                {SUGGESTED_QUESTIONS.map((qa) => (
                  <button
                    key={qa.id}
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={() => handleSuggestionClick(qa)}
                  >
                    {qa.question}
                  </button>
                ))}
              </div>
            )}

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
              {/* Trần này khớp với chỗ /api/chat cắt câu hỏi. Chặn ngay ở ô
                  nhập thay vì để backend cắt âm thầm: người dùng gõ 1500 ký tự
                  rồi bị bỏ mất 500 ký tự cuối mà không hề biết là hỏng thật —
                  họ chỉ thấy bot trả lời lạc đề. */}
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                maxLength={MAX_QUESTION_CHARS}
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
