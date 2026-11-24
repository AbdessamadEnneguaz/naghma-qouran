import type {QuranVerse, Riwayat, SurahMeta} from '../types/quran';
import {clampPage, stripTashkeel} from '../utils/quranLogic';
import {
  getCachedQuranAsset,
  setCachedQuranAsset,
  setCachedQuranAssets,
} from './indexedDbVault';

export type CompactHafsRow = [number, number, number, number, number, number, string];

const pageVersesMemCache = new Map<number, QuranVerse[]>();
const pageNormalizedReady = new Set<number>();
let fullRowsMemPromise: Promise<CompactHafsRow[]> | null = null;
let allVersesMemCache: QuranVerse[] | null = null;
let warshMemPromise: Promise<string[]> | null = null;
let tafsirMemPromise: Promise<string[]> | null = null;
let translationEnMemPromise: Promise<string[]> | null = null;
let translationFrMemPromise: Promise<string[]> | null = null;

function hydratePageRows(
  rows: Array<{index: number; row: CompactHafsRow}>,
  withNormalized = false
): QuranVerse[] {
  return rows.map(({index, row}) => ({
    index,
    surah: row[0],
    ayah: row[1],
    page: row[2],
    juz: row[3],
    hizbQuarter: row[4],
    sajda: row[5] === 1,
    text: row[6],
    searchNormalized: withNormalized ? stripTashkeel(row[6]) : undefined,
  }));
}

function hydrateAllHafsVerses(rows: CompactHafsRow[]): QuranVerse[] {
  return rows.map((row, index) => ({
    index,
    surah: row[0],
    ayah: row[1],
    page: row[2],
    juz: row[3],
    hizbQuarter: row[4],
    sajda: row[5] === 1,
    text: row[6],
    searchNormalized: stripTashkeel(row[6]),
  }));
}

async function fetchJsonWithFallback<T>(localPath: string, cdnUrl?: string): Promise<T> {
  try {
    const localRes = await fetch(localPath);
    if (localRes.ok) {
      return (await localRes.json()) as T;
    }
  } catch {
    // Try CDN fallback if local fetch fails
  }
  if (cdnUrl) {
    const cdnRes = await fetch(cdnUrl);
    if (cdnRes.ok) {
      return (await cdnRes.json()) as T;
    }
  }
  throw new Error(`Unable to load ${localPath}`);
}

async function ensureFullHafsRows(): Promise<CompactHafsRow[]> {
  if (fullRowsMemPromise) return fullRowsMemPromise;
  fullRowsMemPromise = (async () => {
    const cachedHafs = await getCachedQuranAsset<CompactHafsRow[]>('hafs');
    if (cachedHafs && cachedHafs.length === 6236) {
      return cachedHafs;
    }
    const hafsRows = await fetchJsonWithFallback<CompactHafsRow[]>('/data/quran-hafs.json');
    await persistShardedHafsPages(hafsRows);
    return hafsRows;
  })();
  try {
    return await fullRowsMemPromise;
  } catch (err) {
    fullRowsMemPromise = null;
    throw err;
  }
}

async function persistShardedHafsPages(hafsRows: CompactHafsRow[]): Promise<void> {
  const byPage = new Map<number, Array<{index: number; row: CompactHafsRow}>>();
  for (let i = 0; i < hafsRows.length; i++) {
    const row = hafsRows[i];
    const p = row[2];
    let list = byPage.get(p);
    if (!list) {
      list = [];
      byPage.set(p, list);
    }
    list.push({index: i, row});
  }

  const batch: Array<{key: string; data: unknown}> = [{key: 'hafs', data: hafsRows}];
  for (const [page, pageRows] of byPage.entries()) {
    const hydrated = hydratePageRows(pageRows, false);
    pageVersesMemCache.set(page, hydrated);
    batch.push({key: `page_hafs:${page}`, data: hydrated});
  }
  await setCachedQuranAssets(batch);
}

export interface StartupQuranBundle {
  surahs: SurahMeta[];
  initialPageVerses: QuranVerse[];
  fromCache: boolean;
}

/**
 * Loads only Surah metadata (28 KB) + the active Mushaf page (~10-20 verses)
 * on startup so mobile RAM and initial render stay minimal.
 */
