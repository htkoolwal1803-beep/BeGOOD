'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import { useState } from 'react'
import Image from 'next/image'

export default function Header() {
  const { cartCount } = useCart()
  const { user, userProfile, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' }
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-gray-700"">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/begood-logo.png"
              alt="BeGood Logo"
              width={240}
              height={80}
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#C8A97E] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart, User & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User Account */}
            {!loading && (
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#C8A97E] transition-colors"
                    >
                      <User className="w-6 h-6" />
                      <span className="hidden md:inline text-sm font-medium">
                        {userProfile?.name || 'Account'}
                      </span>
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Order History
                        </Link>
                        <Link
                          href="/profile?tab=addresses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Saved Addresses
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#C8A97E] transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>
            )}

            <Link href="/cart" className="relative group">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#C8A97E] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C8A97E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-gray-700 hover:text-[#C8A97E] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block py-3 text-gray-700 hover:text-[#C8A97E] transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block py-3 text-red-600 hover:text-red-700 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-3 text-[#C8A97E] hover:text-[#b8996e] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
