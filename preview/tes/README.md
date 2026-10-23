# Banner Editor (GrapesJS, terkunci)

Editor banner HTML5 untuk pembeli template. Pembeli hanya bisa mengubah 6 field
(headline, subheadline, teks CTA, gambar utama, logo, URL landing page), lalu
mengekspor ZIP untuk **Google Ads** atau **The Trade Desk**.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build produksi ke /dist
```

## Struktur

```
src/
  editor/
    EditorCanvas.tsx     inisialisasi GrapesJS (tanpa UI bawaan) + pengunci komponen
    SidePanel.tsx        panel kustom 6 field
    useGrapesEditor.ts   hook: init, update teks/gambar/URL, highlight
    editorUtils.ts       pencari komponen berdasarkan data-editable
    compressImage.ts     aturan kompresi gambar (hero ≤ 80 KB, logo ≤ 20 KB)
  template/
    bannerTemplate.ts    HTML template 300x250 + placeholder + batas teks
    clickTag.ts          script clickTag (Google) / clickTAG (Trade Desk)
  export/
    exportZip.ts         exportForGoogleAds / exportForTradeDesk
    validate.ts          aturan ukuran, URL, clickTag, durasi animasi
  ui/
    App.tsx, ExportButtons.tsx, styles.css
```

## Mengganti template

Edit string `bannerTemplate` di `src/template/bannerTemplate.ts`. Aturannya:

- Elemen yang boleh diedit pembeli wajib punya `data-editable` dengan nilai
  `headline`, `subheadline`, `cta-text`, `hero-image`, atau `logo`.
- URL landing page tidak punya elemen sendiri: disimpan di atribut
  `data-editable-url` pada elemen CTA.
- Elemen lain **tidak** boleh diberi `data-editable`; otomatis terkunci.
- Animasi CSS (keyframes) boleh ditambahkan di tag `<style>` pada template.
  Validator memperingatkan jika durasinya > 30 detik (batas Google Ads).
- Batas panjang teks ada di `TEXT_LIMITS` (agar layout tidak rusak).

## Menambah ukuran banner baru (mis. 728x90)

1. Duplikasi `src/template/bannerTemplate.ts` menjadi, misalnya,
   `bannerTemplate728x90.ts`.
2. Ubah `BANNER_SIZE` menjadi `{ width: 728, height: 90 }` dan sesuaikan
   posisi/ukuran elemen di dalam string template.
3. Di `EditorCanvas.tsx`, `SidePanel.tsx`, dan `exportZip.ts`, ganti import dari
   `../template/bannerTemplate` ke file baru tersebut. (Meta `ad.size` dan ukuran
   kanvas otomatis mengikuti `BANNER_SIZE`.)

## Perilaku ekspor

- **Google Ads** → `banner-google.zip`: `index.html` di root + folder `images/`,
  script `var clickTag = "<URL>"`. Wajib URL valid, ZIP ≤ 150 KB.
- **The Trade Desk** → `banner-ttd.zip`: script `var clickTAG` dibaca dari query
  string. URL di panel diabaikan. ZIP ≤ 10 MB, initial load (HTML + gambar utama) ≤ 300 KB.
- Klik hanya terpasang pada tombol CTA. Untuk membuat seluruh banner bisa diklik,
  ubah `CLICK_TARGET_SELECTOR` di `src/template/clickTag.ts` menjadi `'#banner-root'`.
- URL tidak ditulis hard-coded di atribut `href`; hanya di variabel `clickTag`.
- Hasil validasi ditampilkan di modal sebelum file diunduh.
