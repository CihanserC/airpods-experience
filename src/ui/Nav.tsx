import { ArrowUpRight } from 'lucide-react'
import type { MouseEvent } from 'react'
import { brand } from '../content'
import { scrollToSection } from '../lib/smoothScroll'

const links = [
  { label: 'Story', target: '#story' },
  { label: 'Specs', target: '#specs' },
  { label: 'Pre-order', target: '#preorder' },
]

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-[4.5vw] md:pt-5">
      <nav className="glass mx-auto flex h-14 items-center justify-between rounded-full pr-2 pl-5" aria-label="Main">
        <a href="#story" className="focus-ring flex items-center gap-2.5 rounded-full" onClick={(e) => go(e, '#story')}>
          <Logo />
          <span className="text-sm font-semibold tracking-[0.18em]">{brand.name}</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.target}>
              <a href={link.target} onClick={(e) => go(e, link.target)} className="focus-ring rounded text-sm text-mist transition hover:text-fog">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#preorder" onClick={(e) => go(e, '#preorder')} className="btn-primary focus-ring px-4 py-2 text-[13px]">
          Pre-Order
          <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </nav>
    </header>
  )
}

function go(event: MouseEvent, target: string) {
  event.preventDefault()
  scrollToSection(target)
}

/** İki eş merkezli halka: ses dalgası ve kulaklık başı. */
function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.8" fill="#9fd6ff" />
    </svg>
  )
}
