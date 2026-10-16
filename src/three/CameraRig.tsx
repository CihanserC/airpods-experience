import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anim } from '../lib/anim'

/** Bu en-boy oranında kadraj tasarlandığı gibidir; daha dar ekranlarda kamera geri çekilir. */
const DESIGN_ASPECT = 1.5
const MAX_PULLBACK = 2.4

/** Dikey ekranlarda odak sahnesinde görüntü bu oranda yukarı kayar (alttaki HUD kartına yer açar). */
const PORTRAIT_SHIFT = 0.05

const target = new THREE.Vector3()
const offset = new THREE.Vector3()

/**
 * Kamerayı zaman çizelgesindeki konuma taşır. Dar (mobil, dikey) ekranlarda hedef ile kamera
 * arasındaki mesafe büyütülür; böylece ürün ve patlatılmış katmanlar ekrandan taşmaz.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useFrame(() => {
    const aspect = size.width / Math.max(size.height, 1)
    // Üs < 1: dar ekranda ürün tam ölçekten biraz büyük kalır ama yatayda hâlâ sığar.
    const pullback = THREE.MathUtils.clamp(Math.pow(DESIGN_ASPECT / aspect, 0.8), 1, MAX_PULLBACK)
    const c = anim.cam
    target.set(c.tx, c.ty, c.tz)
    offset.set(c.px - c.tx, c.py - c.ty, c.pz - c.tz).multiplyScalar(pullback)
    camera.position.copy(target).add(offset)
    camera.lookAt(target)

    // Görüntü merkezini kaydırır (frustum kaydırma); izdüşüm matrisine girdiği için HUD de doğru kalır.
    const cam = camera as THREE.PerspectiveCamera
    const shift = aspect < 0.9 ? PORTRAIT_SHIFT * anim.focus : 0
    if (shift > 0.001) cam.setViewOffset(size.width, size.height, 0, size.height * shift, size.width, size.height)
    else if (cam.view?.enabled) cam.clearViewOffset()
  })

  return null
}
