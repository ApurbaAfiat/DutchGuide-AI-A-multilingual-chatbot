/**
 * useChat Hook
 * ============
 * Manages the chat state, sends messages to the backend,
 * and handles conversation history.
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendChatMessage } from '@/lib/api'
import type { ChatMessage, ChatResponse, SupportedLanguage, Source } from '@/lib/types'
import { generateSessionId } from '@/lib/utils'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  detectedLanguage?: string
  suggestedQuestions?: string[]
  isLoading?: boolean
}

export interface UseChatReturn {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sessionId: string
  selectedLanguage: SupportedLanguage
  sendMessage: (text: string) => Promise<void>
  setSelectedLanguage: (lang: SupportedLanguage) => void
  clearConversation: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto')
  const sessionId = useRef<string>(generateSessionId())

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      setError(null)

      // Add user message immediately
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      // Add loading assistant placeholder
      const loadingId = uuidv4()
      const loadingMessage: Message = {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      }

      setMessages((prev) => [...prev, userMessage, loadingMessage])
      setIsLoading(true)

      try {
        // Build conversation history for multi-turn context
        const history = messages
          .filter((m) => !m.isLoading)
          .slice(-20) // last 10 turns (20 messages)
          .map((m) => ({ role: m.role, content: m.content }))

        const response: ChatResponse = await sendChatMessage({
          message: text.trim(),
          session_id: sessionId.current,
          language: selectedLanguage,
          conversation_history: history,
        })

        // Replace loading message with actual response
        const assistantMessage: Message = {
          id: loadingId,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          sources: response.sources,
          detectedLanguage: response.detected_language,
          suggestedQuestions: response.suggested_questions,
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === loadingId ? assistantMessage : m))
        )
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Failed to get response'
        setError(errMsg)

        // Replace loading with error message
        const errorMessage: Message = {
          id: loadingId,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errMsg}. Please try again.`,
          timestamp: new Date(),
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === loadingId ? errorMessage : m))
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, selectedLanguage]
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
    sessionId.current = generateSessionId()
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId: sessionId.current,
    selectedLanguage,
    sendMessage,
    setSelectedLanguage,
    clearConversation,
  }
}
