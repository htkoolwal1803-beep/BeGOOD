'use client'

import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({
    config: null,
    orderConfirmation: null,
    contactForm: null
  })
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    // Check configuration
    const config = {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'NOT SET',
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'NOT SET',
      contactTemplateId: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID || 'NOT SET',
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'SET ✓' : 'NOT SET'
    }
    setResults(prev => ({ ...prev, config }))

    // Initialize EmailJS
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
    }
  }, [])

  const testOrderConfirmationEmail = async () => {
    if (!testEmail) {
      alert('Please enter your email address')
      return
    }

    setLoading(true)
    setResults(prev => ({ ...prev, orderConfirmation: { status: 'testing' } }))

    try {
      const templateParams = {
        customer_name: 'Test Customer',
        order_id: 'TEST-ORDER-123',
        total_amount: '599',
        order_details: 'Calm Chocolate (Box of 6) x 1 = ₹599',
        address: '123 Test Street, Test City',
        pincode: '302039',
        to_email: testEmail
      }

      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )

      setResults(prev => ({
        ...prev,
        orderConfirmation: {
          status: 'success',
          message: `Email sent successfully! Status: ${response.status}`,
          response
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        orderConfirmation: {
          status: 'error',
          message: error.text || error.message || 'Failed to send email',
          error
        }
      }))
    }

    setLoading(false)
  }

  const testContactFormEmail = async () => {
    if (!testEmail) {
      alert('Please enter your email address')
      return
    }

    setLoading(true)
    setResults(prev => ({ ...prev, contactForm: { status: 'testing' } }))

    try {
      const templateParams = {
        from_name: 'Test User',
        from_email: testEmail,
        from_phone: '9876543210',
        subject: 'Test Contact Form',
        message: 'This is a test message from the email testing page.',
        to_email: 'healhat25@gmail.com'
      }

      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )

      setResults(prev => ({
        ...prev,
        contactForm: {
          status: 'success',
          message: `Email sent successfully! Status: ${response.status}`,
          response
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        contactForm: {
          status: 'error',
          message: error.text || error.message || 'Failed to send email',
          error
        }
      }))
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Mail className="w-8 h-8 text-[#C8A97E] mr-3" />
            <h1 className="text-3xl font-bold">EmailJS Test Page</h1>
          </div>

          {/* Configuration Check */}
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-semibold mb-3">Configuration Status:</h2>
            {results.config && (
              <div className="text-sm space-y-1 font-mono">
                <p>Service ID: <span className="text-blue-600">{results.config.serviceId}</span></p>
                <p>Order Template ID: <span className="text-blue-600">{results.config.templateId}</span></p>
                <p>Contact Template ID: <span className="text-blue-600">{results.config.contactTemplateId}</span></p>
                <p>Public Key: <span className="text-green-600">{results.config.publicKey}</span></p>
              </div>
            )}
          </div>

          {/* Test Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Your Email (to receive test emails)</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
            />
          </div>

          {/* Test Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testOrderConfirmationEmail}
              disabled={loading}
              className="px-6 py-3 bg-[#C8A97E] text-white rounded-lg hover:bg-[#B8996E] disabled:opacity-50 flex items-center justify-center"
            >
              {loading && results.orderConfirmation?.status === 'testing' ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Test Order Confirmation
            </button>

            <button
              onClick={testContactFormEmail}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading && results.contactForm?.status === 'testing' ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Test Contact Form
            </button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Order Confirmation Result */}
            {results.orderConfirmation && results.orderConfirmation.status !== 'testing' && (
              <div className={`p-4 rounded-lg ${results.orderConfirmation.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  {results.orderConfirmation.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className="font-semibold">Order Confirmation Email</span>
                </div>
                <p className={results.orderConfirmation.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {results.orderConfirmation.message}
                </p>
                {results.orderConfirmation.status === 'error' && results.orderConfirmation.error && (
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.orderConfirmation.error, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Contact Form Result */}
            {results.contactForm && results.contactForm.status !== 'testing' && (
              <div className={`p-4 rounded-lg ${results.contactForm.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  {results.contactForm.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className="font-semibold">Contact Form Email</span>
                </div>
                <p className={results.contactForm.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {results.contactForm.message}
                </p>
                {results.contactForm.status === 'error' && results.contactForm.error && (
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.contactForm.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Enter your email address above</li>
              <li>Click "Test Order Confirmation" to test customer order emails</li>
              <li>Click "Test Contact Form" to test contact form emails</li>
              <li>Check your inbox (and spam folder) for the test emails</li>
              <li>If errors occur, check the EmailJS dashboard for details</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
