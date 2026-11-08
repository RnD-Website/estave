import { useSyncExternalStore } from 'react'

// Per-frame values (read inside useFrame, never cause React renders)
export const shared = {
  heroIn: 0, // page-entrance dolly on the closed doors
  door: 0, // 0 closed → 1 open
  intro: 0, // camera dolly from hero to the first gallery stop
  progress: 0, // gallery tour progress 0..1 (ScrollTrigger)
  featured: 0, // featured villa scroll progress 0..1
  mouse: { x: 0, y: 0 }, // -1..1
}

// UI state (causes renders)
let state = {
  loaded: false,
  entered: false,
  menuOpen: false,
  activeStop: 0,
  sheet: null, // property slug
  inquiry: '', // preselected property for contact form
}
const listeners = new Set()
export const getState = () => state
export const setState = (patch) => {
  const next = typeof patch === 'function' ? patch(state) : patch
  let changed = false
  for (const k in next) if (state[k] !== next[k]) changed = true
  if (!changed) return
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}
export const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
export function useStore(selector) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    shared.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    shared.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }, { passive: true })
}
