import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { LOCATIONS, img } from '../data/content'
import { CSS_GRADE } from '../lib/grade'
import { isTouch } from '../lib/env'
import { Photo, Reveal, EASE } from './common'

export default function LocationSection() {
  const [open, setOpen] = useState('comporta')
  const [hover, setHover] = useState(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })
  const touch = typeof window !== 'undefined' && isTouch()

  const onMove = (e) => {
    x.set(e.clientX + 24)
    y.set(e.clientY - 100)
  }
  const hovered = LOCATIONS.find((l) => l.id === hover)

  return (
    <section id="locations" className="section" style={{ background: 'var(--paper)' }} aria-labelledby="locations-title">
      <div className="section-head">
        <div>
          <p className="section-head__label muted" style={{ marginBottom: 14 }}>Locations</p>
          <Reveal id="locations-title" as="h2" lines={['Where the land', 'chose the house.']} className="display" />
        </div>
        <p style={{ maxWidth: 300 }} className="muted">
          Six landscapes, each with a short list of homes. We only work where we know the light, the soil and the neighbours.
        </p>
      </div>

      <div className="loc" onMouseMove={touch ? undefined : onMove} onMouseLeave={() => setHover(null)}>
        {LOCATIONS.map((l) => {
          const isOpen = open === l.id
          return (
            <div key={l.id} className={`loc__row${isOpen ? ' is-open' : ''}`}>
              <button
                className="loc__btn"
                aria-expanded={isOpen}
                aria-controls={`loc-${l.id}`}
                onClick={() => setOpen(isOpen ? null : l.id)}
                onMouseEnter={() => setHover(isOpen ? null : l.id)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="small muted loc__code">{l.code}</span>
                <span className="loc__name">{l.name}</span>
                <span className="loc__region">{l.region}</span>
                <span className="muted loc__kind">{l.kind}</span>
                <span className="loc__plus" aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`loc-${l.id}`}
                    className="loc__body"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.75, ease: EASE }}
                  >
                    <div className="loc__inner">
                      <span />
                      <Photo id={l.image} w={1200} className="loc__img" alt={`${l.name}, ${l.region}`} sizes="(max-width:767px) 100vw, 40vw" />
                      <div>
                        <p className="loc__text" style={{ marginBottom: 18 }}>{l.text}</p>
                        <dl className="loc__facts">
                          {l.facts.map(([k, v]) => (
                            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {!touch && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="cursor-img"
              className="cursor-img"
              style={{ x: sx, y: sy }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: EASE }}
              aria-hidden="true"
            >
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={hovered.id}
                  src={img(hovered.image, 600, 450)}
                  alt=""
                  style={{ filter: CSS_GRADE }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
