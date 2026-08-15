'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, User, LogOut, ArrowUpRight } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import { useState } from 'react'
import BrandLogo from '@/components/BrandLogo'

export default function Header() {
  const { cartCount } = useCart()
  const { user, userProfile, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/#ingredients', label: 'Ingredients' },
    { href: '/about', label: 'Our story' },
    { href: '/faq', label: 'FAQ' }
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#38281f]/10 bg-[#fffaf1]/95 backdrop-blur-xl">
      <meta name="google-site-verification" content="H0iZwFX5FeTVI0TST6S9N6Ef-rUefSS9biYBMVhIwto" />

      <div className="bg-[#1f4b3c] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#fffaf1] sm:text-xs">
        Free first-order delivery over ₹249 · Made for high-stakes moments
      </div>

      <div className="brand-container">
        <div className="flex h-[72px] items-center justify-between gap-4 lg:h-[82px]">
          <Link href="/" className="relative z-10 block w-[132px] sm:w-[162px] lg:w-[188px]" aria-label="BeGood home">
            <BrandLogo compact />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#38281f]/78 transition-colors hover:text-[#1f4b3c]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {!loading && (
              <div className="relative hidden sm:block">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-label="Open account menu"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#38281f] transition-colors hover:bg-[#ebe5f3]"
                    >
                      <User className="h-[19px] w-[19px]" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-[#38281f]/10 bg-[#fffaf1] py-2 shadow-2xl">
                        <p className="border-b border-[#38281f]/10 px-4 pb-3 pt-2 text-xs text-[#675d57]">
                          {userProfile?.name || 'Your account'}
                        </p>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-[#f5f0e7]">My profile</Link>
                        <Link href="/profile?tab=orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-[#f5f0e7]">Order history</Link>
                        <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/login" aria-label="Login" className="flex h-10 w-10 items-center justify-center rounded-full text-[#38281f] transition-colors hover:bg-[#ebe5f3]">
                    <User className="h-[19px] w-[19px]" />
                  </Link>
                )}
              </div>
            )}

            <Link href="/cart" aria-label={`Cart with ${cartCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#38281f] transition-colors hover:bg-[#ebe5f3]">
              <ShoppingBag className="h-[19px] w-[19px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8a79a8] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/product/begood-abar-2pack" className="hidden items-center gap-2 rounded-full bg-[#1f4b3c] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_25px_-15px_rgba(31,75,60,.85)] transition-all hover:-translate-y-0.5 hover:bg-[#173c30] md:flex">
              Try A-Bar <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#38281f] lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-[#38281f]/10 pb-5 pt-2 lg:hidden">
            <div className="grid">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="border-b border-[#38281f]/7 py-3.5 text-base font-semibold text-[#38281f]">
                  {link.label}
                </Link>
              ))}
              <Link href={user ? '/profile' : '/login'} onClick={() => setMobileMenuOpen(false)} className="py-3.5 text-base font-semibold text-[#38281f]">
                {user ? 'My account' : 'Login / Sign up'}
              </Link>
              <Link href="/product/begood-abar-2pack" onClick={() => setMobileMenuOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1f4b3c] px-5 py-3.5 font-bold text-white">
                Try A-Bar <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
