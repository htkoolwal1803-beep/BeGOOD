'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import ProductCard from '@/components/ProductCard'
import { products } from '@/lib/products'
import { ArrowRight, CheckCircle, Star, Brain, Focus, Heart, Zap } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
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

  return (
    <div className="animate-fade-in">
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
                A premium functional chocolate that reduces anxiety and brings calm focus 
                when it matters most. No pills. No powders. Just delicious, science-backed wellness.
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
                  <p className="text-sm text-gray-600">Loved by 10,000+ customers</p>
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
                  className="object-contain drop-shadow-2xl"
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
              { title: 'Stressful Days', icon: Heart, desc: 'Maintain balance and composure' }
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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-[#F5F0E8] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Science Meets Taste</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium ingredients that work, wrapped in delicious dark chocolate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Reduces anxiety and nervousness',
              'Enhances mental clarity and focus',
              'Promotes calm without drowsiness',
              'Improves performance under pressure',
              'Delicious and convenient',
              'Science-backed ingredients'
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
            <p className="text-xl text-gray-600">Functional wellness, perfectly crafted</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.filter(p => p.featured).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Priya S.',
                role: 'Student',
                comment: 'This saved me during my board exams! Felt so much calmer and could focus better. Plus it tastes amazing!',
                rating: 5
              },
              {
                name: 'Rahul M.',
                role: 'Professional',
                comment: 'Had my job interview and was super nervous. Had this bar 30 mins before and felt noticeably more relaxed. Got the job!',
                rating: 5
              },
              {
                name: 'Ananya K.',
                role: 'Working Professional',
                comment: 'Works really well for my anxiety. The dark chocolate flavor is rich and premium. Worth every penny!',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm">
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#C8A97E] to-[#B8956E] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Ready To Feel Your Best?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands who trust BeGood for their most important moments
          </p>
          <Link href="/shop">
            <Button variant="secondary" size="lg">
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}