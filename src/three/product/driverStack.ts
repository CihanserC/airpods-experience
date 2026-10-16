// Sağ kulaklığın patlatılmış görünümdeki katmanları.
// Model iç parçaları içermiyorsa (bu modelde yok) gerçekçi oranlarla kodda üretilir:
// mikrofon dizisi, neodyum mıknatıs, bakır ses bobini ve polimer diyafram.
// Hepsi kulaklığın başında, yerel Z ekseni boyunca dizilir ve bu eksen boyunca açılır.
import * as THREE from 'three'
import { parts as partInfo } from '../../content'
import type { PartNode, ProductParts } from './types'

export type StackItem = {
  node: PartNode
  /** Hareket eden nesne (part_01 için kulaklık kabuğunun kendisi). */
  object: THREE.Object3D
  /** Birleşik hâldeki konum (rig'e göre). */
  base: THREE.Vector3
  /** Tam patlatıldığında eklenen ofset (rig'e göre). */
  offset: THREE.Vector3
  /** HUD çizgisinin bağlandığı nokta. */
  anchor: THREE.Object3D
}

export type DriverStack = {
  group: THREE.Group
  items: StackItem[]
  /** Kabuğun HUD çapası; kabukla birlikte kaysın diye kabuğa eklenir. */
  shellAnchor: THREE.Object3D
}

const AXIS = new THREE.Vector3(0, 0, 1)

/** Katmanların birleşik ve patlatılmış konumları, kulaklık genişliği cinsinden (Z ekseni). */
const LAYOUT: Record<PartNode, { assembled: number; exploded: number }> = {
  part_01_shell: { assembled: 0, exploded: -0.85 },
  part_02_mic: { assembled: -0.12, exploded: -0.36 },
  part_03_magnet: { assembled: -0.04, exploded: 0.12 },
  part_04_coil: { assembled: 0.03, exploded: 0.56 },
  part_05_diaphragm: { assembled: 0.1, exploded: 1.0 },
}

/**
 * Katmanları kurar ama sahneye eklemez (saf fonksiyon; StrictMode'da iki kez çağrılabilir).
 * Sahneye ekleme mountDriverStack ile bir effect içinde yapılır.
 */
export function buildDriverStack(product: ProductParts): DriverStack {
  // Kulaklığın başı (sürücü yuvası) kabaca bu genişlikte; eğik durduğu için sınır kutusu daha geniştir.
  const w = Math.min(product.budSize.x, product.budSize.z) * 0.78

  const group = new THREE.Group()
  group.name = 'driver_stack'
  group.position.copy(product.budHead)
  group.visible = false

  // Kabuk çapası: rig koordinatındaki noktayı kabuğun yerel koordinatına çevir.
  const shell = product.budR.shell
  shell.updateMatrix()
  const shellAnchor = new THREE.Object3D()
  shellAnchor.name = 'hud_anchor_shell'
  shellAnchor.position
    .copy(product.budHead)
    .add(new THREE.Vector3(0, w * 0.35, 0))
    .applyMatrix4(shell.matrix.clone().invert())

  const items: StackItem[] = []
  for (const info of partInfo) {
    const layout = LAYOUT[info.node]
    const offset = AXIS.clone().multiplyScalar((layout.exploded - layout.assembled) * w)

    if (info.node === 'part_01_shell') {
      // Kabuk: kulaklığın kendi mesh'i; geriye kayar ve şeffaflaşır.
      items.push({ node: info.node, object: shell, base: shell.position.clone(), offset, anchor: shellAnchor })
      continue
    }

    const fromModel = product.internals[info.node]
    const object = fromModel ?? makePart(info.node, w)
    object.name = info.node
    if (fromModel) group.attach(fromModel)
    else group.add(object)
    const base = fromModel ? object.position.clone() : AXIS.clone().multiplyScalar(layout.assembled * w)
    object.position.copy(base)

    const anchor = new THREE.Object3D()
    anchor.position.set(0, w * 0.2, 0)
    object.add(anchor)
    items.push({ node: info.node, object, base, offset, anchor })
  }

  return { group, items, shellAnchor }
}

