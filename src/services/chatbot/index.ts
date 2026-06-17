import type {
  BulkUpdateResultWithDetails,
  ChatRequest,
  ChatResponse,
  ChatLogDecision,
  ChatLogSort,
  ConfigOut,
  ConfigUpdate,
  FAQCreate,
  FAQCsvRow,
  FAQOut,
  FAQUpdate,
  FAQVariantBulkUpdateItem,
  FAQVariantCreate,
  FAQVariantOut,
  LoginPayload,
  MessageResponse,
  MeResponse,
  PaginatedChatLogOut,
  PaginatedFAQOut,
  RewriteCreate,
  RewriteOut,
  RewriteUpdate,
  SupportEmailOut,
  UserCreate,
  UserOut,
  UserUpdate,
} from './types'

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://chatbot-api.bkfin.tech/api/v1'
const CSRF_HEADER_NAME = 'X-CSRF-Token'
const CSRF_META_NAMES = ['csrf-token', 'csrf_token', 'xsrf-token', 'xsrf_token']
const CSRF_COOKIE_NAMES = ['csrf-token', 'csrf_token', 'XSRF-TOKEN', 'xsrf-token', 'xsrf_token']

const isBrowser = typeof document !== 'undefined'

const getMetaContent = (name: string): string | undefined => {
  if (!isBrowser) return undefined
  const meta = document.querySelector(`meta[name="${name}"]`)
  const value = meta?.getAttribute('content')?.trim()
  return value || undefined
}

const getCookieValue = (name: string): string | undefined => {
  if (!isBrowser || !document.cookie) return undefined
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=')
    if (key === name) {
      const value = rest.join('=')
      return value ? decodeURIComponent(value) : undefined
    }
  }
  return undefined
}

const getCsrfToken = (): string | undefined => {
  for (const name of CSRF_META_NAMES) {
    const value = getMetaContent(name)
    if (value) return value
  }

  for (const name of CSRF_COOKIE_NAMES) {
    const value = getCookieValue(name)
    if (value) return value
  }

  return undefined
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string
}

class ChatbotAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message)
    this.name = 'ChatbotAPIError'
  }
}

type ChatbotErrorDetailPayload = { detail?: unknown }

const getDetailFromPayload = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') return undefined
  if (!('detail' in payload)) return undefined
  const detail = (payload as ChatbotErrorDetailPayload).detail
  return typeof detail === 'string' ? detail : undefined
}

