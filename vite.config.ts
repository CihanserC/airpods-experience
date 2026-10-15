import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.ktx2', '**/*.wasm'],
  build: {
    assetsInlineLimit: 0,
  },
})
