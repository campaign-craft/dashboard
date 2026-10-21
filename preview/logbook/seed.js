/**
 * seed.js — data awal dari chat Fiverr asli: Kate (Pearle Vision) dan Sarah (CAF / Lark).
 * Dipakai app.js hanya kalau data masih kosong. Format sama dengan hasil exportAll().
 * Catatan: field "revisions" dan "rating" adalah perkiraan dari chat; sesuaikan kalau perlu.
 * Hapus file ini (dan <script>-nya di index.html) kalau tidak butuh data awal.
 */
(function () {
  const ts = (d) => d + 'T00:00:00.000Z';
  const O = (id, cid, gig, date, value, status, revisions, scope, delivery, preview, note) => ({
    id: 'seed-o' + id, client_id: cid, fiverr_order_id: '', gig: gig, order_date: date, value: value, currency: 'USD',
    status: status, revisions: revisions, rating: null, scope: scope, delivery_item: delivery, preview_link: preview,
    pricing_note: note, created_at: ts(date),
  });
  const L = (id, cid, oid, type, date, content, link) => ({
    id: 'seed-l' + id, client_id: cid, order_id: oid ? 'seed-o' + oid : null, type: type, date: date,
    content: content, reference_link: link || '', meta: {}, created_at: ts(date),
  });

  window.SEED_DATA = {
    clients: [
      { id: 'seed-c1', fiverr_username: 'kate_stombs', name: 'Kate (Pearle Vision)', country: 'United States',
        timezone: 'America/New_York', first_contact: '2026-06-12', created_at: ts('2026-06-12'),
        notes: 'Senior Art Director di agensi kreatif NYC; klien akhir: Pearle Vision (USGM + CA). Platform: The Trade Desk + MobileFuse.\n' +
          'Ramah, cepat balas, sering ubah spesifikasi di tengah jalan; selalu mau bayar untuk pekerjaan tambahan. Tawarkan sendiri $300 untuk troubleshooting.\n' +
          'Repeat order: Jun (Q3), Sep (Q4). Berharap batch berikutnya 1-2 bulan lagi. Spec/CID/penamaan file selalu lewat Google Sheet brief.\n' +
          'Pelajaran: sertakan clickTag (window.clickTag) sejak awal, dan nama file mengikuti sheet (DIS, V2 sebelum ukuran).' },
      { id: 'seed-c2', fiverr_username: 'sadams_lark', name: 'Sarah (Lark / CAF)', country: 'United Kingdom',
        timezone: 'Europe/London', first_contact: '2026-04-15', created_at: ts('2026-04-15'),
        notes: 'Agensi kreatif (Lark), klien akhir: CAF (Charities Aid Foundation), kampanye "Better Giving Starts Here". Platform: The Trade Desk.\n' +
          'Baru di HTML5, sopan, banyak revisi karena klien akhir sering ganti desain. Desainer in-house mengirim file AI/PDF.\n' +
          'Pelajaran: minta approval statis 100% sebelum animasi; clickTag wajib (sempat terlewat di batch pertama); batasi jumlah ronde revisi di penawaran.' },
    ],
    orders: [
      O(1, 'seed-c1', 'Reformat 4 kreatif ke 6 ukuran HTML5 (USGM + CA), 48 ZIP + PSD', '2026-06-14', 700, 'completed', 2,
        '4 kreatif inti x 2 versi (USGM/CA) x 6 ukuran (300x250, 320x50, 728x90, 160x600, 300x600, 970x250). Fase 1 statis, fase 2 animasi + packaging.',
        '48 ZIP HTML5 + backup image + PSD. Penamaan PV-Q3-DIS-Post-xx-REGION-Campaign[-V2]-ukuran.',
        'https://oakandpine.xyz/preview/pearle-vision/20260614/',
        'Estimasi 18-22 jam x $35/jam, dijual fixed $700. Kate langsung setuju, tidak nego. Hasil akhirnya jadi 60-70 paket, jauh di atas scope awal 48.'),
      O(2, 'seed-c1', 'Revisi struktural dari client (Annual Exams, Labor Day, BTS)', '2026-06-16', 175, 'completed', 0,
        'Gradient + warna aksen #c6d6b5; hapus copy/logo di 970x250 dan 320x50; perbesar H1 di 160x600; hapus H1 dan logo di ukuran kecil.',
        'Preview link diperbarui.', '', 'Estimasi 5 jam x $35. Disetujui langsung.'),
      O(3, 'seed-c1', 'BTS Protection Plan, 12 HTML5 baru (USGM + CA)', '2026-06-17', 220, 'completed', 1,
        'Konsep baru dengan gambar bus; 6 ukuran x USGM/CA = 12 ZIP + backup retina. Termasuk perbaikan ejaan "complimentary".',
        '12 ZIP HTML5 + backup image.', 'https://oakandpine.xyz/preview/pearle-vision/20260617/bts-pp/static/',
        'Paket flat $220 untuk 12 unit (~$18/unit). Kemungkinan terlalu murah dibanding revisi yang menyusul.'),
      O(4, 'seed-c1', 'Extra: penyesuaian BTS Protection + Annual Exams', '2026-06-19', 50, 'completed', 0,
        'Tambah "+ 40% Off Lenses" di 970x250 dan 300x600; disclaimer Annual Exams diganti "PROMOTIONAL DETAILS".', '', '', 'Extra $50 di dalam order aktif.'),
      O(5, 'seed-c1', 'Troubleshooting & dukungan platform (clickTag, upload MobileFuse)', '2026-07-03', 300, 'completed', 0,
        'Waktu diskusi dan debugging setelah delivery: clickTag, CID, error upload MobileFuse, struktur folder delivery.', '', '',
        'Kate yang menawarkan $300; tidak ditawar. Ada tip tambahan.'),
      O(6, 'seed-c1', 'Q4: 60 HTML5 banner (5 kampanye x USGM/CA x 6 ukuran)', '2026-09-10', 1410, 'completed', 3,
        'Kampanye 1-2 ada PSD (24 unit); kampanye 3-5 tanpa PSD, desain dibuat ulang (36 unit). Fase statis, animasi, packaging.',
        '60 ZIP HTML5 + backup image + PSD, struktur Region > Campaign.', 'https://oakandpine.xyz/preview/pearle-vision/q4/20260916/Preview-HTML5',
        'Rincian: $360 (24 unit, $15/unit) + $900 (36 unit tanpa PSD, $25/unit) + $150 rush. Kate setuju tanpa nego. Rush fee $150 tetap masuk di total walau deadline akhirnya 7 hari.'),
      O(7, 'seed-c1', 'Q4: 18 video MP4 in-store (looping)', '2026-09-15', 540, 'delivered', 1,
        '7 ukuran x 2 promo (40% Off, 50% + 30% Off) + 4 versi Spanyol Puerto Rico (1920x1080, 1080x1920). CTA Spanyol: "Reserva Ahora".',
        '18 file MP4.', '', '$30 per file. Disetujui langsung.'),
      O(8, 'seed-c2', 'CAF: 20 HTML5 banner + backup GIF (10 ukuran x 2 versi)', '2026-04-23', 280, 'completed', 8,
        '10 ukuran (termasuk 460x1500 left/right skin) x 2 set gambar/copy. Spesifikasi The Trade Desk, clickTAG, file kecil.',
        'ZIP HTML5 + backup GIF. Revisi: 4 ronde di penawaran, kenyataannya jauh lebih banyak.', 'https://oakandpine.xyz/preview/caf/20260508/',
        'Kutipan awal $150 (10 banner), jadi $280 untuk 20. Terlalu murah: banyak revisi desain dari client akhir, lalu extra $150. Naikkan harga atau batasi ronde.'),
      O(9, 'seed-c2', 'Extra: perubahan kampanye / layout CAF', '2026-05-08', 150, 'delivered', 0,
        'Tambahan karena perubahan layout berulang dan sapuan warna tombol "Find out more" hijau.', '', '', 'Usul awal $100, naik jadi $150; Sarah setuju tanpa nego dan menagihkannya ke client.'),
      O(10, 'seed-c2', 'CAF BGSH2: 18 HTML5 banner (2 konsep x 9 ukuran)', '2026-10-09', 350, 'in_progress', 2,
        '3 frame dari storyboard statis Lark. Standard clickTag, backup image. Rush, V1 diminta sebelum Jumat.',
        'ZIP HTML5 + backup image; final dikirim setelah sign-off.', 'https://oakandpine.xyz/preview/caf/20261018/',
        'Rush $350 untuk 18 aset; Sarah langsung setuju. Persiapkan dari awal: clickTag + file AI per ukuran (AI master 18 artboard sempat crash).'),
    ],
    logs: [
      // ---- Kate / Pearle Vision ----
      L(1, 'seed-c1', 1, 'chat', '2026-06-12', 'Kate membuka dengan brief: konversi iklan yang sudah didesain ke ukuran banner web standar, bentuk HTML5. Syarat teknis: ada backup image, nama file tanpa spasi/karakter khusus, tidak ada file tak terpakai, tanpa localStorage/sessionStorage/IndexedDB, semua URL harus aman (https). Ukuran juga dipakai untuk Programmatic Display / MobileFuse High-Impact, sertakan PSD. Deadline Senin 15 Juni jam 9 pagi ET. Rate $35/jam disetujui.'),
      L(2, 'seed-c1', 1, 'chat', '2026-06-13', 'Saya konfirmasi 4 kreatif x 2 versi (USGM/CA) x 6 ukuran = 48 ZIP. Usul 2 fase (statis dulu, lalu animasi). Estimasi 18-22 jam = $630-770. Kate setuju. Offer dibuat $700 fixed (bukan kontrak per jam Fiverr supaya aktif cepat). Pembayaran Kate sempat error di Apple Pay; offer ditarik dan dikirim ulang.'),
      L(3, 'seed-c1', 1, 'delivery', '2026-06-14', 'Fase 1 statis selesai untuk 48 layout. Background di 160x600 dan 970x250 diperluas pakai AI; Kate setuju. Link PSD pembetulan untuk Annual Exams sempat tertukar dengan BTS Promo, sudah diperbaiki. Fase 2 animasi dikirim 15 Juni.',
        'https://oakandpine.xyz/preview/pearle-vision/20260614/'),
      L(4, 'seed-c1', 2, 'revision', '2026-06-16', 'Catatan client: Annual Exams gradient gelap di belakang teks atau warna aksen #c6d6b5; Labor Day 970x250 dan 320x50 hapus copy dan logo; BTS 160x600 H1 + subcopy lebih besar, ukuran lain hapus H1 dan perbesar bubble Complimentary Protection Plan, hapus logo PPE putih dan bubble hijau. Estimasi 5 jam = $175, offer baru.'),
      L(5, 'seed-c1', 3, 'chat', '2026-06-17', 'Client minta aset tambahan untuk promo yang sudah berhenti (Labor Day) berupa BTS Protection Plan, USGM + CA. Saya kutip $220 untuk 12 unit. Ejaan "complementary" harus "complimentary" (salah dari brief Kate), saya perbaiki tanpa biaya.'),
      L(6, 'seed-c1', 4, 'revision', '2026-06-19', 'Preview di oakandpine.xyz tidak terbuka di PC client (kemungkinan firewall Microsoft). Dipindah ke GitHub Pages. Revisi: "+ 40% Off Lenses" di 970x250 dan 300x600, disclaimer Annual Exams jadi "PROMOTIONAL DETAILS". Extra $50 di order aktif.'),
      L(7, 'seed-c1', 1, 'revision', '2026-06-23', 'Perubahan akhir: ganti kode SOC jadi DIS; V2 ditaruh sebelum ukuran (PV-Q3-DIS-Post-12a-USGM-PromoLaborDay-V2-320x50); 320x50 teks "Complimentary Protection Plan" menggantikan copy lama; H1 "Kids destroy glasses" diganti "+40% Off Lenses" yang lebih besar.'),
      L(8, 'seed-c1', 1, 'delivery', '2026-06-26', 'Delivery paket + PSD (882 MB). Salah paham: yang diminta Kate ternyata desain asli tanpa teks +40% (320x50, 300x600, 728x90) selain versi V2, bukan "V1 putaran pertama". Sudah dikirim ulang dan disetujui.'),
      L(9, 'seed-c1', 5, 'note', '2026-06-27', 'PELAJARAN: client menemukan banner tidak punya clickTag. Saya sengaja tidak memasang karena URL belum ada. Seharusnya clickTag (window.clickTag) dipasang sejak awal dan sebutkan di penawaran. CID/URL final dari sheet AMS; versi final 70 paket dikirim 1 Juli dengan struktur Region > Campaign.'),
      L(10, 'seed-c1', 5, 'chat', '2026-07-02', 'Upload ke MobileFuse gagal ("Compressed Folder is invalid") padahal TTD berhasil. Solusi: download ZIP ke desktop dan upload langsung tanpa ekstrak ulang. Berhasil 3 Juli. Kate menawarkan $300 untuk waktu troubleshooting; saya setuju.'),
      L(11, 'seed-c1', 6, 'chat', '2026-09-10', 'Kate repeat untuk Q4: 5 kampanye x USGM/CA x 6 ukuran = 60. Kampanye 3-5 tanpa PSD (36 unit rebuild). Quote $1.410 ($360 + $900 + $150 rush untuk preview besok), tapi Kate menerima 7 hari tanpa rush. Order aktif 10 September.'),
      L(12, 'seed-c1', 6, 'delivery', '2026-09-17', 'Statis disetujui 14-15 Sep; animasi dikirim 16 Sep. Kampanye 1-4 disetujui 17 Sep; kampanye 5 (50% Off) revisi: hapus squiggle putih, logo + bubble hijau dijadikan lockup. Semua disetujui dan diunggah 18 Sep. Order dikonfirmasi selesai 21 Sep.',
        'https://oakandpine.xyz/preview/pearle-vision/q4/20260916/Preview-HTML5'),
      L(13, 'seed-c1', 7, 'delivery', '2026-09-22', 'MP4 in-store: 7 ukuran untuk 40% Off dan 50% + 30% Off, plus 4 MP4 Spanyol Puerto Rico dengan CTA "Reserva Ahora". $30 per file. Terkirim 22 Sep. Kate bilang akan ada batch lagi 1-2 bulan dan akan mendorong tim untuk approve desain lebih awal.'),
      // ---- Sarah / CAF ----
      L(14, 'seed-c2', 8, 'chat', '2026-04-15', 'Sarah dari agensi kreatif minta 10 ukuran HTML5 + backup GIF, lalu naik jadi 20 aset (2 versi). Saya kutip $150 lalu $280 untuk 20 banner dengan 4 ronde amend. Spesifikasi The Trade Desk: clickTAG, primary HTML 100 KB, initial load 300 KB. Sarah belum paham HTML5, saya jelaskan bahwa client melihat lewat link preview.'),
      L(15, 'seed-c2', 8, 'note', '2026-04-23', 'Offer $280 dibuat. Salah set delivery 1 hari, saya minta perpanjangan 5 hari. Imagery dan copy masih berubah beberapa kali (foto AstraZeneca, copy Landsec, spesifikasi skin kiri/kanan).'),
      L(16, 'seed-c2', 8, 'delivery', '2026-04-27', 'Preview statis dan 2 banner animasi sampel. Animasi 12 detik. Foto diperluas pakai AI untuk ukuran ekstrem (120x600, 728x90). Sarah minta teks muncul langsung (bukan wipe), mark "Better giving" sekaligus, plus CTA button "Start your story today".',
        'https://oakandpine.xyz/preview/caf/20260427/static/'),
      L(17, 'seed-c2', 8, 'revision', '2026-04-28', 'Salah paham desain mark + CTA: Sarah minta mark "Better giving starts here" asli, tombol putih teks hijau tua di bawahnya, tanpa shimmer dan tanpa ikon kursor. Perlu 3 putaran. Pelajaran: konfirmasi referensi visual sebelum membuat versi baru.'),
      L(18, 'seed-c2', 8, 'revision', '2026-05-05', 'Delapan amends copy di preview statis (AstraZeneca 728x90/970x250, Barbara, Landsec, Rosie+Marie) dan perubahan ukuran 460x500 menjadi 460x1500. Preview diperbarui sebelum approval client.'),
      L(19, 'seed-c2', 8, 'revision', '2026-05-06', 'Client minta logo CAF tetap ada di 3 scene, lockup BGSH dilepas dari tepi di scene 3, ukuran lockup lebih besar, tombol AstraZeneca hijau. Desainer Sarah tidak bisa membuka file PDF/AI saya; akhirnya memakai file asli. Statis disetujui malam itu.'),
      L(20, 'seed-c2', 9, 'chat', '2026-05-08', 'Tweak animasi (dua baris tampil bersamaan, urutan Landsec, sinkronisasi Rosie+Marie), lalu tombol "Find out more" jadi hijau untuk semua. Extra fee $100 naik jadi $150, disetujui Sarah. Sign-off client 8 Mei.'),
      L(21, 'seed-c2', 8, 'revision', '2026-05-09', 'Client menemukan clickTag hilang. Landing page: https://www.cafonline.org/campaign/better-giving-starts-here. Saya tambahkan clickTag ke semua aset hari itu juga. PELAJARAN: clickTag harus ada di setiap delivery.',
        'https://www.cafonline.org/campaign/better-giving-starts-here'),
      L(22, 'seed-c2', 10, 'chat', '2026-10-06', 'Sarah repeat: batch BGSH2, 2 konsep x 9 ukuran = 18 aset, brief mendadak. Saya kutip $350 rush, V1 sebelum Jumat. File dari storyboard statis (PDF 38 MB). Offer dibuat 9 Oktober, dibayar hari yang sama.'),
      L(23, 'seed-c2', 10, 'delivery', '2026-10-13', 'V1 dikirim, client review sampai akhir hari. Sarah menilai V1 sempurna. Sarah menyuruh tidak lembur.'),
      L(24, 'seed-c2', 10, 'revision', '2026-10-16', 'Revisi: 300x250 body copy dan logo digeser menjauh dari bahu di foto; end card 320x50 dan 300x50 diganti; gunakan foto GettyImages-2229666665 edited2 untuk 120x600, 160x600, 300x600, 320x480. AI master 18 artboard sering crash di laptop saya; minta file per ukuran. V2 dikirim 18 Oktober.',
        'https://oakandpine.xyz/preview/caf/20261018/'),
      L(25, 'seed-c2', 10, 'note', '2026-10-20', 'Aset sign-off. Sarah minta format delivery sama dengan proyek lalu dan cek ulang clickTag. Janji final package 21 Oktober. TODO: pastikan clickTAG (case-sensitive) ada di semua ZIP dan link landing page dari Sarah.'),
    ],
  };
})();
