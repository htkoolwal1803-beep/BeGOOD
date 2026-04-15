'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Users, Loader2 } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AffiliateLoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/affiliate/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), password })
      })

      const data = await response.json()

      if (data.success) {
        // Store affiliate session in localStorage
        localStorage.setItem('affiliateAuth', JSON.stringify({
          code: data.affiliate.code,
          name: data.affiliate.name,
          isActive: data.affiliate.isActive
        }))
        router.push('/affiliate/dashboard')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C8A97E] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-playfair text-3xl font-bold">Affiliate Portal</h1>
          <p className="text-gray-600 mt-2">Login to view your performance dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Affiliate Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your affiliate code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E] uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Logging in...
              </span>
            ) : 'Login to Dashboard'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact us at <a href="mailto:healhat25@gmail.com" className="text-[#C8A97E] hover:underline">healhat25@gmail.com</a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  )
}
