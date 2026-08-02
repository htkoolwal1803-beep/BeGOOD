'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Truck } from 'lucide-react'
import { SHIPPING_CONFIG } from '@/lib/constants'

const SEEN_KEY = 'begood_returning_visitor'

/**
 * First-order delivery offer, shown only to people who look new.
 *
 * This is a display heuristic, not the rule itself: the actual threshold is
 * decided on the server at checkout by looking up the phone number. So the
 * worst case here is that a returning customer sees an offer they no longer
 * qualify for, never that someone claims a discount they should not get.
 */
export default function FirstOrderBanner({ className = '' }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true)
    } catch {
      // private mode / storage blocked - just don't show it
    }
  }, [])

  if (!show) return null

  return (
    <div className={`rounded-2xl border border-[#c3d5c0] bg-[#dce6d7]/60 px-4 py-3 ${className}`}>
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-[#3f5a46]">
        <Truck className="h-4 w-4 shrink-0" />
        <span>
          <strong>First order?</strong> Free delivery over ₹
          {SHIPPING_CONFIG.FIRST_ORDER_FREE_SHIPPING_THRESHOLD}.
        </span>
        <Link href="/product/begood-abar-2pack" className="font-semibold underline">
          Start with the Duo &rarr;
        </Link>
      </p>
    </div>
  )
}
