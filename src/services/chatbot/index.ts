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
  MeResponse,
  PaginatedChatLogOut,
  PaginatedFAQOut,
  RewriteCreate,
  RewriteOut,
  RewriteUpdate,
  SupportEmailOut,
  Token,
  UserCreate,
  UserOut,
  UserUpdate,
} from './types'

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://chatbot-bkfinteck-api.a-star.group/api/v1'

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

  const isNativeObject =
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)

  const headers: HeadersInit = {
    ...(body !== undefined && !isNativeObject ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
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
   * Đăng nhập, trả về access_token.
   */
  login(payload: LoginPayload): Promise<Token> {
    const form = new URLSearchParams()
    form.set('username', payload.username)
    form.set('password', payload.password)
    if (payload.grant_type) form.set('grant_type', payload.grant_type)
    if (payload.scope) form.set('scope', payload.scope)
    if (payload.client_id) form.set('client_id', payload.client_id)
    if (payload.client_secret) form.set('client_secret', payload.client_secret)

    return request<Token>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form as unknown, // FormData-encoded, bypass JSON stringify
    })
  },

  /**
   * Lấy thông tin người dùng hiện tại (yêu cầu xác thực).
   */
  me(token: string): Promise<MeResponse> {
    return request<MeResponse>('/auth/me', { token })
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
  create(payload: FAQCreate, token: string): Promise<FAQOut> {
    return request<FAQOut>('/faq/', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  /**
   * Cập nhật FAQ (yêu cầu xác thực).
   */
  update(answerId: number, payload: FAQUpdate, token: string): Promise<FAQOut> {
    return request<FAQOut>(`/faq/${answerId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },

  /**
   * Xoá FAQ (yêu cầu xác thực).
   */
  delete(answerId: number, token: string): Promise<void> {
    return request<void>(`/faq/${answerId}`, {
      method: 'DELETE',
      token,
    })
  },

  // ── Batch Operations ────────────────────────────────────────────────────────

  /**
   * Thêm FAQ hàng loạt (yêu cầu xác thực).
   */
  addRows(payload: FAQCsvRow[], token: string): Promise<FAQOut[]> {
    return request<FAQOut[]>('/faq/add', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  /**
   * Cập nhật FAQ hàng loạt (yêu cầu xác thực).
   */
  editRows(payload: FAQCsvRow[], token: string): Promise<FAQOut[]> {
    return request<FAQOut[]>('/faq/edit', {
      method: 'PUT',
      body: payload,
      token,
    })
  },

  /**
   * Thêm FAQ từ file CSV (yêu cầu xác thực).
   */
  addCsv(file: File | Blob, token: string): Promise<FAQOut[]> {
    const formData = new FormData()
    formData.append('file', file)

    return request<FAQOut[]>('/faq/add-csv', {
      method: 'POST',
      body: formData as unknown,
      token,
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
  addVariant(answerId: number, payload: FAQVariantCreate, token: string): Promise<FAQVariantOut> {
    return request<FAQVariantOut>(`/faq/${answerId}/variants`, {
      method: 'POST',
      body: payload,
      token,
    })
  },

  /**
   * Xoá câu hỏi biến thể (yêu cầu xác thực).
   */
  deleteVariant(answerId: number, variantId: number, token: string): Promise<void> {
    return request<void>(`/faq/${answerId}/variants/${variantId}`, {
      method: 'DELETE',
      token,
    })
  },

  /**
   * Cập nhật hàng loạt biến thể (yêu cầu xác thực).
   */
  bulkUpdateVariants(
    payload: FAQVariantBulkUpdateItem[],
    token: string,
  ): Promise<BulkUpdateResultWithDetails> {
    return request<BulkUpdateResultWithDetails>('/faq/variants/bulk', {
      method: 'PUT',
      body: payload,
      token,
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
  create(payload: RewriteCreate, token: string): Promise<RewriteOut> {
    return request<RewriteOut>('/rewrite/', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  /**
   * Cập nhật rewrite rule (yêu cầu xác thực).
   */
  update(ruleId: number, payload: RewriteUpdate, token: string): Promise<RewriteOut> {
    return request<RewriteOut>(`/rewrite/${ruleId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },

  /**
   * Xoá rewrite rule (yêu cầu xác thực).
   */
  delete(ruleId: number, token: string): Promise<void> {
    return request<void>(`/rewrite/${ruleId}`, {
      method: 'DELETE',
      token,
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
  update(payload: ConfigUpdate, token: string): Promise<ConfigOut> {
    return request<ConfigOut>('/config/', {
      method: 'PUT',
      body: payload,
      token,
    })
  },
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const userService = {
  /**
   * Lấy danh sách người dùng (yêu cầu xác thực).
   */
  list(token: string): Promise<UserOut[]> {
    return request<UserOut[]>('/users/', { token })
  },

  /**
   * Tạo người dùng mới (yêu cầu xác thực).
   */
  create(payload: UserCreate, token: string): Promise<UserOut> {
    return request<UserOut>('/users/', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  /**
   * Cập nhật thông tin người dùng (yêu cầu xác thực).
   */
  update(userId: number, payload: UserUpdate, token: string): Promise<UserOut> {
    return request<UserOut>(`/users/${userId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },

  /**
   * Xoá người dùng (yêu cầu xác thực).
   */
  delete(userId: number, token: string): Promise<void> {
    return request<void>(`/users/${userId}`, {
      method: 'DELETE',
      token,
    })
  },
}

// ─── Chat Log ───────────────────────────────────────────────────────────────

export const chatLogService = {
  /**
   * Lấy lịch sử hội thoại (yêu cầu xác thực).
   */
  list(
    token: string,
    params?: {
      page?: number
      page_size?: number
      key_word?: string
      decistion_type?: ChatLogDecision
      sort_timestamp?: ChatLogSort
    },
  ): Promise<PaginatedChatLogOut> {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.page_size !== undefined) query.set('page_size', String(params.page_size))
    if (params?.key_word) query.set('key_word', params.key_word)
    if (params?.decistion_type) query.set('decistion_type', params.decistion_type)
    if (params?.sort_timestamp) query.set('sort_timestamp', params.sort_timestamp)
    const qs = query.toString()

    return request<PaginatedChatLogOut>(`/chat-log/${qs ? `?${qs}` : ''}`, { token })
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
