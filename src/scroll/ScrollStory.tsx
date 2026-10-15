import type { ReactNode, RefObject } from 'react'
import { chapters } from './chapters'

type ScrollStoryProps = {
  sectionRef: RefObject<HTMLElement | null>
  children: ReactNode
}

export function ScrollStory({ sectionRef, children }: ScrollStoryProps) {
  return (
    <section className="story" ref={sectionRef}>
      <div className="story__sticky">
        <div className="story__stage">{children}</div>
        <div className="story__copy">
          {chapters.map((chapter) => (
            <article
              key={chapter.id}
              className={chapter.id === 'hero' ? 'chapter is-active' : 'chapter'}
              data-chapter={chapter.id}
            >
              <p className="eyebrow">{chapter.eyebrow}</p>
              <h1>{chapter.title}</h1>
              <p>{chapter.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
