// Kaydırma koreografisi: tek bir GSAP zaman çizelgesi, ScrollTrigger ile sahneye pinlenir ve
// kaydırmayla "scrub" edilir. Hem 3D durumu (anim) hem DOM katmanlarını aynı çizelge sürer.
//
// Zaman birimleri 0…10 arasıdır; ScrollTrigger bunları kaydırma yüzdesine eşler:
//   0      Bölüm 1  Hero: kapalı kutu, "AURAL AI / SOUND REDEFINED"
//   ~2.5   Bölüm 2  Kapak 90° açılır, kulaklıklar süzülür, kutu silikleşir
//   5…7.5  Bölüm 3  Sağ kulaklık odakta, katmanlar sırayla açılır + HUD kartları
//   10     Bölüm 4  Parçalar birleşir, 360° dönüş, CTA butonları
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'
import { parts } from '../content'
import { anim, heroCamera, resetAnim } from '../lib/anim'

gsap.registerPlugin(ScrollTrigger)

/** Pinlenmiş sahnenin kaydırma uzunluğu, ekran yüksekliği cinsinden. */
const SCROLL_SCREENS = 5.5

const cameras = {
  hero: heroCamera,
  open: { px: 0.6, py: 0.95, pz: 3.75, tx: 0, ty: 0.28, tz: 0.05 },
  rise: { px: 0.35, py: 1.0, pz: 3.5, tx: 0, ty: 0.46, tz: 0.25 },
  explode: { px: 0.1, py: 0.62, pz: 3.5, tx: 0, ty: 0.42, tz: 0.95 },
  final: { px: 0, py: 0.62, pz: 3.45, tx: 0, ty: 0.47, tz: 0.95 },
}

const fadeIn = { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }
const fadeOut = { autoAlpha: 0, y: -18, duration: 0.35, ease: 'power2.in' }

export function useStoryTimeline(scope: RefObject<HTMLElement | null>, stage: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    const pin = stage.current
    if (!root || !pin) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { mobile, reduced } = context.conditions as Record<string, boolean>
        resetAnim()

        if (reduced) {
          // Hareket azaltma: pin yok, kapalı ürün sabit, CTA görünür.
          gsap.set('[data-hero]', { autoAlpha: 1 })
          gsap.set('[data-cta]', { autoAlpha: 1, y: 0 })
          gsap.set('[data-scroll-cue]', { autoAlpha: 0 })
          return
        }

        gsap.set('[data-chapter], [data-hud], [data-cta]', { autoAlpha: 0, y: 16 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: pin,
            pin: true,
            start: 'top top',
            end: () => `+=${window.innerHeight * SCROLL_SCREENS}`,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // İlerleme çubuğu bütün çizelge boyunca dolar.
        tl.fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 10 }, 0)

        // ---- Bölüm 1 → 2: hero metni çekilir
        tl.to('[data-scroll-cue]', { autoAlpha: 0, duration: 0.3 }, 0.05)
        tl.to('[data-hero]', { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.9, ease: 'power2.in' }, 0.35)

        // ---- Bölüm 2: kapak açılır (≈%25)
        tl.to('[data-chapter="open"]', fadeIn, 0.9)
        tl.to(anim.cam, { ...cameras.open, duration: 1.6 }, 0.6)
        tl.to(anim, { lid: 1, duration: 1.1 }, 1.0)
        tl.to('[data-chapter="open"]', fadeOut, 2.05)

        // Kulaklıklar süzülür, kutu loşlaşarak silikleşir
        tl.to('[data-chapter="rise"]', fadeIn, 2.2)
        tl.to(anim, { rise: 1, duration: 1.5, ease: 'power2.out' }, 1.75)
        tl.to(anim.cam, { ...cameras.rise, duration: 1.4 }, 2.0)
        tl.to(anim, { caseDim: 1, duration: 1.2 }, 2.75)
        tl.to('[data-chapter="rise"]', fadeOut, 3.35)

        // ---- Bölüm 3: sağ kulaklık odağa alınır, kabuk şeffaflaşır (≈%50)
        tl.to(anim, { focus: 1, duration: 1.3 }, 3.2)
        tl.to(anim.cam, { ...cameras.explode, duration: 1.5 }, 3.25)
        tl.to(anim, { shell: 1, duration: 0.6 }, 4.35)
        tl.to('[data-chapter="inside"]', fadeIn, 4.5)

        // Katmanlar sırayla açılır (≈%50…%75), her biri kendi HUD kartıyla
        parts.forEach((_, i) => {
          const at = 5.0 + i * 0.5
          tl.to(anim.explode, { [i]: 1, duration: 0.6, ease: 'power3.out' }, at)
          tl.fromTo(`[data-hud="${i}"]`, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, at + 0.18)
          // Mobilde aynı anda tek kart: bir önceki çekilir.
          if (mobile && i > 0) tl.to(`[data-hud="${i - 1}"]`, { autoAlpha: 0, duration: 0.2 }, at + 0.1)
        })
        // 5. kart sol altta, bölüm etiketiyle aynı yerde: etiket o kart gelmeden çekilir.
        tl.to('[data-chapter="inside"]', fadeOut, 6.85)

        // ---- Bölüm 4: birleşme, 360° dönüş, CTA (%100)
        tl.to('[data-hud]', { autoAlpha: 0, duration: 0.35 }, 7.7)
        tl.to(anim.explode, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, duration: 0.9, ease: 'power3.inOut' }, 7.8)
        tl.to(anim, { shell: 0, duration: 0.5 }, 8.45)
        tl.to(anim.cam, { ...cameras.final, duration: 1.2 }, 7.9)
        tl.to('[data-chapter="whole"]', fadeIn, 8.55)
        tl.to(anim, { spin: 1, duration: 1.5, ease: 'power1.inOut' }, 8.5)
        tl.to('[data-cta]', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 9.25)
        tl.to({}, { duration: 0.4 }, 9.85)

        return () => resetAnim()
      },
      root,
    )

    return () => mm.revert()
  }, [scope, stage])
}
