/**
 * Transactional email via Brevo's REST API.
 *
 * Deliberately uses plain fetch rather than an SDK so the project picks up no
 * new dependencies. Brevo's free tier allows 300 emails/day (~9,000/month),
 * which is far beyond current order volume.
 *
 * Required env vars (set in Vercel):
 *   BREVO_API_KEY    - from Brevo > SMTP & API > API Keys
 *   EMAIL_FROM       - e.g. hello@begoodshop.in (domain must be verified)
 *   EMAIL_FROM_NAME  - e.g. BeGood
 *
 * If BREVO_API_KEY is missing this becomes a no-op that logs instead of
 * throwing, so a misconfigured environment can never break an order.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

/**
 * Site origin with any trailing slash removed.
 *
 * If NEXT_PUBLIC_SITE_URL is stored as "https://begoodshop.in/", joining it to
 * "/shop" produced "https://begoodshop.in//shop" - a URL that served a stale
 * cached page rather than the live one. Normalising here means every email link
 * points at the canonical address.
 */
export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://begoodshop.in'
  return String(raw).trim().replace(/\/+$/, '')
}

/** Join the site origin to a path without ever producing a double slash. */
export function siteLink(path = '') {
  const clean = String(path || '').trim()
  if (!clean) return siteUrl()
  return siteUrl() + '/' + clean.replace(/^\/+/, '')
}

export async function sendEmail({ to, toName, subject, html, replyTo }) {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM
  const fromName = process.env.EMAIL_FROM_NAME || 'BeGood'

  if (!apiKey || !from) {
    console.warn('[email] skipped - BREVO_API_KEY or EMAIL_FROM not configured:', subject)
    return { ok: false, reason: 'not_configured' }
  }
  if (!to) return { ok: false, reason: 'no_recipient' }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { email: from, name: fromName },
        to: [{ email: to, name: toName || undefined }],
        subject,
        htmlContent: html,
        replyTo: replyTo ? { email: replyTo } : undefined
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[email] Brevo ${res.status}: ${text}`)
      return { ok: false, reason: `http_${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    console.error('[email] send failed:', err?.message || err)
    return { ok: false, reason: 'exception' }
  }
}

/** Shared wrapper so every message looks like it came from the same brand. */
export function layout({ heading, body, ctaLabel, ctaUrl, footnote }) {
  const site = siteUrl()
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4ecdd;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4ecdd;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fbf7ed;border:1px solid #e6ddcd;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:24px 28px 8px;">
          <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:.5px;color:#5C3A21;">BeGood</p>
        </td></tr>
        <tr><td style="padding:4px 28px 0;">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#1f2229;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#464c49;">${body}</div>
        </td></tr>
        ${ctaUrl ? `<tr><td style="padding:20px 28px 4px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#6f8a74;color:#fbf7ed;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px;">${ctaLabel}</a>
        </td></tr>` : ''}
        <tr><td style="padding:20px 28px 26px;">
          ${footnote ? `<p style="margin:0 0 10px;font-size:12px;color:#8b938b;">${footnote}</p>` : ''}
          <p style="margin:0;font-size:12px;color:#8b938b;">
            <a href="${site}" style="color:#6f8a74;">begoodshop.in</a>
            &nbsp;·&nbsp; You're receiving this because you placed an order with us.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
