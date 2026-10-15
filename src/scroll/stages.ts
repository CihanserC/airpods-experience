import * as THREE from 'three'

export type Vec3 = readonly [number, number, number]

export type Stage = {
  at: number
  camera: Vec3
  target: Vec3
  /** 0 kapalı, 1 tamamen açık */
  lid: number
  /** 0 kutu içinde, 1 yükselmiş */
  buds: number
  /** 0 toplanmış, 1 patlatılmış */
  explode: number
}

export const stages: Stage[] = [
  {
    at: 0,
    camera: [0, 0.35, 4.2],
    target: [0, 0.05, 0],
    lid: 0,
    buds: 0,
    explode: 0,
  },
  {
    at: 0.22,
    camera: [0.55, 0.72, 3.15],
    target: [0, 0.18, 0],
    lid: 1,
    buds: 0,
    explode: 0,
  },
  {
    at: 0.45,
    camera: [1.05, 0.95, 2.85],
    target: [0, 0.32, 0],
    lid: 1,
    buds: 1,
    explode: 0,
  },
  {
    at: 0.7,
    camera: [1.55, 1.15, 3.45],
    target: [0, 0.22, 0],
    lid: 1,
    buds: 1,
    explode: 1,
  },
  {
    at: 1,
    camera: [0.15, 0.42, 3.7],
    target: [0, 0.08, 0],
    lid: 0.12,
    buds: 0,
    explode: 0,
  },
]

const LID_OPEN_X = -1.15

export type Segment = {
  from: Stage
  to: Stage
  t: number
}

export type Pose = {
  lidAngle: number
  caseDelta: THREE.Vector3
  lidDelta: THREE.Vector3
  budLeftDelta: THREE.Vector3
  budRightDelta: THREE.Vector3
}

const pose: Pose = {
  lidAngle: 0,
  caseDelta: new THREE.Vector3(),
  lidDelta: new THREE.Vector3(),
  budLeftDelta: new THREE.Vector3(),
  budRightDelta: new THREE.Vector3(),
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function segmentAt(progress: number): Segment {
  const p = clamp01(progress)
  let index = 0
  while (index < stages.length - 2 && stages[index + 1].at < p) index += 1
  const from = stages[index]
  const to = stages[Math.min(index + 1, stages.length - 1)]
  const span = to.at - from.at || 1
  return { from, to, t: clamp01((p - from.at) / span) }
}

/** Parça ofsetleri. Dönen nesne bir sonraki çağrıda yeniden yazılır. */
export function sample(progress: number, mobile: boolean): Pose {
  const { from, to, t } = segmentAt(progress)
  const lid = THREE.MathUtils.lerp(from.lid, to.lid, t)
  const buds = THREE.MathUtils.lerp(from.buds, to.buds, t)
  const explode = THREE.MathUtils.lerp(from.explode, to.explode, t) * (mobile ? 0.65 : 1)

  pose.lidAngle = lid * LID_OPEN_X
  pose.caseDelta.set(0, -0.22 * explode, 0)
  pose.lidDelta.set(0, 1.05 * explode, -0.5 * explode)
  pose.budLeftDelta.set(-0.95 * explode, 0.62 * buds + 0.55 * explode, 0)
  pose.budRightDelta.set(0.95 * explode, 0.62 * buds + 0.55 * explode, 0)
  return pose
}
