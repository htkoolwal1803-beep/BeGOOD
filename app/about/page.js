import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import { ArrowRight, Target, Heart, Award } from 'lucide-react'

export const metadata = {
  title: 'About Us - BeGood | Just Feel It',
  description: 'Learn about BeGood\'s mission to bring calm, focus, and wellness through premium functional chocolate.'
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#F5F0E8] to-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">
              Just Feel It
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              We believe wellness should be delicious, convenient, and effective. 
              That's why we created BeGood—functional consumables that helps you improve your human performance
              when it matters most.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="font-playfair text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  BeGood was born from a simple observation: everyone focuses on gaining knowledge,
                  improving health or just are not in own control. But nobody focuses on emotions despite it been the 
                  major stakeholder for our decisions and relations.
                </p>
                <p>
                  We asked ourselves: why is that so and we figured that that's because we have been told that emotions can 
                  only be controlled or balanced with your will and mind persistance. It was hard and inconvinient. So we asked
                  ourselves, What if it was something you actually enjoyed and is fast and convinient?
                </p>
                <p>
                  That's how BeGood came to life—premium products with science-backed ingredients. Delicious. Effective. Convenient.
                </p>
              </div>
            </div>
            <div className="relative aspect-square bg-[#F5F0E8] rounded-2xl overflow-hidden">
              <Image
                src="https://customer-assets.emergentagent.com/job_aba2787e-1b7f-4ca4-8c0f-6bdec7418ef0/artifacts/e2gmlali_A%20chocolate%20that%20Induces%20Calm%20and%20Focus..jpg"
                alt="BeGood Product"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to make emotional wellness convinient, enjoyable, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-[#C8A97E]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Science-Backed</h3>
              <p className="text-gray-700">
                Every ingredient is carefully selected based on research and proven benefits. 
                We don't compromise on efficacy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#C8A97E]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Human First</h3>
              <p className="text-gray-700">
                We understand real stress because we've lived it. Our products are designed 
                for real people facing real moments.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#C8A97E]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Premium Quality</h3>
              <p className="text-gray-700">
                All our ingredients are of premium quality and 100% natural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Science */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-8 text-center">The Science Behind BeGood</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Our formula combines traditional adaptogens with modern nutritional science
            </p>

              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3">L-Theanine</h3>
                <p className="text-gray-700 leading-relaxed">
                  An amino acid that promotes alpha brain waves associated with relaxed alertness. 
                  It enhances focus without causing drowsiness.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3">Magnesium</h3>
                <p className="text-gray-700 leading-relaxed">
                  An essential mineral that supports nervous system function and helps regulate 
                  stress response. It promotes muscle relaxation and better sleep quality.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3">Dark Chocolate</h3>
                <p className="text-gray-700 leading-relaxed">
                  Rich in flavonoids and natural mood enhancers. Dark cocoa has been shown to 
                  improve blood flow to the brain and boost cognitive function.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#C8A97E] to-[#B8956E] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Experience the Difference</h2>
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
