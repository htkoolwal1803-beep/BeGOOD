'use client'

import { useState, useEffect } from 'react'
import { Lock, Users, Plus, Eye, EyeOff, ToggleLeft, ToggleRight, Copy, ExternalLink, ArrowLeft, Loader2, Link2 } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AdminAffiliatesPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [affiliates, setAffiliates] = useState([])
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')

  // Create form state
  const [newAffiliate, setNewAffiliate] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    password: ''
  })

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
        fetchAffiliates()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates')
      const data = await response.json()
      if (data.success) {
        setAffiliates(data.affiliates)
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    }
  }

  const handleCreateAffiliate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAffiliate)
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateForm(false)
        setNewAffiliate({ code: '', name: '', phone: '', email: '', password: '' })
        fetchAffiliates()
      } else {
        setError(data.message || 'Failed to create affiliate')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAffiliateStatus = async (code) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${code}/toggle`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        fetchAffiliates()
      }
    } catch (error) {
      console.error('Error toggling affiliate:', error)
    }
  }

  const copyAffiliateLink = (code) => {
    const link = `${window.location.origin}?ref=${code}`
    navigator.clipboard.writeText(link)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const viewAffiliateDetails = async (code) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${code}`)
      const data = await response.json()
      if (data.success) {
        setSelectedAffiliate(data)
      }
    } catch (error) {
      console.error('Error fetching affiliate details:', error)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-[#C8A97E] mx-auto mb-4" />
            <h1 className="font-playfair text-2xl font-bold">Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter password to manage affiliates</p>
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

  // Affiliate Details Modal
  if (selectedAffiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedAffiliate(null)}
            className="flex items-center text-[#C8A97E] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Affiliates
          </button>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-playfair text-3xl font-bold">{selectedAffiliate.affiliate.name}</h1>
                <p className="text-gray-500">Code: {selectedAffiliate.affiliate.code}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedAffiliate.affiliate.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedAffiliate.affiliate.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-[#C8A97E]">{selectedAffiliate.affiliate.stats.totalOrders}</p>
              </div>
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <p className="text-gray-600 text-sm">Total Units Sold</p>
                <p className="text-2xl font-bold text-[#C8A97E]">{selectedAffiliate.affiliate.stats.totalUnits}</p>
              </div>
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-[#C8A97E]">₹{selectedAffiliate.affiliate.stats.totalRevenue}</p>
              </div>
              <div className="bg-[#F5F0E8] rounded-lg p-4">
                <p className="text-gray-600 text-sm">Link Clicks</p>
                <p className="text-2xl font-bold text-[#C8A97E]">{selectedAffiliate.affiliate.stats.clicks}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedAffiliate.affiliate.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedAffiliate.affiliate.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Orders via this Affiliate</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Order ID</th>
                    <th className="text-left p-4 font-semibold">Customer</th>
                    <th className="text-left p-4 font-semibold">Units</th>
                    <th className="text-left p-4 font-semibold">Pincode</th>
                    <th className="text-left p-4 font-semibold">Amount</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAffiliate.orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No orders yet through this affiliate
                      </td>
                    </tr>
                  ) : (
                    selectedAffiliate.orders.map((order) => (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono text-sm">{order.orderId.slice(0, 8)}...</td>
                        <td className="p-4">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        </td>
                        <td className="p-4">
                          {order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0}
                        </td>
                        <td className="p-4">{order.pincode}</td>
                        <td className="p-4 font-semibold">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Pending COD' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="flex items-center text-[#C8A97E] hover:underline mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="font-playfair text-3xl font-bold">Affiliate Management</h1>
            <p className="text-gray-600">Manage your affiliate partners and track their performance</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>

        {/* Create Affiliate Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-xl mb-4">Create New Affiliate</h2>
            <form onSubmit={handleCreateAffiliate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Affiliate Code *</label>
                  <input
                    type="text"
                    value={newAffiliate.code}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="e.g., SAH, JOHN10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newAffiliate.name}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="Affiliate name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newAffiliate.phone}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newAffiliate.email}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="Email address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Dashboard Password *</label>
                  <input
                    type="text"
                    value={newAffiliate.password}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                    placeholder="Password for affiliate dashboard access"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Affiliate'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Affiliates</p>
            <p className="text-2xl font-bold text-[#C8A97E]">{affiliates.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Active Affiliates</p>
            <p className="text-2xl font-bold text-green-600">{affiliates.filter(a => a.isActive).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Orders via Affiliates</p>
            <p className="text-2xl font-bold text-[#C8A97E]">
              {affiliates.reduce((sum, a) => sum + (a.stats?.totalOrders || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Revenue via Affiliates</p>
            <p className="text-2xl font-bold text-[#C8A97E]">
              ₹{affiliates.reduce((sum, a) => sum + (a.stats?.totalRevenue || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Affiliate</th>
                  <th className="text-left p-4 font-semibold">Code</th>
                  <th className="text-left p-4 font-semibold">Orders</th>
                  <th className="text-left p-4 font-semibold">Units Sold</th>
                  <th className="text-left p-4 font-semibold">Revenue</th>
                  <th className="text-left p-4 font-semibold">Clicks</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      No affiliates yet. Click "Add Affiliate" to create one.
                    </td>
                  </tr>
                ) : (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.code} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{affiliate.name}</p>
                          <p className="text-sm text-gray-500">{affiliate.phone || affiliate.email || '-'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C8A97E]">{affiliate.code}</span>
                          <button
                            onClick={() => copyAffiliateLink(affiliate.code)}
                            className="text-gray-400 hover:text-[#C8A97E]"
                            title="Copy affiliate link"
                          >
                            {copiedCode === affiliate.code ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{affiliate.stats?.totalOrders || 0}</td>
                      <td className="p-4 font-semibold">{affiliate.stats?.totalUnits || 0}</td>
                      <td className="p-4 font-semibold">₹{affiliate.stats?.totalRevenue || 0}</td>
                      <td className="p-4">{affiliate.stats?.clicks || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleAffiliateStatus(affiliate.code)}
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            affiliate.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {affiliate.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span className="text-xs">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span className="text-xs">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => viewAffiliateDetails(affiliate.code)}
                          className="text-[#C8A97E] hover:underline flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
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
