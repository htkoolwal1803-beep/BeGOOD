import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { requiredEnv, siteUrl } from '@/lib/social/config'
import { socialDb } from '@/lib/social/server'

export const runtime = 'nodejs'

function decodeSignedRequest(value) {
  const [encodedSignature, encodedPayload] = String(value || '').split('.')
  if (!encodedSignature || !encodedPayload) throw new Error('Invalid signed request')
  const expected = crypto.createHmac('sha256', requiredEnv('META_APP_SECRET')).update(encodedPayload).digest()
  const received = Buffer.from(encodedSignature, 'base64url')
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new Error('Invalid signed request signature')
  }
  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
}

export async function POST(request) {
  try {
    const form = await request.formData()
    const payload = decodeSignedRequest(form.get('signed_request'))
    if (!payload.user_id) throw new Error('Meta user ID is missing')
    const db = await socialDb()
    await db.collection('social_oauth').deleteOne({ platform: 'meta', metaUserId: String(payload.user_id) })
    const confirmationCode = crypto.randomBytes(12).toString('hex')
    await db.collection('social_data_deletions').insertOne({
      platform: 'meta',
      metaUserId: String(payload.user_id),
      confirmationCode,
      completedAt: new Date()
    })
    return NextResponse.json({
      url: `${siteUrl()}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    })
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 400 })
  }
}
