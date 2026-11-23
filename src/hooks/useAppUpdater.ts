import {useCallback, useEffect, useRef, useState} from 'react';
import {
  APP_VERSION,
  DEFAULT_OTA_SERVER_URL,
  hasNewerBuildVersion,
  resolveVersionJsonUrl,
} from '../utils/apkHelpers';

const BUILD_STORAGE_KEY = 'naghma_active_build_id';

export type UpdateCheckStatus = 'idle' | 'checking' | 'uptodate' | 'available' | 'offline';

export function useAppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [status, setStatus] = useState<UpdateCheckStatus>('idle');
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);
  const initialBuildRef = useRef<string | null>(null);

  const checkForUpdates = useCallback(async (manual = false): Promise<UpdateCheckStatus> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (manual) setStatus('offline');
      return 'offline';
    }

    if (manual) setStatus('checking');

    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update().catch(() => {});
        }
      }

      const otaOverride = import.meta.env.VITE_OTA_SERVER_URL || DEFAULT_OTA_SERVER_URL;
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const versionUrl = resolveVersionJsonUrl(protocol, otaOverride);
      const res = await fetch(`${versionUrl}?t=${Date.now()}`, {cache: 'no-store'});
      if (!res.ok) {
        if (manual) setStatus('uptodate');
        return 'uptodate';
      }

      const payload = (await res.json()) as {
        version?: string;
        buildId?: string;
        otaUrl?: string;
      };
      if (payload.version) {
        setCurrentVersion(payload.version);
      }

      const remoteBuild = payload.buildId ?? null;
      const knownBuild =
        initialBuildRef.current ??
        (() => {
          try {
            return localStorage.getItem(BUILD_STORAGE_KEY);
          } catch {
            return null;
          }
        })();

      if (!knownBuild && remoteBuild) {
        initialBuildRef.current = remoteBuild;
        try {
          localStorage.setItem(BUILD_STORAGE_KEY, remoteBuild);
        } catch {
          // ignore storage limits
        }
        if (manual) setStatus('uptodate');
        return 'uptodate';
      }

      if (!initialBuildRef.current && knownBuild) {
        initialBuildRef.current = knownBuild;
      }

      if (hasNewerBuildVersion(initialBuildRef.current, remoteBuild)) {
        if (remoteBuild) {
          try {
            localStorage.setItem(BUILD_STORAGE_KEY, remoteBuild);
          } catch {
            // ignore
          }
        }
        setUpdateAvailable(true);
        setStatus('available');
        return 'available';
      }

      if (manual) setStatus('uptodate');
      return 'uptodate';
    } catch {
      if (manual) setStatus('uptodate');
      return 'uptodate';
    }
  }, []);

  const applyUpdateNow = useCallback(async () => {
    try {
      if (window.__naghmaUpdateSW) {
        await window.__naghmaUpdateSW(true);
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => !k.includes('quran-json'))
            .map((k) => caches.delete(k))
        );
      }
    } catch {
      // proceed to clean reload
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    const onSwUpdate = () => {
      setUpdateAvailable(true);
      setStatus('available');
    };
    window.addEventListener('naghma:sw-update-available', onSwUpdate);

    void checkForUpdates(false);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates(false);
      }
    };
    const onOnline = () => {
      void checkForUpdates(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('naghma:sw-update-available', onSwUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [checkForUpdates]);

  return {
    currentVersion,
    updateAvailable,
    status,
    checkForUpdates,
    applyUpdateNow,
  };
}
