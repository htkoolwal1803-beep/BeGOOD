'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { upload as uploadBlob } from '@vercel/blob/client'
import Button from '@/components/Button'
import { adminFetch, getAdminKey, hasAdminKey, setAdminKey } from '@/lib/adminAuth'

const anchor = Date.parse('2026-08-19T00:00:00Z')

function nextScheduledDate() {
  const now = new Date()
  const ist = new Date(now.getTime() + 5.5 * 3600000)
  let candidate = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()))
  for (let i = 0; i < 4; i += 1) {
    const days = Math.round((candidate.getTime() - anchor) / 86400000)
    if (days >= 0 && days % 2 === 0) return candidate.toISOString().slice(0, 10)
    candidate = new Date(candidate.getTime() + 86400000)
  }
  return candidate.toISOString().slice(0, 10)
}

function makePostId(date, sequence) {
  return `BG-${String(date).replaceAll('-', '')}-${String(sequence || 1).padStart(2, '0')}`
}

function badgeClass(status) {
  if (status === 'published' || status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'needs_review' || status === 'expired') return 'bg-red-100 text-red-800'
  if (status === 'disabled') return 'bg-gray-200 text-gray-700'
  return 'bg-amber-100 text-amber-800'
}

export default function SocialPublishingAdmin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [data, setData] = useState({ posts: [], connections: [] })
  const [date, setDate] = useState(nextScheduledDate())
  const [sequence, setSequence] = useState(1)
  const [enabledPlatforms, setEnabledPlatforms] = useState({ linkedin: true, instagram: true })
  const [linkedinCaption, setLinkedinCaption] = useState('')
  const [instagramCaption, setInstagramCaption] = useState('')
  const [pdf, setPdf] = useState(null)
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const postId = useMemo(() => makePostId(date, sequence), [date, sequence])

  async function refresh() {
    const response = await adminFetch('/api/admin/social')
    if (response.status === 401) {
      setAuthenticated(false)
      return
    }
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
    setAuthenticated(true)
    setData(result)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const detail = params.get('detail')
    if (status) {
      setMessage(status === 'success' ? (detail || 'Connection completed.') : `Connection failed: ${detail || 'Unknown error'}`)
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (hasAdminKey()) refresh().catch((error) => setMessage(error.message))
  }, [])

  async function login(event) {
    event.preventDefault()
    setAdminKey(password)
    await refresh().catch((error) => setMessage(error.message))
  }

  async function upload(file, kind) {
    const safeName = String(file.name || 'asset').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-120)
    return uploadBlob(`social/${postId}/${kind}-${safeName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/social/media',
      headers: { 'x-admin-key': getAdminKey() },
      clientPayload: JSON.stringify({ postId, kind }),
      contentType: file.type,
      multipart: file.size > 10 * 1024 * 1024
    })
  }

  async function createPost(event) {
    event.preventDefault()
    if (!enabledPlatforms.linkedin && !enabledPlatforms.instagram) return setMessage('Enable at least one platform.')
    if (enabledPlatforms.linkedin && !pdf) return setMessage('Choose a LinkedIn PDF.')
    if (enabledPlatforms.instagram && images.length < 2) return setMessage('Choose at least two Instagram JPEG images.')
    setBusy('Uploading approved assets…')
    setMessage('')
    try {
      const document = enabledPlatforms.linkedin ? await upload(pdf, 'linkedin') : null
      const uploadedImages = []
      if (enabledPlatforms.instagram) {
        for (let index = 0; index < images.length; index += 1) {
          setBusy(`Uploading Instagram image ${index + 1} of ${images.length}…`)
          uploadedImages.push(await upload(images[index], 'instagram'))
        }
      }
      setBusy('Creating scheduled post…')
      const response = await adminFetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          post: {
            scheduledDate: date,
            sequence,
            enabledPlatforms: Object.entries(enabledPlatforms).filter(([, enabled]) => enabled).map(([platform]) => platform),
            linkedinCaption,
            linkedinDocumentUrl: document?.url,
            linkedinDocumentTitle: postId,
            instagramCaption,
            instagramImages: uploadedImages
          }
        })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      setMessage(`${postId} queued successfully.`)
      setLinkedinCaption('')
      setInstagramCaption('')
      setPdf(null)
      setImages([])
      setEnabledPlatforms({ linkedin: true, instagram: true })
      await refresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function action(actionName, post, platform = '') {
    setBusy(`${actionName} ${post.postId}…`)
    setMessage('')
    try {
      const response = await adminFetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, postId: post.postId, platform })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      setMessage(actionName === 'request_approval' ? 'Approval request sent to Slack.' : 'Retry queued.')
      await refresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function connect(platform) {
    setBusy(`Connecting ${platform}…`)
    try {
      const response = await adminFetch('/api/admin/social/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      window.location.assign(result.url)
    } catch (error) {
      setMessage(error.message)
      setBusy('')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] px-4 py-20">
        <form onSubmit={login} className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="font-playfair text-3xl font-bold">Social publishing</h1>
          <p className="mt-2 text-sm text-gray-600">Use the same password as the BeGood admin dashboard.</p>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6 w-full rounded-lg border p-3" required />
          <Button type="submit" className="mt-4 w-full">Sign in</Button>
          {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
        </form>
      </div>
    )
  }

  const connection = Object.fromEntries(data.connections.map((item) => [item.platform, item]))

  return (
    <div className="min-h-screen bg-[#f6f3eb] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-playfair text-4xl font-bold">Social publishing</h1>
            <p className="text-gray-600">Approval-gated LinkedIn and Instagram scheduling</p>
          </div>
          <Link href="/admin"><Button variant="outline">Back to admin</Button></Link>
        </div>

        {message && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">{message}</div>}
        {busy && <div className="rounded-xl bg-black p-4 text-sm text-white">{busy}</div>}

        <section className="grid gap-4 md:grid-cols-2">
          {['meta', 'linkedin'].map((platform) => (
            <div key={platform} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{platform === 'meta' ? 'Instagram / Meta' : 'LinkedIn'}</h2>
                  <p className="text-sm text-gray-600">
                    {connection[platform]
                      ? platform === 'meta'
                        ? `Connected @${connection[platform].instagramUsername}`
                        : `Connected ${connection[platform].organizationName || `organization ${connection[platform].organizationId}`}`
                      : 'OAuth connection required'}
                  </p>
                  {platform === 'linkedin' && connection[platform]?.organizationRole && (
                    <p className="mt-1 text-xs text-gray-500">Role verified: {connection[platform].organizationRole}</p>
                  )}
                </div>
                <Button onClick={() => connect(platform)} disabled={!!busy}>
                  {connection[platform] ? 'Reconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </section>

        <form onSubmit={createPost} className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Queue a post</h2>
          <p className="mt-1 text-sm text-gray-600">Images must be JPEG. Posts are restricted to the every-second-day schedule.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <fieldset className="md:col-span-2 rounded-xl border p-4">
              <legend className="px-2 text-sm font-semibold">Publishing platforms</legend>
              <div className="flex flex-wrap gap-6">
                {['linkedin', 'instagram'].map((platform) => (
                  <label key={platform} className="flex items-center gap-2 text-sm font-medium capitalize">
                    <input
                      type="checkbox"
                      checked={enabledPlatforms[platform]}
                      onChange={(event) => setEnabledPlatforms((current) => ({ ...current, [platform]: event.target.checked }))}
                    />
                    {platform}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">Disabled platforms are recorded as disabled and are never approved or published.</p>
            </fieldset>
            <label className="text-sm font-medium">Publishing date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-lg border p-3" required />
            </label>
            <label className="text-sm font-medium">Sequence
              <input type="number" min="1" max="99" value={sequence} onChange={(event) => setSequence(event.target.value)} className="mt-2 w-full rounded-lg border p-3" required />
            </label>
            <label className="text-sm font-medium md:col-span-2">Post ID
              <input value={postId} readOnly className="mt-2 w-full rounded-lg border bg-gray-50 p-3 font-mono" />
            </label>
            {enabledPlatforms.linkedin && (
              <>
                <label className="text-sm font-medium">LinkedIn caption
                  <textarea value={linkedinCaption} onChange={(event) => setLinkedinCaption(event.target.value)} className="mt-2 min-h-44 w-full rounded-lg border p-3" required />
                </label>
                <label className="text-sm font-medium">LinkedIn PDF
                  <input type="file" accept="application/pdf" onChange={(event) => setPdf(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" required />
                </label>
              </>
            )}
            {enabledPlatforms.instagram && (
              <>
                <label className="text-sm font-medium">Instagram caption
                  <textarea value={instagramCaption} onChange={(event) => setInstagramCaption(event.target.value)} className="mt-2 min-h-44 w-full rounded-lg border p-3" required />
                </label>
                <label className="text-sm font-medium">Instagram carousel JPEGs (2–10, selected in order)
                  <input type="file" accept="image/jpeg" multiple onChange={(event) => setImages(Array.from(event.target.files || []))} className="mt-2 block w-full text-sm" required />
                </label>
              </>
            )}
          </div>
          <Button type="submit" className="mt-6" disabled={!!busy}>Upload and queue</Button>
        </form>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Scheduled posts</h2>
          <div className="mt-5 space-y-4">
            {!data.posts.length && <p className="text-sm text-gray-600">No social posts queued yet.</p>}
            {data.posts.map((post) => (
              <article key={post.postId} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-mono font-semibold">{post.postId}</h3>
                    <p className="text-sm text-gray-600">{post.scheduledDate} · Approval: {post.approval?.status}</p>
                  </div>
                  {post.approval?.status === 'draft' && (
                    <Button onClick={() => action('request_approval', post)} disabled={!!busy}>Send to Slack</Button>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {['linkedin', 'instagram'].map((platform) => (
                    <div key={platform} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium">{platform}</span>
                        <span className={`rounded-full px-2 py-1 text-xs ${badgeClass(post.platforms?.[platform]?.status)}`}>
                          {post.platforms?.[platform]?.status}
                        </span>
                      </div>
                      {post.platforms?.[platform]?.error && <p className="mt-2 text-xs text-red-700">{post.platforms[platform].error}</p>}
                      {post.platforms?.[platform]?.status === 'needs_review' && (
                        <Button className="mt-3" size="sm" onClick={() => action('retry', post, platform)} disabled={!!busy}>Retry once</Button>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
