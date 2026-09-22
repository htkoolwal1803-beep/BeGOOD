import {
  isWhatsAppConfigured,
  sendWhatsAppTemplate,
  toWhatsAppNumber
} from '@/lib/whatsapp'

const template = (envName, fallback) => process.env[envName] || fallback

export const WHATSAPP_TEMPLATES = {
  orderConfirmation: () => template('WHATSAPP_TEMPLATE_ORDER_CONFIRMATION', 'begood_order_confirmation'),
  orderStatus: () => template('WHATSAPP_TEMPLATE_ORDER_STATUS', 'begood_order_status'),
  offer: () => template('WHATSAPP_TEMPLATE_OFFER', 'begood_offer'),
  productLaunch: () => template('WHATSAPP_TEMPLATE_PRODUCT_LAUNCH', 'begood_product_launch')
}

function firstName(value) {
  const name = String(value || '').trim().split(/\s+/)[0]
  return name || 'there'
}

function orderReference(order) {
  return String(order?.orderId || '').slice(0, 8).toUpperCase()
}

function messagingAllowed(customer) {
  return !!customer?.whatsappOptIn && !customer?.whatsappOptOutAt
}

/**
 * Claim a deterministic message key before sending. This prevents duplicate
 * confirmations when Razorpay's browser verification and webhook arrive at
 * almost the same time, and also makes campaign retries safe.
 */
export async function sendTrackedWhatsAppTemplate({
  db,
  dedupeKey,
  to,
  templateName,
  params = [],
  urlParams = [],
  category = 'utility',
  customer = null,
  metadata = {}
}) {
  if (!isWhatsAppConfigured()) return { ok: false, reason: 'not_configured' }
  const number = toWhatsAppNumber(to)
  if (!number) return { ok: false, reason: 'invalid_number' }
  if (!messagingAllowed(customer)) return { ok: false, reason: 'whatsapp_opt_in_required' }

  const messages = db.collection('whatsapp_messages')
  const now = new Date().toISOString()
  const row = {
    _id: dedupeKey,
    dedupeKey,
    to: number,
    template: templateName,
    category,
    metadata,
    status: 'sending',
    attempts: 1,
    createdAt: now,
    updatedAt: now
  }

  try {
    await messages.insertOne(row)
  } catch (error) {
    if (error?.code !== 11000) throw error
    const retry = await messages.updateOne(
      { _id: dedupeKey, status: 'failed', attempts: { $lt: 3 } },
      { $set: { status: 'sending', updatedAt: now }, $inc: { attempts: 1 } }
    )
    if (!retry.modifiedCount) return { ok: true, duplicate: true }
  }

  const result = await sendWhatsAppTemplate({
    to: number,
    template: templateName,
    params,
    urlParams
  })

  await messages.updateOne(
    { _id: dedupeKey },
    {
      $set: result.ok
        ? { status: 'accepted', messageId: result.messageId, acceptedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : { status: 'failed', failureReason: result.reason || 'unknown', updatedAt: new Date().toISOString() }
    }
  )

  return result
}

export async function sendOrderConfirmation({ db, order }) {
  return sendTrackedWhatsAppTemplate({
    db,
    dedupeKey: `order:${order.orderId}:confirmation`,
    to: order.phone,
    templateName: WHATSAPP_TEMPLATES.orderConfirmation(),
    params: [
      firstName(order.customerName),
      orderReference(order),
      `₹${Number(order.totalAmount || 0).toFixed(0)}`,
      order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online'
    ],
    urlParams: [String(order.orderId)],
    category: 'utility',
    customer: order,
    metadata: { event: 'order_confirmation', orderId: order.orderId }
  })
}

const STATUS_LABELS = {
  Processing: 'being prepared',
  Shipped: 'shipped',
  Delivered: 'delivered'
}

export async function sendOrderStatusUpdate({ db, order, status }) {
  const label = STATUS_LABELS[status]
  if (!label) return { ok: false, reason: 'status_not_notifiable' }

  return sendTrackedWhatsAppTemplate({
    db,
    dedupeKey: `order:${order.orderId}:status:${status.toLowerCase()}`,
    to: order.phone,
    templateName: WHATSAPP_TEMPLATES.orderStatus(),
    params: [firstName(order.customerName), orderReference(order), label],
    urlParams: [String(order.orderId)],
    category: 'utility',
    customer: order,
    metadata: { event: 'order_status', orderId: order.orderId, status }
  })
}

export async function sendCampaignMessage({ db, campaign, customer }) {
  const number = toWhatsAppNumber(customer.phone)
  if (!number) return { ok: false, reason: 'invalid_number' }

  const isOffer = campaign.kind === 'offer'
  return sendTrackedWhatsAppTemplate({
    db,
    dedupeKey: `campaign:${campaign.id}:${number}`,
    to: number,
    templateName: isOffer ? WHATSAPP_TEMPLATES.offer() : WHATSAPP_TEMPLATES.productLaunch(),
    params: isOffer
      ? [firstName(customer.customerName), campaign.headline, campaign.detail]
      : [firstName(customer.customerName), campaign.headline, campaign.detail],
    category: 'marketing',
    customer,
    metadata: { event: 'campaign', campaignId: campaign.id, kind: campaign.kind }
  })
}
