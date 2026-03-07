// Application constants

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 500, // Free shipping above ₹500
  SHIPPING_FEE: 50, // ₹50 shipping fee for orders below threshold
}

// Calculate shipping fee based on cart total
export function calculateShipping(cartTotal) {
  if (cartTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0
  }
  return SHIPPING_CONFIG.SHIPPING_FEE
}

// Calculate order total with shipping
export function calculateOrderTotal(cartTotal) {
  const shipping = calculateShipping(cartTotal)
  return cartTotal + shipping
}
