import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { retentionQuery, fulfillmentUpdate, acquireRetentionRun } from '../lib/retention.mjs'

// Run the real route with an in-memory database and messaging providers.
// No production data, credentials or customer messages are involved.
function evaluate(value, doc) {
  if (typeof value === 'string' && value.startsWith('$')) return doc[value.slice(1)]
  if (!value || typeof value !== 'object' || value instanceof Date || value instanceof RegExp) return value
  if (value.$convert) {
    const input = evaluate(value.$convert.input, doc)
    if (!input) return null
    const date = new Date(input)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (value.$ifNull) return evaluate(value.$ifNull[0], doc) ?? evaluate(value.$ifNull[1], doc)
  if (value.$and) return value.$and.every(v => evaluate(v, doc))
  for (const operator of ['$ne', '$lte', '$gte']) {
    if (!value[operator]) continue
    const [a, b] = value[operator].map(v => evaluate(v, doc))
    return operator === '$ne' ? a !== b : operator === '$lte' ? a <= b : a >= b
  }
  return value
}
function matches(doc, query) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$expr') return evaluate(condition, doc)
    if (key === '$or') return condition.some(q => matches(doc, q))
    const value = doc[key]
    if (condition === null) return value == null
    if (condition instanceof RegExp) return condition.test(value || '')
    if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
      return Object.entries(condition).every(([op, expected]) => {
        if (op === '$exists') return (value !== undefined) === expected
        if (op === '$in') return expected.includes(value)
        if (op === '$nin') return !expected.includes(value)
        if (op === '$lte') return value <= expected
        if (op === '$gt') return value > expected
        if (op === '$regex') return new RegExp(expected).test(value || '')
        throw Error(`Unsupported ${op}`)
      })
    }
    return value === condition
  })
}
function database(orders = []) {
  const data = { orders: structuredClone(orders) }
  let writes = 0
  return {
    data, get writes() { return writes }, command: async () => ({}),
    collection(name) {
      const rows = data[name] ||= []
      return {
        find(query = {}) {
          let found = rows.filter(row => matches(row, query))
          const cursor = {
            sort() { return cursor },
            limit(n) { found = found.slice(0, n); return cursor },
            async toArray() { return structuredClone(found) }
          }
          return cursor
        },
        async findOne(query) { return structuredClone(rows.find(row => matches(row, query)) || null) },
        async insertOne(row) { writes++; rows.push(structuredClone(row)) },
        async updateOne(query, update, options = {}) {
          writes++
          let row = rows.find(row => matches(row, query))
          let upsertedCount = 0
          if (!row && options.upsert) {
            if (rows.some(row => row._id === query._id)) throw Object.assign(Error('duplicate'), { code: 11000 })
            row = { _id: query._id }; rows.push(row); upsertedCount = 1
          }
          if (!row) return { matchedCount: 0, modifiedCount: 0 }
          const set = Array.isArray(update) ? update[0].$set : update.$set
          const next = Object.fromEntries(Object.entries(set).map(([k, v]) => [k, Array.isArray(update) ? evaluate(v, row) : v]))
          Object.assign(row, next)
          return { matchedCount: 1, modifiedCount: 1, upsertedCount }
        },
        async deleteOne(query) {
          writes++
          const i = rows.findIndex(row => matches(row, query))
          if (i >= 0) rows.splice(i, 1)
        }
      }
    }
  }
}
const source = (await readFile(new URL('../app/api/[[...path]]/route.js', import.meta.url), 'utf8'))
  .replace(/^import [^\n]*\n/gm, '').replace(/export /g, '')
function routes(db, send = async () => ({ ok: true })) {
  return new Function('NextResponse', 'MongoClient', 'uuidv4', 'crypto', 'retentionQuery', 'fulfillmentUpdate', 'acquireRetentionRun', 'siteUrl', 'siteLink', 'mergeTemplate', 'fillTemplate', 'layout', 'bodyToHtml', 'isWhatsAppConfigured', 'sendEmail', `${source}\nreturn { GET, POST, PUT }`)(
    { json: (body, options) => ({ body, status: options?.status || 200 }) },
    { connect: async () => ({ db: () => db }) }, randomUUID, { randomUUID },
    retentionQuery, fulfillmentUpdate, acquireRetentionRun,
    () => 'https://begoodshop.in', path => `https://begoodshop.in/${path}`,
    key => ({ subject: key }), x => x, () => '<p>message</p>', () => '', () => false, send
  )
}
function request(path, admin = false, body = null, authenticated = true) {
  const url = `https://begoodshop.in/api/${path}`
  return { url, nextUrl: new URL(url), headers: new Headers(authenticated ? admin ? { 'x-admin-key': 'test-admin' } : { authorization: 'Bearer test-cron' } : {}), json: async () => body }
}
process.env.ADMIN_PASSWORD = 'test-admin'
process.env.CRON_SECRET = 'test-cron'
const ago = days => new Date(Date.now() - days * 86400000).toISOString()
const order = (id, days, extra = {}) => ({ orderId: id, email: `${id}@example.com`, createdAt: ago(100), shippedAt: ago(days), status: 'Delivered', ...extra })

