import { NextResponse } from 'next/server'
import { connectLinkedInFromCode, oauthReturnUrl } from '@/lib/social/oauth'
import { consumeOAuthState } from '@/lib/social/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error_description') || url.searchParams.get('error')
  if (error) return NextResponse.redirect(oauthReturnUrl('linkedin', 'error', error))
  if (!code || !(await consumeOAuthState('linkedin', state))) {
    return NextResponse.redirect(oauthReturnUrl('linkedin', 'error', 'Invalid or expired authorization state'))
  }
  try {
    const connected = await connectLinkedInFromCode(code)
    return NextResponse.redirect(oauthReturnUrl('linkedin', 'success', `Connected ${connected.organizationName} (${connected.organizationId})`))
  } catch (caught) {
    return NextResponse.redirect(oauthReturnUrl('linkedin', 'error', String(caught?.message || caught)))
  }
}
