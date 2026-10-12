import 'server-only'

import { optionalEnv, requiredEnv, siteUrl } from './config'
import { saveConnection } from './server'

const META_VERSION = optionalEnv('META_GRAPH_VERSION', 'v26.0')
const LINKEDIN_VERSION = optionalEnv('LINKEDIN_VERSION', '202608')

async function jsonOrThrow(response, label) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data?.error) {
    const detail = data?.error?.message || data?.error_description || data?.message || response.statusText
    throw new Error(`${label}: ${detail}`)
  }
  return data
}

export function metaAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: requiredEnv('META_APP_ID'),
    redirect_uri: requiredEnv('META_REDIRECT_URI'),
    state,
    response_type: 'code',
    override_default_response_type: 'true',
    config_id: requiredEnv('META_LOGIN_CONFIG_ID')
  })
  return `https://www.facebook.com/${META_VERSION}/dialog/oauth?${params}`
}

export async function connectMetaFromCode(code) {
  const clientId = requiredEnv('META_APP_ID')
  const clientSecret = requiredEnv('META_APP_SECRET')
  const redirectUri = requiredEnv('META_REDIRECT_URI')
  const expectedUsername = optionalEnv('INSTAGRAM_USERNAME', 'be_good_hat').replace(/^@/, '')

  const shortParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code
  })
  const short = await jsonOrThrow(
    await fetch(`https://graph.facebook.com/${META_VERSION}/oauth/access_token?${shortParams}`, { cache: 'no-store' }),
    'Meta token exchange failed'
  )

  const longParams = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: short.access_token
  })
  const long = await jsonOrThrow(
    await fetch(`https://graph.facebook.com/${META_VERSION}/oauth/access_token?${longParams}`, { cache: 'no-store' }),
    'Meta long-lived token exchange failed'
  )

  const accountParams = new URLSearchParams({
    fields: 'id,name,access_token,instagram_business_account{id,username}',
    access_token: long.access_token
  })
  const accounts = await jsonOrThrow(
    await fetch(`https://graph.facebook.com/${META_VERSION}/me/accounts?${accountParams}`, { cache: 'no-store' }),
    'Meta Page lookup failed'
  )
  const profileParams = new URLSearchParams({ fields: 'id,name', access_token: long.access_token })
  const profile = await jsonOrThrow(
    await fetch(`https://graph.facebook.com/${META_VERSION}/me?${profileParams}`, { cache: 'no-store' }),
    'Meta profile lookup failed'
  )

  const page = (accounts.data || []).find((entry) =>
    entry.instagram_business_account?.username?.toLowerCase() === expectedUsername.toLowerCase()
  )
  if (!page?.instagram_business_account?.id || !page.access_token) {
    throw new Error(`The connected Facebook account does not expose @${expectedUsername}. Confirm Page access and Instagram linking.`)
  }

  const expiresAt = long.expires_in ? new Date(Date.now() + Number(long.expires_in) * 1000) : null
  await saveConnection('meta', {
    pageId: page.id,
    pageName: page.name,
    metaUserId: profile.id,
    metaUserName: profile.name,
    instagramUserId: page.instagram_business_account.id,
    instagramUsername: page.instagram_business_account.username,
    pageAccessToken: page.access_token,
    expiresAt,
    graphVersion: META_VERSION
  })

  return { pageName: page.name, instagramUsername: page.instagram_business_account.username }
}

export function linkedinAuthorizationUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: requiredEnv('LINKEDIN_CLIENT_ID'),
    redirect_uri: requiredEnv('LINKEDIN_REDIRECT_URI'),
    state,
    scope: optionalEnv('LINKEDIN_SCOPES', 'w_organization_social')
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function connectLinkedInFromCode(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: requiredEnv('LINKEDIN_CLIENT_ID'),
    client_secret: requiredEnv('LINKEDIN_CLIENT_SECRET'),
    redirect_uri: requiredEnv('LINKEDIN_REDIRECT_URI')
  })
  const token = await jsonOrThrow(
    await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store'
    }),
    'LinkedIn token exchange failed'
  )

  const organizationId = requiredEnv('LINKEDIN_ORGANIZATION_ID').replace(/^urn:li:organization:/, '').trim()
  if (!/^\d+$/.test(organizationId)) throw new Error('LINKEDIN_ORGANIZATION_ID must contain the numeric BeGood Page ID')
  const organizationName = optionalEnv('LINKEDIN_ORGANIZATION_NAME', 'BeGood')

  await saveConnection('linkedin', {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null,
    refreshTokenExpiresAt: token.refresh_token_expires_in
      ? new Date(Date.now() + Number(token.refresh_token_expires_in) * 1000)
      : null,
    organizationId,
    organizationName,
    authorizedScopes: String(token.scope || optionalEnv('LINKEDIN_SCOPES', 'w_organization_social')),
    apiVersion: LINKEDIN_VERSION
  })

  return { organizationId, organizationName }
}

export function oauthReturnUrl(platform, status, detail = '') {
  const params = new URLSearchParams({ connected: platform, status })
  if (detail) params.set('detail', detail.slice(0, 180))
  return `${siteUrl()}/admin/social?${params}`
}
