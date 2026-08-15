import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Brain, Heart, Leaf, Microscope, ShieldCheck, Sparkles, Target } from 'lucide-react'
import Button from '@/components/Button'

export const metadata = {
  title: 'About BeGood | A Focused Mind, On Demand',
  description: 'Meet BeGood—the science-led functional food brand creating a simpler calm-focus ritual for high-stakes moments.'
}

const values = [
  { icon: Microscope, title: 'Science, made understandable', text: 'We explain ingredient roles and quantities in plain language, with clear limits on what a functional food can promise.' },
  { icon: Heart, title: 'Human moments first', text: 'Every product begins with a real moment: the exam, interview, presentation or conversation where composure matters.' },
  { icon: ShieldCheck, title: 'Clarity builds trust', text: 'From the full formula to delivery fees and checkout, important information should never be hidden.' }
]

const ingredients = [
  { icon: Brain, name: 'L-Theanine', amount: '140 mg', text: 'Studied for supporting relaxed alertness without drowsiness.' },
  { icon: Sparkles, name: 'Magnesium Glycinate', amount: '134 mg · 20% RDA', text: 'Supports normal nervous-system and psychological function.' },
  { icon: Leaf, name: 'Chicory Root', amount: '2.18 g', text: 'A prebiotic root ingredient included to support the magnesium-absorption strategy.' }
]

export default function AboutPage() {
  return (
    <div className="brand-page min-h-screen overflow-hidden">
      <section className="relative py-16 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-[#dce9dc] blur-3xl" />
        <div className="brand-container relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="brand-pill"><Target className="h-4 w-4" /> Our point of view</span>
            <h1 className="mt-6 font-playfair text-5xl font-bold leading-[1.03] text-[#2d2019] sm:text-6xl lg:text-7xl">Your state of mind is part of your preparation.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#59615b] sm:text-xl">BeGood exists to make emotional preparation more practical—through thoughtfully formulated foods that fit naturally into real life.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/shop"><Button size="lg">Explore A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link><Link href="/how-it-works"><Button variant="outline" size="lg">See how it works</Button></Link></div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#d8c8b0] bg-[radial-gradient(circle_at_50%_35%,#fffaf1_0%,#eee3ce_74%)] shadow-[0_30px_80px_rgba(64,46,35,0.12)]">
            <Image src="/a-bar-packaging.png" alt="BeGood A-Bar functional chocolate" fill priority className="object-contain p-8 sm:p-12" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8a79a8]">The idea</p><p className="mt-1 font-bold text-[#2d2019]">A focused mind, on demand.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#172f28] py-20 text-[#fffaf1] sm:py-24">
        <div className="brand-container grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">Why we started</p><h2 className="mt-4 font-playfair text-4xl font-bold sm:text-5xl">Knowledge matters. So does the state in which you use it.</h2></div>
          <div className="space-y-5 text-lg leading-8 text-[#dce6e1]">
            <p>People spend years building skills, yet the minutes before an exam, interview or presentation can still feel noisy. We saw a need for a preparation ritual that was convenient, familiar and easy to use.</p>
            <p>A-Bar is our first answer: functional ingredients in a premium chocolate format, designed for calmer, clearer high-stakes moments. It does not replace sleep, practice, therapy or medical care. It simply gives preparation a tangible final step.</p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="brand-container">
          <div className="mx-auto max-w-3xl text-center"><span className="brand-pill">What guides us</span><h2 className="mt-5 font-playfair text-4xl font-bold sm:text-5xl">Professional by design. Responsible by default.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="brand-card p-6 sm:p-8"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7def1]"><Icon className="h-6 w-6 text-[#735f94]" /></span><span className="font-playfair text-4xl font-bold text-[#ded4c5]">0{index + 1}</span></div><h3 className="mt-6 text-2xl font-bold text-[#2d2019]">{title}</h3><p className="mt-3 leading-7 text-[#59615b]">{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e4d8c7] bg-[#f3ecdf] py-20 sm:py-24">
        <div className="brand-container">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div><span className="brand-pill">Formula philosophy</span><h2 className="mt-5 font-playfair text-4xl font-bold text-[#2d2019] sm:text-5xl">Focused ingredients, clearly explained.</h2><p className="mt-5 text-lg leading-8 text-[#59615b]">These are the three ingredients at the centre of A-Bar. The product page lists all 18 formula ingredients and their quantities.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {ingredients.map(({ icon: Icon, name, amount, text }) => (
                <article key={name} className="rounded-[1.5rem] border border-[#d8c8b0] bg-[#fffaf1] p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dce6d7]"><Icon className="h-6 w-6 text-[#1f4b3c]" /></span><p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8a79a8]">{amount}</p><h3 className="mt-2 text-xl font-bold">{name}</h3><p className="mt-3 text-sm leading-6 text-[#59615b]">{text}</p></article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="brand-container"><div className="grid items-center gap-7 rounded-[2rem] bg-[linear-gradient(135deg,#efe5f5_0%,#e6efe4_100%)] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12"><div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#735f94]">Our first chapter</p><h2 className="mt-3 font-playfair text-4xl font-bold text-[#2d2019]">Meet the bar that started BeGood.</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[#59615b]">A-Bar turns calm-focus support into a chocolate ritual you can keep in your bag, desk or study space.</p></div><Link href="/product/begood-abar-001"><Button size="lg">Shop A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link></div></div>
      </section>
    </div>
  )
}
