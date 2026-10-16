// Patlatılmış görünümün teknik bilgi kartları ve parçalara uzanan HUD çizgileri.
// Kartların görünürlüğünü GSAP zaman çizelgesi ([data-hud]) yönetir; çizgilerin uç
// noktalarını sahne her karede hud.write() ile günceller.
import { useEffect, useRef } from 'react'
import { parts } from '../content'
import { hud } from '../lib/hud'

/** Masaüstünde kartların yeri: hangi taraf ve sahne yüksekliğinin yüzdesi olarak üst kenar. */
const SLOTS: { side: 'left' | 'right'; top: number }[] = [
  { side: 'right', top: 16 },
  { side: 'right', top: 44 },
  { side: 'left', top: 16 },
  { side: 'left', top: 44 },
  { side: 'left', top: 70 },
]

const ELBOW = 44

export function HudLayer({ mobile }: { mobile: boolean }) {
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(SVGPolylineElement | null)[]>([])
  const dots = useRef<(SVGGElement | null)[]>([])
  /** Kartın çizgiye bağlandığı nokta (kaplamaya göre piksel). Yalnızca boyut değişince ölçülür. */
  const connectors = useRef<{ x: number; y: number; dir: number }[]>([])

  useEffect(() => {
    const measure = () => {
      connectors.current = cards.current.map((card, i) => {
        if (!card) return { x: 0, y: 0, dir: 1 }
        const { offsetLeft: l, offsetTop: t, offsetWidth: w } = card
        if (mobile) return { x: l + w / 2, y: t, dir: 0 }
        const left = SLOTS[i].side === 'left'
        return { x: left ? l + w : l, y: t + 28, dir: left ? 1 : -1 }
      })
    }
    measure()
    window.addEventListener('resize', measure)

    hud.write = (i, ax, ay) => {
      const c = connectors.current[i]
      const line = lines.current[i]
      const dot = dots.current[i]
      if (!c || !line || !dot) return
      const elbow = c.dir === 0 ? `${c.x},${c.y - ELBOW}` : `${c.x + c.dir * ELBOW},${c.y}`
      line.setAttribute('points', `${c.x},${c.y} ${elbow} ${ax.toFixed(1)},${ay.toFixed(1)}`)
      dot.setAttribute('transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)})`)
    }

    return () => {
      window.removeEventListener('resize', measure)
      hud.write = null
    }
  }, [mobile])

  return (
    <div className="pointer-events-none absolute inset-0" aria-label="Component details">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {parts.map((part, i) => (
          <g key={part.node} data-hud={i} className="invisible opacity-0">
            <polyline
              ref={(el) => {
                lines.current[i] = el
              }}
              fill="none"
              stroke="rgb(159 214 255 / 0.55)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <g
              ref={(el) => {
                dots.current[i] = el
              }}
            >
              <circle r={3.5} fill="#9fd6ff" />
              <circle r={3.5} fill="none" stroke="#9fd6ff" className="hud-pulse" />
            </g>
          </g>
        ))}
      </svg>

      {parts.map((part, i) => (
        <div
          key={part.node}
          ref={(el) => {
            cards.current[i] = el
          }}
          data-hud={i}
          className={
            mobile
              ? 'glass invisible absolute inset-x-4 bottom-[13%] rounded-2xl p-4 opacity-0'
              : 'glass invisible absolute w-[272px] rounded-2xl p-5 opacity-0 xl:w-[300px]'
          }
          style={mobile ? undefined : { top: `${SLOTS[i].top}%`, [SLOTS[i].side]: '3vw' }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="eyebrow">Layer {part.index}</span>
            <span className="font-mono text-xs text-ice">{part.stat}</span>
          </div>
          <h3 className="mt-3 text-lg leading-snug font-medium tracking-tight text-fog">{part.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mist">{part.detail}</p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-ice/50 via-white/10 to-transparent" />
        </div>
      ))}
    </div>
  )
}
