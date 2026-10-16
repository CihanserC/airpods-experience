// Stüdyo ışığı: loş anahtar ışık, soğuk dolgu, arka kontur ışığı ve
// Lightformer'larla üretilen yumuşak HDR yansıma ortamı (ağdan dosya indirmez).
// Metalik ve düşük pürüzlü yüzeyler neredeyse ayna gibidir; ne kadar parlak görünecekleri
// yansıttıkları ortama bağlıdır. Bu yüzden ortamın gri bir tabanı ve büyük softbox'ları var.
import { Environment, Lightformer } from '@react-three/drei'

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <spotLight position={[2.6, 4.4, 3.2]} angle={0.34} penumbra={0.9} intensity={38} color="#fff4ea" decay={2} />
      <spotLight position={[-3.4, 1.8, 2.4]} angle={0.6} penumbra={1} intensity={9} color="#cfdcff" decay={2} />
      <spotLight position={[0.2, 2.6, -3.6]} angle={0.55} penumbra={1} intensity={24} color="#ffffff" decay={2} />

      <Environment resolution={256} frames={1} environmentIntensity={1}>
        {/* Loş gri stüdyo duvarı: aynalı metal hiçbir açıda tamamen kararmaz */}
        <color attach="background" args={['#1b1d22']} />
        {/* Üstte büyük softbox */}
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 4, 1]} />
        {/* Önde, iki yanda büyük softbox'lar: kameraya bakan yüzlerde yumuşak parlaklık */}
        <Lightformer form="rect" intensity={1.3} position={[-4, 1.2, 3.5]} rotation-y={Math.PI / 4} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[4, 0.8, 3.5]} rotation-y={-Math.PI / 4} scale={[5, 5, 1]} />
        {/* Yanlarda dikey şeritler: metalde uzun parlak yansımalar */}
        <Lightformer form="rect" intensity={3} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 0.7, 1]} />
        <Lightformer form="rect" intensity={3} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[10, 0.7, 1]} />
        {/* Arkadan soğuk kontur */}
        <Lightformer form="ring" intensity={1.6} color="#bcd8ff" position={[0, 1.5, -6]} scale={4} />
      </Environment>
    </>
  )
}
