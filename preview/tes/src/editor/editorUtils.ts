import type { Component, Editor } from 'grapesjs';

export type TextKey = 'headline' | 'subheadline' | 'cta-text';
export type ImageKey = 'hero-image' | 'logo';
export type EditableKey = TextKey | ImageKey | 'landing-url';

/** Nilai awal atribut data-editable-url di template (penanda, bukan URL sungguhan). */
export const URL_MARKER = 'landing-url';

/** Kumpulkan semua komponen turunan secara rekursif (berbasis model, tidak butuh DOM canvas). */
export function collectComponents(root: Component): Component[] {
  const out: Component[] = [];
  const walk = (comp: Component) => {
    comp.components().forEach((child: Component) => {
      out.push(child);
      walk(child);
    });
  };
  walk(root);
  return out;
}

/** Cari komponen berdasarkan nilai data-editable. 'landing-url' dipetakan ke elemen CTA. */
export function findEditable(editor: Editor, key: EditableKey): Component | undefined {
  const wrapper = editor.getWrapper();
  if (!wrapper) return undefined;
  const attrValue = key === 'landing-url' ? 'cta-text' : key;
  return collectComponents(wrapper).find(
    (c) => c.getAttributes()['data-editable'] === attrValue,
  );
}

/** Baca URL landing page yang tersimpan di elemen CTA (string kosong jika belum diisi). */
export function readLandingUrl(editor: Editor): string {
  const cta = findEditable(editor, 'cta-text');
  const value = cta?.getAttributes()['data-editable-url'];
  return typeof value === 'string' && value !== URL_MARKER ? value.trim() : '';
}
