'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { CheckCircle, Package, Mail, Phone } from 'lucide-react'

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id)
    }
  }, [params.id])

  const fetchOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8A97E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-playfair text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for</p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your order, {order.customerName}!
            </p>
            <p className="text-gray-500">
              Order ID: <span className="font-mono font-semibold">{order.orderId}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
            <h2 className="font-playfair text-2xl font-bold mb-6 flex items-center">
              <Package className="w-6 h-6 mr-2 text-[#C8A97E]" />
              Order Details
            </h2>

            <div className="space-y-4 mb-6">
              {order.products.map((product, index) => (
                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="text-sm text-gray-600">
                      {product.variant.size} - {product.variant.flavor}
                    </p>
                    <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{product.price * product.quantity}</p>
                    <p className="text-xs text-gray-500">₹{product.price} each</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-[#C8A97E]">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-[#F5F0E8] rounded-xl p-8 mb-6">
            <h2 className="font-playfair text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-[#C8A97E] mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{order.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-[#C8A97E] mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Package className="w-5 h-5 text-[#C8A97E] mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold">{order.address}</p>
                  <p className="font-semibold">Pincode: {order.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-br from-[#C8A97E] to-[#B8956E] text-white rounded-xl p-8 mb-6">
            <h2 className="font-playfair text-2xl font-bold mb-4">What's Next?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">1.</span>
                <span>You'll receive a confirmation email at {order.email}</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">2.</span>
                <span>We'll process and pack your order with care</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">3.</span>
                <span>You'll receive tracking information once shipped</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">4.</span>
                <span>Expect delivery within 5-7 business days</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}