// Application constants

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 600, // Free shipping for orders ₹600 and above
  SHIPPING_FEE: 60, // ₹60 shipping fee for orders below threshold
}

// COD (Cash on Delivery) Configuration
export const COD_CONFIG = {
  ENABLED: true,
  FEE: 50, // ₹50 extra for COD
}

// Subscription Configuration
export const SUBSCRIPTION_CONFIG = {
  PRICE_PER_BAR: 100, // ₹100 per bar for subscription
  MIN_BARS_PER_MONTH: 4, // Minimum 4 bars per month
  DURATION_MONTHS: 3, // 3 months subscription
  FREE_DELIVERY: true, // Free delivery for subscriptions
  CANCELLABLE: false, // Non-cancellable
}

// Calculate shipping fee based on cart total
export function calculateShipping(cartTotal, isSubscription = false) {
  // Free delivery for subscriptions
  if (isSubscription) {
    return 0
  }
  if (cartTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0
  }
  return SHIPPING_CONFIG.SHIPPING_FEE
}

// Calculate order total with shipping and optional COD fee
export function calculateOrderTotal(cartTotal, isCOD = false, isSubscription = false) {
  const shipping = calculateShipping(cartTotal, isSubscription)
  const codFee = isCOD ? COD_CONFIG.FEE : 0
  return cartTotal + shipping + codFee
}

