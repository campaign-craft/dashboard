import type { ExportMode } from '../template/clickTag';

export const LIMITS = {
  googleZipBytes: 150 * 1024,
  ttdZipBytes: 10 * 1024 * 1024,
  ttdInitialLoadBytes: 300 * 1024,
  googleMaxAnimationSeconds: 30,
} as const;

/** URL harus diawali http:// atau https:// dan bisa di-parse dengan host yang valid. */
export function isValidUrl(value: string): boolean {
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return false;
  try {
    const url = new URL(v);
    return Boolean(url.hostname) && !/\s/.test(v);
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Durasi animasi terpanjang (detik) yang terdeteksi di CSS; 0 jika tidak ada animasi. */
export function maxAnimationSeconds(css: string): number {
  let max = 0;
  const re = /animation(?:-duration)?\s*:[^;}]*?(\d*\.?\d+)\s*(ms|s)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const value = parseFloat(m[1]);
    const seconds = m[2] === 'ms' ? value / 1000 : value;
    if (seconds > max) max = seconds;
  }
  return max;
}

export interface ValidationInput {
  mode: ExportMode;
  zipBytes: number;
  htmlBytes: number;
  heroBytes: number;
  landingUrl: string;
  files: string[];
  html: string;
  css: string;
  heroIsPlaceholder: boolean;
  logoIsPlaceholder: boolean;
}

export interface ValidationCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  checks: ValidationCheck[];
}

export function validateExport(input: ValidationInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: ValidationCheck[] = [];

  const addCheck = (label: string, ok: boolean, detail?: string, error?: string) => {
    checks.push({ label, ok, detail });
    if (!ok && error) errors.push(error);
  };

  // Struktur: index.html di root
  addCheck(
    'index.html berada di root ZIP',
    input.files.includes('index.html'),
    undefined,
    'index.html tidak ditemukan di root ZIP.',
  );

  // clickTag / clickTAG
  const tagName = input.mode === 'google' ? 'clickTag' : 'clickTAG';
  addCheck(
    `Script ${tagName} terpasang`,
    input.html.includes(`var ${tagName}`),
    undefined,
    `Script ${tagName} tidak ditemukan di index.html.`,
  );

  if (input.mode === 'google') {
    addCheck(
      'Ukuran ZIP ≤ 150 KB',
      input.zipBytes <= LIMITS.googleZipBytes,
      formatBytes(input.zipBytes),
      'Ukuran file melebihi 150 KB. Kompres gambar lebih kecil.',
    );

    const urlOk = isValidUrl(input.landingUrl);
    addCheck(
      'URL landing page valid',
      urlOk,
      input.landingUrl || 'belum diisi',
      input.landingUrl
        ? 'URL landing page tidak valid. Harus diawali http:// atau https://.'
        : 'URL landing page wajib diisi untuk Google Ads.',
    );

    const anim = maxAnimationSeconds(input.css);
    addCheck(
      'Durasi animasi ≤ 30 detik',
      anim <= LIMITS.googleMaxAnimationSeconds,
      anim > 0 ? `${anim} detik` : 'tidak ada animasi',
      `Durasi animasi (${anim} detik) melebihi batas 30 detik Google Ads.`,
    );
  } else {
    addCheck(
      'Ukuran ZIP ≤ 10 MB',
      input.zipBytes <= LIMITS.ttdZipBytes,
      formatBytes(input.zipBytes),
      'Ukuran file melebihi 10 MB.',
    );

    const initial = input.htmlBytes + input.heroBytes;
    addCheck(
      'Initial load (HTML + gambar utama) ≤ 300 KB',
      initial <= LIMITS.ttdInitialLoadBytes,
      formatBytes(initial),
      'Initial load (HTML + gambar utama) melebihi 300 KB. Kompres gambar lebih kecil.',
    );
  }

  if (input.heroIsPlaceholder) warnings.push('Gambar utama belum diganti (masih placeholder).');
  if (input.logoIsPlaceholder) warnings.push('Logo belum diganti (masih placeholder).');

  return { ok: errors.length === 0, errors, warnings, checks };
}
