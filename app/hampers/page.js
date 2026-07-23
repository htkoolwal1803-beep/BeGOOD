import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import HamperCTA from '@/components/HamperCTA'
import { ArrowRight, Leaf, Brain, Sparkles, Gift, Check } from 'lucide-react'

export const metadata = {
  title: 'Rakhi Hampers - BeGood | Made for Moments that Matter',
  description:
    "This Rakhi, gift a healthy hamper built around A-Bar - a functional bar that helps ease stress and nervousness, in a premium chocolate taste. Made with 100% natural ingredients."
}

export default function HampersPage() {
  const hamperItems = [
    { name: 'Basket with net wrap', detail: 'Premium reusable gifting basket' },
    { name: '2 × A-Bars', detail: 'Functional stress-easing chocolate bars' },
    { name: 'Coconut Water', detail: '1 bottle of 100% natural RAW coconut water' },
    { name: 'Almonds', detail: '100g of premium almonds' },
    { name: 'Cashews', detail: '100g of premium cashews' },
    { name: 'Phool Makhana', detail: '40g of roasted fox nuts' },
    { name: 'Plant Pot', detail: 'A little pot to grow something together' },
    { name: 'Plantable Greeting Card', detail: 'Plant it, water it, watch kindness bloom' },
    { name: 'Customizable Polaroid', detail: 'Personalise it with your own moment' }
  ]

  const gallery = [
    { src: '/hampers/gallery-1.jpg', alt: 'BeGood Rakhi Hamper - open basket view' },
    { src: '/hampers/gallery-2.jpg', alt: 'BeGood Rakhi Hamper - net wrapped' },
    { src: '/hampers/gallery-3.jpg', alt: 'BeGood Rakhi Hamper - contents close up' }
  ]

  return (
    <div className="brand-page min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#fbf7ed]/75 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <span className="brand-pill inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium">
                <Gift className="w-4 h-4" /> This Rakhi
              </span>
              <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Made for Moments that Matter.
              </h1>
              <p className="text-xl md:text-2xl text-[#59615b] leading-relaxed mb-8">
                This Rakhi, gift this to someone who matters to you. A healthy hamper,
                thoughtfully built around A-Bar.
              </p>

              {/* Price */}
              <div className="brand-card inline-block p-6 mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#6f8a74] mb-1">
                  Pre-Rakhi Price
                </p>
                <div className="flex items-end gap-3">
                  <span className="font-playfair text-4xl md:text-5xl font-bold text-[#1f2229]">
                    ₹758
                  </span>
                  <span className="text-lg text-[#59615b] line-through mb-1">₹999</span>
                </div>
                <p className="text-sm text-[#59615b] mt-1">Limited pre-Rakhi offer</p>
              </div>

              <HamperCTA variant="hero" />
            </div>

            <div className="relative aspect-square bg-[#f4ecdd] rounded-2xl overflow-hidden">
              <Image
                src="/hampers/hero.png"
                alt="BeGood Rakhi Hamper"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              What's Inside the Hamper
            </h2>
            <p className="text-xl text-[#59615b] max-w-2xl mx-auto">
              A curated mix of wholesome, feel-good goodies - and the star of the box, A-Bar.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {hamperItems.map((item) => (
              <div key={item.name} className="brand-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-[#6f8a74]/10 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#6f8a74]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1f2229] mb-1">{item.name}</h3>
                  <p className="text-[#464c49] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-[#f4ecdd]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              A Hamper Worth Unwrapping
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {gallery.map((img) => (
              <div
                key={img.src}
                className="brand-card overflow-hidden relative aspect-[4/5]"
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is A-Bar */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative aspect-square bg-[#f4ecdd] rounded-2xl overflow-hidden">
              <Image
                src="/a-bar-packaging.png"
                alt="BeGood A-Bar"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">What is A-Bar?</h2>
              <p className="text-lg text-[#464c49] leading-relaxed mb-6">
                A-Bar is a functional bar that helps reduce stress and nervousness in moments of
                distress - all in a premium chocolate taste. It's the healthiest bar you can have,
                made with 100% natural ingredients.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="brand-icon w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[#6f8a74]/10">
                    <Brain className="w-6 h-6 text-[#6f8a74]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Eases stress & nervousness</h3>
                    <p className="text-[#464c49]">Helps you stay composed when moments matter most.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="brand-icon w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[#6f8a74]/10">
                    <Sparkles className="w-6 h-6 text-[#6f8a74]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Premium chocolate taste</h3>
                    <p className="text-[#464c49]">Functional food that actually tastes indulgent.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="brand-icon w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[#6f8a74]/10">
                    <Leaf className="w-6 h-6 text-[#6f8a74]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">100% natural ingredients</h3>
                    <p className="text-[#464c49]">No added sugar, no preservatives - the healthiest bar you can have.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/how-it-works">
                  <Button variant="secondary" size="md">
                    Learn how A-Bar works <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#6f8a74] to-[#536a58] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            This Rakhi, Gift a Healthy Hamper
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Made for moments that matter. Order now at the pre-Rakhi price of ₹758.
          </p>
          <HamperCTA variant="footer" />
        </div>
      </section>
    </div>
  )
}
