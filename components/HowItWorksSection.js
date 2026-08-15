import Link from 'next/link'
import { ArrowDown, ArrowRight, Brain, Check, Clock3, Leaf, Sparkles, Waves } from 'lucide-react'
import Button from '@/components/Button'

const journey = [
  {
    number: '01',
    time: 'The first bite',
    title: 'Make it a deliberate pause.',
    text: 'Eat one A-Bar before the moment that matters. The chocolate format turns preparation into a familiar, enjoyable ritual.',
    icon: Sparkles,
    tone: 'bg-[#f1eaf7] text-[#735f94]'
  },
  {
    number: '02',
    time: 'Digestion begins',
    title: 'The formula becomes available.',
    text: 'As the bar is digested, L-Theanine, magnesium glycinate and chicory root move through the same normal digestive process as food.',
    icon: Leaf,
    tone: 'bg-[#e5efe7] text-[#1f4b3c]'
  },
  {
    number: '03',
    time: 'Around 30–45 min',
    title: 'Step into the moment prepared.',
    text: 'The ritual is designed to support relaxed alertness and normal nervous-system function—without positioning A-Bar as a medicine.',
    icon: Brain,
    tone: 'bg-[#f4e6dc] text-[#9c5137]'
  }
]

const formula = [
  {
    symbol: 'LT',
    title: 'L-Theanine',
    amount: '140 mg',
    role: 'Calm-alertness support',
    detail: 'An amino acid studied for supporting a relaxed yet attentive state without drowsiness.',
    result: 'Relaxed alertness'
  },
  {
    symbol: 'Mg',
    title: 'Magnesium Glycinate',
    amount: '134 mg · 20% RDA',
    role: 'Nervous-system support',
    detail: 'A chelated magnesium source. Magnesium contributes to normal nervous-system and psychological function.',
    result: 'Steadier preparation'
  },
  {
    symbol: 'Cr',
    title: 'Chicory Root',
    amount: '2.18 g',
    role: 'Absorption strategy',
    detail: 'A prebiotic root ingredient included to help support the formula’s magnesium-absorption strategy.',
    result: 'Formula support'
  }
]

export default function HowItWorksSection() {
  return (
    <div className="brand-page overflow-hidden">
      <section className="relative border-b border-[#e4d8c7] py-16 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-[#d8c9e8]/45 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#dce9dc]/70 blur-3xl" />
        <div className="brand-container relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="brand-pill"><Waves className="h-4 w-4" /> From bite to focused moment</span>
            <h1 className="mt-6 max-w-3xl font-playfair text-5xl font-bold leading-[1.02] text-[#2d2019] sm:text-6xl lg:text-7xl">
              A simple ritual, explained with clarity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#59615b] sm:text-xl">
              No exaggerated body animation. No mystery. See what is in A-Bar, why each key ingredient is there, and how to fit it into a high-stakes day.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/product/begood-abar-001"><Button size="lg">Shop A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <a href="#journey"><Button variant="outline" size="lg">Follow the journey <ArrowDown className="ml-2 h-5 w-5" /></Button></a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-[#8a79a8]/15 blur-3xl" />
            <div className="brand-panel relative overflow-hidden p-5 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#e4d8c7] pb-5">
                <div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#8a79a8]">A-Bar formula</p><p className="mt-1 font-playfair text-2xl font-bold">Three-part focus</p></div>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#172f28] text-white"><Brain className="h-6 w-6" /></span>
              </div>
              <div className="mt-6 space-y-4">
                {formula.map((ingredient, index) => (
                  <div key={ingredient.title} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl border border-[#e4d8c7] bg-white/75 p-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ede4f4] text-sm font-black text-[#735f94]">{ingredient.symbol}</span>
                    <div><p className="font-bold leading-tight">{ingredient.title}</p><p className="mt-1 text-xs text-[#6b736d]">{ingredient.role}</p></div>
                    <span className="rounded-full bg-[#eef3ea] px-2.5 py-1 text-xs font-extrabold text-[#1f4b3c]">{ingredient.amount.split(' · ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#172f28] p-4 text-[#fffaf1]">
                <Clock3 className="h-6 w-6 shrink-0 text-[#c9b9df]" />
                <p className="text-sm leading-5"><strong>Suggested timing:</strong> enjoy one bar around 30–45 minutes before your high-stakes moment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="py-20 sm:py-24">
        <div className="brand-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="brand-pill">The experience</span>
            <h2 className="mt-5 font-playfair text-4xl font-bold text-[#2d2019] sm:text-5xl">Three steps. One clear routine.</h2>
            <p className="mt-5 text-lg leading-8 text-[#59615b]">Each stage answers the question a customer actually has: what do I do, what happens next, and when should I use it?</p>
          </div>

          <div className="relative mx-auto mt-12 max-w-6xl">
            <div className="absolute left-[16.66%] right-[16.66%] top-[44px] hidden h-px bg-gradient-to-r from-[#cbb8dc] via-[#9db6a1] to-[#d7a992] lg:block" />
            <div className="grid gap-5 lg:grid-cols-3">
              {journey.map((step) => {
                const Icon = step.icon
                return (
                  <article key={step.number} className="brand-card relative p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className={`relative z-10 grid h-[88px] w-[88px] place-items-center rounded-full border-8 border-[#fffaf1] ${step.tone}`}><Icon className="h-8 w-8" /></span>
                      <span className="font-playfair text-5xl font-bold text-[#ded4c5]">{step.number}</span>
                    </div>
                    <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.17em] text-[#8a79a8]">{step.time}</p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight text-[#2d2019]">{step.title}</h3>
                    <p className="mt-4 leading-7 text-[#59615b]">{step.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#172f28] py-20 text-[#fffaf1] sm:py-24">
        <div className="brand-container">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">Inside the formula</p>
              <h2 className="mt-4 font-playfair text-4xl font-bold sm:text-5xl">Ingredient → role → intended experience.</h2>
              <p className="mt-5 text-lg leading-8 text-[#cddbd4]">A more intuitive way to read the science—without presenting an ingredient study as proof of a finished-product outcome.</p>
            </div>
            <div className="space-y-4">
              {formula.map((ingredient) => (
                <article key={ingredient.title} className="rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-5 sm:p-6">
                  <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#bfaed7] font-black text-[#2d2019]">{ingredient.symbol}</span>
                      <div><p className="font-bold">{ingredient.title}</p><p className="mt-1 text-sm text-[#b9cbc2]">{ingredient.amount}</p></div>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-[#8fa69a] sm:block" />
                    <div><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#bfaed7]">{ingredient.result}</p><p className="mt-2 text-sm leading-6 text-[#dce6e1]">{ingredient.detail}</p></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="brand-container">
          <div className="grid items-center gap-8 rounded-[2rem] border border-[#c9badc] bg-[#f1eaf7] p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-[#735f94]"><Check className="h-4 w-4" /> Clear, responsible science</span>
              <h2 className="mt-4 font-playfair text-3xl font-bold text-[#2d2019] sm:text-4xl">Ready to make calm focus part of your preparation?</h2>
              <p className="mt-4 max-w-3xl leading-7 text-[#5e5367]">A-Bar is a functional food, not a medicine. It is not intended to diagnose, treat, cure or prevent disease. Ingredient research does not guarantee an individual result.</p>
            </div>
            <Link href="/product/begood-abar-001"><Button size="lg">Try A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
