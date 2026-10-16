# AURAL AI · Sound Redefined

**Canlı:** https://cihanserc.github.io/airpods-experience/

Kaydırdıkça açılan bir TWS kulaklık lansman sayfası. Kutu kapalı başlar, kapak açılır, kulaklıklar havalanır, sağ kulaklık katman katman patlatılır, sonra birleşip 360° döner.

**Teknoloji:** React 19 + Vite, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, GSAP + ScrollTrigger, Lenis, Tailwind CSS 4, lucide-react.

## Geliştirme

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # üretim çıktısını yerelde dener
```

## Model

Sahne `/public/models/tws_earbuds.glb` dosyasını `useGLTF` ile (Draco) yükler ve şu düğüm adlarını bekler:

| Düğüm | Ne |
| --- | --- |
| `case_body` | Kutu gövdesi |
| `case_lid` | Kutu kapağı |
| `earbud_L`, `earbud_R` | Sol ve sağ kulaklık |
| `part_01_shell` … `part_05_diaphragm` | İsteğe bağlı iç katmanlar (patlatılmış görünüm) |

Elimizdeki kaynak modelde düğüm adları rastgele ve iç katmanlar yok. Bu yüzden:

- `npm run prepare:model` kaynak GLB'deki düğümleri yukarıdaki adlarla yeniden adlandırıp `public/models/tws_earbuds.glb` yazar. Varsayılan girdi `sources/product.glb` (git'e girmez). Yeni bir model gelirse `scripts/prepare-model.mjs` içindeki `RENAME` tablosunu güncelleyin; `--inspect` yalnızca eşleşmeleri ve sınır kutularını yazdırır.
- Model "açık" pozda gelir (kapak ~115° açık, kulaklıklar havada). `src/three/product/buildFromGltf.ts` kapağı kapatıp gövdenin dış duvarına oturtur, menteşeyi arka üst kenara koyar, kulaklıkları kutunun içine indirir ve her şeyi kapalı kutunun merkezine göre normalize eder.
- `part_01_shell` sağ kulaklığın kendi mesh'idir (şeffaflaşır). Diğer dört katman modelde yoksa `src/three/product/driverStack.ts` bunları kodda üretir: mikrofon kartı, neodyum mıknatıs, bakır ses bobini, polimer diyafram. Model bu adlarla iç parça içerirse onlar kullanılır.
- GLB yüklenemezse `buildFallback.ts` aynı yapıyı yuvarlatılmış ilkel geometrilerle kurar; koreografi aynen çalışır.

Ham dokular ve FBX `resources/` altında durur. Ağır master dosyalar `sources/` içinde tutulur ve yayına girmez. Dokuları sıkıştırmak için `npm run optimize:glb -- girdi.glb çıktı.glb` kullanılabilir.

## Kaydırma koreografisi

Tek bir GSAP zaman çizelgesi (`src/scroll/useStoryTimeline.ts`) sahneyi ScrollTrigger ile 5.5 ekran boyunca pinler ve scrub eder. Aynı çizelge hem 3D durumu (`src/lib/anim.ts`) hem DOM katmanlarını sürer; kaydırma sırasında hiçbir React bileşeni yeniden render olmaz.

| Kaydırma | Olan |
| --- | --- |
| %0 | Kapalı kutu, loş stüdyo ışığı, "SOUND / REDEFINED" ürünün arkasında |
| ~%25 | Kapak 90° açılır, kulaklıklar süzülerek yükselir, kutu loşlaşıp geri çekilir ve silikleşir |
| %50…%75 | Sağ kulaklık odakta, kabuk şeffaflaşır, beş katman Z ekseninde sırayla açılır, her birine HUD kartı bağlanır |
| %100 | Katmanlar birleşir, 360° dönüş, "Pre-Order Now" ve "Explore Specs" |

Kamera pozları zaman çizelgesindeki `cameras` nesnesinde, kulaklık pozları `src/three/product/poses.ts` içindedir.

## Dosyalar

```
src/
  content.ts               bütün metinler (hero, bölümler, HUD kartları, özellikler)
  lib/                     anim durumu, Lenis, HUD köprüsü, viewport
  scroll/                  GSAP zaman çizelgesi
  three/                   Canvas, ışık, efektler, kamera, HUD izdüşümü
  three/product/           GLB ayrıştırma, yedek geometri, iç katmanlar, malzemeler, pozlar
  ui/                      Nav, pinlenmiş sahne, HUD, bölümler, yükleme ekranı
scripts/prepare-model.mjs  düğüm adlarını sahnenin beklediği adlara çevirir
```

## Performans ve erişilebilirlik

- Piksel oranı `Math.min(devicePixelRatio, 2)`; mobilde bloom hafif, multisampling kapalı.
- Yansıma ortamı Lightformer'larla kodda üretilir, ağdan HDR indirilmez.
- three ve R3F ayrı parçalarda (manualChunks) önbelleğe alınır.
- Dar ekranlarda kamera otomatik geri çekilir; dikey ekranda odak sahnesi HUD kartına yer açmak için hafifçe yukarı kayar.
- `prefers-reduced-motion: reduce`: pin ve animasyon yok, kapalı ürün ve CTA sabit görünür, Lenis kapalı.
- Ürün bir tasarım konseptidir; "Pre-Order" bölümü sipariş almaz ve bunu açıkça yazar.

## Yayın

- **GitHub Pages:** `master`'a her push'ta `.github/workflows/pages.yml` derleyip yayınlar. Site `/airpods-experience/` alt yolunda çalıştığı için iş akışı `BASE_PATH` verir; model ve Draco yolları `import.meta.env.BASE_URL` ile kurulur. Yerelde aynı çıktıyı denemek için: `BASE_PATH=/airpods-experience/ npm run build && BASE_PATH=/airpods-experience/ npm run preview` (Git Bash'te başına `MSYS_NO_PATHCONV=1` ekleyin).
- **Netlify** (`netlify.toml`) ya da **Cloudflare Pages** (`public/_headers`): kök yolda yayınlanır, `BASE_PATH` gerekmez. GLB ve Draco dosyaları bir yıl önbelleğe alınır.
