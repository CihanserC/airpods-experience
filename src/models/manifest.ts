export type PartName = 'case' | 'lid' | 'budLeft' | 'budRight'

export type ProductManifest = {
  enabled: boolean
  mode: 'separate' | 'single'
  draco: string
  parts: Record<PartName, string>
  single: string
  meshNames: Record<PartName, string>
}

export const partNames: PartName[] = ['case', 'lid', 'budLeft', 'budRight']

export async function fetchManifest(): Promise<ProductManifest> {
  const response = await fetch('/models/manifest.json')
  if (!response.ok) throw new Error('manifest.json okunamadı')
  return response.json() as Promise<ProductManifest>
}
