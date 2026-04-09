'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, Calendar, Sparkles } from 'lucide-react'

export default function SubscriptionCard() {
  return (
    <Link href="/subscribe">
      <div className="group bg-gradient-to-br from-[#C8A97E]/10 to-[#F5F0E8] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-[#C8A97E] relative">
        {/* Best Value Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#C8A97E] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            SAVE 20%
          </div>
        </div>

        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
          <Image
            src="https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg"
            alt="A-Bar Subscription"
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          {/* Subscription Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#C8A97E] to-transparent p-4">
            <p className="text-white font-bold text-center">SUBSCRIPTION</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-playfair text-xl font-semibold mb-2">A-Bar Subscription</h3>
          <p className="text-gray-600 text-sm mb-4">
            Get A-Bar delivered monthly at a special price. 3-month commitment, maximum savings!
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Only <strong className="text-[#C8A97E]">₹100/bar</strong> (Save ₹25/bar)</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Truck className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700"><strong className="text-green-600">FREE Delivery</strong> on all shipments</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Calendar className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700">Monthly delivery for 3 months</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Package className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700">Minimum 4 bars/month</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-[#C8A97E]">₹1,200</span>
                <span className="text-sm text-gray-500 ml-1">/3 months</span>
              </div>
              <p className="text-xs text-gray-400 line-through">₹1,500 regular price</p>
            </div>
            <button className="bg-[#C8A97E] text-white px-4 py-2 rounded-lg hover:bg-[#B8956E] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
