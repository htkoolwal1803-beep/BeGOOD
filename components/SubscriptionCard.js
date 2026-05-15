'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, Calendar, Sparkles } from 'lucide-react'

export default function SubscriptionCard() {
  return (
    <Link href="/subscribe">
      <div className="group brand-card relative overflow-hidden border-2 border-[#6f8a74]/70 bg-gradient-to-br from-[#dce6d7] to-[#fbf7ed] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-38px_rgba(31,34,41,0.6)]">
        {/* Best Value Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#6f8a74] text-[#fbf7ed] text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            SAVE 20%
          </div>
        </div>

        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-[#f4ecdd]">
          <Image
            src="/a-bar-packaging.png"
            alt="A-Bar Subscription"
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          {/* Subscription Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#3f4350] to-transparent p-4">
            <p className="text-white font-bold text-center">SUBSCRIPTION</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-playfair text-2xl font-semibold mb-2">A-Bar Subscription</h3>
          <p className="text-[#59615b] text-sm mb-4">
            Get A-Bar delivered monthly at a special price. 3-month commitment, maximum savings!
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-[#464c49]">Only <strong className="text-[#536a58]">₹100/bar</strong> (Save ₹25/bar)</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Truck className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#464c49]"><strong className="text-green-600">FREE Delivery</strong> on all shipments</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Calendar className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#464c49]">Monthly delivery for 3 months</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Package className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#464c49]">Minimum 4 bars/month</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-[#6b736d]">Starting from</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-[#536a58]">₹1,200</span>
                <span className="text-sm text-[#6b736d] ml-1">/3 months</span>
              </div>
              <p className="text-xs text-[#8b938b] line-through">₹1,500 regular price</p>
            </div>
            <button className="bg-[#6f8a74] text-[#fbf7ed] px-4 py-2 rounded-full hover:bg-[#536a58] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
