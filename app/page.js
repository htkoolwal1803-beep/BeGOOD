'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import ProductCard from '@/components/ProductCard'
import { getFeaturedProducts, getUpcomingProducts } from '@/lib/products'
import { ArrowRight, CheckCircle, Star, Brain, Focus, Heart, Zap, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Home',
        page_location: window.location.href,
        page_path: '/'
      })
    }

    // Track to backend analytics
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

  return (
    <div className="animate-fade-in">
      {/* Brand Introduction Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block px-6 py-2 bg-[#F5F0E8] rounded-full mb-4">
              <span className="text-[#C8A97E] font-semibold text-sm">Introducing BeGood</span>
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Balance Your Emotions,
              <br />
              <span className="text-[#C8A97E]">The Convenient Way</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              The only brand that helps you balance your emotions in the most convenient and fast way
            </p>

            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              We create science-backed functional foods that help you manage your emotions naturally. 
              No therapy sessions, no complicated routines just convenient and delicious products that work when you need them most.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold mb-1">Science-Backed</h3>
                <p className="text-sm text-gray-600">Research-based formulations</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Fast Acting</h3>
                <p className="text-sm text-gray-600">Works in 15-20 minutes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🍫</div>
                <h3 className="font-semibold mb-1">Delicious</h3>
                <p className="text-sm text-gray-600">Tastes like premium chocolate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F5F0E8] to-white py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-[#C8A97E]/10 rounded-full">
                <span className="text-[#C8A97E] font-semibold text-sm">Just Feel It</span>
              </div>
              
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Calm Your Mind.
                <br />
                <span className="text-[#C8A97E]">Own The Moment.</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                A premium functional chocolate that helps reduces stress, short-term fear and nervousness and brings calm focus 
                when it matters most. 100% natural ingredients. No pills. No powders. Just delicious, science-backed wellness.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#B8956E] border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-[#C8A97E] text-[#C8A97E]" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Trusted by 1000+ Users</p>
                </div>
              </div>
            </div>

            {/* Right Content - Product Image */}
            <div className="relative">
              <div className="relative aspect-square">
                <Image
                  src="https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg"
                  alt="BeGood A-Bar"
                  fill
                  className="object-contain drop-shadow-2xl p-4"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When To Use Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">When It Matters Most</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your perfect companion for high-stakes moments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Before Your Exam', icon: Brain, desc: 'Stay calm and focused during tests' },
              { title: 'Before Your Interview', icon: Focus, desc: 'Project confidence and clarity' },
              { title: 'Before Presentations', icon: Zap, desc: 'Speak with poise and assurance' },
              { title: 'When Feeling Anxious', icon: Heart, desc: 'Restore calm and composure' }
            ].map((occasion, idx) => (
              <div key={idx} className="bg-[#F5F0E8] p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <occasion.icon className="w-12 h-12 text-[#C8A97E] mb-4" />
                <h3 className="font-playfair text-xl font-semibold mb-2">{occasion.title}</h3>
                <p className="text-gray-600">{occasion.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Aspects Section */}
      <section className="py-20 bg-gradient-to-br from-[#F5F0E8] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Why Choose BeGood?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium quality you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {[
              '100% Natural Ingredients',
              'No Added Sugar',
              'No Added Preservatives',
              'Science-Backed Formula',
              'Quick Acting (15-20 min)',
              'Delicious & Convenient'
            ].map((aspect, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#C8A97E] flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{aspect}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Science Meets Taste</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Functional ingredients that work, wrapped in delicious chocolate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Reduces anxiety and nervousness',
              'Enhances mental clarity and focus',
              'Promotes calm without drowsiness',
              'Improves performance under pressure',
              'Shifts brain from panic to alpha-wave calm',
              'Balances cortisol and stress hormones'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#C8A97E] flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlight */}
      <section className="py-20 bg-gradient-to-br from-[#F5F0E8] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
            <p className="text-xl text-gray-600">Functional wellness, perfectly crafted</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
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
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-[#F5F0E8] p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#C8A97E] text-[#C8A97E]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Product - P-Bar */}
      {upcomingProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-[#C8A97E] to-[#B8956E] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Bell className="w-16 h-16 mx-auto mb-6 animate-pulse" />
              <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Coming Soon: P-Bar</h2>
              <p className="text-xl mb-8 opacity-90">
                A functional chocolate bar designed to help manage menstrual discomfort. 
                Be the first to know when we launch!
              </p>

              {/* Notify Me Form */}
              <form onSubmit={handleNotifySubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <Button 
                    type="submit" 
                    variant="secondary" 
                    size="lg"
                    className="whitespace-nowrap"
                  >
                    Notify Me
                  </Button>
                </div>
                {notifySuccess && (
                  <p className="mt-4 text-white font-semibold">✓ Thanks! We'll notify you when P-Bar launches.</p>
                )}
                {notifyError && (
                  <p className="mt-4 text-red-200">{notifyError}</p>
                )}
              </form>

              <p className="mt-6 text-sm opacity-75">
                Join the waitlist and get exclusive early access
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Ready To Feel Your Best?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands who trust BeGood for their most important moments
          </p>
          <Link href="/shop">
            <Button size="lg">
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
