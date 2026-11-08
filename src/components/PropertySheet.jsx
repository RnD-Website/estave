import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PROPERTIES, img } from '../data/content'
import { useStore, setState } from '../state/store'
import { lockScroll, scrollToTarget } from '../lib/scroll'
import { CSS_GRADE } from '../lib/grade'
import { EASE } from './common'

// The reference's project page, presented as a sheet over the gallery.
export default function PropertySheet() {
  const slug = useStore((s) => s.sheet)
  const p = PROPERTIES.find((x) => x.slug === slug)
  const idx = PROPERTIES.findIndex((x) => x.slug === slug)
  const next = PROPERTIES[(idx + 1) % PROPERTIES.length]
  const closeRef = useRef(null)
  const scroller = useRef(null)
  const opener = useRef(null)

  useEffect(() => {
    lockScroll(!!slug)
    if (!slug) {
      opener.current?.focus?.()
      return
    }
    if (!opener.current) opener.current = document.activeElement
    const onKey = (e) => e.key === 'Escape' && setState({ sheet: null })
    window.addEventListener('keydown', onKey)
    setTimeout(() => closeRef.current?.focus(), 50)
    scroller.current?.scrollTo(0, 0)
    return () => window.removeEventListener('keydown', onKey)
  }, [slug])

  const close = () => {
    setState({ sheet: null })
    setTimeout(() => (opener.current = null), 600)
  }

  const inquire = () => {
    setState({ sheet: null, inquiry: p.name })
    setTimeout(() => scrollToTarget('#contact'), 500)
  }

  return (
    <AnimatePresence>
      {p && (
        <>
          <motion.div
            key="backdrop"
            className="sheet-backdrop"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.button
            key="sheet-close"
            ref={closeRef}
            className="close close--fixed"
            onClick={close}
            aria-label="Close property"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <span>Close</span>
            <i aria-hidden="true" />
          </motion.button>
          <motion.article
            key="sheet"
            ref={scroller}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            data-lenis-prevent
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={p.slug}
                className="sheet__inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="sheet__side">
                  <h2 id="sheet-title" className="title">{p.name}</h2>
                  <div className="sheet__meta">
                    <span className="pill">{p.type}</span>
                    <span className="muted">in</span>
                    <span className="pill">{p.location}</span>
                    <span className="muted">since</span>
                    <span className="pill">{p.year}</span>
                  </div>
                  <p style={{ maxWidth: 330 }}>{p.line}</p>
                  <p className="small" style={{ maxWidth: 330, lineHeight: 1.45 }}>{p.text}</p>
                  <dl className="specs">
                    <div><dt>Bedrooms</dt><dd>{p.beds}</dd></div>
                    <div><dt>Interior</dt><dd>{p.area}</dd></div>
                    <div><dt>Plot</dt><dd>{p.plot}</dd></div>
                    <div><dt>Price</dt><dd>{p.price}</dd></div>
                  </dl>
                  <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 6 }}>
                    <button className="dot-link" onClick={inquire}>Request a private viewing</button>
                    {p.featured && (
                      <button
                        className="dot-link"
                        onClick={() => {
                          setState({ sheet: null })
                          setTimeout(() => scrollToTarget('#featured'), 500)
                        }}
                      >
                        Explore in 3D
                      </button>
                    )}
                  </div>
                  <button className="sheet__next" onClick={() => setState({ sheet: next.slug })}>
                    <span className="muted small">Next</span>
                    <span className="h3">{next.name}</span>
                  </button>
                </div>
                <div className="sheet__media">
                  <motion.img
                    src={img(p.image, 2000)}
                    alt={`${p.name}, ${p.location}`}
                    style={{ filter: CSS_GRADE, aspectRatio: p.ratio < 1 ? '4/5' : '3/2', objectFit: 'cover' }}
                    initial={{ clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ clipPath: 'inset(0 0 0% 0)' }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <img src={img(p.image, 1000, 1250, '&crop=left')} alt="" loading="lazy" style={{ filter: CSS_GRADE, aspectRatio: '4/5', objectFit: 'cover', objectPosition: 'left center' }} />
                    <img src={img(p.image, 1000, 1250, '&crop=right')} alt="" loading="lazy" style={{ filter: CSS_GRADE, aspectRatio: '4/5', objectFit: 'cover', objectPosition: 'right center' }} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.article>
        </>
      )}
    </AnimatePresence>
  )
}
