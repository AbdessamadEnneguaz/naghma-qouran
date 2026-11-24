import React, {useMemo, useState} from 'react';
import {
  Bookmark,
  CheckCircle2,
  Download,
  HardDrive,
  Loader2,
  Smartphone,
  Trash2,
} from 'lucide-react';
import type {
  BookmarkCategory,
  BookmarkEntry,
  OfflineSurahRecord,
  Reciter,
  SurahMeta,
} from '../types/quran';
import {RECITERS} from '../data/reciters';
import {formatBytes, getBookmarkCategory, toArabicDigits} from '../utils/quranLogic';
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

const BOOKMARK_CAT_STYLES: Record<
  BookmarkCategory,
  {dotClass: string; badgeClass: string}
> = {
  wird: {
    dotClass: 'bg-[#8C6D46] dark:bg-[#C5A46D]',
    badgeClass: 'text-[#8C6D46] dark:text-[#C5A46D]',
  },
  memorization: {
    dotClass: 'bg-[#0F5132] dark:bg-[#34D399]',
    badgeClass: 'text-[#0F5132] dark:text-[#34D399]',
  },
  favorites: {
    dotClass: 'bg-[#6B6A66] dark:bg-[#A1A1AA]',
    badgeClass: 'text-[#6B6A66] dark:text-[#A1A1AA]',
  },
};

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
  const [bmFilter, setBmFilter] = useState<'all' | BookmarkCategory>('all');
  const totalAudioBytes = offlineRecords.reduce((acc, r) => acc + r.bytes, 0);

  const filteredBookmarks = useMemo(() => {
    if (bmFilter === 'all') return bookmarks;
    return bookmarks.filter((bm) => getBookmarkCategory(bm) === bmFilter);
  }, [bookmarks, bmFilter]);

  const getCategoryLabel = (cat: BookmarkCategory) =>
    cat === 'wird'
      ? t.catWird
      : cat === 'memorization'
        ? t.catMemorization
        : t.catFavorites;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DF] dark:border-[#222226] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {t.vaultTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] dark:text-[#8E8E93] mt-0.5">
            {t.vaultSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
          <span>
            {t.audioCachedLabel}: <strong className="text-[#121212] dark:text-[#F4F4F5]">{formatBytes(totalAudioBytes)}</strong>
          </span>
          <span>
            {t.totalStorageLabel}: <strong className="text-[#121212] dark:text-[#F4F4F5]">{formatBytes(storageEstimate.usage)}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#0F5132]/25 dark:border-[#C5A46D]/30 bg-white dark:bg-[#121215] p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F5132] dark:text-[#C5A46D]">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
            <span>{t.quranTextStoredTitle}</span>
          </div>
          <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
            {t.quranTextStoredDesc} ({lang === 'ar' ? toArabicDigits(vaultKeys.length) : vaultKeys.length})
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]">
              <Smartphone className="h-4 w-4 text-[#0F5132] dark:text-[#C5A46D] shrink-0" strokeWidth={1.5} />
              <span className="truncate">{t.installAppTitle}</span>
            </div>
            <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
              {isInstalled ? t.installedStandalone : t.installAppDesc}
            </p>
          </div>
          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="shrink-0 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] hover:opacity-90 px-4 py-2 text-xs font-semibold text-white dark:text-[#09090B] transition-opacity whitespace-nowrap"
            >
              {t.installNowBtn}
            </button>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] flex items-center gap-2 tabular-nums">
            <Bookmark className="h-4 w-4 text-[#0F5132] dark:text-[#C5A46D]" strokeWidth={1.5} />
            <span>
              {t.tabBookmarks} ({bookmarks.length})
            </span>
          </h2>

          {bookmarks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBmFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                  bmFilter === 'all'
                    ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                    : 'border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                }`}
              >
                {t.filterAll}
              </button>
              {(['wird', 'memorization', 'favorites'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBmFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                    bmFilter === cat
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/10 dark:bg-[#C5A46D]/15 text-[#0F5132] dark:text-[#C5A46D]'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${BOOKMARK_CAT_STYLES[cat].dotClass}`} />
                  <span>{getCategoryLabel(cat)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredBookmarks.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-8 text-center space-y-1.5">
            <p className="text-sm font-medium text-[#121212] dark:text-[#F4F4F5]">
              {t.noBookmarksTitle}
            </p>
            <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
              {t.noBookmarksDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBookmarks.map((bm) => {
              const cat = getBookmarkCategory(bm);
              const style = BOOKMARK_CAT_STYLES[cat];
              return (
                <div
                  key={bm.id}
                  data-testid={`vault-bookmark-${bm.id}`}
                  className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-4 flex items-start justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSurah(bm.surah, bm.ayah)}
                    className="text-start flex-1 min-w-0 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tabular-nums">
                      <span className={`inline-flex items-center gap-1.5 ${style.badgeClass}`}>
                        <span className={`h-2 w-2 rounded-full shrink-0 ${style.dotClass}`} />
                        <span>{getCategoryLabel(cat)}</span>
                      </span>
                      <span aria-hidden="true" className="text-[#6B6A66]/50">·</span>
                      <span className="text-[#0F5132] dark:text-[#C5A46D]">
                        {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} ·{' '}
                        {lang === 'ar'
                          ? `${toArabicDigits(bm.surah)}:${toArabicDigits(bm.ayah)}`
                          : `${bm.surah}:${bm.ayah}`}{' '}
                        · {t.pageWord} {lang === 'ar' ? toArabicDigits(bm.page) : bm.page}
                      </span>
                    </div>
                    <p
                      dir="rtl"
                      className="font-quran-amiri text-xl leading-[2.1] text-[#121212] dark:text-[#F4F4F5] line-clamp-2"
                    >
                      {bm.snippet}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(bm.id)}
                    aria-label={`Remove bookmark ${bm.surah}:${bm.ayah}`}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-[#6B6A66] dark:text-[#8E8E93] hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-[#0F5132] dark:text-[#C5A46D]" strokeWidth={1.5} />
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
                className="rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] px-3.5 py-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div
                    className={`font-semibold text-[#121212] dark:text-[#F4F4F5] truncate ${
                      lang === 'ar' ? 'font-quran-scheherazade text-base leading-normal' : 'text-xs'
                    }`}
                  >
                    {lang === 'ar'
                      ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr}`
                      : `${sMeta.id}. ${sMeta.nameEn}`}
                  </div>
                  <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                    {lang === 'ar' ? toArabicDigits(sMeta.totalAyahs) : sMeta.totalAyahs} {t.ayahsWord}
                  </div>
                </div>

                {isDownloading ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] tabular-nums">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                    <span>
                      {downloadProgress.completed}/{downloadProgress.total}
                    </span>
                  </div>
                ) : isCached ? (
                  <span className="text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D]">
                    {t.savedBtn}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDownloadSurah(sMeta)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#E6E4DF] dark:border-[#222226] px-2.5 py-1.5 text-xs font-semibold text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D]"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
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
          <h2 className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] tabular-nums">
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
          <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] py-2">
            {t.noAudioSavedDesc}
          </p>
        ) : (
          <div className="divide-y divide-[#E6E4DF] dark:divide-[#222226] rounded-2xl border border-[#E6E4DF] dark:border-[#222226] overflow-hidden">
            {offlineRecords.map((rec) => {
              const sMeta = surahs.find((s) => s.id === rec.surah);
              const rMeta = RECITERS.find((r) => r.id === rec.reciterId);
              if (!sMeta || !rMeta) return null;
              return (
                <div
                  key={rec.key}
                  className="px-4 py-3 bg-white dark:bg-[#121215] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div
                      className={`font-semibold text-[#121212] dark:text-[#F4F4F5] truncate ${
                        lang === 'ar' ? 'font-quran-scheherazade text-base leading-normal' : 'text-xs'
                      }`}
                    >
                      {lang === 'ar'
                        ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr} · ${rMeta.nameAr}`
                        : `${sMeta.id}. ${sMeta.nameEn} · ${rMeta.nameEn}`}
                    </div>
                    <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                      {rec.totalFiles} MP3 · {formatBytes(rec.bytes)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteOfflineRecord(rMeta, sMeta)}
                    aria-label={`Delete offline audio for ${sMeta.nameEn}`}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#6B6A66] dark:text-[#8E8E93] hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
