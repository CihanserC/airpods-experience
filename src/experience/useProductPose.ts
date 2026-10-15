import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react'
import * as THREE from 'three'
import { sample } from '../scroll/stages'

export type PartRefs = {
  case: RefObject<THREE.Group | null>
  lid: RefObject<THREE.Group | null>
  budLeft: RefObject<THREE.Group | null>
  budRight: RefObject<THREE.Group | null>
}

type RestPose = {
  case: THREE.Vector3
  lid: THREE.Vector3
  lidQuat: THREE.Quaternion
  budLeft: THREE.Vector3
  budRight: THREE.Vector3
}

const spin = new THREE.Quaternion()
const hinge = new THREE.Vector3(1, 0, 0)

export function useProductPose(
  progress: MutableRefObject<number>,
  mobile: boolean,
  refs: PartRefs,
) {
  const rest = useRef<RestPose | null>(null)

  useLayoutEffect(() => {
    const lid = refs.lid.current
    rest.current = {
      case: refs.case.current?.position.clone() ?? new THREE.Vector3(),
      lid: lid?.position.clone() ?? new THREE.Vector3(),
      lidQuat: lid?.quaternion.clone() ?? new THREE.Quaternion(),
      budLeft: refs.budLeft.current?.position.clone() ?? new THREE.Vector3(),
      budRight: refs.budRight.current?.position.clone() ?? new THREE.Vector3(),
    }
    // Dinlenme pozu yalnızca ilk yerleşimde okunur; sonraki kareler ofset ekler.
  }, [refs.budLeft, refs.budRight, refs.case, refs.lid])

  useFrame(() => {
    const base = rest.current
    if (!base) return
    const pose = sample(progress.current, mobile)

    refs.case.current?.position.copy(base.case).add(pose.caseDelta)
    refs.budLeft.current?.position.copy(base.budLeft).add(pose.budLeftDelta)
    refs.budRight.current?.position.copy(base.budRight).add(pose.budRightDelta)

    const lid = refs.lid.current
    if (!lid) return
    spin.setFromAxisAngle(hinge, pose.lidAngle)
    lid.position.copy(base.lid).add(pose.lidDelta)
    lid.quaternion.copy(base.lidQuat).multiply(spin)
  })
}
