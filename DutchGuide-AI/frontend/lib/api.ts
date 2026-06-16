/**
 * API Client
 * ==========
 * Typed wrapper around the DutchGuide AI backend API.
 */

import axios from 'axios'
import type {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  StatsResponse,
  UploadResponse,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000, // 60 seconds — LLM can be slow
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error normalisation
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

/**
 * Send a chat message and receive an AI response.
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/chat', request)
  return data
}

/**
 * Check the backend health status.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}

/**
 * Get knowledge base statistics.
 */
export async function getStats(): Promise<StatsResponse> {
  const { data } = await apiClient.get<StatsResponse>('/stats')
  return data
}

/**
 * Upload a document to the knowledge base.
 */
export async function uploadDocument(
  file: File,
  category: string
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const { data } = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Trigger a full knowledge base rebuild.
 */
export async function rebuildKnowledgeBase() {
  const { data } = await apiClient.post('/rebuild')
  return data
}
