'use client'

import ProductCard from '@/components/ProductCard'
import SubscriptionCard from '@/components/SubscriptionCard'
import { products } from '@/lib/products'
import { useEffect } from 'react'

export default function ShopPage() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Shop',
        page_location: window.location.href,
        page_path: '/shop'
      })
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        params: { page: 'shop' },
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Analytics error:', err))
  }, [])

  // Show all products including coming soon
  const availableProducts = products.filter(p => !p.upcoming || p.comingSoon)

  return (
    <div className="brand-page min-h-screen py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="brand-pill mb-5">Functional wellness, perfectly crafted</span>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 text-[#1f2229]">Shop BeGood</h1>
          <p className="text-xl text-[#59615b] max-w-2xl mx-auto">
            Discover our science-backed functional chocolates designed to help you balance your emotions
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {availableProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {/* Subscription Card */}
          <SubscriptionCard />
        </div>

        {/* Info Section */}
        <div className="brand-panel mt-20 p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold mb-4">Why BeGood?</h2>
          <p className="text-[#464c49] text-lg leading-relaxed">
            Every BeGood product is crafted with science-backed ingredients to help you manage your emotions naturally. 
            No therapy sessions, no complicated routines—just delicious, convenient foods that work when you need them most.
          </p>
        </div>
      </div>
    </div>
  )
}
