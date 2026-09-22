import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import {
  verifyWhatsAppChallenge,
  verifyWhatsAppWebhookSignature
} from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let cachedClient = null
let cachedDb = null

async function database() {
  if (cachedClient && cachedDb) return cachedDb
  const uri = process.env.MONGO_URL || process.env.MONGO_URI
  if (!uri) throw new Error('MongoDB is not configured')
  cachedClient = await MongoClient.connect(uri)
  cachedDb = cachedClient.db()
  return cachedDb
}

export async function GET(request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (!verifyWhatsAppChallenge({ mode, token })) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  return new NextResponse(challenge || '', { status: 200 })
}

function phoneRegex(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(-10)
  return digits.length === 10 ? new RegExp(`${digits}$`) : null
}

async function storeStatus(db, status) {
  const messageId = String(status?.id || '')
  if (!messageId) return
  const update = {
    status: status.status || 'unknown',
    statusTimestamp: status.timestamp || null,
    conversation: status.conversation || null,
    pricing: status.pricing || null,
    errors: status.errors || null,
    updatedAt: new Date().toISOString()
  }
  await db.collection('whatsapp_messages').updateOne(
    { messageId },
    { $set: update },
    { upsert: false }
  )
}

async function storeInboundMessage(db, message, contact) {
  if (!message?.id) return
  const text = String(message?.text?.body || '').trim()
  const now = new Date().toISOString()
  await db.collection('whatsapp_inbound').updateOne(
    { _id: `inbound:${message.id}` },
    {
      $setOnInsert: {
        _id: `inbound:${message.id}`,
        messageId: message.id,
        from: message.from || '',
        customerName: contact?.profile?.name || '',
        type: message.type || 'unknown',
        text,
        receivedAt: now
      }
    },
    { upsert: true }
  )

  // A one-word opt-out is honored across every order for this phone number.
  if (/^(stop|unsubscribe|cancel|opt[ -]?out)$/i.test(text)) {
    const matcher = phoneRegex(message.from)
    if (!matcher) return
    await Promise.all([
      db.collection('orders').updateMany(
        { phone: { $regex: matcher } },
        { $set: { whatsappOptIn: false, whatsappOptOutAt: now, whatsappOptOutSource: 'inbound_keyword' } }
      ),
      db.collection('users').updateMany(
        { phone: { $regex: matcher } },
        { $set: { whatsappOptIn: false, whatsappOptOutAt: now, whatsappOptOutSource: 'inbound_keyword' } }
      )
    ])
  }
}

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') || ''
  if (!verifyWhatsAppWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const db = await database()
  const jobs = []
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {}
      for (const status of value.statuses || []) jobs.push(storeStatus(db, status))
      const contactByWaId = new Map((value.contacts || []).map((c) => [c.wa_id, c]))
      for (const message of value.messages || []) {
        jobs.push(storeInboundMessage(db, message, contactByWaId.get(message.from)))
      }
    }
  }
  await Promise.all(jobs)
  return NextResponse.json({ success: true })
}

