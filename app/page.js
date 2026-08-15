'use client'

import HeroPack from '@/components/HeroPack'
import Link from 'next/link'
import Button from '@/components/Button'
import ProductCard from '@/components/ProductCard'
import { getFeaturedProducts } from '@/lib/products'
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  GraduationCap,
  Leaf,
  MessageSquareText,
  Moon,
  Presentation,
  ShieldCheck,
  Sparkles,
  Star
} from 'lucide-react'
import { useEffect, useState } from 'react'

const sciencePoints = [
  {
    title: 'L-Theanine',
    detail: 'Studied for supporting relaxed alertness without the heavy feeling.',
    icon: Brain
  },
  {
    title: 'Magnesium Glycinate',
    detail: 'Supports normal nervous-system function in a highly usable chelated form.',
    icon: Sparkles
  },
  {
    title: 'Chicory Root Extract',
    detail: 'A prebiotic root ingredient included to help support magnesium absorption.',
    icon: Leaf
  }
]

const moments = [
  {
    title: 'Before the exam starts',
    detail: 'Settle the noise and walk in with a clearer head.',
    label: 'Students',
    icon: GraduationCap
  },
  {
    title: 'Before you enter the room',
    detail: 'Bring composed energy to interviews and important conversations.',
    label: 'Interviews',
    icon: BriefcaseBusiness
  },
  {
    title: 'Before all eyes are on you',
    detail: 'Find your pace before pitches, presentations and performances.',
    label: 'Presentations',
    icon: Presentation
  }
]

const testimonials = [
  {
    quote: 'Within about 20 minutes I felt more relaxed and could focus again. It tastes genuinely good too.',
    name: 'Siddhant',
    role: 'Student'
  },
  {
    quote: 'I was extremely nervous before an interview. A-Bar helped me feel composed enough to answer clearly.',
    name: 'Saksham Jain',
    role: 'Working professional'
  },
  {
    quote: 'It helped me stop spiralling over one thought and return to what I actually needed to do.',
    name: 'Shubhe Aditya',
    role: 'Student'
  }
]

