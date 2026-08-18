import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { createSocialPost, listSocialPosts, requestPostApproval } from '@/lib/social/posts'
import { retryPlatform } from '@/lib/social/publishers'
import { adminAuthorized, socialDb } from '@/lib/social/server'

export const runtime = 'nodejs'
export const maxDuration = 60

function denied() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request) {
  if (!adminAuthorized(request)) return denied()
  try {
    const db = await socialDb()
    const [posts, connections] = await Promise.all([
      listSocialPosts(),
      db.collection('social_oauth').find({}).project({
        platform: 1,
        connectedAt: 1,
        updatedAt: 1,
        expiresAt: 1,
        instagramUsername: 1,
        pageName: 1,
        organizationId: 1
      }).toArray()
    ])
    return NextResponse.json({ success: true, posts, connections })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 })
  }
}

export async function POST(request) {
  if (!adminAuthorized(request)) return denied()
  const body = await request.json().catch(() => ({}))
  try {
    if (body.action === 'create') {
      const post = await createSocialPost(body.post || {})
      return NextResponse.json({ success: true, post })
    }
    if (body.action === 'request_approval') {
      const result = await requestPostApproval(String(body.postId || ''))
      return NextResponse.json({ success: true, result })
    }
    if (body.action === 'retry') {
      waitUntil(retryPlatform(String(body.postId || ''), String(body.platform || '')))
      return NextResponse.json({ success: true, queued: true })
    }
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 400 })
  }
}
