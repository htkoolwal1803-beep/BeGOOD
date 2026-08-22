import 'server-only'

import { put } from '@vercel/blob'
import JSZip from 'jszip'
import { isAlternateSocialDate, postIdFor, requiredEnv, validPostId } from './config'
import { createSocialPost, requestPostApproval } from './posts'
import { socialDb } from './server'

const MAX_PACK_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_PDF_BYTES = 20 * 1024 * 1024
const CONTENT_PILLARS = new Set(['emotions', 'brain-health', 'nutrition', 'begood', 'p-bar'])
const TRUSTED_SOURCE_DOMAINS = [
  'acog.org',
  'apa.org',
  'bmj.com',
  'cdc.gov',
  'cochranelibrary.com',
  'efsa.europa.eu',
  'fssai.gov.in',
  'icmr.gov.in',
  'jamanetwork.com',
  'mohfw.gov.in',
  'nature.com',
  'ncbi.nlm.nih.gov',
  'nejm.org',
  'nhs.uk',
  'nih.gov',
  'thelancet.com',
  'who.int',
  'begoodshop.in'
]

function cleanText(value, label, maxLength) {
  const text = String(value || '').trim()
  if (!text) throw new Error(`${label} is required`)
  if (text.length > maxLength) throw new Error(`${label} is too long`)
  return text
}

function cleanSource(value, index) {
  if (!value || typeof value !== 'object') throw new Error(`Source ${index + 1} is invalid`)
  let url
  try { url = new URL(String(value.url || '')) } catch { throw new Error(`Source ${index + 1} URL is invalid`) }
  if (url.protocol !== 'https:') throw new Error(`Source ${index + 1} must use HTTPS`)
  const hostname = url.hostname.toLowerCase()
  if (!TRUSTED_SOURCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
    throw new Error(`Source ${index + 1} is not on the approved scientific-source list`)
  }
  return {
    title: cleanText(value.title, `Source ${index + 1} title`, 240),
    organization: cleanText(value.organization, `Source ${index + 1} organization`, 120),
    url: url.toString()
  }
}

function parseManifest(raw) {
  let manifest
  try { manifest = JSON.parse(raw) } catch { throw new Error('manifest.json is not valid JSON') }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('manifest.json is invalid')
  if (Number(manifest.version) !== 1) throw new Error('Unsupported content-pack version')

  const scheduledDate = String(manifest.scheduledDate || '')
  const sequence = Math.max(1, Math.min(99, Number.parseInt(manifest.sequence, 10) || 1))
  const postId = postIdFor(scheduledDate, sequence)
  if (!validPostId(postId) || !isAlternateSocialDate(scheduledDate)) throw new Error('The content-pack date is not a BeGood publishing date')
  if (String(manifest.postId || '') !== postId) throw new Error(`manifest.json postId must be ${postId}`)

  const sources = Array.isArray(manifest.sources) ? manifest.sources.map(cleanSource) : []
  if (!sources.length) throw new Error('At least one reputable source is required')
  const pillar = cleanText(manifest.pillar, 'Content pillar', 80).toLowerCase()
  if (!CONTENT_PILLARS.has(pillar)) throw new Error('Content pillar is invalid')

  return {
    postId,
    scheduledDate,
    sequence,
    topic: cleanText(manifest.topic, 'Topic', 180),
    pillar,
    creativeStyle: cleanText(manifest.creativeStyle, 'Creative style', 160),
    instagramCaption: cleanText(manifest.instagramCaption, 'Instagram caption', 2200),
    linkedinCaption: String(manifest.linkedinCaption || '').trim().slice(0, 3000),
    scientificPost: Boolean(manifest.scientificPost),
    pBarPost: Boolean(manifest.pBarPost),
    sources
  }
}

function jpegDimensions(buffer) {
  if (buffer.length < 10 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])
  let offset = 2
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }
    while (buffer[offset] === 0xff) offset += 1
    const marker = buffer[offset]
    offset += 1
    if (marker === 0xd8 || marker === 0xd9) continue
    if (offset + 2 > buffer.length) return null
    const length = buffer.readUInt16BE(offset)
    if (length < 2 || offset + length > buffer.length) return null
    if (startOfFrame.has(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5)
      }
    }
    offset += length
  }
  return null
}

