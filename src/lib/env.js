export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}
export const isTouch = () => typeof window !== 'undefined' && matchMedia('(hover: none), (pointer: coarse)').matches
export const isMobile = () => typeof window !== 'undefined' && (window.innerWidth < 768 || isTouch())
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
