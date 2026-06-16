'use client'

import { Globe2, Database, Shield, Zap, MessageSquare, FileText } from 'lucide-react'

const features = [
  {
    icon: Globe2,
    title: 'Multilingual Support',
    description:
      'Automatically detects and responds in English, Dutch, Bengali, and Hindi. No language switching needed.',
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Database,
    title: 'RAG-Powered Accuracy',
    description:
      'Retrieval-Augmented Generation uses a curated Netherlands knowledge base to provide grounded, accurate answers.',
    color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  },
  {
    icon: FileText,
    title: 'Source Citations',
    description:
      'Every answer includes numbered source citations so you can verify the information and read more.',
    color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: MessageSquare,
    title: 'Conversation Memory',
    description:
      'Remembers the last 10 messages in your session so you can ask follow-up questions naturally.',
    color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Zap,
    title: 'Voice Input & Output',
    description:
      'Use your microphone to ask questions and hear answers read aloud using the Web Speech API.',
    color: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description:
      'Rate limiting, input validation, and CORS protection. Your conversations are session-based, not stored permanently.',
    color: 'bg-red-50 dark:bg-red-950/30 text-dutch-red',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Newcomers to the Netherlands
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to navigate Dutch life — powered by AI and a curated knowledge base.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-gray-900 transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Topic categories */}
        <div className="mt-16">
          <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Knowledge Base Topics
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '🚆', label: 'Transportation' },
              { icon: '🏠', label: 'Housing' },
              { icon: '📋', label: 'Immigration & BSN' },
              { icon: '⚕️', label: 'Healthcare' },
              { icon: '🎓', label: 'Universities' },
              { icon: '🏛️', label: 'Tourism' },
              { icon: '🌷', label: 'Dutch Culture' },
              { icon: '💰', label: 'Cost of Living' },
              { icon: '🏦', label: 'Banking' },
              { icon: '💼', label: 'Jobs & Internships' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