export default function Home() {
  const products = getFeaturedProducts()
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState('')

  useEffect(() => {
    const refCode = new URLSearchParams(window.location.search).get('ref')
    if (refCode) {
      localStorage.setItem('affiliateCode', refCode.toUpperCase())
      fetch('/api/affiliate/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: refCode })
      }).catch(() => {})
    }

    if (window.gtag) {
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
    }).catch(() => {})
  }, [])

  const handleNotify = async (event) => {
    event.preventDefault()
    setNotifyStatus('loading')
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail, product: 'P-Bar' })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      setNotifyEmail('')
      setNotifyStatus('success')
    } catch {
      setNotifyStatus('error')
    }
  }

  return (
    <div className="premium-page overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 premium-hero-wash" />
        <div className="brand-container relative grid min-h-[calc(100svh-112px)] items-center gap-6 pb-14 pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pb-20 lg:pt-14">
          <div className="order-2 max-w-2xl text-center lg:order-1 lg:text-left">
            <p className="eyebrow justify-center lg:justify-start">
              <Sparkles className="h-3.5 w-3.5" /> Functional chocolate for calm focus
            </p>
            <h1 className="mt-5 text-balance font-playfair text-[2.85rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[#2d2019] sm:text-6xl lg:text-[5.25rem]">
              Calm your mind.
              <span className="block text-[#1f4b3c]">Own the moment.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#62574f] sm:text-lg lg:mx-0 lg:mt-7">
              A-Bar turns science-led calm support into premium chocolate—made for the minutes before an exam, interview or presentation.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/product/begood-abar-2pack">
                <Button size="lg" className="w-full sm:w-auto">
                  Try the A-Bar Duo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore the science
                </Button>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#544941] lg:justify-start sm:text-sm">
              {['100% natural', 'No added sugar', 'No pills or powders'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#1f4b3c]" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[560px] lg:order-2 lg:max-w-none">
            <div className="relative mx-auto aspect-[1.08/1] max-w-[390px] sm:max-w-[510px] lg:max-w-[650px]">
              <div className="absolute inset-[10%] rounded-full bg-[#d9cfe8] opacity-75 blur-[1px]" />
              <div className="absolute inset-[4%] rounded-full border border-[#8a79a8]/25" />
              <div className="absolute inset-[18%] rounded-full border border-dashed border-[#1f4b3c]/20" />
              <HeroPack />

              <div className="science-float left-0 top-[17%]">
                <Brain className="h-4 w-4 text-[#8a79a8]" />
                <span><strong>L-Theanine</strong><small>Relaxed alertness</small></span>
              </div>
              <div className="science-float bottom-[11%] right-0">
                <Clock3 className="h-4 w-4 text-[#1f4b3c]" />
                <span><strong>&lt;20 min</strong><small>Designed to act</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#2d2019]/10 bg-[#fffaf1]">
        <div className="brand-container grid grid-cols-2 divide-x divide-y divide-[#2d2019]/10 sm:grid-cols-4 sm:divide-y-0">
          {[
            ['100%', 'natural ingredients'],
            ['0g', 'added sugar'],
            ['<20', 'minutes to act'],
            ['4.9/5', 'customer rating']
          ].map(([number, label]) => (
            <div key={label} className="px-3 py-6 text-center sm:py-8">
              <p className="font-playfair text-2xl font-semibold text-[#1f4b3c] sm:text-3xl">{number}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#6e625a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ingredients" className="brand-section bg-[#1b4034] text-[#fffaf1]">
        <div className="brand-container">
          <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
            <div className="lg:sticky lg:top-36">
              <p className="eyebrow eyebrow-light"><Brain className="h-3.5 w-3.5" /> Science-led, food-first</p>
              <h2 className="mt-5 text-balance font-playfair text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">
                Calm focus, without turning wellness into homework.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#d9e2dc] sm:text-lg">
                We pair a researched calm-focus ingredient with familiar whole foods and a premium chocolate experience. Easy to carry. Easy to enjoy. Designed to support clarity without drowsiness.
              </p>
              <Link href="/how-it-works" className="mt-7 inline-flex items-center gap-2 border-b border-[#c9badf] pb-1 text-sm font-bold text-[#e6dcf2]">
                See our formulation approach <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4">
              {sciencePoints.map((point, index) => (
                <article key={point.title} className="science-row">
                  <span className="text-xs font-bold tracking-[0.18em] text-[#c9badf]">0{index + 1}</span>
                  <div className="science-row-icon"><point.icon className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-playfair text-2xl font-semibold">{point.title}</h3>
                    <p className="mt-2 leading-7 text-[#d9e2dc]">{point.detail}</p>
                  </div>
                </article>
              ))}

              <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06]">
                {[
                  ['01', 'Enjoy', 'Like premium chocolate'],
                  ['02', 'Prepare', 'Acts in less than 20 min'],
                  ['03', 'Step in', 'Calmer, clearer, composed']
                ].map(([number, title, detail]) => (
                  <div key={title} className="border-r border-white/10 p-4 last:border-r-0 sm:p-6">
                    <p className="text-xs font-bold text-[#c9badf]">{number}</p>
                    <p className="mt-5 font-playfair text-lg font-semibold sm:text-xl">{title}</p>
                    <p className="mt-2 text-[11px] leading-5 text-[#d9e2dc] sm:text-sm">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="max-w-2xl">
            <p className="eyebrow"><Moon className="h-3.5 w-3.5" /> Made for real life</p>
            <h2 className="mt-5 text-balance font-playfair text-4xl font-semibold leading-tight text-[#2d2019] sm:text-5xl">
              The moment matters. How you enter it matters more.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {moments.map((moment, index) => (
              <article key={moment.title} className={`moment-card moment-card-${index + 1}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-current/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">{moment.label}</span>
                  <moment.icon className="h-6 w-6" />
                </div>
                <div className="mt-20 sm:mt-28">
                  <h3 className="max-w-xs font-playfair text-3xl font-semibold leading-tight">{moment.title}</h3>
                  <p className="mt-3 max-w-sm leading-7 opacity-75">{moment.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section border-y border-[#2d2019]/10 bg-[#f4efe6]">
        <div className="brand-container">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Choose your ritual</p>
              <h2 className="mt-5 font-playfair text-4xl font-semibold text-[#2d2019] sm:text-5xl">Start with A-Bar</h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#1f4b3c] sm:flex">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="product-scroll mt-10">
            {products.map((product) => (
              <div key={product.id} className="product-scroll-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section bg-[#fffaf1]">
        <div className="brand-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow"><MessageSquareText className="h-3.5 w-3.5" /> Felt in real moments</p>
            <h2 className="mt-5 font-playfair text-4xl font-semibold leading-tight text-[#2d2019] sm:text-5xl">People don’t need more noise. They need their mind back.</h2>
            <div className="mt-6 flex items-center gap-2 text-[#1f4b3c]">
              {[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-5 w-5 fill-current" />)}
              <span className="ml-2 text-sm font-bold">Loved by early customers</span>
            </div>
          </div>

          <div className="grid gap-4">
            {testimonials.map((item, index) => (
              <blockquote key={item.name} className="testimonial-row">
                <span className="font-playfair text-4xl text-[#8a79a8]">“</span>
                <div>
                  <p className="text-base leading-7 text-[#463b34] sm:text-lg">{item.quote}</p>
                  <footer className="mt-4 text-sm font-bold text-[#1f4b3c]">
                    {item.name} <span className="font-normal text-[#756961]">· {item.role}</span>
                  </footer>
                </div>
                <span className="hidden font-playfair text-5xl font-semibold text-[#d8cde7] sm:block">0{index + 1}</span>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#8a79a8] px-6 py-12 text-center text-white sm:px-10 sm:py-16 lg:px-20">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full border border-white/20" />
            <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full border border-white/20" />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#f1eafa]">The next functional ritual</p>
            <h2 className="relative mx-auto mt-4 max-w-3xl font-playfair text-4xl font-semibold sm:text-5xl">P-Bar is coming next.</h2>
            <p className="relative mx-auto mt-4 max-w-xl leading-7 text-[#f3edf9]">
              Join the early list for our functional chocolate designed around menstrual comfort.
            </p>
            <form onSubmit={handleNotify} className="relative mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(event) => setNotifyEmail(event.target.value)}
                placeholder="Your email address"
                className="min-h-13 flex-1 rounded-full border-white/20 bg-white px-5 py-3.5 text-[#2d2019]"
              />
              <button disabled={notifyStatus === 'loading'} className="rounded-full bg-[#1f4b3c] px-7 py-3.5 font-bold text-white transition-colors hover:bg-[#173c30] disabled:opacity-60">
                {notifyStatus === 'loading' ? 'Joining…' : 'Join the list'}
              </button>
            </form>
            {notifyStatus === 'success' && <p className="relative mt-4 text-sm font-bold">You’re on the list.</p>}
            {notifyStatus === 'error' && <p className="relative mt-4 text-sm text-red-100">Please try again in a moment.</p>}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-4 sm:pb-28">
        <div className="brand-container text-center">
          <Sparkles className="mx-auto h-7 w-7 text-[#8a79a8]" />
          <h2 className="mx-auto mt-5 max-w-3xl text-balance font-playfair text-4xl font-semibold leading-tight text-[#2d2019] sm:text-6xl">
            Be ready for the moment that matters.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#6a5f57]">Keep calm focus within reach—in your bag, at your desk, or ready before the room.</p>
          <Link href="/product/begood-abar-2pack" className="mt-8 inline-flex">
            <Button size="lg">Try A-Bar <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
