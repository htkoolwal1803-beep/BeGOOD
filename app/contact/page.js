'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle } from 'lucide-react'
import emailjs from '@emailjs/browser'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Initialize EmailJS
      if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
        emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
      }

      // Send email via EmailJS
      // Note: You need to create a contact template in EmailJS with these variables
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        from_phone: formData.phone || 'Not provided',
        subject: formData.subject,
        message: formData.message,
        to_email: 'healhat25@gmail.com'
      }

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID || 'template_contact', // Use dedicated contact template
        templateParams
      )

      // Also save to database for record
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)

    } catch (err) {
      console.error('Contact form error:', err)
      setError('Failed to send message. Please try again or email us directly at healhat25@gmail.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-playfair text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-gray-700 mb-8">
                  Our customer support team is here to help you with any questions about our products, orders, or anything else.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C8A97E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#C8A97E]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <p className="text-gray-600">healhat25@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C8A97E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#C8A97E]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <p className="text-gray-600">+91 8000366966</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Sun, 24 X 7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C8A97E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#C8A97E]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-gray-600">
                      BeGood<br />
                      [Vidhyadhar Nagar, Jaipur, Rajasthan]<br />
                      [Jaipur, Rajasthan, 302039]
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C8A97E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#C8A97E]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Business Hours</p>
                    <p className="text-gray-600">Monday - Sunday: 24 X 7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#F5F0E8] p-8 rounded-2xl">
              <h2 className="font-playfair text-2xl font-bold mb-6">Send Us a Message</h2>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] bg-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] bg-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] bg-white"
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] bg-white"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] bg-white"
                    placeholder="Your message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#C8A97E] text-white hover:bg-[#B8956E] focus:ring-[#C8A97E] px-8 py-4 text-lg rounded-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
