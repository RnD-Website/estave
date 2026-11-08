import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { setState, useStore } from '../state/store'
import { EASE } from './common'

// Waits for fonts + the gallery's textures (Three.js loading manager), then lifts away.
export default function Loader({ webgl }) {
  const { progress, active } = useProgress()
  const loaded = useStore((s) => s.loaded)
  const [shown, setShown] = useState(0)
  const [minTime, setMinTime] = useState(false)
  const [fonts, setFonts] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinTime(true), 500)
    document.fonts?.ready.then(() => setFonts(true)) ?? setFonts(true)
    // never trap visitors behind the loader (e.g. images blocked by a network filter)
    const fail = setTimeout(() => setState({ loaded: true }), 5000)
    return () => (clearTimeout(t), clearTimeout(fail))
  }, [])

  const target = webgl ? progress : 100
  useEffect(() => {
    let raf
    const tick = () => {
      setShown((s) => {
        const n = s + (target - s) * 0.22
        return Math.abs(target - n) < 1 ? target : n
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const ready = minTime && fonts && (!webgl || (!active && progress >= 100)) && shown >= 99.5
  useEffect(() => {
    if (ready && !loaded) {
      const t = setTimeout(() => setState({ loaded: true }), 60)
      return () => clearTimeout(t)
    }
  }, [ready, loaded])

  return (
    <AnimatePresence>
      {!loaded && (
        <motion.div
          className="loader"
          role="status"
          aria-live="polite"
          aria-label={`Loading ESTAVÉ, ${Math.round(shown)} percent`}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loader__mark">
            <motion.span
              style={{ display: 'inline-block' }}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              ESTAVÉ
            </motion.span>
          </div>
          <div className="loader__meta">
            <span>Architecture Beyond Expectations.</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(Math.round(shown)).padStart(3, '0')}</span>
          </div>
          <motion.span className="loader__bar" style={{ width: '100%', scaleX: shown / 100 }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
