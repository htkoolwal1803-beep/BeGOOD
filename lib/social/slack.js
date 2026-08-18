import 'server-only'

import crypto from 'crypto'
import { formatIst, PLATFORM_SCHEDULES, requiredEnv } from './config'

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''))
  const b = Buffer.from(String(right || ''))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function verifySlackSignature(rawBody, timestamp, signature) {
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false
  const digest = crypto
    .createHmac('sha256', requiredEnv('SLACK_SIGNING_SECRET'))
    .update(`v0:${timestamp}:${rawBody}`)
    .digest('hex')
  return safeEqual(`v0=${digest}`, signature)
}

async function slackApi(method, payload) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requiredEnv('SLACK_BOT_TOKEN')}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) throw new Error(`Slack ${method} failed: ${data.error || response.statusText}`)
  return data
}

function truncate(value, max = 1200) {
  const text = String(value || '').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export async function sendApprovalRequest(post) {
  const linkedin = post.platforms.linkedin
  const instagram = post.platforms.instagram
  const assetLines = [
    linkedin?.document?.url ? `• LinkedIn PDF: ${linkedin.document.url}` : null,
    ...(instagram?.images || []).map((item, index) => `• Instagram ${index + 1}: ${item.url}`)
  ].filter(Boolean)

  return slackApi('chat.postMessage', {
    channel: requiredEnv('SLACK_CHANNEL_ID'),
    text: `Approval required for ${post.postId}. Reply exactly: ${post.approval.command}`,
    unfurl_links: false,
    unfurl_media: true,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `Approval required · ${post.postId}`, emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*LinkedIn*\n${formatIst(linkedin.scheduledAt)} (${PLATFORM_SCHEDULES.linkedin.label})` },
          { type: 'mrkdwn', text: `*Instagram*\n${formatIst(instagram.scheduledAt)} (${PLATFORM_SCHEDULES.instagram.label})` }
        ]
      },
      { type: 'section', text: { type: 'mrkdwn', text: `*LinkedIn caption*\n${truncate(linkedin.caption)}` } },
      { type: 'section', text: { type: 'mrkdwn', text: `*Instagram caption*\n${truncate(instagram.caption)}` } },
      { type: 'section', text: { type: 'mrkdwn', text: `*Assets*\n${assetLines.join('\n')}` } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `Only the designated approver can approve. Reply exactly:\n\`${post.approval.command}\`` }
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'If approved after a scheduled slot, that platform publishes immediately for up to 24 hours.' }]
      }
    ]
  })
}

export async function sendSlackStatus(text) {
  return slackApi('chat.postMessage', {
    channel: requiredEnv('SLACK_CHANNEL_ID'),
    text: String(text),
    unfurl_links: false
  })
}
