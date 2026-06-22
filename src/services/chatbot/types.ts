// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string
  password: string
  grant_type?: 'password'
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export interface MeResponse {
  id: number
  username: string
  role: string
  full_name: string
  is_active: boolean
}

export interface MessageResponse {
  detail: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  query: string
}

export interface Suggestion {
  answer_id: number
  question: string
  score: number
}

export type ChatDecision = 'answer' | 'ambiguity' | 'fallback' | string

export interface ChatResponse {
  decision: ChatDecision
  answer?: string | null
  answer_id?: number | null
  suggestions?: Suggestion[] | null
  fallback_message?: string | null
  contact?: string | null
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQVariantOut {
  variant_id: number
  answer_id: number
  variant_text: string
  is_active: boolean
}

export interface FAQVariantCreate {
  variant_text: string
  is_active?: boolean
}

export interface FAQOut {
  answer_id: number
  question: string
  answer: string
  category?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  variants: FAQVariantOut[]
}

export interface FAQCreate {
  question: string
  answer: string
  category?: string | null
  is_active?: boolean
  variants?: string[]
}

export interface FAQUpdate {
  question?: string | null
  answer?: string | null
  category?: string | null
  is_active?: boolean | null
}

export interface FAQCsvRow {
  answer_id: number
  category?: string | null
  type: string
  content: string
  answer?: string | null
}

export interface PaginatedFAQOut {
  total: number
  page: number
  total_pages: number
  page_size: number
  items: FAQOut[]
}

export interface FAQVariantBulkUpdateItem {
  variant_id: number
  answer_id?: number | null
  variant_text?: string | null
  is_active?: boolean | null
}

export interface FailedVariantDetail {
  variant_id: number
  error: string
}

export interface BulkUpdateResultWithDetails {
  success_count: number
  failure_count: number
  failed_ids?: number[]
  failed_details?: FailedVariantDetail[]
}

// ─── Rewrite ──────────────────────────────────────────────────────────────────

export interface RewriteOut {
  id: number
  raw_text: string
  normalized_text: string
  is_active: boolean
}

export interface RewriteCreate {
  raw_text: string
  normalized_text: string
  is_active?: boolean
}

export interface RewriteUpdate {
  raw_text?: string | null
  normalized_text?: string | null
  is_active?: boolean | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ConfigOut {
  similarity_threshold: number
  margin_threshold: number
  log_retention_days: number
  support_email?: string | null
}

export interface ConfigUpdate {
  similarity_threshold?: number | null
  margin_threshold?: number | null
  /** 1 – 3650 */
  log_retention_days?: number | null
  support_email?: string | null
}

export interface SupportEmailOut {
  support_email?: string | null
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserOut {
  id: number
  username: string
  full_name: string | null
  is_active: boolean
  created_at: string
  role: string
}

export interface UserCreate {
  username: string
  password: string
  full_name?: string | null
}

export interface UserUpdate {
  full_name?: string | null
  is_active?: boolean | null
  password?: string | null
}

// ─── Chat Log ───────────────────────────────────────────────────────────────

export type ChatLogDecision = 'answer' | 'ambiguity' | 'fallback' | string

export type ChatLogSort = 'asc' | 'desc'

export interface ChatLogResponse {
  ask: string
  decistion_type: ChatLogDecision
  answer: string | null
  timestamp: string
}

export interface PaginatedChatLogOut {
  total: number
  page: number
  total_pages: number
  page_size: number
  items: ChatLogResponse[]
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail: ValidationError[]
}
