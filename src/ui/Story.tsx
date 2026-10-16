import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { brand, chapters } from '../content'
import { scrollToSection } from '../lib/smoothScroll'
import { useStoryTimeline } from '../scroll/useStoryTimeline'
import { Experience } from '../three/Experience'
import { HudLayer } from './HudLayer'

/** Pinlenmiş 3D sahne ve üstündeki metin katmanları. */
export function Story({ mobile }: { mobile: boolean }) {
  const scope = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  useStoryTimeline(scope, stage)

  return (
    <section id="story" ref={scope} aria-label={`${brand.product} story`}>
      <div ref={stage} className="relative h-svh w-full overflow-hidden bg-ink">
        {/* Ürünün arkasından gelen hafif ışık halesi */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,rgba(159,214,255,0.07),transparent_70%)]" />

        {/* Katman sırası: hero tipografisi → şeffaf 3D tuval → diğer metinler */}
        <Hero />
        <div className="pointer-events-none absolute inset-0">
          <Experience mobile={mobile} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <Chapters />
        <HudLayer mobile={mobile} />
        <CallToAction />

        <div data-scroll-cue className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="eyebrow">Scroll</span>
          <ChevronDown className="scroll-cue size-4 text-mist" aria-hidden />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-white/8">
          <div data-progress className="h-full origin-left scale-x-0 bg-gradient-to-r from-ice/30 via-ice to-white" />
        </div>
      </div>
    </section>
  )
}

/** Bölüm 1: büyük minimalist tipografi; ürün iki satırın arasında durur. */
function Hero() {
  return (
    <div data-hero className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pt-24 pb-24 md:px-[4.5vw] md:pt-28 md:pb-20">
      <h1 className="sr-only">
        {brand.name}: {brand.tagline.join(' ').toLowerCase()}
      </h1>
      <div>
        <p className="eyebrow">
          {brand.name} <span className="text-ash">/</span> {brand.product}
        </p>
        <p aria-hidden className="text-silver mt-4 text-[17vw] leading-[0.82] font-semibold tracking-[-0.06em] md:text-[12.5vw]">
          {brand.tagline[0]}
        </p>
      </div>
      <div className="flex flex-col items-end gap-6 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xs text-sm leading-relaxed text-mist md:mb-[1.6vw] md:max-w-sm md:text-base">{brand.intro}</p>
        <p aria-hidden className="text-silver text-[17vw] leading-[0.82] font-semibold tracking-[-0.06em] md:text-[12.5vw]">
          {brand.tagline[1]}
        </p>
      </div>
    </div>
  )
}

/** Sol altta bölüm etiketi; zaman çizelgesi sırayla gösterir. */
function Chapters() {
  return (
    <div className="pointer-events-none absolute top-24 left-5 md:top-auto md:bottom-14 md:left-[4.5vw]">
      {chapters.map((chapter) => (
        <div key={chapter.id} data-chapter={chapter.id} className="invisible absolute top-0 left-0 w-[78vw] max-w-sm opacity-0 md:top-auto md:bottom-0">
          <p className="eyebrow">
            {chapter.index} <span className="text-ash">/ 04</span>
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{chapter.title}</h2>
          <p className="mt-2 text-sm text-mist md:text-base">{chapter.body}</p>
        </div>
      ))}
    </div>
  )
}

/** Bölüm 4: minimalist çağrı butonları. */
function CallToAction() {
  return (
    <div data-cta className="invisible absolute inset-x-0 bottom-12 flex justify-center gap-3 px-5 opacity-0 md:bottom-14">
      <button type="button" className="btn-primary focus-ring" onClick={() => scrollToSection('#preorder')}>
        Pre-Order Now
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <button type="button" className="btn-ghost focus-ring" onClick={() => scrollToSection('#specs')}>
        Explore Specs
      </button>
    </div>
  )
}
