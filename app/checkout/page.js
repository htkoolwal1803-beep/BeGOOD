'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import { Lock, Package, Truck } from 'lucide-react'
import Link from 'next/link'
import emailjs from '@emailjs/browser'
import { calculateShipping, calculateOrderTotal, SHIPPING_CONFIG } from '@/lib/constants'

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

  // Calculate shipping and order total
  const shippingFee = calculateShipping(cartTotal)
  const orderTotal = calculateOrderTotal(cartTotal)
  const amountToFreeShipping = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cartTotal

  useEffect(() => {
    // Initialize EmailJS
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
    }

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

  const sendConfirmationEmail = async (orderDetails) => {
    try {
      const orderItemsList = orderDetails.products.map(p => 
        `${p.productName} (${p.variant.size}) x ${p.quantity} = ₹${p.price * p.quantity}`
      ).join('\n')

      const templateParams = {
        customer_name: orderDetails.customerName,
        order_id: orderDetails.orderId,
        total_amount: orderDetails.totalAmount,
        order_details: orderItemsList,
        address: orderDetails.address,
        pincode: orderDetails.pincode,
        to_email: orderDetails.email
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams
      )

      console.log('✅ Confirmation email sent successfully')
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      // Don't block the order if email fails
    }
  }

  const handleRazorpayPayment = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.customerName || !formData.email || !formData.phone || !formData.address || !formData.pincode) {
      alert('Please fill all fields')
      return
    }

    if (formData.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return
    }

    if (formData.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    setLoading(true)

    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway is loading. Please try again in a moment.')
        setLoading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderTotal * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'BeGood',
        description: 'Functional Chocolate Order',
        image: 'https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/1q24108e_WhatsApp_Image_2025-12-21_at_2.03.26_PM-removebg-preview.png',
        prefill: {
          name: formData.customerName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#C8A97E'
        },
        handler: async function (response) {
          // Payment successful
          const paymentId = response.razorpay_payment_id

          // Create order in database
          const orderData = {
            ...formData,
            products: cart.map(item => ({
              productId: item.id,
              productName: item.name,
              variant: item.variant,
              quantity: item.quantity,
              price: item.variant.price
            })),
            subtotal: cartTotal,
            shippingFee: shippingFee,
            totalAmount: orderTotal,
            paymentId: paymentId
          }

          try {
            const orderResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
            })

            const orderResult = await orderResponse.json()

            if (orderResult.success) {
              // Track purchase
              if (window.gtag) {
                window.gtag('event', 'purchase', {
                  transaction_id: orderResult.order.orderId,
                  value: orderTotal,
                  currency: 'INR',
                  shipping: shippingFee,
                  items: cart.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.variant.price,
                    quantity: item.quantity
                  }))
                })
              }

              // Send confirmation email
              await sendConfirmationEmail(orderResult.order)

              // Clear cart and redirect
              clearCart()
              router.push(`/order/${orderResult.order.orderId}`)
            } else {
              alert('Failed to create order. Please contact support with payment ID: ' + paymentId)
            }
          } catch (error) {
            console.error('Order creation error:', error)
            alert('Order processing error. Your payment was successful. Payment ID: ' + paymentId + '. Please contact support.')
          }

          setLoading(false)
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description)
        setLoading(false)
      })
      razorpay.open()

    } catch (error) {
      console.error('Razorpay error:', error)
      alert('Payment initialization failed. Please try again.')
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

              <form onSubmit={handleRazorpayPayment} className="space-y-4">
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
                    maxLength="10"
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
                    maxLength="6"
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
                    {loading ? 'Processing...' : `Pay ₹${orderTotal} with Razorpay`}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secure payment powered by Razorpay. By placing this order, you agree to our Terms & Conditions
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
                        {item.variant.size}
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

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-300 space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  Secure Payment via Razorpay
                </p>
                <p className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  {shippingFee === 0 ? 'Free Shipping' : `Free Shipping on orders above ₹${SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}`}
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
