import { useEffect, useMemo } from 'react'
import Lenis from 'lenis'
import Loader from './components/Loader'
import Navigation from './components/Navigation'
import PropertyGallery from './components/PropertyGallery'
import FeaturedProperty from './components/FeaturedProperty'
import InteriorSection from './components/InteriorSection'
import LocationSection from './components/LocationSection'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import PropertySheet from './components/PropertySheet'
import { gsap, ScrollTrigger, createParallax } from './animations/scrollAnimations'
import { setLenis } from './lib/scroll'
import { hasWebGL, prefersReducedMotion } from './lib/env'
import { useStore } from './state/store'

export default function App() {
  const webgl = useMemo(() => hasWebGL(), [])
  const loaded = useStore((s) => s.loaded)

  // Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    if (webgl) document.documentElement.classList.add('is-locked')
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85, touchMultiplier: 1.4, smoothWheel: true, syncTouch: false })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    if (webgl) lenis.stop()
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [webgl])

  useEffect(() => createParallax(document.body), [])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => (clearTimeout(t), window.removeEventListener('load', onLoad))
  }, [loaded])

  return (
    <>
      <a className="skip" href="#featured">Skip the 3D gallery</a>
      <Loader webgl={webgl} />
      <Navigation />
      <main>
        <PropertyGallery webgl={webgl} />
        <FeaturedProperty webgl={webgl} />
        <InteriorSection />
        <LocationSection />
        <AboutSection />
        <ContactSection />
      </main>
      <PropertySheet />
    </>
  )
}