/** Katmanları sağ kulaklığa ekler; dönen fonksiyon geri alır (effect temizliği). */
export function mountDriverStack(product: ProductParts, stack: DriverStack) {
  product.budR.rig.add(stack.group)
  product.budR.shell.add(stack.shellAnchor)
  return () => {
    stack.group.removeFromParent()
    stack.shellAnchor.removeFromParent()
    const first = stack.items[0]
    first.object.position.copy(first.base)
  }
}

// ---------------------------------------------------------------- malzemeler

const copper = () => new THREE.MeshStandardMaterial({ color: '#c8784a', metalness: 0.85, roughness: 0.15 })
const nickel = () => new THREE.MeshStandardMaterial({ color: '#d4d6db', metalness: 0.95, roughness: 0.18 })
const steel = () => new THREE.MeshStandardMaterial({ color: '#8d9198', metalness: 0.9, roughness: 0.28 })
const pcb = () => new THREE.MeshStandardMaterial({ color: '#0f1512', metalness: 0.3, roughness: 0.55 })
const gold = () => new THREE.MeshStandardMaterial({ color: '#d9b066', metalness: 0.9, roughness: 0.2 })

function film() {
  return new THREE.MeshPhysicalMaterial({
    color: '#c9d6ff',
    metalness: 0.15,
    roughness: 0.18,
    transparent: true,
    opacity: 0.7,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 1,
    iridescenceIOR: 1.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
}

/** Silindirleri Y yerine Z ekseninde döndürür (diskler kameraya baksın). */
function alongZ(mesh: THREE.Mesh) {
  mesh.rotation.x = Math.PI / 2
  return mesh
}

function makePart(node: PartNode, w: number): THREE.Object3D {
  const g = new THREE.Group()
  switch (node) {
    case 'part_02_mic': {
      // İnce devre kartı halkası ve üstünde iki MEMS mikrofon kapsülü.
      const board = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w * 0.3, w * 0.025, 64), pcb()))
      const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.3, w * 0.012, 12, 96), gold())
      g.add(board, ring)
      for (const side of [-1, 1]) {
        const capsule = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.06, w * 0.06, w * 0.06, 32), steel()))
        capsule.position.set(side * w * 0.15, w * 0.08, w * 0.03)
        const port = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.025, w * 0.025, w * 0.062, 24), gold()))
        port.position.copy(capsule.position)
        g.add(capsule, port)
      }
      break
    }
    case 'part_03_magnet': {
      // Nikel kaplı neodyum disk ve çelik üst plaka.
      const magnet = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.2, w * 0.2, w * 0.11, 64), nickel()))
      const plate = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.24, w * 0.24, w * 0.025, 64), steel()))
      plate.position.z = w * 0.07
      const pole = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.08, w * 0.08, w * 0.04, 32), steel()))
      pole.position.z = w * 0.09
      g.add(magnet, plate, pole)
      break
    }
    case 'part_04_coil': {
      // Bobin üzerine sarılmış bakır tel: sarmal bir tüp.
      const radius = w * 0.17
      const turns = 16
      const height = w * 0.12
      const points: THREE.Vector3[] = []
      for (let i = 0; i <= turns * 32; i += 1) {
        const t = i / (turns * 32)
        const a = t * turns * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, (t - 0.5) * height))
      }
      const wire = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), turns * 48, w * 0.006, 6, false),
        copper(),
      )
      const former = alongZ(new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.97, radius * 0.97, height * 1.15, 64, 1, true), steel()))
      ;(former.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
      g.add(former, wire)
      break
    }
    case 'part_05_diaphragm': {
      // Ultra ince polimer kubbe ve esnek kenar halkası.
      const dome = new THREE.Mesh(new THREE.SphereGeometry(w * 0.32, 64, 24, 0, Math.PI * 2, 0, 0.62), film())
      dome.rotation.x = Math.PI / 2
      dome.scale.set(1, 0.42, 1)
      dome.position.z = -w * 0.13
      const surround = new THREE.Mesh(new THREE.TorusGeometry(w * 0.32, w * 0.025, 16, 96), film())
      g.add(dome, surround)
      break
    }
    default:
      break
  }
  return g
}