async function slackFile(fileId) {
  const token = requiredEnv('SLACK_BOT_TOKEN')
  const infoResponse = await fetch(`https://slack.com/api/files.info?file=${encodeURIComponent(fileId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  const info = await infoResponse.json().catch(() => ({}))
  if (!infoResponse.ok || !info.ok) throw new Error(`Slack files.info failed: ${info.error || infoResponse.statusText}`)
  const file = info.file || {}
  const downloadUrl = file.url_private_download || file.url_private
  if (!downloadUrl) throw new Error('Slack did not provide a content-pack download URL')
  if (Number(file.size || 0) > MAX_PACK_BYTES) throw new Error('The content-pack ZIP is larger than 20 MB')

  const download = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!download.ok) throw new Error(`Slack content-pack download failed: ${download.statusText}`)
  const buffer = Buffer.from(await download.arrayBuffer())
  if (!buffer.length || buffer.length > MAX_PACK_BYTES) throw new Error('The downloaded content-pack size is invalid')
  return { buffer, name: String(file.name || '') }
}

async function instagramAssets(zip) {
  const entries = Object.values(zip.files)
    .filter((entry) => !entry.dir && /^instagram\/slide-\d{2}\.jpe?g$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))
  if (entries.length < 2 || entries.length > 10) throw new Error('The content-pack must contain 2 to 10 Instagram JPEG slides')

  const results = []
  for (let index = 0; index < entries.length; index += 1) {
    const expected = `instagram/slide-${String(index + 1).padStart(2, '0')}.jpg`
    if (entries[index].name.toLowerCase() !== expected) throw new Error(`Expected ${expected}`)
    const buffer = await entries[index].async('nodebuffer')
    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error(`${expected} has an invalid file size`)
    const dimensions = jpegDimensions(buffer)
    if (!dimensions || dimensions.width !== 1080 || dimensions.height !== 1350) {
      throw new Error(`${expected} must be a 1080×1350 JPEG`)
    }
    results.push({ buffer, position: index + 1 })
  }
  return results
}

async function linkedinAsset(zip, postId) {
  const entry = zip.file(`linkedin/${postId}.pdf`) || zip.file('linkedin/post.pdf')
  if (!entry) return null
  const buffer = await entry.async('nodebuffer')
  if (!buffer.length || buffer.length > MAX_PDF_BYTES || buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('The LinkedIn PDF is invalid')
  }
  return buffer
}

async function uploadInstagram(postId, assets) {
  return Promise.all(assets.map(async ({ buffer, position }) => {
    const filename = `slide-${String(position).padStart(2, '0')}.jpg`
    const blob = await put(`social/${postId}/instagram-${filename}`, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: true
    })
    return { url: blob.url, position, contentType: 'image/jpeg' }
  }))
}

export async function ingestSlackContentPack(fileId) {
  const { buffer: pack, name } = await slackFile(fileId)
  if (!/^BG-\d{8}-\d{2}\.zip$/i.test(name)) throw new Error('The Slack file must be named BG-YYYYMMDD-NN.zip')

  const zip = await JSZip.loadAsync(pack, { checkCRC32: true })
  const manifestEntry = zip.file('manifest.json')
  if (!manifestEntry) throw new Error('The content-pack is missing manifest.json')
  const manifestText = await manifestEntry.async('string')
  if (Buffer.byteLength(manifestText) > 64 * 1024) throw new Error('manifest.json is too large')
  const manifest = parseManifest(manifestText)
  if (name.toUpperCase() !== `${manifest.postId}.ZIP`) throw new Error(`The ZIP filename must be ${manifest.postId}.zip`)

  const db = await socialDb()
  const existing = await db.collection('social_posts').findOne({ postId: manifest.postId })
  if (existing) {
    if (existing.approval?.status === 'draft') await requestPostApproval(manifest.postId)
    return { postId: manifest.postId, duplicate: true }
  }

  const [assets, linkedinPdf, connections] = await Promise.all([
    instagramAssets(zip),
    linkedinAsset(zip, manifest.postId),
    db.collection('social_oauth').find({ platform: { $in: ['meta', 'linkedin'] } }).project({ platform: 1 }).toArray()
  ])
  const connected = new Set(connections.map((item) => item.platform))
  if (!connected.has('meta')) throw new Error('Instagram is not connected')
  const includesLinkedIn = Boolean(linkedinPdf && manifest.linkedinCaption)
  if (includesLinkedIn && !connected.has('linkedin')) {
    throw new Error('LinkedIn is not connected. Connect it in Social Admin, then upload this content pack again.')
  }

  const instagramImages = await uploadInstagram(manifest.postId, assets)
  const enabledPlatforms = ['instagram']
  let linkedinDocumentUrl = ''
  if (includesLinkedIn) {
    const blob = await put(`social/${manifest.postId}/linkedin.pdf`, linkedinPdf, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true
    })
    linkedinDocumentUrl = blob.url
    enabledPlatforms.unshift('linkedin')
  }

  await createSocialPost({
    scheduledDate: manifest.scheduledDate,
    sequence: manifest.sequence,
    enabledPlatforms,
    instagramCaption: manifest.instagramCaption,
    instagramImages,
    linkedinCaption: manifest.linkedinCaption,
    linkedinDocumentUrl,
    linkedinDocumentTitle: manifest.postId
  })
  await db.collection('social_posts').updateOne(
    { postId: manifest.postId },
    {
      $set: {
        content: {
          generatedBy: 'chatgpt_automation',
          topic: manifest.topic,
          pillar: manifest.pillar,
          creativeStyle: manifest.creativeStyle,
          scientificPost: manifest.scientificPost,
          pBarPost: manifest.pBarPost,
          sources: manifest.sources
        },
        updatedAt: new Date()
      }
    }
  )
  await requestPostApproval(manifest.postId)
  return { postId: manifest.postId, enabledPlatforms }
}
