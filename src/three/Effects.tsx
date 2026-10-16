import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/** Hafif bloom (yalnızca parlak yansımalar), ACES ton eşleme ve kenar karartma. */
export function Effects({ mobile }: { mobile: boolean }) {
  return (
    <EffectComposer multisampling={mobile ? 0 : 4}>
      <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={mobile ? 0.45 : 0.6} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.62} />
    </EffectComposer>
  )
}
