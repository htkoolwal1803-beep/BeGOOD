'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Brain,
  CircleDot,
  Clock3,
  HeartPulse,
  Leaf,
  Pause,
  Play,
  RefreshCcw,
  Sparkles,
  Waves
} from 'lucide-react'
import Button from '@/components/Button'
import { ABAR_HERO_SRC } from '@/components/HeroPack'

const stages = [
  {
    time: '0 min',
    label: 'Take a bite',
    title: 'The ritual begins.',
    detail: 'A-Bar gives you a clear starting signal: pause, eat, and shift from rushing into preparation.',
    status: 'A-Bar enters digestion',
    icon: CircleDot,
    color: '#bfaed7'
  },
  {
    time: 'First minutes',
    label: 'Digest',
    title: 'The bar starts breaking down.',
    detail: 'The chocolate and whole-food base move through normal digestion, releasing the functional ingredients in the formula.',
    status: 'Formula is being released',
    icon: Sparkles,
    color: '#d49a74'
  },
  {
    time: 'As it absorbs',
    label: 'Move',
    title: 'The key ingredients become available.',
    detail: 'L-Theanine and magnesium move through the normal absorption pathway. Chicory root supports the formula’s magnesium-absorption strategy.',
    status: 'Ingredients enter circulation',
    icon: HeartPulse,
    color: '#8db09a'
  },
  {
    time: '< 20 min',
    label: 'Calm focus',
    title: 'Step into the moment composed.',
    detail: 'The formula is designed to support relaxed alertness and normal nervous-system function. A-Bar is designed to act in less than 20 minutes.',
    status: 'Calm-focus support is active',
    icon: Brain,
    color: '#a995c7'
  }
]

const ingredientRoles = [
  {
    symbol: 'LT',
    name: 'L-Theanine',
    role: 'Relaxed alertness',
    text: 'Studied for supporting a calm but attentive state without drowsiness.',
    color: 'bg-[#ede4f4] text-[#735f94]'
  },
  {
    symbol: 'Mg',
    name: 'Magnesium Glycinate',
    role: 'Nervous-system support',
    text: 'Magnesium contributes to normal nervous-system and psychological function.',
    color: 'bg-[#e5efe7] text-[#1f4b3c]'
  },
  {
    symbol: 'Cr',
    name: 'Chicory Root',
    role: 'Absorption strategy',
    text: 'A prebiotic root ingredient included to support magnesium absorption.',
    color: 'bg-[#f4e6dc] text-[#9c5137]'
  }
]

const particlePositions = [
  [{ left: 23, top: 19 }, { left: 28, top: 17 }, { left: 33, top: 20 }],
  [{ left: 33, top: 58 }, { left: 39, top: 63 }, { left: 45, top: 57 }],
  [{ left: 58, top: 57 }, { left: 64, top: 51 }, { left: 69, top: 59 }],
  [{ left: 72, top: 22 }, { left: 77, top: 18 }, { left: 81, top: 25 }]
]

