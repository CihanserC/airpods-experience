import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb', '**/*.ktx2', '**/*.wasm'],
  build: {
    assetsInlineLimit: 0,
    // three (~180 KB gzip) ve R3F/postprocessing (~190 KB gzip) bilinçli olarak ayrı parçalar;
    // uygulama kodundan bağımsız önbelleğe alınırlar. Uyarı eşiği buna göre.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // three ve postprocessing büyük; uygulama kodundan ayrı önbelleğe alınsın.
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
})
