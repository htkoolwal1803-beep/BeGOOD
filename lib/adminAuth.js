'use client'

/**
 * Admin API auth for the browser.
 *
 * The server now requires the admin password on every /api/admin/* request
 * (see requireAdmin in the API route). This keeps the password for the tab
 * session and attaches it to admin calls.
 *
 * sessionStorage rather than localStorage: it clears when the tab closes, so a
 * shared or public machine does not keep the key around.
 */
const KEY = 'begood_admin_key'

export function setAdminKey(value) {
  try { sessionStorage.setItem(KEY, value || '') } catch {}
}

export function getAdminKey() {
  try { return sessionStorage.getItem(KEY) || '' } catch { return '' }
}

export function clearAdminKey() {
  try { sessionStorage.removeItem(KEY) } catch {}
}

/** fetch() for admin endpoints, with the key attached. */
export function adminFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), 'x-admin-key': getAdminKey() }
  })
}
