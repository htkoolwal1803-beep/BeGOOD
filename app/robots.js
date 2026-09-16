import { SITE_URL } from '@/lib/seo'

export default function robots() {
  return {
    // Includes Googlebot, Bingbot and OAI-SearchBot. Page-level noindex
    // handles customer/admin pages; allowing crawling lets bots see it.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

