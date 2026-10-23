import { useState, type ChangeEvent } from 'react';
import type { BannerEditorApi } from './useGrapesEditor';
import type { ImageKey } from './editorUtils';
import { DEFAULT_TEXT, TEXT_LIMITS } from '../template/bannerTemplate';
import { formatBytes, isValidUrl } from '../export/validate';

interface ImageState {
  preview: string | null;
  sizeBytes: number | null;
  targetBytes: number | null;
  busy: boolean;
  error: string | null;
}

const EMPTY_IMAGE: ImageState = {
  preview: null,
  sizeBytes: null,
  targetBytes: null,
  busy: false,
  error: null,
};

interface Props {
  api: BannerEditorApi;
}

export function SidePanel({ api }: Props) {
  const [headline, setHeadline] = useState<string>(DEFAULT_TEXT.headline);
  const [subheadline, setSubheadline] = useState<string>(DEFAULT_TEXT.subheadline);
  const [ctaText, setCtaText] = useState<string>(DEFAULT_TEXT['cta-text']);
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<Record<ImageKey, ImageState>>({
    'hero-image': EMPTY_IMAGE,
    logo: EMPTY_IMAGE,
  });

  const disabled = !api.ready;

  const patchImage = (key: ImageKey, patch: Partial<ImageState>) =>
    setImages((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const onImageChange = async (key: ImageKey, e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    patchImage(key, { busy: true, error: null });
    try {
      const result = await api.updateImage(key, file);
      patchImage(key, {
        busy: false,
        preview: result.dataUrl,
        sizeBytes: result.sizeBytes,
        targetBytes: result.targetBytes,
      });
    } catch (err) {
      patchImage(key, {
        busy: false,
        error:
          err instanceof Error && err.message
            ? err.message
            : 'Gambar tidak dapat diproses. Coba file lain.',
      });
    } finally {
      input.value = ''; // izinkan memilih file yang sama lagi
    }
  };

  const renderImageField = (key: ImageKey, label: string, hint: string) => {
    const state = images[key];
    const inputId = `field-${key}`;
    return (
      <div className="field">
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
        <div className="image-row">
          <div className="thumb" aria-hidden="true">
            {state.preview ? <img src={state.preview} alt="" /> : <span>Belum ada</span>}
          </div>
          <div className="image-controls">
            <input
              id={inputId}
              type="file"
              accept="image/*"
              disabled={disabled || state.busy}
              onFocus={() => api.focusField(key)}
              onBlur={api.blurField}
              onChange={(e) => onImageChange(key, e)}
            />
            {state.busy && <p className="hint">Mengompres gambar…</p>}
            {!state.busy && state.sizeBytes !== null && state.targetBytes !== null && (
              <p
                className={
                  state.sizeBytes > state.targetBytes ? 'hint hint-warn' : 'hint hint-ok'
                }
              >
                Terkompresi: {formatBytes(state.sizeBytes)}
                {state.sizeBytes > state.targetBytes &&
                  ` (target ${formatBytes(state.targetBytes)})`}
              </p>
            )}
            {state.error && <p className="hint hint-error">{state.error}</p>}
          </div>
        </div>
        <p className="hint">{hint}</p>
      </div>
    );
  };

  const urlTrimmed = url.trim();
  const urlEmpty = urlTrimmed === '';
  const urlInvalid = !urlEmpty && !isValidUrl(urlTrimmed);

  return (
    <div className="side-panel">
      <div className="field">
        <label className="field-label" htmlFor="field-headline">
          Ganti Headline
        </label>
        <input
          id="field-headline"
          type="text"
          value={headline}
          maxLength={TEXT_LIMITS.headline}
          disabled={disabled}
          onFocus={() => api.focusField('headline')}
          onBlur={api.blurField}
          onChange={(e) => {
            setHeadline(e.target.value);
            api.updateText('headline', e.target.value);
          }}
        />
        <p className="hint">
          {headline.length}/{TEXT_LIMITS.headline} karakter
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="field-subheadline">
          Ganti Subheadline
        </label>
        <textarea
          id="field-subheadline"
          rows={3}
          value={subheadline}
          maxLength={TEXT_LIMITS.subheadline}
          disabled={disabled}
          onFocus={() => api.focusField('subheadline')}
          onBlur={api.blurField}
          onChange={(e) => {
            setSubheadline(e.target.value);
            api.updateText('subheadline', e.target.value);
          }}
        />
        <p className="hint">
          {subheadline.length}/{TEXT_LIMITS.subheadline} karakter
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="field-cta">
          Teks Tombol CTA
        </label>
        <input
          id="field-cta"
          type="text"
          value={ctaText}
          maxLength={TEXT_LIMITS['cta-text']}
          disabled={disabled}
          onFocus={() => api.focusField('cta-text')}
          onBlur={api.blurField}
          onChange={(e) => {
            setCtaText(e.target.value);
            api.updateText('cta-text', e.target.value);
          }}
        />
        <p className="hint">
          {ctaText.length}/{TEXT_LIMITS['cta-text']} karakter
        </p>
      </div>

      {renderImageField(
        'hero-image',
        'Ganti Gambar Utama',
        'JPG/PNG/WebP. Otomatis dikompres (maks. 600 px, ±80 KB).',
      )}

      {renderImageField(
        'logo',
        'Ganti Logo',
        'JPG/PNG/WebP. Otomatis dikompres (maks. 200 px, ±20 KB).',
      )}

      <div className="field">
        <label className="field-label" htmlFor="field-url">
          URL Landing Page
        </label>
        <input
          id="field-url"
          type="url"
          inputMode="url"
          placeholder="https://contoh.com/promo"
          value={url}
          disabled={disabled}
          onFocus={() => api.focusField('landing-url')}
          onBlur={api.blurField}
          onChange={(e) => {
            setUrl(e.target.value);
            api.updateUrl(e.target.value.trim());
          }}
        />
        {urlEmpty && (
          <p className="hint hint-warn">URL wajib diisi sebelum ekspor untuk Google Ads</p>
        )}
        {urlInvalid && (
          <p className="hint hint-error">
            Format URL tidak valid. Awali dengan http:// atau https://
          </p>
        )}
        <p className="hint">Diabaikan untuk Trade Desk (URL diisi otomatis oleh platform).</p>
      </div>
    </div>
  );
}
