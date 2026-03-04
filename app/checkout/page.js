'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import { Lock, Package } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    pincode: ''
  })

  useEffect(() => {
    // Track checkout initiated
    if (cart.length > 0 && typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          value: cartTotal,
          currency: 'INR',
          items: cart.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.variant.price,
            quantity: item.quantity
          }))
        })
      }

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'checkout_initiated',
          params: { amount: cartTotal, itemCount: cart.length },
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Analytics error:', err))
    }
  }, [])

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="font-playfair text-3xl font-bold mb-4">No Items in Cart</h1>
          <p className="text-gray-600 mb-8">Add items to your cart before checking out</p>
          <Link href="/shop">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For now, we'll create the order directly
      // In production, you'd integrate Razorpay here
      const orderData = {
        ...formData,
        products: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.variant.price
        })),
        totalAmount: cartTotal
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success) {
        // Track purchase
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: data.order.orderId,
            value: cartTotal,
            currency: 'INR',
            items: cart.map(item => ({
              item_id: item.id,
              item_name: item.name,
              price: item.variant.price,
              quantity: item.quantity
            }))
          })
        }

        // Send confirmation email (EmailJS integration would go here)
        // For now, just console log
        console.log('Order placed:', data.order.orderId)

        // Clear cart and redirect
        clearCart()
        router.push(`/order/${data.order.orderId}`)
      } else {
        alert('Failed to place order. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-12 text-center">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Lock className="w-5 h-5 text-[#C8A97E]" />
                <h2 className="font-playfair text-2xl font-bold">Shipping Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Shipping Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="House no., Street, Locality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order - ₹${cartTotal}`}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-[#F5F0E8] rounded-xl p-8 sticky top-24">
              <h2 className="font-playfair text-2xl font-bold mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.variant.size} - {item.variant.flavor}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.variant.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-300 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#C8A97E]">₹{cartTotal}</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-300 space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  Secure Payment
                </p>
                <p className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Free Shipping
                </p>
                <p className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  7-Day Return Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}