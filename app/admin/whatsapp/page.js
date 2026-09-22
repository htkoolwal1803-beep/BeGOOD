'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { adminFetch, hasAdminKey, setAdminKey } from '@/lib/adminAuth'
import { ArrowLeft, CheckCircle2, Lock, MessageCircle, Send, Users } from 'lucide-react'

export default function WhatsAppAdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [data, setData] = useState(null)
  const [kind, setKind] = useState('offer')
  const [headline, setHeadline] = useState('')
  const [detail, setDetail] = useState('')
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const response = await adminFetch('/api/admin/whatsapp')
    if (response.status === 401) {
      setAuthenticated(false)
      return
    }
    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Could not load WhatsApp settings')
    setData(result)
    setAuthenticated(true)
  }

  useEffect(() => {
    if (hasAdminKey()) refresh().catch((error) => setMessage(error.message))
  }, [])

  async function login(event) {
    event.preventDefault()
    setAdminKey(password)
    await refresh().catch((error) => setMessage(error.message))
  }

  async function submit(dryRun) {
    setBusy(true)
    setMessage('')
    if (!dryRun && !confirm(`Send this WhatsApp campaign to ${preview?.recipients || 0} opted-in customers? This cannot be undone.`)) {
      setBusy(false)
      return
    }
    try {
      const response = await adminFetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, headline, detail, dryRun })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Campaign failed')
      if (dryRun) {
        setPreview(result)
        setMessage(`Preview ready: ${result.recipients} opted-in customers.`)
      } else {
        setMessage(`Campaign sent: ${result.sent} accepted, ${result.failed} failed.`)
        setPreview(null)
        await refresh()
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center px-4">
        <form onSubmit={login} className="brand-panel w-full max-w-md p-8">
          <Lock className="mx-auto h-10 w-10 text-[#6f8a74]" />
          <h1 className="mt-4 text-center font-playfair text-3xl font-bold">WhatsApp automation</h1>
          <p className="mt-2 text-center text-sm text-[#59615b]">Use the BeGood admin password.</p>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6 w-full rounded-lg border border-[#d9cbb5] px-4 py-3" required />
          <Button type="submit" className="mt-4 w-full">Sign in</Button>
          {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <Link href="/admin" className="inline-flex items-center text-sm font-semibold text-[#6f8a74]"><ArrowLeft className="mr-2 h-4 w-4" />Admin dashboard</Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-playfair text-4xl font-bold">WhatsApp automation</h1>
            <p className="mt-2 text-[#59615b]">Order messages send automatically. Marketing sends only to explicit opt-ins.</p>
          </div>
          <div className="flex gap-3">
            <div className="brand-card min-w-36 p-4"><Users className="h-5 w-5 text-[#6f8a74]" /><p className="mt-2 text-2xl font-bold">{data?.audience || 0}</p><p className="text-xs text-[#59615b]">Opted-in customers</p></div>
            <div className="brand-card min-w-36 p-4"><MessageCircle className="h-5 w-5 text-[#6f8a74]" /><p className="mt-2 text-sm font-bold">{data?.configuration?.sending ? 'Ready' : 'Needs setup'}</p><p className="text-xs text-[#59615b]">Cloud API v{String(data?.configuration?.apiVersion || '').replace('v', '')}</p></div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <section className="brand-panel p-6">
            <h2 className="font-playfair text-2xl font-bold">New campaign</h2>
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-semibold">Campaign type
                <select value={kind} onChange={(event) => { setKind(event.target.value); setPreview(null) }} className="mt-2 w-full rounded-lg border border-[#d9cbb5] bg-white px-4 py-3">
                  <option value="offer">Offer</option>
                  <option value="product_launch">Product launch</option>
                </select>
              </label>
              <label className="text-sm font-semibold">{kind === 'offer' ? 'Offer headline' : 'Product name'}
                <input value={headline} maxLength={120} onChange={(event) => { setHeadline(event.target.value); setPreview(null) }} className="mt-2 w-full rounded-lg border border-[#d9cbb5] px-4 py-3" placeholder={kind === 'offer' ? 'Example: Buy 4 A-Bars, get 1 free' : 'Example: BeGood P-Bar'} required />
              </label>
              <label className="text-sm font-semibold">{kind === 'offer' ? 'Validity or condition' : 'One-line launch detail'}
                <input value={detail} maxLength={160} onChange={(event) => { setDetail(event.target.value); setPreview(null) }} className="mt-2 w-full rounded-lg border border-[#d9cbb5] px-4 py-3" placeholder={kind === 'offer' ? 'Example: Valid through 31 August' : 'Example: Designed for difficult period days'} required />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" disabled={busy || !headline.trim() || !detail.trim()} onClick={() => submit(true)} className="flex-1">Preview audience</Button>
                <Button type="button" disabled={busy || !preview || !data?.configuration?.sending} onClick={() => submit(false)} className="flex-1"><Send className="mr-2 h-4 w-4" />Send campaign</Button>
              </div>
              {message && <p className="rounded-lg bg-[#eef3ea] p-3 text-sm text-[#1f4b3c]">{message}</p>}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="brand-card p-5">
              <h2 className="font-bold">Automation status</h2>
              <Status ok={data?.configuration?.sending}>Order confirmations and status messages</Status>
              <Status ok={data?.configuration?.webhook}>Delivery receipts and STOP opt-outs</Status>
              <Status ok={Boolean(data?.templates?.offer && data?.templates?.productLaunch)}>Campaign templates configured</Status>
            </div>
            <div className="brand-card p-5">
              <h2 className="font-bold">Automatic timing</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#59615b]">
                <li>Immediately — order confirmation</li>
                <li>On admin change — processing, shipped, delivered</li>
                <li>Day 7 — feedback request</li>
                <li>Day 25 — reorder reminder</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Status({ ok, children }) {
  return <p className="mt-3 flex items-start gap-2 text-sm text-[#59615b]"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? 'text-green-600' : 'text-amber-600'}`} />{children}: {ok ? 'ready' : 'not ready'}</p>
}

