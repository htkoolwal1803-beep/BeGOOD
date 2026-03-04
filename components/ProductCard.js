'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'
import { ShoppingCart } from 'lucide-react'
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

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-playfair text-xl font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.shortDescription}</p>

          {/* Weight */}
          {product.weight && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">{product.weight}</span>
            </div>
          )}

          {/* Price & Add to Cart */}
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
        </div>
      </div>
    </Link>
  )
}