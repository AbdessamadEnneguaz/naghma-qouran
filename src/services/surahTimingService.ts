import {getCachedQuranAsset, setCachedQuranAsset} from './indexedDbVault';
import {
  parseMp3QuranAyatTiming,
  type AyahTimingSegment,
} from '../utils/surahTimingLogic';

const LS_TIMING_PREFIX = 'naghma_timing_v1:';
const memoryCache = new Map<string, AyahTimingSegment[] | null>();
const inFlightRequests = new Map<string, Promise<AyahTimingSegment[] | null>>();

function getCacheKey(readId: number, surah: number): string {
  return `timing:${readId}:${surah}`;
}

function readFromLocalStorage(key: string): AyahTimingSegment[] | null {
  try {
    const raw = localStorage.getItem(`${LS_TIMING_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AyahTimingSegment[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage(key: string, segments: AyahTimingSegment[]): void {
  try {
    localStorage.setItem(`${LS_TIMING_PREFIX}${key}`, JSON.stringify(segments));
  } catch {
    // Ignore localStorage quota limits; IndexedDB holds full cache
  }
}

/**
 * Fetches exact per-Ayah millisecond timestamps from MP3Quran's keyless public
 * ayat_timing endpoint and caches valid schedules in Memory + IndexedDB + localStorage.
 * Returns null if the reciter/surah has no published upstream timing table.
 */
export async function getSurahAyatTiming(
  readId: number,
  surah: number
): Promise<AyahTimingSegment[] | null> {
  if (!Number.isInteger(readId) || readId <= 0 || surah < 1 || surah > 114) {
    return null;
  }

  const key = getCacheKey(readId, surah);
  if (memoryCache.has(key)) {
    return memoryCache.get(key) ?? null;
  }

  const lsCached = readFromLocalStorage(key);
  if (lsCached) {
    memoryCache.set(key, lsCached);
    return lsCached;
  }

  const existingReq = inFlightRequests.get(key);
  if (existingReq) return existingReq;

  const reqPromise = (async (): Promise<AyahTimingSegment[] | null> => {
    try {
      const idbCached = await getCachedQuranAsset<AyahTimingSegment[]>(key);
      if (Array.isArray(idbCached) && idbCached.length > 0) {
        memoryCache.set(key, idbCached);
        writeToLocalStorage(key, idbCached);
        return idbCached;
      }

      const url = `https://www.mp3quran.net/api/v3/ayat_timing?surah=${surah}&read=${readId}`;
      const res = await fetch(url);
      if (!res.ok) {
        memoryCache.set(key, null);
        return null;
      }

      const data: unknown = await res.json();
      const segments = parseMp3QuranAyatTiming(data);
      if (segments.length === 0) {
        memoryCache.set(key, null);
        return null;
      }

      memoryCache.set(key, segments);
      writeToLocalStorage(key, segments);
      await setCachedQuranAsset(key, segments);
      return segments;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, reqPromise);
  return reqPromise;
}
