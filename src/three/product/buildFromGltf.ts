// GLB sahnesini animasyona hazır parçalara ayırır.
//
// Kaynak model "açık" pozda gelir: kapak ~115° açık, kulaklıklar kutunun üstünde havada.
// Burada kapak kapatılıp gövdenin üstüne oturtulur, menteşe ekseni arka üst kenara konur,
// kulaklıklar kutunun içine indirilir ve her şey kapalı kutunun merkezine göre normalize edilir.
import * as THREE from 'three'
import { parts as partInfo } from '../../content'
import { adoptMaterials, finish } from './materials'
import { PRODUCT_WIDTH, type BudRig, type PartNode, type ProductParts } from './types'

export const NODE = {
  caseBody: 'case_body',
  lid: 'case_lid',
  budL: 'earbud_L',
  budR: 'earbud_R',
} as const

/** Kulaklık tepesi, kutu ağzının bu kadar altında durur (model birimi, metre). */
const BUD_SINK = 0.0006
/**
 * Gövdenin üstündeki iç dudak (~3.4 mm) kapağın içine girer; kapağın kenarı dudağın değil,
 * dış duvarın üstüne oturur. Kutu kapalıyken toplam yükseklik 46 mm'ye iner.
 */
const LID_LIP = 0.0034

export function buildFromGltf(scene: THREE.Object3D): ProductParts {
  const source = scene.clone(true)
  source.updateMatrixWorld(true)

  const find = (name: string) => {
    const node = source.getObjectByName(name)
    if (!node) throw new Error(`GLB içinde "${name}" düğümü yok`)
    return node
  }

  const lid = find(NODE.lid)
  const budL = find(NODE.budL)
  const budR = find(NODE.budR)
  find(NODE.caseBody)

  // Model iç parçaları içeriyorsa (part_01_shell …) onları kullan.
  const internals: Partial<Record<PartNode, THREE.Object3D>> = {}
  for (const info of partInfo) {
    const node = source.getObjectByName(info.node)
    if (node) internals[info.node] = node
  }

  // Kapalı kapak yönü = ebeveyninin dünya yönü (kapağın kendi dönüşü sıfır).
  const closedQuat = new THREE.Quaternion()
  lid.parent?.getWorldQuaternion(closedQuat)

  // Parçaları ortak, dönüşümsüz bir uzaya taşı; dünya dönüşümleri korunur.
  const space = new THREE.Group()
  space.add(source)
  space.attach(lid)
  space.attach(budL)
  space.attach(budR)

  // Gövde kutusu: kapak ve kulaklıklar çıkarıldıktan sonra geriye kalan.
  const body = new THREE.Box3().setFromObject(source)
  const bodyCenter = body.getCenter(new THREE.Vector3())

  // Kapağı kapat ve gövdenin ağzına oturt.
  lid.quaternion.copy(closedQuat)
  lid.updateMatrixWorld(true)
  const lidBox = new THREE.Box3().setFromObject(lid)
  const lidCenter = lidBox.getCenter(new THREE.Vector3())
  lid.position.add(new THREE.Vector3(bodyCenter.x - lidCenter.x, body.max.y - LID_LIP - lidBox.min.y, bodyCenter.z - lidCenter.z))
  lid.updateMatrixWorld(true)

  // Menteşe: gövdenin arka üst kenarı.
  const lidPivot = new THREE.Group()
  lidPivot.name = 'lid_hinge'
  lidPivot.position.set(bodyCenter.x, body.max.y - LID_LIP, body.min.z)
  space.add(lidPivot)
  lidPivot.updateMatrixWorld(true)
  lidPivot.attach(lid)

  // Kulaklıkları kutunun içine indir: tepeleri ağzın hemen altında, derinlikte ortalı.
  for (const bud of [budL, budR]) {
    bud.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(bud)
    const center = box.getCenter(new THREE.Vector3())
    bud.position.add(new THREE.Vector3(0, body.max.y - BUD_SINK - box.max.y, bodyCenter.z - center.z))
    bud.updateMatrixWorld(true)
  }

  // Kapalı kutuya göre normalize et: merkez orijinde, genişlik PRODUCT_WIDTH.
  const closed = new THREE.Box3().setFromObject(source).union(new THREE.Box3().setFromObject(lidPivot))
  const center = closed.getCenter(new THREE.Vector3())
  const scale = PRODUCT_WIDTH / closed.getSize(new THREE.Vector3()).x
  const normalize = (obj: THREE.Object3D) => {
    obj.position.sub(center).multiplyScalar(scale)
    obj.scale.multiplyScalar(scale)
    obj.updateMatrixWorld(true)
  }
  for (const obj of [source, lidPivot, budL, budR]) normalize(obj)

  // Kutu = gövde + menteşedeki kapak.
  const caseGroup = new THREE.Group()
  caseGroup.name = 'case'
  caseGroup.add(source, lidPivot)
  const caseMaterials = adoptMaterials(caseGroup, finish.case)

  const root = new THREE.Group()
  root.name = 'product'
  root.add(caseGroup)

  const rigL = makeRig(budL, root)
  const rigR = makeRig(budR, root)

  const budBox = new THREE.Box3().setFromObject(rigR.shell)
  const budSize = budBox.getSize(new THREE.Vector3())
  rigR.rig.updateMatrixWorld(true)
  // Baş (sürücü) kulaklığın üst kısmında; kabaca genişlik kadar bir küre.
  const headWorld = new THREE.Vector3(
    (budBox.min.x + budBox.max.x) / 2,
    budBox.max.y - budSize.x * 0.5,
    (budBox.min.z + budBox.max.z) / 2,
  )
  const budHead = rigR.rig.worldToLocal(headWorld.clone())

  return {
    root,
    caseGroup,
    lidPivot,
    caseMaterials,
    budL: rigL,
    budR: rigR,
    internals,
    budHead,
    budSize: new THREE.Vector3(budSize.x, budSize.y, budSize.z),
    floorY: (closed.min.y - center.y) * scale,
    source: 'gltf',
  }
}

/** Kulaklığı kendi merkezinde duran bir gruba alır; animasyon bu grubu taşır ve döndürür. */
function makeRig(bud: THREE.Object3D, root: THREE.Group): BudRig {
  bud.updateMatrixWorld(true)
  const center = new THREE.Box3().setFromObject(bud).getCenter(new THREE.Vector3())
  const rig = new THREE.Group()
  rig.name = `${bud.name}_rig`
  rig.position.copy(center)
  root.add(rig)
  rig.updateMatrixWorld(true)
  rig.attach(bud)
  const materials = adoptMaterials(bud, finish.bud)
  return { rig, shell: bud, restPosition: center.clone(), materials }
}
