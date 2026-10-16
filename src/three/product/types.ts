import type * as THREE from 'three'
import type { PartInfo } from '../../content'

export type PartNode = PartInfo['node']

export type BudRig = {
  /** Kulaklığın merkezinde duran, animasyonun taşıdığı grup. */
  rig: THREE.Group
  /** Kulaklığın kendi mesh'leri (sağ kulaklıkta part_01_shell). */
  shell: THREE.Object3D
  /** Kutunun içindeki dinlenme konumu (normalize birim). */
  restPosition: THREE.Vector3
  materials: THREE.Material[]
}

/** GLB'den ya da yedek geometriden kurulan ürün; bütün değerler normalize birimdedir. */
export type ProductParts = {
  root: THREE.Group
  /** Kutu gövdesi ve kapak birlikte (geri çekilip silikleşen kısım). */
  caseGroup: THREE.Group
  lidPivot: THREE.Group
  caseMaterials: THREE.Material[]
  budL: BudRig
  budR: BudRig
  /** GLB iç parçaları içeriyorsa onlar; yoksa boş (sahne kodda üretir). */
  internals: Partial<Record<PartNode, THREE.Object3D>>
  /** Sağ kulaklığın baş (sürücü) merkezi, rig'e göre. */
  budHead: THREE.Vector3
  /** Kulaklık boyutu (rig'e göre). */
  budSize: THREE.Vector3
  /** Kutunun alt yüzeyi (gölge için). */
  floorY: number
  source: 'gltf' | 'fallback'
}

/** Kapalı kutunun genişliği bu değere ölçeklenir. */
export const PRODUCT_WIDTH = 1.15
