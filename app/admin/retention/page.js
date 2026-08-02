'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { adminFetch, setAdminKey } from '@/lib/adminAuth'
import { Lock, Loader2, ArrowLeft, Mail, Eye, Send, AlertTriangle } from 'lucide-react'

/**
 * Plain-language copy of the three emails, mirroring what the API sends.
 * Shown so nothing is ever sent that has not been read first.
 */
const EMAIL_PREVIEWS = [
  {
    key: 'usage',
    when: 'Day 3',
    subject: 'Getting the most out of your A-Bar',
    heading: 'One thing worth knowing',
    body: [
      'Hi [name],',
      'A-Bar works best when you give it a head start. Eat it 30–45 minutes before the moment that matters — not during it.',
      "That's when L-Theanine has reached your system, so you feel settled going in rather than halfway through.",
      "No pills, no powder. Just eat it like chocolate, a little earlier than you'd think."
    ],
    cta: 'Read how it works'
  },
  {
    key: 'review',
    when: 'Day 7',
    subject: 'How did it go? (₹20 off for telling us)',
    heading: 'Did it help?',
    body: [
      'Hi [name],',
      "You ordered from us about a week ago. We'd like to know how it actually went — good or bad, we want the honest version.",
      "It takes about thirty seconds, and we'll send you ₹20 off your next order either way."
    ],
    cta: 'Leave a review',
    footnote: 'The ₹20 is for writing a review, not for a good one. Please say what you actually thought.'
  },
  {
    key: 'replenishment',
    when: 'Day 25',
    subject: 'Running low?',
    heading: 'Running low?',
    body: [
      'Hi [name],',
      "You picked up A-Bar about a month ago. If it did its job, there's probably something coming up that deserves one — an exam, an interview, a day you'd rather walk into calmly.",
      'Reordering takes one tap.'
    ],
    cta: 'Reorder',
    footnote: 'Free delivery on orders over ₹600.'
  }
]

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
          {/* Exactly what gets sent, so nothing goes out unseen. */}
          <div className="brand-card p-5 sm:p-6">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#6f8a74]" />
              What gets sent
            </h2>
            <p className="text-sm text-[#59615b] mb-5">
              Three emails, each triggered once per order. Read them here, or send
              yourself the real thing below.
            </p>

            <div className="space-y-4">
              {EMAIL_PREVIEWS.map((e) => (
                <details key={e.key} className="rounded-xl border border-[#e6ddcd] bg-[#fbf7ed]/60 p-4">
                  <summary className="cursor-pointer text-sm font-semibold">
                    {e.when} &mdash; &ldquo;{e.subject}&rdquo;
                  </summary>
                  <div className="mt-3 text-sm leading-relaxed text-[#464c49] space-y-2">
                    <p className="font-semibold">{e.heading}</p>
                    {e.body.map((line, i) => <p key={i}>{line}</p>)}
                    <p className="text-xs text-[#6b736d]">Button: {e.cta}</p>
                    {e.footnote && <p className="text-xs text-[#8b938b]">{e.footnote}</p>}
                  </div>
                </details>
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