export default function HowItWorksSection() {
  const [activeStage, setActiveStage] = useState(0)
  const [playing, setPlaying] = useState(true)
  const active = stages[activeStage]
  const ActiveIcon = active.icon

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [playing])

  const chooseStage = (index) => {
    setActiveStage(index)
    setPlaying(false)
  }

  const restart = () => {
    setActiveStage(0)
    setPlaying(true)
  }

  return (
    <div className="brand-page overflow-hidden">
      <section className="relative border-b border-[#e4d8c7] py-16 sm:py-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#d8c9e8]/45 blur-3xl" />
        <div className="brand-container relative grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="brand-pill"><Waves className="h-4 w-4" /> Interactive working model</span>
            <h1 className="mt-6 font-playfair text-5xl font-bold leading-[1.03] text-[#2d2019] sm:text-6xl lg:text-7xl">
              Watch A-Bar move from bite to calm focus.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#59615b] sm:text-xl">
              Play the model or select any stage to see how the ritual, digestion and key ingredients connect—designed to act in less than 20 minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/product/begood-abar-001"><Button size="lg">Try A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <a href="#working-model"><Button variant="outline" size="lg">Open the model</Button></a>
            </div>
          </div>
          <div className="relative mx-auto h-[330px] w-full max-w-xl sm:h-[420px]">
            <div className="absolute inset-[8%] rounded-full bg-[#c9badc]/30 blur-3xl" />
            <img src={ABAR_HERO_SRC} alt="BeGood A-Bar transparent product pack" className="relative z-10 h-full w-full object-contain drop-shadow-[0_30px_26px_rgba(45,32,25,.2)]" />
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#cbbddd] bg-[#fffaf1]/95 px-4 py-2 text-sm font-extrabold text-[#1f4b3c] shadow-lg backdrop-blur">
              <Clock3 className="h-4 w-4" /> Acts in less than 20 min
            </div>
          </div>
        </div>
      </section>

      <section id="working-model" className="py-16 sm:py-24">
        <div className="brand-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="brand-pill">Tap through the pathway</span>
            <h2 className="mt-5 font-playfair text-4xl font-bold text-[#2d2019] sm:text-5xl">A working model you can actually follow.</h2>
            <p className="mt-5 text-lg leading-8 text-[#59615b]">The moving dots represent the three key ingredients. Select a stage to pause the animation and inspect what is happening.</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#d8c8b0] bg-[#172f28] shadow-[0_28px_70px_rgba(23,47,40,.18)]">
            <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
              <div className="relative min-h-[480px] overflow-hidden border-b border-white/10 p-5 sm:min-h-[610px] sm:p-8 lg:border-b-0 lg:border-r">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(191,174,215,.17),transparent_55%)]" />

                <svg viewBox="0 0 600 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="flow-gradient" x1="0" x2="1">
                      <stop offset="0" stopColor="#bfaed7" />
                      <stop offset="0.5" stopColor="#8db09a" />
                      <stop offset="1" stopColor="#d49a74" />
                    </linearGradient>
                    <filter id="soft-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <path d="M145 110 C150 210 190 310 245 345 C330 395 425 350 460 265 C490 195 470 128 430 100" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="22" strokeLinecap="round" />
                  <path d="M145 110 C150 210 190 310 245 345 C330 395 425 350 460 265 C490 195 470 128 430 100" fill="none" stroke="url(#flow-gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="9 16" filter="url(#soft-glow)">
                    {playing && <animate attributeName="stroke-dashoffset" from="50" to="0" dur="1.4s" repeatCount="indefinite" />}
                  </path>
                  <path d="M250 346 C290 300 322 255 355 205" fill="none" stroke="rgba(141,176,154,.38)" strokeWidth="3" strokeDasharray="5 10" />
                </svg>

                <div className="absolute left-[14%] top-[10%] text-center">
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full border transition-all duration-500 sm:h-20 sm:w-20 ${activeStage === 0 ? 'scale-110 border-[#bfaed7] bg-[#bfaed7] text-[#2d2019] shadow-[0_0_35px_rgba(191,174,215,.6)]' : 'border-white/15 bg-white/5 text-white/65'}`}>
                    <CircleDot className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white/75">Bite</p>
                </div>
                <div className="absolute bottom-[12%] left-[30%] text-center">
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[42%_58%_55%_45%] border transition-all duration-500 sm:h-20 sm:w-20 ${activeStage === 1 ? 'scale-110 border-[#d49a74] bg-[#d49a74] text-[#2d2019] shadow-[0_0_35px_rgba(212,154,116,.55)]' : 'border-white/15 bg-white/5 text-white/65'}`}>
                    <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white/75">Digestion</p>
                </div>
                <div className="absolute bottom-[15%] right-[20%] text-center">
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full border transition-all duration-500 sm:h-20 sm:w-20 ${activeStage === 2 ? 'scale-110 border-[#8db09a] bg-[#8db09a] text-[#172f28] shadow-[0_0_35px_rgba(141,176,154,.55)]' : 'border-white/15 bg-white/5 text-white/65'}`}>
                    <HeartPulse className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white/75">Absorption</p>
                </div>
                <div className="absolute right-[12%] top-[9%] text-center">
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[55%_45%_48%_52%] border transition-all duration-500 sm:h-20 sm:w-20 ${activeStage === 3 ? 'scale-110 border-[#a995c7] bg-[#a995c7] text-[#2d2019] shadow-[0_0_38px_rgba(169,149,199,.65)]' : 'border-white/15 bg-white/5 text-white/65'}`}>
                    <Brain className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white/75">Calm focus</p>
                </div>

                {ingredientRoles.map((ingredient, index) => {
                  const position = particlePositions[activeStage][index]
                  return (
                    <div
                      key={ingredient.symbol}
                      className="absolute z-20 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#fffaf1] text-[10px] font-black text-[#2d2019] shadow-[0_0_20px_rgba(255,250,241,.55)] transition-all duration-1000 ease-in-out motion-safe:animate-pulse sm:h-11 sm:w-11 sm:text-xs"
                      style={{ left: `${position.left}%`, top: `${position.top}%`, transitionDelay: `${index * 110}ms` }}
                      title={ingredient.name}
                    >
                      {ingredient.symbol}
                    </div>
                  )
                })}

                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0f241e]/90 p-3 backdrop-blur sm:bottom-7 sm:left-7 sm:right-7 sm:p-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bfaed7] opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-[#bfaed7]" /></span>
                    <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9fb3aa]">Live stage</p><p className="text-sm font-bold text-white sm:text-base">{active.status}</p></div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-[#fffaf1]">{active.time}</span>
                </div>
              </div>

              <div className="flex flex-col p-5 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#bfaed7]">Model controls</p><p className="mt-1 text-sm text-[#aebfb7]">Auto-plays every stage</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause model' : 'Play model'} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                    <button onClick={restart} aria-label="Restart model" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"><RefreshCcw className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-4 gap-2">
                  {stages.map((stage, index) => (
                    <button key={stage.label} onClick={() => chooseStage(index)} className="group text-left" aria-label={`Show stage ${index + 1}: ${stage.label}`}>
                      <span className={`block h-1.5 rounded-full transition-colors ${index <= activeStage ? 'bg-[#bfaed7]' : 'bg-white/10'}`} />
                      <span className={`mt-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] transition-colors sm:text-xs ${index === activeStage ? 'text-white' : 'text-[#81938b] group-hover:text-[#cddbd4]'}`}>0{index + 1}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: active.color }}>{active.label}</p><h3 className="mt-2 font-playfair text-3xl font-bold text-white">{active.title}</h3></div>
                    <ActiveIcon className="h-7 w-7 shrink-0" style={{ color: active.color }} />
                  </div>
                  <p className="mt-4 leading-7 text-[#cddbd4]">{active.detail}</p>
                </div>

                <div className="mt-5 space-y-2">
                  {stages.map((stage, index) => (
                    <button key={stage.label} onClick={() => chooseStage(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${index === activeStage ? 'border-[#bfaed7]/60 bg-[#bfaed7]/10' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/5'}`}>
                      <span className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${index === activeStage ? 'bg-[#bfaed7] text-[#2d2019]' : 'bg-white/[0.08] text-[#8fa39a]'}`}>{index + 1}</span><span className={`text-sm font-bold ${index === activeStage ? 'text-white' : 'text-[#b7c6bf]'}`}>{stage.label}</span></span>
                      <span className="text-xs font-semibold text-[#83958d]">{stage.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e4d8c7] bg-[#f3ecdf] py-20 sm:py-24">
        <div className="brand-container">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <span className="brand-pill">What each signal represents</span>
              <h2 className="mt-5 font-playfair text-4xl font-bold text-[#2d2019] sm:text-5xl">Three ingredients. Three clear roles.</h2>
              <p className="mt-5 text-lg leading-8 text-[#59615b]">The model is simplified so the relationship is easy to understand. It shows the intended pathway, not a literal scan of the body.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {ingredientRoles.map((ingredient) => (
                <article key={ingredient.name} className="rounded-[1.5rem] border border-[#d8c8b0] bg-[#fffaf1] p-6">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl text-sm font-black ${ingredient.color}`}>{ingredient.symbol}</span>
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8a79a8]">{ingredient.role}</p>
                  <h3 className="mt-2 text-xl font-bold text-[#2d2019]">{ingredient.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#59615b]">{ingredient.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="brand-container">
          <div className="grid items-center gap-7 rounded-[2rem] border border-[#c9badc] bg-[#f1eaf7] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#735f94]">Important context</p>
              <h2 className="mt-3 font-playfair text-3xl font-bold text-[#2d2019] sm:text-4xl">Designed to act in less than 20 minutes.</h2>
              <p className="mt-4 max-w-3xl leading-7 text-[#5e5367]">This is an illustrative educational model. A-Bar is a functional food, not a medicine, and individual timing and experience can vary.</p>
            </div>
            <Link href="/product/begood-abar-001"><Button size="lg">Shop A-Bar <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
