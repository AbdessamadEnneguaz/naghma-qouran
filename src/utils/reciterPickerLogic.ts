import type {Reciter} from '../types/quran';
import type {AppLang} from '../i18n/translations';
import type {SleepTimerOption} from '../hooks/useAudioPlayer';
import {stripTashkeel} from './quranLogic';

export type ReciterRiwayatFilter = 'all' | 'warsh' | 'hafs';

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export const SLEEP_TIMER_CYCLE: SleepTimerOption[] = [0, 15, 30, 45, 60, -1];

export function filterReciters(
  reciters: Reciter[],
  riwayatFilter: ReciterRiwayatFilter,
  query: string
): Reciter[] {
  const qLower = query.trim().toLowerCase();
  const qAr = stripTashkeel(query.trim());

  return reciters.filter((r) => {
    if (riwayatFilter !== 'all' && r.riwayat !== riwayatFilter) {
      return false;
    }
    if (!qLower) return true;
    const matchEn = r.nameEn.toLowerCase().includes(qLower);
    const matchStyle = r.style.toLowerCase().includes(qLower);
    const matchAr = stripTashkeel(r.nameAr).includes(qAr);
    return matchEn || matchStyle || matchAr;
  });
}

export function getReciterMonogram(nameEn: string): string {
  const cleaned = nameEn
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(Al|El|Abdul|Abdel)-?/gi, ' ')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Q';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function localizeReciterSubtitle(reciter: Reciter, lang: AppLang): string {
  const riwayatWord =
    lang === 'ar'
      ? reciter.riwayat === 'warsh'
        ? 'ورش'
        : 'حفص'
      : reciter.riwayat === 'warsh'
        ? 'Warsh'
        : 'Hafs';

  const modeWord =
    reciter.mode === 'ayah'
      ? lang === 'ar'
        ? 'تلاوة آية بآية'
        : lang === 'fr'
          ? 'Synchronisé verset par verset'
          : 'Ayah-by-Ayah Sync'
      : lang === 'ar'
        ? 'سورة كاملة · مرتّل'
        : lang === 'fr'
          ? 'Sourate complète · Murattal'
          : 'Full Surah · Murattal';

  return `${riwayatWord} · ${modeWord} · ${reciter.bitrateLabel}`;
}

export function cyclePlaybackSpeed(current: number): number {
  const idx = PLAYBACK_SPEEDS.findIndex((s) => Math.abs(s - current) < 0.01);
  if (idx === -1) return 1;
  return PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
}

export function cycleSleepTimer(current: SleepTimerOption): SleepTimerOption {
  const idx = SLEEP_TIMER_CYCLE.indexOf(current);
  if (idx === -1) return 15;
  return SLEEP_TIMER_CYCLE[(idx + 1) % SLEEP_TIMER_CYCLE.length];
}
