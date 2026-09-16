import { notFound } from 'next/navigation'
import { products, getProductById } from '@/lib/products'
import { pageMetadata, productSchema, breadcrumbSchema } from '@/lib/seo'
import StructuredData from '@/components/StructuredData'
import ProductClient from './ProductClient'

export const dynamicParams = false
export function generateStaticParams() {
  return products.map(p => ({ id: p.id }))
}
function findProduct(id) {
  const product = getProductById(id)
  if (!product) notFound()
  return product
}
export async function generateMetadata({ params }) {
  const { id } = await params
  const product = findProduct(id)
  const metadata = pageMetadata(product.name + ' | ' + product.category + ' | BeGood', product.shortDescription, '/product/' + id, product.image)
  if (product.upcoming || product.comingSoon) metadata.robots = { index: false, follow: true }
  return metadata
}
export default async function ProductPage({ params }) {
  const { id } = await params
  const product = findProduct(id)
  return <><StructuredData data={productSchema(product)} /><StructuredData data={breadcrumbSchema(product)} /><ProductClient product={product} /></>
}

