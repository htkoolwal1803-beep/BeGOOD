'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'
import { ShoppingCart, Bell } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    // For single SKU products (no variants)
    addToCart(product, { size: product.weight, price: product.price }, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // If product is coming soon, don't make it clickable
  const CardWrapper = product.comingSoon ? 'div' : Link

  return (
    <CardWrapper href={product.comingSoon ? undefined : `/product/${product.id}`}>
      <div className={`group brand-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-38px_rgba(31,34,41,0.6)] ${product.comingSoon ? 'opacity-90' : ''}`}>
        {/* Discount Badge */}
        {!product.comingSoon && product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-4 left-4 z-10 bg-[#b4472e] text-[#fbf7ed] px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
          </div>
        )}

        {/* Coming Soon Badge */}
        {product.comingSoon && (
          <div className="absolute top-4 right-4 z-10 bg-[#6f8a74] text-[#fbf7ed] px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Coming Soon
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#f4ecdd]">
          <Image
            src={product.comingSoon ? '/coming-soon-placeholder.svg' : product.image}
            alt={product.name}
            fill
            className={`${product.comingSoon ? 'object-contain p-8' : 'object-contain p-4'} ${!product.comingSoon && 'group-hover:scale-105'} transition-transform duration-300`}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-playfair text-2xl font-semibold mb-2 text-[#1f2229]">{product.name}</h3>
          <p className="text-[#59615b] text-sm mb-4 line-clamp-2">{product.shortDescription}</p>

          {/* Weight */}
          {product.weight && !product.comingSoon && (
            <div className="mb-4">
              <span className="text-sm text-[#6b736d]">{product.weight}</span>
            </div>
          )}

          {/* Price & Action */}
          {product.comingSoon ? (
            <div className="flex items-center justify-center">
              <span className="text-lg font-semibold text-[#536a58] flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notify Me on Homepage
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#536a58]">₹{product.price}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-[#9a938a] line-through">₹{product.compareAtPrice}</span>
                )}
              </span>
              <button
                onClick={handleAddToCart}
                className="bg-[#6f8a74] text-[#fbf7ed] px-4 py-2 rounded-full hover:bg-[#536a58] transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">{added ? 'Added!' : 'Add'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  )
}
