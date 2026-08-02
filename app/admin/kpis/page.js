'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { Lock, Loader2, ArrowLeft, TrendingUp, Users, RefreshCw, IndianRupee } from 'lucide-react'

/** One headline number with context underneath. */
function Kpi({ label, value, sub, target, good }) {
  return (
    <div className="brand-card p-5">
      <p className="text-xs uppercase tracking-wide text-[#6b736d] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${good === false ? 'text-[#b4472e]' : 'text-[#3f5a46]'}`}>
        {value}
      </p>
      {sub && <p className="text-sm text-[#59615b] mt-1">{sub}</p>}
      {target && <p className="text-xs text-[#8b938b] mt-2">Target: {target}</p>}
    </div>
  )
}

export default function AdminKpisPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [kpis, setKpis] = useState(null)

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
      if (data.success) setAuthenticated(true)
      else setAuthError('Incorrect password')
    } catch {
      setAuthError('Could not sign in. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!authenticated) return
    setLoading(true)
    fetch('/api/admin/kpis')
      .then((r) => r.json())
      .then((d) => { if (d.success) setKpis(d.kpis) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center px-4">
        <div className="brand-panel p-5 sm:p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#6f8a74]" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-2">KPI Dashboard</h1>
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

  const k = kpis

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-1">KPI Dashboard</h1>
            <p className="text-[#59615b]">The numbers that decide whether the business works</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        {loading && !k && (
          <div className="flex items-center gap-2 text-[#59615b]">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading metrics...
          </div>
        )}

        {k && (
          <div className="space-y-10 max-w-6xl">
            {/* The one that matters most for a consumable */}
            <section>
              <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <RefreshCw className="w-5 h-5 text-[#6f8a74]" />
                Retention
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi
                  label="Repeat purchase rate"
                  value={`${k.customers.repeatPurchaseRate}%`}
                  sub={`${k.customers.repeat} of ${k.customers.total} customers bought again`}
                  target="40-55% for consumables"
                  good={k.customers.repeatPurchaseRate >= 40}
                />
                <Kpi
                  label="Median days to 2nd order"
                  value={k.retention.medianSecondPurchaseDays ?? '—'}
                  sub="Lower is better"
                  target="Under 30 days"
                />
                <Kpi
                  label="Repeats within 90 days"
                  value={`${k.retention.repeatWithin90Pct}%`}
                  sub="Of those who returned"
                  target="~76% is typical"
                />
                <Kpi
                  label="Reviews collected"
                  value={k.reviews.collected}
                  sub="Treat as a growth metric"
                  target="20+ before paid ads"
                  good={k.reviews.collected >= 20}
                />
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <TrendingUp className="w-5 h-5 text-[#6f8a74]" />
                Conversion
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi
                  label="Conversion rate"
                  value={`${k.funnel.conversionRate}%`}
                  sub={`${k.funnel.orders} orders from ~${k.funnel.uniqueVisitors} visitors`}
                  target="2-3%"
                  good={k.funnel.conversionRate >= 2}
                />
                <Kpi
                  label="Cart abandonment"
                  value={`${k.funnel.cartAbandonment}%`}
                  sub={`${k.funnel.addToCart} add-to-carts`}
                  target="Beat 70%"
                  good={k.funnel.cartAbandonment <= 70}
                />
                <Kpi label="Page views" value={k.funnel.pageViews} sub="Analytics events" />
                <Kpi label="Add to cart" value={k.funnel.addToCart} />
              </div>
              <p className="text-xs text-[#8b938b] mt-3">
                Visitor counts are approximated from analytics events, so read conversion
                and abandonment as trend lines rather than exact figures.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <IndianRupee className="w-5 h-5 text-[#6f8a74]" />
                Revenue &amp; basket
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi label="Total revenue" value={`₹${k.revenue.total.toLocaleString('en-IN')}`} />
                <Kpi label="Average order value" value={`₹${k.revenue.aov}`} />
                <Kpi
                  label="Orders over ₹249"
                  value={k.orders.above249}
                  sub="First-order free delivery threshold"
                />
                <Kpi
                  label="Orders over ₹600"
                  value={k.orders.above600}
                  sub="Standard free delivery — are bundles working?"
                />
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Users className="w-5 h-5 text-[#6f8a74]" />
                Monthly cohorts
              </h2>
              <p className="text-sm text-[#59615b] mb-3">
                Grouped by the month a customer first ordered. A festival spike cannot
                hide a falling repeat rate here, which is why this beats a single average.
              </p>
              <div className="brand-card p-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="bg-[#dce6d7]/60">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Cohort</th>
                      <th className="text-right px-4 py-3 font-semibold">New customers</th>
                      <th className="text-right px-4 py-3 font-semibold">Returned</th>
                      <th className="text-right px-4 py-3 font-semibold">Repeat rate</th>
                      <th className="text-right px-4 py-3 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {k.cohorts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-[#59615b]">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                    {k.cohorts.map((c) => (
                      <tr key={c.month} className="border-t border-[#e6ddcd]">
                        <td className="px-4 py-3">{c.month}</td>
                        <td className="px-4 py-3 text-right">{c.newCustomers}</td>
                        <td className="px-4 py-3 text-right">{c.returned}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${c.repeatRate >= 40 ? 'text-[#3f5a46]' : 'text-[#b4472e]'}`}>
                          {c.repeatRate}%
                        </td>
                        <td className="px-4 py-3 text-right">₹{c.revenue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
