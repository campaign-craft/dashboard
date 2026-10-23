import JSZip from 'jszip';
import type { Editor } from 'grapesjs';
import { BANNER_SIZE, PLACEHOLDER_IMG } from '../template/bannerTemplate';
import { clickTagScript, type ExportMode } from '../template/clickTag';
import { readLandingUrl } from '../editor/editorUtils';
import { validateExport, type ValidationResult } from './validate';

export type { ExportMode } from '../template/clickTag';

export interface BuiltExport {
  mode: ExportMode;
  filename: string;
  blob: Blob;
  sizeBytes: number;
  files: { path: string; bytes: number }[];
  validation: ValidationResult;
}

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/** Decode data URL (base64) menjadi byte + mime type. */
function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; mime: string } | null {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const mime = match[1] || 'application/octet-stream';
  const payload = match[3];
  if (match[2]) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, mime };
  }
  return { bytes: new TextEncoder().encode(decodeURIComponent(payload)), mime };
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

async function buildExport(editor: Editor, mode: ExportMode): Promise<BuiltExport> {
  const landingUrl = readLandingUrl(editor);
  const rawHtml = editor.getHtml({ cleanId: true } as Parameters<Editor['getHtml']>[0]);
  const css = editor.getCss() ?? '';

  // Parse HTML hasil GrapesJS (berbentuk <body ...>...</body>) agar bisa dimanipulasi dengan aman.
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
  const zip = new JSZip();
  const imageSizes: Record<string, number> = {};
  const placeholder: Record<string, boolean> = {};
  const files: { path: string; bytes: number }[] = [];

  // 1. Ekstrak gambar (data URL → file di images/), ganti src menjadi path relatif.
  const imageTargets: [string, string][] = [
    ['hero-image', 'hero'],
    ['logo', 'logo'],
  ];
  for (const [key, baseName] of imageTargets) {
    const img = doc.querySelector(`img[data-editable="${key}"]`);
    const src = img?.getAttribute('src') ?? '';
    placeholder[key] = src === PLACEHOLDER_IMG;
    imageSizes[key] = 0;
    if (!img || !src.startsWith('data:')) continue;

    const decoded = decodeDataUrl(src);
    if (!decoded) continue;
    const ext = MIME_EXT[decoded.mime] ?? 'bin';
    const path = `images/${baseName}.${ext}`;
    zip.file(path, decoded.bytes);
    files.push({ path, bytes: decoded.bytes.length });
    img.setAttribute('src', path);
    imageSizes[key] = decoded.bytes.length;
  }

  // 2. Jangan menaruh URL hard-coded di elemen CTA; klik ditangani script clickTag.
  const cta = doc.querySelector('[data-editable="cta-text"]');
  if (cta) {
    cta.setAttribute('href', '#');
    cta.removeAttribute('data-editable-url');
  }

  // 3. Rakit index.html lengkap.
  const bodyAttrs = Array.from(doc.body.attributes)
    .map((a) => ` ${a.name}="${escapeAttr(a.value)}"`)
    .join('');
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="ad.size" content="width=${BANNER_SIZE.width},height=${BANNER_SIZE.height}">
  <style>${css}</style>
</head>
<body${bodyAttrs}>
  ${doc.body.innerHTML}
  <script>${clickTagScript(mode, landingUrl)}</script>
</body>
</html>
`;
  const htmlBytes = new TextEncoder().encode(html).length;
  zip.file('index.html', html);
  files.unshift({ path: 'index.html', bytes: htmlBytes });

  // 4. Buat ZIP.
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    mimeType: 'application/zip',
  });

  const validation = validateExport({
    mode,
    zipBytes: blob.size,
    htmlBytes,
    heroBytes: imageSizes['hero-image'],
    landingUrl,
    files: files.map((f) => f.path),
    html,
    css,
    heroIsPlaceholder: placeholder['hero-image'],
    logoIsPlaceholder: placeholder['logo'],
  });

  return {
    mode,
    filename: mode === 'google' ? 'banner-google.zip' : 'banner-ttd.zip',
    blob,
    sizeBytes: blob.size,
    files,
    validation,
  };
}

export function exportForGoogleAds(editor: Editor): Promise<BuiltExport> {
  return buildExport(editor, 'google');
}

export function exportForTradeDesk(editor: Editor): Promise<BuiltExport> {
  return buildExport(editor, 'ttd');
}

/** Picu download file di browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
