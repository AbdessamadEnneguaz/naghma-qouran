import type {AppLang} from '../i18n/translations';
import type {Reciter, SurahMeta} from '../types/quran';
import {toArabicDigits} from './quranLogic';

export interface MediaImageSpec {
  src: string;
  sizes: string;
  type: string;
}

export interface MediaSessionMetadataPayload {
  title: string;
  artist: string;
  album: string;
  artwork: MediaImageSpec[];
}

export interface SafeMediaPositionState {
  duration: number;
  playbackRate: number;
  position: number;
}

export function buildMediaSessionMetadataPayload({
  surah,
  ayah,
  surahMeta,
  reciter,
  lang,
}: {
  surah: number;
  ayah: number;
  surahMeta?: SurahMeta;
  reciter: Reciter;
  lang: AppLang;
}): MediaSessionMetadataPayload {
  const safeSurah = Math.max(1, Math.min(114, Math.floor(surah || 1)));
  const safeAyah = Math.max(1, Math.floor(ayah || 1));

  const title =
    lang === 'ar'
      ? `سورة ${surahMeta?.nameAr || toArabicDigits(safeSurah)} - الآية ${toArabicDigits(safeAyah)}`
      : lang === 'fr'
        ? `Sourate ${surahMeta?.nameEn || safeSurah} - Verset ${safeAyah}`
        : `Surah ${surahMeta?.nameEn || safeSurah} - Ayah ${safeAyah}`;

  const artist = lang === 'ar' ? reciter.nameAr : reciter.nameEn;

  return {
    title,
    artist,
    album: 'Mihrab Noor · مِحْرَاب النُّور',
    artwork: [
      {src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'},
      {src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png'},
    ],
  };
}

export function computeSafePositionState(
  duration: number,
  position: number,
  playbackRate = 1
): SafeMediaPositionState | null {
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const safePosition = Number.isFinite(position)
    ? Math.min(duration, Math.max(0, position))
    : 0;
  const safeRate =
    Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;

  return {
    duration,
    playbackRate: safeRate,
    position: safePosition,
  };
}

export function canUseWakeLock(nav: {wakeLock?: unknown} | undefined): boolean {
  return Boolean(nav && typeof nav.wakeLock === 'object' && nav.wakeLock !== null);
}
