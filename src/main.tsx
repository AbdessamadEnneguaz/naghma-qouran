import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __naghmaUpdateSW?: (reloadPage?: boolean) => Promise<void>;
  }
}

// Register VitePWA Service Worker with automatic background update detection
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('naghma:sw-update-available'));
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        window.setInterval(() => {
          void registration.update().catch(() => {});
        }, 15 * 60 * 1000);
      }
    },
    onOfflineReady() {
      // Offline shell ready
    },
  });
  window.__naghmaUpdateSW = updateSW;
}

createRoot(document.getElementById('root')!).render(<App />);
