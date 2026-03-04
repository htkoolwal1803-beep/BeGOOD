'use client'

import { useState, useEffect } from 'react'
import { Lock, TrendingUp, ShoppingCart, Users, MapPin, Smartphone, Monitor } from 'lucide-react'
import Button from '@/components/Button'

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')

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
        fetchDashboardData()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/analytics')
      ])

      const ordersData = await ordersRes.json()
      const analyticsData = await analyticsRes.json()

      if (ordersData.success) setOrders(ordersData.orders)
      if (analyticsData.success) setAnalytics(analyticsData.analytics)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#C8A97E]" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage orders and view analytics</p>
            </div>
            <Link href="/admin/reviews">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Manage Reviews & Notifications
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <ShoppingCart className="w-5 h-5 text-[#C8A97E]" />
              </div>
              <p className="text-3xl font-bold">{analytics.totalOrders}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold">₹{analytics.totalRevenue}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Unique Visitors</p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{analytics.uniqueVisitors}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Conversion Rate</p>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold">
                {analytics.funnel.pageViews > 0 
                  ? ((analytics.funnel.completed / analytics.funnel.pageViews) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Funnel & Analytics */}
        {analytics && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Funnel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-playfair text-2xl font-bold mb-6">Conversion Funnel</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Page Views</span>
                    <span className="text-sm font-bold">{analytics.funnel.pageViews}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-[#C8A97E] h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Add to Cart</span>
                    <span className="text-sm font-bold">{analytics.funnel.addToCart}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#C8A97E] h-3 rounded-full" 
                      style={{ 
                        width: `${analytics.funnel.pageViews > 0 ? (analytics.funnel.addToCart / analytics.funnel.pageViews * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Checkout</span>
                    <span className="text-sm font-bold">{analytics.funnel.checkout}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#C8A97E] h-3 rounded-full" 
                      style={{ 
                        width: `${analytics.funnel.pageViews > 0 ? (analytics.funnel.checkout / analytics.funnel.pageViews * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-bold">{analytics.funnel.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full" 
                      style={{ 
                        width: `${analytics.funnel.pageViews > 0 ? (analytics.funnel.completed / analytics.funnel.pageViews * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Devices & Locations */}
            <div className="space-y-6">
              {/* Devices */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-playfair text-xl font-bold mb-4">Device Breakdown</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-[#C8A97E] mr-2" />
                      <span>Mobile</span>
                    </div>
                    <span className="font-bold">{analytics.devices.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Monitor className="w-5 h-5 text-[#C8A97E] mr-2" />
                      <span>Desktop</span>
                    </div>
                    <span className="font-bold">{analytics.devices.desktop}</span>
                  </div>
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-playfair text-xl font-bold mb-4">Top Locations</h2>
                <div className="space-y-3">
                  {analytics.topLocations.slice(0, 5).map((location, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-[#C8A97E] mr-2" />
                        <span className="text-sm">{location.pincode}</span>
                      </div>
                      <span className="text-sm font-bold">{location.orders} orders</span>
                    </div>
                  ))}
                  {analytics.topLocations.length === 0 && (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-playfair text-2xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-mono">{order.orderId.slice(0, 8)}</td>
                      <td className="py-4 px-4 text-sm">{order.customerName}</td>
                      <td className="py-4 px-4 text-sm">{order.email}</td>
                      <td className="py-4 px-4 text-sm font-semibold">₹{order.totalAmount}</td>
                      <td className="py-4 px-4 text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                          style={{
                            backgroundColor: 
                              order.status === 'Pending' ? '#FEF3C7' :
                              order.status === 'Processing' ? '#DBEAFE' :
                              order.status === 'Shipped' ? '#E0E7FF' :
                              order.status === 'Delivered' ? '#D1FAE5' : '#FEE2E2',
                            color:
                              order.status === 'Pending' ? '#92400E' :
                              order.status === 'Processing' ? '#1E40AF' :
                              order.status === 'Shipped' ? '#4338CA' :
                              order.status === 'Delivered' ? '#065F46' : '#991B1B'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <a 
                          href={`/order/${order.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C8A97E] hover:underline"
                        >
                          View
                        </a>
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
