import 'server-only'

import {
  isAlternateSocialDate,
  platformExpiry,
  postIdFor,
  scheduledInstant,
  validPostId
} from './config'
import { socialDb } from './server'
import { sendApprovalRequest, sendSlackStatus } from './slack'

function cleanCaption(value, label, maxLength) {
  const caption = String(value || '').trim()
  if (!caption) throw new Error(`${label} caption is required`)
  if (caption.length > maxLength) throw new Error(`${label} caption is too long`)
  return caption
}

function cleanUrl(value, label) {
  let url
  try { url = new URL(String(value || '')) } catch { throw new Error(`${label} URL is invalid`) }
  if (url.protocol !== 'https:') throw new Error(`${label} must use HTTPS`)
  return url.toString()
}

export async function createSocialPost(input) {
  const scheduledDate = String(input.scheduledDate || '')
  if (!isAlternateSocialDate(scheduledDate)) {
    throw new Error('The date must follow the every-second-day schedule beginning 2026-08-19')
  }
  const sequence = Math.max(1, Math.min(99, Number.parseInt(input.sequence, 10) || 1))
  const postId = postIdFor(scheduledDate, sequence)
  const instagramImages = Array.isArray(input.instagramImages) ? input.instagramImages : []
  if (instagramImages.length < 2 || instagramImages.length > 10) {
    throw new Error('Instagram requires 2 to 10 carousel images')
  }
  const linkedinDocumentUrl = cleanUrl(input.linkedinDocumentUrl, 'LinkedIn document')
  const now = new Date()
  const documentTitle = String(input.linkedinDocumentTitle || postId).trim().slice(0, 200)

  const post = {
    postId,
    scheduledDate,
    sequence,
    timezone: 'Asia/Kolkata',
    platforms: {
      linkedin: {
        status: 'waiting_approval',
        scheduledAt: scheduledInstant(scheduledDate, 'linkedin'),
        expiresAt: platformExpiry(scheduledDate, 'linkedin'),
        caption: cleanCaption(input.linkedinCaption, 'LinkedIn', 3000),
        document: {
          url: linkedinDocumentUrl,
          title: documentTitle,
          contentType: 'application/pdf'
        }
      },
      instagram: {
        status: 'waiting_approval',
        scheduledAt: scheduledInstant(scheduledDate, 'instagram'),
        expiresAt: platformExpiry(scheduledDate, 'instagram'),
        caption: cleanCaption(input.instagramCaption, 'Instagram', 2200),
        images: instagramImages.map((item, index) => ({
          url: cleanUrl(item?.url || item, `Instagram image ${index + 1}`),
          position: index + 1,
          contentType: 'image/jpeg'
        }))
      }
    },
    approval: {
      status: 'draft',
      command: `APPROVE ${postId}`
    },
    createdAt: now,
    updatedAt: now
  }

  const db = await socialDb()
  try {
    await db.collection('social_posts').insertOne(post)
  } catch (error) {
    if (error?.code === 11000) throw new Error(`${postId} already exists`)
    throw error
  }
  return post
}

export async function listSocialPosts(limit = 30) {
  const db = await socialDb()
  return db.collection('social_posts')
    .find({})
    .sort({ scheduledDate: -1, sequence: -1 })
    .limit(Math.max(1, Math.min(100, limit)))
    .toArray()
}

export async function requestPostApproval(postId) {
  if (!validPostId(postId)) throw new Error('Invalid post ID')
  const db = await socialDb()
  const now = new Date()
  const post = await db.collection('social_posts').findOneAndUpdate(
    { postId, 'approval.status': 'draft' },
    { $set: { 'approval.status': 'sending', 'approval.sendingAt': now, updatedAt: now } },
    { returnDocument: 'after' }
  )
  if (!post) throw new Error('Post is not available for approval')

  try {
    const slack = await sendApprovalRequest(post)
    const requestedAt = new Date()
    await db.collection('social_posts').updateOne(
      { postId, 'approval.status': 'sending' },
      {
        $set: {
          'approval.status': 'pending',
          'approval.requestedAt': requestedAt,
          'approval.slackMessageTs': slack.ts,
          updatedAt: requestedAt
        },
        $unset: { 'approval.sendingAt': '' }
      }
    )
    return { postId, slackMessageTs: slack.ts }
  } catch (error) {
    await db.collection('social_posts').updateOne(
      { postId, 'approval.status': 'sending' },
      { $set: { 'approval.status': 'draft', 'approval.error': String(error?.message || error), updatedAt: new Date() }, $unset: { 'approval.sendingAt': '' } }
    )
    throw error
  }
}

export async function approvePost({ postId, userId, eventTs }) {
  if (!validPostId(postId)) return { approved: false, reason: 'invalid_post_id' }
  const db = await socialDb()
  const now = new Date()
  const post = await db.collection('social_posts').findOne({ postId })
  if (!post) return { approved: false, reason: 'not_found' }
  if (post.approval?.status === 'approved') return { approved: false, reason: 'already_approved' }
  if (post.approval?.status !== 'pending') return { approved: false, reason: 'not_pending' }

  const updates = {
    'approval.status': 'approved',
    'approval.approvedAt': now,
    'approval.approvedBy': userId,
    'approval.slackApprovalTs': eventTs,
    updatedAt: now
  }
  for (const platform of ['linkedin', 'instagram']) {
    const current = post.platforms?.[platform]
    updates[`platforms.${platform}.status`] = new Date(current.expiresAt) > now ? 'approved' : 'expired'
  }

  const result = await db.collection('social_posts').updateOne(
    { postId, 'approval.status': 'pending' },
    { $set: updates }
  )
  if (!result.modifiedCount) return { approved: false, reason: 'race_lost' }
  return { approved: true }
}

function currentIstDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.year}-${map.month}-${map.day}`
}

export async function sendDueApprovalRequests(now = new Date()) {
  const date = currentIstDate(now)
  const db = await socialDb()
  const posts = await db.collection('social_posts')
    .find({ scheduledDate: date, 'approval.status': 'draft' })
    .sort({ sequence: 1 })
    .limit(10)
    .toArray()
  const results = []
  for (const post of posts) {
    try {
      results.push({ postId: post.postId, ...(await requestPostApproval(post.postId)) })
    } catch (error) {
      results.push({ postId: post.postId, error: String(error?.message || error) })
    }
  }
  if (!posts.length && isAlternateSocialDate(date)) {
    await sendSlackStatus(`⚠️ No queued BeGood social post was found for ${date}. Nothing will publish automatically.`).catch(() => {})
  }
  return results
}
