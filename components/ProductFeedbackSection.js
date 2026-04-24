'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2, X } from 'lucide-react'
import Button from '@/components/Button'
import { formatAnswer } from '@/components/FeedbackQuestionRenderer'

const INITIAL_VISIBLE = 3

export default function ProductFeedbackSection({ productId, productName }) {
  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState([])
  const [total, setTotal] = useState(0)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!productId) return
    const fetchFb = async () => {
      try {
        const res = await fetch(`/api/feedback/product/${encodeURIComponent(productId)}`)
        const data = await res.json()
        if (data.success) {
          setFeedbacks(data.feedbacks || [])
          setTotal(data.total || 0)
        }
      } catch (err) {
        console.error('Failed to load product feedback', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFb()
  }, [productId])

  // Derive an average star rating if there's at least one star_rating question
  const avgRatingInfo = (() => {
    let sum = 0
    let count = 0
    let maxR = 5
    for (const fb of feedbacks) {
      const starAnswer = (fb.answers || []).find((a) => a.type === 'star_rating')
      if (starAnswer && typeof starAnswer.answer === 'number') {
        sum += starAnswer.answer
        count += 1
      }
    }
    return count > 0 ? { avg: sum / count, count, maxR } : null
  })()

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
  }

  const renderFeedbackCard = (fb) => (
    <div key={fb.id} className="border-b border-gray-200 pb-6 last:border-0">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C8A97E]/20 text-[#C8A97E] flex items-center justify-center font-semibold text-sm">
            {getInitials(fb.userName || 'User')}
          </div>
          <div>
            <p className="font-semibold">{fb.userName || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">
              {new Date(fb.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        {/* Star rating badge */}
        {(() => {
          const starA = (fb.answers || []).find((a) => a.type === 'star_rating')
          if (!starA || typeof starA.answer !== 'number') return null
          return (
            <div className="flex">
              {Array.from({ length: starA.answer }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C8A97E] text-[#C8A97E]" />
              ))}
            </div>
          )
        })()}
      </div>
      <div className="space-y-2 text-sm">
        {(fb.answers || []).map((a, i) => {
          // Star rating already shown in header
          if (a.type === 'star_rating') return null
          // Show blank answers only for required fields? Just skip empty answers to keep UI clean.
          if (
            a.answer === undefined ||
            a.answer === null ||
            a.answer === '' ||
            (Array.isArray(a.answer) && a.answer.length === 0)
          ) {
            return null
          }
          return (
            <div key={i}>
              <div className="font-semibold text-gray-700">{a.question}</div>
              <div className="text-gray-600">{formatAnswer(a.answer)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <section>
        <h2 className="font-playfair text-3xl font-bold mb-6">Customer Feedback</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
        </div>
      </section>
    )
  }

  if (feedbacks.length === 0) return null

  const visible = feedbacks.slice(0, INITIAL_VISIBLE)

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-3xl font-bold">Customer Feedback</h2>
          {avgRatingInfo && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: avgRatingInfo.maxR }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(avgRatingInfo.avg)
                        ? 'fill-[#C8A97E] text-[#C8A97E]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {avgRatingInfo.avg.toFixed(1)} · Based on {avgRatingInfo.count} rating
                {avgRatingInfo.count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">{total} feedback{total !== 1 ? 's' : ''}</div>
      </div>

      <div className="space-y-6">{visible.map(renderFeedbackCard)}</div>

      {feedbacks.length > INITIAL_VISIBLE && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            View more feedback ({feedbacks.length - INITIAL_VISIBLE} more)
          </Button>
        </div>
      )}

      {/* Full feedback modal */}
      {showAll && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAll(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-playfair text-2xl font-bold">
                All feedback for {productName}
              </h3>
              <button
                onClick={() => setShowAll(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto space-y-6">
              {feedbacks.map(renderFeedbackCard)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
