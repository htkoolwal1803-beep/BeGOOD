'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { adminFetch, setAdminKey } from '@/lib/adminAuth'
import { Lock, Loader2, ArrowLeft, Mail, Eye, Send, AlertTriangle } from 'lucide-react'

export default function AdminRetentionPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const [reviewMaxAge, setReviewMaxAge] = useState(200)
  const [running, setRunning] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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
