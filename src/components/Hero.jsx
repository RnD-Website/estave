import { AnimatePresence, motion } from 'framer-motion'
import { BRAND } from '../data/content'
import { useStore } from '../state/store'
import { RollText, EASE } from './common'

// HTML layer of the hero: the 3D doors carry the headline, this sits on the floor line.
export default function Hero({ onEnter }) {
  const loaded = useStore((s) => s.loaded)
  const entered = useStore((s) => s.entered)
  return (
    <>
      <h1 className="sr-only">ESTAVÉ — {BRAND.tagline}</h1>
      <AnimatePresence>
        {loaded && !entered && (
          <motion.div
            className="hero-ui"
            key="hero-ui"
            exit={{ opacity: 0, y: 16, transition: { duration: 0.5, ease: EASE } }}
          >
            <motion.button
              className="btn"
              onClick={onEnter}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
              aria-label="Enter the gallery"
            >
              <RollText>Enter the gallery</RollText>
            </motion.button>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
            >
              {BRAND.intro}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
