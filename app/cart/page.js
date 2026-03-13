'use client'

import { useCart } from '@/lib/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import { Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react'
import { useEffect } from 'react'
import { calculateShipping, calculateOrderTotal, SHIPPING_CONFIG } from '@/lib/constants'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()

  // Calculate shipping and order total
  const shippingFee = calculateShipping(cartTotal)
  const orderTotal = calculateOrderTotal(cartTotal)
  const amountToFreeShipping = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cartTotal

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Cart',
        page_location: window.location.href,
        page_path: '/cart'
      })
    }
  }, [])

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="font-playfair text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link href="/shop">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-12">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 flex gap-6">
                {/* Product Image */}
                <div className="relative w-24 h-24 bg-[#F5F0E8] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {item.variant.size} {item.variant.flavor && `- ${item.variant.flavor}`}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-[#C8A97E] transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-[#C8A97E] transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#C8A97E]">
                        ₹{item.variant.price * item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">₹{item.variant.price} each</p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F0E8] rounded-xl p-6 sticky top-24">
              <h2 className="font-playfair text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold">₹{shippingFee}</span>
                  )}
                </div>
                {amountToFreeShipping > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="text-amber-800">
                      <Truck className="w-4 h-4 inline mr-1" />
                      Add ₹{amountToFreeShipping} more for <strong>FREE shipping!</strong>
                    </p>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#C8A97E]">₹{orderTotal}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/shop">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-300 space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Secure Checkout
                </p>
                <p className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  {shippingFee === 0 ? 'Free Shipping' : `Free Shipping above ₹${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
