import { NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'
import { adminAuthorized } from '@/lib/social/server'
import { validPostId } from '@/lib/social/config'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request) {
  if (!adminAuthorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}')
        const postId = String(payload.postId || '')
        const kind = String(payload.kind || '')
        if (!validPostId(postId)) throw new Error('A valid post ID is required')
        if (!['instagram', 'linkedin'].includes(kind)) throw new Error('Invalid media kind')
        if (!pathname.startsWith(`social/${postId}/${kind}-`)) throw new Error('Invalid upload pathname')
        return {
          allowedContentTypes: kind === 'instagram' ? ['image/jpeg'] : ['application/pdf'],
          maximumSizeInBytes: kind === 'instagram' ? 8 * 1024 * 1024 : 20 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ postId, kind })
        }
      }
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 400 })
  }
}
