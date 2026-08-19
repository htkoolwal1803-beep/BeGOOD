import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { ingestSlackContentPack } from '@/lib/social/content-pack'
import { approvePost } from '@/lib/social/posts'
import { processDuePosts } from '@/lib/social/publishers'
import { recordEventOnce } from '@/lib/social/server'
import { sendSlackStatus, verifySlackSignature } from '@/lib/social/slack'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request) {
  const rawBody = await request.text()
  const timestamp = request.headers.get('x-slack-request-timestamp') || ''
  const signature = request.headers.get('x-slack-signature') || ''
  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let payload
  try { payload = JSON.parse(rawBody) } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  if (payload.type === 'url_verification') return NextResponse.json({ challenge: payload.challenge })
  if (payload.type !== 'event_callback') return NextResponse.json({ ok: true })

  const event = payload.event || {}
  if (event.type !== 'message' || event.bot_id) return NextResponse.json({ ok: true })
  if (event.channel !== process.env.SLACK_CHANNEL_ID || event.user !== process.env.SLACK_APPROVER_USER_ID) {
    return NextResponse.json({ ok: true })
  }

  if (event.subtype === 'file_share') {
    const pack = (event.files || []).find((file) => /^BG-\d{8}-\d{2}\.zip$/i.test(String(file.name || '')))
    if (!pack?.id) return NextResponse.json({ ok: true })
    if (!(await recordEventOnce(`slack-pack:${payload.event_id || event.client_msg_id || event.ts}`))) {
      return NextResponse.json({ ok: true })
    }
    waitUntil((async () => {
      try {
        const result = await ingestSlackContentPack(pack.id)
        if (result.duplicate) await sendSlackStatus(`ℹ️ ${result.postId} was already queued; its approval request has been restored if needed.`)
      } catch (error) {
        await sendSlackStatus(`⚠️ The automated BeGood content-pack was rejected. Nothing was queued. Error: ${String(error?.message || error)}`)
          .catch(() => {})
      }
    })())
    return NextResponse.json({ ok: true })
  }

  if (event.subtype) return NextResponse.json({ ok: true })
  const match = String(event.text || '').trim().match(/^APPROVE\s+(BG-\d{8}-\d{2})$/)
  if (!match) return NextResponse.json({ ok: true })
  if (!(await recordEventOnce(`slack:${payload.event_id || event.client_msg_id || event.ts}`))) {
    return NextResponse.json({ ok: true })
  }

  const result = await approvePost({ postId: match[1], userId: event.user, eventTs: event.ts })
  if (result.approved) {
    waitUntil((async () => {
      await sendSlackStatus(`✅ ${match[1]} approved by Hardik. Each enabled platform will publish at its designated time; missed slots publish immediately within 24 hours.`)
      await processDuePosts({ postId: match[1] })
    })())
  } else if (result.reason !== 'already_approved') {
    waitUntil(sendSlackStatus(`⚠️ ${match[1]} was not approved: ${result.reason.replaceAll('_', ' ')}.`))
  }
  return NextResponse.json({ ok: true })
}
