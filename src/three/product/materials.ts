import * as THREE from 'three'

/** Metalik PBR yüzey: roughness 0.15, metalness 0.85. */
export const finish = {
  roughness: 0.15,
  metalness: 0.85,
  case: new THREE.Color('#5d6169'),
  bud: new THREE.Color('#eceef1'),
}

/**
 * Mesh'lerin malzemelerini kopyalar (her parça kendi başına silikleşebilsin diye) ve
 * açık renkli gövde yüzeylerine metalik PBR kaplama uygular. Koyu iç parçalar (ızgara,
 * conta) kendi rengini korur, yalnızca biraz daha mat yapılır. Doku haritaları kalır.
 */
export function adoptMaterials(root: THREE.Object3D, tint: THREE.Color): THREE.Material[] {
  const out: THREE.Material[] = []
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = false
    mesh.receiveShadow = false
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const cloned = source.map((m) => tune(m.clone() as THREE.MeshStandardMaterial, tint))
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]
    out.push(...cloned)
  })
  return out
}

function tune(mat: THREE.MeshStandardMaterial, tint: THREE.Color) {
  if (!('roughness' in mat)) return mat
  if (mat.map) {
    mat.map.colorSpace = THREE.SRGBColorSpace
    mat.map.anisotropy = 8
  }
  for (const map of [mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap]) {
    if (map) map.colorSpace = THREE.NoColorSpace
  }

  const hsl = { h: 0, s: 0, l: 0 }
  mat.color.getHSL(hsl)
  const isBody = hsl.l > 0.55 && !mat.map && !mat.emissiveMap
  if (isBody) {
    mat.color.copy(tint)
    mat.roughness = finish.roughness
    mat.metalness = finish.metalness
  } else {
    mat.roughness = Math.max(mat.roughness, 0.35)
    mat.metalness = Math.min(Math.max(mat.metalness, 0.2), 0.6)
  }
  mat.envMapIntensity = 1
  mat.userData.baseColor = mat.color.clone()
  mat.userData.baseOpacity = mat.opacity
  return mat
}

/**
 * Parçayı silikleştirir: opacity 1 → hedef, renk siyaha doğru koyulaşır.
 * Şeffaflık açıkken derinlik yazımı kapanır ki arkadaki parçalar görünsün.
 */
export function setFade(materials: THREE.Material[], opacity: number, darken = 0) {
  const transparent = opacity < 0.995
  for (const material of materials) {
    const mat = material as THREE.MeshStandardMaterial
    mat.opacity = (mat.userData.baseOpacity ?? 1) * opacity
    mat.transparent = transparent
    mat.depthWrite = !transparent
    const base = mat.userData.baseColor as THREE.Color | undefined
    if (base && 'color' in mat) mat.color.copy(base).multiplyScalar(1 - darken)
  }
}
