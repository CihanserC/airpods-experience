// Sayfadaki bütün metinler. Tasarım bileşenleri yalnızca bu dosyayı okur.
import type { LucideIcon } from 'lucide-react'
import { AudioLines, BatteryCharging, Bluetooth, Droplets, Feather, Timer, Disc3, Zap } from 'lucide-react'

export const brand = {
  name: 'AURAL AI',
  product: 'Aural One',
  tagline: ['SOUND', 'REDEFINED'] as const,
  intro: 'Adaptive true wireless earbuds tuned by an on-device model that listens to the room before you do.',
}

export type Chapter = { id: string; index: string; title: string; body: string }

/** Pinlenmiş sahnedeki bölüm başlıkları (sol alt köşe). */
export const chapters: Chapter[] = [
  { id: 'open', index: '01', title: 'Open', body: 'The lid lifts on a damped titanium hinge.' },
  { id: 'rise', index: '02', title: 'Rise', body: 'Magnetic cradles release both buds at once.' },
  { id: 'inside', index: '03', title: 'Inside', body: 'Five layers, one acoustic path.' },
  { id: 'whole', index: '04', title: 'Whole', body: 'Reassembled to a 0.1 mm tolerance.' },
]

export type PartInfo = {
  /** GLB'deki düğüm adı; modelde yoksa parça kodda üretilir. */
  node: 'part_01_shell' | 'part_02_mic' | 'part_03_magnet' | 'part_04_coil' | 'part_05_diaphragm'
  index: string
  title: string
  detail: string
  stat: string
}

/** Patlatılmış görünümde sırayla açılan katmanlar ve HUD kartlarının metni. */
export const parts: PartInfo[] = [
  {
    node: 'part_01_shell',
    index: '01',
    title: 'Transparent Outer Shell',
    detail: 'Optical-grade polycarbonate with a 0.6 mm wall.',
    stat: '4.9 g',
  },
  {
    node: 'part_02_mic',
    index: '02',
    title: 'Dual Noise-Canceling Mic Array',
    detail: 'Two beamforming mics isolate your voice from wind.',
    stat: '-42 dB',
  },
  {
    node: 'part_03_magnet',
    index: '03',
    title: '11mm Neodymium Driver',
    detail: 'N52 magnet assembly with a 1.4 T flux gap.',
    stat: '1.4 T',
  },
  {
    node: 'part_04_coil',
    index: '04',
    title: 'Copper Voice Coil',
    detail: 'Copper-clad aluminium wire, 32 µm, for fast transients.',
    stat: '32 µm',
  },
  {
    node: 'part_05_diaphragm',
    index: '05',
    title: 'Ultra-thin Polymer Diaphragm',
    detail: 'A 9 µm LCP film that stays rigid up to 40 kHz.',
    stat: '9 µm',
  },
]

export type Spec = { icon: LucideIcon; label: string; value: string; note: string }

export const specs: Spec[] = [
  { icon: AudioLines, label: 'Noise cancelling', value: '-42 dB', note: 'Adaptive, re-tuned 200 times per second' },
  { icon: Disc3, label: 'Driver', value: '11 mm', note: 'Neodymium, LCP diaphragm' },
  { icon: BatteryCharging, label: 'Battery', value: '36 h', note: '8 h per charge, 28 h more in the case' },
  { icon: Zap, label: 'Charging', value: 'USB-C · Qi2', note: '5 minutes for 1 hour of playback' },
  { icon: Bluetooth, label: 'Connectivity', value: 'BT 5.4', note: 'LE Audio, multipoint' },
  { icon: Timer, label: 'Latency', value: '40 ms', note: 'Game mode' },
  { icon: Droplets, label: 'Resistance', value: 'IP55', note: 'Sweat, rain and dust' },
  { icon: Feather, label: 'Weight', value: '4.9 g', note: 'Per earbud' },
]

export const preorder = {
  price: '$249',
  finishes: [
    { id: 'graphite', name: 'Graphite', swatch: 'linear-gradient(135deg,#5b5f66,#22252a)' },
    { id: 'lunar', name: 'Lunar Silver', swatch: 'linear-gradient(135deg,#f1f2f4,#9ea2a9)' },
  ],
  shipping: 'Ships spring 2027',
  disclaimer: 'Aural One is a design concept. Pre-orders are not open yet.',
}
