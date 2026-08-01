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
      <div className="brand-page min-h-screen flex items-center justify-center py-20">
        <div className="brand-panel max-w-md p-10 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="font-playfair text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-[#59615b] mb-8">Start shopping to add items to your cart</p>
          <Link href="/shop">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="brand-page min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-12 text-[#1f2229]">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="brand-card p-4 flex gap-3 sm:p-6 sm:gap-6">
                {/* Product Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#f4ecdd] rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                {/* min-w-0 is required: a flex child defaults to min-width:auto,
                    so without it this column refuses to shrink below its
                    content and pushes the whole row past the screen edge. */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 break-words">{item.name}</h3>
                  <p className="text-[#59615b] text-xs sm:text-sm mb-3 break-words">
                    {item.variant.size} {item.variant.flavor && `- ${item.variant.flavor}`}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border-2 border-[#d9cbb5] hover:border-[#6f8a74] transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border-2 border-[#d9cbb5] hover:border-[#6f8a74] transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right whitespace-nowrap">
                      <p className="text-lg sm:text-xl font-bold text-[#6f8a74]">
                        ₹{item.variant.price * item.quantity}
                      </p>
                      <p className="text-xs text-[#6b736d]">₹{item.variant.price} each</p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(index)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-[#8b938b] hover:text-red-500 transition-colors self-start shrink-0 p-2 -m-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="brand-panel p-6 sticky top-24">
              <h2 className="font-playfair text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Delivery</span>
                  <span className="font-semibold text-[#6b736d]">Calculated at checkout</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-800">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Free delivery within 5 km · Self-pickup available
                  </p>
                </div>
                <div className="border-t border-[#d9cbb5] pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#6f8a74]">₹{cartTotal}</span>
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
              <div className="mt-6 pt-6 border-t border-[#d9cbb5] space-y-2 text-sm text-[#59615b]">
                <p className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Secure Checkout
                </p>
                <p className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  Delivery calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