export async function loadStartupQuranBundle(
  initialPage: number
): Promise<StartupQuranBundle> {
  const page = clampPage(initialPage);
  const [cachedSurahs, cachedPage] = await Promise.all([
    getCachedQuranAsset<SurahMeta[]>('surahs'),
    getCachedQuranAsset<QuranVerse[]>(`page_hafs:${page}`),
  ]);

  if (
    cachedSurahs &&
    cachedSurahs.length === 114 &&
    Array.isArray(cachedPage) &&
    cachedPage.length > 0
  ) {
    pageVersesMemCache.set(page, cachedPage);
    return {
      surahs: cachedSurahs,
      initialPageVerses: cachedPage,
      fromCache: true,
    };
  }

  // Try building from cached full hafs rows first before hitting network
  const cachedHafs = await getCachedQuranAsset<CompactHafsRow[]>('hafs');
  const surahs =
    cachedSurahs && cachedSurahs.length === 114
      ? cachedSurahs
      : await fetchJsonWithFallback<SurahMeta[]>('/data/surahs.json');

  if (!cachedSurahs || cachedSurahs.length !== 114) {
    await setCachedQuranAsset('surahs', surahs);
  }

  if (cachedHafs && cachedHafs.length === 6236) {
    await persistShardedHafsPages(cachedHafs);
    const pageVerses = pageVersesMemCache.get(page) || [];
    return {surahs, initialPageVerses: pageVerses, fromCache: true};
  }

  const hafsRows = await fetchJsonWithFallback<CompactHafsRow[]>('/data/quran-hafs.json');
  const targetRows: Array<{index: number; row: CompactHafsRow}> = [];
  for (let i = 0; i < hafsRows.length; i++) {
    if (hafsRows[i][2] === page) {
      targetRows.push({index: i, row: hafsRows[i]});
    }
  }
  const initialPageVerses = hydratePageRows(targetRows, false);
  pageVersesMemCache.set(page, initialPageVerses);

  // Shard all 604 pages into IndexedDB in the background right after first paint
  setTimeout(() => {
    void persistShardedHafsPages(hafsRows);
  }, 50);

  return {
    surahs,
    initialPageVerses,
    fromCache: false,
  };
}

/**
 * Loads verses for a single Mushaf page (1..604) on demand from memory/IDB.
 */
export async function loadPageVerses(page: number): Promise<QuranVerse[]> {
  const clamped = clampPage(page);
  const mem = pageVersesMemCache.get(clamped);
  if (mem && mem.length > 0) return mem;

  const cachedPage = await getCachedQuranAsset<QuranVerse[]>(`page_hafs:${clamped}`);
  if (Array.isArray(cachedPage) && cachedPage.length > 0) {
    pageVersesMemCache.set(clamped, cachedPage);
    return cachedPage;
  }

  const rows = await ensureFullHafsRows();
  const targetRows: Array<{index: number; row: CompactHafsRow}> = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][2] === clamped) {
      targetRows.push({index: i, row: rows[i]});
    }
  }
  const hydrated = hydratePageRows(targetRows, false);
  pageVersesMemCache.set(clamped, hydrated);
  void setCachedQuranAsset(`page_hafs:${clamped}`, hydrated);
  return hydrated;
}

/**
 * Finds the exact verse and its containing Mushaf page on demand
 * without holding all 6,236 verses in React state.
 */
export async function findVerseAndPage(
  surah: number,
  ayah: number
): Promise<{verse: QuranVerse; page: number; pageVerses: QuranVerse[]} | null> {
  if (allVersesMemCache) {
    const match =
      allVersesMemCache.find((v) => v.surah === surah && v.ayah === ayah) ||
      allVersesMemCache.find((v) => v.surah === surah);
    if (!match) return null;
    const pageVerses = await loadPageVerses(match.page);
    return {verse: match, page: match.page, pageVerses};
  }

  const rows = await ensureFullHafsRows();
  let matchedIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === surah && rows[i][1] === ayah) {
      matchedIndex = i;
      break;
    }
  }
  if (matchedIndex === -1) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === surah) {
        matchedIndex = i;
        break;
      }
    }
  }
  if (matchedIndex === -1) return null;

  const row = rows[matchedIndex];
  const verse: QuranVerse = {
    index: matchedIndex,
    surah: row[0],
    ayah: row[1],
    page: row[2],
    juz: row[3],
    hizbQuarter: row[4],
    sajda: row[5] === 1,
    text: row[6],
  };
  const pageVerses = await loadPageVerses(row[2]);
  return {verse, page: row[2], pageVerses};
}

/**
 * Lazily hydrates all 6,236 verses for full-text search only when Search opens.
 */
export async function loadAllHafsVerses(): Promise<QuranVerse[]> {
  if (allVersesMemCache && allVersesMemCache.length === 6236) {
    return allVersesMemCache;
  }
  const rows = await ensureFullHafsRows();
  allVersesMemCache = hydrateAllHafsVerses(rows);
  pageNormalizedReady.add(1);
  return allVersesMemCache;
}

