# Logbook Freelance (versi frontend-only)

Catatan klien, order, chat, delivery, dan meeting untuk seller Fiverr. Berjalan 100% di browser, data disimpan di `localStorage`.
Use case utama: klien repeat order dan tanya harga → buka profil → lihat histori order, harga sebelumnya, dan catatan harga → putuskan harga baru.

## Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Kerangka halaman |
| `style.css` | Tampilan ala Notion |
| `app.js` | Logika UI (tidak menyentuh localStorage langsung) |
| `storage.js` | **Data layer** — satu-satunya modul yang tahu cara menyimpan data |
| `seed.js` | Data contoh, dipakai hanya jika data masih kosong |

## Cara menjalankan

Cara paling mudah: **klik dua kali `index.html`** (tanpa ES module, jadi jalan via `file://`).

Atau lewat server lokal (disarankan, karena localStorage dipisah per origin):

```bash
cd freelance-logbook
python3 -m http.server 8080
# buka http://localhost:8080
```

Catatan: data tersimpan per browser dan per origin. `file://` dan `localhost:8080` punya penyimpanan yang **berbeda**. Pilih salah satu dan konsisten, atau pindahkan data dengan Export/Import.

## Data model

Tanggal berformat `YYYY-MM-DD`, `created_at` berformat ISO 8601, `id` dari `crypto.randomUUID()`.

**Client**: `id, fiverr_username, name, country, timezone, first_contact, notes, created_at`

**Order**: `id, client_id, fiverr_order_id, gig, order_date, value (number), currency, scope, delivery_item, preview_link, status, revisions (int), rating (1-5/null), pricing_note, created_at`
- `status`: `in_progress | delivered | completed | cancelled`

**Log**: `id, client_id, order_id (opsional/null), type, date, content, reference_link, meta (object), created_at`
- `type`: `chat | meeting | delivery | revision | note`
- `meta` untuk meeting: `{ "action_items": ["..."], "recording_link": "https://..." }`

Aturan relasi:
- Hapus klien → semua order dan log klien ikut terhapus.
- Hapus order → log terkait **tidak** terhapus, `order_id` menjadi `null`.
- Order berstatus `cancelled` tidak dihitung di total/rata-rata nilai.

## Kontrak storage.js

Semua fungsi async (return Promise) dan melempar `Error` berpesan jelas jika gagal.

```
listClients() · getClient(id) · createClient(data) · updateClient(id, data) · deleteClient(id)
listOrders(clientId) · createOrder(data) · updateOrder(id, data) · deleteOrder(id)
listLogs(clientId, filter) · createLog(data) · updateLog(id, data) · deleteLog(id)
exportAll() · importAll(json) · isEmpty()
```

`filter` pada `listLogs` berbentuk `{ type?, order_id? }`. `isEmpty()` hanya dipakai untuk memutuskan apakah seed perlu dimuat.

## Cara ganti ke Google Sheets + Apps Script

Hanya `storage.js` yang diganti. `app.js` tidak berubah selama kontrak di atas dipertahankan.

**1. Sheet**: buat tiga tab `Clients`, `Orders`, `Logs`. Baris 1 = nama kolom sesuai data model. Kolom `meta` di `Logs` disimpan sebagai string JSON.

**2. Apps Script (Web App)**: satu endpoint `doPost` yang menerima `{ action, payload }` dan membalas `{ ok, data }` atau `{ ok:false, error }`.

```js
// Code.gs (kerangka)
function doPost(e) {
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    const handlers = { listClients, getClient, createClient, updateClient, deleteClient,
      listOrders, createOrder, updateOrder, deleteOrder,
      listLogs, createLog, updateLog, deleteLog, exportAll, importAll, isEmpty };
    if (!handlers[action]) throw new Error('Action tidak dikenal: ' + action);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, data: handlers[action](payload) }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
// Tiap handler membaca/menulis sheet yang sesuai. Gunakan LockService saat menulis.
```

**3. storage.js versi API**: pertahankan nama fungsi, ganti isinya menjadi pemanggilan `fetch`.

```js
(function (global) {
  const API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';

  async function call(action, payload) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        // text/plain menghindari preflight CORS yang tidak didukung Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload }),
      });
    } catch (e) { throw new Error('Tidak bisa terhubung ke server: ' + e.message); }
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Server error');
    return json.data;
  }

  global.LogbookStorage = {
    listClients: () => call('listClients'),
    getClient: (id) => call('getClient', { id }),
    createClient: (data) => call('createClient', data),
    updateClient: (id, data) => call('updateClient', { id, data }),
    deleteClient: (id) => call('deleteClient', { id }),
    listOrders: (clientId) => call('listOrders', { clientId }),
    createOrder: (data) => call('createOrder', data),
    updateOrder: (id, data) => call('updateOrder', { id, data }),
    deleteOrder: (id) => call('deleteOrder', { id }),
    listLogs: (clientId, filter) => call('listLogs', { clientId, filter }),
    createLog: (data) => call('createLog', data),
    updateLog: (id, data) => call('updateLog', { id, data }),
    deleteLog: (id) => call('deleteLog', { id }),
    exportAll: () => call('exportAll'),
    importAll: (json) => call('importAll', { json }),
    isEmpty: () => call('isEmpty'),
  };
})(window);
```

