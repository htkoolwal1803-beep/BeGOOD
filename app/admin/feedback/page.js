'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import FeedbackQuestionRenderer, { formatAnswer } from '@/components/FeedbackQuestionRenderer'
import {
  ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Loader2,
  MessageSquare, ListChecks, Save, Eye
} from 'lucide-react'

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text (paragraph)' },
  { value: 'single_choice', label: 'Multiple choice (single)' },
  { value: 'multiple_choice', label: 'Checkboxes (multi-select)' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'linear_scale', label: 'Linear scale' },
  { value: 'star_rating', label: 'Star rating' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' }
]

const needsOptions = (t) => ['single_choice', 'multiple_choice', 'dropdown'].includes(t)

function newQuestion(type = 'short_text') {
  const base = {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    question: '',
    required: false
  }
  if (needsOptions(type)) base.options = ['Option 1']
  if (type === 'linear_scale') base.scale = { min: 1, max: 5, minLabel: '', maxLabel: '' }
  if (type === 'star_rating') base.maxRating = 5
  return base
}

export default function AdminFeedbackPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [tab, setTab] = useState('questions')

  // Questions state
  const [title, setTitle] = useState('Share your feedback')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewing, setPreviewing] = useState(false)

  // Submissions state
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('all')

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        setAuthenticated(true)
        loadQuestions()
      } else {
        setAuthError('Invalid password')
      }
    } catch {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feedback/questions')
      const data = await res.json()
      if (data.success) {
        setTitle(data.title || 'Share your feedback')
        setDescription(data.description || '')
        setQuestions(Array.isArray(data.questions) ? data.questions : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    setSubmissionsLoading(true)
    try {
      const res = await fetch('/api/admin/feedback')
      const data = await res.json()
      if (data.success) setSubmissions(data.feedbacks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated && tab === 'submissions') loadSubmissions()
  }, [authenticated, tab])

  // Question manipulation helpers
  const updateQuestion = (idx, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }
  const moveQuestion = (idx, dir) => {
    setQuestions((prev) => {
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, item)
      return copy
    })
  }
  const changeType = (idx, type) => {
    const q = questions[idx]
    const updated = { ...q, type }
    if (needsOptions(type) && !Array.isArray(updated.options)) {
      updated.options = ['Option 1']
    }
    if (!needsOptions(type)) delete updated.options
    if (type === 'linear_scale' && !updated.scale) {
      updated.scale = { min: 1, max: 5, minLabel: '', maxLabel: '' }
    }
    if (type !== 'linear_scale') delete updated.scale
    if (type === 'star_rating' && !updated.maxRating) updated.maxRating = 5
    if (type !== 'star_rating') delete updated.maxRating
    setQuestions((prev) => prev.map((x, i) => (i === idx ? updated : x)))
  }

  const updateOption = (qIdx, oIdx, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const opts = [...(q.options || [])]
        opts[oIdx] = val
        return { ...q, options: opts }
      })
    )
  }
  const addOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...(q.options || []), `Option ${(q.options || []).length + 1}`] } : q
      )
    )
  }
  const removeOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const opts = [...(q.options || [])]
        opts.splice(oIdx, 1)
        return { ...q, options: opts }
      })
    )
  }

  const saveForm = async () => {
    setSaving(true)
    setMessage('')
    try {
      // Client side validation
      for (const q of questions) {
        if (!q.question.trim()) {
          setMessage('⚠ Every question must have text.')
          setSaving(false)
          return
        }
        if (needsOptions(q.type) && (!q.options || q.options.filter((o) => o.trim()).length === 0)) {
          setMessage(`⚠ Question "${q.question}" needs at least one option.`)
          setSaving(false)
          return
        }
      }
      const res = await fetch('/api/admin/feedback/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, questions })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✓ Saved successfully')
        setQuestions(data.form.questions)
      } else {
        setMessage(`⚠ ${data.message || 'Failed to save'}`)
      }
    } catch (err) {
      setMessage('⚠ An error occurred')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Group submissions by product
  const grouped = submissions.reduce((acc, s) => {
    const key = s.productId || 'unknown'
    if (!acc[key]) acc[key] = { productId: key, productName: s.productName, items: [] }
    acc[key].items.push(s)
    return acc
  }, {})

  // Auth screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="w-8 h-8 text-[#C8A97E]" />
            <h1 className="font-playfair text-2xl font-bold">Feedback Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                required
              />
            </div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <Button type="submit" disabled={authLoading} className="w-full">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Login'}
            </Button>
            <Link href="/admin" className="block text-center text-sm text-gray-500 hover:text-[#C8A97E]">
              <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Admin
            </Link>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-[#C8A97E] flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
            </Link>
            <h1 className="font-playfair text-3xl font-bold mt-2">Feedback Management</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 flex space-x-2 mb-6 w-fit">
          <button
            onClick={() => setTab('questions')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
              tab === 'questions' ? 'bg-[#C8A97E] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Questions</span>
          </button>
          <button
            onClick={() => setTab('submissions')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
              tab === 'submissions' ? 'bg-[#C8A97E] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Submissions</span>
          </button>
        </div>

        {/* Questions tab */}
        {tab === 'questions' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Form Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                    />
                  </div>
                </div>

                {/* Question cards */}
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Question {idx + 1}</div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                          placeholder="Type your question here"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E] text-lg"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => moveQuestion(idx, -1)} className="p-2 text-gray-500 hover:text-[#C8A97E] hover:bg-gray-100 rounded" title="Move up">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveQuestion(idx, 1)} className="p-2 text-gray-500 hover:text-[#C8A97E] hover:bg-gray-100 rounded" title="Move down">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeQuestion(idx)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Type</label>
                        <select
                          value={q.type}
                          onChange={(e) => changeType(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center space-x-2 self-end pb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                          className="w-4 h-4 text-[#C8A97E] rounded"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                    </div>

                    {/* Options editor */}
                    {needsOptions(q.type) && (
                      <div className="space-y-2 mb-2">
                        <div className="text-xs font-semibold text-gray-600">Options</div>
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                            />
                            <button
                              onClick={() => removeOption(idx, oIdx)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              disabled={(q.options || []).length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(idx)}
                          className="text-sm text-[#C8A97E] hover:underline flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" /> <span>Add option</span>
                        </button>
                      </div>
                    )}

                    {/* Linear scale config */}
                    {q.type === 'linear_scale' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min</label>
                          <input
                            type="number"
                            value={q.scale?.min ?? 1}
                            onChange={(e) => updateQuestion(idx, { scale: { ...(q.scale || {}), min: Number(e.target.value) } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Max</label>
                          <input
                            type="number"
                            value={q.scale?.max ?? 5}
                            onChange={(e) => updateQuestion(idx, { scale: { ...(q.scale || {}), max: Number(e.target.value) } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min Label</label>
                          <input
                            type="text"
                            value={q.scale?.minLabel || ''}
                            onChange={(e) => updateQuestion(idx, { scale: { ...(q.scale || {}), minLabel: e.target.value } })}
                            placeholder="e.g. Poor"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Max Label</label>
                          <input
                            type="text"
                            value={q.scale?.maxLabel || ''}
                            onChange={(e) => updateQuestion(idx, { scale: { ...(q.scale || {}), maxLabel: e.target.value } })}
                            placeholder="e.g. Excellent"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {/* Star rating config */}
                    {q.type === 'star_rating' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max stars (3–10)</label>
                        <input
                          type="number"
                          min={3}
                          max={10}
                          value={q.maxRating || 5}
                          onChange={(e) => updateQuestion(idx, { maxRating: Number(e.target.value) })}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add buttons & save */}
                <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setQuestions((prev) => [...prev, newQuestion('short_text')])}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add question</span>
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    {message && <span className="text-sm">{message}</span>}
                    <Button onClick={() => setPreviewing(true)} variant="outline">
                      <Eye className="w-4 h-4 mr-2 inline" /> Preview
                    </Button>
                    <Button onClick={saveForm} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2 inline" /> Save Form
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview modal */}
                {previewing && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewing(false)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                      <h2 className="font-playfair text-2xl font-bold mb-2">{title}</h2>
                      {description && <p className="text-gray-600 mb-6">{description}</p>}
                      <div className="space-y-6">
                        {questions.map((q, i) => (
                          <div key={q.id}>
                            <div className="font-medium mb-2">
                              {i + 1}. {q.question || <span className="text-gray-400 italic">Untitled</span>}
                              {q.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <FeedbackQuestionRenderer question={q} value={undefined} onChange={() => {}} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 text-right">
                        <Button onClick={() => setPreviewing(false)} variant="outline">Close</Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Submissions tab */}
        {tab === 'submissions' && (
          <div className="space-y-4">
            {submissionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                No feedback submissions yet.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                  <label className="text-sm font-semibold">Filter by product:</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="all">All products ({submissions.length})</option>
                    {Object.values(grouped).map((g) => (
                      <option key={g.productId} value={g.productId}>
                        {g.productName || g.productId} ({g.items.length})
                      </option>
                    ))}
                  </select>
                </div>

                {Object.values(grouped)
                  .filter((g) => selectedProduct === 'all' || g.productId === selectedProduct)
                  .map((group) => (
                    <div key={group.productId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#F5F0E8] px-6 py-3 font-semibold">
                        {group.productName || group.productId} · {group.items.length} feedback{group.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="divide-y">
                        {group.items.map((s) => (
                          <div key={s.id} className="p-6">
                            <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                              <span className="font-medium text-gray-800">{s.userName || 'Anonymous'} · {s.userPhone}</span>
                              <span>{new Date(s.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                              {(s.answers || []).map((a, i) => (
                                <div key={i} className="text-sm">
                                  <div className="font-semibold text-gray-700">{a.question}</div>
                                  <div className="text-gray-600">{formatAnswer(a.answer)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
