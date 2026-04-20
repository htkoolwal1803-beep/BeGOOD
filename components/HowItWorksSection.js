'use client'

import { useEffect, useRef } from 'react'

export default function HowItWorksSection() {
  const containerRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // All the JavaScript logic from the original HTML
    const initializeAnimation = () => {
      const TOTAL = 25000 // 25-second animation
      const pLayer = document.getElementById('particle-layer')
      const progFill = document.getElementById('prog-fill')
      const progThumb = document.getElementById('prog-thumb')
      const timeLbl = document.getElementById('time-lbl')

      // Particle definitions
      const PDEFS = [
        {
          id: 'bolus', label: '', color: '#6B3D1E', r: 8,
          startT: 2000, endT: 5500,
          path: [{ x: 170, y: 92 }, { x: 168, y: 136 }, { x: 163, y: 196 }, { x: 152, y: 257 }]
        },
        {
          id: 'mg', label: 'Mg', color: '#A78BFA', r: 10,
          startT: 7000, endT: 14000,
          path: [{ x: 152, y: 257 }, { x: 118, y: 215 }, { x: 130, y: 126 }, { x: 163, y: 52 }]
        },
        {
          id: 'chi', label: 'Chi', color: '#81B29A', r: 10,
          startT: 7500, endT: 15000,
          path: [{ x: 152, y: 257 }, { x: 148, y: 308 }, { x: 153, y: 360 }, { x: 163, y: 390 }]
        },
        {
          id: 'lt', label: 'L-T', color: '#2A9D8F', r: 10,
          startT: 8000, endT: 15500,
          path: [{ x: 152, y: 257 }, { x: 161, y: 210 }, { x: 167, y: 130 }, { x: 170, y: 52 }]
        },
        {
          id: 'caff', label: 'C+LT', color: '#E76F51', r: 10,
          startT: 8500, endT: 16000,
          path: [{ x: 152, y: 257 }, { x: 165, y: 208 }, { x: 172, y: 130 }, { x: 176, y: 52 }]
        },
        {
          id: 'omega', label: 'Ω-3', color: '#F4A261', r: 10,
          startT: 9000, endT: 17000,
          path: [{ x: 152, y: 257 }, { x: 175, y: 215 }, { x: 178, y: 130 }, { x: 178, y: 52 }]
        },
      ]

      // Event timeline
      const EVENTS = [
        {
          id: 'showBar', t: 0,
          fn: () => setBarOpacity(1)
        },
        {
          id: 'eatBar', t: 700,
          fn: () => setBarOpacity(0, 'scale(0.85)')
        },
        {
          id: 'hideBar', t: 1900,
          fn: () => { document.getElementById('choc-bar').style.opacity = '0' }
        },
        {
          id: 'stomachHit', t: 5500,
          fn: () => {
            glowOrgan('stomach', '#F4A261')
            burstOrgan('stomach')
            showStatus('Digesting...')
          }
        },
        {
          id: 'split', t: 6300,
          fn: () => showStatus('Nutrients splitting!')
        },
        {
          id: 'clearStat', t: 7000,
          fn: () => clearStatus()
        },
        {
          id: 'vessels', t: 7000,
          fn: () => document.getElementById('blood-vessels')?.classList.add('lit')
        },
        {
          id: 'heartGlow', t: 7200,
          fn: () => glowOrgan('heart', '#E76F51')
        },
        {
          id: 'mgBrain', t: 14000,
          fn: () => {
            glowOrgan('brain', '#A78BFA')
            flashRelax()
            showBadge('cortisol')
            setTimeout(() => showBadge('gaba'), 550)
          }
        },
        {
          id: 'chiColon', t: 15000,
          fn: () => {
            glowOrgan('colon', '#81B29A')
            showVagus(true)
            showBadge('serotonin')
          }
        },
        {
          id: 'ltBrain', t: 15500,
          fn: () => {
            glowOrgan('brain', '#2A9D8F')
            document.getElementById('alpha-layer')?.classList.add('on')
            showBadge('glutamate')
          }
        },
        {
          id: 'caffBrain', t: 16000,
          fn: () => {
            glowOrgan('brain', '#E76F51')
            showBadge('alertness')
          }
        },
        {
          id: 'omegaBrain', t: 17000,
          fn: () => {
            glowOrgan('brain', '#F4A261')
            showBadge('membrane')
          }
        },
        {
          id: 'brainFull', t: 18500,
          fn: () => glowOrgan('brain', '#FFCC55')
        },
      ]

      // State
      let elapsed = 0
      let playing = true
      let lastTs = null
      let rafId = null
      const fired = new Set()
      const spawned = new Set()
      let particles = []

      // Bezier helper
      function cbez(t, pts) {
        const [p0, p1, p2, p3] = pts
        const u = 1 - t
        return {
          x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
          y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
        }
      }

      // Organ helpers
      function glowOrgan(id, color) {
        const el = document.getElementById('org-' + id)
        if (!el) return
        el.classList.add('active')
        el.style.filter = `drop-shadow(0 0 16px ${color}CC) drop-shadow(0 0 8px ${color}88)`
        el.querySelectorAll('.of').forEach(e => e.style.fill = color)
        el.querySelectorAll('.os').forEach(e => e.style.stroke = color)
      }

      function resetOrgan(id) {
        const el = document.getElementById('org-' + id)
        if (!el) return
        el.classList.remove('active', 'burst')
        el.style.filter = ''
        el.querySelectorAll('.of').forEach(e =>
          e.style.fill = e.getAttribute('data-df') || '#D4B8B0')
        el.querySelectorAll('.os').forEach(e =>
          e.style.stroke = e.getAttribute('data-ds') || '#C4C8A8')
      }

      function burstOrgan(id) {
        const el = document.getElementById('org-' + id)
        if (!el) return
        el.classList.add('burst')
        setTimeout(() => el.classList.remove('burst'), 600)
      }

      // Badge helpers
      function showBadge(id) {
        document.getElementById('svgbadge-' + id)?.classList.add('show')
      }

      function hideBadge(id) {
        document.getElementById('svgbadge-' + id)?.classList.remove('show')
      }

      // Misc visual helpers
      function showStatus(msg) {
        const statusTxt = document.getElementById('status-txt')
        const statusGrp = document.getElementById('status-grp')
        if (statusTxt) statusTxt.textContent = msg
        if (statusGrp) statusGrp.classList.add('on')
      }

      function clearStatus() {
        document.getElementById('status-grp')?.classList.remove('on')
      }

      function setBarOpacity(op, scale) {
        const el = document.getElementById('choc-bar')
        if (!el) return
        el.style.opacity = op
        el.style.transform = scale || ''
      }

      function flashRelax() {
        const ov = document.getElementById('relax-overlay')
        if (!ov) return
        ov.style.opacity = '0.18'
        setTimeout(() => { ov.style.opacity = '0' }, 2200)
      }

      function showVagus(on) {
        document.getElementById('vagus-path')?.classList.toggle('on', on)
        document.getElementById('vagus-lbl')?.classList.toggle('on', on)
      }

      // Particle system
      function spawnParticle(def) {
        if (!pLayer) return null
        const NS = 'http://www.w3.org/2000/svg'
        const g = document.createElementNS(NS, 'g')

        const glow = document.createElementNS(NS, 'circle')
        glow.setAttribute('r', (def.r + 6).toString())
        glow.setAttribute('fill', def.color)
        glow.setAttribute('opacity', '0.28')

        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('r', def.r.toString())
        c.setAttribute('fill', def.color)

        g.appendChild(glow)
        g.appendChild(c)

        if (def.label) {
          const txt = document.createElementNS(NS, 'text')
          txt.setAttribute('text-anchor', 'middle')
          txt.setAttribute('dominant-baseline', 'middle')
          txt.setAttribute('font-size', def.label.length > 3 ? '6.5' : '7.8')
          txt.setAttribute('font-weight', '800')
          txt.setAttribute('fill', 'white')
          txt.setAttribute('font-family', 'Inter,sans-serif')
          txt.setAttribute('pointer-events', 'none')
          txt.textContent = def.label
          g.appendChild(txt)
        }

        g.style.opacity = '0'
        pLayer.appendChild(g)

        const p = {
          def, g, glow, c,
          txt: g.querySelector('text'),
          arrived: false
        }
        particles.push(p)
        return p
      }

      function setPos(p, pos) {
        p.glow.setAttribute('cx', pos.x)
        p.glow.setAttribute('cy', pos.y)
        p.c.setAttribute('cx', pos.x)
        p.c.setAttribute('cy', pos.y)
        if (p.txt) {
          p.txt.setAttribute('x', pos.x)
          p.txt.setAttribute('y', pos.y)
        }
      }

      function updateParticles(now) {
        for (const p of particles) {
          if (p.arrived) continue
          if (now < p.def.startT) continue
          const raw = (now - p.def.startT) / (p.def.endT - p.def.startT)
          const t = Math.max(0, Math.min(1, raw))
          const pos = cbez(t, p.def.path)
          setPos(p, pos)
          const a = t < 0.07 ? t / 0.07 : t > 0.92 ? (1 - t) / 0.08 : 1
          p.g.style.opacity = a
          if (t >= 1) {
            p.arrived = true
            p.g.style.opacity = '0'
          }
        }
      }

      // Main loop
      function tick(ts) {
        if (!lastTs) lastTs = ts
        if (playing) elapsed = Math.min(elapsed + (ts - lastTs), TOTAL)
        lastTs = ts

        // Fire events
        for (const ev of EVENTS) {
          if (!fired.has(ev.id) && elapsed >= ev.t) {
            fired.add(ev.id)
            ev.fn()
          }
        }

        // Spawn particles
        for (const def of PDEFS) {
          if (elapsed >= def.startT && !spawned.has(def.id)) {
            spawned.add(def.id)
            spawnParticle(def)
          }
        }

        // Update positions
        updateParticles(elapsed)

        // Update hormone counters + EEG
        updateHormones(elapsed)
        updateEEG(elapsed, ts)

        // Progress UI
        if (progFill && progThumb && timeLbl) {
          const pct = (elapsed / TOTAL) * 100
          progFill.style.width = pct + '%'
          progThumb.style.left = pct + '%'
          timeLbl.textContent = '0:' + Math.floor(elapsed / 1000).toString().padStart(2, '0')
        }

        // Continue or stop
        if (elapsed < TOTAL) {
          rafId = requestAnimationFrame(tick)
        } else {
          playing = false
          updatePlayIcon()
        }
      }

      // Reset all visuals
      const ALL_ORGANS = ['brain', 'heart', 'lungLeft', 'lungRight',
        'liver', 'stomach', 'kidneyLeft', 'kidneyRight',
        'smallInt', 'colon']
      const ALL_BADGES = ['cortisol', 'gaba', 'glutamate', 'serotonin',
        'alertness', 'membrane']

      function resetAll() {
        ALL_ORGANS.forEach(resetOrgan)
        ALL_BADGES.forEach(hideBadge)
        if (pLayer) pLayer.innerHTML = ''
        particles.length = 0
        spawned.clear()
        fired.clear()
        const chocBar = document.getElementById('choc-bar')
        if (chocBar) {
          chocBar.style.opacity = '0'
          chocBar.style.transform = ''
        }
        document.getElementById('status-grp')?.classList.remove('on')
        document.getElementById('blood-vessels')?.classList.remove('lit')
        document.getElementById('alpha-layer')?.classList.remove('on')
        const relaxOverlay = document.getElementById('relax-overlay')
        if (relaxOverlay) relaxOverlay.style.opacity = '0'
        showVagus(false)
        if (typeof updateHormones === 'function') updateHormones(0)
        eegPhase = 0
      }

      // Seek
      function seekTo(T) {
        const wasPlaying = playing
        cancelAnimationFrame(rafId)
        elapsed = T
        lastTs = null

        resetAll()

        // Re-fire all events up to T
        for (const ev of EVENTS) {
          if (T >= ev.t) {
            fired.add(ev.id)
            ev.fn()
          }
        }

        // Spawn and position particles at T
        for (const def of PDEFS) {
          if (T >= def.startT) {
            spawned.add(def.id)
            const p = spawnParticle(def)
            if (p) {
              const raw = (T - def.startT) / (def.endT - def.startT)
              const t = Math.max(0, Math.min(1, raw))
              if (t < 1) {
                setPos(p, cbez(t, def.path))
                p.g.style.opacity = '1'
              } else {
                p.arrived = true
                p.g.style.opacity = '0'
              }
            }
          }
        }

        // Update progress UI
        if (progFill && progThumb && timeLbl) {
          const pct = (T / TOTAL) * 100
          progFill.style.width = pct + '%'
          progThumb.style.left = pct + '%'
          timeLbl.textContent = '0:' + Math.floor(T / 1000).toString().padStart(2, '0')
        }

        if (wasPlaying && T < TOTAL) {
          playing = true
          updatePlayIcon()
          rafId = requestAnimationFrame(tick)
        } else if (!wasPlaying || T >= TOTAL) {
          playing = false
          updatePlayIcon()
        }
      }

      // Controls
      function updatePlayIcon() {
        document.getElementById('icon-pause')?.classList.toggle('hidden', !playing)
        document.getElementById('icon-play')?.classList.toggle('hidden', playing)
      }

      const btnPP = document.getElementById('btn-pp')
      if (btnPP) {
        btnPP.addEventListener('click', () => {
          if (elapsed >= TOTAL) {
            seekTo(0)
            playing = true
            updatePlayIcon()
            rafId = requestAnimationFrame(tick)
            return
          }
          playing = !playing
          updatePlayIcon()
          if (playing) {
            lastTs = null
            rafId = requestAnimationFrame(tick)
          } else {
            cancelAnimationFrame(rafId)
          }
        })
      }

      const btnRW = document.getElementById('btn-rw')
      if (btnRW) {
        btnRW.addEventListener('click', () => {
          seekTo(0)
          playing = true
          updatePlayIcon()
          rafId = requestAnimationFrame(tick)
        })
      }

      // Progress bar scrubbing
      const progTrack = document.getElementById('prog-track')
      let scrubbing = false

      function scrubToEvent(e) {
        if (!progTrack) return
        const rect = progTrack.getBoundingClientRect()
        const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        seekTo(frac * TOTAL)
      }

      if (progTrack) {
        progTrack.addEventListener('mousedown', e => {
          scrubbing = true
          scrubToEvent(e)
        })
        document.addEventListener('mousemove', e => {
          if (scrubbing) scrubToEvent(e)
        })
        document.addEventListener('mouseup', () => {
          scrubbing = false
        })
        progTrack.addEventListener('touchstart', e => {
          scrubbing = true
          scrubToEvent(e.touches[0])
        }, { passive: true })
        document.addEventListener('touchmove', e => {
          if (scrubbing) scrubToEvent(e.touches[0])
        }, { passive: true })
        document.addEventListener('touchend', () => {
          scrubbing = false
        })
      }

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (playing) {
            cancelAnimationFrame(rafId)
            lastTs = null
          }
        } else {
          if (playing && elapsed < TOTAL) rafId = requestAnimationFrame(tick)
        }
      })

      // Hormone counter engine
      const HORMONE_KF = {
        cortisol: [[0, 100], [12000, 100], [14000, 70], [17000, 50], [20000, 35], [25000, 35]],
        glutamate: [[0, 100], [14000, 100], [15500, 65], [18000, 35], [20000, 30], [25000, 30]],
        gaba: [[0, 30], [12000, 30], [14000, 50], [15500, 65], [18000, 80], [20000, 85], [25000, 85]],
        serotonin: [[0, 40], [14000, 40], [15000, 50], [17000, 65], [20000, 75], [22000, 80], [25000, 80]]
      }

      function lerpKF(kf, t) {
        if (t <= kf[0][0]) return kf[0][1]
        if (t >= kf[kf.length - 1][0]) return kf[kf.length - 1][1]
        for (let i = 0; i < kf.length - 1; i++) {
          if (t >= kf[i][0] && t <= kf[i + 1][0]) {
            const frac = (t - kf[i][0]) / (kf[i + 1][0] - kf[i][0])
            return kf[i][1] + (kf[i + 1][1] - kf[i][1]) * frac
          }
        }
        return kf[kf.length - 1][1]
      }

      const hBars = {
        cortisol: document.getElementById('hbar-cortisol'),
        glutamate: document.getElementById('hbar-glutamate'),
        gaba: document.getElementById('hbar-gaba'),
        serotonin: document.getElementById('hbar-serotonin')
      }
      const hVals = {
        cortisol: document.getElementById('hval-cortisol'),
        glutamate: document.getElementById('hval-glutamate'),
        gaba: document.getElementById('hval-gaba'),
        serotonin: document.getElementById('hval-serotonin')
      }
      const hGauges = {
        cortisol: document.getElementById('hg-cortisol'),
        glutamate: document.getElementById('hg-glutamate'),
        gaba: document.getElementById('hg-gaba'),
        serotonin: document.getElementById('hg-serotonin')
      }

      let lastHormoneVals = { cortisol: 100, glutamate: 100, gaba: 30, serotonin: 40 }

      function updateHormones(t) {
        for (const key of Object.keys(HORMONE_KF)) {
          const val = Math.round(lerpKF(HORMONE_KF[key], t))
          if (hBars[key]) hBars[key].style.width = val + '%'
          if (hVals[key]) hVals[key].textContent = val + '%'
          // Pulse gauge when value changes significantly
          if (Math.abs(val - lastHormoneVals[key]) > 2) {
            hGauges[key]?.classList.add('pulse')
            setTimeout(() => hGauges[key]?.classList.remove('pulse'), 600)
          }
          lastHormoneVals[key] = val
        }
      }

      // EEG waveform canvas
      const eegCanvas = document.getElementById('eeg-canvas')
      const eegCtx = eegCanvas?.getContext('2d')
      const eegLabel = document.getElementById('eeg-freq-label')

      const FREQ_KF = [[0, 6], [12000, 6], [14000, 4.5], [15500, 3], [18000, 1.8], [20000, 1.4], [25000, 1.4]]
      const EEG_COLORS = [
        [0, '#ef4444'], [12000, '#ef4444'], [15500, '#f97316'], [18000, '#2A9D8F'], [25000, '#2A9D8F']]

      function lerpColor(kf, t) {
        if (t <= kf[0][0]) return kf[0][1]
        if (t >= kf[kf.length - 1][0]) return kf[kf.length - 1][1]
        for (let i = 0; i < kf.length - 1; i++) {
          if (t >= kf[i][0] && t <= kf[i + 1][0]) {
            const frac = (t - kf[i][0]) / (kf[i + 1][0] - kf[i][0])
            const c1 = kf[i][1]
            const c2 = kf[i + 1][1]
            const r = Math.round(parseInt(c1.slice(1, 3), 16) * (1 - frac) + parseInt(c2.slice(1, 3), 16) * frac)
            const g = Math.round(parseInt(c1.slice(3, 5), 16) * (1 - frac) + parseInt(c2.slice(3, 5), 16) * frac)
            const b = Math.round(parseInt(c1.slice(5, 7), 16) * (1 - frac) + parseInt(c2.slice(5, 7), 16) * frac)
            return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
          }
        }
        return kf[kf.length - 1][1]
      }

      let eegPhase = 0

      function updateEEG(t, ts) {
        if (!eegCanvas || !eegCtx) return
        const w = eegCanvas.width
        const h = eegCanvas.height
        const freq = lerpKF(FREQ_KF, t)
        const color = lerpColor(EEG_COLORS, t)

        // Update label
        let labelText
        if (freq > 4) {
          labelText = 'Hβ ' + Math.round(freq * 4) + 'Hz'
        } else if (freq > 2.5) {
          labelText = 'Lβ ' + Math.round(freq * 4) + 'Hz'
        } else {
          labelText = 'α ' + Math.round(freq * 4) + 'Hz'
        }
        if (eegLabel) {
          eegLabel.textContent = labelText
          eegLabel.style.background = color + '20'
          eegLabel.style.color = color
        }

        // Advance phase
        eegPhase += freq * 0.08

        // Draw waveform
        eegCtx.clearRect(0, 0, w, h)

        // Grid lines
        eegCtx.strokeStyle = '#EDE3DA'
        eegCtx.lineWidth = 0.5
        for (let y = h * 0.25; y < h; y += h * 0.25) {
          eegCtx.beginPath()
          eegCtx.moveTo(0, y)
          eegCtx.lineTo(w, y)
          eegCtx.stroke()
        }

        // Main wave
        const amp = h * 0.32
        const mid = h * 0.5
        eegCtx.beginPath()
        eegCtx.strokeStyle = color
        eegCtx.lineWidth = 2.2
        eegCtx.lineJoin = 'round'

        for (let x = 0; x < w; x++) {
          const xNorm = x / w
          const wave = Math.sin((xNorm * freq * 12) + eegPhase) * 0.7
            + Math.sin((xNorm * freq * 18) + eegPhase * 1.3) * 0.2
            + Math.sin((xNorm * freq * 6) + eegPhase * 0.7) * 0.1
          const y = mid + wave * amp
          if (x === 0) eegCtx.moveTo(x, y)
          else eegCtx.lineTo(x, y)
        }
        eegCtx.stroke()

        // Glow effect
        eegCtx.strokeStyle = color + '30'
        eegCtx.lineWidth = 6
        eegCtx.stroke()
      }

      // Timeline cards
      const tcards = document.querySelectorAll('.timeline-card')
      let tcurrent = 0
      let tplaying = true
      let ttimer = null

      function activateCard(i) {
        tcurrent = i
        tcards.forEach((c, idx) => c.classList.toggle('active', idx === i))
      }

      tcards.forEach((c, i) => {
        c.addEventListener('click', () => {
          activateCard(i)
          if (tplaying) {
            clearInterval(ttimer)
            ttimer = setInterval(() => activateCard((tcurrent + 1) % tcards.length), 4200)
          }
        })
      })

      activateCard(0)
      ttimer = setInterval(() => activateCard((tcurrent + 1) % tcards.length), 4200)

      // Background particles
      const bgEl = document.getElementById('bg-particles')
      if (bgEl) {
        const bgClrs = ['#2A9D8F', '#E76F51', '#F4A261', '#81B29A', '#A78BFA', '#5C3A21']
        for (let i = 0; i < 20; i++) {
          const s = document.createElement('span')
          const size = 80 + Math.random() * 180
          s.style.cssText =
            `width:${size}px;height:${size}px;` +
            `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
            `background:${bgClrs[i % bgClrs.length]};opacity:0.07;` +
            `animation-delay:${Math.random() * 10}s;` +
            `animation-duration:${16 + Math.random() * 10}s`
          bgEl.appendChild(s)
        }
      }

      // Kick off
      requestAnimationFrame(tick)
    }

    setTimeout(initializeAnimation, 100)

    return () => {
      // Cleanup
      initialized.current = false
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        :root {
          --choc: #5C3A21;
        }

        body {
          -webkit-font-smoothing: antialiased;
        }

        .og {
          opacity: .2;
          transition: opacity .8s ease, filter .8s ease;
          transform-box: fill-box;
          transform-origin: center;
        }

        .og.active {
          opacity: 1;
          animation: ogPulse 2.8s ease-in-out infinite;
        }

        .og.burst {
          animation: ogBurst .55s ease-out forwards !important;
          opacity: 1 !important;
        }

        @keyframes ogPulse {
          0%, 100% { transform: scale(1) }
          50% { transform: scale(1.045) }
        }

        @keyframes ogBurst {
          0% { transform: scale(1) }
          45% { transform: scale(1.22) }
          100% { transform: scale(1) }
        }

        .of {
          transition: fill .65s ease;
        }

        .os {
          transition: stroke .65s ease;
        }

        .awave {
          stroke-dasharray: 4 6;
          animation: wvFlow 1.6s linear infinite;
        }

        @keyframes wvFlow {
          to { stroke-dashoffset: -20 }
        }

        #alpha-layer {
          opacity: 0;
          transition: opacity .5s ease;
        }

        #alpha-layer.on {
          opacity: 1;
        }

        #vagus-path {
          stroke-dasharray: 6 10;
          opacity: 0;
          transition: opacity .7s ease;
        }

        #vagus-path.on {
          opacity: .9;
          animation: dashMove 1.3s linear infinite;
        }

        @keyframes dashMove {
          to { stroke-dashoffset: -28 }
        }

        #vagus-lbl {
          opacity: 0;
          transition: opacity .7s ease;
        }

        #vagus-lbl.on {
          opacity: 1;
        }

        #relax-overlay {
          opacity: 0;
          transition: opacity 1.2s ease;
          pointer-events: none;
        }

        #status-grp {
          opacity: 0;
          transition: opacity .4s ease;
        }

        #status-grp.on {
          opacity: 1;
        }

        #choc-bar {
          opacity: 0;
          transition: opacity .4s ease, transform .5s ease;
          transform-origin: 170px 78px;
        }

        #blood-vessels {
          opacity: .14;
          transition: opacity 1.1s ease;
        }

        #blood-vessels.lit {
          opacity: .55;
        }

        .svgbadge {
          opacity: 0;
          transform: translateX(14px);
          transition: opacity .55s ease, transform .55s ease;
        }

        .svgbadge.show {
          opacity: 1;
          transform: translateX(0);
        }

        .ctrl-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 252, 249, .92);
          border-radius: 999px;
          border: 1px solid #EDE3DA;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 14px rgba(92, 58, 33, .09);
        }

        .ctrl-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5C3A21;
          transition: background .2s;
        }

        .ctrl-btn:hover {
          background: #F4EDE8;
        }

        .prog-track {
          flex: 1;
          height: 4px;
          background: #EDE3DA;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }

        .prog-fill {
          height: 100%;
          background: #5C3A21;
          border-radius: 2px;
          pointer-events: none;
        }

        .prog-thumb {
          width: 10px;
          height: 10px;
          background: #5C3A21;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: left .1s linear;
        }

        .time-lbl {
          font-size: 10px;
          font-weight: 600;
          color: #9E8070;
          min-width: 28px;
          text-align: right;
        }

        .timeline-card {
          transition: all .4s cubic-bezier(.2, .8, .2, 1);
        }

        .timeline-card.active {
          transform: translateX(4px);
          box-shadow: 0 20px 40px -15px rgba(92, 58, 33, .25);
        }

        .timeline-card:not(.active):hover {
          transform: translateY(-2px);
        }

        #bg-particles span {
          position: absolute;
          border-radius: 9999px;
          filter: blur(38px);
          will-change: transform;
          animation: floatBg 18s ease-in-out infinite;
        }

        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1) }
          50% { transform: translate(15px, -25px) scale(1.05) }
        }

        .source-chip {
          font-size: 10.5px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .stat-callout {
          border-radius: 1rem;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hormone-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 90px;
        }

        .hormone-gauge {
          background: rgba(255, 252, 249, .85);
          border: 1px solid #EDE3DA;
          border-radius: 14px;
          padding: 8px 10px;
          backdrop-filter: blur(6px);
          box-shadow: 0 2px 8px rgba(92, 58, 33, .06);
          transition: box-shadow .4s;
        }

        .hormone-gauge.pulse {
          box-shadow: 0 2px 16px rgba(92, 58, 33, .18);
        }

        .hormone-gauge .h-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .3px;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }

        .hormone-gauge .h-bar-bg {
          height: 5px;
          background: #EDE3DA;
          border-radius: 3px;
          overflow: hidden;
        }

        .hormone-gauge .h-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width .3s ease;
        }

        .hormone-gauge .h-val {
          font-size: 11px;
          font-weight: 800;
          text-align: right;
          margin-top: 2px;
        }

        .eeg-wrap {
          background: rgba(255, 252, 249, .9);
          border: 1px solid #EDE3DA;
          border-radius: 12px;
          padding: 6px;
          width: 52px;
          box-shadow: 0 2px 10px rgba(92, 58, 33, .06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          position: absolute;
          top: 20px;
          right: 15px;
          z-index: 20;
        }

        .eeg-wrap .eeg-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          width: 100%;
        }

        .eeg-wrap .eeg-title {
          font-size: 7px;
          font-weight: 800;
          color: #5C3A21;
          letter-spacing: .2px;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.1;
        }

        .eeg-wrap .eeg-freq {
          font-size: 7px;
          font-weight: 700;
          padding: 2px 3px;
          border-radius: 4px;
          transition: all .5s;
          text-align: center;
          width: 100%;
        }

        #eeg-canvas {
          width: 100%;
          height: auto;
          aspect-ratio: 2/1;
          border-radius: 4px;
          display: block;
        }

        @media (max-width:767px) {
          .body-layout {
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }

          .hormone-panel {
            flex-direction: row;
            width: 100%;
            justify-content: center;
            margin-bottom: 8px;
          }

          .hormone-gauge {
            min-width: 75px;
            flex: 1;
          }
          
          .eeg-wrap {
            width: 52px;
            right: 10px;
            top: 15px;
          }
        }
      `}</style>

      <div ref={containerRef} className="bg-white text-slate-800 relative overflow-x-hidden">
        <div id="bg-particles" className="pointer-events-none fixed inset-0 -z-10"></div>

        <header className="relative z-10 pt-12 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#5C3A21' }}></div>
              <span className="text-xs font-semibold tracking-widest uppercase text-stone-500">Be Good</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: '#5C3A21' }}>Be Good A-Bar</h1>
            <p className="mt-3 text-xl md:text-2xl font-medium text-stone-600">Calm Your Mind. Own The Moment.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2">
                  <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="text-sm font-medium text-stone-700">Science-Backed</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E76F51" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span className="text-sm font-medium text-stone-700">Fast Acting (15-20 min)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4A261" strokeWidth="2">
                  <path d="M12 21c-4-3-7-5.5-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3.5-3 6-7 9z" />
                </svg>
                <span className="text-sm font-medium text-stone-700">Delicious</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            {/* Left Column - Body Visualization */}
            <div className="w-full lg:w-[57%]">
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-stone-100 shadow-[0_30px_80px_-30px_rgba(92,58,33,0.3)] p-6 md:p-8 lg:sticky lg:top-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[17px] font-semibold tracking-wide" style={{ color: '#5C3A21' }}>
                    HOW IT WORKS IN YOUR BODY
                  </h2>
                </div>

                <div className="flex items-center justify-between gap-2 md:gap-4 body-layout relative">
                  <div className="hormone-panel" id="hormone-panel">
                    <div className="hormone-gauge" id="hg-cortisol">
                      <div className="h-label"><span style={{ color: '#ef4444' }}>Cortisol</span><span className="h-arrow" style={{ color: '#ef4444' }}>↓</span></div>
                      <div className="h-bar-bg">
                        <div className="h-bar-fill" id="hbar-cortisol" style={{ width: '100%', background: '#ef4444' }}></div>
                      </div>
                      <div className="h-val" id="hval-cortisol" style={{ color: '#ef4444' }}>100%</div>
                    </div>
                    <div className="hormone-gauge" id="hg-glutamate">
                      <div className="h-label"><span style={{ color: '#f97316' }}>Glutamate</span><span className="h-arrow" style={{ color: '#f97316' }}>↓</span></div>
                      <div className="h-bar-bg">
                        <div className="h-bar-fill" id="hbar-glutamate" style={{ width: '100%', background: '#f97316' }}></div>
                      </div>
                      <div className="h-val" id="hval-glutamate" style={{ color: '#f97316' }}>100%</div>
                    </div>
                    <div className="hormone-gauge" id="hg-gaba">
                      <div className="h-label"><span style={{ color: '#22c55e' }}>GABA</span><span className="h-arrow" style={{ color: '#22c55e' }}>↑</span></div>
                      <div className="h-bar-bg">
                        <div className="h-bar-fill" id="hbar-gaba" style={{ width: '30%', background: '#22c55e' }}></div>
                      </div>
                      <div className="h-val" id="hval-gaba" style={{ color: '#22c55e' }}>30%</div>
                    </div>
                    <div className="hormone-gauge" id="hg-serotonin">
                      <div className="h-label"><span style={{ color: '#14b8a6' }}>Serotonin</span><span className="h-arrow" style={{ color: '#14b8a6' }}>↑</span></div>
                      <div className="h-bar-bg">
                        <div className="h-bar-fill" id="hbar-serotonin" style={{ width: '40%', background: '#14b8a6' }}></div>
                      </div>
                      <div className="h-val" id="hval-serotonin" style={{ color: '#14b8a6' }}>40%</div>
                    </div>
                  </div>

                  <div className="relative flex-1 max-w-[320px] mx-auto" style={{ aspectRatio: '1/2' }}>
                    <svg id="body-svg" viewBox="0 0 340 680" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" overflow="visible">
                      <g id="realistic-body-structure">
                        {/* HEAD */}
                        <ellipse cx="170" cy="48" rx="36" ry="42" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />
                        {/* Ears */}
                        <ellipse cx="134" cy="50" rx="5.5" ry="10" fill="#F2E8DF" stroke="#C4B8AC" strokeWidth="1.3" />
                        <ellipse cx="206" cy="50" rx="5.5" ry="10" fill="#F2E8DF" stroke="#C4B8AC" strokeWidth="1.3" />

                        {/* NECK */}
                        <path d="M155,88 L153,108 L187,108 L185,88 Z" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />

                        {/* TORSO */}
                        <path d="M153,108 C136,108 116,112 108,120 C104,140 104,165 108,192 C106,218 106,246 110,274 C110,304 114,334 120,362 C124,388 128,412 132,434 L152,446 L170,450 L188,446 L208,434 C212,412 216,388 220,362 C226,334 230,304 230,274 C234,246 234,218 232,192 C236,165 236,140 232,120 C224,112 204,108 187,108 Z" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />

                        {/* LEFT ARM */}
                        <path d="M108,120 C100,128 88,145 80,168 C74,188 72,214 74,240 C74,262 78,282 84,298 C88,310 94,320 100,323 C106,325 112,321 116,313 C120,305 118,292 115,276 C112,260 112,240 114,218 C116,198 120,178 124,162 C126,148 126,134 122,122 C118,114 113,116 108,120 Z" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />

                        {/* RIGHT ARM */}
                        <path d="M232,120 C240,128 252,145 260,168 C266,188 268,214 266,240 C266,262 262,282 256,298 C252,310 246,320 240,323 C234,325 228,321 224,313 C220,305 222,292 225,276 C228,260 228,240 226,218 C224,198 220,178 216,162 C214,148 214,134 218,122 C222,114 227,116 232,120 Z" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />

                        {/* LEGS */}
                        <path d="M132,434 C126,452 118,476 114,506 C110,536 108,567 110,600 C110,624 114,644 120,656 C126,664 136,667 146,664 C154,661 160,654 162,644 C164,626 164,600 164,572 C164,546 165,520 166,496 C167,474 168,456 170,450 C172,456 173,474 174,496 C175,520 176,546 176,572 C176,600 176,626 178,644 C180,654 186,661 194,664 C204,667 214,664 220,656 C226,644 230,624 230,600 C232,567 230,536 226,506 C222,476 214,452 208,434 Z" fill="#FFFAF5" stroke="#C4B8AC" strokeWidth="1.8" />

                        {/* Knee guide lines */}
                        <line x1="112" y1="548" x2="162" y2="548" stroke="#DDD0C8" strokeWidth="1.2" opacity=".3" />
                        <line x1="178" y1="548" x2="228" y2="548" stroke="#DDD0C8" strokeWidth="1.2" opacity=".3" />
                        {/* Ankle guide lines */}
                        <line x1="114" y1="624" x2="158" y2="624" stroke="#DDD0C8" strokeWidth="1.2" opacity=".25" />
                        <line x1="182" y1="624" x2="226" y2="624" stroke="#DDD0C8" strokeWidth="1.2" opacity=".25" />

                        {/* Spine dashed line */}
                        <line x1="170" y1="108" x2="170" y2="434" stroke="#E8DDD6" strokeWidth="1.5" strokeDasharray="4 6" opacity=".35" />

                        {/* Rib cage guide arcs */}
                        <path d="M138,152 Q170,158 202,152" fill="none" stroke="#DDD0C8" strokeWidth="1" opacity=".25" />
                        <path d="M130,175 Q170,182 210,175" fill="none" stroke="#DDD0C8" strokeWidth="1" opacity=".25" />
                        <path d="M126,198 Q170,207 214,198" fill="none" stroke="#DDD0C8" strokeWidth="1" opacity=".22" />

                        {/* Waist / hip horizontal guides */}
                        <line x1="116" y1="270" x2="224" y2="270" stroke="#DDD0C8" strokeWidth="1.2" opacity=".32" />
                        <line x1="112" y1="306" x2="228" y2="306" stroke="#DDD0C8" strokeWidth="1.2" opacity=".28" />
                        <line x1="114" y1="342" x2="226" y2="342" stroke="#DDD0C8" strokeWidth="1.2" opacity=".24" />
                        <line x1="118" y1="378" x2="222" y2="378" stroke="#DDD0C8" strokeWidth="1.2" opacity=".20" />
                      </g>

                      {/* Collarbone guides */}
                      <path d="M155,114 Q170,118 185,114" fill="none" stroke="#DDD0C8" strokeWidth="1.5" opacity=".3" strokeLinecap="round" />
                      {/* Cervical spine */}
                      <path d="M170,88 L170,108" fill="none" stroke="#DDD0C8" strokeWidth="3" strokeLinecap="round" opacity=".3" />
                      {/* Upper shoulder guides */}
                      <path d="M170,120 C155,126 135,136 118,142" fill="none" stroke="#DDD0C8" strokeWidth="2" opacity=".22" strokeLinecap="round" />
                      <path d="M170,120 C185,126 205,136 222,142" fill="none" stroke="#DDD0C8" strokeWidth="2" opacity=".22" strokeLinecap="round" />

                      <g id="blood-vessels">
                        <path d="M160 210 L162 430" stroke="#E76F5170" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M160 208 C160 178 163 148 166 118 C168 96 169 74 170 50" stroke="#E76F5170" strokeWidth="2" fill="none" strokeDasharray="3 5" strokeLinecap="round" />
                        <path d="M159 206 C140 198 120 180 110 170" stroke="#E76F5160" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M160 208 C180 198 220 180 230 170" stroke="#E76F5160" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </g>

                      {/* ORGANS */}
                      <g id="org-brain" className="og">
                        <ellipse cx="162" cy="44" rx="20" ry="18" className="of" data-df="#E8A0A0" style={{ fill: '#E8A0A0' }} />
                        <ellipse cx="178" cy="44" rx="20" ry="18" className="of" data-df="#E8A0A0" style={{ fill: '#E8A0A0' }} />
                        <ellipse cx="170" cy="56" rx="19" ry="10" className="of" data-df="#D4908E" style={{ fill: '#D4908E' }} />
                        <path d="M154,37 C157,33 162,33 165,37" fill="none" stroke="#FFFCF9" strokeWidth="1" strokeLinecap="round" opacity=".35" />
                        <path d="M175,37 C178,33 183,33 186,37" fill="none" stroke="#FFFCF9" strokeWidth="1" strokeLinecap="round" opacity=".35" />
                        <path d="M151,47 C155,43 161,42 165,47" fill="none" stroke="#FFFCF9" strokeWidth=".8" strokeLinecap="round" opacity=".25" />
                        <path d="M175,47 C179,43 185,42 189,47" fill="none" stroke="#FFFCF9" strokeWidth=".8" strokeLinecap="round" opacity=".25" />
                        <line x1="170" y1="28" x2="170" y2="62" stroke="#FFFCF9" strokeWidth="1.5" opacity=".4" />
                        <g id="alpha-layer">
                          <path className="awave" d="M148 46 q6-5 12 0 t12 0 t12 0" fill="none" stroke="white" strokeOpacity=".92" strokeWidth="2.2" strokeLinecap="round" />
                          <path className="awave" d="M150 57 q6-5 12 0 t12 0" fill="none" stroke="white" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '.22s' }} />
                        </g>
                      </g>

                      <g id="org-heart" className="og">
                        <path d="M164 218 C148 205 132 192 137 177 C139 168 148 166 156 172 C159 175 162 179 164 183 C165 179 168 175 171 172 C179 166 188 168 190 177 C195 192 179 205 164 218Z" className="of" data-df="#C0392B" style={{ fill: '#C0392B' }} />
                      </g>

                      <g id="org-lungLeft" className="og">
                        <path d="M113 152 C111 140 115 128 125 126 C131 125 141 130 146 140 L150 215 C150 228 140 234 130 230 C119 226 113 215 113 202Z" className="of" data-df="#D4867C" style={{ fill: '#D4867C' }} />
                        <path d="M118 174 L142 166" fill="none" stroke="#FFFCF9" strokeWidth=".8" opacity=".3" />
                      </g>

                      <g id="org-lungRight" className="og">
                        <path d="M227 152 C229 140 225 128 215 126 C209 125 199 130 194 140 L190 215 C190 228 200 234 210 230 C221 226 227 215 227 202Z" className="of" data-df="#D4867C" style={{ fill: '#D4867C' }} />
                        <path d="M222 174 L198 166" fill="none" stroke="#FFFCF9" strokeWidth=".8" opacity=".3" />
                      </g>

                      <g id="org-liver" className="og">
                        <path d="M175 244 C180 233 198 228 218 233 C236 238 248 251 246 266 C244 281 230 289 214 288 C197 287 184 277 178 263 C172 251 171 249 175 244Z" className="of" data-df="#8B5E3C" style={{ fill: '#8B5E3C' }} />
                      </g>

                      <g id="org-stomach" className="og">
                        <path d="M133 236 C129 225 135 213 147 211 L161 210 C172 210 177 220 175 232 C179 240 179 255 174 265 C177 277 171 290 159 293 C147 296 135 290 130 279 C124 268 127 250 133 236Z" className="of" data-df="#D4B896" style={{ fill: '#D4B896' }} />
                      </g>

                      <g id="org-kidneyLeft" className="og">
                        <ellipse cx="118" cy="318" rx="14" ry="27" className="of" data-df="#A0522D" style={{ fill: '#A0522D' }} />
                        <ellipse cx="123" cy="318" rx="6" ry="19" fill="#FFFCF9" opacity=".25" />
                      </g>

                      <g id="org-kidneyRight" className="og">
                        <ellipse cx="222" cy="318" rx="14" ry="27" className="of" data-df="#A0522D" style={{ fill: '#A0522D' }} />
                        <ellipse cx="217" cy="318" rx="6" ry="19" fill="#FFFCF9" opacity=".25" />
                      </g>

                      <g id="org-smallInt" className="og">
                        <ellipse cx="170" cy="370" rx="50" ry="38" className="of" data-df="#E8B4A8" style={{ fill: '#E8B4A8', opacity: '.68' }} />
                        <path d="M138 356 Q151 344 164 350 Q177 355 186 366 Q192 378 184 388 Q175 396 162 393 Q150 388 143 378" fill="none" stroke="#C4948A" strokeWidth="3" strokeLinecap="round" />
                        <path d="M148 368 Q158 360 167 365 Q176 370 177 379 Q175 388 165 390 Q155 388 150 380" fill="none" stroke="#C4948A" strokeWidth="2.5" strokeLinecap="round" />
                      </g>

                      <g id="org-colon" className="og">
                        <path d="M122 338 C122 324 131 314 146 314 L194 314 C209 314 218 325 218 340 L218 400 C218 415 209 424 194 424 L146 424 C131 424 122 415 122 400Z" fill="none" className="os" data-ds="#A8B078" style={{ stroke: '#A8B078' }} strokeWidth="18" strokeLinecap="round" opacity=".35" />
                        <path d="M122 338 C122 324 131 314 146 314 L194 314 C209 314 218 325 218 340 L218 400 C218 415 209 424 194 424 L146 424 C131 424 122 415 122 400Z" fill="none" className="os" data-ds="#A8B078" style={{ stroke: '#A8B078' }} strokeWidth="13" strokeLinecap="round" />
                        <circle cx="122" cy="353" r="4.5" className="of" data-df="#A8B078" style={{ fill: '#A8B078' }} opacity=".8" />
                        <circle cx="122" cy="375" r="3.5" className="of" data-df="#A8B078" style={{ fill: '#A8B078' }} opacity=".7" />
                      </g>

                      <ellipse id="relax-overlay" cx="170" cy="300" rx="110" ry="260" fill="#A78BFA" />

                      <path id="vagus-path" d="M165 390 C138 355 116 298 120 244 C124 200 142 166 158 126 C164 108 168 92 170 68" fill="none" stroke="#81B29A" strokeWidth="3" strokeLinecap="round" />

                      <g id="vagus-lbl">
                        <rect x="72" y="268" width="54" height="26" rx="7" fill="#81B29A" opacity=".93" />
                        <text x="99" y="278" fontSize="7.5" fontFamily="Inter,sans-serif" fill="white" fontWeight="700" textAnchor="middle">Vagus</text>
                        <text x="99" y="289" fontSize="7.5" fontFamily="Inter,sans-serif" fill="white" fontWeight="600" textAnchor="middle">Nerve ↑</text>
                      </g>

                      <g id="choc-bar">
                        <rect x="158" y="72" width="24" height="16" rx="3.5" fill="#5C3A21" />
                        <rect x="158" y="72" width="11" height="7" rx="1.5" fill="#7B4F2E" stroke="#3D2516" strokeWidth=".4" />
                        <rect x="171" y="72" width="11" height="7" rx="1.5" fill="#7B4F2E" stroke="#3D2516" strokeWidth=".4" />
                        <rect x="158" y="81" width="11" height="7" rx="1.5" fill="#7B4F2E" stroke="#3D2516" strokeWidth=".4" />
                        <rect x="171" y="81" width="11" height="7" rx="1.5" fill="#7B4F2E" stroke="#3D2516" strokeWidth=".4" />
                      </g>

                      <g id="status-grp">
                        <rect x="107" y="300" width="126" height="24" rx="7" fill="#5C3A21" opacity=".9" />
                        <text id="status-txt" x="170" y="316" fontSize="9.5" fontFamily="Inter,sans-serif" fill="white" fontWeight="700" textAnchor="middle">Digesting...</text>
                      </g>

                      <g id="particle-layer" />

                      <g id="svgbadge-cortisol" className="svgbadge">
                        <rect x="252" y="160" width="82" height="22" rx="11" fill="#ef4444" opacity=".95" />
                        <text x="293" y="174.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↓ Cortisol</text>
                      </g>

                      <g id="svgbadge-gaba" className="svgbadge">
                        <rect x="252" y="187" width="82" height="22" rx="11" fill="#22c55e" opacity=".95" />
                        <text x="293" y="201.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↑ GABA</text>
                      </g>

                      <g id="svgbadge-glutamate" className="svgbadge">
                        <rect x="252" y="214" width="82" height="22" rx="11" fill="#f97316" opacity=".95" />
                        <text x="293" y="228.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↓ Glutamate</text>
                      </g>

                      <g id="svgbadge-serotonin" className="svgbadge">
                        <rect x="252" y="241" width="82" height="22" rx="11" fill="#14b8a6" opacity=".95" />
                        <text x="293" y="255.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↑ Serotonin</text>
                      </g>

                      <g id="svgbadge-alertness" className="svgbadge">
                        <rect x="252" y="268" width="82" height="22" rx="11" fill="#E76F51" opacity=".95" />
                        <text x="293" y="282.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↑ Alertness</text>
                      </g>

                      <g id="svgbadge-membrane" className="svgbadge">
                        <rect x="252" y="295" width="82" height="22" rx="11" fill="#F4A261" opacity=".95" />
                        <text x="293" y="309.5" fontSize="9" fontFamily="Inter,sans-serif" fill="white" fontWeight="800" textAnchor="middle">↑ Membrane</text>
                      </g>
                    </svg>

                    <div className="eeg-wrap" id="eeg-wrap">
                      <div className="eeg-header">
                        <span className="eeg-title">EEG</span>
                        <span className="eeg-freq" id="eeg-freq-label" style={{ background: '#ef444420', color: '#ef4444' }}>Hβ 22Hz</span>
                      </div>
                      <canvas id="eeg-canvas" width="120" height="60"></canvas>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="ctrl-wrap" style={{ maxWidth: '320px', width: '100%' }}>
                    <button id="btn-rw" className="ctrl-btn" title="Restart from beginning">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <polygon points="19 20 9 12 19 4" />
                        <line x1="5" y1="4" x2="5" y2="20" />
                      </svg>
                    </button>
                    <button id="btn-pp" className="ctrl-btn" title="Play / Pause">
                      <svg id="icon-pause" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <rect x="7" y="5" width="3" height="14" rx="1" />
                        <rect x="14" y="5" width="3" height="14" rx="1" />
                      </svg>
                      <svg id="icon-play" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="hidden">
                        <polygon points="6 4 20 12 6 20" />
                      </svg>
                    </button>
                    <div className="prog-track" id="prog-track">
                      <div className="prog-fill" id="prog-fill" style={{ width: '0%' }}></div>
                      <div className="prog-thumb" id="prog-thumb" style={{ left: '0%' }}></div>
                    </div>
                    <span className="time-lbl" id="time-lbl">0:00</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2A9D8F' }}></span>
                  Watch how A-Bar works inside your body
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="w-full lg:w-[43%]">
              <div id="timeline" className="space-y-4">
                {/* Step 0 - Bite */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer active" data-step="0">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full" style={{ background: '#5C3A21' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-[#5C3A21]/20" style={{ background: '#5C3A21' }}>
                        0<span className="text-[10px] ml-0.5 mt-3 font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold" style={{ color: '#5C3A21' }}>Bite</h3>
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

                {/* Step 1 - Lift */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="1">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#E76F51' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg shadow-[#E76F51]/20" style={{ background: '#E76F51' }}>
                        <span className="text-[13px]">15-20</span>
                        <span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold" style={{ color: '#E76F51' }}>Lift</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: '#E76F51' }}>Clean Calm</span>
                      </div>
                      <p className="text-[14.5px] leading-snug text-slate-600">Caffeine blocks adenosine (sleepiness signals), sharpening focus. Simultaneously, L-Theanine counters caffeine's vasoconstrictive side-effects — keeping blood flowing to the brain. The <strong>Nootropic Stack</strong> delivers all the focus of coffee, none of the jitters.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#E76F5118', color: '#b04030', border: '1px solid #E76F5140' }}>☕ Coffee & Cocoa (Caffeine + L-Theanine)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 - Brain Shift */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="2">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#2A9D8F' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg shadow-[#2A9D8F]/20" style={{ background: '#2A9D8F' }}>
                        <span className="text-[13px]">30-40</span>
                        <span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold" style={{ color: '#2A9D8F' }}>Brain Shift</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: '#2A9D8F' }}>Alert Relaxation</span>
                      </div>
                      <p className="text-[14.5px] leading-snug text-slate-600">L-Theanine crosses the blood-brain barrier and quiets overactive cortical neurons — the &quot;stress firing.&quot; The brain shifts from <strong>High Beta</strong> (panic/anxiety) to <strong>Alpha waves (8–14 Hz)</strong>: the rhythm of <em>Alert Relaxation</em> — like meditation, while fully awake. (Hidese et al., 2019)</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#2A9D8F18', color: '#1a6b62', border: '1px solid #2A9D8F40' }}>☕ Coffee & Cocoa (L-Theanine)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 - Steady Calm */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="3">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#A78BFA' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg shadow-[#A78BFA]/20" style={{ background: '#A78BFA' }}>
                        <span className="text-[13px]">60-90</span>
                        <span className="text-[10px] font-medium">min</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#A78BFA' }}>Steady Calm</h4>
                      <p className="text-[14.5px] leading-snug text-slate-600">Magnesium works on two fronts: as an <strong>NMDA antagonist</strong> it blocks excess calcium from over-exciting neurons; as a <strong>GABA agonist</strong> it activates the brain&apos;s own calming neurotransmitter. Together, they put a biochemical &quot;brake&quot; on the HPA axis — reducing Cortisol. Omega-3s (EPA/DHA) keep neuron membranes fluid, helping Serotonin and Dopamine bind more easily.</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#A78BFA18', color: '#6d48d6', border: '1px solid #A78BFA40' }}>🥜 Almond Butter · Cocoa · Walnuts · Seeds (Mg)</span>
                        <span className="source-chip" style={{ background: '#A78BFA18', color: '#6d48d6', border: '1px solid #A78BFA40' }}>🌱 Walnuts · Chia/Flax Seeds (Omega-3)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 - Gut Support */}
                <div className="timeline-card group relative bg-white rounded-3xl p-5 md:p-6 border border-stone-100 shadow-md cursor-pointer" data-step="4">
                  <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full opacity-60 group-[.active]:opacity-100 transition" style={{ background: '#81B29A' }}></div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold leading-none shadow-lg shadow-[#81B29A]/20" style={{ background: '#81B29A' }}>
                        <span className="text-[13px]">2-4</span>
                        <span className="text-[10px] font-medium">h+</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#5a8f7a' }}>Gut Support</h4>
                      <p className="text-[14.5px] leading-snug text-slate-600">Chicory Root fiber feeds <em>Bifidobacteria</em> in your colon. They produce Short-Chain Fatty Acids — including <strong>Butyrate</strong> — which signal via the <strong>Vagus Nerve</strong> (the gut-brain highway) to lower inflammatory stress markers and support serotonin production.</p>
                      <div className="stat-callout mt-3" style={{ background: '#81B29A12', border: '1px solid #81B29A45' }}>
                        <span className="text-2xl font-extrabold shrink-0 leading-none" style={{ color: '#81B29A' }}>+18%</span>
                        <span className="text-[12px] leading-snug text-slate-600"><strong>Absorption Synergy:</strong> Chicory fiber lowers gut pH, making Magnesium up to 18% more bioavailable — so your body actually absorbs the calm.</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="source-chip" style={{ background: '#81B29A18', color: '#3d7a60', border: '1px solid #81B29A40' }}>🌿 Chicory Root (Inulin / Oligofructose)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-stone-50 to-white border border-stone-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F4A26120' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4A261" strokeWidth="2">
                      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone-600">Formulated for ages 20-45 who want clear calm without the crash. No jitters, just steady focus you can feel.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Scientific References */}
        <footer className="border-t border-stone-100 bg-stone-50/50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-3">
              Scientific References
            </h4>
            <ol className="space-y-2 text-[11px] leading-snug text-stone-500 list-decimal list-inside">
              <li>Hidese S et al. Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults. <em>Nutrients.</em> 2019;11(10):2362.
                <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6836118/" target="_blank" rel="noopener" className="ml-1 underline hover:text-stone-700 transition">↗ Read study</a>
              </li>
              <li>Giesbrecht T et al. The combination of L-theanine and caffeine improves cognitive performance. <em>Nutr Neurosci.</em> 2010;13(6):283-290.
                <a href="https://pubmed.ncbi.nlm.nih.gov/21040626/" target="_blank" rel="noopener" className="ml-1 underline hover:text-stone-700 transition">↗ Read study</a>
              </li>
              <li>Boyle NB et al. The Effects of Magnesium Supplementation on Subjective Anxiety. <em>Nutrients.</em> 2017;9(5):429.
                <a href="https://www.mdpi.com/2072-6643/9/5/429" target="_blank" rel="noopener" className="ml-1 underline hover:text-stone-700 transition">↗ Read study</a>
              </li>
              <li>Su KP et al. Omega-3 Fatty Acids in the Psychiatric Field. <em>Nutrients.</em> 2023.
                <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9962071/" target="_blank" rel="noopener" className="ml-1 underline hover:text-stone-700 transition">↗ Read study</a>
              </li>
              <li>Deehan EC & Walter J. The Fiber Gap and the Gut-Brain Axis. <em>Trends Endocrinol Metab.</em> 2016.
                <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5808284/" target="_blank" rel="noopener" className="ml-1 underline hover:text-stone-700 transition">↗ Read study</a>
              </li>
            </ol>
            <p className="mt-4 text-[11px] text-stone-400">Educational information only. A-Bar is a food, not a medicine. Effects vary person to person. Consult a professional for health concerns.</p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#5C3A21' }}>be good</span>
              <span className="text-stone-300">•</span>
              <a href="https://begoodshop.in" className="text-sm text-stone-500 hover:text-stone-700">
                begoodshop.in
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
