export type Riwayat = 'hafs' | 'warsh';
export type QuranFont = 'amiri' | 'scheherazade';
export type ReaderMode = 'mushaf' | 'surah';
export type ThemeMode = 'dark' | 'light';
export type LoopMode = 'none' | 'ayah' | 'surah';

export interface SurahMeta {
  id: number;
  nameAr: string;
  nameEn: string;
  meaningEn: string;
  meaningFr: string;
  transliteration: string;
  revelationType: 'Meccan' | 'Medinan';
  totalAyahs: number;
  startPage: number;
  endPage: number;
  juzStart: number;
}

export interface QuranVerse {
  index: number; // 0..6235 global index
  surah: number; // 1..114
  ayah: number; // 1..N
  page: number; // 1..604
  juz: number; // 1..30
  hizbQuarter: number; // 1..240
  sajda: boolean;
  text: string;
  searchNormalized?: string;
}

export interface Reciter {
  id: string;
  nameEn: string;
  nameAr: string;
  riwayat: Riwayat;
  style: string;
  mode: 'ayah' | 'surah';
  baseUrl: string;
  fallbackUrls?: string[];
  mp3quranReadId?: number;
  quranComReciterId?: number;
  bitrateLabel: string;
}

export interface BookmarkEntry {
  id: string; // e.g. "2:255"
  surah: number;
  ayah: number;
  page: number;
  surahNameAr: string;
  surahNameEn: string;
  snippet: string;
  createdAt: number;
}

export interface LastReadState {
  surah: number;
  ayah: number;
  page: number;
  mode: ReaderMode;
  updatedAt: number;
}

export interface ReaderSettings {
  theme: ThemeMode;
  riwayat: Riwayat;
  font: QuranFont;
  fontSize: number; // 18..38
  lineHeight: number; // 1.7..2.5
  showTranslation: boolean;
  readerMode: ReaderMode;
  reciterId: string;
  playbackSpeed: number; // 0.75 | 1 | 1.25 | 1.5
  audioSyncOffsetSec: number; // -2.0 .. +2.0
}

export interface OfflineSurahRecord {
  key: string; // `${reciterId}:${surah}`
  reciterId: string;
  surah: number;
  totalFiles: number;
  bytes: number;
  downloadedAt: number;
}

export interface SearchResult {
  type: 'jump' | 'surah' | 'verse';
  surah: number;
  ayah: number;
  page: number;
  surahNameAr: string;
  surahNameEn: string;
  text: string;
  translation?: string;
}

export interface KhatmaPlan {
  goalDays: number; // 7 | 15 | 30 | custom (1..365)
  startDateISO: string; // YYYY-MM-DD local date
  completedPagesCount: number; // 0..604
  currentKhatmaPage: number; // 1..604
  completedDates: string[]; // YYYY-MM-DD dates marked complete
  todayPagesLogged: number;
  todayLoggedDateISO: string | null;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h
  lastNotifiedDateISO: string | null;
}

export type AdhkarCategory = 'sabah' | 'masaa' | 'postPrayer';

export interface AdhkarItem {
  id: string;
  category: AdhkarCategory;
  titleAr: string;
  titleEn: string;
  arabic: string;
  transliteration: string;
  translation: string;
  virtueAr: string;
  virtueEn: string;
  targetCount: number;
}

export interface TalqeenConfig {
  enabled: boolean;
  startAyah: number;
  endAyah: number;
  pauseSeconds: 3 | 5 | 8;
}

export type MoodCategoryId =
  | 'calm'
  | 'gratitude'
  | 'patience'
  | 'forgiveness'
  | 'guidance';

export interface MoodAyahEntry {
  id: string;
  mood: MoodCategoryId;
  surah: number;
  ayah: number;
  page: number;
  surahNameAr: string;
  surahNameEn: string;
  arabic: string;
  translationEn: string;
  reflectionEn: string;
  reflectionAr: string;
}

