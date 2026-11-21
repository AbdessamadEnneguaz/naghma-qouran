import type {QuranVerse, Riwayat, SurahMeta} from '../types/quran';
import {stripTashkeel} from '../utils/quranLogic';
import {getCachedQuranAsset, setCachedQuranAsset} from './indexedDbVault';

type CompactHafsRow = [number, number, number, number, number, number, string];

function hydrateHafsVerses(rows: CompactHafsRow[]): QuranVerse[] {
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

export interface CoreQuranBundle {
  surahs: SurahMeta[];
  hafsVerses: QuranVerse[];
  fromCache: boolean;
}

export async function loadCoreQuranBundle(): Promise<CoreQuranBundle> {
  const [cachedSurahs, cachedHafs] = await Promise.all([
    getCachedQuranAsset<SurahMeta[]>('surahs'),
    getCachedQuranAsset<CompactHafsRow[]>('hafs'),
  ]);

  if (cachedSurahs && cachedSurahs.length === 114 && cachedHafs && cachedHafs.length === 6236) {
    return {
      surahs: cachedSurahs,
      hafsVerses: hydrateHafsVerses(cachedHafs),
      fromCache: true,
    };
  }

  const [surahs, hafsRows] = await Promise.all([
    fetchJsonWithFallback<SurahMeta[]>('/data/surahs.json'),
    fetchJsonWithFallback<CompactHafsRow[]>('/data/quran-hafs.json'),
  ]);

  // Persist permanently in IndexedDB for instant offline startup
  await Promise.all([
    setCachedQuranAsset('surahs', surahs),
    setCachedQuranAsset('hafs', hafsRows),
  ]);

  return {
    surahs,
    hafsVerses: hydrateHafsVerses(hafsRows),
    fromCache: false,
  };
}

export async function loadWarshTexts(): Promise<string[]> {
  const cached = await getCachedQuranAsset<string[]>('warsh');
  if (cached && cached.length === 6236) return cached;

  const warsh = await fetchJsonWithFallback<string[]>('/data/quran-warsh.json');
  await setCachedQuranAsset('warsh', warsh);
  return warsh;
}

export async function loadTafsirMuyassar(): Promise<string[]> {
  const cached = await getCachedQuranAsset<string[]>('tafsir');
  if (cached && cached.length === 6236) return cached;

  const tafsir = await fetchJsonWithFallback<string[]>('/data/tafsir-muyassar.json');
  await setCachedQuranAsset('tafsir', tafsir);
  return tafsir;
}

export async function loadEnglishTranslation(): Promise<string[]> {
  const cached = await getCachedQuranAsset<string[]>('translation_en');
  if (cached && cached.length === 6236) return cached;

  const en = await fetchJsonWithFallback<string[]>('/data/translation-en.json');
  await setCachedQuranAsset('translation_en', en);
  return en;
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
