'use client'

import { useEffect, useRef } from 'react'

export default function HowItWorksSection() {
  const containerRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Initialize the How It Works functionality
    const initHowItWorks = () => {
      const container = containerRef.current
      if (!container) return

      // Position constants for the body diagram
      const POS = {
        mouth: { x: 50, y: 8 },
        stomach: { x: 44, y: 33.6 },
        brain: { x: 50, y: 8 },
        intestine: { x: 50, y: 48 },
        colon: { x: 45, y: 52 }
      }

      const particles = container.querySelector('#nutrient-particles')
      const cards = container.querySelectorAll('.timeline-card')
      const dots = [0, 1, 2, 3, 4].map(i => container.querySelector(`#dot-${i}`))
      const autoBtn = container.querySelector('#autoplay')
      const pauseIcon = container.querySelector('#pauseIcon')
      const playIcon = container.querySelector('#playIcon')

      const COLORS = ['#5C3A21', '#E76F51', '#2A9D8F', '#A78BFA', '#81B29A']

      let current = 0
      let timer = null
      let playing = true

      function clearParticles() {
        if (particles) particles.innerHTML = ''
        container.querySelectorAll('.organ').forEach(o => o.classList.remove('active'))
        const vagus = container.querySelector('#vagus')
        const vagusLabel = container.querySelector('#vagus-label')
        if (vagus) vagus.style.opacity = 0
        if (vagusLabel) vagusLabel.style.opacity = 0
        container.querySelectorAll('.alpha-wave, .glutamate-spark').forEach(el => el.remove())
      }

      function activate(ids) {
        ids.forEach(id => {
          const el = container.querySelector(`#${id}`)
          if (el) el.classList.add('active')
        })
      }

      function createParticle({ from, to, color = '#5C3A21', size = 10, duration = 2000, gradient = false, fade = false }) {
        if (!particles) return
        const p = document.createElement('div')
        p.className = 'particle'
        p.style.cssText = `
          height:${size}px;width:${size}px;
          left:${from.x}%;top:${from.y}%;
          background:${gradient ? `linear-gradient(135deg, ${color}, ${color}88)` : color};
          box-shadow: 0 0 ${size * 1.6}px ${color}90;
          opacity:0;
        `
        particles.appendChild(p)

        p.animate([
          { left: `${from.x}%`, top: `${from.y}%`, opacity: 1 },
          { left: `${to.x}%`, top: `${to.y}%`, opacity: fade ? 0 : 0.8 }
        ], { duration, fill: 'forwards', easing: 'ease-in-out' })
      }

      function setMeters(c, g, ga, s) {
        const mCortisol = container.querySelector('#m-cortisol')
        const mGlutamate = container.querySelector('#m-glutamate')
        const mGaba = container.querySelector('#m-gaba')
        const mSerotonin = container.querySelector('#m-serotonin')
        if (mCortisol) mCortisol.style.width = `${c}%`
        if (mGlutamate) mGlutamate.style.width = `${g}%`
        if (mGaba) mGaba.style.width = `${ga}%`
        if (mSerotonin) mSerotonin.style.width = `${s}%`
      }

      function showAlpha() {
        const svg = container.querySelector('svg')
        if (!svg) return
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            wave.setAttribute('d', 'M124 39 q6 -6 13 0 t13 0 t13 0')
            wave.setAttribute('fill', 'none')
            wave.setAttribute('stroke', '#2A9D8F')
            wave.setAttribute('stroke-width', '2')
            wave.setAttribute('class', 'alpha-wave')
            wave.style.opacity = 0
            svg.appendChild(wave)
            wave.animate([
              { opacity: 0.9, transform: 'translateY(0)' },
              { opacity: 0, transform: 'translateY(-8px)' }
            ], { duration: 1800, fill: 'forwards' })
            setTimeout(() => wave.remove(), 1900)
          }, i * 400)
        }
      }

      function showSparks() {
        if (!particles) return
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const spark = document.createElement('div')
            spark.className = 'glutamate-spark'
            spark.style.cssText = `
              position:absolute;
              width:4px;height:4px;
              background:#F59E0B;
              border-radius:50%;
              left:${48 + Math.random() * 4}%;
              top:${6 + Math.random() * 4}%;
              box-shadow: 0 0 6px #F59E0B;
            `
            particles.appendChild(spark)
            spark.animate([
              { opacity: 1, transform: 'scale(1.5)' },
              { opacity: 0, transform: 'scale(0)' }
            ], { duration: 600, fill: 'forwards' })
            setTimeout(() => spark.remove(), 700)
          }, i * 150)
        }
      }

      function runVisualsForStep(n) {
        clearParticles()
        switch (n) {
          case 0:
            activate(['stomach', 'small-intestine'])
            setMeters(85, 80, 25, 30)
            for (let i = 0; i < 3; i++) {
              setTimeout(() => createParticle({ from: POS.mouth, to: POS.stomach, color: '#5C3A21', size: 13 - i * 2, duration: 1800, gradient: true }), i * 400)
            }
            break
          case 1:
            activate(['brain', 'heart', 'arteries'])
            setMeters(70, 65, 40, 40)
            for (let i = 0; i < 4; i++) {
              setTimeout(() => createParticle({ from: POS.stomach, to: POS.brain, color: '#E76F51', size: 9, duration: 2200, fade: true }), i * 350)
            }
            showSparks()
            break
          case 2:
            activate(['brain'])
            setMeters(55, 45, 60, 50)
            showAlpha()
            break
          case 3:
            activate(['brain', 'muscles', 'kidneys'])
            setMeters(35, 30, 75, 60)
            for (let i = 0; i < 3; i++) {
              setTimeout(() => createParticle({ from: { x: 50, y: 34 }, to: { x: 50, y: 8 }, color: '#A78BFA', size: 8, duration: 2000 }), i * 500)
            }
            break
          case 4:
            activate(['large-intestine', 'small-intestine', 'brain'])
            setMeters(22, 20, 85, 80)
            const vagus = container.querySelector('#vagus')
            const vagusLabel = container.querySelector('#vagus-label')
            if (vagus) vagus.style.opacity = 1
            if (vagusLabel) vagusLabel.style.opacity = 1
            for (let i = 0; i < 3; i++) {
              setTimeout(() => createParticle({ from: POS.colon, to: POS.brain, color: '#81B29A', size: 7, duration: 2600 }), i * 600)
            }
            break
        }
      }

      function activateStep(i) {
        cards.forEach((c, idx) => {
          c.classList.toggle('active', idx === i)
        })
        dots.forEach((d, idx) => {
          if (d) {
            d.style.width = idx === i ? '10px' : '8px'
            d.style.height = idx === i ? '10px' : '8px'
            d.style.opacity = idx === i ? '1' : '0.3'
            d.style.background = COLORS[idx]
          }
        })
        current = i
        runVisualsForStep(i)

        // On mobile, scroll to diagram
        if (window.innerWidth < 1024) {
          const visualContainer = container.querySelector('#visual-container')
          if (visualContainer) {
            visualContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }

      function next() {
        activateStep((current + 1) % 5)
      }

      function startTimer() {
        timer = setInterval(next, 5000)
      }

      function stopTimer() {
        clearInterval(timer)
      }

      function restartTimer() {
        stopTimer()
        if (playing) startTimer()
      }

      // Event listeners
      cards.forEach((card, i) => {
        card.addEventListener('click', () => {
          activateStep(i)
          restartTimer()
        })
      })

      if (autoBtn) {
        autoBtn.addEventListener('click', () => {
          playing = !playing
          if (pauseIcon) pauseIcon.classList.toggle('hidden', !playing)
          if (playIcon) playIcon.classList.toggle('hidden', playing)
          if (playing) {
            startTimer()
          } else {
            stopTimer()
          }
        })
      }

      // Initialize
      activateStep(0)
      startTimer()

      // Pause when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopTimer()
        } else if (playing) {
          startTimer()
        }
      })
    }

    // Small delay to ensure DOM is ready
    setTimeout(initHowItWorks, 100)
  }, [])

  return (
    <section ref={containerRef} className="py-20 relative overflow-hidden" style={{ background: '#FCFAF7' }}>
      {/* Custom Styles */}
      <style jsx global>{`
        .how-it-works-section .timeline-card {
          transition: all 0.3s ease;
        }
        .how-it-works-section .timeline-card:hover {
          transform: translateX(4px);
        }
        .how-it-works-section .timeline-card.active {
          box-shadow: 0 20px 40px -15px rgba(92, 58, 33, 0.2);
          border-color: transparent;
        }
        .how-it-works-section .organ {
          opacity: 0.25;
          transition: all 0.6s ease;
        }
        .how-it-works-section .organ.active {
          opacity: 1;
          filter: url(#softGlow);
        }
        .how-it-works-section #heart.active {
          animation: heartbeat 1s ease-in-out infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .how-it-works-section .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .how-it-works-section .source-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
        }
        .how-it-works-section .stat-callout {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 16px;
        }
        .how-it-works-section .alpha-wave {
          opacity: 0;
        }
      `}</style>

      <div className="how-it-works-section">
        {/* Section Header */}
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#5C3A21' }}></span>
              <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#5C3A21' }}>Be Good</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Be Good A-Bar</h2>
            <p className="text-xl text-gray-600 mb-6">Calm Your Mind. Own The Moment.</p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2A9D8F" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-sm font-medium text-stone-700">Science-Backed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E76F51" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span className="text-sm font-medium text-stone-700">Fast Acting <span className="text-stone-400">(15-20 min)</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <span className="text-lg">🍫</span>
                <span className="text-sm font-medium text-stone-700">Delicious</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            
            {/* Left Column - Visual */}
            <div className="w-full lg:w-[57%]">
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-stone-100 shadow-[0_30px_80px_-30px_rgba(92,58,33,0.3)] p-6 md:p-10 lg:sticky lg:top-8">
                
                {/* Neurochemical Progress Bar */}
                <div className="absolute top-6 right-6 z-30 hidden sm:block">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-stone-100 w-[200px]">
                    <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-medium" style={{ fontFamily: 'sans-serif' }}>Neurochemical balance</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wide text-stone-600">Cortisol</span><span className="text-[10px] text-red-500">↓</span></div>
                        <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div id="m-cortisol" className="h-full bg-red-400 transition-all duration-1000 ease-out" style={{ width: '85%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wide text-stone-600">Glutamate</span><span className="text-[10px] text-orange-500">↓</span></div>
                        <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div id="m-glutamate" className="h-full bg-orange-400 transition-all duration-1000 ease-out" style={{ width: '80%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wide text-stone-600">GABA</span><span className="text-[10px] text-emerald-600">↑</span></div>
                        <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div id="m-gaba" className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: '25%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wide text-stone-600">Serotonin</span><span className="text-[10px] text-amber-600">↑</span></div>
                        <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div id="m-serotonin" className="h-full bg-amber-400 transition-all duration-1000 ease-out" style={{ width: '30%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5 relative z-40">
                  <h3 className="text-[17px] font-semibold tracking-wide" style={{ color: '#5C3A21' }}>HOW IT WORKS IN YOUR BODY</h3>
                  <button id="autoplay" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition">
                    <svg id="pauseIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="5" width="3" height="14" rx="1"></rect><rect x="14" y="5" width="3" height="14" rx="1"></rect></svg>
                    <svg id="playIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden"><polygon points="6 4 20 12 6 20"></polygon></svg>
                    <span>Auto-play</span>
                  </button>
                </div>

                <div id="visual-container" className="relative w-full max-w-[360px] mx-auto aspect-[3/4]">
                  <div id="nutrient-particles" className="absolute inset-0 z-20 pointer-events-none"></div>
                  
                  <svg viewBox="0 0 300 500" className="w-full h-full select-none">
                    <defs>
                      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur"></feGaussianBlur>
                        <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
                      </filter>
                    </defs>
                    
                    <path d="M150 12 C132 12 118 26 118 44 C118 56 124 65 132 69 L127 82 C112 92 106 110 106 130 L96 140 C86 150 84 164 91 174 L86 222 C81 242 83 262 91 277 L86 350 C84 380 89 408 96 433 C101 452 109 464 119 464 C129 464 133 454 134 434 L139 350 L141 277 L159 277 L161 350 L166 434 C167 454 171 464 181 464 C191 464 199 452 204 433 C211 408 216 380 214 350 L209 277 C217 262 219 242 214 222 L209 174 C216 164 214 150 204 140 L194 130 C194 110 188 92 173 82 L168 69 C176 65 182 56 182 44 C182 26 168 12 150 12 Z" fill="#F1EAE1" stroke="#E7DDD0" strokeWidth="1.2" opacity="0.9"></path>
          
                    <g id="arteries" className="organ" style={{ color: '#E76F51', transformOrigin: '150px 180px' }}>
                      <path d="M150 122 v120 M150 145 l-22 12 M150 158 l22 15 M150 180 l-18 18 M150 195 l18 22 M150 210 l-12 16 M150 220 l14 14" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.85" strokeLinecap="round"></path>
                    </g>
          
                    <g id="muscles" className="organ" style={{ color: '#A78BFA', transformOrigin: '150px 250px' }}>
                      <path d="M103 138 L92 210 M197 138 L208 210 M128 280 L134 380 M172 280 L166 380 M120 285 h60" stroke="currentColor" strokeWidth="16" strokeLinecap="round" opacity="0.35"></path>
                    </g>
          
                    <g id="large-intestine" className="organ" style={{ color: '#81B29A', transformOrigin: '150px 230px' }}>
                      <path d="M120 195 h60 a12 12 0 0 1 12 12 v48 a12 12 0 0 1-12 12 h-36 a10 10 0 0 0-10 10 v8" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" opacity="0.95"></path>
                      <path d="M118 196 v48" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" opacity="0.95"></path>
                    </g>
          
                    <g id="small-intestine" className="organ" style={{ color: '#A7F3D0', transformOrigin: '150px 228px' }}>
                      <path d="M130 205 q18 8 38 0 q-18 10 0 20 q-18 9 0 18 q-18 8 0 16 q-9 8 -19 0 q0 -8 19 -16 q-18 -9 0 -18 q-18 -10 0 -20 q-18 -8 -19 -16z" fill="none" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" opacity="0.95"></path>
                    </g>
          
                    <g id="kidneys" className="organ" style={{ color: '#FCA5A5', transformOrigin: '150px 202px' }}>
                      <path d="M120 200 c-6 -8 -14 -6 -16 2 c-2 8 2 16 8 18 c6 2 10 -4 8 -10" fill="currentColor" transform="rotate(-18 120 200)"></path>
                      <path d="M180 200 c6 -8 14 -6 16 2 c2 8 -2 16 -8 18 c-6 2 -10 -4 -8 -10" fill="currentColor" transform="rotate(18 180 200)"></path>
                    </g>
          
                    <g id="liver" className="organ" style={{ color: '#FDBA74', transformOrigin: '168px 166px' }}>
                      <ellipse cx="168" cy="166" rx="23" ry="15" fill="currentColor"></ellipse>
                      <ellipse cx="156" cy="175" rx="12" ry="7" fill="currentColor" opacity="0.8"></ellipse>
                    </g>
          
                    <g id="stomach" className="organ active" style={{ color: '#FED7AA', transformOrigin: '133px 168px' }}>
                      <ellipse cx="133" cy="168" rx="15" ry="20" fill="currentColor" transform="rotate(-14 133 168)"></ellipse>
                    </g>
          
                    <g id="pancreas" className="organ" style={{ color: '#FDE68A', transformOrigin: '150px 183px' }}>
                      <ellipse cx="150" cy="183" rx="17" ry="5.5" fill="currentColor"></ellipse>
                    </g>
          
                    <g id="lungs" className="organ" style={{ color: '#FECACA', transformOrigin: '150px 113px' }}>
                      <ellipse cx="130" cy="113" rx="16" ry="27" fill="currentColor"></ellipse>
                      <ellipse cx="170" cy="113" rx="16" ry="27" fill="currentColor"></ellipse>
                    </g>
          
                    <g id="heart" className="organ" style={{ color: '#F87171', transformOrigin: '150px 126px' }}>
                      <path d="M150 116 c-7 -7 -20 -5 -20 6.5 c0 11 10 18 20 26 c10 -8 20 -15 20 -26 c0 -11.5 -13 -13.5 -20 -6.5z" fill="currentColor"></path>
                    </g>
          
                    <g id="brain" className="organ" style={{ color: '#DDD6FE', transformOrigin: '150px 40px' }}>
                      <ellipse cx="150" cy="39" rx="26" ry="18.5" fill="currentColor"></ellipse>
                      <path d="M128 35 q7 -7 22 -3 q15 -4 22 3 q5 7 0 13 q-5 6 -22 4.5 q-17 1.5 -22 -4.5 q-5 -6 0 -13z" fill="white" opacity="0.28"></path>
                      <path d="M135 42 q5 -3 10 0 q5 -3 10 0" fill="none" stroke="white" strokeWidth="1.2" opacity="0.35" strokeLinecap="round"></path>
                    </g>
          
                    <path id="vagus" d="M150 57 C144 88 143 122 146 158 C149 195 152 228 148 258" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeDasharray="4 4" opacity="0" filter="url(#softGlow)" style={{ opacity: 0 }}></path>
                    <text id="vagus-label" x="102" y="125" fontSize="9.5" fill="#92400E" opacity="0" style={{ fontFamily: 'sans-serif', fontWeight: 500, letterSpacing: '0.02em', opacity: 0 }}>Vagus Nerve</text>
                  </svg>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <div id="dot-0" className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: '#5C3A21', width: '10px', height: '10px', opacity: 1 }}></div>
                  <div id="dot-1" className="w-2 h-2 rounded-full transition-all" style={{ background: '#E76F51', width: '8px', height: '8px', opacity: 0.3 }}></div>
                  <div id="dot-2" className="w-2 h-2 rounded-full transition-all" style={{ background: '#2A9D8F', width: '8px', height: '8px', opacity: 0.3 }}></div>
                  <div id="dot-3" className="w-2 h-2 rounded-full transition-all" style={{ background: '#A78BFA', width: '8px', height: '8px', opacity: 0.3 }}></div>
                  <div id="dot-4" className="w-2 h-2 rounded-full transition-all" style={{ background: '#81B29A', width: '8px', height: '8px', opacity: 0.3 }}></div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2A9D8F' }}></span>
                  Tap a step on the right to explore
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="w-full lg:w-[43%]">
              <div id="timeline" className="space-y-4">

                {/* Step 0 */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer active" data-step="0">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full" style={{ background: '#5C3A21' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: '#5C3A21', boxShadow: '0 10px 15px -3px rgba(92, 58, 33, 0.2)' }}>
                        0<span className="text-[10px] ml-0.5 mt-3 font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold" style={{ color: '#5C3A21' }}>Bite</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium text-white" style={{ background: '#5C3A21' }}>Start</span>
                      </div>
                      <p className="text-[14.5px] leading-snug text-slate-600">You eat the bar. Cocoa and coffee release natural Caffeine and L-Theanine — the <strong>Nootropic Stack</strong> is activated. Magnesium-rich nuts, Omega-3 seeds, and Chicory Root fiber begin digestion in the stomach.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#F4A26118', color: '#a06820', border: '1px solid #F4A26140' }}>☕ Coffee & Cocoa</span>
                        <span className="source-chip" style={{ background: '#A78BFA18', color: '#6d48d6', border: '1px solid #A78BFA40' }}>🥜 Almond Butter</span>
                        <span className="source-chip" style={{ background: '#81B29A18', color: '#3d7a60', border: '1px solid #81B29A40' }}>🌰 Walnuts & Seeds</span>
                        <span className="source-chip" style={{ background: '#2A9D8F18', color: '#1a6b62', border: '1px solid #2A9D8F40' }}>🌿 Chicory Root</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="1">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#E76F51' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg" style={{ background: '#E76F51', boxShadow: '0 10px 15px -3px rgba(231, 111, 81, 0.2)' }}>
                        <span className="text-[13px]">15-20</span><span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold" style={{ color: '#E76F51' }}>Lift</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: '#E76F51' }}>Clean Calm</span>
                      </div>
                      <p className="text-[14.5px] leading-snug text-slate-600">Caffeine blocks adenosine (sleepiness signals), sharpening focus. Simultaneously, L-Theanine counters caffeine's vasoconstrictive side-effects — keeping blood flowing freely to the brain. The <strong>Nootropic Stack</strong> delivers all the focus of coffee, none of the jitters.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#E76F5118', color: '#b04030', border: '1px solid #E76F5140' }}>☕ Coffee & Cocoa (Caffeine + L-Theanine)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="2">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#2A9D8F' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg" style={{ background: '#2A9D8F', boxShadow: '0 10px 15px -3px rgba(42, 157, 143, 0.2)' }}>
                        <span className="text-[13px]">30-40</span><span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold" style={{ color: '#2A9D8F' }}>Brain Shift</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: '#2A9D8F' }}>Alert Relaxation</span>
                      </div>
                      <p className="text-[14.5px] leading-snug text-slate-600">L-Theanine crosses the blood-brain barrier and quiets overactive cortical neurons. The brain shifts from <strong>High Beta</strong> (panic/anxiety) to <strong>Alpha waves (8–14 Hz)</strong>: the rhythm of <em>Alert Relaxation</em> — like meditation, while fully awake.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#2A9D8F18', color: '#1a6b62', border: '1px solid #2A9D8F40' }}>☕ Coffee & Cocoa (L-Theanine)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="3">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#A78BFA' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg" style={{ background: '#A78BFA', boxShadow: '0 10px 15px -3px rgba(167, 139, 250, 0.2)' }}>
                        <span className="text-[13px]">60-90</span><span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#A78BFA' }}>Steady Calm</h4>
                      <p className="text-[14.5px] leading-snug text-slate-600">Magnesium works on two fronts: it blocks excess calcium from over-exciting neurons, and activates the brain's own calming neurotransmitter. Together, they put a brake on the HPA axis — reducing Cortisol. Omega-3s keep neuron membranes fluid.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#A78BFA18', color: '#6d48d6', border: '1px solid #A78BFA40' }}>🥜 Almond Butter · Cocoa · Walnuts · Seeds (Mg)</span>
                        <span className="source-chip" style={{ background: '#A78BFA18', color: '#6d48d6', border: '1px solid #A78BFA40' }}>🌱 Walnuts · Chia/Flax Seeds (Omega-3)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="4">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#81B29A' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg" style={{ background: '#81B29A', boxShadow: '0 10px 15px -3px rgba(129, 178, 154, 0.2)' }}>
                        <span className="text-[13px]">2-4</span><span className="text-[10px] font-medium">h+</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#5a8f7a' }}>Gut Support</h4>
                      <p className="text-[14.5px] leading-snug text-slate-600">Chicory Root fiber feeds <em>Bifidobacteria</em> in your colon. They produce Short-Chain Fatty Acids which signal via the <strong>Vagus Nerve</strong> (the gut-brain highway) to lower inflammatory stress markers and support serotonin production.</p>

                      <div className="stat-callout mt-3" style={{ background: '#81B29A12', border: '1px solid #81B29A45' }}>
                        <span className="text-2xl font-extrabold shrink-0 leading-none" style={{ color: '#81B29A' }}>+18%</span>
                        <span className="text-[12px] leading-snug text-slate-600"><strong>Absorption Synergy:</strong> Chicory fiber also lowers gut pH, making Magnesium up to 18% more bioavailable.</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#81B29A18', color: '#3d7a60', border: '1px solid #81B29A40' }}>🌿 Chicory Root (Inulin / Oligofructose)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Scientific References */}
        <div className="max-w-4xl mx-auto px-4 mt-16 pt-8 border-t border-stone-200">
          <h4 className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-3">Scientific References</h4>
          <ol className="text-[11px] text-stone-500 space-y-1 list-decimal list-inside">
            <li>Nobre et al. (2008). L-Theanine & Alpha waves — <em>Nutritional Neuroscience</em></li>
            <li>Haskell et al. (2007). Caffeine + L-Theanine interaction — <em>Biological Psychology</em></li>
            <li>Abrams et al. (2018). Prebiotic fiber & Vagus/Serotonin — <em>Frontiers in Neuroscience</em></li>
          </ol>
          <p className="text-[10px] text-stone-400 mt-4">Educational information only. A-Bar is a food, not a medicine. Effects vary person to person.</p>
        </div>
      </div>
    </section>
  )
}
