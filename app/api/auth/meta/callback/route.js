import { NextResponse } from 'next/server'
import { connectMetaFromCode, oauthReturnUrl } from '@/lib/social/oauth'
import { consumeOAuthState } from '@/lib/social/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error_description') || url.searchParams.get('error')
  if (error) return NextResponse.redirect(oauthReturnUrl('meta', 'error', error))
  if (!code || !(await consumeOAuthState('meta', state))) {
    return NextResponse.redirect(oauthReturnUrl('meta', 'error', 'Invalid or expired authorization state'))
  }
  try {
    const connected = await connectMetaFromCode(code)
    return NextResponse.redirect(oauthReturnUrl('meta', 'success', `Connected @${connected.instagramUsername}`))
  } catch (caught) {
    return NextResponse.redirect(oauthReturnUrl('meta', 'error', String(caught?.message || caught)))
  }
}
