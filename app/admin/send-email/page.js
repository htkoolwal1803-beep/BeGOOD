'use client'

import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import Button from '@/components/Button'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function SendEmailPage() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
  }, [])

  const orderDetails = {
    orderId: '1d029ee1-7e1f-4404-821e-efc61a2d8c2f',
    email: 'rohan1998.rv@gmail.com',
    customerName: 'Rohan',
    products: [
      { name: 'A-Bar (40g)', price: 600, quantity: 5 }
    ],
    subtotal: 600,
    couponCode: 'LVY10',
    couponDiscount: 60,
    shippingFee: 0,
    totalAmount: 540
  }

  const sendEmail = async () => {
    setSending(true)
    setError('')

    try {
      const orders = orderDetails.products.map(p => ({
        name: `${p.name} x ${p.quantity}`,
        price: `₹${p.price}`,
        units: p.quantity
      }))

      const templateParams = {
        to_email: orderDetails.email,
        order_id: orderDetails.orderId,
        orders: orders,
        cost: {
          subtotal: `₹${orderDetails.subtotal}`,
          discount: `₹${orderDetails.couponDiscount}`,
          shipping: `₹${orderDetails.shippingFee}`,
          tax: '₹0',
          total: `₹${orderDetails.totalAmount}`
        },
        coupon_code: orderDetails.couponCode,
        has_discount: true
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams
      )

      setSent(true)
    } catch (err) {
      console.error('Email error:', err)
      setError(err.message || 'Failed to send email')
    }

    setSending(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold mb-2">Email Sent Successfully!</h1>
          <p className="text-gray-600">Confirmation email has been sent to {orderDetails.email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-[#C8A97E] mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold mb-2">Send Order Confirmation</h1>
          <p className="text-gray-600">Send confirmation email for the manually created order</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <p><span className="font-semibold">Order ID:</span> {orderDetails.orderId}</p>
          <p><span className="font-semibold">Customer:</span> {orderDetails.customerName}</p>
          <p><span className="font-semibold">Email:</span> {orderDetails.email}</p>
          <p><span className="font-semibold">Products:</span> A-Bar (40g) x 5</p>
          <p><span className="font-semibold">Subtotal:</span> ₹{orderDetails.subtotal}</p>
          <p><span className="font-semibold">Coupon ({orderDetails.couponCode}):</span> -₹{orderDetails.couponDiscount}</p>
          <p><span className="font-semibold">Shipping:</span> ₹{orderDetails.shippingFee}</p>
          <p className="text-lg font-bold"><span className="font-semibold">Total:</span> ₹{orderDetails.totalAmount}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <Button onClick={sendEmail} disabled={sending} className="w-full">
          {sending ? 'Sending...' : 'Send Confirmation Email'}
        </Button>
      </div>
    </div>
  )
}
