# AURAL AI · Sound Redefined

**Live:** https://cihanserc.github.io/airpods-experience/

A scroll-driven launch page for TWS earbuds. The case starts closed, the lid opens, the earbuds lift out, the right earbud is exploded layer by layer, then everything reassembles and turns 360°.

**Stack:** React 19 + Vite, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, GSAP + ScrollTrigger, Lenis, Tailwind CSS 4, lucide-react.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # serve the production build locally
```

## Model

The scene loads `/public/models/tws_earbuds.glb` with `useGLTF` (Draco) and expects these node names:

| Node | What |
| --- | --- |
| `case_body` | Case body |
| `case_lid` | Case lid |
| `earbud_L`, `earbud_R` | Left and right earbud |
| `part_01_shell` … `part_05_diaphragm` | Optional internal layers (exploded view) |

The source model has random node names and no internal layers, so:

- `npm run prepare:model` renames the nodes of the source GLB to the names above and writes `public/models/tws_earbuds.glb`. The default input is `sources/product.glb` (not committed). For a new model, update the `RENAME` table in `scripts/prepare-model.mjs`; `--inspect` only prints the matches and their bounding boxes.
- The model ships in an "open" pose (lid open about 115°, earbuds floating). `src/three/product/buildFromGltf.ts` closes the lid and seats it on the outer wall of the body, puts the hinge on the back top edge, lowers the earbuds into the case and normalizes everything around the closed case's center.
- `part_01_shell` is the right earbud's own mesh (it turns transparent). If the model has no other four layers, `src/three/product/driverStack.ts` generates them in code: mic board, neodymium magnet, copper voice coil and polymer diaphragm. If the model contains internal parts with these names, those are used instead.
- If the GLB fails to load, `buildFallback.ts` builds the same structure from rounded primitives and the choreography still plays.

Raw textures and the FBX live under `resources/`. Heavy master files are kept in `sources/` and are not deployed. To compress textures, use `npm run optimize:glb -- input.glb output.glb`.

## Scroll choreography

A single GSAP timeline (`src/scroll/useStoryTimeline.ts`) pins the stage with ScrollTrigger for 5.5 screen heights and scrubs it. The same timeline drives both the 3D state (`src/lib/anim.ts`) and the DOM layers; no React component re-renders while scrolling.

| Scroll | What happens |
| --- | --- |
| 0% | Closed case, low studio light, "SOUND / REDEFINED" behind the product |
| ~25% | The lid opens 90°, the earbuds float up, the case dims, pulls back and fades |
| 50%…75% | The right earbud takes focus, its shell turns transparent, five layers open one by one along Z, each with its own HUD card |
| 100% | The layers reassemble, a 360° turn, "Pre-Order Now" and "Explore Specs" |

Camera poses live in the `cameras` object of the timeline; earbud poses live in `src/three/product/poses.ts`.

## Files

```
src/
  content.ts               all copy (hero, chapters, HUD cards, specs)
  lib/                     animation state, Lenis, HUD bridge, viewport
  scroll/                  GSAP timeline
  three/                   Canvas, lighting, effects, camera, HUD projection
  three/product/           GLB parsing, fallback geometry, internal layers, materials, poses
  ui/                      Nav, pinned stage, HUD, sections, loader
scripts/prepare-model.mjs  renames nodes to the names the scene expects
```

## Performance and accessibility

- Pixel ratio is capped at `Math.min(devicePixelRatio, 2)`; on mobile, bloom is lighter and multisampling is off.
- The reflection environment is built in code with Lightformers; no HDR file is downloaded.
- three and R3F are split into separate chunks (manualChunks) and cached independently.
- On narrow screens the camera pulls back automatically; in portrait the focus scene shifts up slightly to make room for the HUD card.
- `prefers-reduced-motion: reduce`: no pinning or animation, the closed product and the CTAs stay static, Lenis is off.
- The product is a design concept; the "Pre-Order" section takes no orders and says so.

## Deployment

- **GitHub Pages:** on every push to `master`, `.github/workflows/pages.yml` builds and deploys the site. Because the site runs under the `/airpods-experience/` sub-path, the workflow sets `BASE_PATH`; model and Draco URLs are built from `import.meta.env.BASE_URL`. To try the same output locally: `BASE_PATH=/airpods-experience/ npm run build && BASE_PATH=/airpods-experience/ npm run preview` (in Git Bash, prefix it with `MSYS_NO_PATHCONV=1`).
- **Netlify** (`netlify.toml`) or **Cloudflare Pages** (`public/_headers`): served from the root path, no `BASE_PATH` needed. GLB and Draco files are cached for one year.
