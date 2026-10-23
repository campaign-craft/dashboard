export type ExportMode = 'google' | 'ttd';

/** Elemen yang menerima klik. Ubah di sini jika ingin seluruh banner bisa diklik (mis. '#banner-root'). */
export const CLICK_TARGET_SELECTOR = '[data-editable="cta-text"]';

/** Serialisasi string aman untuk disisipkan di dalam <script>. */
function jsString(value: string): string {
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .split(LS)
    .join('\\u2028')
    .split(PS)
    .join('\\u2029');
}

/**
 * Script clickTag yang disisipkan ke index.html hasil ekspor.
 * - google: variabel `clickTag` berisi landing URL (standar Google Ads).
 * - ttd: variabel `clickTAG` dibaca dari query string (diisi oleh The Trade Desk).
 */
export function clickTagScript(mode: ExportMode, landingUrl: string): string {
  const selector = jsString(CLICK_TARGET_SELECTOR);

  if (mode === 'google') {
    return `
var clickTag = ${jsString(landingUrl)};
(function () {
  var el = document.querySelector(${selector});
  if (!el) return;
  el.addEventListener('click', function (e) {
    e.preventDefault();
    window.open(window.clickTag, '_blank');
  });
})();
`.trim();
  }

  return `
var clickTAG = (function () {
  var params = new URLSearchParams(window.location.search);
  return params.get('clickTAG') || '';
})();
(function () {
  var el = document.querySelector(${selector});
  if (!el) return;
  el.addEventListener('click', function (e) {
    e.preventDefault();
    if (!clickTAG) return;
    var url = clickTAG;
    try { url = decodeURIComponent(clickTAG); } catch (err) {}
    window.open(url, '_blank');
  });
})();
`.trim();
}
