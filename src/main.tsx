import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register VitePWA Service Worker for full offline shell caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      // Ready for offline usage
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
