import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const port = 3106
const local = `http://127.0.0.1:${port}`
const origin = 'https://begoodshop.in'
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { windowsHide: true, stdio: ['ignore','pipe','pipe'] })
let output = ''
server.stdout.on('data', data => { output += data })
server.stderr.on('data', data => { output += data })
let assertions = 0
function check(value, message) { assert.ok(value,message); assertions++ }
async function get(path) {
  const response = await fetch(local + path, {headers:{'user-agent':'Googlebot'}})
  return { status: response.status, html: await response.text() }
}
try {
  let ready = false
  for(let i=0;i<60;i++) {
    try { if((await fetch(local+'/robots.txt')).ok) {ready=true;break} } catch {}
    await delay(500)
  }
  check(ready,'Server must start')
  const robot = await get('/robots.txt')
  check(robot.status===200 && robot.html.includes(`Sitemap: ${origin}/sitemap.xml`),'Crawl policy and sitemap link')
  check(robot.html.includes('Allow: /') && !robot.html.includes('Disallow: /\n'),'Public pages remain crawlable')
  const sitemap = await get('/sitemap.xml')
  check(sitemap.status===200,'Sitemap responds 200')
  const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1])
  check(urls.length===15 && new Set(urls).size===15,'15 distinct public URLs')
  check(!urls.some(url=>/checkout|admin|upcoming|subscribe/.test(url)),'No private or unlaunched URLs in sitemap')
  const titles = new Set()
  for(const url of urls) {
    const {status,html} = await get(new URL(url).pathname)
    check(status===200,`${url}: HTTP 200`)
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1]
    check(canonical && new URL(canonical).href === new URL(url).href,`${url}: canonical URL`)
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    check(title && !titles.has(title),`${url}: unique title`)
    titles.add(title)
    check(/name="description" content="[^"]+"/.test(html),`${url}: description`)
    check(html.includes('property="og:image"'),`${url}: sharing image`)
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]))
    check(blocks.some(b=>b['@graph']?.some(x=>x['@type']==='Organization')),`${url}: organization schema`)
    if(url.includes('/product/')) {
      const product=blocks.find(b=>b['@type']==='Product')
      check(product?.offers?.priceCurrency==='INR' && product.offers.price>0,`${url}: priced product schema`)
      check(html.replace(/<[^>]*>/g,'').includes(`₹${product.offers.price}`),`${url}: schema price matches visible price`)
      check(!product.aggregateRating && !product.offers.availability,`${url}: no unverified ratings/stock`)
      check(product.image[0].startsWith(origin+'/'),`${url}: public image URL`)
      const image=await fetch(local+new URL(product.image[0]).pathname)
      check(image.ok,`${url}: image accessible`)
      check(blocks.some(b=>b['@type']==='BreadcrumbList'),`${url}: breadcrumb schema`)
    }
  }
  for(const path of ['/admin','/affiliate/login','/login','/profile','/cart','/checkout','/order/pending','/review/test','/data-deletion','/product/begood-pbar-upcoming']) {
    const {html}=await get(path)
    check(/name="robots" content="[^"]*noindex/.test(html),`${path}: noindex`)
  }
  check((await get('/product/not-a-real-product')).status===404,'Unknown product must be HTTP 404')
  const tracked = await get('/product/begood-abar-001?utm_source=test&ref=TEST')
  check(tracked.html.includes(`rel="canonical" href="${origin}/product/begood-abar-001"`),'Tracking parameters do not change canonical')
  const upcoming=await get('/product/begood-pbar-upcoming')
  const blocks=[...upcoming.html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]))
  check(!blocks.find(b=>b['@type']==='Product')?.offers,'Unlaunched product has no offer')
  const verification=await get('/google6e97dc180b6e7614.html')
  check(verification.status===200 && verification.html.includes('google-site-verification:'),'Verification file accessible')
  console.log(`Passed ${assertions} SEO checks across ${urls.length} sitemap pages and 10 noindex routes.`)
} catch(error) {
  console.error(output.slice(-3000))
  throw error
} finally {
  server.kill()
}

