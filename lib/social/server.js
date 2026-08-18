import 'server-only'

import crypto from 'crypto'
import { MongoClient } from 'mongodb'
import { requiredEnv } from './config'

const cache = globalThis.__begoodSocialMongo || { client: null, db: null, indexesReady: false }
globalThis.__begoodSocialMongo = cache

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''))
  const b = Buffer.from(String(right || ''))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function adminAuthorized(request) {
  const expected = process.env.ADMIN_PASSWORD || ''
  return !!expected && safeEqual(request.headers.get('x-admin-key') || '', expected)
}

export function cronAuthorized(request) {
  const expected = process.env.CRON_SECRET || ''
  return !!expected && safeEqual(request.headers.get('authorization') || '', `Bearer ${expected}`)
}

async function ensureIndexes(db) {
  if (cache.indexesReady) return
  await Promise.all([
    db.collection('social_posts').createIndex({ postId: 1 }, { unique: true }),
    db.collection('social_posts').createIndex({ 'approval.status': 1, scheduledDate: 1 }),
    db.collection('social_oauth').createIndex({ platform: 1 }, { unique: true }),
    db.collection('social_oauth_states').createIndex({ state: 1 }, { unique: true }),
    db.collection('social_oauth_states').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('social_event_receipts').createIndex({ key: 1 }, { unique: true }),
    db.collection('social_event_receipts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ])
  cache.indexesReady = true
}

export async function socialDb() {
  if (cache.client && cache.db) {
    try {
      await cache.db.command({ ping: 1 })
      await ensureIndexes(cache.db)
      return cache.db
    } catch {
      cache.client = null
      cache.db = null
      cache.indexesReady = false
    }
  }

  const uri = process.env.MONGO_URL || process.env.MONGO_URI
  if (!uri) throw new Error('MongoDB is not configured')
  cache.client = await MongoClient.connect(uri)
  cache.db = cache.client.db()
  await ensureIndexes(cache.db)
  return cache.db
}

function encryptionKey() {
  const raw = requiredEnv('SOCIAL_TOKEN_ENCRYPTION_KEY')
  if (raw.length < 32) throw new Error('SOCIAL_TOKEN_ENCRYPTION_KEY must be at least 32 characters')
  return crypto.createHash('sha256').update(raw).digest()
}

export function encryptSecret(value) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decryptSecret(value) {
  const [iv, tag, encrypted] = String(value || '').split('.').map((part) => Buffer.from(part, 'base64url'))
  if (!iv || !tag || !encrypted) throw new Error('Stored credential is invalid')
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export async function saveConnection(platform, connection) {
  const db = await socialDb()
  const now = new Date()
  const stored = { ...connection }
  for (const field of ['accessToken', 'refreshToken', 'pageAccessToken']) {
    if (stored[field]) {
      stored[`${field}Encrypted`] = encryptSecret(stored[field])
      delete stored[field]
    }
  }
  await db.collection('social_oauth').updateOne(
    { platform },
    { $set: { platform, ...stored, connectedAt: now, updatedAt: now } },
    { upsert: true }
  )
}

export async function getConnection(platform) {
  const db = await socialDb()
  const stored = await db.collection('social_oauth').findOne({ platform })
  if (!stored) throw new Error(`${platform} is not connected`)
  const result = { ...stored }
  for (const field of ['accessToken', 'refreshToken', 'pageAccessToken']) {
    if (stored[`${field}Encrypted`]) result[field] = decryptSecret(stored[`${field}Encrypted`])
    delete result[`${field}Encrypted`]
  }
  return result
}

export async function createOAuthState(platform) {
  const db = await socialDb()
  const state = crypto.randomBytes(32).toString('base64url')
  const now = new Date()
  await db.collection('social_oauth_states').insertOne({
    state,
    platform,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000)
  })
  return state
}

export async function consumeOAuthState(platform, state) {
  const db = await socialDb()
  const result = await db.collection('social_oauth_states').findOneAndDelete({
    state: String(state || ''),
    platform,
    expiresAt: { $gt: new Date() }
  })
  return !!result
}

export async function recordEventOnce(key) {
  const db = await socialDb()
  try {
    await db.collection('social_event_receipts').insertOne({
      key,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 86400000)
    })
    return true
  } catch (error) {
    if (error?.code === 11000) return false
    throw error
  }
}
