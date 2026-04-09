'use client'

import { useState, useEffect } from 'react'
import { Lock, Package, Phone, Calendar, ArrowLeft, Bell, Truck, X } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AdminSubscriptionsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([])
  const [error, setError] = useState('')
  const [showNotification, setShowNotification] = useState(true)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        setAuthenticated(true)
        fetchSubscriptions()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
        setUpcomingDeliveries(data.upcomingDeliveries || [])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-[#C8A97E] mx-auto mb-4" />
            <h1 className="font-playfair text-2xl font-bold">Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter password to view subscriptions</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Upcoming Deliveries Notification Popup */}
        {showNotification && upcomingDeliveries.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-6 h-6 mr-2 animate-bounce" />
                  <h2 className="font-bold text-lg">Upcoming Deliveries Alert!</h2>
                </div>
                <button onClick={() => setShowNotification(false)} className="hover:bg-white/20 rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <p className="text-gray-600 mb-4">The following subscription deliveries are due within the next 7 days:</p>
                <div className="space-y-3">
                  {upcomingDeliveries.map((delivery, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-orange-700">{delivery.customerName}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          delivery.daysUntilDelivery === 0 ? 'bg-red-500 text-white' :
                          delivery.daysUntilDelivery <= 2 ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {delivery.daysUntilDelivery === 0 ? 'TODAY!' : `In ${delivery.daysUntilDelivery} days`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {delivery.phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Package className="w-3 h-3 mr-1" />
                        {delivery.barsCount} bars (Month {delivery.month})
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate">{delivery.address}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <Button onClick={() => setShowNotification(false)} className="w-full">
                  Got it, I'll process these deliveries
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="flex items-center text-[#C8A97E] hover:underline mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="font-playfair text-3xl font-bold">Subscriptions</h1>
            <p className="text-gray-600">Total: {subscriptions.length} subscriptions</p>
          </div>
          {upcomingDeliveries.length > 0 && (
            <button
              onClick={() => setShowNotification(true)}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              <Bell className="w-4 h-4 mr-2" />
              {upcomingDeliveries.length} Upcoming Deliveries
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-600">
              {subscriptions.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-[#C8A97E]">
              ₹{subscriptions.reduce((sum, s) => sum + (s.totalAmount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Upcoming Deliveries (7 days)</p>
            <p className="text-3xl font-bold text-orange-500">{upcomingDeliveries.length}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Plan</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Deliveries</th>
                  <th className="text-left p-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No subscriptions yet
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub, index) => (
                    <tr key={sub.subscriptionId || index} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{sub.customerName}</p>
                          <p className="text-sm text-gray-500">{sub.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="font-medium">{sub.barsPerMonth} bars/month</p>
                          <p className="text-gray-500">for {sub.durationMonths} months</p>
                          <p className="text-[#C8A97E]">₹{sub.pricePerBar}/bar</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-lg">₹{sub.totalAmount}</p>
                        <p className="text-xs text-gray-500">{sub.totalBars} total bars</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'active' ? 'bg-green-100 text-green-700' :
                          sub.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {sub.deliverySchedule?.map((d, i) => (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                d.status === 'delivered' ? 'bg-green-500 text-white' :
                                d.status === 'processing' ? 'bg-yellow-500 text-white' :
                                'bg-gray-200 text-gray-600'
                              }`}
                              title={`Month ${d.month}: ${d.status}`}
                            >
                              {d.month}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
