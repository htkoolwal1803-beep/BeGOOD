'use client'

import { Star } from 'lucide-react'
import { getAverageRating, getReviewCount, getSortedReviews } from '@/lib/products'

/** Row of 5 stars with the filled count driven by `rating`. */
export function Stars({ rating = 0, className = 'w-4 h-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            i <= Math.round(rating)
              ? 'fill-[#6f8a74] text-[#6f8a74]'
              : 'text-[#d9cbb5]'
          }`}
        />
      ))}
    </span>
  )
}

/**
 * Compact rating summary for use next to the price or on a product card.
 * Renders nothing when a product has no reviews - an empty "0 reviews" label
 * is worse than no label at all.
 */
export function RatingSummary({ product, className = '' }) {
  const avg = getAverageRating(product)
  const count = getReviewCount(product)
  if (!avg) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Stars rating={avg} />
      <span className="text-sm font-semibold text-[#464c49]">{avg.toFixed(1)}</span>
      <span className="text-sm text-[#6b736d]">
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  )
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

/** Full reviews block for the product page. */
export default function ProductReviews({ product }) {
  const reviews = getSortedReviews(product)
  const avg = getAverageRating(product)
  const count = reviews.length

  if (!count) {
    return (
      <section className="brand-card p-5 sm:p-8">
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold mb-3">Reviews</h2>
        <p className="text-[#59615b]">
          No reviews yet. If you have tried this, we would love to hear how it went.
        </p>
      </section>
    )
  }

  return (
    <section className="brand-card p-5 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold">
          What customers say
        </h2>
        <div className="flex items-center gap-2">
          <Stars rating={avg} className="w-5 h-5" />
          <span className="font-semibold">{avg.toFixed(1)}</span>
          <span className="text-sm text-[#6b736d]">out of 5 &middot; {count} reviews</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="rounded-2xl border border-[#e6ddcd] bg-[#fbf7ed]/60 p-4 sm:p-5"
          >
            <Stars rating={r.rating} />
            <p className="mt-3 text-[15px] leading-relaxed text-[#464c49]">
              &ldquo;{r.comment}&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold text-[#1f2229]">{r.name}</p>
            <p className="text-xs text-[#6b736d]">
              {[r.role, formatDate(r.date)].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
