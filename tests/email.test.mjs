import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../lib/email.js', import.meta.url), 'utf8')
const { getEmailStatus, sendEmail } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

test('connection diagnosis is read-only, redacts credentials and excludes account data', async () => {
  const oldFetch = globalThis.fetch
  const oldKey = process.env.BREVO_API_KEY
  const oldFrom = process.env.EMAIL_FROM
  process.env.BREVO_API_KEY = ' secret-key '
  process.env.EMAIL_FROM = ' hello@example.com '
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.brevo.com/v3/account')
      assert.equal(options.method, undefined)
      assert.equal(options.headers['api-key'], 'secret-key')
      return { ok: false, status: 401, json: async () => ({ message: 'Invalid secret-key' }) }
    }
    assert.deepEqual(await getEmailStatus(), { ok: false, reason: 'http_401', detail: 'Invalid [redacted]' })
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ email: 'private@example.com', relay: { enabled: true, data: { password: 'private' } }, plan: [{ type: 'free', creditsType: 'sendLimit', credits: 0 }] }) })
    const status = await getEmailStatus()
    assert.equal(status.reason, 'quota_exhausted')
    assert.equal(JSON.stringify(status).includes('private'), false)
    globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ message: 'Sender is not verified' }) })
    const sent = await sendEmail({ to: 'test@example.com', subject: 'test', html: '<p>test</p>' })
    assert.equal(sent.detail, 'Sender is not verified')
  } finally {
    globalThis.fetch = oldFetch
    if (oldKey === undefined) delete process.env.BREVO_API_KEY; else process.env.BREVO_API_KEY = oldKey
    if (oldFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = oldFrom
  }
})