export const getChatbotErrorDetail = (err: unknown): string | undefined => {
  if (err instanceof ChatbotAPIError) {
    if (typeof err.detail === 'string') return err.detail
    const nested = getDetailFromPayload(err.detail)
    if (nested) return nested
  }

  return getDetailFromPayload(err)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers: extraHeaders, ...rest } = options
  const credentials = rest.credentials ?? 'include'

  const isNativeObject =
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)

  const headers = new Headers()

  if (body !== undefined && !isNativeObject) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (extraHeaders) {
    const extra = new Headers(extraHeaders)
    extra.forEach((value, key) => headers.set(key, value))
  }

  const csrfToken = getCsrfToken()
  if (csrfToken && !headers.has(CSRF_HEADER_NAME)) {
    headers.set(CSRF_HEADER_NAME, csrfToken)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials,
    headers,
    body:
      body !== undefined && !isNativeObject ? JSON.stringify(body) : (body as BodyInit | undefined),
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const detailMessage = getDetailFromPayload(data)
    throw new ChatbotAPIError(
      res.status,
      detailMessage || `Chatbot API error ${res.status}: ${res.statusText}`,
      data,
    )
  }

  return data as T
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Đăng nhập, backend sẽ set HttpOnly cookie.
   */
  login(payload: LoginPayload): Promise<MessageResponse> {
    const form = new URLSearchParams()
    form.set('username', payload.username)
    form.set('password', payload.password)
    if (payload.grant_type) form.set('grant_type', payload.grant_type)
    if (payload.scope) form.set('scope', payload.scope)
    if (payload.client_id) form.set('client_id', payload.client_id)
    if (payload.client_secret) form.set('client_secret', payload.client_secret)

    return request<MessageResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form as unknown, // FormData-encoded, bypass JSON stringify
    })
  },

  /**
   * Làm mới access token bằng HttpOnly cookie.
   */
  refresh(): Promise<MessageResponse> {
    return request<MessageResponse>('/auth/refresh', {
      method: 'POST',
    })
  },

  /**
   * Đăng xuất, backend sẽ xóa cookie.
   */
  logout(): Promise<MessageResponse> {
    return request<MessageResponse>('/auth/logout', {
      method: 'POST',
    })
  },

  /**
   * Lấy thông tin người dùng hiện tại (cookie).
   */
  me(): Promise<MeResponse> {
    return request<MeResponse>('/auth/me')
  },
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * Gửi câu hỏi tới chatbot.
   */
  query(payload: ChatRequest): Promise<ChatResponse> {
    return request<ChatResponse>('/chat/query', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Xác nhận chọn một gợi ý (khi kết quả là ambiguous hoặc fallback).
   */
  selectAnswer(answerId: number): Promise<ChatResponse> {
    return request<ChatResponse>(`/chat/select/${answerId}`, {
      method: 'POST',
    })
  },
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const faqService = {
  /**
   * Lấy danh sách FAQ (public).
   */
  list(params?: {
    page?: number
    page_size?: number
    category?: string
  }): Promise<PaginatedFAQOut> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.page_size !== undefined) query.set('page_size', String(params.page_size))
    if (params?.category) query.set('category', params.category)
    const qs = query.toString()
    return request<PaginatedFAQOut>(`/faq/${qs ? `?${qs}` : ''}`)
  },

  /**
   * Lấy chi tiết một FAQ (public).
   */
  get(answerId: number): Promise<FAQOut> {
    return request<FAQOut>(`/faq/${answerId}`)
  },

  /**
   * Tạo mới FAQ (yêu cầu xác thực).
   */
  create(payload: FAQCreate): Promise<FAQOut> {
    return request<FAQOut>('/faq/', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Cập nhật FAQ (yêu cầu xác thực).
   */
  update(answerId: number, payload: FAQUpdate): Promise<FAQOut> {
    return request<FAQOut>(`/faq/${answerId}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /**
   * Xoá FAQ (yêu cầu xác thực).
   */
  delete(answerId: number): Promise<void> {
    return request<void>(`/faq/${answerId}`, {
      method: 'DELETE',
    })
  },

  // ── Batch Operations ────────────────────────────────────────────────────────

  /**
   * Thêm FAQ hàng loạt (yêu cầu xác thực).
   */
  addRows(payload: FAQCsvRow[]): Promise<FAQOut[]> {
    return request<FAQOut[]>('/faq/add', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Cập nhật FAQ hàng loạt (yêu cầu xác thực).
   */
  editRows(payload: FAQCsvRow[]): Promise<FAQOut[]> {
    return request<FAQOut[]>('/faq/edit', {
      method: 'PUT',
      body: payload,
    })
  },

  /**
   * Thêm FAQ từ file CSV (yêu cầu xác thực).
   */
  addCsv(file: File | Blob): Promise<FAQOut[]> {
    const formData = new FormData()
    formData.append('file', file)

    return request<FAQOut[]>('/faq/add-csv', {
      method: 'POST',
      body: formData as unknown,
    })
  },

  // ── Variants ────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách câu hỏi biến thể của một FAQ (public).
   */
  listVariants(answerId: number): Promise<FAQVariantOut[]> {
    return request<FAQVariantOut[]>(`/faq/${answerId}/variants`)
  },

  /**
   * Thêm câu hỏi biến thể (yêu cầu xác thực).
   */
  addVariant(answerId: number, payload: FAQVariantCreate): Promise<FAQVariantOut> {
    return request<FAQVariantOut>(`/faq/${answerId}/variants`, {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Xoá câu hỏi biến thể (yêu cầu xác thực).
   */
  deleteVariant(answerId: number, variantId: number): Promise<void> {
    return request<void>(`/faq/${answerId}/variants/${variantId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Cập nhật hàng loạt biến thể (yêu cầu xác thực).
   */
  bulkUpdateVariants(payload: FAQVariantBulkUpdateItem[]): Promise<BulkUpdateResultWithDetails> {
    return request<BulkUpdateResultWithDetails>('/faq/variants/bulk', {
      method: 'PUT',
      body: payload,
    })
  },
}

// ─── Rewrite ──────────────────────────────────────────────────────────────────

export const rewriteService = {
  /**
   * Lấy danh sách rewrite rules (public).
   */
  list(): Promise<RewriteOut[]> {
    return request<RewriteOut[]>('/rewrite/')
  },

  /**
   * Tạo rewrite rule mới (yêu cầu xác thực).
   */
  create(payload: RewriteCreate): Promise<RewriteOut> {
    return request<RewriteOut>('/rewrite/', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Cập nhật rewrite rule (yêu cầu xác thực).
   */
  update(ruleId: number, payload: RewriteUpdate): Promise<RewriteOut> {
    return request<RewriteOut>(`/rewrite/${ruleId}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /**
   * Xoá rewrite rule (yêu cầu xác thực).
   */
  delete(ruleId: number): Promise<void> {
    return request<void>(`/rewrite/${ruleId}`, {
      method: 'DELETE',
    })
  },
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const configService = {
  /**
   * Lấy cấu hình hệ thống (public).
   */
  get(): Promise<ConfigOut> {
    return request<ConfigOut>('/config/')
  },

  /**
   * Lấy email hỗ trợ (public).
   */
  getSupportEmail(): Promise<SupportEmailOut> {
    return request<SupportEmailOut>('/config/support-email')
  },

  /**
   * Cập nhật cấu hình hệ thống (yêu cầu xác thực).
   */
  update(payload: ConfigUpdate): Promise<ConfigOut> {
    return request<ConfigOut>('/config/', {
      method: 'PUT',
      body: payload,
    })
  },
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const userService = {
  /**
   * Lấy danh sách người dùng (yêu cầu xác thực).
   */
  list(): Promise<UserOut[]> {
    return request<UserOut[]>('/users/')
  },

  /**
   * Tạo người dùng mới (yêu cầu xác thực).
   */
  create(payload: UserCreate): Promise<UserOut> {
    return request<UserOut>('/users/', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Cập nhật thông tin người dùng (yêu cầu xác thực).
   */
  update(userId: number, payload: UserUpdate): Promise<UserOut> {
    return request<UserOut>(`/users/${userId}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /**
   * Xoá người dùng (yêu cầu xác thực).
   */
  delete(userId: number): Promise<void> {
    return request<void>(`/users/${userId}`, {
      method: 'DELETE',
    })
  },
}

// ─── Chat Log ───────────────────────────────────────────────────────────────

export const chatLogService = {
  /**
   * Lấy lịch sử hội thoại (yêu cầu xác thực).
   */
  list(params?: {
    page?: number
    page_size?: number
    key_word?: string
    decistion_type?: ChatLogDecision
    sort_timestamp?: ChatLogSort
  }): Promise<PaginatedChatLogOut> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.page_size !== undefined) query.set('page_size', String(params.page_size))
    if (params?.key_word) query.set('key_word', params.key_word)
    if (params?.decistion_type) query.set('decistion_type', params.decistion_type)
    if (params?.sort_timestamp) query.set('sort_timestamp', params.sort_timestamp)
    const qs = query.toString()

    return request<PaginatedChatLogOut>(`/chat-log/${qs ? `?${qs}` : ''}`)
  },
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthService = {
  /**
   * Kiểm tra trạng thái API.
   */
  check(): Promise<unknown> {
    return request<unknown>('/healthz')
  },
}

export { ChatbotAPIError }
