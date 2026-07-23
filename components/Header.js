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
    { href: '/hampers', label: 'Hampers' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' }
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div className="container mx-auto rounded-[1.35rem] border border-[#d9cbb5]/80 bg-[#fbf7ed]/92 px-4 shadow-[0_18px_45px_-32px_rgba(31,34,41,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/begood-logo.png"
              alt="BeGood Logo"
              width={240}
              height={80}
              className="h-14 md:h-16 w-auto"
            />
          </Link>
  
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#2f332f] transition-colors hover:text-[#6f8a74]"
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
                      className="flex items-center space-x-2 text-[#2f332f] hover:text-[#6f8a74] transition-colors"
                    >
                      <User className="w-6 h-6" />
                      <span className="hidden md:inline text-sm font-medium">
                        {userProfile?.name || 'Account'}
                      </span>
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-[#d9cbb5] bg-[#fbf7ed] py-2 shadow-xl z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-[#2f332f] hover:bg-[#dce6d7]/70"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          className="block px-4 py-2 text-sm text-[#2f332f] hover:bg-[#dce6d7]/70"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Order History
                        </Link>
                        <Link
                          href="/profile?tab=addresses"
                          className="block px-4 py-2 text-sm text-[#2f332f] hover:bg-[#dce6d7]/70"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Saved Addresses
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
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
                    className="flex items-center space-x-2 text-[#2f332f] hover:text-[#6f8a74] transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>
            )}

            <Link href="/cart" className="relative group rounded-full bg-[#dce6d7]/70 p-2">
              <ShoppingCart className="w-5 h-5 text-[#2f332f] group-hover:text-[#6f8a74] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#6f8a74] text-[#fbf7ed] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                <X className="w-6 h-6 text-[#2f332f]" />
              ) : (
                <Menu className="w-6 h-6 text-[#2f332f]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#d9cbb5]">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-[#2f332f] hover:text-[#6f8a74] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block py-3 text-[#2f332f] hover:text-[#6f8a74] transition-colors font-medium"
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
                className="block py-3 text-[#536a58] hover:text-[#1f2229] transition-colors font-medium"
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
