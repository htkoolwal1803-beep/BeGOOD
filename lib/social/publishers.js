import 'server-only'

import { getConnection, socialDb } from './server'
import { optionalEnv } from './config'
import { sendSlackStatus } from './slack'

const META_VERSION = optionalEnv('META_GRAPH_VERSION', 'v26.0')
const LINKEDIN_VERSION = optionalEnv('LINKEDIN_VERSION', '202608')

function errorMessage(error) {
  return String(error?.message || error || 'Unknown publishing error').slice(0, 1200)
}

async function responseJson(response, label) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data?.error) {
    const detail = data?.error?.message || data?.message || response.statusText
    throw new Error(`${label}: ${detail}`)
  }
  return data
}

async function metaPost(path, token, values) {
  const body = new URLSearchParams({ ...values, access_token: token })
  return responseJson(
    await fetch(`https://graph.facebook.com/${META_VERSION}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store'
    }),
    'Instagram API request failed'
  )
}

async function publishInstagram(post) {
  const connection = await getConnection('meta')
  const token = connection.pageAccessToken
  const igUserId = connection.instagramUserId
  const images = post.platforms.instagram.images || []
  if (images.length < 2 || images.length > 10) throw new Error('Instagram carousel must contain 2 to 10 JPEG images')

  const childIds = []
  for (const image of images) {
    const child = await metaPost(`${igUserId}/media`, token, {
      image_url: image.url,
      is_carousel_item: 'true'
    })
    childIds.push(child.id)
  }

  const carousel = await metaPost(`${igUserId}/media`, token, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: post.platforms.instagram.caption
  })
  const published = await metaPost(`${igUserId}/media_publish`, token, { creation_id: carousel.id })
  return { id: published.id, containerId: carousel.id }
}

async function linkedInRequest(path, token, options = {}) {
  const response = await fetch(`https://api.linkedin.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': LINKEDIN_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...(options.headers || {})
    },
    cache: 'no-store'
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText)
    throw new Error(`LinkedIn API request failed (${response.status}): ${detail.slice(0, 700)}`)
  }
  return response
}

async function publishLinkedIn(post) {
  const connection = await getConnection('linkedin')
  const token = connection.accessToken
  if (connection.expiresAt && new Date(connection.expiresAt) <= new Date()) {
    throw new Error('LinkedIn authorization has expired. Reconnect LinkedIn in Social Admin.')
  }
  const organizationId = String(connection.organizationId || '').trim()
  if (!/^\d+$/.test(organizationId)) throw new Error('The LinkedIn connection has no valid organization ID. Reconnect LinkedIn.')
  const owner = `urn:li:organization:${organizationId}`
  const document = post.platforms.linkedin.document
  if (!document?.url) throw new Error('LinkedIn PDF is missing')

  const initialize = await linkedInRequest('/rest/documents?action=initializeUpload', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initializeUploadRequest: { owner } })
  })
  const initialized = await initialize.json()
  const uploadUrl = initialized?.value?.uploadUrl
  const documentUrn = initialized?.value?.document
  if (!uploadUrl || !documentUrn) throw new Error('LinkedIn did not return a document upload URL')

  const source = await fetch(document.url, { cache: 'no-store' })
  if (!source.ok) throw new Error(`Could not download the LinkedIn PDF (${source.status})`)
  const bytes = await source.arrayBuffer()
  const upload = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/pdf'
    },
    body: bytes
  })
  if (!upload.ok) throw new Error(`LinkedIn document upload failed (${upload.status})`)

  let documentStatus = ''
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const statusResponse = await linkedInRequest(`/rest/documents/${encodeURIComponent(documentUrn)}`, token)
    const status = await statusResponse.json()
    documentStatus = String(status.status || '')
    if (documentStatus === 'AVAILABLE') break
    if (documentStatus === 'PROCESSING_FAILED') throw new Error('LinkedIn could not process the uploaded PDF')
    await new Promise((resolve) => setTimeout(resolve, 750))
  }
  if (documentStatus !== 'AVAILABLE') throw new Error('LinkedIn PDF is still processing; retry this platform once in Social Admin')

  const response = await linkedInRequest('/rest/posts', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: owner,
      commentary: post.platforms.linkedin.caption,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: {
        media: {
          title: document.title || post.postId,
          id: documentUrn
        }
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    })
  })
  return { id: response.headers.get('x-restli-id'), documentUrn }
}

