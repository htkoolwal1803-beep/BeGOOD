'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { ensureLinkedProduct } from './cartLink.mjs'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('begood_cart') || '[]')
      if (Array.isArray(saved)) setCart(saved.filter(item => item && item.variant && Number.isFinite(item.variant.price) && Number.isFinite(item.quantity) && item.quantity > 0))
    } catch { /* Invalid or unavailable storage: keep an empty cart. */ }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try { localStorage.setItem('begood_cart', JSON.stringify(cart)) } catch { /* Keep the in-memory cart usable. */ }
    }
  }, [cart, isLoaded])

  const ensureCartProduct = useCallback((product, quantity) => {
    setCart(current => ensureLinkedProduct(current, product, quantity))
  }, [])

  const addToCart = (product, variant, quantity = 1) => {
    const existingItemIndex = cart.findIndex(
      item => item.id === product.id && 
              item.variant.size === variant.size && 
              item.variant.flavor === variant.flavor
    )

    if (existingItemIndex > -1) {
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([...cart, { ...product, variant, quantity }])
    }

    // Track analytics
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      variant: `${variant.size} - ${variant.flavor}`,
      price: variant.price,
      quantity
    })
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    const newCart = [...cart]
    newCart[index].quantity = quantity
    setCart(newCart)
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + (item.variant.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      isLoaded,
      ensureCartProduct,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

// Analytics tracking helper
function trackEvent(eventName, params) {
  // Track to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }

  // Track to backend for custom analytics
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      params,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }).catch(err => console.error('Analytics tracking error:', err))
}

