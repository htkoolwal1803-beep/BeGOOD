'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import ProductCard from '@/components/ProductCard'
import SubscriptionCard from '@/components/SubscriptionCard'
import { getFeaturedProducts, getUpcomingProducts } from '@/lib/products'
import { ArrowRight, Bell, Brain, CheckCircle, Clock3, Focus, Heart, Leaf, PackageCheck, ShieldCheck, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')

      if (refCode) {
        localStorage.setItem('affiliateCode', refCode.toUpperCase())

        fetch('/api/affiliate/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode })
        }).catch(err => console.error('Affiliate tracking error:', err))
      }
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Home',
        page_location: window.location.href,
        page_path: '/'
      })
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        params: { page: 'home' },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    }).catch(err => console.error('Analytics error:', err))
  }, [])

  const handleNotifySubmit = async (e) => {
    e.preventDefault()
    setNotifyError('')

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: notifyEmail,
          product: 'P-Bar'
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotifySuccess(true)
        setNotifyEmail('')
        setTimeout(() => setNotifySuccess(false), 3000)
      } else {
        setNotifyError(data.message || 'Failed to save email')
      }
    } catch (error) {
      setNotifyError('An error occurred. Please try again.')
    }
  }

  const featuredProducts = getFeaturedProducts()
  const upcomingProducts = getUpcomingProducts()

  const quickRelief = [
    { title: 'Science-Backed', desc: 'Research-based formulations', icon: Brain },
    { title: 'Fast Acting', desc: 'Works in about 30-45 minutes', icon: Clock3 },
    { title: 'Delicious', desc: 'Tastes like premium chocolate', icon: PackageCheck }
  ]

  const occasions = [
    { title: 'Before Your Exam', icon: Brain, desc: 'Stay calm and focused during tests' },
    { title: 'Before Your Interview', icon: Focus, desc: 'Project confidence and clarity' },
    { title: 'Before Presentations', icon: Zap, desc: 'Speak with poise and assurance' },
    { title: 'When Feeling Anxious', icon: Heart, desc: 'Restore calm and composure' }
  ]

  const aspects = [
    '100% Natural Ingredients',
    'No Added Sugar',
    'No Added Preservatives',
    'Science-Backed Formula',
    'Quick Acting (30-45 min)',
    'Delicious & Convenient'
  ]

  const benefits = [
    'Helps ease stress and nervousness',
    'Supports mental clarity and focus',
    'Promotes calm without drowsiness',
    'Helps you stay composed in high-stakes moments',
    'L-Theanine supports relaxed alertness',
    'Whole-food ingredients, no pills or powders'
  ]

  const ingredientTiles = [
    { name: 'Walnuts', image: '/ingredients/walnuts.jpg' },
    { name: 'Pumpkin Seeds', image: '/ingredients/pumpkin-seeds.jpg' },
    { name: 'Cocoa Butter', image: '/ingredients/cocoa-butter.jpg' },
    { name: 'L-Theanine', image: '/ingredients/l-theanine.jpg' }
  ]

  const testimonials = [
    {
      name: 'Siddhant',
      role: 'Student',
      comment: 'I was not able to concentrate due to overthinking.After eat the bar within like just 15-20min. it felt so relaxed and calm. Plus it tastes amazing!',
      rating: 5
    },
    {
      name: 'Shubhe Aditya',
      role: 'Person',
      comment: 'I had a fight with my girlfriend and i was thinking so much about it. I wasted an hour thinking about it and then I ate it and it just all felt so normal and relaxing. I think it just save me time.',
      rating: 5
    },
    {
      name: 'Saksham Jain',
      role: 'Working Professional',
      comment: 'I had an interview and I was not fully prepared and so was very nervous, but after eating it I gave answers very calmly and luckily cracked it too. Worth every rupee!',
      rating: 5
    }
  ]

  return (
    <div className="brand-page animate-fade-in">
      <section className="brand-section pt-10 md:pt-16">
        <div className="brand-container">
          <div className="brand-panel overflow-hidden">
            <div className="grid items-center gap-6 px-5 py-8 md:grid-cols-2 md:gap-10 md:px-12 md:py-16">
              {/* Image is first on mobile so the product is the first thing
                  seen on a phone, and stays on the left on desktop. */}
              <div className="relative order-1">
                <div className="relative mx-auto aspect-square max-w-[280px] sm:max-w-sm md:aspect-[4/3] md:max-w-xl">
                  <Image
                    src="/a-bar-packaging.png"
                    alt="BeGood A-Bar"
                    fill
                    sizes="(max-width: 768px) 280px, 576px"
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              <div className="order-2 space-y-5 text-center md:space-y-7 md:text-left">
                <span className="brand-pill">Introducing BeGood</span>
                <div className="space-y-3 md:space-y-4">
                  <h1 className="font-playfair text-4xl font-bold leading-[1.1] text-[#15171d] sm:text-5xl md:text-6xl lg:text-7xl">
                    Calm Your Mind.
                    <span className="block text-[#536a58]">Own The Moment.</span>
                  </h1>

                  {/* Short on phones, full story on larger screens. */}
                  <p className="text-base leading-relaxed text-[#464c49] md:hidden">
                    Functional chocolate that helps ease stress and nervousness &mdash; calm focus in about 30&ndash;45 minutes.
                  </p>
                  <p className="hidden max-w-xl text-lg leading-relaxed text-[#464c49] md:block">
                    A premium functional chocolate that helps ease stress and nervousness and brings calm focus when it matters most.
                    100% natural ingredients. No pills. No powders. Just delicious, science-backed wellness.
                  </p>
                </div>

                {/* Compact proof row - scannable on a phone instead of a paragraph. */}
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-[#dce6d7]/70 px-3 py-1 text-xs font-semibold text-[#3f5a46]">100% Natural</span>
                  <span className="rounded-full bg-[#dce6d7]/70 px-3 py-1 text-xs font-semibold text-[#3f5a46]">No Added Sugar</span>
                  <span className="rounded-full bg-[#dce6d7]/70 px-3 py-1 text-xs font-semibold text-[#3f5a46]">Works in 30&ndash;45 min</span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link href="/shop" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#dce6d7]/80 py-12 md:py-16">
        <div className="brand-container">
          <div className="mb-10 text-center">
            <h2 className="font-playfair text-3xl font-bold md:text-4xl">Quick Relief, Anytime</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {quickRelief.map((item) => (
              <div key={item.title} className="text-center">
                <div className="brand-icon mx-auto mb-4 h-14 w-14">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-[#1f2229]">{item.title}</h3>
                <p className="text-sm text-[#59615b]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark py-16 md:py-20">
        <div className="brand-container">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="grid grid-cols-2 gap-4">
              {ingredientTiles.map((ingredient) => (
                <div key={ingredient.name} className="group overflow-hidden rounded-2xl border border-[#fbf7ed]/15 bg-[#fbf7ed]/10">
                  <div className="relative aspect-square">
                    <Image src={ingredient.image} alt={ingredient.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f2229]/70 via-transparent to-transparent" />
                    <p className="absolute bottom-4 left-4 right-4 font-playfair text-xl font-semibold text-[#fbf7ed]">{ingredient.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-[#fbf7ed]/20 px-4 py-2 text-sm text-[#dce6d7]">Science Meets Taste</span>
              <h2 className="font-playfair text-4xl font-bold leading-tight md:text-5xl">Nature's Best for Your Wellbeing</h2>
              <p className="text-[#dce6d7]">
                We create science-backed functional foods that help you manage your emotions naturally.
                Just convenient and delicious products made with walnuts, pumpkin seeds, cocoa butter, and L-Theanine.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#9dae99]" />
                    <span className="text-sm text-[#fbf7ed]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-4xl font-bold md:text-5xl">When It Matters Most</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-[#59615b]">Your perfect companion for high-stakes moments</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {occasions.map((occasion) => (
              <div key={occasion.title} className="brand-card p-6">
                <div className="brand-icon mb-5 h-12 w-12">
                  <occasion.icon className="h-6 w-6" />
                </div>
                <h3 className="font-playfair text-xl font-semibold">{occasion.title}</h3>
                <p className="mt-2 text-sm text-[#59615b]">{occasion.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="brand-container">
          <div className="brand-panel p-8 md:p-12">
            <div className="mb-10 text-center">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-[#536a58]" />
              <h2 className="font-playfair text-4xl font-bold md:text-5xl">Why Choose BeGood?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[#59615b]">Premium quality you can trust</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aspects.map((aspect) => (
                <div key={aspect} className="flex items-start gap-3 rounded-2xl border border-[#d9cbb5] bg-[#fbf7ed]/55 p-4">
                  <Leaf className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#536a58]" />
                  <span className="text-[#2f332f]">{aspect}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section bg-[#fbf7ed]/70">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-4xl font-bold md:text-5xl">Our Products</h2>
            <p className="mt-3 text-lg text-[#59615b]">Functional wellness, perfectly crafted</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            <SubscriptionCard />
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-4xl font-bold md:text-5xl">What Our Customers Say</h2>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="brand-card p-7">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#6f8a74] text-[#6f8a74]" />
                  ))}
                </div>
                <p className="mb-6 italic text-[#464c49]">"{testimonial.comment}"</p>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-[#59615b]">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {upcomingProducts.length > 0 && (
        <section className="bg-[#3f4350] py-16 text-[#fbf7ed] md:py-20">
          <div className="brand-container">
            <div className="mx-auto max-w-4xl text-center">
              <Bell className="mx-auto mb-6 h-14 w-14 animate-pulse text-[#dce6d7]" />
              <h2 className="font-playfair text-4xl font-bold md:text-5xl">Coming Soon: P-Bar</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#dce6d7]">
                A functional chocolate bar designed to help manage menstrual discomfort.
                Be the first to know when we launch!
              </p>

              <form onSubmit={handleNotifySubmit} className="mx-auto mt-8 max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 rounded-full px-6 py-4 text-[#1f2229] focus:outline-none focus:ring-2 focus:ring-[#dce6d7]"
                  />
                  <Button type="submit" variant="secondary" size="lg" className="whitespace-nowrap">
                    Notify Me
                  </Button>
                </div>
                {notifySuccess && (
                  <p className="mt-4 font-semibold text-[#dce6d7]">Thanks! We'll notify you when P-Bar launches.</p>
                )}
                {notifyError && (
                  <p className="mt-4 text-red-200">{notifyError}</p>
                )}
              </form>

              <p className="mt-6 text-sm text-[#dce6d7]/80">Join the waitlist and get exclusive early access</p>
            </div>
          </div>
        </section>
      )}

      <section className="brand-section">
        <div className="brand-container text-center">
          <h2 className="font-playfair text-4xl font-bold md:text-5xl">Ready To Feel Your Best?</h2>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-lg text-[#59615b]">
            Made for the moments that matter most
          </p>
          <Link href="/shop">
            <Button size="lg">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
