// Application constants

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 600, // Free shipping for orders ₹600 and above
  // First-time buyers get free delivery from a much lower basket. Delivery on a
  // ₹125 bar is a ~48% surcharge, which is the single biggest reason a curious
  // first-time visitor abandons. This removes that barrier for the first order
  // only; repeat customers keep the ₹600 threshold.
  FIRST_ORDER_FREE_SHIPPING_THRESHOLD: 249,
  SHIPPING_FEE: 60, // ₹60 shipping fee for orders below threshold
}

/** Threshold that applies to this customer. */
export function freeShippingThreshold(isFirstOrder = false) {
  return isFirstOrder
    ? SHIPPING_CONFIG.FIRST_ORDER_FREE_SHIPPING_THRESHOLD
    : SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
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
export function calculateShipping(cartTotal, isSubscription = false, isFirstOrder = false) {
  // Free delivery for subscriptions
  if (isSubscription) {
    return 0
  }
  if (cartTotal >= freeShippingThreshold(isFirstOrder)) {
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


// Distance-based delivery options (Rakhi hampers & local delivery)
export const DELIVERY_OPTIONS = [
  { id: 'pickup',  label: 'Self Pickup',           description: 'Collect from our store in Ambabari, Jaipur (302039)', fee: 0 },
  { id: 'within5', label: 'Delivery within 5 km',  description: 'Free local delivery',                        fee: 0 },
  { id: 'r5to8',   label: 'Delivery 5–8 km',       description: 'Flat delivery charge',                       fee: 60 },
  { id: 'beyond8', label: 'Delivery beyond 8 km',  description: 'Delivery charge',                            fee: 120 },
]

export function getDeliveryFee(methodId) {
  const opt = DELIVERY_OPTIONS.find(o => o.id === methodId)
  return opt ? opt.fee : 0
}

/**
 * Delivery actually charged at checkout.
 *
 * Checkout prices delivery by distance, but the cart promises free delivery
 * over a basket threshold. Previously those two disagreed and the customer was
 * charged despite the promise. The basket threshold now wins:
 *   - first order  : free from ₹249
 *   - repeat order : free from ₹600
 * otherwise the distance band applies.
 */
export function resolveDeliveryFee({ cartTotal, methodId, isPickup = false, isFirstOrder = false }) {
  if (isPickup) return 0
  if (cartTotal >= freeShippingThreshold(isFirstOrder)) return 0
  return getDeliveryFee(methodId)
}

export function getDeliveryLabel(methodId) {
  const opt = DELIVERY_OPTIONS.find(o => o.id === methodId)
  return opt ? opt.label : ''
}
