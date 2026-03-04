'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getProductById } from '@/lib/products'
import { useCart } from '@/lib/CartContext'
import Button from '@/components/Button'
import { Star, Check, Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'

export default function ProductPage() {
  const params = useParams()
  const product = getProductById(params.id)
  const { addToCart } = useCart()
  
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0] || {})
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    // Track product view
    if (product && typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'view_item', {
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: selectedVariant.price
          }]
        })
      }

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'product_view',
          params: { 
            productId: product.id,
            productName: product.name
          },
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Analytics error:', err))
    }
  }, [product, selectedVariant])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity)
    window.location.href = '/checkout'
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Product Main Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="relative aspect-square bg-[#F5F0E8] rounded-2xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-[#C8A97E] font-semibold mb-2">{product.category}</p>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-[#C8A97E] text-[#C8A97E]" />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews?.length || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-[#C8A97E]">₹{selectedVariant.price}</div>

            {/* Variant Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Size & Flavor</label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedVariant === variant
                          ? 'border-[#C8A97E] bg-[#C8A97E]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{variant.size}</div>
                      <div className="text-sm text-gray-600">{variant.flavor}</div>
                      <div className="text-[#C8A97E] font-bold mt-1">₹{variant.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#C8A97E] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#C8A97E] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full"
              >
                Buy Now
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-[#C8A97E]" />
                <p className="text-xs text-gray-600">Premium Quality</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[#C8A97E]" />
                <p className="text-xs text-gray-600">Lab Tested</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[#C8A97E]" />
                <p className="text-xs text-gray-600">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Description */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">About This Product</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{product.fullDescription}</p>
          </section>

          {/* Ingredients */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">Key Ingredients</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.ingredients.map((ingredient, idx) => (
                <div key={idx} className="bg-[#F5F0E8] p-6 rounded-xl">
                  <h3 className="font-semibold text-xl mb-2">{ingredient.name}</h3>
                  <p className="text-gray-700">{ingredient.benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">How It Works</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{product.howItWorks}</p>
          </section>

          {/* When To Use */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">When To Use</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.occasions.map((occasion, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 bg-[#F5F0E8] rounded-lg">
                  <Check className="w-5 h-5 text-[#C8A97E] flex-shrink-0" />
                  <span className="text-gray-700">{occasion}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Usage */}
          <section className="bg-[#C8A97E]/10 p-8 rounded-2xl">
            <h2 className="font-playfair text-2xl font-bold mb-4">Usage Instructions</h2>
            <p className="text-gray-700 text-lg">{product.usage}</p>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#C8A97E] text-[#C8A97E]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}