/**
 * Shared TypeScript types for DutchGuide AI frontend.
 * Mirrors the Pydantic schemas from the backend.
 */

export type SupportedLanguage = 'en' | 'nl' | 'bn' | 'hi' | 'auto'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: MessageRole
  content: string
  timestamp?: Date
  id?: string
}

export interface Source {
  title: string
  content_preview: string
  category: string
  relevance_score: number
  source_path: string
}

export interface ChatRequest {
  message: string
  session_id: string
  language?: SupportedLanguage
  conversation_history?: Array<{
    role: MessageRole
    content: string
  }>
}

export interface ChatResponse {
  answer: string
  sources: Source[]
  detected_language: string
  session_id: string
  suggested_questions: string[]
  model_used: string
}

export interface HealthResponse {
  status: string
  vector_store_ready: boolean
  llm_ready: boolean
  version: string
}

export interface StatsResponse {
  total_documents: number
  documents_by_category: Record<string, number>
  vector_store_size: number
  embedding_model: string
  llm_model: string
}

export interface UploadResponse {
  message: string
  filename: string
  chunks_created: number
  category: string
}

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: '🇬🇧 English',
  nl: '🇳🇱 Dutch',
  bn: '🇧🇩 Bengali',
  hi: '🇮🇳 Hindi',
  auto: '🌐 Auto',
}

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  bn: '🇧🇩',
  hi: '🇮🇳',
}

export const CATEGORY_ICONS: Record<string, string> = {
  transportation: '🚆',
  housing: '🏠',
  immigration: '📋',
  healthcare: '⚕️',
  universities: '🎓',
  tourism: '🏛️',
  culture: '🌷',
  general: '📌',
}
