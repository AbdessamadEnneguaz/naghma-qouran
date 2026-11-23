import React, {useMemo, useState} from 'react';
import {Play, Search, Trash2} from 'lucide-react';
import type {BookmarkEntry, OfflineSurahRecord, SurahMeta} from '../types/quran';
import {stripTashkeel, toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';

interface SurahsPageProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  bookmarks: BookmarkEntry[];
  offlineRecords: OfflineSurahRecord[];
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onPlaySurah?: (surahId: number) => void;
  onOpenPage: (page: number) => void;
  onRemoveBookmark: (id: string) => void;
}

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

function getSurahApproxJuz(startPage: number): number {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (startPage >= JUZ_START_PAGES[i]) return i + 1;
  }
  return 1;
}

export const SurahsPage: React.FC<SurahsPageProps> = ({
  lang,
  t,
  surahs,
  bookmarks,
  offlineRecords,
  onOpenSurah,
  onPlaySurah,
  onOpenPage,
  onRemoveBookmark,
}) => {
  const [filterText, setFilterText] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [juzFilter, setJuzFilter] = useState<number>(0);
  const [directoryView, setDirectoryView] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');

  const offlineSurahIds = useMemo(
    () => new Set(offlineRecords.map((r) => r.surah)),
    [offlineRecords]
  );

  const filteredSurahs = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    const qAr = stripTashkeel(filterText.trim());
    return surahs.filter((s) => {
      if (revelationFilter !== 'all' && s.revelationType !== revelationFilter) {
        return false;
      }
      if (juzFilter > 0 && getSurahApproxJuz(s.startPage) !== juzFilter) {
        return false;
      }
      if (!q) return true;
      return (
        String(s.id) === q ||
        s.nameEn.toLowerCase().includes(q) ||
        s.meaningEn.toLowerCase().includes(q) ||
        s.meaningFr.toLowerCase().includes(q) ||
        s.transliteration.toLowerCase().includes(q) ||
        stripTashkeel(s.nameAr).includes(qAr)
      );
    });
  }, [surahs, filterText, revelationFilter, juzFilter]);

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-amber-500/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D231E] dark:text-[#FAF5EE]">
            {t.navSurahs} · {lang === 'ar' ? 'الفهرس الكامل' : 'Complete Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 tabular-nums">
            {lang === 'ar'
              ? '١١٤ سورة · ٣٠ جزءاً · يفتح كل اختيار على صفحته الدقيقة في المصحف'
              : "114 Surahs · 30 Juz' · Every Surah opens directly on its Madani Mushaf page"}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-amber-500/12 dark:bg-[#221914] border border-amber-500/15 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDirectoryView('surahs')}
            className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'surahs'
                ? 'bg-white dark:bg-[#D97706] text-[#B45309] dark:text-white shadow-sm'
                : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E]'
            }`}
          >
            {t.tabSurahs}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('juz')}
            className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'juz'
                ? 'bg-white dark:bg-[#D97706] text-[#B45309] dark:text-white shadow-sm'
                : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E]'
            }`}
          >
            {t.tabJuz}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('bookmarks')}
            className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors tabular-nums ${
              directoryView === 'bookmarks'
                ? 'bg-white dark:bg-[#D97706] text-[#B45309] dark:text-white shadow-sm'
                : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E]'
            }`}
          >
            {t.tabBookmarks} ({numFmt(bookmarks.length)})
          </button>
        </div>
      </div>

      {directoryView === 'surahs' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E5649] dark:text-[#D6C7B8]" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t.filterSurahPlaceholder}
                aria-label={t.filterSurahPlaceholder}
                className="w-full rounded-full border border-amber-500/18 bg-white/85 dark:bg-[#211914] ps-10 pe-4 py-2.5 text-sm text-[#2D231E] dark:text-[#FAF5EE] placeholder:text-[#6E5649]/65 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label={t.juzWord}
                value={juzFilter}
                onChange={(e) => setJuzFilter(Number(e.target.value))}
                className="rounded-full border border-amber-500/18 bg-white/85 dark:bg-[#211914] px-3.5 py-2 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
              >
                <option value={0}>{t.allJuzFilter}</option>
                {Array.from({length: 30}, (_, idx) => idx + 1).map((j) => (
                  <option key={j} value={j}>
                    {t.juzWord} {numFmt(j)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 p-1 rounded-full bg-amber-500/10 dark:bg-[#211914]">
                {(['all', 'Meccan', 'Medinan'] as const).map((rev) => (
                  <button
                    key={rev}
                    type="button"
                    onClick={() => setRevelationFilter(rev)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      revelationFilter === rev
                        ? 'bg-[#D97706] text-white'
                        : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E]'
                    }`}
                  >
                    {rev === 'all'
                      ? t.filterAll
                      : rev === 'Meccan'
                        ? t.filterMeccan
                        : t.filterMedinan}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => {
              const isCached = offlineSurahIds.has(surah.id);
              const revLabel = surah.revelationType === 'Meccan' ? t.meccan : t.medinan;
              return (
                <div
                  key={surah.id}
                  onClick={() => onOpenSurah(surah.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenSurah(surah.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  data-testid={`surah-card-${surah.id}`}
                  className="group text-start rounded-3xl border border-amber-500/12 bg-white/80 dark:bg-[#211914]/85 p-4 hover:border-amber-500/45 shadow-sm shadow-amber-500/5 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 rounded-full bg-amber-500/12 flex items-center justify-center text-xs font-bold text-[#B45309] dark:text-[#FBBF24] tabular-nums shrink-0">
                      {String(surah.id).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#2D231E] dark:text-[#FAF5EE] truncate group-hover:text-[#D97706] transition-colors">
                          {lang === 'ar' ? surah.nameAr : surah.nameEn}
                        </span>
                        {isCached && (
                          <span className="text-[11px] font-semibold text-[#D97706] dark:text-[#FBBF24]">
                            {t.offlineTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] truncate mt-0.5 tabular-nums">
                        {lang === 'ar'
                          ? `${revLabel} · ${toArabicDigits(surah.totalAyahs)} ${t.ayahsWord}`
                          : `${surah.meaningEn} · ${surah.totalAyahs} ${t.ayahsWord}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-end">
                      <div
                        dir="rtl"
                        className="font-quran-scheherazade text-2xl font-semibold text-[#B45309] dark:text-[#FBBF24] leading-none"
                      >
                        {surah.nameAr.replace('سُورَةُ ', '')}
                      </div>
                      <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] tabular-nums mt-1">
                        {t.pageShort} {numFmt(surah.startPage)}
                      </div>
                    </div>

                    {onPlaySurah && (
                      <button
                        type="button"
                        data-testid={`surah-inline-play-${surah.id}`}
                        aria-label={`${t.playSurah} ${lang === 'ar' ? surah.nameAr : surah.nameEn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySurah(surah.id);
                        }}
                        className="h-8 w-8 rounded-full border border-amber-500/25 bg-amber-500/10 text-[#B45309] dark:text-[#FBBF24] hover:bg-[#D97706] hover:text-white flex items-center justify-center transition-colors shrink-0"
                      >
                        <Play className="h-3.5 w-3.5 fill-current ms-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredSurahs.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#6E5649] dark:text-[#D6C7B8]">
                {t.noSurahMatch}
              </div>
            )}
          </div>
        </>
      )}

      {directoryView === 'juz' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {JUZ_START_PAGES.map((startPage, idx) => {
            const juzNum = idx + 1;
            return (
              <button
                key={juzNum}
                type="button"
                onClick={() => onOpenPage(startPage)}
                className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-4 text-start hover:border-[#D97706] shadow-sm transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
                    {t.juzWord} {numFmt(juzNum)}
                  </span>
                  <span
                    dir="rtl"
                    className="font-quran-scheherazade text-base text-[#B45309] dark:text-[#FBBF24]"
                  >
                    الجزء {toArabicDigits(juzNum)}
                  </span>
                </div>
                <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                  {t.startsAtPage} {numFmt(startPage)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {directoryView === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="rounded-3xl border border-amber-500/14 bg-white/75 dark:bg-[#211914] p-10 text-center space-y-2 shadow-sm">
              <p className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.noBookmarksTitle}
              </p>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
                {t.noBookmarksDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-4 shadow-sm flex items-start justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSurah(bm.surah, bm.ayah)}
                    className="text-start flex-1 min-w-0 space-y-1.5"
                  >
                    <div className="text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                      {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} · {bm.surah}:{bm.ayah} ·{' '}
                      {t.pageWord} {bm.page}
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
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
