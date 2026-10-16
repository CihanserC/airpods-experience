import { ContactShadows } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, Suspense, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { anim, heroCamera } from '../lib/anim'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { HudTracker } from './HudTracker'
import { Lighting } from './Lighting'
import { FallbackProduct, GltfProduct } from './product/Product'

/** Kapalı kutunun alt yüzeyi (normalize birim). Gölge buraya düşer. */
const FLOOR_Y = -0.53

export function Experience({ mobile }: { mobile: boolean }) {
  return (
    <Canvas
      // Performans: piksel oranı en fazla 2.
      dpr={Math.min(window.devicePixelRatio, 2)}
      camera={{ position: [heroCamera.px, heroCamera.py, heroCamera.pz], fov: 30, near: 0.05, far: 60 }}
      // Şeffaf tuval: hero tipografisi ürünün arkasında kalır.
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
      aria-hidden
    >
      <fog attach="fog" args={['#050506', 6, 14]} />
      <Lighting />

      <ModelBoundary fallback={<FallbackProduct />}>
        <Suspense fallback={null}>
          <GltfProduct />
        </Suspense>
      </ModelBoundary>

      <Floor />
      <CameraRig />
      <HudTracker />
      <Effects mobile={mobile} />
    </Canvas>
  )
}

/** Kutunun altındaki yumuşak temas gölgesi; kutu silikleşince o da kaybolur. */
function Floor() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const group = ref.current
    if (!group) return
    group.position.z = -1.25 * anim.caseDim
    group.position.y = FLOOR_Y - 0.35 * anim.caseDim
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) (mesh.material as THREE.Material).opacity = 0.55 * (1 - anim.caseDim)
    })
  })
  return (
    <group ref={ref} position={[0, FLOOR_Y, 0]}>
      <ContactShadows opacity={0.55} scale={5} blur={2.6} far={1.6} resolution={512} color="#000000" />
    </group>
  )
}

/** GLB yüklenemezse (dosya yok, Draco hatası…) yedek ürünü gösterir. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[aural] tws_earbuds.glb yüklenemedi, yedek geometri kullanılıyor.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
