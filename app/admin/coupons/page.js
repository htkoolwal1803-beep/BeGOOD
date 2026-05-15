'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import { ArrowLeft, Plus, Edit2, Trash2, Users, Tag, Percent, DollarSign, Calendar, Loader2, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AdminCouponsPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [expandedCouponId, setExpandedCouponId] = useState(null)
  const [couponUsage, setCouponUsage] = useState({})
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiryDate: ''
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

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
        fetchCoupons()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons')
      const data = await response.json()
      if (data.success) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    }
  }

  const fetchCouponUsage = async (couponId) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/usage`)
      const data = await response.json()
      if (data.success) {
        setCouponUsage(prev => ({ ...prev, [couponId]: data.usage }))
      }
    } catch (error) {
      console.error('Failed to fetch coupon usage:', error)
    }
  }

  const toggleCouponDetails = (couponId) => {
    if (expandedCouponId === couponId) {
      setExpandedCouponId(null)
    } else {
      setExpandedCouponId(couponId)
      if (!couponUsage[couponId]) {
        fetchCouponUsage(couponId)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '',
      expiryDate: ''
    })
    setEditingCoupon(null)
    setShowForm(false)
    setFormError('')
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        fetchCoupons()
        resetForm()
      } else {
        setFormError(data.message || 'Failed to create coupon')
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateCoupon = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const response = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          maxUses: formData.maxUses,
          expiryDate: formData.expiryDate,
          isActive: editingCoupon.isActive
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchCoupons()
        resetForm()
      } else {
        setFormError(data.message || 'Failed to update coupon')
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon? This will also delete all usage records.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchCoupons()
      } else {
        alert(data.message || 'Failed to delete coupon')
      }
    } catch (error) {
      alert('An error occurred while deleting the coupon')
    }
  }

  const handleToggleActive = async (coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      })

      const data = await response.json()

      if (data.success) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Failed to toggle coupon status:', error)
    }
  }

  const startEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxUses: coupon.maxUses?.toString() || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : ''
    })
    setShowForm(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center">
        <div className="brand-panel p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-[#6f8a74]" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-2">Coupon Management</h1>
            <p className="text-[#59615b]">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-[#59615b] hover:text-[#6f8a74] mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-4xl font-bold mb-2">Coupon Management</h1>
              <p className="text-[#59615b]">Create and manage discount coupons for content creators</p>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="brand-card p-6 mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., RAHUL20"
                    className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                    required
                    disabled={editingCoupon}
                  />
                  <p className="text-xs text-[#6b736d] mt-1">Unique code for the content creator</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Maximum Uses</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                  />
                  <p className="text-xs text-[#6b736d] mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div className="flex space-x-3">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </span>
                  ) : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-[#d9cbb5] rounded-lg hover:bg-[#eef3ea]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div className="brand-card p-6">
          <h2 className="font-playfair text-2xl font-bold mb-6">All Coupons ({coupons.length})</h2>
          
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#59615b] mb-4">No coupons created yet</p>
              <Button onClick={() => setShowForm(true)}>Create Your First Coupon</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d9cbb5]">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Discount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Usage</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Expiry</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <>
                      <tr key={coupon.id} className={`border-b border-gray-100 hover:bg-[#eef3ea] ${expandedCouponId === coupon.id ? 'bg-[#eef3ea]' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-[#6f8a74]" />
                            <span className="font-mono font-bold">{coupon.code}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {coupon.discountType === 'percentage' ? (
                              <>
                                <Percent className="w-4 h-4 mr-1 text-green-600" />
                                <span>{coupon.discountValue}% off</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                <span>₹{coupon.discountValue} off</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="font-semibold">{coupon.usedCount}</span>
                            <span className="text-[#6b736d] ml-1">
                              / {coupon.maxUses || '∞'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-[#6b736d]" />
                            <span className={coupon.expiryDate && new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : ''}>
                              {formatDate(coupon.expiryDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              coupon.isActive 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleCouponDetails(coupon.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Usage"
                            >
                              {expandedCouponId === coupon.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => startEdit(coupon)}
                              className="p-2 text-[#6b736d] hover:text-[#6f8a74] hover:bg-[#dce6d7] rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="p-2 text-[#6b736d] hover:text-red-500 hover:bg-[#dce6d7] rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Usage Details */}
                      {expandedCouponId === coupon.id && (
                        <tr key={`${coupon.id}-usage`} className="bg-[#eef3ea]">
                          <td colSpan="6" className="py-4 px-4">
                            <div className="bg-[#fbf7ed] rounded-lg p-4 border border-[#d9cbb5]">
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-[#6f8a74]" />
                                Usage Details - {coupon.usedCount} Referrals
                              </h4>
                              {!couponUsage[coupon.id] ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-[#6f8a74]" />
                                </div>
                              ) : couponUsage[coupon.id].length === 0 ? (
                                <p className="text-[#6b736d] text-sm">No usage records yet</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-[#d9cbb5]">
                                        <th className="text-left py-2 px-3 font-semibold">User Phone</th>
                                        <th className="text-left py-2 px-3 font-semibold">Order ID</th>
                                        <th className="text-left py-2 px-3 font-semibold">Discount Given</th>
                                        <th className="text-left py-2 px-3 font-semibold">Date</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {couponUsage[coupon.id].map((usage, idx) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                          <td className="py-2 px-3">{usage.userPhone || 'N/A'}</td>
                                          <td className="py-2 px-3 font-mono text-xs">
                                            <a 
                                              href={`/order/${usage.orderId}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                            >
                                              {usage.orderId?.slice(0, 8)}...
                                            </a>
                                          </td>
                                          <td className="py-2 px-3 text-green-600 font-semibold">₹{usage.discountAmount}</td>
                                          <td className="py-2 px-3">{formatDate(usage.usedAt)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