Hal yang perlu diperhatikan saat migrasi:
- **Validasi** (field wajib, relasi klien/order, tipe log) yang sekarang ada di `storage.js` harus dipindah ke Apps Script.
- **ID** dibuat di server (atau tetap di client dan dikirim), asal konsisten UUID.
- **Deploy** Web App dengan akses sesuai kebutuhan. Versi tanpa login berarti siapa pun yang tahu URL bisa mengakses data, jadi tambahkan token sederhana atau batasi akses sebelum dipakai serius.
- **Kecepatan**: tiap panggilan Apps Script bisa makan ~0.5-2 detik. UI sudah punya state loading; jika terasa lambat, cache hasil `listClients()` di memori.
- **Seed**: hapus `seed.js` dan tag `<script>`-nya, lalu buang bagian seed di `init()` pada `app.js`.

## Backup

- Klik **Export JSON** di header → file `logbook-YYYY-MM-DD.json` terunduh.
- **Import JSON** akan **mengganti seluruh data** dengan isi file, jadi export dulu sebelum import.
- Karena localStorage bisa hilang jika cache browser dibersihkan, simpan export berkala (mis. mingguan) di Drive atau folder terpisah.
- File export memakai format yang sama dengan `seed.js`, dan nantinya bisa dipakai untuk memindahkan data ke Google Sheets lewat `importAll`.

## Batasan versi lokal

- Tanpa login dan tanpa enkripsi. Siapa pun yang membuka browser ini bisa membaca datanya.
- Kapasitas localStorage sekitar 5 MB, cukup untuk ribuan log teks.
- Satu browser = satu set data (tidak sinkron antar perangkat).

## AI Import (opsional)

Fitur ini membaca histori chat Fiverr yang kamu paste, lalu mengisi form order otomatis lewat DeepSeek. Tombolnya ada di section **Order** → **Import dari chat (AI)**.

**Kenapa butuh proxy?** App ini frontend-only: semua file bisa dibaca siapa pun yang membuka halamannya. API key DeepSeek tidak boleh ditaruh di sana. Karena itu panggilan AI lewat proxy kecil (Cloudflare Worker, `ai-proxy-worker.js`) yang menyimpan key sebagai secret. Di frontend cuma ada URL proxy (`AI_PROXY_URL` di `app.js`).

**Alur**: paste chat → proxy memanggil DeepSeek → hasil dimuat ke form order → kamu periksa dan edit → baru klik Simpan. Hasil AI **tidak pernah** tersimpan otomatis, dan penyimpanan tetap lewat `createOrder` / `updateOrder` di `storage.js` (kontrak storage tidak berubah).

### Deploy proxy ke Cloudflare Workers

1. Siapkan akun Cloudflare (gratis cukup) dan API key DeepSeek dari platform.deepseek.com.
2. Deploy Worker dari folder proyek:
   ```bash
   npx wrangler login
   npx wrangler deploy ai-proxy-worker.js --name logbook-ai-proxy --compatibility-date 2024-09-01
   ```
3. Simpan API key sebagai secret (akan diminta mengetik/paste key, tidak ditulis di file mana pun):
   ```bash
   npx wrangler secret put DEEPSEEK_API_KEY --name logbook-ai-proxy
   ```
4. Wrangler menampilkan URL Worker, mis. `https://logbook-ai-proxy.NAMA-KAMU.workers.dev`.

### Isi `AI_PROXY_URL`

Buka `app.js`, ganti konstanta di bagian atas file:

```js
const AI_PROXY_URL = 'https://logbook-ai-proxy.NAMA-KAMU.workers.dev';
```

Jangan pernah menaruh API key di `app.js`. Hanya URL Worker.

### Keamanan proxy

- Secara default CORS memakai `*` supaya jalan dari `file://` maupun localhost. Siapa pun yang tahu URL Worker bisa memanggilnya dan memakai kuota DeepSeek kamu. Jangan bagikan URL-nya, dan pantau penggunaan di dashboard DeepSeek.
- Untuk membatasi, ubah `ALLOWED_ORIGIN` di `ai-proxy-worker.js` ke origin tertentu (mis. `http://localhost:8080`). Catatan: origin halaman `file://` dikirim browser sebagai `null`, jadi pembatasan ini hanya cocok kalau kamu membuka app lewat server/hosting.
- Worker tidak mencatat (log) API key maupun isi chat.

### Biaya dan keterbatasan

- Biaya dihitung per token oleh DeepSeek (chat panjang = lebih mahal, maks 50.000 karakter per permintaan). Cloudflare Workers gratis punya kuota harian yang cukup untuk pemakaian pribadi.
- JSON mode DeepSeek kadang mengembalikan konten kosong atau tidak valid. Kalau terjadi, form AI menampilkan error dan kamu bisa klik Extract lagi.
- AI bisa salah baca (nilai, tanggal, status). **Selalu periksa hasilnya di form order sebelum menyimpan.** Informasi yang tidak ada di chat dibiarkan kosong, bukan ditebak.
- Field kosong dari AI tidak menimpa nilai default (atau nilai order yang sedang diedit). Mata uang di luar daftar yang didukung form diabaikan.

### Opsional

Fitur ini opsional. Kalau `AI_PROXY_URL` masih berisi placeholder, tombol tetap muncul tetapi saat dipakai akan menampilkan pesan error yang jelas bahwa URL proxy belum diisi. Fitur lain tidak terpengaruh.
