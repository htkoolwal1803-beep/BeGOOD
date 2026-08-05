'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Star, Bell } from 'lucide-react'
import Button from '@/components/Button'
import { adminFetch, setAdminKey, hasAdminKey } from '@/lib/adminAuth'

export default function AdminReviewsPage() {
  const router = useRouter()

  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('reviews') // 'reviews' or 'notifications'

  // Every admin page used to ask for the password again, even when you had
  // just typed it on the dashboard. The key is already in sessionStorage for
  // this tab, so reuse it rather than making the same person prove themselves
  // twice - a second prompt reads as a dead end and pages get abandoned.
  useEffect(() => {
    if (hasAdminKey()) setAuthenticated(true)
  }, [])

  // ?tab=notifications opens straight on the P-Bar list, so it can be linked
  // to directly from the dashboard. Read from location rather than
  // useSearchParams, which would force a Suspense boundary at build time.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'notifications') setActiveTab('notifications')
  }, [])

  useEffect(() => {
    if (authenticated) fetchData()
  }, [authenticated])

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
        setAdminKey(password)
        setAuthenticated(true)
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
        adminFetch('/api/admin/reviews'),
        adminFetch('/api/admin/notifications')
      ])

      const reviewsData = await reviewsRes.json()
      const notificationsData = await notificationsRes.json()

      if (reviewsData.success) setReviews(reviewsData.reviews)
      if (notificationsData.success) setNotifications(notificationsData.notifications)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center">
        <div className="brand-panel p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#6f8a74]" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-[#59615b]">Reviews & Notifications Management</p>
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
            
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="w-full text-center text-sm text-[#59615b] hover:text-[#6f8a74] mt-4"
            >
              ← Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="brand-page min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-bold mb-2">Reviews & Notifications</h1>
            <p className="text-[#59615b]">
              Customer reviews written on the site are managed under{' '}
              <a href="/admin/feedback" className="underline text-[#3f5a46]">Feedback</a>.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-[#59615b] hover:text-[#6f8a74]"
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
                ? 'bg-[#6f8a74] text-white'
                : 'bg-[#fbf7ed] text-[#59615b] hover:bg-[#dce6d7]'
            }`}
          >
            <Star className="inline-block w-5 h-5 mr-2" />
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'bg-[#6f8a74] text-white'
                : 'bg-[#fbf7ed] text-[#59615b] hover:bg-[#dce6d7]'
            }`}
          >
            <Bell className="inline-block w-5 h-5 mr-2" />
            Notifications ({notifications.length})
          </button>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="brand-card p-6 mb-6">
              <div className="mb-6">
                <h2 className="font-playfair text-2xl font-bold mb-1">Customer Reviews</h2>
                <p className="text-sm text-[#59615b]">
                  Read-only. Reviews arrive from customers through the review link in
                  their email; they are not written here.
                </p>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-[#6b736d] text-center py-8">No reviews yet</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border border-[#d9cbb5] rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <p className="font-semibold">{review.name}</p>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#6f8a74] text-[#6f8a74]" />
                              ))}
                            </div>
                            <span className="text-sm text-[#6b736d]">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#464c49]">{review.comment}</p>
                          <p className="text-sm text-[#6b736d] mt-2">Product: {review.productId === 'begood-abar-001' ? 'A-Bar' : review.productId}</p>
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
          <div className="brand-card p-6">
            <h2 className="font-playfair text-2xl font-bold mb-2">P-Bar Launch Notifications</h2>
            <p className="text-sm text-[#59615b] mb-6">
              Everyone who asked to be told when P-Bar launches.
            </p>
            
            {notifications.length === 0 ? (
              <p className="text-[#6b736d] text-center py-8">No signups yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#d9cbb5]">
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
                        <td className="py-4 px-4 text-sm text-[#59615b]">
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
