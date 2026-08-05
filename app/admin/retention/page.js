'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { adminFetch, setAdminKey } from '@/lib/adminAuth'
import { useEffect } from 'react'
import { Lock, Loader2, ArrowLeft, Mail, Eye, Send, AlertTriangle, Pencil, RotateCcw, Check } from 'lucide-react'

export default function AdminRetentionPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const [reviewMaxAge, setReviewMaxAge] = useState(200)
  const [running, setRunning] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [testTo, setTestTo] = useState('')
  const [testResult, setTestResult] = useState(null)

  // Editable email wording, loaded from the server once signed in.
  const [templates, setTemplates] = useState([])
  const [openKey, setOpenKey] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState('')

  useEffect(() => {
    if (!authenticated) return
    adminFetch('/api/admin/email-templates')
      .then((r) => r.json())
      .then((d) => { if (d.success) setTemplates(d.templates) })
      .catch(() => {})
  }, [authenticated])

  const startEdit = (t) => {
    setOpenKey(t.key)
    setDraft({ ...t })
    setSavedKey('')
  }

  const saveTemplate = async (reset = false) => {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      const res = await adminFetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reset ? { key: draft.key, reset: true } : draft)
      })
      const d = await res.json()
      if (d.success) {
        setTemplates((prev) => prev.map((t) => (t.key === d.template.key ? d.template : t)))
        setDraft(d.template)
        setSavedKey(d.template.key)
      } else {
        setError(d.message || 'Could not save')
      }
    } catch {
      setError('Could not save. Please try again.')
    }
    setSaving(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        setAdminKey(password)
        setAuthenticated(true)
      } else {
        setAuthError('Incorrect password')
      }
    } catch {
      setAuthError('Could not sign in. Please try again.')
    }
    setLoading(false)
  }

  const run = async (dry) => {
    if (!dry) {
      const n = result?.wouldSend
        ? (result.wouldSend.usage.length + result.wouldSend.reviewRequests.length + result.wouldSend.replenishment.length)
        : null
      const msg = n === null
        ? 'Send these emails for real? Run a preview first if you want to see who gets one.'
        : `Send ${n} real email${n === 1 ? '' : 's'} now? This cannot be undone.`
      if (!confirm(msg)) return
    }

    setRunning(dry ? 'dry' : 'send')
    setError('')
    setResult(null)
    try {
      const qs = new URLSearchParams({ reviewMaxAge: String(reviewMaxAge) })
      if (dry) qs.set('dryRun', '1')
      const res = await adminFetch(`/api/cron/retention?${qs.toString()}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.error || 'Something went wrong')
    } catch (e) {
      setError('Request failed. Please try again.')
    }
    setRunning('')
  }

  const sendTest = async () => {
    if (!testTo.trim()) return setError('Enter an email address first')
    setRunning('test')
    setError('')
    setTestResult(null)
    try {
      const res = await adminFetch(`/api/cron/retention?testEmail=${encodeURIComponent(testTo.trim())}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) setTestResult(data)
      else setError(data.error || 'Could not send the test')
    } catch {
      setError('Request failed. Please try again.')
    }
    setRunning('')
  }

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center px-4">
        <div className="brand-panel p-5 sm:p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#6f8a74]" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-2">Retention Emails</h1>
            <p className="text-[#59615b]">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-w-0 px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
              placeholder="Enter admin password"
              required
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Checking...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const w = result?.wouldSend
  const total = w ? w.usage.length + w.reviewRequests.length + w.replenishment.length : 0

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-1">Retention Emails</h1>
            <p className="text-[#59615b]">Ask past customers for a review, with ₹20 off attached</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Edit exactly what gets sent. Saved wording is used by the daily
              cron and by the test send, so what you read here is what goes out. */}
          <div className="brand-card p-5 sm:p-6">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#6f8a74]" />
              The emails
            </h2>
            <p className="text-sm text-[#59615b] mb-5">
              Edit any of these and the change applies to every future send. Use{' '}
              <code className="px-1 rounded bg-[#e6ddcd] text-[#4a5a4d]">{'{{name}}'}</code>{' '}
              for the customer&apos;s name.
            </p>

            <div className="space-y-3">
              {templates.length === 0 && (
                <p className="text-sm text-[#59615b]">Loading...</p>
              )}
              {templates.map((t) => (
                <div key={t.key} className="rounded-xl border border-[#e6ddcd] bg-[#fbf7ed]/60">
                  <button
                    type="button"
                    onClick={() => (openKey === t.key ? setOpenKey(null) : startEdit(t))}
                    className="w-full text-left p-4"
                  >
                    <span className="text-sm font-semibold block">
                      {t.label}
                      {t.isEdited && <span className="ml-2 text-xs font-normal text-[#6f8a74]">edited</span>}
                    </span>
                    <span className="text-xs text-[#6b736d] block mt-1">&ldquo;{t.subject}&rdquo;</span>
                  </button>

                  {openKey === t.key && draft && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[#e6ddcd] pt-4">
                      <p className="text-xs text-[#8b938b]">{t.description}</p>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Subject line</label>
                        <input
                          value={draft.subject}
                          onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                          className="w-full min-w-0 px-3 py-2 border border-[#d9cbb5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Heading</label>
                        <input
                          value={draft.heading}
                          onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
                          className="w-full min-w-0 px-3 py-2 border border-[#d9cbb5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Body <span className="font-normal text-[#8b938b]">(one paragraph per line)</span>
                        </label>
                        <textarea
                          rows={7}
                          value={draft.body}
                          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                          className="w-full min-w-0 px-3 py-2 border border-[#d9cbb5] rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Button text</label>
                          <input
                            value={draft.ctaLabel}
                            onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                            className="w-full min-w-0 px-3 py-2 border border-[#d9cbb5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Small print</label>
                          <input
                            value={draft.footnote}
                            onChange={(e) => setDraft({ ...draft, footnote: e.target.value })}
                            className="w-full min-w-0 px-3 py-2 border border-[#d9cbb5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button onClick={() => saveTemplate(false)} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => saveTemplate(true)}
                          disabled={saving}
                          className="text-sm text-[#6b736d] underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset to original
                        </button>
                        {savedKey === draft.key && (
                          <span className="text-sm text-[#3f5a46] flex items-center gap-1">
                            <Check className="w-4 h-4" /> Saved
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-[#e6ddcd]">
              <label className="block text-sm font-semibold mb-2">
                Send all three to yourself first
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                />
                <Button onClick={sendTest} variant="outline" size="lg" disabled={!!running} className="w-full sm:w-auto shrink-0">
                  {running === 'test' ? (
                    <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />Sending...</span>
                  ) : 'Send test emails'}
                </Button>
              </div>
              <p className="text-xs text-[#8b938b] mt-2">
                Goes only to this address, subject prefixed [TEST]. No customer is contacted
                and nothing is recorded.
              </p>

              {testResult && (
                <div className="mt-4 rounded-xl border border-[#c3d5c0] bg-[#dce6d7]/50 p-4">
                  <p className="text-sm font-semibold text-[#3f5a46] mb-2">
                    Sent to {testResult.testEmail}
                  </p>
                  <ul className="text-xs text-[#4a5a4d] space-y-1">
                    {testResult.sent.map((x) => (
                      <li key={x.key}>
                        {x.ok ? '✓' : '✗'} {x.subject}
                        {!x.ok && x.reason ? ` (${x.reason})` : ''}
                      </li>
                    ))}
                  </ul>
                  {testResult.reviewLink && (
                    <p className="text-xs text-[#4a5a4d] mt-3 break-all">
                      The review email links to{' '}
                      <a
                        href={testResult.reviewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-[#3f5a46]"
                      >
                        {testResult.reviewLink}
                      </a>{' '}
                      — a real, working link. Submitting it issues a coupon but does not
                      post a review.
                    </p>
                  )}
                  {testResult.sent.some((x) => !x.ok) && (
                    <p className="text-xs text-[#b4472e] mt-2">
                      Something failed. If it says not_configured, the Brevo keys are missing
                      in Vercel. Check your spam folder too.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="brand-card p-5 sm:p-6">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#6f8a74]" />
              Run the sequence now
            </h2>
            <p className="text-sm text-[#59615b] mb-5">
              This runs the same job the daily cron runs. It sends the day-3 usage tip,
              the day-7 review request and the day-25 replenishment reminder to anyone
              due one. Nobody is emailed twice.
            </p>

            <label className="block text-sm font-semibold mb-2">
              Include customers who ordered up to this many days ago
            </label>
            <input
              type="number"
              min="21"
              max="400"
              value={reviewMaxAge}
              onChange={(e) => setReviewMaxAge(e.target.value)}
              className="w-full min-w-0 sm:w-48 px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
            />
            <p className="text-xs text-[#8b938b] mt-2 mb-5">
              The daily cron uses 21. Use ~200 once to reach everyone who ordered before
              this system existed — otherwise those customers are never asked.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => run(true)} variant="outline" size="lg" disabled={!!running} className="w-full sm:w-auto">
                {running === 'dry' ? (
                  <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />Checking...</span>
                ) : (
                  <span className="flex items-center justify-center"><Eye className="w-4 h-4 mr-2" />Preview (sends nothing)</span>
                )}
              </Button>
              <Button onClick={() => run(false)} size="lg" disabled={!!running} className="w-full sm:w-auto">
                {running === 'send' ? (
                  <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />Sending...</span>
                ) : (
                  <span className="flex items-center justify-center"><Send className="w-4 h-4 mr-2" />Send for real</span>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="brand-card p-5 border border-red-200 bg-red-50">
              <p className="text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {result && (
            <div className="brand-card p-5 sm:p-6">
              <h2 className="font-semibold text-lg mb-1">
                {result.summary.dryRun ? 'Preview — nothing was sent' : 'Done'}
              </h2>
              <p className="text-sm text-[#59615b] mb-4">
                Window: customers who ordered up to {result.summary.reviewMaxAge} days ago
              </p>

              {result.summary.dryRun ? (
                <>
                  <p className="text-3xl font-bold text-[#3f5a46] mb-1">{total}</p>
                  <p className="text-sm text-[#59615b] mb-5">
                    email{total === 1 ? '' : 's'} would be sent
                  </p>
                  {['reviewRequests', 'usage', 'replenishment'].map((k) => (
                    w[k].length > 0 && (
                      <div key={k} className="mb-4">
                        <p className="text-sm font-semibold mb-2">
                          {k === 'reviewRequests' ? 'Review request + ₹20' : k === 'usage' ? 'How to use it (day 3)' : 'Replenishment (day 25)'}
                          {' '}— {w[k].length}
                        </p>
                        <ul className="text-xs text-[#59615b] space-y-1 max-h-52 overflow-y-auto">
                          {w[k].map((x) => <li key={x.orderId}>{x.email}</li>)}
                        </ul>
                      </div>
                    )
                  ))}
                  {total === 0 && (
                    <p className="text-sm text-[#59615b]">
                      Nobody is due an email right now. Try a larger number of days above.
                    </p>
                  )}
                </>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-bold text-[#3f5a46]">{result.summary.reviewRequests}</p>
                    <p className="text-sm text-[#59615b]">Review requests sent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#3f5a46]">{result.summary.usage}</p>
                    <p className="text-sm text-[#59615b]">Usage tips sent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#3f5a46]">{result.summary.replenishment}</p>
                    <p className="text-sm text-[#59615b]">Reminders sent</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-[#8b938b]">
            Brevo's free plan allows 300 emails a day. Review codes appear under
            Admin → Coupons as they are claimed.
          </p>
        </div>
      </div>
    </div>
  )
}
