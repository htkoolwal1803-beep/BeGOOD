'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Star, Plus, Trash2, Bell } from 'lucide-react'
import Button from '@/components/Button'

export default function AdminReviewsPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('reviews') // 'reviews' or 'notifications'
  
  // Review form state
  const [showAddReview, setShowAddReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    productId: 'begood-abar-001',
    name: '',
    rating: 5,
    comment: ''
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
        fetchData()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const [reviewsRes, notificationsRes] = await Promise.all([
        fetch('/api/admin/reviews'),
        fetch('/api/admin/notifications')
      ])

      const reviewsData = await reviewsRes.json()
      const notificationsData = await notificationsRes.json()

      if (reviewsData.success) setReviews(reviewsData.reviews)
      if (notificationsData.success) setNotifications(notificationsData.notifications)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      const data = await response.json()

      if (data.success) {
        setShowAddReview(false)
        setReviewForm({
          productId: 'begood-abar-001',
          name: '',
          rating: 5,
          comment: ''
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding review:', error)
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
            <h1 className="font-playfair text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-gray-600">Reviews & Notifications Management</p>
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
            
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="w-full text-center text-sm text-gray-600 hover:text-[#C8A97E] mt-4"
            >
              ← Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-bold mb-2">Content Management</h1>
            <p className="text-gray-600">Manage reviews and notification signups</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-[#C8A97E]"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-[#C8A97E] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className="inline-block w-5 h-5 mr-2" />
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'bg-[#C8A97E] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="inline-block w-5 h-5 mr-2" />
            P-Bar Signups ({notifications.length})
          </button>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl font-bold">Customer Reviews</h2>
                <Button onClick={() => setShowAddReview(!showAddReview)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Review
                </Button>
              </div>

              {/* Add Review Form */}
              {showAddReview && (
                <form onSubmit={handleAddReview} className="mb-8 p-6 bg-[#F5F0E8] rounded-xl">
                  <h3 className="font-semibold text-lg mb-4">Add New Review</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Product</label>
                      <select
                        value={reviewForm.productId}
                        onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      >
                        <option value="begood-abar-001">A-Bar</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        placeholder="John D."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Review Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A97E]"
                        rows={4}
                        placeholder="This product really helped me..."
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit">Add Review</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddReview(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <p className="font-semibold">{review.name}</p>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#C8A97E] text-[#C8A97E]" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-sm text-gray-500 mt-2">Product: {review.productId === 'begood-abar-001' ? 'A-Bar' : review.productId}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-playfair text-2xl font-bold mb-6">P-Bar Launch Notifications</h2>
            
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No signups yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Signup Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification, idx) => (
                      <tr key={notification._id} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm">{idx + 1}</td>
                        <td className="py-4 px-4 text-sm font-medium">{notification.email}</td>
                        <td className="py-4 px-4 text-sm">{notification.product}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total Signups:</strong> {notifications.length} people interested in P-Bar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
