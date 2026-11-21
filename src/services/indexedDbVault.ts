import type {
  BookmarkEntry,
  KhatmaPlan,
  LastReadState,
  OfflineSurahRecord,
  ReaderSettings,
  Reciter,
  SurahMeta,
} from '../types/quran';
import {getAyahAudioCandidates} from '../utils/quranLogic';

const DB_NAME = 'naghma_quran_db';
const DB_VERSION = 1;

const STORE_QURAN = 'quran_data';
const STORE_AUDIO = 'audio_blobs';
const STORE_OFFLINE_INDEX = 'offline_surahs';
const STORE_USER = 'user_state';

let dbPromise: Promise<IDBDatabase> | null = null;

function openVaultDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_QURAN)) {
        db.createObjectStore(STORE_QURAN);
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
      if (!db.objectStoreNames.contains(STORE_OFFLINE_INDEX)) {
        db.createObjectStore(STORE_OFFLINE_INDEX, {keyPath: 'key'});
      }
      if (!db.objectStoreNames.contains(STORE_USER)) {
        db.createObjectStore(STORE_USER);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
  return dbPromise;
}

async function idbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  try {
    const db = await openVaultDB();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbSet(storeName: string, key: string, value: unknown): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.keyPath ? store.put(value) : store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore storage quota errors gracefully
  }
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openVaultDB();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve((req.result || []) as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── Quran Data Cache ───────────────────────────────────────────────────────────
export async function getCachedQuranAsset<T>(key: string): Promise<T | undefined> {
  return idbGet<T>(STORE_QURAN, key);
}

export async function setCachedQuranAsset(key: string, data: unknown): Promise<void> {
  await idbSet(STORE_QURAN, key, data);
}

export async function getQuranVaultKeys(): Promise<string[]> {
  try {
    const db = await openVaultDB();
    return await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_QURAN, 'readonly');
      const req = tx.objectStore(STORE_QURAN).getAllKeys();
      req.onsuccess = () => resolve((req.result || []).map(String));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── User State (Bookmarks, Last Read, Settings) ───────────────────────────────
export async function loadBookmarks(): Promise<BookmarkEntry[]> {
  try {
    const ls =
      localStorage.getItem('naghma_bookmarks') || localStorage.getItem('noor_bookmarks');
    if (ls) return JSON.parse(ls) as BookmarkEntry[];
  } catch {
    // ignore
  }
  return (await idbGet<BookmarkEntry[]>(STORE_USER, 'bookmarks')) || [];
}

export async function saveBookmarks(bookmarks: BookmarkEntry[]): Promise<void> {
  try {
    localStorage.setItem('naghma_bookmarks', JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
  await idbSet(STORE_USER, 'bookmarks', bookmarks);
}

export async function loadLastRead(): Promise<LastReadState | null> {
  try {
    const ls =
      localStorage.getItem('naghma_last_read') || localStorage.getItem('noor_last_read');
    if (ls) return JSON.parse(ls) as LastReadState;
  } catch {
    // ignore
  }
  return (await idbGet<LastReadState>(STORE_USER, 'last_read')) || null;
}

export async function saveLastRead(state: LastReadState): Promise<void> {
  try {
    localStorage.setItem('naghma_last_read', JSON.stringify(state));
  } catch {
    // ignore
  }
  await idbSet(STORE_USER, 'last_read', state);
}

export async function loadSettings(): Promise<Partial<ReaderSettings>> {
  try {
    const ls =
      localStorage.getItem('naghma_settings') || localStorage.getItem('noor_settings');
    if (ls) return JSON.parse(ls) as Partial<ReaderSettings>;
  } catch {
    // ignore
  }
  return (await idbGet<Partial<ReaderSettings>>(STORE_USER, 'settings')) || {};
}

export async function saveSettings(settings: ReaderSettings): Promise<void> {
  try {
    localStorage.setItem('naghma_settings', JSON.stringify(settings));
    localStorage.setItem('naghma_theme', settings.theme);
  } catch {
    // ignore
  }
  await idbSet(STORE_USER, 'settings', settings);
}

export async function loadKhatmaPlan(): Promise<KhatmaPlan | null> {
  try {
    const ls =
      localStorage.getItem('naghma_khatma_plan') || localStorage.getItem('noor_khatma_plan');
    if (ls) return JSON.parse(ls) as KhatmaPlan;
  } catch {
    // ignore
  }
  return (await idbGet<KhatmaPlan>(STORE_USER, 'khatma_plan')) || null;
}

export async function saveKhatmaPlan(plan: KhatmaPlan): Promise<void> {
  try {
    localStorage.setItem('naghma_khatma_plan', JSON.stringify(plan));
  } catch {
    // ignore
  }
  await idbSet(STORE_USER, 'khatma_plan', plan);
}

export async function loadAdhkarProgress(
  dateISO: string
): Promise<Record<string, number>> {
  const key = `adhkar_${dateISO}`;
  try {
    const ls =
      localStorage.getItem(`naghma_${key}`) || localStorage.getItem(`noor_${key}`);
    if (ls) return JSON.parse(ls) as Record<string, number>;
  } catch {
    // ignore
  }
  return (await idbGet<Record<string, number>>(STORE_USER, key)) || {};
}

export async function saveAdhkarProgress(
  dateISO: string,
  counts: Record<string, number>
): Promise<void> {
  const key = `adhkar_${dateISO}`;
  try {
    localStorage.setItem(`naghma_${key}`, JSON.stringify(counts));
  } catch {
    // ignore
  }
  await idbSet(STORE_USER, key, counts);
}

// ── Audio Offline Cache ────────────────────────────────────────────────────────
export function getAudioBlobKey(reciter: Reciter, surah: number, ayah?: number): string {
  if (reciter.mode === 'surah' || ayah === undefined) {
    return `${reciter.id}:surah:${surah}`;
  }
  return `${reciter.id}:${surah}:${ayah}`;
}

export async function getCachedAudioBlob(
  reciter: Reciter,
  surah: number,
  ayah?: number
): Promise<Blob | undefined> {
  const key = getAudioBlobKey(reciter, surah, ayah);
  return idbGet<Blob>(STORE_AUDIO, key);
}

export async function getOfflineSurahs(): Promise<OfflineSurahRecord[]> {
  return idbGetAll<OfflineSurahRecord>(STORE_OFFLINE_INDEX);
}

export async function downloadSurahOffline(
  reciter: Reciter,
  surahMeta: SurahMeta,
  onProgress: (completed: number, total: number, bytes: number) => void,
  signal?: AbortSignal
): Promise<OfflineSurahRecord> {
  const tasks: Array<{key: string; urls: string[]}> = [];

  if (reciter.mode === 'surah') {
    tasks.push({
      key: getAudioBlobKey(reciter, surahMeta.id),
      urls: getAyahAudioCandidates(reciter, surahMeta.id, 1),
    });
  } else {
    for (let ayah = 1; ayah <= surahMeta.totalAyahs; ayah++) {
      tasks.push({
        key: getAudioBlobKey(reciter, surahMeta.id, ayah),
        urls: getAyahAudioCandidates(reciter, surahMeta.id, ayah),
      });
    }
  }

  let completed = 0;
  let totalBytes = 0;
  const total = tasks.length;
  onProgress(0, total, 0);

  const concurrency = 4;
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      if (signal?.aborted) {
        throw new DOMException('Download cancelled', 'AbortError');
      }
      const idx = cursor++;
      const item = tasks[idx];
      const existing = await idbGet<Blob>(STORE_AUDIO, item.key);
      if (existing) {
        totalBytes += existing.size;
        completed++;
        onProgress(completed, total, totalBytes);
        continue;
      }
      let blob: Blob | null = null;
      let lastError: Error | null = null;
      for (const candidateUrl of item.urls) {
        try {
          const res = await fetch(candidateUrl, {signal, mode: 'cors'});
          if (!res.ok) {
            lastError = new Error(`HTTP ${res.status} fetching ${candidateUrl}`);
            continue;
          }
          blob = await res.blob();
          break;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') throw err;
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
      if (!blob) {
        throw lastError || new Error(`Failed to fetch audio for ${item.key}`);
      }
      await idbSet(STORE_AUDIO, item.key, blob);
      totalBytes += blob.size;
      completed++;
      onProgress(completed, total, totalBytes);
    }
  }

  await Promise.all(Array.from({length: Math.min(concurrency, tasks.length)}, () => worker()));

  const record: OfflineSurahRecord = {
    key: `${reciter.id}:${surahMeta.id}`,
    reciterId: reciter.id,
    surah: surahMeta.id,
    totalFiles: total,
    bytes: totalBytes,
    downloadedAt: Date.now(),
  };
  await idbSet(STORE_OFFLINE_INDEX, record.key, record);
  return record;
}

export async function deleteOfflineSurah(
  reciter: Reciter,
  surahMeta: SurahMeta
): Promise<void> {
  if (reciter.mode === 'surah') {
    await idbDelete(STORE_AUDIO, getAudioBlobKey(reciter, surahMeta.id));
  } else {
    for (let ayah = 1; ayah <= surahMeta.totalAyahs; ayah++) {
      await idbDelete(STORE_AUDIO, getAudioBlobKey(reciter, surahMeta.id, ayah));
    }
  }
  await idbDelete(STORE_OFFLINE_INDEX, `${reciter.id}:${surahMeta.id}`);
}

export async function clearAllAudioCache(): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_AUDIO, STORE_OFFLINE_INDEX], 'readwrite');
      tx.objectStore(STORE_AUDIO).clear();
      tx.objectStore(STORE_OFFLINE_INDEX).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export async function getStorageEstimate(): Promise<{usage: number; quota: number}> {
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      return {
        usage: est.usage || 0,
        quota: est.quota || 0,
      };
    } catch {
      return {usage: 0, quota: 0};
    }
  }
  return {usage: 0, quota: 0};
}
