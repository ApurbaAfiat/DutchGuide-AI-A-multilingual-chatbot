'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Mic, MicOff, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANGUAGE_LABELS, type SupportedLanguage } from '@/lib/types'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  isListening: boolean
  transcript: string
  onStartListening: () => void
  onStopListening: () => void
  selectedLanguage: SupportedLanguage
  onLanguageChange: (lang: SupportedLanguage) => void
  voiceSupported: boolean
}

const LANGUAGES: SupportedLanguage[] = ['auto', 'en', 'nl', 'bn', 'hi']

export default function ChatInput({
  onSend,
  isLoading,
  isListening,
  transcript,
  onStartListening,
  onStopListening,
  selectedLanguage,
  onLanguageChange,
  voiceSupported,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync transcript from voice input into text field
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
      textareaRef.current?.focus()
    }
  }, [transcript])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative">
      {/* Language picker dropdown */}
      {showLangPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10 min-w-[160px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang)
                setShowLangPicker(false)
              }}
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                selectedLanguage === lang
                  ? 'text-dutch-red font-semibold bg-red-50 dark:bg-red-950/30'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus-within:border-dutch-red/50 focus-within:shadow-md transition-all">
        {/* Language selector */}
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          title="Select language"
          className={cn(
            'p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 mb-0.5',
            showLangPicker && 'bg-gray-100 dark:bg-gray-800 text-dutch-red'
          )}
        >
          <Globe size={16} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Listening...'
              : 'Ask anything about the Netherlands...'
          }
          rows={1}
          disabled={isLoading}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none max-h-40 leading-relaxed',
            isLoading && 'opacity-50'
          )}
        />

        {/* Voice button */}
        {voiceSupported && (
          <button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Voice input'}
            className={cn(
              'p-2 rounded-lg transition-colors flex-shrink-0 mb-0.5',
              isListening
                ? 'bg-dutch-red text-white animate-pulse'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          title="Send message"
          className={cn(
            'p-2 rounded-lg transition-all flex-shrink-0 mb-0.5',
            input.trim() && !isLoading
              ? 'bg-dutch-red text-white hover:bg-dutch-red-dark active:scale-95 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Hint text */}
      <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-2">
        {LANGUAGE_LABELS[selectedLanguage]} · Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
