import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BRAND, NAV } from '../data/content'
import { useStore, setState } from '../state/store'
import { scrollToTarget, lockScroll, goHome } from '../lib/scroll'
import { RollText, EASE } from './common'

export default function Navigation() {
  const open = useStore((s) => s.menuOpen)
  const menuRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setState({ menuOpen: false })
      if (e.key === 'Tab' && menuRef.current) {
        // keep focus inside the menu + its toggle
        const f = [btnRef.current, ...menuRef.current.querySelectorAll('a,button')]
        const i = f.indexOf(document.activeElement)
        if (e.shiftKey && i <= 0) (e.preventDefault(), f[f.length - 1].focus())
        else if (!e.shiftKey && i === f.length - 1) (e.preventDefault(), f[0].focus())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (target) => (e) => {
    e.preventDefault()
    setState({ menuOpen: false })
    setTimeout(() => scrollToTarget(target), open ? 450 : 0)
  }

  return (
    <>
      <motion.header
        className={`bar${open ? ' is-menu' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
      >
        <a
          href="#gallery"
          className="logo"
          onClick={(e) => {
            e.preventDefault()
            const wasOpen = open
            setState({ menuOpen: false })
            setTimeout(goHome, wasOpen ? 450 : 0)
          }}
          aria-label="ESTAVÉ — back to the start"
        >
          <span className="logo__rule" aria-hidden="true" />
          {BRAND.name}
        </a>
        <button
          ref={btnRef}
          className="burger"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setState({ menuOpen: !open })}
        >
          <span className="burger__lines" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            ref={menuRef}
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE, delay: 0.12 } }}
            transition={{ duration: 0.45, ease: EASE }}
            data-lenis-prevent
          >
            <motion.div className="menu__top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}>
              <p>
                {BRAND.address.map((l) => (
                  <span key={l} style={{ display: 'block' }}>{l}</span>
                ))}
              </p>
              <p>
                <a href={`mailto:${BRAND.email}`} style={{ display: 'block' }}>{BRAND.email}</a>
                <span>{BRAND.hours}</span>
              </p>
            </motion.div>

            <nav aria-label="Primary">
              <ul className="menu__links">
                {NAV.map((n, i) => (
                  <li key={n.label} style={{ overflow: 'hidden' }}>
                    <motion.a
                      href={n.target}
                      className="menu__link"
                      onClick={go(n.target)}
                      initial={{ y: '100%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '-100%', transition: { duration: 0.4, ease: EASE, delay: i * 0.025 } }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.08 + i * 0.05 }}
                    >
                      <RollText>{n.label}</RollText>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div className="menu__bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.6 }}>
              <div className="menu__socials">
                {BRAND.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                ))}
              </div>
              <span className="muted">{BRAND.tagline}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
