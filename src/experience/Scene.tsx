import { ContactShadows, Environment } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, type MutableRefObject } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { ModelBoundary } from '../models/ModelBoundary'
import { CameraRig } from './CameraRig'
import { StudioLights, studio } from './lights'
import { Product } from './Product'

type SceneProps = {
  progress: MutableRefObject<number>
  mobile: boolean
}

export function Scene({ progress, mobile }: SceneProps) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 0.35, 4.2], fov: 32, near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05
      }}
    >
      <color attach="background" args={['#0c0c0e']} />
      <StudioLights />
      <Product progress={progress} mobile={mobile} />
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.45}
        scale={8}
        blur={2.5}
        far={3}
        resolution={512}
        color="#000000"
      />
      <Suspense fallback={null}>
        <ModelBoundary fallback={null}>
          <Environment preset="studio" environmentIntensity={studio.environmentIntensity} />
        </ModelBoundary>
      </Suspense>
      <CameraRig progress={progress} mobile={mobile} />
    </Canvas>
  )
}
