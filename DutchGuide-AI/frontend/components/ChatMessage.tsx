'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Volume2, VolumeX, User, Bot } from 'lucide-react'
import type { Message } from '@/hooks/useChat'
import { CATEGORY_ICONS, LANGUAGE_FLAGS } from '@/lib/types'
import { formatTime, cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  onSpeak: (text: string, lang: string) => void
  isSpeaking: boolean
  onStopSpeaking: () => void
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

export default function ChatMessage({
  message,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isLoading = message.isLoading

  return (
    <div
      className={cn(
        'flex gap-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
          isUser
            ? 'bg-dutch-red text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-dutch-red text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          )}
        >
          {isLoading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dutch-red underline underline-offset-2 hover:text-dutch-red-dark"
                  >
                    {children}
                  </a>
                ),
                // Style tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                    {children}
                  </td>
                ),
                // Style code
                code: ({ children }) => (
                  <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-xs font-mono">
                    {children}
                  </code>
                ),
                // Headings
                h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-0.5">{children}</h3>,
                // Lists
                ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
                // Paragraphs
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Sources */}
        {!isLoading && !isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <span
                key={i}
                title={source.content_preview}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:border-dutch-red/50 transition-colors cursor-default"
              >
                <span>{CATEGORY_ICONS[source.category] || '📌'}</span>
                <span>[{i + 1}] {source.title}</span>
              </span>
            ))}
          </div>
        )}

        {/* Footer row: timestamp + language + TTS button */}
        <div className={cn('flex items-center gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-gray-400 dark:text-gray-600">
            {formatTime(message.timestamp)}
          </span>
          {!isUser && message.detectedLanguage && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600">
              {LANGUAGE_FLAGS[message.detectedLanguage] || '🌐'} {message.detectedLanguage.toUpperCase()}
            </span>
          )}
          {!isUser && !isLoading && message.content && (
            <button
              onClick={() =>
                isSpeaking
                  ? onStopSpeaking()
                  : onSpeak(message.content, message.detectedLanguage || 'en')
              }
              aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              className="text-gray-400 hover:text-dutch-red dark:hover:text-dutch-red-light transition-colors"
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
