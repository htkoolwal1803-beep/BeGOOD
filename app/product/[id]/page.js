'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Brain, Check, ChevronRight, Leaf, Minus, Package, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import Button from '@/components/Button'
import ProductReviews, { RatingSummary } from '@/components/ProductReviews'
import { useCart } from '@/lib/CartContext'
import { SHIPPING_CONFIG } from '@/lib/constants'
import { getProductById } from '@/lib/products'

const ingredientIcons = [Brain, Sparkles, Leaf]

export default function ProductPage() {
  const params = useParams()
  const product = getProductById(params.id)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product || typeof window === 'undefined') return
    window.gtag?.('event', 'view_item', {
      items: [{ item_id: product.id, item_name: product.name, price: product.price }]
    })
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'product_view',
        params: { productId: product.id, productName: product.name },
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})
  }, [product])

  if (!product) {
    return (
      <div className="brand-page flex min-h-[70vh] items-center justify-center px-4 py-20">
        <div className="brand-panel max-w-md p-8 text-center">
          <h1 className="font-playfair text-3xl font-bold">Product not found</h1>
          <p className="mt-3 text-[#59615b]">This product may have moved or is no longer available.</p>
          <Link href="/shop" className="mt-7 inline-block"><Button>Back to shop</Button></Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, { size: product.weight, price: product.price }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart(product, { size: product.weight, price: product.price }, quantity)
    window.location.href = '/checkout'
  }

  const isAbar = product.id.startsWith('begood-abar')

  return (
    <div className="brand-page min-h-screen pb-20">
      <div className="brand-container pt-6 sm:pt-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6b736d]" aria-label="Breadcrumb">
          <Link href="/shop" className="transition-colors hover:text-[#1f4b3c]">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate text-[#2d2019]">{product.name}</span>
        </nav>

        <section className="brand-panel grid overflow-hidden lg:grid-cols-[1.03fr_0.97fr]">
          <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_50%_35%,#fffaf1_0%,#eee3ce_72%)] sm:min-h-[520px] lg:min-h-[650px]">
            <Image src={product.image} alt={product.name} fill priority unoptimized={typeof product.image === 'string' && product.image.startsWith('data:')} className="object-contain p-7 sm:p-12" />
            {isAbar && (
              <div className="absolute left-5 top-5 rounded-full border border-[#d8c8b0] bg-[#fffaf1]/90 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#1f4b3c] shadow-sm backdrop-blur">
                Functional chocolate · 40 g
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8a79a8]">{product.category}</p>
            <h1 className="mt-3 font-playfair text-4xl font-bold leading-tight text-[#2d2019] sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-[#59615b]">{product.shortDescription}</p>
            <RatingSummary product={product} className="mt-5" />

            <div className="mt-7 flex flex-wrap items-end gap-x-3 gap-y-2 border-y border-[#e3d7c5] py-6">
              <span className="text-4xl font-extrabold text-[#1f4b3c]">₹{product.price}</span>
              {product.compareAtPrice > product.price && <span className="pb-1 text-xl text-[#9a938a] line-through">₹{product.compareAtPrice}</span>}
              {product.weight && <span className="pb-1 text-sm font-semibold text-[#6b736d]">{product.weight}</span>}
            </div>

            {product.keyAspects?.length > 0 && (
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {product.keyAspects.slice(0, 6).map((aspect) => (
                  <div key={aspect} className="flex items-start gap-2 rounded-xl bg-[#eef3ea] px-3 py-3 text-sm font-medium text-[#31483d]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1f4b3c]" /> {aspect}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pt-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-sm font-bold">Quantity</span>
                <div className="flex items-center rounded-full border border-[#d8c8b0] bg-white p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#eef3ea]"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-bold" aria-live="polite">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#eef3ea]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={handleBuyNow} size="lg" className="w-full">Buy now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                <Button onClick={handleAddToCart} variant="outline" size="lg" className="w-full">{added ? 'Added to cart' : 'Add to cart'}</Button>
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-[#6b736d]">
                {product.price >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
                  ? 'Free delivery on this item.'
                  : `Delivery ₹${SHIPPING_CONFIG.SHIPPING_FEE} · Free above ₹${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}.`}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            [Package, 'Carefully packed', 'Protected for the journey'],
            [ShieldCheck, 'Secure checkout', 'Razorpay encrypted payment'],
            [Truck, 'Delivery clarity', 'Charges shown before payment']
          ].map(([Icon, title, text]) => (
            <div key={title} className="brand-card flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dce6d7]"><Icon className="h-5 w-5 text-[#1f4b3c]" /></span>
              <div><p className="font-bold text-[#2d2019]">{title}</p><p className="text-sm text-[#6b736d]">{text}</p></div>
            </div>
          ))}
        </section>

        <div className="mx-auto mt-20 max-w-6xl space-y-20">
          <section className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="brand-pill">Formula focus</span>
              <h2 className="mt-5 font-playfair text-4xl font-bold text-[#2d2019] sm:text-5xl">Three ingredients at the centre.</h2>
              <p className="mt-5 text-lg leading-8 text-[#59615b]">A focused formula explained in plain language—what is in the bar and why it is there.</p>
              <Link href="/how-it-works" className="mt-6 inline-flex items-center gap-2 font-bold text-[#1f4b3c]">See the full journey <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {product.ingredients?.map((ingredient, index) => {
                const Icon = ingredientIcons[index % ingredientIcons.length]
                return (
                  <article key={ingredient.name} className="brand-card p-5 sm:p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7def1]"><Icon className="h-6 w-6 text-[#735f94]" /></span>
                    <h3 className="mt-5 text-xl font-bold text-[#2d2019]">{ingredient.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#59615b]">{ingredient.benefit}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {product.fullIngredients?.length > 0 ? (
            <section className="brand-panel overflow-hidden">
              <div className="border-b border-[#e3d7c5] p-6 sm:p-8">
                <span className="brand-pill">Complete formula</span>
                <h2 className="mt-4 font-playfair text-3xl font-bold text-[#2d2019] sm:text-4xl">Every ingredient, clearly listed.</h2>
                <p className="mt-3 text-[#59615b]">The complete A-Bar ingredient list, presented clearly without proprietary quantities.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                {product.fullIngredients.map((ingredient, index) => (
                  <div key={ingredient.name} className="flex min-h-[92px] items-start justify-between gap-4 border-b border-[#e9dfcf] p-5 sm:border-r">
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-xs font-extrabold text-[#9a8a73]">{String(index + 1).padStart(2, '0')}</span>
                      <div><p className="font-semibold leading-5 text-[#2d2019]">{ingredient.name}</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="px-6 py-4 text-xs leading-5 text-[#6b736d] sm:px-8">Contains walnuts, almonds and soy. Contains honey and is not vegan. Check the pack before use if you have food allergies or sensitivities.</p>
            </section>
          ) : product.ingredientsList && (
            <section className="brand-card p-6 sm:p-8"><h2 className="font-playfair text-3xl font-bold">Full ingredients</h2><p className="mt-4 leading-7 text-[#59615b]">{product.ingredientsList}</p></section>
          )}

          {product.howItWorks && (
            <section className="grid gap-6 rounded-[2rem] bg-[#172f28] p-6 text-[#fffaf1] sm:p-10 lg:grid-cols-[0.75fr_1.25fr] lg:p-12">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">How it works</p><h2 className="mt-4 font-playfair text-4xl font-bold">A simple ritual, not a complicated routine.</h2></div>
              <p className="text-lg leading-8 text-[#dce6e1]">{product.howItWorks}</p>
            </section>
          )}

          {product.occasions?.length > 0 && (
            <section>
              <div className="text-center"><span className="brand-pill">Made for real moments</span><h2 className="mt-5 font-playfair text-4xl font-bold">When to reach for A-Bar.</h2></div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {product.occasions.map((occasion) => <div key={occasion} className="brand-card flex items-center gap-3 p-5"><Check className="h-5 w-5 shrink-0 text-[#1f4b3c]" /><span className="font-semibold text-[#3d403e]">{occasion}</span></div>)}
              </div>
            </section>
          )}

          {product.usage && <section className="rounded-[1.75rem] border border-[#c9badc] bg-[#f1eaf7] p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#735f94]">How to enjoy it</p><p className="mt-3 text-lg leading-8 text-[#493f52]">{product.usage}</p></section>}

          <ProductReviews product={product} />
        </div>
      </div>
    </div>
  )
}
