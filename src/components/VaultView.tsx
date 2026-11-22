import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  Download,
  HardDrive,
  Loader2,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type {
  BookmarkEntry,
  OfflineSurahRecord,
  Reciter,
  SurahMeta,
} from '../types/quran';
import {RECITERS} from '../data/reciters';
import {formatBytes, toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';

interface VaultViewProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  bookmarks: BookmarkEntry[];
  activeReciter: Reciter;
  offlineRecords: OfflineSurahRecord[];
  vaultKeys: string[];
  storageEstimate: {usage: number; quota: number};
  downloadProgress: {surah: number; completed: number; total: number} | null;
  isInstallable: boolean;
  isInstalled: boolean;
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onRemoveBookmark: (id: string) => void;
  onDownloadSurah: (surahMeta: SurahMeta) => void;
  onDeleteOfflineRecord: (reciter: Reciter, surahMeta: SurahMeta) => void;
  onClearAudioCache: () => void;
  onOpenInstall: () => void;
}

const RECOMMENDED_SURAH_IDS = [1, 18, 36, 55, 67, 112, 113, 114];

export const VaultView: React.FC<VaultViewProps> = ({
  lang,
  t,
  surahs,
  bookmarks,
  activeReciter,
  offlineRecords,
  vaultKeys,
  storageEstimate,
  downloadProgress,
  isInstalled,
  onOpenSurah,
  onRemoveBookmark,
  onDownloadSurah,
  onDeleteOfflineRecord,
  onClearAudioCache,
  onOpenInstall,
}) => {
  const totalAudioBytes = offlineRecords.reduce((acc, r) => acc + r.bytes, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-36 md:pb-28 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {t.vaultTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] mt-0.5">
            {t.vaultSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
          <span>
            {t.audioCachedLabel}: <strong className="text-[#2D231E] dark:text-[#FAF5EE]">{formatBytes(totalAudioBytes)}</strong>
          </span>
          <span>
            {t.totalStorageLabel}: <strong className="text-[#2D231E] dark:text-[#FAF5EE]">{formatBytes(storageEstimate.usage)}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#B45309] dark:text-[#FBBF24]">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{t.quranTextStoredTitle}</span>
          </div>
          <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
            {t.quranTextStoredDesc} ({lang === 'ar' ? toArabicDigits(vaultKeys.length) : vaultKeys.length})
          </p>
        </div>

        <div className="rounded-3xl border border-amber-500/18 bg-white/80 dark:bg-[#211914] p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
              <Smartphone className="h-4 w-4 text-[#D97706] shrink-0" />
              <span className="truncate">{t.installAppTitle}</span>
            </div>
            <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
              {isInstalled ? t.installedStandalone : t.installAppDesc}
            </p>
          </div>
          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="shrink-0 rounded-full bg-[#D97706] hover:bg-[#B45309] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap"
            >
              {t.installNowBtn}
            </button>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] flex items-center gap-2 tabular-nums">
          <Bookmark className="h-4 w-4 text-[#D97706]" />
          <span>
            {t.tabBookmarks} ({bookmarks.length})
          </span>
        </h2>

        {bookmarks.length === 0 ? (
          <div className="rounded-3xl border border-amber-500/14 bg-white/75 dark:bg-[#211914] p-8 text-center space-y-1.5 shadow-sm">
            <p className="text-sm font-medium text-[#2D231E] dark:text-[#FAF5EE]">
              {t.noBookmarksTitle}
            </p>
            <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
              {t.noBookmarksDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-4 flex items-start justify-between gap-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onOpenSurah(bm.surah, bm.ayah)}
                  className="text-start flex-1 min-w-0 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} ·{' '}
                      {lang === 'ar'
                        ? `${toArabicDigits(bm.surah)}:${toArabicDigits(bm.ayah)}`
                        : `${bm.surah}:${bm.ayah}`}{' '}
                      · {t.pageWord} {lang === 'ar' ? toArabicDigits(bm.page) : bm.page}
                    </span>
                  </div>
                  <p
                    dir="rtl"
                    className="font-quran-amiri text-xl leading-[2.1] text-[#2D231E] dark:text-[#FAF5EE] line-clamp-2"
                  >
                    {bm.snippet}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveBookmark(bm.id)}
                  aria-label={`Remove bookmark ${bm.surah}:${bm.ayah}`}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-[#D97706]" />
          <span>
            {t.quickDownloadFor} {lang === 'ar' ? activeReciter.nameAr : activeReciter.nameEn}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {RECOMMENDED_SURAH_IDS.map((id) => {
            const sMeta = surahs.find((s) => s.id === id);
            if (!sMeta) return null;
            const isCached = offlineRecords.some(
              (r) => r.surah === id && r.reciterId === activeReciter.id
            );
            const isDownloading = downloadProgress?.surah === id;
            return (
              <div
                key={id}
                className="rounded-2xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="min-w-0">
                  <div
                    className={`font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate ${
                      lang === 'ar' ? 'font-quran-scheherazade text-base leading-normal' : 'text-xs'
                    }`}
                  >
                    {lang === 'ar'
                      ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr}`
                      : `${sMeta.id}. ${sMeta.nameEn}`}
                  </div>
                  <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                    {lang === 'ar' ? toArabicDigits(sMeta.totalAyahs) : sMeta.totalAyahs} {t.ayahsWord}
                  </div>
                </div>

                {isDownloading ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] tabular-nums">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>
                      {downloadProgress.completed}/{downloadProgress.total}
                    </span>
                  </div>
                ) : isCached ? (
                  <span className="text-xs font-semibold text-[#B45309] dark:text-[#FBBF24]">
                    {t.savedBtn}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDownloadSurah(sMeta)}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t.saveBtn}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
            {t.savedAudioTitle} ({offlineRecords.length})
          </h2>
          {offlineRecords.length > 0 && (
            <button
              type="button"
              onClick={onClearAudioCache}
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              {t.clearAllAudio}
            </button>
          )}
        </div>

        {offlineRecords.length === 0 ? (
          <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] py-2">
            {t.noAudioSavedDesc}
          </p>
        ) : (
          <div className="divide-y divide-amber-500/12 rounded-3xl border border-amber-500/14 overflow-hidden shadow-sm">
            {offlineRecords.map((rec) => {
              const sMeta = surahs.find((s) => s.id === rec.surah);
              const rMeta = RECITERS.find((r) => r.id === rec.reciterId);
              if (!sMeta || !rMeta) return null;
              return (
                <div
                  key={rec.key}
                  className="px-4 py-3 bg-white/80 dark:bg-[#211914] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div
                      className={`font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate ${
                        lang === 'ar' ? 'font-quran-scheherazade text-base leading-normal' : 'text-xs'
                      }`}
                    >
                      {lang === 'ar'
                        ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr} · ${rMeta.nameAr}`
                        : `${sMeta.id}. ${sMeta.nameEn} · ${rMeta.nameEn}`}
                    </div>
                    <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                      {rec.totalFiles} MP3 · {formatBytes(rec.bytes)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteOfflineRecord(rMeta, sMeta)}
                    aria-label={`Delete offline audio for ${sMeta.nameEn}`}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
