import { useGLTF } from '@react-three/drei'
import { useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { NoColorSpace, SRGBColorSpace } from 'three'
import { usePartRefs } from '../experience/usePartRefs'
import { useProductPose } from '../experience/useProductPose'

const MODEL_URL = '/models/product.glb'
const DRACO_PATH = '/draco/'
const TARGET_WIDTH = 1.15

const partNodes = {
  lid: 'nJoEOlgGwcdXBHJ',
  budLeft: 'oTgukKFHsbAaGBa',
  budRight: 'MSpBhwzeYpJKGDV',
} as const

useGLTF.preload(MODEL_URL, DRACO_PATH)

export function prepareMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      const mat = material as THREE.MeshStandardMaterial
      tuneMap(mat.map, true)
      tuneMap(mat.metalnessMap, false)
      tuneMap(mat.roughnessMap, false)
      tuneMap(mat.normalMap, false)
      tuneMap(mat.aoMap, false)
    }
  })
}

function tuneMap(map: THREE.Texture | null | undefined, albedo: boolean) {
  if (!map) return
  map.colorSpace = albedo ? SRGBColorSpace : NoColorSpace
  if (albedo) map.anisotropy = 8
}

function detach(node: THREE.Object3D) {
  node.updateWorldMatrix(true, false)
  const wrapper = new THREE.Group()
  wrapper.name = node.name
  wrapper.matrix.copy(node.matrixWorld)
  wrapper.matrix.decompose(wrapper.position, wrapper.quaternion, wrapper.scale)
  node.removeFromParent()
  node.position.set(0, 0, 0)
  node.quaternion.identity()
  node.scale.set(1, 1, 1)
  wrapper.add(node)
  return wrapper
}

function takePart(root: THREE.Object3D, name: string) {
  const node = root.getObjectByName(name)
  if (!node) {
    console.warn(`Mesh bulunamadı: ${name}`)
    return new THREE.Group()
  }
  return detach(node)
}

function hingeLid(root: THREE.Object3D) {
  const wrapper = takePart(root, partNodes.lid)
  wrapper.updateWorldMatrix(true, false)
  const box = new THREE.Box3().setFromObject(wrapper)
  const hingePoint = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, box.min.z)
  const pivot = new THREE.Group()
  pivot.name = 'lid-hinge'
  pivot.position.copy(hingePoint)
  wrapper.position.sub(hingePoint)
  pivot.add(wrapper)
  return pivot
}

function centerParts(parts: THREE.Object3D[]) {
  const bounds = new THREE.Box3()
  for (const part of parts) bounds.expandByObject(part)
  const center = bounds.getCenter(new THREE.Vector3())
  for (const part of parts) part.position.sub(center)
}

function splitProduct(source: THREE.Object3D) {
  const root = source.clone(true)
  prepareMaterials(root)
  root.updateMatrixWorld(true)
  const width = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).x
  root.scale.setScalar(TARGET_WIDTH / Math.max(width, 0.0001))
  root.updateMatrixWorld(true)

  const lid = hingeLid(root)
  const budLeft = takePart(root, partNodes.budLeft)
  const budRight = takePart(root, partNodes.budRight)
  const caseGroup = new THREE.Group()
  caseGroup.name = 'case'
  caseGroup.add(root)
  centerParts([caseGroup, lid, budLeft, budRight])
  return { case: caseGroup, lid, budLeft, budRight }
}

type ModelProps = {
  progress: MutableRefObject<number>
  mobile: boolean
}

export function SingleProduct({ progress, mobile }: ModelProps) {
  const refs = usePartRefs()
  const gltf = useGLTF(MODEL_URL, DRACO_PATH)
  const parts = useMemo(() => splitProduct(gltf.scene), [gltf.scene])
  useProductPose(progress, mobile, refs)

  return (
    <group>
      <primitive ref={refs.case} object={parts.case} />
      <primitive ref={refs.lid} object={parts.lid} />
      <primitive ref={refs.budLeft} object={parts.budLeft} />
      <primitive ref={refs.budRight} object={parts.budRight} />
    </group>
  )
}
