import type {QuranVerse, Reciter} from '../types/quran';
import {getAyahAudioCandidates} from '../utils/quranLogic';
import {
  alignVersesToAcousticValleys,
  extractAcousticPauseValleys,
  parseMp3QuranAyatTiming,
  parseQuranComChapterTimestamps,
  type AyahTimingSegment,
} from '../utils/surahTimingLogic';
import {getCachedAudioBlob, getCachedQuranAsset, setCachedQuranAsset} from './indexedDbVault';

const LS_TIMING_PREFIX = 'naghma_timing_v3:';
const MAX_ACOUSTIC_DECODE_BYTES = 3 * 1024 * 1024;
const memoryCache = new Map<string, AyahTimingSegment[] | null>();
const inFlightRequests = new Map<string, Promise<AyahTimingSegment[] | null>>();

function getCacheKey(reciterId: string, surah: number): string {
  return `timing_v3:${reciterId}:${surah}`;
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
    // Ignore localStorage quota limits; IndexedDB holds full permanent cache
  }
}

export function getCachedSurahTimingSync(
  reciterId: string,
  surah: number
): AyahTimingSegment[] | null {
  const key = getCacheKey(reciterId, surah);
  if (memoryCache.has(key)) {
    return memoryCache.get(key) ?? null;
  }
  const lsCached = readFromLocalStorage(key);
  if (lsCached) {
    memoryCache.set(key, lsCached);
    return lsCached;
  }
  return null;
}

async function fetchQuranComTimings(
  quranComReciterId: number,
  surah: number
): Promise<AyahTimingSegment[] | null> {
  try {
    const url = `https://api.quran.com/api/v4/chapter_recitations/${quranComReciterId}/${surah}?segments=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const segments = parseQuranComChapterTimestamps(data);
    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  }
}

async function fetchMp3QuranTimings(
  mp3quranReadId: number,
  surah: number
): Promise<AyahTimingSegment[] | null> {
  try {
    const url = `https://www.mp3quran.net/api/v3/ayat_timing?surah=${surah}&read=${mp3quranReadId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const segments = parseMp3QuranAyatTiming(data);
    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  }
}

async function analyzeSurahAcousticTimings(
  reciter: Reciter,
  surah: number,
  surahVerses: QuranVerse[]
): Promise<AyahTimingSegment[] | null> {
  // Never run heavy full-file decodeAudioData on long Surahs or when JSON APIs are configured
  if (
    surahVerses.length === 0 ||
    surahVerses.length > 20 ||
    reciter.mp3quranReadId ||
    reciter.quranComReciterId ||
    typeof window === 'undefined'
  ) {
    return null;
  }
  const AudioCtx =
    window.AudioContext ||
    (window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
  if (!AudioCtx) return null;

  let arrayBuffer: ArrayBuffer | null = null;

  const cachedBlob = await getCachedAudioBlob(reciter, surah);
  if (cachedBlob && cachedBlob.size > 0 && cachedBlob.size <= MAX_ACOUSTIC_DECODE_BYTES) {
    arrayBuffer = await cachedBlob.arrayBuffer();
  } else {
    const candidates = getAyahAudioCandidates(reciter, surah, 1);
    for (const url of candidates) {
      try {
        const res = await fetch(url, {mode: 'cors'});
        if (!res.ok) continue;
        const contentLen = Number(res.headers.get('content-length') || '0');
        if (contentLen > MAX_ACOUSTIC_DECODE_BYTES) {
          return null;
        }
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 0 && buf.byteLength <= MAX_ACOUSTIC_DECODE_BYTES) {
          arrayBuffer = buf;
          break;
        }
      } catch {
        // Try next CORS mirror
      }
    }
  }

  if (!arrayBuffer) return null;

  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const pcm = decoded.getChannelData(0);
    const durationMs = Math.round(decoded.duration * 1000);
    const valleys = extractAcousticPauseValleys(pcm, decoded.sampleRate);
    const segments = alignVersesToAcousticValleys(surahVerses, durationMs, surah, valleys);
    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  } finally {
    void ctx.close().catch(() => {
      // Ignore close errors
    });
  }
}

/**
 * Resolves exact verse timestamps for a full-Surah reciter instantaneously:
 * 1. Permanent cache lookup (Memory -> localStorage -> IndexedDB)
 * 2. MP3Quran v3 ayat_timing (e.g. read=236 for Al-Luhaidan, read=80/16/120 for Warsh)
 * 3. Quran.com v4 chapter_recitations (e.g. 174 fallback for Al-Luhaidan)
 * 4. Tiny-Surah acoustic pause alignment only when no upstream JSON exists (< 3 MB)
 */
export async function getSurahAyatTiming(
  reciter: Reciter,
  surah: number,
  surahVerses: QuranVerse[] = []
): Promise<AyahTimingSegment[] | null> {
  if (surah < 1 || surah > 114) {
    return null;
  }

  const key = getCacheKey(reciter.id, surah);
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

      let segments: AyahTimingSegment[] | null = null;

      // For MP3Quran reciters (like Al-Luhaidan read=236), fetch lightweight JSON timestamps first
      if (reciter.mp3quranReadId) {
        segments = await fetchMp3QuranTimings(reciter.mp3quranReadId, surah);
      }

      if (!segments && reciter.quranComReciterId) {
        segments = await fetchQuranComTimings(reciter.quranComReciterId, surah);
      }

      if (!segments && surahVerses.length > 0) {
        segments = await analyzeSurahAcousticTimings(reciter, surah, surahVerses);
      }

      if (!segments || segments.length === 0) {
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
