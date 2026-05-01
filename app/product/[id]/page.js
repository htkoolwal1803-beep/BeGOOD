'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getProductById } from '@/lib/products'
import { useCart } from '@/lib/CartContext'
import Button from '@/components/Button'
import { Star, Check, Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import ProductFeedbackSection from '@/components/ProductFeedbackSection'

export default function ProductPage() {
  const params = useParams()
  const product = getProductById(params.id)
  const { addToCart } = useCart()
  
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
            price: product.price
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
  }, [product])

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
    addToCart(product, { size: product.weight, price: product.price }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart(product, { size: product.weight, price: product.price }, quantity)
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
              className="object-contain p-4"
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


            {/* Price and Weight */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <div className="text-4xl font-bold text-[#C8A97E]">₹{product.price}</div>
                {product.weight && (
                  <span className="text-xl text-gray-600">({product.weight})</span>
                )}
              </div>
            </div>

            {/* Key Aspects */}
            {product.keyAspects && (
              <div className="bg-[#F5F0E8] p-6 rounded-xl">
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.keyAspects.map((aspect, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-[#C8A97E] mr-2 flex-shrink-0" />
                      {aspect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

            {/* No Return Policy Notice */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 text-center">
                <strong>No Return Policy:</strong> All sales are final. Please review before purchase. 
                <a href="/terms" className="underline ml-1">Learn more</a>
              </p>
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

          {/* Key Ingredients */}
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

          {/* Full Ingredients List */}
          {product.ingredientsList && (
            <section className="bg-white border border-gray-200 p-6 rounded-xl">
              <h2 className="font-playfair text-2xl font-bold mb-4">Full Ingredients List</h2>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">Ingredients: </span>
                {product.ingredientsList}
              </p>
            </section>
          )}

          {/* How It Works */}
          <section>
            <h2 className="font-playfair text-3xl font-bold mb-6">How It Works</h2>
            <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {product.howItWorks}
            </div>
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



          {/* Customer Feedback (admin-defined questionnaire answers) */}
          <ProductFeedbackSection productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  )
}
