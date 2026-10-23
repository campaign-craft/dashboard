import { useRef } from 'react';
import { EditorCanvas } from '../editor/EditorCanvas';
import { SidePanel } from '../editor/SidePanel';
import { useGrapesEditor } from '../editor/useGrapesEditor';
import { ExportButtons } from './ExportButtons';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const api = useGrapesEditor(containerRef);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Banner Editor</h1>
        <p>Ubah konten banner Anda, lalu ekspor</p>
      </header>

      <main className="workspace">
        <section className="stage-area">
          <EditorCanvas containerRef={containerRef} />
        </section>

        <aside className="panel">
          <div className="panel-scroll">
            <SidePanel api={api} />
          </div>
          <div className="panel-footer">
            <ExportButtons api={api} />
          </div>
        </aside>
      </main>
    </div>
  );
}
