'use client'

import { ArrowDown, Globe, Zap, BookOpen } from 'lucide-react'

interface HeroProps {
  onStartChat: () => void
}

const stats = [
  { icon: Globe, label: '4 Languages', desc: 'EN, NL, BN, HI' },
  { icon: Zap, label: 'RAG Powered', desc: 'Retrieval-augmented' },
  { icon: BookOpen, label: '7 Topics', desc: 'Comprehensive guide' },
]

export default function Hero({ onStartChat }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative bg-gradient-to-br from-white via-red-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-24 px-4 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-dutch-red/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-dutch-blue/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 text-dutch-red text-xs font-semibold mb-6 border border-red-200 dark:border-red-900">
          <span className="w-1.5 h-1.5 rounded-full bg-dutch-red animate-pulse" />
          AI-Powered Netherlands Guide
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight text-balance">
          Your Personal{' '}
          <span className="text-dutch-red">Netherlands</span>{' '}
          Companion
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 text-balance">
          Ask anything about living, studying, traveling, and settling in the Netherlands.
          Multilingual answers with source citations — in English, Dutch, Bengali, and Hindi.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={onStartChat}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-dutch-red text-white font-semibold text-base hover:bg-dutch-red-dark active:scale-95 transition-all shadow-lg shadow-red-200 dark:shadow-red-950/50"
          >
            Start Chatting
            <ArrowDown size={18} className="animate-bounce" />
          </button>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Learn More
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40">
                <Icon size={16} className="text-dutch-red" />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">{label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
