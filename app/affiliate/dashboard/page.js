'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ShoppingBag, Package, TrendingUp, LogOut, Copy, Link2, Calendar, MapPin, Loader2 } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AffiliateDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState(null)
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    // Check if affiliate is logged in
    const authData = localStorage.getItem('affiliateAuth')
    if (!authData) {
      router.push('/affiliate/login')
      return
    }

    const auth = JSON.parse(authData)
    
    try {
      const response = await fetch(`/api/affiliate/stats/${auth.code}`)
      const data = await response.json()

      if (data.success) {
        setAffiliate(data.affiliate)
        setStats(data.stats)
        setOrders(data.orders)
      } else {
        // Session invalid, redirect to login
        localStorage.removeItem('affiliateAuth')
        router.push('/affiliate/login')
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('affiliateAuth')
    router.push('/affiliate/login')
  }

  const copyAffiliateLink = () => {
    const link = `${window.location.origin}?ref=${affiliate.code}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C8A97E] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!affiliate) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#C8A97E] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold">{affiliate.name}</h1>
              <p className="text-sm text-gray-500">Affiliate Code: <span className="font-mono font-bold text-[#C8A97E]">{affiliate.code}</span></p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Affiliate Link Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-bold text-lg mb-1">Your Affiliate Link</h2>
              <p className="text-gray-500 text-sm">Share this link to track orders</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
              <Link2 className="w-4 h-4 text-gray-500" />
              <code className="text-sm">{typeof window !== 'undefined' ? `${window.location.origin}?ref=${affiliate.code}` : ''}</code>
              <button
                onClick={copyAffiliateLink}
                className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  copiedLink ? 'bg-green-500 text-white' : 'bg-[#C8A97E] text-white hover:bg-[#B8956E]'
                }`}
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Units Sold</p>
            <p className="text-3xl font-bold">{stats?.totalUnits || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#F5F0E8] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#C8A97E]" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-[#C8A97E]">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Link Clicks</p>
            <p className="text-3xl font-bold">{stats?.clicks || 0}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-playfair text-xl font-bold">Your Orders</h2>
            <p className="text-gray-500 text-sm">All orders placed through your affiliate link</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Share your affiliate link to start tracking orders</p>
              <Button onClick={copyAffiliateLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Your Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Order ID</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Units</th>
                    <th className="text-left p-4 font-semibold">Pincode</th>
                    <th className="text-left p-4 font-semibold">Amount</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono text-sm">{order.orderId.slice(0, 8)}...</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{order.units}</td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          {order.pincode}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[#C8A97E]">₹{order.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          order.status === 'Pending COD' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Need help? Contact us at <a href="mailto:healhat25@gmail.com" className="text-[#C8A97E] hover:underline">healhat25@gmail.com</a></p>
        </div>
      </div>
    </div>
  )
}
