import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'framer-motion'
import GalleryScene from '../scenes/GalleryScene'
import Hero from './Hero'
import { PROPERTIES, BRAND, img } from '../data/content'
import { shared, setState, getState, useStore } from '../state/store'
import { STOPS, HERO_POSE, createGalleryTour, enterGallery, gsap } from '../animations/scrollAnimations'
import { getLenis, scrollToTarget } from '../lib/scroll'
import { isMobile, prefersReducedMotion } from '../lib/env'
import { CSS_GRADE } from '../lib/grade'
import { EASE } from './common'

export default function PropertyGallery({ webgl }) {
  const section = useRef(null)
  const trigger = useRef(null)
  const [visible, setVisible] = useState(true)
  const loaded = useStore((s) => s.loaded)
  const entered = useStore((s) => s.entered)
  const activeStop = useStore((s) => s.activeStop)
  const quality = isMobile() ? 'low' : 'high'

  const enter = () => enterGallery({ lenis: getLenis() })

  // pinned, scroll-driven camera tour
  useLayoutEffect(() => {
    if (!webgl) return
    trigger.current = createGalleryTour(section.current, STOPS.length)
    return () => trigger.current?.kill()
  }, [webgl])

  // page entrance: slow dolly toward the closed doors
  useEffect(() => {
    if (!loaded) return
    if (prefersReducedMotion()) shared.heroIn = 1
    else gsap.to(shared, { heroIn: 1, duration: 2.4, ease: 'power3.out' })
  }, [loaded])

  // scroll / swipe / keys on the closed doors open them
  useEffect(() => {
    if (!webgl) return
    let touchY = 0
    const ready = () => getState().loaded && !getState().entered && !getState().menuOpen
    const onWheel = (e) => ready() && e.deltaY > 4 && enter()
    const onTouchStart = (e) => (touchY = e.touches[0].clientY)
    const onTouchMove = (e) => ready() && touchY - e.touches[0].clientY > 24 && enter()
    const onKey = (e) => {
      if (ready() && ['ArrowDown', 'PageDown', ' '].includes(e.key) && document.activeElement === document.body) {
        e.preventDefault()
        enter()
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [webgl])

  // ← / → step through the works while the tour is pinned
  useEffect(() => {
    const onKey = (e) => {
      const st = trigger.current
      const s = getState()
      if (!st || !s.entered || s.menuOpen || s.sheet || !st.isActive) return
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const segs = STOPS.length - 1
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const cur = Math.round(shared.progress * segs)
      let next = Math.max(0, Math.min(segs, cur + dir))
      while (STOPS[next]?.pass && next > 0 && next < segs) next += dir // skip walk-through waypoints
      const y = st.start + ((st.end - st.start) * next) / segs
      const l = getLenis()
      l ? l.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // pause rendering when the gallery is off screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(section.current)
    return () => io.disconnect()
  }, [])

  if (!webgl) return <FallbackGallery />

  return (
    <section id="gallery" ref={section} className="gallery" aria-label="Property gallery">
      <div className="gallery__canvas">
        <Canvas
          shadows="soft"
          dpr={quality === 'high' ? [1, 1.5] : [1, 1.25]}
          frameloop={visible ? 'always' : 'never'}
          camera={{ fov: 45, near: 0.1, far: 2000, position: HERO_POSE.p }}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}
          aria-label="3D gallery of ESTAVÉ properties"
          role="img"
        >
          <GalleryScene quality={quality} onNavigate={scrollToTarget} />
        </Canvas>
      </div>

      <Hero onEnter={enter} />

      <AnimatePresence>
        {entered && activeStop === 0 && (
          <motion.p
            className="gallery__hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.6, duration: 0.8, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            Scroll to walk through the collection
          </motion.p>
        )}
      </AnimatePresence>

      {/* keyboard / screen-reader access to the works hung in 3D */}
      <nav className="sr-only" aria-label="Properties in the gallery">
        <ul>
          {PROPERTIES.map((p) => (
            <li key={p.slug}>
              <button onClick={() => setState({ sheet: p.slug })}>
                {p.name}, {p.location}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}

// No WebGL: same content, flat. Honest about what's missing.
function FallbackGallery() {
  useEffect(() => {
    setState({ entered: true, loaded: true })
    document.documentElement.classList.remove('is-locked')
  }, [])
  return (
    <section id="gallery" className="fallback" aria-label="Property gallery">
      <div className="fallback__head">
        <h1 className="display">{BRAND.tagline.toUpperCase()}</h1>
        <p className="muted" style={{ marginTop: 18 }}>
          Your browser can’t display the 3D gallery (WebGL is unavailable), so here is the collection as a list.
        </p>
      </div>
      <div className="fallback__strip">
        {PROPERTIES.map((p) => (
          <button key={p.slug} onClick={() => setState({ sheet: p.slug })}>
            <img src={img(p.image, 1000, 750)} alt={`${p.name}, ${p.location}`} loading="lazy" style={{ filter: CSS_GRADE }} />
            <span style={{ display: 'block', fontSize: 13 }}>{p.name}</span>
            <span className="small muted">{p.location}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
