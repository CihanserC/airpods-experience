# AirPods scroll deneyimi

Kaydırma ilerlemesi GSAP ScrollTrigger ile okunur ve React Three Fiber sahnesine bir ref üzerinden yazılır. Modeller gelene kadar placeholder kutu, kapak ve kulaklıklar aynı zaman çizelgesini oynatır.

## Geliştirme

```bash
npm install
npm run dev
```

## Modeller

8K dokuları `sources/` içinde tutun. Bu klasör yayına girmez. Web çıktısı en fazla 2K (yakın plan 4K) olmalıdır.

Ayrı dosyalar:

```bash
npm run optimize:glb -- sources/case.glb public/models/case.glb
npm run optimize:glb -- sources/lid.glb public/models/lid.glb
npm run optimize:glb -- sources/bud-left.glb public/models/bud-left.glb
npm run optimize:glb -- sources/bud-right.glb public/models/bud-right.glb
```

KTX2 için [KTX-Software `toktx`](https://github.com/KhronosGroup/KTX-Software/releases) PATH üzerinde olmalıdır. Yoksa aynı komuta `--webp` ekleyin; script Draco + 2K WebP yazar.

Tek GLB kullanıyorsanız düğüm adları `case`, `lid`, `budLeft`, `budRight` olmalıdır. Kapak düğümünün orijini menteşe eksenindedir. `public/models/manifest.json` içinde `"mode": "single"` ve `"enabled": true` yapın.

Ayrı GLB’lerde her parça kendi orijininde ortalanır; kapak orijini menteşededir. Sonra `"enabled": true` yapın.

Draco decoder `npm install` ve `npm run build` sırasında `three` paketinden `public/draco/` altına kopyalanır. Sahne bu yerel yolu kullanır.

## Yayın kontrol listesi

- `npm run build` hatasız biter, `dist/` oluşur.
- `public/models/manifest.json` gerçek dosyaları gösterir ve `enabled` doğrudur.
- Ağ panelinde GLB/KTX2 yanıtı `Cache-Control: public, max-age=31536000, immutable` taşır. Cloudflare `public/_headers`, Netlify `netlify.toml` bunu yazar.
- İlk kare placeholder veya hazır mesh ile gelir; ağır GLB `Suspense` arkasındadır.
- `prefers-reduced-motion: reduce` açıkken sayfa pinlenmez, kapalı ürün sabit kalır.
- 768px altında kamera Z ve patlatma mesafesi kısalır, piksel oranı 1.5 ile sınırlıdır.
- Statik host olarak Netlify veya Cloudflare Pages kullanın. `dist` klasörünü yayınlayın.