async function claimPlatform(postId, platform, now) {
  const db = await socialDb()
  const key = `platforms.${platform}`
  const claimed = await db.collection('social_posts').findOneAndUpdate(
    {
      postId,
      'approval.status': 'approved',
      [`${key}.status`]: 'approved',
      [`${key}.scheduledAt`]: { $lte: now },
      [`${key}.expiresAt`]: { $gt: now }
    },
    {
      $set: {
        [`${key}.status`]: 'publishing',
        [`${key}.publishingStartedAt`]: now,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  )
  return claimed
}

export async function publishPostPlatform(postId, platform, now = new Date()) {
  const post = await claimPlatform(postId, platform, now)
  if (!post) return { skipped: true }
  const db = await socialDb()
  const key = `platforms.${platform}`
  try {
    const remote = platform === 'instagram' ? await publishInstagram(post) : await publishLinkedIn(post)
    const completedAt = new Date()
    await db.collection('social_posts').updateOne(
      { postId, [`${key}.status`]: 'publishing' },
      {
        $set: {
          [`${key}.status`]: 'published',
          [`${key}.publishedAt`]: completedAt,
          [`${key}.remote`]: remote,
          updatedAt: completedAt
        },
        $unset: { [`${key}.error`]: '' }
      }
    )
    await sendSlackStatus(`✅ ${postId} published on ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} successfully.`)
    return { published: true, remote }
  } catch (error) {
    const failedAt = new Date()
    const message = errorMessage(error)
    await db.collection('social_posts').updateOne(
      { postId, [`${key}.status`]: 'publishing' },
      {
        $set: {
          [`${key}.status`]: 'needs_review',
          [`${key}.failedAt`]: failedAt,
          [`${key}.error`]: message,
          updatedAt: failedAt
        }
      }
    )
    await sendSlackStatus(`⚠️ ${postId} was not confirmed on ${platform}. Automatic retry is paused to prevent duplicate posts. Error: ${message}`)
      .catch(() => {})
    return { published: false, error: message }
  }
}

export async function expireOldPlatforms(now = new Date()) {
  const db = await socialDb()
  for (const platform of ['linkedin', 'instagram']) {
    const key = `platforms.${platform}`
    await db.collection('social_posts').updateMany(
      { [`${key}.status`]: { $in: ['waiting_approval', 'approved'] }, [`${key}.expiresAt`]: { $lte: now } },
      { $set: { [`${key}.status`]: 'expired', updatedAt: now } }
    )
  }
}

export async function processDuePosts({ postId = null, platform = null, now = new Date() } = {}) {
  const db = await socialDb()
  await expireOldPlatforms(now)
  const platforms = platform ? [platform] : ['linkedin', 'instagram']
  const results = []
  for (const name of platforms) {
    const key = `platforms.${name}`
    const query = {
      ...(postId ? { postId } : {}),
      'approval.status': 'approved',
      [`${key}.status`]: 'approved',
      [`${key}.scheduledAt`]: { $lte: now },
      [`${key}.expiresAt`]: { $gt: now }
    }
    const posts = await db.collection('social_posts').find(query).sort({ [`${key}.scheduledAt`]: 1 }).limit(10).toArray()
    for (const post of posts) {
      results.push({ postId: post.postId, platform: name, ...(await publishPostPlatform(post.postId, name, now)) })
    }
  }
  return results
}

export async function retryPlatform(postId, platform) {
  if (!['linkedin', 'instagram'].includes(platform)) throw new Error('Invalid platform')
  const db = await socialDb()
  const key = `platforms.${platform}`
  const result = await db.collection('social_posts').updateOne(
    { postId, [`${key}.status`]: 'needs_review', [`${key}.remote.id`]: { $exists: false } },
    { $set: { [`${key}.status`]: 'approved', updatedAt: new Date() }, $unset: { [`${key}.error`]: '' } }
  )
  if (!result.modifiedCount) throw new Error('This platform cannot be retried automatically')
  return processDuePosts({ postId, platform })
}
