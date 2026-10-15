import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { activeChapterId } from './chapters'

gsap.registerPlugin(ScrollTrigger)

function paintChapter(section: HTMLElement, progress: number) {
  const active = activeChapterId(progress)
  section.querySelectorAll<HTMLElement>('[data-chapter]').forEach((node) => {
    node.classList.toggle('is-active', node.dataset.chapter === active)
  })
}

/**
 * ScrollTrigger ilerlemeyi bir ref'te tutar. Her karede React state güncellenmez.
 * Bölüm CSS sticky ile sabitlenir; ScrollTrigger pin kullanılmaz.
 */
export function useScrollProgress(section: RefObject<HTMLElement | null>) {
  const progress = useRef(0)

  useLayoutEffect(() => {
    const el = section.current
    if (!el) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let trigger: ScrollTrigger | null = null

    const setup = () => {
      trigger?.kill()
      trigger = null
      const reduced = media.matches
      el.classList.toggle('is-reduced', reduced)

      if (reduced) {
        progress.current = 0
        paintChapter(el, 0)
        return
      }

      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
        onUpdate: (self) => {
          progress.current = self.progress
          paintChapter(el, self.progress)
        },
      })
      paintChapter(el, progress.current)
      ScrollTrigger.refresh()
    }

    const onResize = () => {
      if (!media.matches) ScrollTrigger.refresh()
    }

    setup()
    media.addEventListener('change', setup)
    window.addEventListener('resize', onResize)

    return () => {
      trigger?.kill()
      media.removeEventListener('change', setup)
      window.removeEventListener('resize', onResize)
    }
  }, [section])

  return { progress }
}
