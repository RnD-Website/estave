import { getState } from '../state/store'
import { enterGallery, exitGallery, ScrollTrigger } from '../animations/scrollAnimations'
import { prefersReducedMotion } from './env'

let lenis = null
export const setLenis = (l) => (lenis = l)
export const getLenis = () => lenis

// Smoothly scroll to a section; opens the gallery doors instantly if needed.
export async function scrollToTarget(selector, { offset = 0 } = {}) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector
  if (!el) return
  if (!getState().entered) {
    await enterGallery({ lenis, instant: selector !== '#gallery' })
    if (selector === '#gallery') return
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    ScrollTrigger.refresh()
  }
  // pinned sections are wrapped by a pin-spacer: scroll to the spacer's top
  const target = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
  const y = target.getBoundingClientRect().top + window.scrollY + offset
  if (lenis && !prefersReducedMotion()) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function lockScroll(lock) {
  if (lock) lenis?.stop()
  else if (getState().entered) lenis?.start()
}

// Logo: return to the opening screen with the doors closed.
export function goHome() {
  if (!getState().entered) {
    if (lenis) lenis.scrollTo(0, { duration: 1 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return Promise.resolve()
  }
  return exitGallery({ lenis })
}
