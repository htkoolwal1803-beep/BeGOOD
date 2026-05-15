'use client'

import { useState, useEffect } from 'react'
import { Lock, Users, Phone, Mail, MapPin, Calendar, ArrowLeft } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
        fetchUsers()
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!authenticated) {
    return (
      <div className="brand-page min-h-screen flex items-center justify-center p-4">
        <div className="brand-panel p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-[#6f8a74] mx-auto mb-4" />
            <h1 className="font-playfair text-2xl font-bold">Admin Access</h1>
            <p className="text-[#59615b] mt-2">Enter password to view users</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
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
    <div className="brand-page min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="flex items-center text-[#6f8a74] hover:underline mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="font-playfair text-3xl font-bold">Users</h1>
            <p className="text-[#59615b]">Total: {users.length} users</p>
          </div>
        </div>

        {/* Search */}
        <div className="brand-card p-4 mb-6 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
          />
        </div>

        {/* Users Table */}
        <div className="brand-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#eef3ea] border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Phone</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Age</th>
                  <th className="text-left p-4 font-semibold">Addresses</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#6b736d]">
                      {searchTerm ? 'No users found matching your search' : 'No users yet'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.uid || index} className="border-b hover:bg-[#eef3ea]">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#6f8a74] rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-medium">{user.name || 'Not provided'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <a href={`tel:${user.phone}`} className="flex items-center text-[#6f8a74] hover:underline">
                          <Phone className="w-4 h-4 mr-1" />
                          {user.phone || 'N/A'}
                        </a>
                      </td>
                      <td className="p-4">
                        {user.email ? (
                          <a href={`mailto:${user.email}`} className="flex items-center text-[#6f8a74] hover:underline">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </a>
                        ) : (
                          <span className="text-[#8b938b]">Not provided</span>
                        )}
                      </td>
                      <td className="p-4">{user.age || '-'}</td>
                      <td className="p-4">
                        {user.addresses && user.addresses.length > 0 ? (
                          <div className="text-sm">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {user.addresses.length} saved
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8b938b]">None</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[#59615b]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
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
