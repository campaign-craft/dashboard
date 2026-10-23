/**
 * Template "cangkang" banner 300x250.
 *
 * Aturan:
 * - Hanya elemen dengan atribut data-editable yang bisa diubah pembeli.
 * - Nilai data-editable: headline | subheadline | cta-text | hero-image | logo
 *   ("landing-url" tidak dirender sebagai elemen; URL disimpan di atribut
 *   data-editable-url pada elemen CTA).
 * - Untuk ukuran baru (mis. 728x90): duplikasi file ini, ubah BANNER_SIZE dan
 *   posisi/ukuran elemen di dalam string template.
 */

export const BANNER_SIZE = { width: 300, height: 250 } as const;

/** GIF 1x1 transparan sebagai placeholder gambar (tanpa file eksternal). */
export const PLACEHOLDER_IMG =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Teks bawaan, dipakai juga sebagai nilai awal field di panel. */
export const DEFAULT_TEXT = {
  headline: 'Headline default',
  subheadline: 'Subheadline default',
  'cta-text': 'Beli Sekarang',
} as const;

/** Batas panjang teks agar layout tidak rusak. */
export const TEXT_LIMITS = {
  headline: 60,
  subheadline: 120,
  'cta-text': 24,
} as const;

export const bannerTemplate = `
<div id="banner-root" style="position:relative;width:${BANNER_SIZE.width}px;height:${BANNER_SIZE.height}px;overflow:hidden;background:linear-gradient(135deg,#1f2937,#4b5563);">
  <img data-editable="hero-image" src="${PLACEHOLDER_IMG}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" />
  <img data-editable="logo" src="${PLACEHOLDER_IMG}" alt="" style="position:absolute;top:10px;left:10px;width:60px;display:block;" />
  <h1 data-editable="headline" style="position:absolute;top:80px;left:15px;width:270px;margin:0;color:#fff;font:700 22px/1.2 Arial,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.55);">${DEFAULT_TEXT.headline}</h1>
  <p data-editable="subheadline" style="position:absolute;top:140px;left:15px;width:270px;margin:0;color:#fff;font:400 14px/1.3 Arial,sans-serif;white-space:pre-line;text-shadow:0 1px 3px rgba(0,0,0,.55);">${DEFAULT_TEXT.subheadline}</p>
  <a data-editable="cta-text" data-editable-url="landing-url" href="#" style="position:absolute;bottom:15px;left:15px;padding:8px 16px;background:#ff3b30;color:#fff;font:700 14px Arial,sans-serif;text-decoration:none;">${DEFAULT_TEXT['cta-text']}</a>
</div>
`.trim();
