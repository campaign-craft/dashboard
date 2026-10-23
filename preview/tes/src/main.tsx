import { createRoot } from 'react-dom/client';
import 'grapesjs/dist/css/grapes.min.css';
import './ui/styles.css';
import App from './ui/App';

// Catatan: StrictMode sengaja tidak dipakai agar GrapesJS tidak di-init dua kali saat dev.
createRoot(document.getElementById('root') as HTMLElement).render(<App />);
