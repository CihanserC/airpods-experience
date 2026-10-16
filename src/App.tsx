import { useSmoothScroll } from './lib/smoothScroll'
import { useIsMobile } from './lib/viewport'
import { Loader } from './ui/Loader'
import { Nav } from './ui/Nav'
import { Footer, Preorder, Specs } from './ui/Sections'
import { Story } from './ui/Story'

export default function App() {
  useSmoothScroll()
  const mobile = useIsMobile()

  return (
    <>
      <Loader />
      <Nav />
      <main>
        <Story mobile={mobile} />
        <Specs />
        <Preorder />
      </main>
      <Footer />
    </>
  )
}
