// Lenis ile yumuşak kaydırma; GSAP'ın ticker'ına bağlıdır ki ScrollTrigger ile aynı karede ilerlesin.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])
}

/** Bir bölüme yumuşakça kaydırır (Lenis yoksa tarayıcının kaydırması). */
export function scrollToSection(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
