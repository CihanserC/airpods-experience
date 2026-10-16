import { ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { brand, preorder, specs } from '../content'

/** "Explore Specs" hedefi: cam kartlarda teknik özellikler. */
export function Specs() {
  return (
    <section id="specs" className="relative px-5 py-28 md:px-[4.5vw] md:py-40" aria-labelledby="specs-title">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Specifications</p>
        <h2 id="specs-title" className="mt-4 max-w-3xl text-5xl leading-[0.95] font-semibold tracking-[-0.045em] md:text-7xl">
          Engineered to <span className="text-silver">disappear.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-mist md:text-lg">
          Every layer you saw above earns its place. Nothing in {brand.product} is there for show.
        </p>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specs.map(({ icon: Icon, label, value, note }) => (
            <li key={label} className="glass group rounded-3xl p-6 transition duration-500 hover:border-white/25">
              <Icon className="size-5 text-ice" aria-hidden />
              <p className="mt-10 text-4xl font-semibold tracking-[-0.04em]">{value}</p>
              <p className="mt-2 text-sm font-medium text-fog">{label}</p>
              <p className="mt-1 text-sm text-mist">{note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** "Pre-Order Now" hedefi. Ürün bir konsept olduğundan sipariş alınmaz; bu açıkça yazılır. */
export function Preorder() {
  const [finish, setFinish] = useState(preorder.finishes[0].id)
  const [asked, setAsked] = useState(false)
  const selected = preorder.finishes.find((f) => f.id === finish) ?? preorder.finishes[0]

  return (
    <section id="preorder" className="relative px-5 pb-28 md:px-[4.5vw] md:pb-40" aria-labelledby="preorder-title">
      <div className="glass-strong mx-auto grid max-w-7xl gap-12 rounded-[2rem] p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div>
          <p className="eyebrow">Pre-order</p>
          <h2 id="preorder-title" className="mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.045em] md:text-7xl">
            {brand.product}
          </h2>
          <p className="mt-5 max-w-md text-mist">{brand.intro}</p>
        </div>

        <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-5xl font-semibold tracking-[-0.04em]">{preorder.price}</p>
              <p className="font-mono text-xs text-mist">{preorder.shipping}</p>
            </div>

            <fieldset className="mt-8">
              <legend className="eyebrow">Finish · {selected.name}</legend>
              <div className="mt-4 flex gap-3">
                {preorder.finishes.map((f) => (
                  <label key={f.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="finish"
                      value={f.id}
                      checked={finish === f.id}
                      onChange={() => setFinish(f.id)}
                      className="peer sr-only"
                    />
                    <span
                      className="block size-10 rounded-full ring-1 ring-white/20 ring-offset-4 ring-offset-black transition peer-checked:ring-2 peer-checked:ring-ice peer-focus-visible:ring-2 peer-focus-visible:ring-ice"
                      style={{ background: f.swatch }}
                    />
                    <span className="sr-only">{f.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <button type="button" className="btn-primary focus-ring w-full justify-center py-4" onClick={() => setAsked(true)}>
              {asked ? <Check className="size-4" aria-hidden /> : null}
              {asked ? 'Noted' : 'Pre-Order Now'}
              {asked ? null : <ArrowRight className="size-4" aria-hidden />}
            </button>
            <p className="mt-4 text-center text-sm text-mist" aria-live="polite">
              {preorder.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-5 py-10 md:px-[4.5vw]">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-ash md:flex-row">
        <p>
          <span className="font-semibold tracking-[0.18em] text-mist">{brand.name}</span> · {brand.product} · design concept
        </p>
        <p>Built with React Three Fiber, GSAP and Lenis.</p>
      </div>
    </footer>
  )
}
