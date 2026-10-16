// Kaynak GLB'deki rastgele düğüm adlarını sahnenin beklediği adlarla değiştirir ve
// public/models/tws_earbuds.glb olarak yazar (Draco sıkıştırması korunur).
//
//   npm run prepare:model -- [girdi.glb] [çıktı.glb] [--inspect]
//   (varsayılan girdi: sources/product.glb, git'e girmez)
//
// Beklenen adlar: case_body, case_lid, earbud_L, earbud_R. İç parçalar
// (part_01_shell … part_05_diaphragm) modelde varsa onlar kullanılır; yoksa sahne
// bunları kodda üretir. Yeni bir model gelirse yalnızca RENAME tablosunu güncelleyin.
import { NodeIO, getBounds } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

const RENAME = {
  PxcMCoFCCTCdsTC: 'case_body',
  nJoEOlgGwcdXBHJ: 'case_lid',
  oTgukKFHsbAaGBa: 'earbud_L',
  MSpBhwzeYpJKGDV: 'earbud_R',
}

const args = process.argv.slice(2)
const inspect = args.includes('--inspect')
const [input = 'sources/product.glb', output = 'public/models/tws_earbuds.glb'] = args.filter(a => !a.startsWith('--'))

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  })

const doc = await io.read(input)
const nodes = doc.getRoot().listNodes()
const fmt = v => v.map(n => n.toFixed(4)).join(', ')

let renamed = 0
for (const node of nodes) {
  const target = RENAME[node.getName()]
  if (!target) continue
  const { min, max } = getBounds(node)
  console.log(`${node.getName()} -> ${target}  min[${fmt(min)}] max[${fmt(max)}]`)
  if (!inspect) node.setName(target)
  renamed += 1
}

if (renamed !== Object.keys(RENAME).length) {
  console.error(`Beklenen ${Object.keys(RENAME).length} düğümden ${renamed} tanesi bulundu.`)
  process.exit(1)
}

if (!inspect) {
  await io.write(output, doc)
  console.log(`Yazıldı: ${output}`)
}
