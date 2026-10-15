import { useRef } from 'react'
import { Scene } from './experience/Scene'
import { ScrollStory } from './scroll/ScrollStory'
import { useScrollProgress } from './scroll/useScrollProgress'
import { useCoarseViewport } from './scroll/useViewport'

export default function App() {
  const sectionRef = useRef<HTMLElement>(null)
  const { progress } = useScrollProgress(sectionRef)
  const mobile = useCoarseViewport()

  return (
    <ScrollStory sectionRef={sectionRef}>
      <Scene progress={progress} mobile={mobile} />
    </ScrollStory>
  )
}
