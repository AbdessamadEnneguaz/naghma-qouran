import {useCallback, useEffect, useRef, useState} from 'react';
import {
  APP_VERSION,
  getBundledBuildId,
  hasNewerBuildVersion,
  isCapacitorAppOrigin,
  loadAutoOtaSync,
  loadOtaServerUrl,
  resolveVersionJsonUrl,
  saveAutoOtaSync,
  saveOtaServerUrl,
} from '../utils/apkHelpers';

const BUILD_STORAGE_KEY = 'naghma_active_build_id';

export type UpdateCheckStatus = 'idle' | 'checking' | 'uptodate' | 'available' | 'offline';

async function verifyLiveEndpointReachable(baseUrl: string): Promise<boolean> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? window.setTimeout(() => controller.abort(), 4500) : null;
  try {
    const clean = baseUrl.replace(/\/+$/, '');
    const res = await fetch(`${clean}/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      signal: controller?.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {version?: string; buildId?: string};
    return Boolean(data?.version && data?.buildId);
  } catch {
    return false;
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

export function useAppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [status, setStatus] = useState<UpdateCheckStatus>('idle');
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [otaServerUrl, setOtaServerUrlState] = useState<string>(loadOtaServerUrl);
  const [autoOtaSync, setAutoOtaSyncState] = useState<boolean>(loadAutoOtaSync);
  const initialBuildRef = useRef<string | null>(getBundledBuildId());
  const remoteOtaTargetRef = useRef<string | null>(null);

  const setOtaServerUrl = useCallback((url: string) => {
    const saved = saveOtaServerUrl(url);
    setOtaServerUrlState(saved);
    return saved;
  }, []);

  const setAutoOtaSync = useCallback((enabled: boolean) => {
    saveAutoOtaSync(enabled);
    setAutoOtaSyncState(enabled);
  }, []);

  const checkForUpdates = useCallback(
    async (manual = false): Promise<UpdateCheckStatus> => {
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

        const otaOverride = import.meta.env.VITE_OTA_SERVER_URL || otaServerUrl;
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const isNativeCap = isCapacitorAppOrigin(protocol, hostname);
        const versionUrl = resolveVersionJsonUrl(protocol, otaOverride, isNativeCap);

        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? window.setTimeout(() => controller.abort(), 4500) : null;
        const res = await fetch(`${versionUrl}?t=${Date.now()}`, {
          cache: 'no-store',
          signal: controller?.signal,
        }).finally(() => {
          if (timer) window.clearTimeout(timer);
        });

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
          setRemoteVersion(payload.version);
          if (!isNativeCap) {
            setCurrentVersion(payload.version);
          }
        }

        const remoteBuild = payload.buildId ?? null;
        const bundledBuild = initialBuildRef.current;

        // If on web and bundled build wasn't set statically, compare with previously seen build
        let baselineBuild = bundledBuild;
        if (!baselineBuild || baselineBuild.startsWith('local-')) {
          try {
            const stored = localStorage.getItem(BUILD_STORAGE_KEY);
            if (stored) baselineBuild = stored;
          } catch {
            // ignore
          }
        }

        if (remoteBuild && baselineBuild && hasNewerBuildVersion(baselineBuild, remoteBuild)) {
          remoteOtaTargetRef.current = payload.otaUrl || otaOverride;
          setUpdateAvailable(true);
          setStatus('available');
          return 'available';
        }

        if (remoteBuild) {
          try {
            localStorage.setItem(BUILD_STORAGE_KEY, remoteBuild);
          } catch {
            // ignore
          }
        }

        if (manual) setStatus('uptodate');
        return 'uptodate';
      } catch {
        if (manual) setStatus('uptodate');
        return 'uptodate';
      }
    },
    [otaServerUrl]
  );

  const applyUpdateNow = useCallback(async () => {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isNativeCap = isCapacitorAppOrigin(protocol, hostname);

    // If inside native APK running offline localhost and live site OTA target is healthy, sync directly!
    if (isNativeCap && autoOtaSync) {
      const targetUrl = remoteOtaTargetRef.current || otaServerUrl;
      const healthy = await verifyLiveEndpointReachable(targetUrl);
      if (healthy) {
        window.location.replace(targetUrl.replace(/\/+$/, ''));
        return;
      }
    }

    try {
      if (window.__naghmaUpdateSW) {
        await window.__naghmaUpdateSW(true);
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((k) => !k.includes('quran-json')).map((k) => caches.delete(k))
        );
      }
    } catch {
      // proceed to clean reload
    }
    window.location.reload();
  }, [autoOtaSync, otaServerUrl]);

  useEffect(() => {
    const onSwUpdate = () => {
      setUpdateAvailable(true);
      setStatus('available');
    };
    window.addEventListener('naghma:sw-update-available', onSwUpdate);

    // Defer initial update network ping slightly so first paint & Quran data stay 100% unobstructed
    const bootTimer = window.setTimeout(() => {
      void checkForUpdates(false);
    }, 1800);

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
      window.clearTimeout(bootTimer);
      window.removeEventListener('naghma:sw-update-available', onSwUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [checkForUpdates]);

  return {
    currentVersion,
    remoteVersion,
    updateAvailable,
    status,
    otaServerUrl,
    autoOtaSync,
    setOtaServerUrl,
    setAutoOtaSync,
    checkForUpdates,
    applyUpdateNow,
  };
}
