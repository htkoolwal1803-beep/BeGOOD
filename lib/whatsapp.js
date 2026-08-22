import crypto from 'crypto'

/**
 * WhatsApp sending via Meta's Cloud API.
 *
 * Plain fetch, no SDK, so the project picks up no new dependencies - same
 * approach as lib/email.js.
 *
 * Two things make WhatsApp different from email, and both are enforced here:
 *
 * 1. Business-initiated messages must use a template that Meta has approved in
 *    advance. You cannot send free text. The wording below must match the
 *    approved template exactly, or the send is rejected.
 * 2. Category matters. "Utility" templates are tied to an existing order;
 *    "Marketing" templates require opt-in. Meta can change pricing and final
 *    categorisation, so the current values belong in WhatsApp Manager, not in
 *    application logic.
 *
 * Required env vars (Vercel):
 *   WHATSAPP_PHONE_NUMBER_ID  - from Meta > WhatsApp > API Setup
 *   WHATSAPP_ACCESS_TOKEN     - permanent system-user token
 *   WHATSAPP_API_VERSION      - optional, defaults to v26.0
 *   WHATSAPP_VERIFY_TOKEN     - a private value chosen for webhook verification
 *   META_APP_SECRET           - verifies that webhook payloads really came from Meta
 *
 * Missing config makes this a no-op that logs, so a half-finished setup can
 * never break an order or a cron run.
 */

function config() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    version: process.env.WHATSAPP_API_VERSION || 'v26.0',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.META_APP_SECRET
  }
}

export function isWhatsAppConfigured() {
  const c = config()
  return !!(c.phoneNumberId && c.token)
}

export function whatsAppConfigurationStatus() {
  const c = config()
  return {
    sending: !!(c.phoneNumberId && c.token),
    webhook: !!(c.verifyToken && c.appSecret),
    apiVersion: c.version
  }
}

export function verifyWhatsAppChallenge({ mode, token }) {
  const expected = config().verifyToken
  return !!expected && mode === 'subscribe' && token === expected
}

/** Verify Meta's x-hub-signature-256 before trusting a webhook payload. */
export function verifyWhatsAppWebhookSignature(rawBody, signature) {
  const secret = config().appSecret
  if (!secret || !signature?.startsWith('sha256=')) return false

  const supplied = signature.slice('sha256='.length)
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (supplied.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}

/**
 * Normalise an Indian mobile number to the digits-only form Meta expects.
 * Returns null when it does not look like a valid number.
 */
export function toWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  const last10 = digits.slice(-10)
  if (last10.length !== 10) return null
  // Indian mobiles start 6-9. Anything else is almost certainly bad data.
  if (!/^[6-9]/.test(last10)) return null
  return '91' + last10
}

/**
 * Send an approved template.
 *
 * @param {string} to        - any phone format; normalised internally
 * @param {string} template  - the approved template name
 * @param {string[]} params  - body variables, in order ({{1}}, {{2}}, ...)
 * @param {string[]} urlParams - variables for a dynamic button URL suffix
 */
export async function sendWhatsAppTemplate({ to, template, params = [], urlParams = [], language = 'en' }) {
  const { phoneNumberId, token, version } = config()

  if (!phoneNumberId || !token) {
    console.warn('[whatsapp] skipped - not configured:', template)
    return { ok: false, reason: 'not_configured' }
  }

  const number = toWhatsAppNumber(to)
  if (!number) return { ok: false, reason: 'invalid_number' }
  if (!template) return { ok: false, reason: 'no_template' }

  const components = []
  if (params.length) {
    components.push({
      type: 'body',
      parameters: params.map((p) => ({ type: 'text', text: String(p ?? '') }))
    })
  }
  if (urlParams.length) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: urlParams.map((p) => ({ type: 'text', text: String(p ?? '') }))
    })
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: number,
        type: 'template',
        template: {
          name: template,
          language: { code: language },
          ...(components.length ? { components } : {})
        }
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const err = data?.error?.message || `http_${res.status}`
      console.error(`[whatsapp] send failed (${template}): ${err}`)
      return { ok: false, reason: err, status: res.status }
    }

    return { ok: true, messageId: data?.messages?.[0]?.id || null }
  } catch (err) {
    console.error('[whatsapp] request failed:', err?.message || err)
    return { ok: false, reason: 'exception' }
  }
}
