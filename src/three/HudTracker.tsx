import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { hud } from '../lib/hud'

const world = new THREE.Vector3()

/** Patlatılmış katmanların çapalarını ekrana izdüşürür; HUD çizgileri bu noktalara bağlanır. */
export function HudTracker() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  // Öncelik 0: CameraRig'den sonra (aynı öncelikte kayıt sırasıyla) çalışır.
  // 0'dan büyük öncelik R3F'de "render'ı ben yaparım" demektir, o yüzden kullanılmaz.
  useFrame(() => {
    const write = hud.write
    if (!write) return
    hud.anchors.forEach((anchor, i) => {
      anchor.getWorldPosition(world).project(camera)
      write(i, ((world.x + 1) / 2) * size.width, ((1 - world.y) / 2) * size.height)
    })
  })

  return null
}
