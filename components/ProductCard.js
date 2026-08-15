'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Plus, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'
import { RatingSummary } from '@/components/ProductReviews'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product, { size: product.weight, price: product.price }, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (product.comingSoon) {
    return (
      <article className="brand-card overflow-hidden opacity-90">
        <div className="relative aspect-square bg-[#efe8f7]">
          <Image src="/coming-soon-placeholder.svg" alt={product.name} fill className="object-contain p-10" />
        </div>
        <div className="p-5 sm:p-6">
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Coming soon</p>
          <h3 className="mt-3 font-playfair text-2xl font-semibold">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[#675d57]">{product.shortDescription}</p>
        </div>
      </article>
    )
  }

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#2d2019]/10 bg-[#fffaf1] shadow-[0_22px_60px_-50px_rgba(45,32,25,.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-48px_rgba(45,32,25,.65)]">
      <Link href={`/product/${product.id}`} className="relative block aspect-[1.05/1] overflow-hidden bg-[radial-gradient(circle_at_50%_42%,#e4dbea_0%,#f5efe7_62%,#eee7dc_100%)]">
        {discount && (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-[#8a79a8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
            Save {discount}%
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 340px, 420px"
          className="object-contain p-[9%] drop-shadow-[0_22px_18px_rgba(45,32,25,.2)] transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute bottom-4 right-4 rounded-full border border-[#2d2019]/10 bg-[#fffaf1]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1f4b3c] backdrop-blur">
          {product.weight}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-playfair text-2xl font-semibold leading-tight text-[#2d2019] transition-colors group-hover:text-[#1f4b3c]">{product.name}</h3>
            </Link>
            <RatingSummary product={product} className="mt-2" />
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-extrabold text-[#1f4b3c]">₹{product.price}</p>
            {discount && <p className="text-xs text-[#93877f] line-through">₹{product.compareAtPrice}</p>}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#675d57]">{product.shortDescription}</p>

        <div className="mt-auto flex items-center gap-3 pt-5">
          <Link href={`/product/${product.id}`} className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#1f4b3c]/25 px-4 text-sm font-bold text-[#1f4b3c] transition-colors hover:bg-[#dce9e2]">
            View details
          </Link>
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white transition-all ${added ? 'bg-[#8a79a8]' : 'bg-[#1f4b3c] hover:bg-[#173c30]'}`}
          >
            {added ? <><Check className="h-4 w-4" /> Added</> : <><Plus className="h-4 w-4" /> Add</>}
          </button>
        </div>
      </div>
    </article>
  )
}
