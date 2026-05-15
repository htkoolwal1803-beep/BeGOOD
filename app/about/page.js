import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/Button'
import { ArrowRight, Target, Heart, Award } from 'lucide-react'

export const metadata = {
  title: 'About Us - BeGood | Just Feel It',
  description: 'Learn about BeGood\'s mission to bring calm, focus, and wellness through premium functional chocolate.'
}

export default function AboutPage() {
  const ingredients = [
    {
      name: 'Walnuts',
      image: '/ingredients/walnuts.jpg',
      benefit: 'Naturally nutrient-rich nuts that support brain health and add a satisfying, wholesome texture.'
    },
    {
      name: 'Pumpkin Seeds',
      image: '/ingredients/pumpkin-seeds.jpg',
      benefit: 'A clean seed source that brings minerals, plant-based goodness, and steady nourishment.'
    },
    {
      name: 'Cocoa Butter',
      image: '/ingredients/cocoa-butter.jpg',
      benefit: 'A smooth cocoa-derived fat that gives A-Bar its premium chocolate mouthfeel.'
    },
    {
      name: 'L-Theanine',
      image: '/ingredients/l-theanine.jpg',
      benefit: 'Supports calm focus without drowsiness, helping you feel composed when it matters.'
    }
  ]

  return (
    <div className="brand-page min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#fbf7ed]/75 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">
              Just Feel It
            </h1>
            <p className="text-xl md:text-2xl text-[#59615b] leading-relaxed">
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
              <div className="space-y-4 text-[#464c49] text-lg leading-relaxed">
                <p>
                  BeGood was born from a simple observation: everyone focuses on gaining knowledge,
                  improving health or just are not in own control. But nobody focuses on emotions despite it been the 
                  major stakeholder for our decisions and relations.
                </p>
                <p>
                  We asked ourselves: why is that so and we figured that that's because we have been told that emotions can 
                  only be controlled or balanced with your will and mind persistence. It was hard and inconvenient. So we asked
                  ourselves, What if it was something you actually enjoyed and is fast and convenient?
                </p>
                <p>
                  That's how BeGood came to life—premium products with science-backed ingredients. Delicious. Effective. Convenient.
                </p>
              </div>
            </div>
            <div className="relative bg-[#f4ecdd] rounded-2xl overflow-hidden">
              <Image
                src="/a-bar-packaging.png"
                alt="BeGood Product"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-20 bg-[#f4ecdd]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-xl text-[#59615b] max-w-2xl mx-auto">
              We're on a mission to make emotional wellness convinient, enjoyable, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="brand-card p-8 text-center">
              <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-[#6f8a74]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Science-Backed</h3>
              <p className="text-[#464c49]">
                Every ingredient is carefully selected based on research and proven benefits. 
                We don't compromise on efficacy.
              </p>
            </div>

            <div className="brand-card p-8 text-center">
              <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#6f8a74]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Human First</h3>
              <p className="text-[#464c49]">
                We understand real stress because we've lived it. Our products are designed 
                for real people facing real moments.
              </p>
            </div>

            <div className="brand-card p-8 text-center">
              <div className="w-16 h-16 bg-[#6f8a74]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#6f8a74]" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4">Premium Quality</h3>
              <p className="text-[#464c49]">
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
            <p className="text-xl text-[#59615b] mb-12 text-center">
              Our formula combines traditional adaptogens with modern nutritional science
            </p>

              <div className="grid gap-6 md:grid-cols-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.name} className="brand-card overflow-hidden">
                    <div className="relative aspect-[4/3]">
                      <Image src={ingredient.image} alt={ingredient.name} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3">{ingredient.name}</h3>
                      <p className="text-[#464c49] leading-relaxed">{ingredient.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#6f8a74] to-[#536a58] text-white">
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
