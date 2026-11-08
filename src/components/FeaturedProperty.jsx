import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FEATURED } from '../data/content'
import { shared, setState } from '../state/store'
import { createFeaturedTrigger } from '../animations/scrollAnimations'
import { isMobile } from '../lib/env'
import { scrollToTarget } from '../lib/scroll'
import { Reveal, EASE } from './common'

const VillaScene = lazy(() => import('../scenes/VillaScene'))

export default function FeaturedProperty({ webgl }) {
  const section = useRef(null)
  const bars = useRef([])
  const [chapter, setChapter] = useState(0)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)

  useLayoutEffect(() => {
    const st = createFeaturedTrigger(section.current, setChapter)
    return () => st.kill()
  }, [])

  // lazy-mount the WebGL scene shortly before it scrolls into view; pause when away
  useEffect(() => {
    const io1 = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '150% 0px' })
    const io2 = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '5% 0px' })
    io1.observe(section.current)
    io2.observe(section.current)
    return () => (io1.disconnect(), io2.disconnect())
  }, [])

  // chapter progress bars follow the scrub
  useEffect(() => {
    let raf
    const tick = () => {
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleX(${Math.min(1, Math.max(0, shared.featured * 4 - i))})`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const c = FEATURED.chapters[chapter]
  return (
    <section id="featured" ref={section} className="featured" aria-labelledby="featured-title">
      <div className="featured__pin" data-pin>
        <div className="featured__text">
          <Reveal as="h2" lines={[FEATURED.name]} className="title" />
          <span id="featured-title" className="sr-only">Featured architecture: {FEATURED.name}</span>
          <div className="featured__meta">
            {FEATURED.meta.map(([v, join]) => (
              <span key={v} style={{ display: 'contents' }}>
                <span className="pill">{v}</span>
                {join && <span className="muted">{join}</span>}
              </span>
            ))}
          </div>
          <p className="featured__intro">{FEATURED.intro}</p>
          <dl className="specs">
            {FEATURED.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="featured__chapter" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <p className="small muted" style={{ marginBottom: 8 }}>
                  0{chapter + 1} / 0{FEATURED.chapters.length}
                </p>
                <h3 className="h3">{c.title}</h3>
                <p>{c.text}</p>
                {c.quote && (
                  <p className="featured__quote">
                    {c.quote} <span className="small" style={{ display: 'block', marginTop: 6 }}>{c.by}</span>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="featured__progress" aria-hidden="true">
              {FEATURED.chapters.map((ch, i) => (
                <i key={ch.id}>
                  <b ref={(el) => (bars.current[i] = el)} style={{ transform: 'scaleX(0)' }} />
                </i>
              ))}
            </div>
            <button
              className="dot-link"
              style={{ marginTop: 20 }}
              onClick={() => {
                setState({ inquiry: FEATURED.name })
                scrollToTarget('#contact')
              }}
            >
              Book a viewing of {FEATURED.name}
            </button>
          </div>
        </div>

        <div className="featured__canvas">
          {webgl ? (
            near && (
              <Suspense fallback={<div className="featured__canvas-ph">Building the villa…</div>}>
                <VillaScene chapter={chapter} quality={isMobile() ? 'low' : 'high'} active={visible} />
              </Suspense>
            )
          ) : (
            <div className="featured__canvas-ph">The 3D model needs WebGL, which this browser doesn’t provide.</div>
          )}
          {webgl && <span className="featured__drag">Real-time 3D · move your cursor to look around</span>}
        </div>
      </div>
    </section>
  )
}
