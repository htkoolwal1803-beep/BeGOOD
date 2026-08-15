'use client'

import { useEffect } from 'react'
import { ArrowRight, Check, FlaskConical, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import FirstOrderBanner from '@/components/FirstOrderBanner'
import ProductCard from '@/components/ProductCard'
import { products } from '@/lib/products'

export default function ShopPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'page_view', { page_title: 'Shop', page_location: window.location.href, page_path: '/shop' })
    }
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_view', params: { page: 'shop' }, timestamp: new Date().toISOString() })
    }).catch(() => {})
  }, [])

  const availableProducts = products.filter((product) => !product.upcoming || product.comingSoon)

  return (
    <div className="brand-page min-h-screen pb-20">
      <section className="relative overflow-hidden border-b border-[#e4d8c7] py-16 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#d8c9e8]/45 blur-3xl" />
        <div className="brand-container relative">
          <FirstOrderBanner className="mx-auto mb-9 max-w-3xl" />
          <div className="mx-auto max-w-4xl text-center">
            <span className="brand-pill"><Sparkles className="h-4 w-4" /> Functional chocolate, thoughtfully formulated</span>
            <h1 className="mt-6 font-playfair text-5xl font-bold leading-tight text-[#2d2019] sm:text-6xl lg:text-7xl">Choose your calm-focus ritual.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#59615b] sm:text-xl">Start with one bar, keep two ready, or stock up for the moments already on your calendar.</p>
          </div>
          <div className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-3 text-sm font-semibold text-[#31483d]">
            {['140 mg L-Theanine', 'Magnesium glycinate', 'Chicory root', 'No added sugar'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#c7d7c7] bg-white/70 px-4 py-2"><Check className="h-4 w-4 text-[#1f4b3c]" /> {item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-container py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8a79a8]">The collection</p><h2 className="mt-2 font-playfair text-3xl font-bold text-[#2d2019] sm:text-4xl">Find the format that fits.</h2></div>
          <p className="max-w-md text-sm leading-6 text-[#6b736d]">All A-Bar formats use the same core formula. Bundle pages show the per-bar ingredient quantities clearly.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="brand-container pb-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#d6c9b6] bg-[#172f28] text-[#fffaf1] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">Why BeGood</span>
            <h2 className="mt-4 font-playfair text-4xl font-bold">Built for the moment before the moment.</h2>
            <p className="mt-5 text-lg leading-8 text-[#cddbd4]">Preparation is not only what you know—it is also the state you bring with you. BeGood makes that last pre-performance ritual simple.</p>
            <a href="/how-it-works" className="mt-7 inline-flex items-center gap-2 font-bold text-white">Explore how it works <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="grid border-t border-white/10 sm:grid-cols-3 lg:border-l lg:border-t-0">
            {[
              [FlaskConical, 'Transparent formula', 'Ingredient quantities shown clearly on the product page.'],
              [Leaf, 'Food-first ritual', 'A familiar chocolate format instead of pills or powders.'],
              [ShieldCheck, 'Secure purchase', 'Razorpay checkout and clear delivery information.']
            ].map(([Icon, title, text]) => (
              <div key={title} className="border-b border-white/10 p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:flex lg:flex-col lg:justify-end">
                <Icon className="h-7 w-7 text-[#bfaed7]" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#b9cbc2]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
