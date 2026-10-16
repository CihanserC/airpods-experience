// GLB yüklenemezse aynı ProductParts yapısını yuvarlatılmış ilkel geometrilerle kurar.
// Ölçüler gerçek modelin normalize hâline yakındır, böylece zaman çizelgesi aynen çalışır.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { finish } from './materials'
import { PRODUCT_WIDTH, type BudRig, type ProductParts } from './types'

const W = PRODUCT_WIDTH
const BODY_H = 0.74
const LID_H = 0.33
const DEPTH = 0.49

function metal(color: THREE.Color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: finish.roughness, metalness: finish.metalness })
  mat.userData.baseColor = mat.color.clone()
  mat.userData.baseOpacity = 1
  return mat
}

export function buildFallback(): ProductParts {
  const top = (BODY_H + LID_H) / 2
  const bodyTop = top - LID_H

  const caseMat = metal(finish.case)
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, BODY_H, DEPTH, 6, 0.16), caseMat)
  body.position.y = bodyTop - BODY_H / 2

  const lidMat = metal(finish.case)
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, LID_H, DEPTH, 6, 0.14), lidMat)
  const lidPivot = new THREE.Group()
  lidPivot.position.set(0, bodyTop, -DEPTH / 2)
  lid.position.set(0, LID_H / 2, DEPTH / 2)
  lidPivot.add(lid)

  const caseGroup = new THREE.Group()
  caseGroup.add(body, lidPivot)

  const root = new THREE.Group()
  root.add(caseGroup)

  const budL = makeBud(-0.24, bodyTop, root)
  const budR = makeBud(0.24, bodyTop, root)

  return {
    root,
    caseGroup,
    lidPivot,
    caseMaterials: [caseMat, lidMat],
    budL,
    budR,
    internals: {},
    budHead: new THREE.Vector3(0, 0.17, 0),
    budSize: new THREE.Vector3(0.36, 0.66, 0.36),
    floorY: -top,
    source: 'fallback',
  }
}

/** Küresel baş + kapsül sap; tepe kutunun ağzının hemen altında. */
function makeBud(x: number, bodyTop: number, root: THREE.Group): BudRig {
  const mat = metal(finish.bud)
  const shell = new THREE.Group()
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 48, 32), mat)
  head.position.y = 0.16
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 8, 24), mat)
  stem.position.y = -0.12
  stem.rotation.z = x < 0 ? -0.08 : 0.08
  shell.add(head, stem)

  const rig = new THREE.Group()
  const restPosition = new THREE.Vector3(x, bodyTop - 0.34, 0)
  rig.position.copy(restPosition)
  rig.add(shell)
  root.add(rig)
  return { rig, shell, restPosition, materials: [mat] }
}
