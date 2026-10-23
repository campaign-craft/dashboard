import imageCompression from 'browser-image-compression';
import type { ImageKey } from './editorUtils';

interface Rule {
  targetBytes: number;
  maxSide: number;
  fileType: 'image/jpeg' | 'image/png';
}

/** Target kompresi: hero ≤ 80 KB (maks 600px), logo ≤ 20 KB (maks 200px). */
export const IMAGE_RULES: Record<ImageKey, Rule> = {
  'hero-image': { targetBytes: 80 * 1024, maxSide: 600, fileType: 'image/jpeg' },
  logo: { targetBytes: 20 * 1024, maxSide: 200, fileType: 'image/png' },
};

export interface CompressedImage {
  dataUrl: string;
  sizeBytes: number;
  targetBytes: number;
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file'));
    reader.readAsDataURL(blob);
  });
}

export async function compressImage(file: File, key: ImageKey): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPG, PNG, atau WebP).');
  }
  const rule = IMAGE_RULES[key];
  const compressed = await imageCompression(file, {
    maxSizeMB: rule.targetBytes / (1024 * 1024),
    maxWidthOrHeight: rule.maxSide,
    fileType: rule.fileType,
    initialQuality: 0.85,
    useWebWorker: false, // hindari memuat script dari CDN
  });
  const dataUrl = await readAsDataUrl(compressed);
  return { dataUrl, sizeBytes: compressed.size, targetBytes: rule.targetBytes };
}
