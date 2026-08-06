'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { Star, Loader2, Check } from 'lucide-react'

export default function ReviewPage() {
  const { token } = useParams()

  const [state, setState] = useState('loading') // loading | form | done | invalid
  const [info, setInfo] = useState(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    fetch(`/api/review/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return setState('invalid')
        setInfo(d.request)
        setName(d.request.customerName || '')
        if (d.request.submitted) {
          setCoupon(d.request.couponCode)
          setState('done')
        } else {
          setState('form')
        }
      })
      .catch(() => setState('invalid'))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) return setError('Please choose a rating first')
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, name })
      })
      const d = await res.json()
      if (d.success) {
        setCoupon(d.couponCode)
        setState('done')
      } else {
        setError(d.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="brand-page min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="brand-panel p-5 sm:p-8 max-w-lg mx-auto">
          {state === 'loading' && (
            <div className="flex items-center gap-2 text-[#59615b] justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          )}

          {state === 'invalid' && (
            <div className="text-center py-6">
              <h1 className="font-playfair text-2xl font-bold mb-2">This link has expired</h1>
              <p className="text-[#59615b] mb-6">
                We could not find this review request. If you ordered recently, check for a newer email from us.
              </p>
              <Link href="/shop"><Button>Back to shop</Button></Link>
            </div>
          )}

          {state === 'form' && (
            <>
              {info?.isTest && (
                <p className="mb-4 rounded-lg bg-[#f4e3c8] border border-[#e0c893] px-3 py-2 text-xs text-[#7a5a24]">
                  Test link. The flow works exactly as it does for a customer, but nothing
                  you write here will appear on the product page.
                </p>
              )}
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold mb-2">How did it go?</h1>
              <p className="text-[#59615b] mb-1">
                Good or bad, we would like the honest version.
              </p>
              <p className="text-xs text-[#8b938b] mb-6">
                The ₹20 is for writing a review.
              </p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i} star${i > 1 ? 's' : ''}`}
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            i <= (hover || rating)
                              ? 'fill-[#6f8a74] text-[#6f8a74]'
                              : 'text-[#d9cbb5]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    What happened? <span className="font-normal text-[#8b938b]">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={800}
                    placeholder="What were you using it for, and did it help?"
                    className="w-full min-w-0 px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Name shown with your review</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    placeholder="First name is fine"
                    className="w-full min-w-0 px-4 py-3 border border-[#d9cbb5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f8a74]"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </span>
                  ) : 'Submit review'}
                </Button>
              </form>
            </>
          )}

          {state === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#dce6d7] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#3f5a46]" />
              </div>
              <h1 className="font-playfair text-2xl font-bold mb-2">Thank you</h1>
              <p className="text-[#59615b] mb-5">
                That genuinely helps the next person decide.
              </p>
              {coupon && (
                <>
                  <p className="text-sm text-[#59615b] mb-2">₹20 off your next order:</p>
                  <p className="text-2xl font-bold tracking-widest text-[#3f5a46] bg-[#dce6d7] rounded-xl py-3 px-4 inline-block mb-2">
                    {coupon}
                  </p>
                  <p className="text-xs text-[#8b938b] mb-6">Valid for 90 days · one use</p>
                </>
              )}
              <div>
                <Link href="/shop"><Button size="lg">Use it now</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
