'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { Phone, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  
  const { user, sendOTP, verifyOTP, loading: authLoading } = useAuth()
  
  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: ''
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(returnUrl)
    }
  }, [user, authLoading, router, returnUrl])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    
    try {
      const result = await sendOTP(phone)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
        setStep('otp')
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('OTP send error:', err)
    }
    
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
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
        
        if (userData.isNewUser) {
          setIsNewUser(true)
          setStep('profile')
        } else {
          // Existing user, redirect
          router.push(returnUrl)
        }
      } else {
        setError(result.error || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
      console.error('OTP verify error:', err)
    }
    
    setLoading(false)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!profileData.name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${phone}`,
          name: profileData.name,
          email: profileData.email,
          age: profileData.age ? parseInt(profileData.age) : null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push(returnUrl)
      } else {
        setError('Failed to save profile. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Profile save error:', err)
    }
    
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setError('')
    setOtp('')
    setLoading(true)
    
    try {
      // Reset recaptcha
      if (typeof window !== 'undefined' && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      
      const result = await sendOTP(phone)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
      } else {
        setError(result.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    }
    
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-[#F5F0E8]">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Back Button */}
            {step !== 'phone' && (
              <button
                onClick={() => {
                  if (step === 'otp') {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  } else if (step === 'profile') {
                    // Can't go back from profile after verification
                  }
                }}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                disabled={step === 'profile'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

            {/* Step: Phone Number */}
            {step === 'phone' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-[#C8A97E]" />
                  </div>
                  <h1 className="font-playfair text-2xl font-bold mb-2">Login / Sign Up</h1>
                  <p className="text-gray-600">Enter your phone number to continue</p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Mobile Number</label>
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

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading || phone.length !== 10}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-6">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-[#C8A97E] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#C8A97E] hover:underline">Privacy Policy</Link>
                </p>
              </>
            )}

            {/* Step: OTP Verification */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-[#C8A97E]" />
                  </div>
                  <h1 className="font-playfair text-2xl font-bold mb-2">Verify OTP</h1>
                  <p className="text-gray-600">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold">+91 {phone}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Enter OTP</label>
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

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full text-center text-[#C8A97E] hover:underline text-sm"
                  >
                    Didn't receive OTP? Resend
                  </button>
                </form>
              </>
            )}

            {/* Step: Profile (for new users) */}
            {step === 'profile' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-playfair text-2xl font-bold mb-2">Complete Your Profile</h1>
                  <p className="text-gray-600">Just a few more details to get started</p>
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
                    <label className="block text-sm font-semibold mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
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

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading || !profileData.name.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Complete Sign Up'
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
