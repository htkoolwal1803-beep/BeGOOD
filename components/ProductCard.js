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
      <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${product.comingSoon ? 'opacity-90' : ''}`}>
        {/* Coming Soon Badge */}
        {product.comingSoon && (
          <div className="absolute top-4 right-4 z-10 bg-[#C8A97E] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Coming Soon
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
          <Image
            src={product.comingSoon ? '/coming-soon-placeholder.svg' : product.image}
            alt={product.name}
            fill
            className={`${product.comingSoon ? 'object-contain p-8' : 'object-contain p-4'} ${!product.comingSoon && 'group-hover:scale-105'} transition-transform duration-300`}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-playfair text-xl font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.shortDescription}</p>

          {/* Weight */}
          {product.weight && !product.comingSoon && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">{product.weight}</span>
            </div>
          )}

          {/* Price & Action */}
          {product.comingSoon ? (
            <div className="flex items-center justify-center">
              <span className="text-lg font-semibold text-[#C8A97E] flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notify Me on Homepage
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#C8A97E]">₹{product.price}</span>
              <button
                onClick={handleAddToCart}
                className="bg-[#C8A97E] text-white px-4 py-2 rounded-lg hover:bg-[#B8956E] transition-colors flex items-center space-x-2"
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