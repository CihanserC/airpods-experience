import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, draco, prune, textureCompress } from '@gltf-transform/functions'
import * as draco3d from 'draco3dgltf'
import sharp from 'sharp'

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const input = positional[0]
const output = positional[1]
const sizeFlag = process.argv.find((arg) => arg.startsWith('--size='))
const size = sizeFlag ? Number(sizeFlag.split('=')[1]) : 2048
const forceWebp = process.argv.includes('--webp')

if (!input || !output || !Number.isFinite(size) || size < 256) {
  console.error('Kullanım: node scripts/optimize-glb.mjs input.glb output.glb [--size=2048] [--webp]')
  console.error('Varsayılan: Draco mesh + KTX2 doku. 8K kaynak sources/ içinde kalır.')
  console.error('Yakın plan için --size=4096. toktx yoksa --webp 2K WebP + Draco yazar.')
  process.exit(1)
}

if (!forceWebp) {
  const result = spawnSync(
    'npx',
    [
      '--no-install',
      'gltf-transform',
      'optimize',
      input,
      output,
      '--compress',
      'draco',
      '--texture-compress',
      'ktx2',
      '--texture-size',
      String(size),
    ],
    { stdio: 'inherit', shell: true },
  )
  if (result.status === 0) {
    console.log(`KTX2 + Draco yazıldı: ${output} (maks doku ${size}px)`)
    process.exit(0)
  }
  console.warn('KTX2 tamamlanamadı. KTX-Software toktx gerekli: https://github.com/KhronosGroup/KTX-Software/releases')
  console.warn('WebP + Draco yedeği üretiliyor.')
}

const moduleApi = draco3d.default ?? draco3d
const io = new NodeIO()
  .registerExtensions(KHRONOS_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await moduleApi.createDecoderModule(),
    'draco3d.encoder': await moduleApi.createEncoderModule(),
  })

const document = await io.read(resolve(input))
await document.transform(
  dedup(),
  prune(),
  textureCompress({
    encoder: sharp,
    targetFormat: 'webp',
    resize: [size, size],
  }),
  draco(),
)

mkdirSync(dirname(resolve(output)), { recursive: true })
await io.write(resolve(output), document)
console.log(`WebP + Draco yazıldı: ${output} (maks doku ${size}px). Yayın için KTX2 tercih edilir.`)