export async function loadWarshTexts(): Promise<string[]> {
  if (warshMemPromise) return warshMemPromise;
  warshMemPromise = (async () => {
    const cached = await getCachedQuranAsset<string[]>('warsh');
    if (cached && cached.length === 6236) return cached;
    const warsh = await fetchJsonWithFallback<string[]>('/data/quran-warsh.json');
    await setCachedQuranAsset('warsh', warsh);
    return warsh;
  })();
  try {
    return await warshMemPromise;
  } catch (err) {
    warshMemPromise = null;
    throw err;
  }
}

export async function loadTafsirMuyassar(): Promise<string[]> {
  if (tafsirMemPromise) return tafsirMemPromise;
  tafsirMemPromise = (async () => {
    const cached = await getCachedQuranAsset<string[]>('tafsir');
    if (cached && cached.length === 6236) return cached;
    const tafsir = await fetchJsonWithFallback<string[]>('/data/tafsir-muyassar.json');
    await setCachedQuranAsset('tafsir', tafsir);
    return tafsir;
  })();
  try {
    return await tafsirMemPromise;
  } catch (err) {
    tafsirMemPromise = null;
    throw err;
  }
}

export async function loadEnglishTranslation(): Promise<string[]> {
  if (translationEnMemPromise) return translationEnMemPromise;
  translationEnMemPromise = (async () => {
    const cached = await getCachedQuranAsset<string[]>('translation_en');
    if (cached && cached.length === 6236) return cached;
    const en = await fetchJsonWithFallback<string[]>('/data/translation-en.json');
    await setCachedQuranAsset('translation_en', en);
    return en;
  })();
  try {
    return await translationEnMemPromise;
  } catch (err) {
    translationEnMemPromise = null;
    throw err;
  }
}

export async function loadFrenchTranslation(): Promise<string[]> {
  if (translationFrMemPromise) return translationFrMemPromise;
  translationFrMemPromise = (async () => {
    const cached = await getCachedQuranAsset<string[]>('translation_fr');
    if (cached && cached.length === 6236) return cached;
    const res = await fetch('https://api.alquran.cloud/v1/quran/fr.hamidullah');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      data?: {surahs?: Array<{ayahs?: Array<{text?: string}>}>};
    };
    const flattened: string[] = [];
    for (const s of json.data?.surahs || []) {
      for (const a of s.ayahs || []) {
        flattened.push(a.text || '');
      }
    }
    if (flattened.length !== 6236) {
      throw new Error('Unexpected French Quran translation payload');
    }
    await setCachedQuranAsset('translation_fr', flattened);
    return flattened;
  })();
  try {
    return await translationFrMemPromise;
  } catch (err) {
    translationFrMemPromise = null;
    throw err;
  }
}

export async function fetchVerseFrenchTranslation(
  surah: number,
  ayah: number
): Promise<string | null> {
  const key = `translation_fr_ayah:${surah}:${ayah}`;
  const cached = await getCachedQuranAsset<string>(key);
  if (cached) return cached;
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/fr.hamidullah`);
    if (!res.ok) return null;
    const json = (await res.json()) as {data?: {text?: string}};
    const text = json.data?.text?.trim();
    if (!text) return null;
    await setCachedQuranAsset(key, text);
    return text;
  } catch {
    return null;
  }
}

/**
 * Pre-warms offline IndexedDB assets quietly in the background without retaining
 * megabytes of parsed JSON inside React state.
 */
export async function warmOfflineDatasetsInIndexedDb(): Promise<void> {
  const [warsh, tafsir, trans] = await Promise.all([
    getCachedQuranAsset<string[]>('warsh'),
    getCachedQuranAsset<string[]>('tafsir'),
    getCachedQuranAsset<string[]>('translation_en'),
  ]);
  const tasks: Promise<unknown>[] = [];
  if (!warsh || warsh.length !== 6236) {
    tasks.push(
      fetchJsonWithFallback<string[]>('/data/quran-warsh.json').then((d) =>
        setCachedQuranAsset('warsh', d)
      )
    );
  }
  if (!tafsir || tafsir.length !== 6236) {
    tasks.push(
      fetchJsonWithFallback<string[]>('/data/tafsir-muyassar.json').then((d) =>
        setCachedQuranAsset('tafsir', d)
      )
    );
  }
  if (!trans || trans.length !== 6236) {
    tasks.push(
      fetchJsonWithFallback<string[]>('/data/translation-en.json').then((d) =>
        setCachedQuranAsset('translation_en', d)
      )
    );
  }
  if (tasks.length > 0) {
    await Promise.allSettled(tasks);
  }
}

export function getVerseTextByRiwayat(
  verse: QuranVerse,
  riwayat: Riwayat,
  warshTexts: string[] | null
): string {
  if (riwayat === 'warsh' && warshTexts && warshTexts[verse.index]) {
    return warshTexts[verse.index];
  }
  return verse.text;
}
