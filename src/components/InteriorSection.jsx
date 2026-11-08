import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { INTERIORS, INTERIOR_FILTERS, img } from '../data/content'
import { lockScroll } from '../lib/scroll'
import { CSS_GRADE } from '../lib/grade'
import { Photo, Reveal, EASE } from './common'

function useColumns() {
  const get = () => (window.innerWidth < 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3)
  const [n, setN] = useState(get)
  useEffect(() => {
    const on = () => setN(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return n
}

export default function InteriorSection() {
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)
  const cols = useColumns()
  const items = useMemo(() => INTERIORS.filter((i) => filter === 'All' || i.cat.includes(filter)), [filter])
  const columns = useMemo(() => {
    const c = Array.from({ length: cols }, () => [])
    items.forEach((it, i) => c[i % cols].push(it))
    return c
  }, [items, cols])
  const count = (f) => (f === 'All' ? INTERIORS.length : INTERIORS.filter((i) => i.cat.includes(f)).length)

  useEffect(() => {
    lockScroll(open !== null)
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % items.length)
      if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items.length])

  const cur = open !== null ? items[open] : null

  return (
    <section id="interiors" className="section" aria-labelledby="interiors-title">
      <div className="section-head">
        <div>
          <p className="section-head__label muted" style={{ marginBottom: 14 }}>Interior Experience</p>
          <Reveal id="interiors-title" as="h2" lines={['Rooms that were', 'drawn, not filled.']} className="display" />
        </div>
        <div className="filters" role="tablist" aria-label="Filter interiors">
          {INTERIOR_FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`filter${filter === f ? ' is-on' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <sup>{count(f)}</sup>
            </button>
          ))}
        </div>
      </div>

      <LayoutGroup>
        <div className="grid">
          {columns.map((col, ci) => (
            <div className="grid__col" key={ci} style={{ paddingTop: cols === 3 && ci === 1 ? 'clamp(40px,6vw,96px)' : 0 }}>
              <AnimatePresence mode="popLayout">
                {col.map((it) => (
                  <motion.button
                    layout
                    key={it.id}
                    className="card"
                    onClick={() => setOpen(items.indexOf(it))}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    aria-label={`${it.title}, ${it.where}. Open image`}
                  >
                    <Photo id={it.image} w={900} ratio={it.ratio} className="card__media" alt={`${it.title} — ${it.where}`} />
                    <p className="card__title">{it.title}</p>
                    <p className="card__line">{it.line}</p>
                    <p className="card__tags">{it.where} · {it.cat.join(', ')}</p>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </LayoutGroup>

      <AnimatePresence>
        {cur && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={cur.title}
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button className="close" onClick={() => setOpen(null)} aria-label="Close" autoFocus><span>Close</span><i aria-hidden="true" /></button>
            <div className="lightbox__img">
              <AnimatePresence mode="wait">
                <motion.img
                  key={cur.id}
                  src={img(cur.image, 2000)}
                  alt={`${cur.title} — ${cur.where}`}
                  style={{ filter: CSS_GRADE }}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </AnimatePresence>
            </div>
            <div className="lightbox__side">
              <p className="small muted">{String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</p>
              <h3 className="title">{cur.title}</h3>
              <p>{cur.line}</p>
              <p className="small muted">{cur.where} · {cur.cat.join(', ')}</p>
              <div className="lightbox__nav">
                <button className="dot-link" onClick={() => setOpen((o) => (o - 1 + items.length) % items.length)}>Previous</button>
                <button className="dot-link" onClick={() => setOpen((o) => (o + 1) % items.length)}>Next</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
