import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { brand } from '../content'

/** Model ve dokular yüklenene kadar tam ekran örtü; bitince yumuşakça kaybolur. */
export function Loader() {
  const { active, progress } = useProgress()
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (active || progress < 100) return
    const fade = setTimeout(() => setDone(true), 250)
    const remove = setTimeout(() => setGone(true), 1100)
    return () => {
      clearTimeout(fade)
      clearTimeout(remove)
    }
  }, [active, progress])

  // Yükleme hiç başlamazsa (önbellekten gelirse) örtü sonsuza kadar kalmasın.
  useEffect(() => {
    const safety = setTimeout(() => setDone(true), 8000)
    return () => clearTimeout(safety)
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink transition-opacity duration-700 ${done ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-56 text-center">
        <p className="text-sm font-semibold tracking-[0.3em]">{brand.name}</p>
        <div className="mt-6 h-px w-full overflow-hidden bg-white/10">
          <div className="h-full bg-ice transition-[width] duration-300" style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-mist">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
