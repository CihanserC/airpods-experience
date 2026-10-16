// Kulaklıkların ve kutunun anahtar pozları (normalize birim, radyan).
// Zaman çizelgesi 0…1 değerler üretir; bu pozlar arasındaki geçişi Product uygular.
import * as THREE from 'three'

type Pose = { position: THREE.Vector3; quaternion: THREE.Quaternion }

const pose = (p: [number, number, number], r: [number, number, number]): Pose => ({
  position: new THREE.Vector3(...p),
  quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),
})

export const poses = {
  /** Kutudan çıkıp havada, kameraya doğru süzülmüş hâl. */
  riseL: pose([-0.38, 0.72, 0.55], [0.12, 0.5, 0.14]),
  riseR: pose([0.38, 0.72, 0.55], [0.12, -0.5, -0.14]),
  /** Sağ kulaklık sahnenin ortasında, patlatılmış görünüm için. */
  focusR: pose([0, 0.42, 0.95], [0.08, -0.95, 0.05]),
  /** Sol kulaklık odaktan çıkar. */
  exitL: pose([-2.1, 1.25, -0.6], [0.4, 1.4, 0.5]),
  /** Kutu geri çekilip aşağı iner. */
  caseBack: new THREE.Vector3(0, -0.35, -1.25),
  caseBackScale: 0.9,
}

export const restQuaternion = new THREE.Quaternion()
