'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { AlertCircle, Clock, Mail, Phone, CheckCircle } from 'lucide-react'

function PendingOrderContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const [pendingOrder, setPendingOrder] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [retrySuccess, setRetrySuccess] = useState(false)
  const [retryError, setRetryError] = useState('')

  useEffect(() => {
    // Try to get pending order from localStorage
    if (paymentId) {
      const stored = localStorage.getItem(`pending_order_${paymentId}`)
      if (stored) {
        setPendingOrder(JSON.parse(stored))
      }
    }
  }, [paymentId])

  const handleRetry = async () => {
    if (!pendingOrder) return
    
    setRetrying(true)
    setRetryError('')
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingOrder)
      })
      
      const result = await response.json()
      
      if (result.success) {
        localStorage.removeItem(`pending_order_${paymentId}`)
        setRetrySuccess(true)
        setTimeout(() => {
          window.location.href = `/order/${result.order.orderId}`
        }, 2000)
      } else {
        setRetryError(result.message || 'Failed to create order. Please contact support.')
      }
    } catch (error) {
      setRetryError('Network error. Please try again or contact support.')
    }
    
    setRetrying(false)
  }

  if (retrySuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold mb-2">Order Created Successfully!</h1>
          <p className="text-gray-600">Redirecting to your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold mb-2">Payment Received</h1>
          <p className="text-gray-600">Your order is being processed</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Order Processing Delayed</p>
              <p className="text-yellow-700 text-sm mt-1">
                Your payment was successful, but we encountered a temporary issue creating your order. 
                Don't worry - your payment is safe!
              </p>
            </div>
          </div>
        </div>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Payment ID</p>
            <p className="font-mono text-sm font-medium">{paymentId}</p>
          </div>
        )}

        {pendingOrder && (
          <div className="mb-6">
            <Button 
              onClick={handleRetry} 
              disabled={retrying}
              className="w-full"
            >
              {retrying ? 'Retrying...' : 'Retry Order Creation'}
            </Button>
            {retryError && (
              <p className="text-red-500 text-sm mt-2 text-center">{retryError}</p>
            )}
          </div>
        )}

        <div className="border-t pt-6">
          <p className="text-gray-600 text-sm mb-4 text-center">
            If the issue persists, please contact us:
          </p>
          
          <div className="space-y-3">
            <a 
              href="mailto:healhat25@gmail.com?subject=Order Issue - Payment ID: ${paymentId}"
              className="flex items-center justify-center space-x-2 text-[#C8A97E] hover:underline"
            >
              <Mail className="w-4 h-4" />
              <span>healhat25@gmail.com</span>
            </a>
            <a 
              href="tel:+918209828412"
              className="flex items-center justify-center space-x-2 text-[#C8A97E] hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span>+91 82098 28412</span>
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PendingOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#C8A97E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PendingOrderContent />
    </Suspense>
  )
}
