'use client'

import Link from 'next/link'
import Button from '@/components/Button'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { getProductById } from '@/lib/products'

export default function HamperCTA({ variant = 'hero' }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const hamper = getProductById('begood-rakhi-hamper')

  const handleOrder = () => {
    if (!hamper) return
    addToCart(hamper, { size: hamper.weight, price: hamper.price }, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="secondary" size="lg" onClick={handleOrder}>
          {added ? 'Added to Cart!' : 'Order Now'} <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Link href="/cart">
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#536a58]">
            View Cart
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#536a58]">
            For Details & Customization
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary" size="lg" onClick={handleOrder}>
        {added ? 'Added to Cart!' : 'Order Now'} <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
      <Link href="/contact">
        <Button variant="outline" size="lg">
          Customize Yours
        </Button>
      </Link>
    </div>
  )
}
