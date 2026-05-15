'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import { Package, Truck, Shield, Check, Minus, Plus, Calendar, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SUBSCRIPTION_CONFIG } from '@/lib/constants'

export default function SubscribePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  
  const [barsPerMonth, setBarsPerMonth] = useState(SUBSCRIPTION_CONFIG.MIN_BARS_PER_MONTH)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('select') // 'select' | 'checkout'
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  })
  
  // Address state
  const [formData, setFormData] = useState({
    address: '',
    pincode: '',
    city: '',
    state: ''
  })

  const totalBars = barsPerMonth * SUBSCRIPTION_CONFIG.DURATION_MONTHS
  const totalPrice = totalBars * SUBSCRIPTION_CONFIG.PRICE_PER_BAR
  const regularPrice = totalBars * 125 // Regular price per bar
  const savings = regularPrice - totalPrice

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || ''
      })
      if (userProfile.addresses && userProfile.addresses.length > 0) {
        const addr = userProfile.addresses[0]
        setFormData({
          address: addr.fullAddress || '',
          pincode: addr.pincode || '',
          city: addr.city || '',
          state: addr.state || ''
        })
      }
    }
  }, [userProfile])

  const handleQuantityChange = (increment) => {
    const newValue = barsPerMonth + increment
    if (newValue >= SUBSCRIPTION_CONFIG.MIN_BARS_PER_MONTH && newValue <= 20) {
      setBarsPerMonth(newValue)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/checkout')
      return
    }

    if (!profileData.name || !profileData.email || !formData.address || !formData.pincode) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway is loading. Please try again.')
        setLoading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalPrice * 100,
        currency: 'INR',
        name: 'BeGood',
        description: `A-Bar Subscription (${barsPerMonth} bars/month for 3 months)`,
        image: '/a-bar-packaging.png',
        prefill: {
          name: profileData.name,
          email: profileData.email,
          contact: user?.phoneNumber?.replace('+91', '') || ''
        },
        theme: {
          color: '#6f8a74'
        },
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id

          try {
            const subscriptionResponse = await fetch('/api/subscriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: profileData.name,
                email: profileData.email,
                phone: user?.phoneNumber,
                address: formData.address,
                pincode: formData.pincode,
                city: formData.city,
                state: formData.state,
                barsPerMonth: barsPerMonth,
                paymentId: paymentId,
                userId: user?.uid
              })
            })

            const result = await subscriptionResponse.json()

            if (result.success) {
              router.push(`/order/${result.order.orderId}?type=subscription`)
            } else {
              alert('Failed to create subscription. Please contact support with payment ID: ' + paymentId)
            }
          } catch (error) {
            alert('Error processing subscription. Payment ID: ' + paymentId)
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
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initialization failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Subscribe & Save</h1>
            <p className="text-xl text-[#59615b]">
              Get A-Bar delivered monthly at just <span className="text-[#6f8a74] font-bold">₹100/bar</span> instead of ₹125
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Plan Selection */}
            <div className="brand-panel p-8">
              <h2 className="font-playfair text-2xl font-bold mb-6">Choose Your Plan</h2>

              {/* Product Image */}
              <div className="relative w-full h-48 mb-6 bg-[#f4ecdd] rounded-xl overflow-hidden">
                <Image
                  src="/a-bar-packaging.png"
                  alt="A-Bar"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Bars per Month (Min: {SUBSCRIPTION_CONFIG.MIN_BARS_PER_MONTH})</label>
                <div className="flex items-center justify-center gap-4 bg-[#dce6d7] rounded-lg p-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={barsPerMonth <= SUBSCRIPTION_CONFIG.MIN_BARS_PER_MONTH}
                    className="w-10 h-10 rounded-full bg-[#fbf7ed] shadow flex items-center justify-center hover:bg-[#eef3ea] disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-3xl font-bold w-16 text-center">{barsPerMonth}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={barsPerMonth >= 20}
                    className="w-10 h-10 rounded-full bg-[#fbf7ed] shadow flex items-center justify-center hover:bg-[#eef3ea] disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-[#dce6d7]/70 border border-[#d9cbb5] rounded-2xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Duration</span>
                  <span className="font-semibold">3 Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Bars per Month</span>
                  <span className="font-semibold">{barsPerMonth} bars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Total Bars</span>
                  <span className="font-semibold">{totalBars} bars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59615b]">Price per Bar</span>
                  <span className="font-semibold text-[#6f8a74]">₹{SUBSCRIPTION_CONFIG.PRICE_PER_BAR}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-[#59615b]">Regular Price</span>
                  <span className="line-through text-[#8b938b]">₹{regularPrice}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span className="font-bold">₹{savings}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#6f8a74]">₹{totalPrice}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-[#59615b]">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>20% savings on every bar</span>
                </div>
                <div className="flex items-center text-sm text-[#59615b]">
                  <Truck className="w-4 h-4 text-green-500 mr-2" />
                  <span>FREE delivery on all shipments</span>
                </div>
                <div className="flex items-center text-sm text-[#59615b]">
                  <Calendar className="w-4 h-4 text-green-500 mr-2" />
                  <span>Monthly delivery for 3 months</span>
                </div>
                <div className="flex items-center text-sm text-[#59615b]">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  <span>One-time payment, no hidden charges</span>
                </div>
              </div>
            </div>

            {/* Right - Checkout Form */}
            <div className="brand-panel p-8">
              <h2 className="font-playfair text-2xl font-bold mb-6">Delivery Details</h2>

              {!user ? (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-[#8b938b] mx-auto mb-4" />
                  <p className="text-[#59615b] mb-4">Please login to subscribe</p>
                  <Link href="/checkout">
                    <Button>Login to Continue</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Delivery Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                      placeholder="Full address with house/flat number, street, landmark"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                        placeholder="Pincode"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                      placeholder="State"
                    />
                  </div>

                  {/* No Return Policy Notice */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">
                      <strong>Note:</strong> Subscriptions are non-cancellable and non-refundable. 
                      By subscribing, you agree to receive {barsPerMonth} bars monthly for 3 months.
                    </p>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : `Subscribe & Pay ₹${totalPrice}`}
                  </Button>

                  <p className="text-xs text-[#6b736d] text-center">
                    Secure payment via Razorpay. By subscribing, you agree to our Terms & Conditions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
