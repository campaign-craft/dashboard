import { useEffect, useState } from 'react';
import type { BannerEditorApi } from '../editor/useGrapesEditor';
import {
  downloadBlob,
  exportForGoogleAds,
  exportForTradeDesk,
  type BuiltExport,
} from '../export/exportZip';
import { formatBytes } from '../export/validate';

interface Props {
  api: BannerEditorApi;
}

type Outcome =
  | { kind: 'built'; built: BuiltExport; label: string }
  | { kind: 'crash'; message: string };

export function ExportButtons({ api }: Props) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!outcome) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOutcome(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [outcome]);

  const run = async (
    label: string,
    fn: (editor: NonNullable<ReturnType<BannerEditorApi['getEditor']>>) => Promise<BuiltExport>,
  ) => {
    const editor = api.getEditor();
    if (!editor) return;
    setBusy(true);
    try {
      const built = await fn(editor);
      setOutcome({ kind: 'built', built, label });
    } catch (err) {
      setOutcome({
        kind: 'crash',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat file ZIP.',
      });
    } finally {
      setBusy(false);
    }
  };

  const close = () => setOutcome(null);

  return (
    <>
      <div className="export-buttons">
        <button
          type="button"
          className="btn btn-google"
          disabled={!api.ready || busy}
          onClick={() => run('Google Ads', exportForGoogleAds)}
        >
          Export untuk Google Ads
        </button>
        <button
          type="button"
          className="btn btn-ttd"
          disabled={!api.ready || busy}
          onClick={() => run('The Trade Desk', exportForTradeDesk)}
        >
          Export untuk The Trade Desk
        </button>
      </div>

      {busy && (
        <div className="overlay" role="status" aria-live="polite">
          <div className="loading-card">
            <div className="spinner" />
            <p>Menyiapkan file ZIP…</p>
          </div>
        </div>
      )}

      {outcome && (
        <div className="overlay" onClick={close}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {outcome.kind === 'crash' ? (
              <>
                <h2 id="modal-title" className="modal-title modal-title-error">
                  Ekspor gagal
                </h2>
                <p>{outcome.message}</p>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={close}>
                    Tutup
                  </button>
                </div>
              </>
            ) : (
              <BuiltModal outcome={outcome} onClose={close} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function BuiltModal({
  outcome,
  onClose,
}: {
  outcome: Extract<Outcome, { kind: 'built' }>;
  onClose: () => void;
}) {
  const { built, label } = outcome;
  const { validation } = built;

  return (
    <>
      <h2
        id="modal-title"
        className={validation.ok ? 'modal-title modal-title-ok' : 'modal-title modal-title-error'}
      >
        {validation.ok ? `Siap diekspor · ${label}` : `Ekspor diblokir · ${label}`}
      </h2>

      <ul className="checks">
        {validation.checks.map((c) => (
          <li key={c.label} className={c.ok ? 'check check-ok' : 'check check-fail'}>
            <span className="check-icon" aria-hidden="true">
              {c.ok ? '✓' : '✗'}
            </span>
            <span>
              {c.label}
              {c.detail && <em> — {c.detail}</em>}
            </span>
          </li>
        ))}
      </ul>

      {validation.errors.length > 0 && (
        <div className="notice notice-error">
          {validation.errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="notice notice-warn">
          {validation.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      <p className="modal-meta">
        {built.filename} · {formatBytes(built.sizeBytes)}
      </p>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {validation.ok ? 'Batal' : 'Tutup'}
        </button>
        {validation.ok && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              downloadBlob(built.blob, built.filename);
              onClose();
            }}
          >
            Download ZIP
          </button>
        )}
      </div>
    </>
  );
}
