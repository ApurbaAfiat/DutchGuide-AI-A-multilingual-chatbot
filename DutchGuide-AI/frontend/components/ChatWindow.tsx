'use client'

import { useEffect, useRef } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import SuggestedQuestions from './SuggestedQuestions'
import { useChat } from '@/hooks/useChat'
import { useVoice } from '@/hooks/useVoice'
import { cn } from '@/lib/utils'

const WELCOME_SUGGESTIONS = [
  "What should I do immediately after arriving in the Netherlands?",
  "How do I get a BSN number?",
  "How much does student housing cost in Amsterdam?",
  "What is the OV-chipkaart and how do I use it?",
  "Which universities are best for international students?",
]

export default function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    selectedLanguage,
    sendMessage,
    setSelectedLanguage,
    clearConversation,
  } = useChat()

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: voiceSupported,
  } = useVoice()

  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMessage = messages[messages.length - 1]
  const lastSuggestions =
    lastMessage?.role === 'assistant' && lastMessage.suggestedQuestions
      ? lastMessage.suggestedQuestions
      : []

  return (
    <section id="chat" className="max-w-4xl mx-auto px-4 pb-12">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              DutchGuide AI
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">
              · {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              title="Clear conversation"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>

        {/* Messages area */}
        <div
          ref={containerRef}
          className="h-[480px] overflow-y-auto p-4 space-y-5 scroll-smooth"
        >
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="text-5xl">🇳🇱</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to DutchGuide AI
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Ask me anything about life in the Netherlands. I speak English, Dutch, Bengali, and Hindi.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {WELCOME_SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-dutch-red dark:hover:text-dutch-red-light text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-dutch-red/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              onStopSpeaking={stopSpeaking}
            />
          ))}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
              <RefreshCw size={14} />
              {error}
            </div>
          )}

          {/* Suggested follow-ups */}
          {lastSuggestions.length > 0 && !isLoading && (
            <SuggestedQuestions
              questions={lastSuggestions}
              onSelect={sendMessage}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            isListening={isListening}
            transcript={transcript}
            onStartListening={startListening}
            onStopListening={stopListening}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            voiceSupported={voiceSupported}
          />
        </div>
      </div>
    </section>
  )
}
