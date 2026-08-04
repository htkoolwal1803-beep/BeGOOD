'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getAverageRating, getReviewCount, getSortedReviews } from '@/lib/products'

/**
 * Reviews written by customers through the post-purchase email land in the
 * database, so the product page merges those with the seed reviews held in
 * lib/products.js. New reviews then appear without a code change.
 */
function useCustomerReviews(productId) {
  const [extra, setExtra] = useState([])

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.success) setExtra(d.reviews || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [productId])

  return extra
}

function combine(product, extra) {
  const seed = getSortedReviews(product)
  const all = [...extra, ...seed]
  return all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

function averageOf(list) {
  if (!list.length) return null
  const total = list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
  return Math.round((total / list.length) * 10) / 10
}

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
  const extra = useCustomerReviews(product?.bundleOf || product?.id)
  const merged = combine(product, extra)
  const avg = merged.length ? averageOf(merged) : getAverageRating(product)
  const count = merged.length || getReviewCount(product)
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
  const extra = useCustomerReviews(product?.bundleOf || product?.id)
  const reviews = combine(product, extra)
  const avg = averageOf(reviews)
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
            className="rounded-2xl border border-[#e6ddcd] bg-[#fbf7ed]/60 p-4 sm:p-5 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <Stars rating={r.rating} />
              <span className="text-[11px] font-semibold text-[#3f5a46] bg-[#dce6d7] rounded-full px-2 py-0.5 whitespace-nowrap">
                Verified buyer
              </span>
            </div>

            {r.comment && (
              <p className="mt-3 text-[15px] leading-relaxed text-[#464c49]">
                &ldquo;{r.comment}&rdquo;
              </p>
            )}

            {/* Answers from the feedback form. The before/after anxiety numbers
                are the most persuasive thing on the page, so they are shown
                rather than left buried in the admin panel. */}
            {Array.isArray(r.details) && r.details.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                {r.details.map((d, di) => (
                  <div key={di} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-[#8b938b] truncate">
                      {d.label}
                    </dt>
                    <dd className="text-sm font-semibold text-[#3f5a46]">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-auto pt-4">
              <p className="text-sm font-semibold text-[#1f2229]">{r.name}</p>
              <p className="text-xs text-[#6b736d]">
                {[r.role, formatDate(r.date)].filter(Boolean).join(' · ')}
              </p>
              {r.incentivised && (
                /* Disclosed rather than hidden: the reward was for writing a
                   review, not for a positive one. */
                <p className="text-[11px] text-[#8b938b] mt-1">
                  Received a discount code for reviewing
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
