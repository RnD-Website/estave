import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useReducedMotion, useInView } from 'framer-motion'
import { ABOUT } from '../data/content'
import { Photo, Reveal, FadeUp, EASE } from './common'

// Words hanging on strings (reference /about), swaying with the cursor.
function HangingWord({ word, left, length, delay, mouseX, show }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const rot = useTransform(mouseX, (mx) => {
    if (!ref.current) return 0
    const r = ref.current.getBoundingClientRect()
    const d = (mx - (r.left + r.width / 2)) / window.innerWidth
    return Math.max(-7, Math.min(7, d * -14))
  })
  const spring = useSpring(rot, { stiffness: 40, damping: 6, mass: 1.2 })
  return (
    <motion.div
      ref={ref}
      className="hang__word"
      style={{ left, rotate: reduce ? 0 : spring }}
      initial={{ y: -length - 140 }}
      animate={show ? { y: 0 } : { y: -length - 140 }}
      transition={{ type: 'spring', stiffness: 60, damping: 11, delay }}
    >
      <span className="hang__string" style={{ height: length }} />
      <span className="hang__card">{word}</span>
    </motion.div>
  )
}

export default function AboutSection() {
  const [active, setActive] = useState(0)
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
  const words = ABOUT.words
  const layout = [
    { left: '8%', length: 120 },
    { left: '41%', length: 210 },
    { left: '63%', length: 80 },
  ]
  useEffect(() => {
    const on = (e) => mouseX.set(e.clientX)
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [mouseX])

  const hangRef = useRef(null)
  const show = useInView(hangRef, { once: true, margin: '0px 0px -15% 0px' })
  const e = ABOUT.expertise[active]
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <h2 id="about-title" className="sr-only">About ESTAVÉ — {words.join(' ')}</h2>
      <div className="hang" aria-hidden="true" ref={hangRef}>
        {words.map((w, i) => (
          <HangingWord key={w} word={w} {...layout[i]} delay={0.1 + i * 0.12} mouseX={mouseX} show={show} />
        ))}
      </div>

      <FadeUp className="about__intro">
        <p>{ABOUT.intro}</p>
      </FadeUp>

      <div className="about__stats">
        {ABOUT.stats.map(([n, l], i) => (
          <FadeUp key={l} delay={i * 0.08}>
            <b>{n}</b>
            <span className="small muted">{l}</span>
          </FadeUp>
        ))}
      </div>

      <div className="about__grid">
        <div>
          <p className="section-head__label muted" style={{ marginBottom: 14 }}>What we bring to the table</p>
          <Reveal as="h3" lines={['Expertise']} className="title" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 32 }}>
          <ul className="expertise" role="tablist" aria-label="Expertise">
            {ABOUT.expertise.map((x, i) => (
              <li key={x.n}>
                <button
                  role="tab"
                  aria-selected={active === i}
                  className={active === i ? 'is-on' : ''}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  <span>{x.n}</span>
                  <span>{x.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="expertise__detail" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={e.n}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p>{e.text}</p>
                <p className="small muted" style={{ marginTop: 14, fontSize: 11, letterSpacing: 0 }}>{e.tags}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="approach">
        <p className="small muted" style={{ gridColumn: '1 / -1', marginBottom: -8 }}>How we think</p>
        {ABOUT.approach.map(([a, b], i) => (
          <FadeUp key={a} delay={i * 0.1} className="approach__pair">
            <s>{a}</s>
            <span>{b}</span>
          </FadeUp>
        ))}
      </div>

      <div className="quote">
        <FadeUp as="figure" style={{ margin: 0 }}>
          <blockquote>{ABOUT.quote}</blockquote>
          <figcaption className="small">
            {ABOUT.quoteBy[0]} <span className="muted">— {ABOUT.quoteBy[1]}</span>
          </figcaption>
        </FadeUp>
      </div>

      <div className="about__image">
        <Photo id={ABOUT.image} w={2000} alt="An old olive tree behind a dry-stone wall in the Alentejo" sizes="100vw" style={{ height: '100%' }} />
      </div>
    </section>
  )
}
