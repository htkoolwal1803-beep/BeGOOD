'use client'

import { useState, useEffect } from 'react'
import { products } from '@/lib/products'
import Button from '@/components/Button'
import FeedbackQuestionRenderer, { formatAnswer } from '@/components/FeedbackQuestionRenderer'
import { Loader2, Plus, MessageSquare, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

// Renders the feedback tab used inside the profile page.
export default function FeedbackTab({ userPhone, userName }) {
  const [loading, setLoading] = useState(true)
  const [mySubmissions, setMySubmissions] = useState([])
  const [configuredMap, setConfiguredMap] = useState({}) // productId -> boolean

  const [showPicker, setShowPicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formTitle, setFormTitle] = useState('Share your feedback')
  const [formDescription, setFormDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [expandedSubmission, setExpandedSubmission] = useState(null)

  useEffect(() => {
    loadData()
  }, [userPhone])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sRes, allRes] = await Promise.all([
        fetch(`/api/users/${encodeURIComponent(userPhone)}/feedback`).then((r) => r.json()),
        fetch('/api/admin/feedback/questions/all').then((r) => r.json())
      ])
      if (sRes.success) setMySubmissions(sRes.feedbacks || [])
      if (allRes.success) {
        const map = {}
        for (const f of allRes.forms || []) map[f.productId] = true
        setConfiguredMap(map)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const alreadySubmittedProductIds = new Set(mySubmissions.map((s) => s.productId))

  const openPickerAndSelect = () => {
    setSelectedProduct(null)
    setShowPicker(true)
  }

  const startFeedback = async (product) => {
    setShowPicker(false)
    setSelectedProduct(product)
    setAnswers({})
    setSubmitError('')
    setFormLoading(true)
    try {
      const res = await fetch(`/api/feedback/questions?productId=${encodeURIComponent(product.id)}`)
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions || [])
        setFormTitle(data.title || 'Share your feedback')
        setFormDescription(data.description || '')
      } else {
        setQuestions([])
      }
    } catch {
      setQuestions([])
    } finally {
      setFormLoading(false)
    }
  }

  const cancelFeedback = () => {
    setSelectedProduct(null)
    setQuestions([])
    setAnswers({})
    setSubmitError('')
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    setSubmitError('')
    // Validate required
    for (const q of questions) {
      if (!q.required) continue
      const v = answers[q.id]
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        setSubmitError(`Please answer: "${q.question}"`)
        return
      }
    }
    setSubmitting(true)
    try {
      const payload = {
        userPhone,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        answers: questions.map((q) => ({
          questionId: q.id,
          question: q.question,
          type: q.type,
          answer: answers[q.id] ?? (q.type === 'multiple_choice' ? [] : '')
        }))
      }
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        await loadData()
        setSelectedProduct(null)
        setAnswers({})
      } else {
        setSubmitError(data.message || 'Failed to submit feedback')
      }
    } catch (err) {
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
        </div>
      </div>
    )
  }

  // Group my submissions by product
  const groupedByProduct = mySubmissions.reduce((acc, s) => {
    const key = s.productId
    if (!acc[key]) acc[key] = { productId: s.productId, productName: s.productName, items: [] }
    acc[key].items.push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="font-playfair text-2xl font-bold">Feedback</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your thoughts about a product you&apos;ve tried.
            </p>
          </div>
          <Button onClick={openPickerAndSelect}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Give Feedback for a Product
          </Button>
        </div>

        {questions.length === 0 && !selectedProduct && (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
            Click &quot;Give Feedback for a Product&quot; above to start. You&apos;ll only see products that have a feedback form configured by the admin.
          </div>
        )}

        {/* Active feedback form */}
        {selectedProduct && (
          <div className="border border-[#C8A97E]/30 rounded-xl p-6 bg-[#F5F0E8]/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-playfair text-xl font-bold">{formTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Product: <span className="font-semibold">{selectedProduct.name}</span>
                </p>
                {formDescription && <p className="text-sm text-gray-600 mt-1">{formDescription}</p>}
              </div>
              <button onClick={cancelFeedback} className="p-2 text-gray-500 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                The admin hasn&apos;t set up a feedback form for this product yet. Please check back later.
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-sm font-semibold mb-2">
                      {idx + 1}. {q.question}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <FeedbackQuestionRenderer
                      question={q}
                      value={answers[q.id]}
                      onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                    />
                  </div>
                ))}
                {submitError && (
                  <p className="text-red-500 text-sm">{submitError}</p>
                )}
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Feedback'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelFeedback}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Past feedback (categorized by product) */}
      {mySubmissions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-playfair text-xl font-bold mb-4">Your Feedback History</h3>
          <div className="space-y-4">
            {Object.values(groupedByProduct).map((g) => (
              <div key={g.productId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-[#F5F0E8] px-4 py-3 font-semibold flex items-center justify-between">
                  <span>{g.productName || g.productId}</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {g.items.length} submission{g.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y">
                  {g.items.map((s) => {
                    const isOpen = expandedSubmission === s.id
                    return (
                      <div key={s.id} className="p-4">
                        <button
                          className="w-full flex items-center justify-between text-left"
                          onClick={() => setExpandedSubmission(isOpen ? null : s.id)}
                        >
                          <span className="text-sm text-gray-600">
                            Submitted {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isOpen && (
                          <div className="mt-3 space-y-2 text-sm">
                            {(s.answers || []).map((a, i) => (
                              <div key={i}>
                                <div className="font-semibold text-gray-700">{a.question}</div>
                                <div className="text-gray-600">{formatAnswer(a.answer)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPicker(false)}
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-xl font-bold">Pick a product</h3>
              <button onClick={() => setShowPicker(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((p) => {
                const already = alreadySubmittedProductIds.has(p.id)
                const configured = !!configuredMap[p.id]
                const disabled = already || !configured
                return (
                  <button
                    key={p.id}
                    onClick={() => !disabled && startFeedback(p)}
                    disabled={disabled}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition ${
                      disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#C8A97E] hover:bg-[#F5F0E8]/50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.tagline}</div>
                    </div>
                    {already ? (
                      <span className="flex items-center text-xs text-green-600">
                        <Check className="w-4 h-4 mr-1" /> Submitted
                      </span>
                    ) : !configured ? (
                      <span className="text-xs text-gray-400">Not set up yet</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
            {Object.keys(configuredMap).length === 0 && (
              <p className="text-xs text-red-500 mt-3">
                No products have a feedback form configured yet. Please come back later.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
