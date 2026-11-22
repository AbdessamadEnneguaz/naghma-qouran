import React, {useMemo, useState} from 'react';
import {Search, Trash2} from 'lucide-react';
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
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 pt-5 sm:pt-7 pb-36 md:pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#B4891B]/18 dark:border-[#D4AF37]/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
            {t.navSurahs} · {lang === 'ar' ? 'الفهرس الكامل' : 'Complete Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#9CAFA6] mt-0.5 tabular-nums">
            {lang === 'ar'
              ? '١١٤ سورة · ٣٠ جزءاً · يفتح كل اختيار على صفحته الدقيقة في المصحف'
              : "114 Surahs · 30 Juz' · Every Surah opens directly on its Madani Mushaf page"}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4EFE4] dark:bg-[#11171D] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDirectoryView('surahs')}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'surahs'
                ? 'bg-[#FAF6EE] dark:bg-[#122720] text-[#1C1917] dark:text-[#F7F4EB] shadow-sm'
                : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
            }`}
          >
            {t.tabSurahs}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('juz')}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'juz'
                ? 'bg-[#FAF6EE] dark:bg-[#122720] text-[#1C1917] dark:text-[#F7F4EB] shadow-sm'
                : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
            }`}
          >
            {t.tabJuz}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('bookmarks')}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors tabular-nums ${
              directoryView === 'bookmarks'
                ? 'bg-[#FAF6EE] dark:bg-[#122720] text-[#1C1917] dark:text-[#F7F4EB] shadow-sm'
                : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
            }`}
          >
            {t.tabBookmarks} ({numFmt(bookmarks.length)})
          </button>
        </div>
      </div>

      {directoryView === 'surahs' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#57534E] dark:text-[#9CAFA6]" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t.filterSurahPlaceholder}
                aria-label={t.filterSurahPlaceholder}
                className="w-full rounded-xl border border-[#B4891B]/22 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] ps-10 pe-3.5 py-2.5 text-sm text-[#1C1917] dark:text-[#F7F4EB] placeholder:text-[#57534E]/70 dark:placeholder:text-[#9CAFA6]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label={t.juzWord}
                value={juzFilter}
                onChange={(e) => setJuzFilter(Number(e.target.value))}
                className="rounded-xl border border-[#B4891B]/22 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] px-3 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F7F4EB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value={0}>{t.allJuzFilter}</option>
                {Array.from({length: 30}, (_, idx) => idx + 1).map((j) => (
                  <option key={j} value={j}>
                    {t.juzWord} {numFmt(j)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4EFE4] dark:bg-[#11171D]">
                {(['all', 'Meccan', 'Medinan'] as const).map((rev) => (
                  <button
                    key={rev}
                    type="button"
                    onClick={() => setRevelationFilter(rev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      revelationFilter === rev
                        ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                        : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
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

          {/* 114 Surahs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {filteredSurahs.map((surah) => {
              const isCached = offlineSurahIds.has(surah.id);
              const revLabel = surah.revelationType === 'Meccan' ? t.meccan : t.medinan;
              return (
                <button
                  key={surah.id}
                  type="button"
                  onClick={() => onOpenSurah(surah.id)}
                  className="group text-start rounded-xl border border-[#B4891B]/18 dark:border-[#D4AF37]/16 bg-[#F4EFE4] dark:bg-[#11171D] p-3.5 sm:p-4 hover:border-[#B4891B]/60 dark:hover:border-[#D4AF37]/55 transition-colors flex items-center justify-between gap-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 rounded-xl border border-[#B4891B]/20 dark:border-white/10 bg-[#FAF6EE] dark:bg-[#0B0E11] flex items-center justify-center text-xs font-bold text-[#B4891B] dark:text-[#D4AF37] tabular-nums shrink-0">
                      {numFmt(surah.id)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1C1917] dark:text-[#F7F4EB] truncate group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors">
                          {lang === 'ar' ? surah.nameAr : surah.nameEn}
                        </span>
                        {isCached && (
                          <span className="text-[11px] font-medium text-[#059669] dark:text-[#10B981]">
                            {t.offlineTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] truncate mt-0.5 tabular-nums">
                        {lang === 'ar'
                          ? `${revLabel} · ${toArabicDigits(surah.totalAyahs)} ${t.ayahsWord}`
                          : `${surah.meaningEn} · ${revLabel} · ${surah.totalAyahs} ${t.ayahsWord}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <div
                      dir="rtl"
                      className="font-quran-scheherazade text-2xl font-semibold text-[#1C1917] dark:text-[#F7F4EB] group-hover:text-[#B4891B] dark:group-hover:text-[#D4AF37] transition-colors leading-none"
                    >
                      {surah.nameAr.replace('سُورَةُ ', '')}
                    </div>
                    <div className="text-[11px] text-[#57534E] dark:text-[#9CAFA6] tabular-nums mt-1">
                      {t.pageShort} {numFmt(surah.startPage)}
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredSurahs.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#57534E] dark:text-[#9CAFA6]">
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
                className="rounded-xl border border-[#B4891B]/18 dark:border-[#D4AF37]/16 bg-[#F4EFE4] dark:bg-[#11171D] p-4 text-start hover:border-[#B4891B] dark:hover:border-[#D4AF37] transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1C1917] dark:text-[#F7F4EB] tabular-nums">
                    {t.juzWord} {numFmt(juzNum)}
                  </span>
                  <span
                    dir="rtl"
                    className="font-quran-scheherazade text-base text-[#B4891B] dark:text-[#D4AF37]"
                  >
                    الجزء {toArabicDigits(juzNum)}
                  </span>
                </div>
                <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
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
            <div className="rounded-2xl border border-[#B4891B]/16 dark:border-[#D4AF37]/14 bg-[#F4EFE4]/60 dark:bg-[#11171D]/60 p-10 text-center space-y-2">
              <p className="text-sm font-medium text-[#1C1917] dark:text-[#F7F4EB]">
                {t.noBookmarksTitle}
              </p>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6]">
                {t.noBookmarksDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="rounded-xl border border-[#B4891B]/18 dark:border-[#D4AF37]/16 bg-[#F4EFE4] dark:bg-[#11171D] p-4 flex items-start justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSurah(bm.surah, bm.ayah)}
                    className="text-start flex-1 min-w-0 space-y-1.5"
                  >
                    <div className="text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
                      {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} · {bm.surah}:{bm.ayah} ·{' '}
                      {t.pageWord} {bm.page}
                    </div>
                    <p
                      dir="rtl"
                      className="font-quran-amiri text-xl leading-[2.1] text-[#1C1917] dark:text-[#F7F4EB] line-clamp-2"
                    >
                      {bm.snippet}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(bm.id)}
                    aria-label={`Remove bookmark ${bm.surah}:${bm.ayah}`}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CA3AF] hover:text-red-500 transition-colors"
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
