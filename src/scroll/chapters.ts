export type ChapterId = 'hero' | 'lid' | 'buds' | 'exploded' | 'cta'

export type Chapter = {
  id: ChapterId
  from: number
  to: number
  eyebrow: string
  title: string
  body: string
}

export const chapters: Chapter[] = [
  {
    id: 'hero',
    from: 0,
    to: 0.18,
    eyebrow: 'Ürün',
    title: 'AirPods 4.',
    body: 'Aşağı kaydır. Kapak, kulaklıklar ve kutu sırayla birbirinden ayrılır.',
  },
  {
    id: 'lid',
    from: 0.18,
    to: 0.38,
    eyebrow: 'Kapak',
    title: 'Menteşe açılır.',
    body: 'Kapak, arkadaki eksen etrafında döner.',
  },
  {
    id: 'buds',
    from: 0.38,
    to: 0.58,
    eyebrow: 'Kulaklıklar',
    title: 'İçeriden yükselir.',
    body: 'İki kulaklık kutunun içinden yukarı çıkar.',
  },
  {
    id: 'exploded',
    from: 0.58,
    to: 0.85,
    eyebrow: 'Patlatılmış görünüm',
    title: 'Her parça ayrı.',
    body: 'Kutu, kapak ve kulaklıklar birbirinden ayrılır.',
  },
  {
    id: 'cta',
    from: 0.85,
    to: 1.01,
    eyebrow: 'Yeniden',
    title: 'Tek parça.',
    body: 'Kaydırmanın sonunda ürün yeniden toplanır.',
  },
]

export function activeChapterId(progress: number): ChapterId {
  const chapter = chapters.find((item) => progress >= item.from && progress < item.to)
  return chapter?.id ?? 'cta'
}
