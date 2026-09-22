// Resolve only catalogue products; prices and variants never come from the URL.
export function resolveCartLink(params, products) {
  if (!params.has('product')) return null
  const product = products.find(p => p.id === params.get('product'))
  const raw = params.get('quantity') ?? '1'
  if (!product || product.upcoming || product.comingSoon || !(product.price > 0) || product.stock === 0) {
    return { error: 'This product is not available. Please choose an item from the shop.' }
  }
  if (!/^[1-9]\d*$/.test(raw) || Number(raw) > 99) {
    return { error: 'This link has an invalid quantity. Please use a whole number from 1 to 99.' }
  }
  return { product, quantity: Number(raw) }
}

export function ensureLinkedProduct(cart, product, quantity) {
  const variant = { size: product.weight, price: product.price }
  const index = cart.findIndex(item => item.id === product.id && item.variant?.size === variant.size && !item.variant?.flavor)
  if (index < 0) return [...cart, { ...product, variant, quantity }]
  return cart.map((item, i) => i === index
    ? { ...product, variant, quantity: Math.max(Number(item.quantity) || 0, quantity) }
    : item)
}

