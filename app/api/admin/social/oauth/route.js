import { NextResponse } from 'next/server'
import { linkedinAuthorizationUrl, metaAuthorizationUrl } from '@/lib/social/oauth'
import { adminAuthorized, createOAuthState } from '@/lib/social/server'

export const runtime = 'nodejs'

export async function POST(request) {
  if (!adminAuthorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const platform = String(body.platform || '')
  if (!['meta', 'linkedin'].includes(platform)) {
    return NextResponse.json({ success: false, error: 'Invalid platform' }, { status: 400 })
  }
  try {
    const state = await createOAuthState(platform)
    const url = platform === 'meta' ? metaAuthorizationUrl(state) : linkedinAuthorizationUrl(state)
    return NextResponse.json({ success: true, url })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 })
  }
}
