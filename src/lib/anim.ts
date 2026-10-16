// Kaydırma ile 3D sahne arasındaki tek köprü.
// GSAP zaman çizelgesi bu nesnenin sayılarını tween'ler; sahne her karede okur.
// React state kullanılmaz: kaydırma sırasında hiçbir bileşen yeniden render olmaz.

export type Vec3 = [number, number, number]

export const anim = {
  /** 0 kapalı, 1 kapak 90° açık */
  lid: 0,
  /** 0 kulaklıklar kutuda, 1 havada ve kameraya yakın */
  rise: 0,
  /** 0 kutu tam görünür, 1 geride ve silik */
  caseDim: 0,
  /** 0 iki kulaklık yan yana, 1 sağ kulaklık odakta (sol uzaklaşır) */
  focus: 0,
  /** Sağ kulaklığın kabuğu: 0 opak, 1 şeffaf */
  shell: 0,
  /** Katmanların patlatma oranı (part_01 … part_05) */
  explode: [0, 0, 0, 0, 0],
  /** 0…1 = 0…360° dönüş */
  spin: 0,
  /** Kamera konumu ve baktığı nokta */
  cam: { px: 0, py: 0.18, pz: 4.6, tx: 0, ty: 0, tz: 0 },
}

export type Anim = typeof anim

/** Kapalı kutu, kahraman (hero) kamerası. Hareket azaltma tercihinde de bu poz kullanılır. */
export function resetAnim() {
  anim.lid = 0
  anim.rise = 0
  anim.caseDim = 0
  anim.focus = 0
  anim.shell = 0
  anim.explode.fill(0)
  anim.spin = 0
  Object.assign(anim.cam, heroCamera)
}

export const heroCamera = { px: 0, py: 0.18, pz: 4.6, tx: 0, ty: 0, tz: 0 }
