import { NextResponse } from 'next/server'
import { processDuePosts } from '@/lib/social/publishers'
import { sendDueApprovalRequests } from '@/lib/social/posts'
import { cronAuthorized } from '@/lib/social/server'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  if (!cronAuthorized(request)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { phase } = await params
  try {
    if (phase === 'approvals') {
      const results = await sendDueApprovalRequests()
      return NextResponse.json({ success: true, phase, results })
    }
    if (phase === 'linkedin' || phase === 'instagram') {
      const results = await processDuePosts({ platform: phase })
      return NextResponse.json({ success: true, phase, results })
    }
    return NextResponse.json({ success: false, error: 'Invalid phase' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 })
  }
}
