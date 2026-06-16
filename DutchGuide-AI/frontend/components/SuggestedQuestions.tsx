'use client'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (q: string) => void
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      <span className="text-xs text-gray-400 dark:text-gray-600 w-full">Suggested questions:</span>
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-dutch-red dark:hover:text-dutch-red-light hover:border-dutch-red/40 text-gray-600 dark:text-gray-400 transition-all"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
