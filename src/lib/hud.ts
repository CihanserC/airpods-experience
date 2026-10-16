// 3D parçaların ekran konumunu HUD katmanına (DOM) taşır.
// Sahne her karede çapaları ekrana izdüşürür ve write() ile DOM'a yazar; React render olmaz.
import type * as THREE from 'three'

type Writer = (index: number, x: number, y: number) => void

export const hud = {
  anchors: [] as THREE.Object3D[],
  write: null as Writer | null,
}
