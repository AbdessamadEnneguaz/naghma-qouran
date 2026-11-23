import {useCallback, useEffect, useRef, useState} from 'react';
import {canUseWakeLock} from '../utils/mediaSessionLogic';

const WAKE_LOCK_STORAGE_KEY = 'najm_wake_lock_enabled';

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

function readInitialPreference(): boolean {
  try {
    return localStorage.getItem(WAKE_LOCK_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useWakeLock() {
  const isSupported =
    typeof navigator !== 'undefined' &&
    canUseWakeLock(navigator as unknown as {wakeLock?: unknown});

  const [enabled, setEnabled] = useState<boolean>(readInitialPreference);
  const [isActive, setIsActive] = useState<boolean>(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  const releaseWakeLock = useCallback(async () => {
    const current = sentinelRef.current;
    sentinelRef.current = null;
    setIsActive(false);
    if (current && !current.released) {
      try {
        await current.release();
      } catch {
        // Ignore already-released sentinel errors
      }
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    if (!isSupported) return false;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return false;
    }
    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsActive(true);
      return true;
    }
    try {
      const wakeLockApi = (
        navigator as unknown as {
          wakeLock?: {request: (type: 'screen') => Promise<WakeLockSentinelLike>};
        }
      ).wakeLock;
      if (!wakeLockApi) return false;

      const sentinel = await wakeLockApi.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);

      const handleRelease = () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setIsActive(false);
        }
      };
      sentinel.addEventListener?.('release', handleRelease);
      return true;
    } catch {
      // Browser may deny Wake Lock until user gesture or battery saver disables it
      setIsActive(false);
      return false;
    }
  }, [isSupported]);

  useEffect(() => {
    try {
      localStorage.setItem(WAKE_LOCK_STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // ignore storage errors
    }

    if (enabled) {
      void acquireWakeLock();
    } else {
      void releaseWakeLock();
    }
  }, [enabled, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        void acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void releaseWakeLock();
    };
  }, [enabled, acquireWakeLock, releaseWakeLock]);

  const toggleWakeLock = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return {
    isSupported,
    enabled,
    isActive,
    toggleWakeLock,
    setEnabled,
  };
}
