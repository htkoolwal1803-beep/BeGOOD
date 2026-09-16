export const SITE_URL = 'https://begoodshop.in'
export const PRODUCT_IMAGE = '/images/a-bar.webp'

export function pageMetadata(title, description, path, image = PRODUCT_IMAGE) {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      type: 'website', siteName: 'BeGood', locale: 'en_IN',
      title, description, url: `${SITE_URL}${path}`,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export function productSchema(product) {
  const url = `${SITE_URL}/product/${product.id}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`,
    name: product.name, description: product.shortDescription,
    image: [new URL(product.image, SITE_URL).href],
    sku: product.id, url, brand: { '@type': 'Brand', name: 'BeGood' },
    category: product.category,
  }
  // Never publish a zero-price offer for an unlaunched concept.
  if (!product.upcoming && !product.comingSoon && product.price > 0) {
    schema.offers = {
      '@type': 'Offer', url, priceCurrency: 'INR', price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    }
  }
  // Stock and reviews are not verified by the static catalogue; omit both.
  return schema
}

export function breadcrumbSchema(product) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: `${SITE_URL}/shop` },
      { '@type': 'ListItem', position: 2, name: product.name, item: `${SITE_URL}/product/${product.id}` },
    ],
  }
}

