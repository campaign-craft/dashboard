import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Editor } from 'grapesjs';
import { createBannerEditor, lockAllExceptEditable } from './EditorCanvas';
import { compressImage, type CompressedImage } from './compressImage';
import {
  findEditable,
  readLandingUrl,
  type EditableKey,
  type ImageKey,
  type TextKey,
} from './editorUtils';
import { isValidUrl } from '../export/validate';

export interface BannerEditorApi {
  ready: boolean;
  getEditor: () => Editor | null;
  updateText: (key: TextKey, value: string) => void;
  updateImage: (key: ImageKey, file: File) => Promise<CompressedImage>;
  updateUrl: (value: string) => void;
  getLandingUrl: () => string;
  /** Highlight elemen di kanvas saat field di panel difokuskan. */
  focusField: (key: EditableKey) => void;
  blurField: () => void;
}

export function useGrapesEditor(containerRef: RefObject<HTMLDivElement>): BannerEditorApi {
  const editorRef = useRef<Editor | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const editor = createBannerEditor(container);
    editorRef.current = editor;
    const onLoad = () => setReady(true);
    editor.on('load', onLoad);

    return () => {
      editor.off('load', onLoad);
      editor.destroy();
      editorRef.current = null;
      setReady(false);
    };
  }, [containerRef]);

  const getEditor = useCallback(() => editorRef.current, []);

  const updateText = useCallback((key: TextKey, value: string) => {
    const editor = editorRef.current;
    const comp = editor && findEditable(editor, key);
    if (!editor || !comp) return;
    // Ganti isi dengan textnode (otomatis di-escape saat diekspor, aman dari injeksi HTML).
    comp.components([{ type: 'textnode', content: value }]);
    lockAllExceptEditable(editor);
  }, []);

  const updateImage = useCallback(async (key: ImageKey, file: File) => {
    const result = await compressImage(file, key);
    const editor = editorRef.current;
    const comp = editor && findEditable(editor, key);
    if (!comp) throw new Error('Editor belum siap.');
    comp.set('src', result.dataUrl);
    comp.addAttributes({ src: result.dataUrl });
    return result;
  }, []);

  const updateUrl = useCallback((value: string) => {
    const editor = editorRef.current;
    const cta = editor && findEditable(editor, 'cta-text');
    if (!cta) return;
    // Simpan URL di atribut CTA; href hanya diisi jika URL valid (untuk pratinjau).
    cta.addAttributes({
      'data-editable-url': value,
      href: isValidUrl(value) ? value : '#',
    });
  }, []);

  const getLandingUrl = useCallback(() => {
    const editor = editorRef.current;
    return editor ? readLandingUrl(editor) : '';
  }, []);

  const focusField = useCallback((key: EditableKey) => {
    const editor = editorRef.current;
    const comp = editor && findEditable(editor, key);
    if (editor && comp) editor.select(comp);
  }, []);

  const blurField = useCallback(() => {
    const editor = editorRef.current;
    if (editor) editor.selectRemove(editor.getSelectedAll());
  }, []);

  return {
    ready,
    getEditor,
    updateText,
    updateImage,
    updateUrl,
    getLandingUrl,
    focusField,
    blurField,
  };
}
