import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { shared, setState, getState } from '../state/store'
import { prefersReducedMotion } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------
   Gallery layout + camera tour (metres). Hall: x ±7, y 0..5.6, z 0..-38
   ------------------------------------------------------------------ */
export const HALL = { w: 14, h: 5.6, depth: 38, eye: 1.72 }

// Where each of the 8 works hangs. rotY: direction the picture faces.
// Every work is the same size (2.5 m wide, 3:2) and hangs on a wall or partition,
// alternating left / right down the hall, so all eight cards look identical.
export const CARD = { width: 2.5, ratio: 3 / 2 }
const L = Math.PI / 2, R = -Math.PI / 2
export const SLOTS = [
  { pos: [-6.93, 1.8, -9], rotY: L }, // Villa Serein — left wall
  { pos: [6.93, 1.8, -12.5], rotY: R }, // Casa Tierra — right wall
  { pos: [-6.93, 1.8, -17], rotY: L }, // Casa Roca — left wall
  { pos: [6.93, 1.8, -20.5], rotY: R }, // Villa Lumen — right wall
  { pos: [-3.68, 1.8, -24], rotY: L }, // Villa Azur — left partition
  { pos: [3.68, 1.8, -28.5], rotY: R }, // The Glass House — right partition
  { pos: [-6.93, 1.8, -32.5], rotY: L }, // Residence Aurel — left wall
  { pos: [6.93, 1.8, -33.5], rotY: R }, // Casa Albedo — right wall
].map((s) => ({ ...s, width: CARD.width }))

export const PARTITIONS = [
  { x: -4, z: -24, len: 5 },
  { x: 4, z: -28.5, len: 5 },
]

const eye = HALL.eye
// camera stop for a slot: stand `dist` metres in front of the picture
function stopFor(slot, dist, lateral = 0) {
  const [x, y, z] = slot.pos
  const nx = Math.sin(slot.rotY), nz = Math.cos(slot.rotY)
  return {
    p: [x + nx * dist + nz * lateral, eye + 0.03, z + nz * dist - nx * lateral],
    t: [x, y - 0.12, z], // aim at the card centre (card extends below the photo for the caption)
  }
}

const STOP_DIST = 4.6 // same distance for every work → same size on screen
export const HERO_POSE = { p: [0, 1.9, 7.2], t: [0, 1.9, 0] }
export const STOPS = [
  { p: [0, 1.78, -1.2], t: [0, 1.65, -38], label: 'overview' },
  { ...stopFor(SLOTS[0], STOP_DIST), art: 0 },
  { ...stopFor(SLOTS[1], STOP_DIST), art: 1 },
  { ...stopFor(SLOTS[2], STOP_DIST), art: 2 },
  { ...stopFor(SLOTS[3], STOP_DIST), art: 3 },
  { ...stopFor(SLOTS[4], STOP_DIST), art: 4 },
  { ...stopFor(SLOTS[5], STOP_DIST), art: 5 },
  { ...stopFor(SLOTS[6], STOP_DIST), art: 6 },
  { ...stopFor(SLOTS[7], STOP_DIST), art: 7 },
  { p: [0, 1.75, -27.6], t: [0, 2.05, -38], label: 'end' },
]

/* dwell mapping: camera rests at each stop, glides between */
export function sampleStops(stops, progress, dwell = 0.5) {
  const segs = stops.length - 1
  const s = Math.min(Math.max(progress, 0), 1) * segs
  const i = Math.min(Math.floor(s), segs - 1)
  let f = s - i
  f = Math.min(Math.max((f - dwell / 2) / (1 - dwell), 0), 1)
  const e = f * f * f * (f * (f * 6 - 15) + 10) // smootherstep
  return { i, e, s, a: stops[i], b: stops[i + 1] }
}

/* ------------------------------------------------------------------
   Enter the gallery — doors swing open, camera dollies in.
   ------------------------------------------------------------------ */
export function enterGallery({ lenis, instant = false } = {}) {
  if (getState().entered) return Promise.resolve()
  setState({ entered: true })
  const reduce = prefersReducedMotion()
  return new Promise((resolve) => {
    const done = () => {
      document.documentElement.classList.remove('is-locked')
      lenis?.start()
      ScrollTrigger.refresh()
      resolve()
    }
    if (instant || reduce) {
      shared.door = 1
      shared.intro = 1
      done()
      return
    }
    gsap
      .timeline({ onComplete: done })
      .to(shared, { door: 1, duration: 1.9, ease: 'power3.inOut' }, 0)
      .to(shared, { intro: 1, duration: 2.3, ease: 'power2.inOut' }, 0.45)
  })
}

/* Pinned gallery tour: progress of the pinned section drives the camera. */
export function createGalleryTour(section, stopsCount) {
  const segs = stopsCount - 1
  return ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * segs * 0.75}`,
    pin: true,
    pinSpacing: true,
    scrub: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      shared.progress = self.progress
    },
  })
}

/* Featured villa: pinned, scrubbed camera through four viewpoints. */
export function createFeaturedTrigger(section, onChapter) {
  let last = -1
  return ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * 3.2}`,
    pin: section.querySelector('[data-pin]') || true,
    scrub: true,
    onUpdate: (self) => {
      shared.featured = self.progress
      const c = Math.min(3, Math.floor(self.progress * 4 + 0.0001))
      if (c !== last) {
        last = c
        onChapter?.(c)
      }
    },
  })
}

/* Section-level transitions: headings drift, images parallax. */
export function createParallax(root) {
  const ctx = gsap.context(() => {
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax || '8')
      gsap.fromTo(
        el,
        { yPercent: -amt },
        { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
      )
    })
  }, root)
  return () => ctx.revert()
}

export { gsap, ScrollTrigger }