test('GET cron and admin POST select days 3, 7 and 25 from shipping, only after delivery', async () => {
  const db = database([order('new', 1), order('usage', 4), order('review', 8), order('replen', 26), order('pending', 30, { status: 'Pending' }), order('shipped', 30, { status: 'Shipped' }), order('cancelled', 30, { status: 'Cancelled' }), order('legacy', 100, { shippedAt: null, updatedAt: ago(1) })])
  const api = routes(db)
  const get = await api.GET(request('cron/retention?dryRun=1'))
  assert.equal(get.status, 200)
  assert.deepEqual(get.body.wouldSend.usage.map(o => o.orderId), ['usage', 'review', 'replen'])
  assert.deepEqual(get.body.wouldSend.reviewRequests.map(o => o.orderId), ['review', 'replen'])
  assert.deepEqual(get.body.wouldSend.replenishment.map(o => o.orderId), ['replen'])
  assert.deepEqual((await api.POST(request('cron/retention?dryRun=1', true))).body, get.body)
  assert.equal(db.writes, 0)
  assert.equal((await api.GET(request('cron/retention', false, null, false))).status, 401)
  assert.equal(db.writes, 0)
})

test('marking shipped/delivered records first timestamps and preserves them on repeat edits', async () => {
  const db = database([order('one', 0, { status: 'Processing', shippedAt: null })])
  const api = routes(db)
  await api.PUT(request('admin/orders/one', true, { status: 'Shipped' }))
  const shippedAt = db.data.orders[0].shippedAt
  assert.ok(shippedAt)
  await api.PUT(request('admin/orders/one', true, { status: 'Delivered' }))
  const deliveredAt = db.data.orders[0].deliveredAt
  await api.PUT(request('admin/orders/one', true, { status: 'Delivered' }))
  assert.equal(db.data.orders[0].shippedAt, shippedAt)
  assert.equal(db.data.orders[0].deliveredAt, deliveredAt)
  assert.equal((await api.PUT(request('admin/orders/one', true, { status: 'Processing' }))).status, 200)
  assert.equal((await api.PUT(request('admin/orders/one', true, { status: 'invalid' }))).status, 400)
})

test('failed review sends retry with the same link and successful sends are not repeated', async () => {
  const db = database([order('one', 50)])
  let fail = true, sends = 0
  const api = routes(db, async () => { sends++; return fail ? { ok: false, reason: 'http_503' } : { ok: true } })
  const first = await api.GET(request('cron/retention'))
  assert.equal(first.body.summary.failed, 3)
  assert.equal(db.data.review_requests[0].status, 'failed')
  assert.equal(db.data.orders[0].reviewEmailSentAt, undefined)
  const token = db.data.review_requests[0].token
  fail = false
  const retry = await api.GET(request('cron/retention'))
  assert.equal(retry.body.summary.reviewRequests, 1)
  assert.equal(retry.body.summary.usage, 1)
  assert.equal(retry.body.summary.replenishment, 1)
  assert.equal(db.data.review_requests.length, 1)
  assert.equal(db.data.review_requests[0].token, token)
  assert.equal(db.data.review_requests[0].status, 'sent')
  await api.GET(request('cron/retention'))
  assert.equal(sends, 6)
})

test('concurrent sends serialize and expired leases recover', async () => {
  const db = database([order('one', 4)])
  let started, finish
  const entered = new Promise(resolve => { started = resolve })
  const wait = new Promise(resolve => { finish = resolve })
  let sends = 0
  const api = routes(db, async () => { sends++; started(); await wait; return { ok: true } })
  const first = api.GET(request('cron/retention'))
  await entered
  const second = await api.POST(request('cron/retention', true))
  assert.equal(second.body.skipped, 'retention_already_running')
  finish(); await first
  assert.equal(sends, 1)
  assert.equal(db.data.job_locks.length, 0)
  assert.ok(await acquireRetentionRun(db, Date.now() - 20 * 60000))
  assert.ok(await acquireRetentionRun(db))
})

test('submitted reviews and dry runs never send or change an order', async () => {
  const db = database([order('one', 26), order('later', 1, { phone: '9999999999', createdAt: ago(1) })])
  db.data.orders[0].phone = '9999999999'
  db.data.review_requests = [{ orderId: 'one', email: 'one@example.com', status: 'submitted' }]
  const api = routes(db)
  const result = await api.GET(request('cron/retention?dryRun=1'))
  assert.equal(result.body.wouldSend.reviewRequests.length, 0)
  assert.equal(result.body.wouldSend.replenishment.length, 0)
  assert.equal(db.writes, 0)
})

test('missing/invalid dates never fall back to purchase time; late delivery remains eligible', () => {
  const query = retentionQuery(3, Date.now())
  assert.equal(matches(order('bad', 100, { shippedAt: 'bad', deliveredAt: null }), query), false)
  assert.equal(matches(order('late', 100, { deliveredAt: ago(1) }), query), true)
  assert.equal(matches(order('direct', 0, { shippedAt: null, deliveredAt: ago(4) }), query), true)
  assert.equal(matches(order('fresh', 100, { shippedAt: null, deliveredAt: null, updatedAt: ago(1) }), query), false)
})

