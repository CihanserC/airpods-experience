import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { anim } from '../../lib/anim'
import { hud } from '../../lib/hud'
import { buildFallback } from './buildFallback'
import { buildFromGltf } from './buildFromGltf'
import { buildDriverStack, mountDriverStack, type DriverStack } from './driverStack'
import { setFade } from './materials'
import { poses, restQuaternion } from './poses'
import type { ProductParts } from './types'

export const MODEL_URL = '/models/tws_earbuds.glb'
export const DRACO_PATH = '/draco/'

useGLTF.preload(MODEL_URL, DRACO_PATH)

/** Asıl model: /models/tws_earbuds.glb (useGLTF + Draco). */
export function GltfProduct() {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const product = useMemo(() => buildFromGltf(scene), [scene])
  return <ProductRig product={product} />
}

/** GLB yüklenemezse: aynı koreografiyi oynayan ilkel geometriler. */
export function FallbackProduct() {
  const product = useMemo(() => buildFallback(), [])
  return <ProductRig product={product} />
}

// Her karede yeniden kullanılan geçici nesneler (çöp üretmemek için).
const tmpPos = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const spinQuat = new THREE.Quaternion()
const yAxis = new THREE.Vector3(0, 1, 0)

const smooth = (t: number) => t * t * (3 - 2 * t)

function ProductRig({ product }: { product: ProductParts }) {
  const stack = useMemo(() => buildDriverStack(product), [product])

  // Katmanları sahneye ekleme bir effect'te: StrictMode'un çift çağrısında bile tek yığın kalır.
  useLayoutEffect(() => mountDriverStack(product, stack), [product, stack])

  useEffect(() => {
    hud.anchors = stack.items.map((item) => item.anchor)
    // Geliştirme sırasında konsoldan incelenebilsin: window.__aural
    if (import.meta.env.DEV) Object.assign(window, { __aural: { anim, product, stack } })
    return () => {
      hud.anchors = []
    }
  }, [product, stack])

  useFrame((state) => applyPose(product, stack, state.clock.elapsedTime))

  return <primitive object={product.root} />
}

function applyPose(product: ProductParts, stack: DriverStack, time: number) {
  const { lid, rise, caseDim, focus, shell, explode, spin } = anim

  // Kapak: menteşe etrafında 90°.
  product.lidPivot.rotation.x = -lid * Math.PI * 0.5

  // Kutu: geri çekilir, küçülür, koyulaşıp silikleşir.
  const dim = smooth(caseDim)
  product.caseGroup.position.copy(poses.caseBack).multiplyScalar(dim)
  product.caseGroup.scale.setScalar(1 - (1 - poses.caseBackScale) * dim)
  // Önce loşlaşır (koyulaşarak geri çekilir), şeffaflık ancak ikinci yarıda başlar;
  // böylece yarı saydam kutunun iç yuvaları görünüp sahneyi kalabalıklaştırmaz.
  const vanish = smooth(Math.max(0, (caseDim - 0.5) / 0.5))
  setFade(product.caseMaterials, 1 - 0.96 * vanish, 0.75 * dim)
  // Tamamen silikleşince hiç çizilmesin (dar ekranlarda arkada parlak bir hayalet kalmasın).
  product.caseGroup.visible = dim < 0.995

  // Havada hafif süzülme (kulaklıklar çıktıktan sonra).
  const bob = Math.sin(time * 1.3) * 0.018 * rise

  // Sol kulaklık: kutu → hava → sahne dışı.
  placeBud(product.budL.rig, product.budL.restPosition, poses.riseL, rise)
  if (focus > 0) {
    product.budL.rig.position.lerp(poses.exitL.position, smooth(focus))
    product.budL.rig.quaternion.slerp(poses.exitL.quaternion, smooth(focus))
  }
  product.budL.rig.position.y += bob
  setFade(product.budL.materials, 1 - focus)
  product.budL.rig.visible = focus < 0.999

  // Sağ kulaklık: kutu → hava → sahnenin ortası → 360° dönüş.
  placeBud(product.budR.rig, product.budR.restPosition, poses.riseR, rise)
  if (focus > 0) {
    product.budR.rig.position.lerp(poses.focusR.position, smooth(focus))
    product.budR.rig.quaternion.slerp(poses.focusR.quaternion, smooth(focus))
  }
  product.budR.rig.position.y += bob * (1 - focus * 0.6)
  if (spin > 0) {
    spinQuat.setFromAxisAngle(yAxis, spin * Math.PI * 2)
    product.budR.rig.quaternion.premultiply(spinQuat)
  }

  // Kabuk şeffaflaşır; iç katmanlar görünür olur ve Z ekseninde açılır.
  setFade(product.budR.materials, 1 - 0.86 * shell)
  stack.group.visible = shell > 0.01
  stack.items.forEach((item, i) => {
    const e = explode[i] ?? 0
    item.object.position.copy(item.base).addScaledVector(item.offset, e)
  })
}

/** Dinlenme konumundan (kutunun içi) havadaki poza geçiş. */
function placeBud(rig: THREE.Group, rest: THREE.Vector3, target: { position: THREE.Vector3; quaternion: THREE.Quaternion }, t: number) {
  const e = smooth(t)
  // Önce düz yukarı çıkar (kutunun ağzından), sonra öne süzülür.
  const lift = Math.min(1, e / 0.45)
  tmpPos.copy(rest)
  tmpPos.y += smooth(lift) * Math.max(0, target.position.y - rest.y) * 0.55
  tmpPos.lerp(target.position, smooth(Math.max(0, (e - 0.25) / 0.75)))
  rig.position.copy(tmpPos)
  tmpQuat.copy(restQuaternion).slerp(target.quaternion, smooth(Math.max(0, (e - 0.2) / 0.8)))
  rig.quaternion.copy(tmpQuat)
}
