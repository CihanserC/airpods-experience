import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const strict = process.argv.includes('--strict')
const require = createRequire(import.meta.url)
const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']

let source = ''
try {
  source = dirname(
    require.resolve('three/examples/jsm/libs/draco/gltf/draco_decoder.wasm'),
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  if (strict) {
    console.error(message)
    process.exit(1)
  }
  console.warn('three yüklü değil, Draco kopyası atlandı.')
  process.exit(0)
}

const dest = join(process.cwd(), 'public', 'draco')
mkdirSync(dest, { recursive: true })

for (const file of files) {
  const from = join(source, file)
  if (!existsSync(from)) {
    const message = `Eksik Draco dosyası: ${from}`
    if (strict) {
      console.error(message)
      process.exit(1)
    }
    console.warn(message)
    process.exit(0)
  }
  cpSync(from, join(dest, file))
}

console.log('Draco decoder public/draco altına kopyalandı.')
