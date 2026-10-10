const DAY = 86400000

// Order age is not product age. Wait for delivery, then use the shipping date.
// Older delivered orders have no fulfillment timestamps; updatedAt is the
// best available delivery date. Never substitute the checkout date.
export function retentionQuery(days, now, extra = {}, maxAge = null) {
  const date = (field) => ({ $convert: { input: field, to: 'date', onError: null, onNull: null } })
  const start = { $ifNull: [date('$shippedAt'), { $ifNull: [date('$deliveredAt'), date('$updatedAt')] }] }
  const comparisons = [
    { $ne: [start, null] },
    { $lte: [start, new Date(now - days * DAY)] }
  ]
  if (maxAge !== null) comparisons.push({ $gte: [start, new Date(now - maxAge * DAY)] })
  return {
    status: /^delivered$/i,
    email: { $exists: true, $nin: [null, ''] },
    $expr: { $and: comparisons },
    ...extra
  }
}

export function fulfillmentUpdate(status, now = new Date().toISOString()) {
  const set = { status, updatedAt: now }
  if (status === 'Shipped') set.shippedAt = { $ifNull: ['$shippedAt', now] }
  if (status === 'Delivered') set.deliveredAt = { $ifNull: ['$deliveredAt', now] }
  return [{ $set: set }]
}

// Serialize manual and scheduled runs. Expiry allows recovery after a killed
// function; the token prevents an older run from releasing a newer lease.
export async function acquireRetentionRun(db, now = Date.now()) {
  const token = crypto.randomUUID()
  try {
    const result = await db.collection('job_locks').updateOne(
      { _id: 'retention', expiresAt: { $lte: new Date(now) } },
      { $set: { token, expiresAt: new Date(now + 15 * 60 * 1000) } },
      { upsert: true }
    )
    return result.modifiedCount || result.upsertedCount ? token : null
  } catch (error) {
    if (error.code === 11000) return null
    throw error
  }
}
