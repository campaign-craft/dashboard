import type { RefObject } from 'react';
import grapesjs, { type Component, type Editor } from 'grapesjs';
import { BANNER_SIZE, bannerTemplate } from '../template/bannerTemplate';
import { collectComponents } from './editorUtils';

/** Properti yang dikunci untuk SEMUA komponen: tidak bisa dipindah, dihapus, disalin, diubah gayanya. */
const LOCK_COMMON = {
  locked: true,
  draggable: false,
  removable: false,
  copyable: false,
  movable: false,
  droppable: false,
  resizable: false,
  editable: false, // mematikan rich-text editor bawaan (double-click)
  stylable: false,
  layerable: false,
  badgable: false,
  toolbar: [] as never[],
};

/**
 * Kunci semua komponen kecuali yang punya data-editable.
 * - Non-editable: tidak bisa dipilih / di-hover sama sekali.
 * - Editable: tetap bisa dipilih (agar bisa di-highlight dari panel) tapi tidak bisa dipindah.
 */
export function lockAllExceptEditable(editor: Editor): void {
  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  wrapper.set({ ...LOCK_COMMON, selectable: false, hoverable: false });

  collectComponents(wrapper).forEach((comp: Component) => {
    const editable = Boolean(comp.getAttributes()['data-editable']);
    if (editable) {
      comp.set({ ...LOCK_COMMON });
    } else {
      comp.set({ ...LOCK_COMMON, selectable: false, hoverable: false });
    }
  });
}

/** Buat instance GrapesJS tanpa UI bawaan, muat template, lalu kunci semuanya. */
export function createBannerEditor(container: HTMLElement): Editor {
  const editor = grapesjs.init({
    container,
    width: `${BANNER_SIZE.width}px`,
    height: `${BANNER_SIZE.height}px`,
    fromElement: false,
    storageManager: false,
    noticeOnUnload: false,
    cssIcons: '', // jangan memuat Font Awesome dari CDN (tidak ada ikon yang dipakai)
    panels: { defaults: [] },
    blockManager: { blocks: [] },
    layerManager: { appendTo: '#hidden-layers' },
    styleManager: false,
    traitManager: { appendTo: '#hidden-traits' },
    deviceManager: { devices: [] },
    keymaps: { defaults: {} }, // matikan shortcut (hapus, copy, paste, undo, dll.)
    canvas: { styles: [], scripts: [] },
  } as unknown as Parameters<typeof grapesjs.init>[0]);

  editor.setComponents(bannerTemplate);

  // Elemen yang bisa dipilih hanyalah yang data-editable; toolbar selalu kosong.
  editor.on('component:selected', (comp: Component) => {
    if (!comp.getAttributes()['data-editable']) {
      editor.selectRemove(comp);
      return;
    }
    comp.set('toolbar', []);
  });

  lockAllExceptEditable(editor);
  editor.on('load', () => lockAllExceptEditable(editor));

  return editor;
}

interface EditorCanvasProps {
  containerRef: RefObject<HTMLDivElement>;
}

/** Kanvas banner. Instance GrapesJS dibuat oleh useGrapesEditor pada container ini. */
export function EditorCanvas({ containerRef }: EditorCanvasProps) {
  return (
    <div className="stage">
      <div className="stage-frame">
        <div
          ref={containerRef}
          className="banner-host"
          style={{ width: BANNER_SIZE.width, height: BANNER_SIZE.height }}
        />
      </div>
      <p className="stage-caption">
        Pratinjau banner · {BANNER_SIZE.width} × {BANNER_SIZE.height} px
      </p>
      {/* Wadah tersembunyi yang dibutuhkan konfigurasi GrapesJS */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <div id="hidden-layers" />
        <div id="hidden-traits" />
      </div>
    </div>
  );
}
