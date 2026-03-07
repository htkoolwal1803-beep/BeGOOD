'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { User, Package, MapPin, Edit2, Trash2, Plus, Loader2, Check } from 'lucide-react'
import Link from 'next/link'

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'profile'
  
  const { user, userProfile, loading: authLoading, updateUserProfile } = useAuth()
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    age: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullAddress: '',
    pincode: '',
    city: '',
    state: '',
    isDefault: false
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?returnUrl=/profile')
    }
  }, [user, authLoading, router])

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age?.toString() || ''
      })
      setAddresses(userProfile.addresses || [])
    }
  }, [userProfile])

  // Load orders
  useEffect(() => {
    if (user?.phoneNumber) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(user.phoneNumber)}/orders`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await updateUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      age: profileForm.age ? parseInt(profileForm.age) : null
    })
    
    if (result.success) {
      setEditingProfile(false)
    }
    
    setLoading(false)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phoneNumber,
          address: addressForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.addresses)
        resetAddressForm()
      }
    } catch (err) {
      console.error('Failed to add address:', err)
    }
    
    setLoading(false)
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/addresses/${editingAddressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phoneNumber,
          address: addressForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.addresses)
        resetAddressForm()
      }
    } catch (err) {
      console.error('Failed to update address:', err)
    }
    
    setLoading(false)
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/users/addresses/${addressId}?phone=${encodeURIComponent(user.phoneNumber)}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.addresses)
      }
    } catch (err) {
      console.error('Failed to delete address:', err)
    }
    
    setLoading(false)
  }

  const resetAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddressId(null)
    setAddressForm({
      label: 'Home',
      fullAddress: '',
      pincode: '',
      city: '',
      state: '',
      isDefault: false
    })
  }

  const startEditAddress = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      label: address.label,
      fullAddress: address.fullAddress,
      pincode: address.pincode,
      city: address.city || '',
      state: address.state || '',
      isDefault: address.isDefault
    })
    setShowAddressForm(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="font-playfair text-4xl font-bold mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-[#C8A97E]/10 text-[#C8A97E]' : 'hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'orders' ? 'bg-[#C8A97E]/10 text-[#C8A97E]' : 'hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Order History</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'addresses' ? 'bg-[#C8A97E]/10 text-[#C8A97E]' : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Saved Addresses</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-playfair text-2xl font-bold">Profile Information</h2>
                  {!editingProfile && (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center space-x-2 text-[#C8A97E] hover:text-[#b8996e]"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {editingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Age</label>
                      <input
                        type="number"
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                        min="1"
                        max="120"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={user.phoneNumber}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfile(false)
                          setProfileForm({
                            name: userProfile?.name || '',
                            email: userProfile?.email || '',
                            age: userProfile?.age?.toString() || ''
                          })
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{userProfile?.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userProfile?.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{userProfile?.age || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-playfair text-2xl font-bold mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                    <Link href="/shop">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.orderId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">Order #{order.orderId.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {order.products?.map((product, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{product.productName} x{product.quantity}</span>
                              <span>₹{product.price * product.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                          <span className="font-semibold">Total: ₹{order.totalAmount}</span>
                          <Link href={`/order/${order.orderId}`}>
                            <button className="text-[#C8A97E] hover:underline text-sm">View Details</button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-playfair text-2xl font-bold">Saved Addresses</h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center space-x-2 text-[#C8A97E] hover:text-[#b8996e]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Label</label>
                        <select
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Pincode *</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                          placeholder="6-digit pincode"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Full Address *</label>
                        <textarea
                          value={addressForm.fullAddress}
                          onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                          placeholder="House no., Street, Locality"
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          placeholder="City"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          placeholder="State"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                            className="w-4 h-4 text-[#C8A97E] rounded"
                          />
                          <span className="text-sm">Set as default address</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Add Address')}
                      </Button>
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No saved addresses yet</p>
                    <Button onClick={() => setShowAddressForm(true)}>Add Your First Address</Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className={`border rounded-lg p-4 relative ${address.isDefault ? 'border-[#C8A97E]' : 'border-gray-200'}`}>
                        {address.isDefault && (
                          <span className="absolute -top-2 left-4 bg-[#C8A97E] text-white text-xs px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold flex items-center space-x-2">
                              <span>{address.label}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                            <p className="text-sm text-gray-600">
                              {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditAddress(address)}
                              className="p-2 text-gray-500 hover:text-[#C8A97E] hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E]" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
