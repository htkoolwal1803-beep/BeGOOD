'use client'

import { Star } from 'lucide-react'

// Renders an individual question for the user to answer and calls onChange with the answer value.
export default function FeedbackQuestionRenderer({ question, value, onChange }) {
  const common = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]'

  switch (question.type) {
    case 'short_text':
      return (
        <input
          type="text"
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
        />
      )
    case 'long_text':
      return (
        <textarea
          rows={4}
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
        />
      )
    case 'email':
      return (
        <input
          type="email"
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@example.com"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          className={common}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Enter a number"
        />
      )
    case 'date':
      return (
        <input
          type="date"
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'time':
      return (
        <input
          type="time"
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'dropdown':
      return (
        <select
          className={common}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Select --</option>
          {(question.options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      )
    case 'single_choice':
      return (
        <div className="space-y-2">
          {(question.options || []).map((opt, i) => (
            <label key={i} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 text-[#C8A97E] focus:ring-[#C8A97E]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )
    case 'multiple_choice': {
      const arr = Array.isArray(value) ? value : []
      const toggle = (opt) => {
        if (arr.includes(opt)) onChange(arr.filter((x) => x !== opt))
        else onChange([...arr, opt])
      }
      return (
        <div className="space-y-2">
          {(question.options || []).map((opt, i) => (
            <label key={i} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-4 h-4 text-[#C8A97E] focus:ring-[#C8A97E] rounded"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )
    }
    case 'linear_scale': {
      const min = question.scale?.min ?? 1
      const max = question.scale?.max ?? 5
      const values = []
      for (let i = min; i <= max; i++) values.push(i)
      return (
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {values.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => onChange(v)}
                className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                  value === v
                    ? 'bg-[#C8A97E] text-white border-[#C8A97E]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#C8A97E]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {(question.scale?.minLabel || question.scale?.maxLabel) && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>{question.scale?.minLabel}</span>
              <span>{question.scale?.maxLabel}</span>
            </div>
          )}
        </div>
      )
    }
    case 'star_rating': {
      const maxR = question.maxRating || 5
      const current = typeof value === 'number' ? value : 0
      return (
        <div className="flex items-center space-x-1">
          {Array.from({ length: maxR }).map((_, i) => {
            const n = i + 1
            return (
              <button
                type="button"
                key={n}
                onClick={() => onChange(n)}
                className="p-1"
                aria-label={`${n} star`}
              >
                <Star
                  className={`w-7 h-7 ${
                    n <= current ? 'fill-[#C8A97E] text-[#C8A97E]' : 'text-gray-300'
                  }`}
                />
              </button>
            )
          })}
          {current > 0 && <span className="ml-2 text-sm text-gray-600">{current}/{maxR}</span>}
        </div>
      )
    }
    default:
      return <div className="text-sm text-red-500">Unsupported question type: {question.type}</div>
  }
}

// Stringify an answer for display
export function formatAnswer(ans) {
  if (ans === null || ans === undefined || ans === '') return '—'
  if (Array.isArray(ans)) return ans.join(', ')
  return String(ans)
}
