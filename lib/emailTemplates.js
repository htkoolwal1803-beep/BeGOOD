/**
 * Retention email templates.
 *
 * Defaults live here in code; edits made in Admin → Retention are saved to the
 * `email_templates` collection and take precedence. Keeping the defaults in
 * code means a bad edit can always be reset, and a fresh install works with no
 * database rows at all.
 *
 * Placeholders available in subject, heading and body:
 *   {{name}}  - customer's first name, or "there" if unknown
 *   {{site}}  - https://begoodshop.in
 */

export const TEMPLATE_KEYS = ['usage', 'reviewRequest', 'replenishment']

export const DEFAULT_TEMPLATES = {
  usage: {
    key: 'usage',
    label: 'Day 3 — how to use it',
    description: 'Sent 3 days after an order. Sets the timing expectation so the product actually works for them.',
    subject: 'Getting the most out of your A-Bar',
    heading: 'One thing worth knowing',
    body: [
      'Hi {{name}},',
      'A-Bar is designed to act in <strong>less than 20 minutes</strong>. Enjoy it shortly before the moment that matters.',
      "That's when L-Theanine has reached your system, so you feel settled going in rather than halfway through.",
      "No pills, no powder. Just eat it like chocolate, a little earlier than you'd think."
    ].join('\n'),
    ctaLabel: 'Read how it works',
    ctaPath: '/how-it-works',
    footnote: '',
    // Utility category: tied to an existing order. WhatsApp opt-in is still
    // required by policy; category only describes the template's purpose.
    waTemplate: 'abar_usage_tip',
    waCategory: 'utility',
    // Care, not selling. A plain note reads that way to the reader and to Gmail.
    layoutStyle: 'plain'
  },
  reviewRequest: {
    key: 'reviewRequest',
    label: 'Day 7 — review request + ₹20',
    description: 'Sent 7 days after an order. The review link is added automatically as the button.',
    subject: 'How did it go? (₹20 off for telling us)',
    heading: 'Did it help?',
    body: [
      'Hi {{name}},',
      "You ordered from us about a week ago. We'd like to know how it actually went — good or bad, we want the honest version.",
      "It takes about thirty seconds, and we'll send you <strong>₹20 off your next order</strong> either way."
    ].join('\n'),
    ctaLabel: 'Leave a review',
    ctaPath: '',
    footnote: 'The ₹20 is for writing a review, not for a good one. Please say what you actually thought.',
    // Marketing category because of the ₹20 incentive; needs opt-in.
    waTemplate: 'abar_review_request',
    waCategory: 'marketing',
    // A personal ask. Worth fighting for the main inbox, so no big button.
    layoutStyle: 'plain'
  },
  replenishment: {
    key: 'replenishment',
    label: 'Day 25 — running low',
    description: 'Sent 25 days after an order, and skipped automatically if they have already reordered.',
    subject: 'Running low?',
    heading: 'Running low?',
    body: [
      'Hi {{name}},',
      "You picked up A-Bar about a month ago. If it did its job, there's probably something coming up that deserves one — an exam, an interview, a day you'd rather walk into calmly.",
      'Reordering takes one tap.'
    ].join('\n'),
    ctaLabel: 'Reorder',
    ctaPath: '/shop',
    footnote: 'Free delivery on orders over ₹600.',
    waTemplate: 'abar_reorder_reminder',
    waCategory: 'marketing',
    // Genuinely promotional. Keeps the button; Promotions is the honest place
    // for it, and people do buy from there.
    layoutStyle: 'promo'
  }
}

/** Merge a saved row over the default, so a partial edit never blanks a field. */
export function mergeTemplate(key, saved) {
  const base = DEFAULT_TEMPLATES[key]
  if (!base) return null
  if (!saved) return { ...base }
  return {
    ...base,
    subject: saved.subject ?? base.subject,
    heading: saved.heading ?? base.heading,
    body: saved.body ?? base.body,
    ctaLabel: saved.ctaLabel ?? base.ctaLabel,
    footnote: saved.footnote ?? base.footnote
  }
}

/** Replace {{name}} and {{site}}. */
export function fillTemplate(text, vars) {
  return String(text || '')
    .replace(/\{\{\s*name\s*\}\}/g, vars.name || 'there')
    .replace(/\{\{\s*site\s*\}\}/g, vars.site || '')
}

/**
 * WhatsApp body text for a template.
 *
 * Meta approves a fixed wording with numbered variables, so what is sent is the
 * approved template - not this text. This is the plain-text equivalent, used to
 * work out the variables and to show in the admin preview.
 */
export function whatsappBody(template, vars) {
  return String(template?.body || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => fillTemplate(l, vars).replace(/<[^>]+>/g, ''))
    .join('\n\n')
}

/** Body is stored as plain lines; render as paragraphs. */
export function bodyToHtml(body, vars) {
  return String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${fillTemplate(line, vars)}</p>`)
    .join('\n')
}
