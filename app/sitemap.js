import { products } from '@/lib/products'
import { SITE_URL } from '@/lib/seo'

export default function sitemap() {
  const pages = ['/', '/shop', '/about', '/how-it-works', '/faq', '/contact', '/hampers', '/privacy', '/terms', '/refund']
  const productPages = products.filter(p => !p.upcoming && !p.comingSoon).map(p => `/product/${p.id}`)
  // Omit invented modification dates, redirects and transactional URLs.
  return [...pages, ...productPages].map(path => ({ url: `${SITE_URL}${path}` }))
}

