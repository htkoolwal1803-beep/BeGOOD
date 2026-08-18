export const SOCIAL_TIMEZONE = 'Asia/Kolkata'
export const SOCIAL_SCHEDULE_START_DATE = process.env.SOCIAL_SCHEDULE_START_DATE || '2026-08-19'
export const APPROVAL_WINDOW_MS = 24 * 60 * 60 * 1000
export const APPROVAL_LEAD_MS = 5 * 60 * 60 * 1000

export const PLATFORM_SCHEDULES = {
  linkedin: { time: '12:30:00', label: '12:30 PM IST' },
  instagram: { time: '19:30:00', label: '7:30 PM IST' }
}

export function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function optionalEnv(name, fallback = '') {
  return process.env[name] || fallback
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://begoodshop.in').replace(/\/$/, '')
}

export function scheduledInstant(date, platform) {
  const schedule = PLATFORM_SCHEDULES[platform]
  if (!schedule || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid social schedule')
  }
  return new Date(`${date}T${schedule.time}+05:30`)
}

export function platformExpiry(date, platform) {
  return new Date(scheduledInstant(date, platform).getTime() + APPROVAL_WINDOW_MS)
}

export function isAlternateSocialDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const anchor = Date.parse(`${SOCIAL_SCHEDULE_START_DATE}T00:00:00Z`)
  const candidate = Date.parse(`${date}T00:00:00Z`)
  if (!Number.isFinite(anchor) || !Number.isFinite(candidate)) return false
  const days = Math.round((candidate - anchor) / 86400000)
  return days >= 0 && days % 2 === 0
}

export function formatIst(instant) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: SOCIAL_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(instant))
}

export function postIdFor(date, sequence = 1) {
  const compact = String(date).replaceAll('-', '')
  return `BG-${compact}-${String(sequence).padStart(2, '0')}`
}

export function validPostId(value) {
  return /^BG-\d{8}-\d{2}$/.test(String(value || ''))
}
