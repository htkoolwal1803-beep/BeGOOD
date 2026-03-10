'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Image from 'next/image'
import { Lock, Package, Truck, Phone, Shield, User, MapPin, Check, Loader2, Tag, X } from 'lucide-react'
import Link from 'next/link'
import emailjs from '@emailjs/browser'
import { calculateShipping, calculateOrderTotal, SHIPPING_CONFIG } from '@/lib/constants'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { user, userProfile, sendOTP, verifyOTP, loading: authLoading, updateUserProfile, refreshProfile } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('loading') // 'loading' | 'auth' | 'otp' | 'profile' | 'address' | 'payment'
  const [initialized, setInitialized] = useState(false)
  
  // Auth state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [authError, setAuthError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: ''
  })
  
  // Address state
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    pincode: '',
    city: '',
    state: ''
  })
  
  // Pincode validation state
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeError, setPincodeError] = useState('')
  const [pincodeValidated, setPincodeValidated] = useState(false)
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  // Calculate shipping and order total with coupon discount
  const shippingFee = calculateShipping(cartTotal)
  const couponDiscount = appliedCoupon?.discountAmount || 0
  const orderTotal = calculateOrderTotal(cartTotal) - couponDiscount
  const amountToFreeShipping = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cartTotal

  // Initialize and track
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
    }

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

  // Pincode validation function
  const validatePincode = async (pincode) => {
    if (pincode.length !== 6) {
      setPincodeError('')
      setPincodeValidated(false)
      setFormData(prev => ({ ...prev, city: '', state: '' }))
      return
    }
    
    setPincodeLoading(true)
    setPincodeError('')
    
    try {
      const response = await fetch(`/api/pincode/${pincode}`)
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          city: data.city,
          state: data.state
        }))
        setPincodeValidated(true)
        setPincodeError('')
      } else {
        setPincodeError(data.message || 'Invalid pincode')
        setPincodeValidated(false)
        setFormData(prev => ({ ...prev, city: '', state: '' }))
      }
    } catch (error) {
      setPincodeError('Unable to validate pincode')
      setPincodeValidated(false)
    }
    
    setPincodeLoading(false)
  }

  // Handle pincode change with debounce
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setFormData(prev => ({ ...prev, pincode: value }))
    setPincodeValidated(false)
    
    if (value.length === 6) {
      validatePincode(value)
    } else {
      setPincodeError('')
      setFormData(prev => ({ ...prev, city: '', state: '' }))
    }
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    
    setCouponLoading(true)
    setCouponError('')
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          userId: user?.uid,
          userPhone: user?.phoneNumber || `+91${phone}`,
          orderTotal: cartTotal
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAppliedCoupon(data.coupon)
        setCouponError('')
      } else {
        setCouponError(data.message || 'Invalid coupon')
        setAppliedCoupon(null)
      }
    } catch (error) {
      setCouponError('Unable to validate coupon')
      setAppliedCoupon(null)
    }
    
    setCouponLoading(false)
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  // Check if user is already logged in
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      setStep('loading')
      return
    }
    
    // Only run initialization once
    if (initialized) return
    setInitialized(true)
    
    if (user && userProfile) {
      // User is logged in, set their data
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age?.toString() || ''
      })
      setSavedAddresses(userProfile.addresses || [])
      
      // Skip to appropriate step based on profile completeness
      if (userProfile.name && userProfile.email) {
        if (userProfile.addresses?.length > 0) {
          const defaultAddr = userProfile.addresses.find(a => a.isDefault) || userProfile.addresses[0]
          setSelectedAddressId(defaultAddr.id)
          setStep('payment')
        } else {
          setUseNewAddress(true)
          setStep('address')
        }
      } else {
        setStep('profile')
      }
    } else if (user && !userProfile) {
      // User authenticated but no profile yet
      setStep('profile')
    } else {
      // No user, show login
      setStep('auth')
    }
  }, [authLoading, user, userProfile, initialized])

  // Empty cart view
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

  // Auth handlers
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (phone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    
    try {
      const result = await sendOTP(phone)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
        setStep('otp')
      } else {
        setAuthError(result.error || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (otp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    
    try {
      const result = await verifyOTP(confirmationResult, otp)
      
      if (result.success) {
        // Check if user exists in database
        const userResponse = await fetch(`/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `+91${phone}` })
        })
        
        const userData = await userResponse.json()
        
        if (userData.isNewUser || !userData.user?.name) {
          setIsNewUser(true)
          setStep('profile')
        } else {
          // Existing user with profile
          setProfileData({
            name: userData.user.name || '',
            email: userData.user.email || '',
            age: userData.user.age?.toString() || ''
          })
          setSavedAddresses(userData.user.addresses || [])
          
          if (userData.user.addresses?.length > 0) {
            setSelectedAddressId(userData.user.addresses.find(a => a.isDefault)?.id || userData.user.addresses[0].id)
            setStep('payment')
          } else {
            setUseNewAddress(true)
            setStep('address')
          }
        }
      } else {
        setAuthError(result.error || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setAuthError('Verification failed. Please try again.')
    }
    
    setLoading(false)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (!profileData.name.trim()) {
      setAuthError('Please enter your name')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phoneNumber || `+91${phone}`,
          name: profileData.name,
          email: profileData.email,
          age: profileData.age ? parseInt(profileData.age) : null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.user.addresses?.length > 0) {
          setSavedAddresses(data.user.addresses)
          setSelectedAddressId(data.user.addresses.find(a => a.isDefault)?.id || data.user.addresses[0].id)
          setStep('payment')
        } else {
          setUseNewAddress(true)
          setStep('address')
        }
      } else {
        setAuthError(data.message || 'Failed to save profile. Please try again.')
        console.error('Profile save failed:', data)
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.')
      console.error('Profile save error:', err)
    }
    
    setLoading(false)
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (!formData.address.trim() || !formData.pincode.trim()) {
      setAuthError('Please enter address and pincode')
      return
    }
    
    // Validate pincode first if not already validated
    if (!pincodeValidated) {
      setPincodeLoading(true)
      try {
        const response = await fetch(`/api/pincode/${formData.pincode}`)
        const data = await response.json()
        
        if (!data.success) {
          setPincodeError(data.message || 'Invalid pincode')
          setPincodeLoading(false)
          return
        }
        
        formData.city = data.city
        formData.state = data.state
      } catch (error) {
        setPincodeError('Unable to validate pincode')
        setPincodeLoading(false)
        return
      }
      setPincodeLoading(false)
    }

    setLoading(true)
    
    try {
      // Save the address
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phoneNumber || `+91${phone}`,
          address: {
            label: 'Home',
            fullAddress: formData.address,
            pincode: formData.pincode,
            city: formData.city,
            state: formData.state,
            isDefault: true
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSavedAddresses(data.addresses)
        setSelectedAddressId(data.addresses[data.addresses.length - 1].id)
        setStep('payment')
      } else {
        setAuthError(data.message || 'Failed to save address. Please try again.')
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.')
    }
    
    setLoading(false)
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
    } catch (error) {
      console.error('Email sending failed:', error)
    }
  }

  const handleRazorpayPayment = async () => {
    setLoading(true)

    try {
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway is loading. Please try again in a moment.')
        setLoading(false)
        return
      }

      // Get selected address details
      const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderTotal * 100,
        currency: 'INR',
        name: 'BeGood',
        description: 'Functional Chocolate Order',
        image: 'https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/1q24108e_WhatsApp_Image_2025-12-21_at_2.03.26_PM-removebg-preview.png',
        prefill: {
          name: profileData.name,
          email: profileData.email,
          contact: user?.phoneNumber?.replace('+91', '') || phone
        },
        theme: {
          color: '#C8A97E'
        },
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id

          const orderData = {
            customerName: profileData.name,
            email: profileData.email,
            phone: user?.phoneNumber || `+91${phone}`,
            address: selectedAddress?.fullAddress || formData.address,
            pincode: selectedAddress?.pincode || formData.pincode,
            city: selectedAddress?.city || formData.city,
            state: selectedAddress?.state || formData.state,
            products: cart.map(item => ({
              productId: item.id,
              productName: item.name,
              variant: item.variant,
              quantity: item.quantity,
              price: item.variant.price
            })),
            subtotal: cartTotal,
            shippingFee: shippingFee,
            couponCode: appliedCoupon?.code || null,
            couponDiscount: couponDiscount,
            totalAmount: orderTotal,
            paymentId: paymentId,
            userId: user?.uid || null
          }

          try {
            const orderResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
            })

            const orderResult = await orderResponse.json()

            if (orderResult.success) {
              // Record coupon usage if coupon was applied
              if (appliedCoupon) {
                try {
                  await fetch('/api/coupons/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      couponId: appliedCoupon.id,
                      couponCode: appliedCoupon.code,
                      userId: user?.uid || null,
                      userPhone: user?.phoneNumber || `+91${phone}`,
                      orderId: orderResult.order.orderId,
                      discountAmount: couponDiscount
                    })
                  })
                } catch (couponError) {
                  console.error('Failed to record coupon usage:', couponError)
                }
              }

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

              await sendConfirmationEmail(orderResult.order)
              clearCart()
              router.push(`/order/${orderResult.order.orderId}`)
            } else {
              alert('Failed to create order. Please contact support with payment ID: ' + paymentId)
            }
          } catch (error) {
            alert('Order processing error. Your payment was successful. Payment ID: ' + paymentId)
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
      alert('Payment initialization failed. Please try again.')
      setLoading(false)
    }
  }

  // Progress indicator
  const steps = [
    { id: 'auth', label: 'Login', icon: Phone },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: Lock }
  ]
  
  const currentStepIndex = steps.findIndex(s => s.id === step || (step === 'otp' && s.id === 'auth') || (step === 'loading' && s.id === 'auth'))

  // Show loading while checking auth state
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C8A97E] mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8 text-center">Checkout</h1>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex justify-between">
            {steps.map((s, index) => {
              const Icon = s.icon
              const isActive = index === currentStepIndex || (step === 'otp' && s.id === 'auth')
              const isComplete = index < currentStepIndex
              
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500 text-white' :
                    isActive ? 'bg-[#C8A97E] text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-[#C8A97E] font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-[#C8A97E] rounded transition-all duration-300"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Forms */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              
              {/* Step: Phone Number */}
              {step === 'auth' && (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Phone className="w-5 h-5 text-[#C8A97E]" />
                    <h2 className="font-playfair text-2xl font-bold">Login to Continue</h2>
                  </div>
                  <p className="text-gray-600 mb-6">Enter your phone number to verify and proceed with the order</p>

                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Mobile Number *</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit number"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                          required
                        />
                      </div>
                    </div>

                    {authError && <p className="text-red-500 text-sm">{authError}</p>}

                    <Button type="submit" size="lg" className="w-full" disabled={loading || phone.length !== 10}>
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Sending OTP...
                        </span>
                      ) : 'Send OTP'}
                    </Button>
                  </form>
                </>
              )}

              {/* Step: OTP Verification */}
              {step === 'otp' && (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Shield className="w-5 h-5 text-[#C8A97E]" />
                    <h2 className="font-playfair text-2xl font-bold">Verify OTP</h2>
                  </div>
                  <p className="text-gray-600 mb-6">Enter the 6-digit code sent to +91 {phone}</p>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Enter OTP *</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] text-center text-2xl tracking-widest"
                        required
                        autoFocus
                      />
                    </div>

                    {authError && <p className="text-red-500 text-sm">{authError}</p>}

                    <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Verifying...
                        </span>
                      ) : 'Verify & Continue'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => { setStep('auth'); setOtp(''); setAuthError('') }}
                      className="w-full text-center text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Change phone number
                    </button>
                  </form>
                </>
              )}

              {/* Step: Profile */}
              {step === 'profile' && (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="w-5 h-5 text-[#C8A97E]" />
                    <h2 className="font-playfair text-2xl font-bold">Your Details</h2>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Age (Optional)</label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                        placeholder="Your age"
                        min="1"
                        max="120"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      />
                    </div>

                    {authError && <p className="text-red-500 text-sm">{authError}</p>}

                    <Button type="submit" size="lg" className="w-full" disabled={loading || !profileData.name.trim()}>
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Saving...
                        </span>
                      ) : 'Continue to Address'}
                    </Button>
                  </form>
                </>
              )}

              {/* Step: Address */}
              {step === 'address' && (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <MapPin className="w-5 h-5 text-[#C8A97E]" />
                    <h2 className="font-playfair text-2xl font-bold">Shipping Address</h2>
                  </div>

                  {savedAddresses.length > 0 && !useNewAddress ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedAddressId === addr.id ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 mr-3"
                              />
                              <div>
                                <p className="font-semibold">{addr.label}</p>
                                <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                                <p className="text-sm text-gray-600">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setUseNewAddress(true)}
                        className="text-[#C8A97E] hover:underline text-sm"
                      >
                        + Add new address
                      </button>

                      <Button
                        onClick={() => setStep('payment')}
                        size="lg"
                        className="w-full"
                        disabled={!selectedAddressId}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Full Address *</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="House no., Street, Locality"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Pincode *</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.pincode}
                              onChange={handlePincodeChange}
                              placeholder="6-digit pincode"
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] ${
                                pincodeError ? 'border-red-500' : pincodeValidated ? 'border-green-500' : 'border-gray-300'
                              }`}
                              required
                            />
                            {pincodeLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 animate-spin text-[#C8A97E]" />
                              </div>
                            )}
                            {pincodeValidated && !pincodeLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Check className="w-5 h-5 text-green-500" />
                              </div>
                            )}
                          </div>
                          {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
                          {pincodeValidated && <p className="text-green-600 text-xs mt-1">Valid pincode</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            readOnly
                            placeholder="Auto-filled from pincode"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          readOnly
                          placeholder="Auto-filled from pincode"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      {authError && <p className="text-red-500 text-sm">{authError}</p>}

                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(false)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Use saved address instead
                        </button>
                      )}

                      <Button type="submit" size="lg" className="w-full" disabled={loading || pincodeLoading || !formData.address.trim() || !formData.pincode.trim() || (formData.pincode.length === 6 && !pincodeValidated)}>
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Saving...
                          </span>
                        ) : 'Continue to Payment'}
                      </Button>
                    </form>
                  )}
                </>
              )}

              {/* Step: Payment */}
              {step === 'payment' && (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Lock className="w-5 h-5 text-[#C8A97E]" />
                    <h2 className="font-playfair text-2xl font-bold">Payment</h2>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivering to:</span>
                        <span className="font-medium">{profileData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{user?.phoneNumber || `+91${phone}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="text-right max-w-[200px]">
                          {savedAddresses.find(a => a.id === selectedAddressId)?.fullAddress || formData.address}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('address')}
                      className="text-[#C8A97E] hover:underline text-sm mt-2"
                    >
                      Change address
                    </button>
                  </div>

                  <Button
                    onClick={handleRazorpayPayment}
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : `Pay ₹${orderTotal} with Razorpay`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secure payment powered by Razorpay. By placing this order, you agree to our Terms & Conditions
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
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
                      <p className="text-xs text-gray-600">{item.variant.size}</p>
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

                {/* Coupon Code Section */}
                <div className="border-t border-gray-300 pt-3">
                  <label className="block text-sm font-semibold mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Have a coupon code?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div>
                        <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discountValue}% off` 
                            : `₹${appliedCoupon.discountValue} off`}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-[#C8A97E] text-white rounded-lg hover:bg-[#B8996E] disabled:opacity-50 text-sm font-medium"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                </div>

                {/* Discount if coupon applied */}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{couponDiscount}</span>
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
