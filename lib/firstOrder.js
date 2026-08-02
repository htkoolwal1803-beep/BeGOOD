'use client'

import { SHIPPING_CONFIG } from './constants'

/**
 * Client-side "does this look like a first order?" heuristic.
 *
 * Display only. The real decision is made on the server at checkout by looking
 * up the phone number (/api/customers/:phone/first-order), so the worst this
 * can do is show an offer to someone who no longer qualifies - never grant a
 * discount that should not be granted.
 */
const RETURNING_KEY = 'begood_returning_visitor'

export function looksLikeFirstOrder() {
  try {
    return !localStorage.getItem(RETURNING_KEY)
  } catch {
    return false
  }
}

/** Called once an order is placed, so the first-order offer stops showing. */
export function markReturningVisitor() {
  try {
    localStorage.setItem(RETURNING_KEY, new Date().toISOString())
  } catch {}
}

/** Free-delivery threshold to display for this visitor. */
export function displayFreeShippingThreshold(isFirstOrder) {
  return isFirstOrder
    ? SHIPPING_CONFIG.FIRST_ORDER_FREE_SHIPPING_THRESHOLD
    : SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
}
