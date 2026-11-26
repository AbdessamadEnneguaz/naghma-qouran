import React from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __naghmaUpdateSW?: (reloadPage?: boolean) => Promise<void>;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }
}

function isCapacitorNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    const proto = window.location.protocol;
    return proto === 'capacitor:' || proto === 'file:';
  } catch {
    return false;
  }
}

// Register VitePWA Service Worker for web/PWA browsers only; native Capacitor serves local bundle directly
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (isCapacitorNativeRuntime()) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {});
  } else {
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
}

interface BoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  {children: React.ReactNode},
  BoundaryState
> {
  state: BoundaryState = {hasError: false, errorMessage: ''};

  static getDerivedStateFromError(error: Error): BoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected startup error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: '#F4F7F5',
            color: '#142019',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{fontSize: '20px', fontWeight: 700, marginBottom: '8px'}}>
            Mihrab Noor · مِحْرَاب النُّور
          </h1>
          <p style={{fontSize: '13px', color: '#5A6B62', marginBottom: '16px', maxWidth: '320px'}}>
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#27784C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
