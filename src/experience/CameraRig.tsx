import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { segmentAt, type Stage } from '../scroll/stages'

type CameraRigProps = {
  progress: MutableRefObject<number>
  mobile: boolean
}

const fromPosition = new THREE.Vector3()
const toPosition = new THREE.Vector3()
const fromQuaternion = new THREE.Quaternion()
const toQuaternion = new THREE.Quaternion()
const lookCamera = new THREE.PerspectiveCamera()

function placeCamera(stage: Stage, mobile: boolean, out: THREE.Vector3) {
  out.set(stage.camera[0], stage.camera[1], mobile ? stage.camera[2] * 0.82 : stage.camera[2])
  return out
}

function lookQuaternion(position: THREE.Vector3, target: Stage['target'], out: THREE.Quaternion) {
  lookCamera.position.copy(position)
  lookCamera.up.set(0, 1, 0)
  lookCamera.lookAt(target[0], target[1], target[2])
  return out.copy(lookCamera.quaternion)
}

export function CameraRig({ progress, mobile }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const ready = useRef(false)

  useFrame(() => {
    const { from, to, t } = segmentAt(progress.current)
    placeCamera(from, mobile, fromPosition)
    placeCamera(to, mobile, toPosition)
    lookQuaternion(fromPosition, from.target, fromQuaternion)
    lookQuaternion(toPosition, to.target, toQuaternion)

    if (!ready.current) {
      camera.position.copy(fromPosition)
      camera.quaternion.copy(fromQuaternion)
      ready.current = true
    }

    camera.position.lerpVectors(fromPosition, toPosition, t)
    camera.quaternion.copy(fromQuaternion).slerp(toQuaternion, t)
  })

  return null
}
