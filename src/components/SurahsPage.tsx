import React, {useMemo, useState} from 'react';
import {Play, Search, Trash2} from 'lucide-react';
import type {
  BookmarkCategory,
  BookmarkEntry,
  OfflineSurahRecord,
  SurahMeta,
} from '../types/quran';
import {getBookmarkCategory, stripTashkeel, toArabicDigits} from '../utils/quranLogic';
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

const BM_CAT_STYLES: Record<
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
    dotClass: 'bg-[#6B6A66] dark:text-[#A1A1AA]',
    badgeClass: 'text-[#6B6A66] dark:text-[#A1A1AA]',
  },
};

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
  const [bmFilter, setBmFilter] = useState<'all' | BookmarkCategory>('all');

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E6E4DF] dark:border-[#222226] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#121212] dark:text-[#F4F4F5]">
            {t.navSurahs} ·{' '}
            {lang === 'ar'
              ? 'الفهرس الكامل'
              : lang === 'fr'
                ? 'Répertoire complet'
                : 'Complete Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6A66] dark:text-[#8E8E93] mt-0.5 tabular-nums">
            {lang === 'ar'
              ? '١١٤ سورة · ٣٠ جزءاً · يفتح كل اختيار على صفحته الدقيقة في المصحف'
              : lang === 'fr'
                ? "114 sourates · 30 Juz' · Chaque choix s'ouvre directement à sa page du Moushaf"
                : "114 Surahs · 30 Juz' · Every Surah opens directly on its Madani Mushaf page"}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE4] dark:bg-[#16161A] border border-[#E6E4DF] dark:border-[#222226] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDirectoryView('surahs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'surahs'
                ? 'bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] shadow-sm'
                : 'text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]'
            }`}
          >
            {t.tabSurahs}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('juz')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              directoryView === 'juz'
                ? 'bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] shadow-sm'
                : 'text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]'
            }`}
          >
            {t.tabJuz}
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView('bookmarks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors tabular-nums ${
              directoryView === 'bookmarks'
                ? 'bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] shadow-sm'
                : 'text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]'
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
              <Search
                strokeWidth={1.5}
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6A66] dark:text-[#8E8E93]"
              />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t.filterSurahPlaceholder}
                aria-label={t.filterSurahPlaceholder}
                className="w-full rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] ps-10 pe-4 py-2.5 text-sm text-[#121212] dark:text-[#F4F4F5] placeholder:text-[#6B6A66]/65 focus:outline-none focus:ring-1 focus:ring-[#0F5132] dark:focus:ring-[#C5A46D]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label={t.juzWord}
                value={juzFilter}
                onChange={(e) => setJuzFilter(Number(e.target.value))}
                className="rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-[#121212] dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#0F5132] dark:focus:ring-[#C5A46D]"
              >
                <option value={0}>{t.allJuzFilter}</option>
                {Array.from({length: 30}, (_, idx) => idx + 1).map((j) => (
                  <option key={j} value={j}>
                    {t.juzWord} {numFmt(j)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE4] dark:bg-[#16161A] border border-[#E6E4DF] dark:border-[#222226]">
                {(['all', 'Meccan', 'Medinan'] as const).map((rev) => (
                  <button
                    key={rev}
                    type="button"
                    onClick={() => setRevelationFilter(rev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      revelationFilter === rev
                        ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                        : 'text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]'
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
                  className="group text-start rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-4 hover:border-[#0F5132]/40 dark:hover:border-[#C5A46D]/45 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] flex items-center justify-center text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] tabular-nums shrink-0">
                      {String(surah.id).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#121212] dark:text-[#F4F4F5] truncate group-hover:text-[#0F5132] dark:group-hover:text-[#C5A46D] transition-colors">
                          {lang === 'ar' ? surah.nameAr : surah.nameEn}
                        </span>
                        {isCached && (
                          <span className="text-[11px] font-semibold text-[#0F5132] dark:text-[#C5A46D]">
                            {t.offlineTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] truncate mt-0.5 tabular-nums">
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
                        className="font-quran-scheherazade text-2xl font-semibold text-[#121212] dark:text-[#F4F4F5] leading-none"
                      >
                        {surah.nameAr.replace('سُورَةُ ', '')}
                      </div>
                      <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] tabular-nums mt-1">
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
                        className="h-8 w-8 rounded-full border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] text-[#0F5132] dark:text-[#C5A46D] hover:bg-[#0F5132] hover:text-white dark:hover:bg-[#C5A46D] dark:hover:text-[#09090B] flex items-center justify-center transition-colors shrink-0"
                      >
                        <Play className="h-3.5 w-3.5 ms-0.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredSurahs.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#6B6A66] dark:text-[#8E8E93]">
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
                className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-4 text-start hover:border-[#0F5132]/40 dark:hover:border-[#C5A46D]/45 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] tabular-nums">
                    {t.juzWord} {numFmt(juzNum)}
                  </span>
                  <span
                    dir="rtl"
                    className="font-quran-scheherazade text-base text-[#0F5132] dark:text-[#C5A46D]"
                  >
                    الجزء {toArabicDigits(juzNum)}
                  </span>
                </div>
                <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                  {t.startsAtPage} {numFmt(startPage)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {directoryView === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBmFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    bmFilter === cat
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/10 dark:bg-[#C5A46D]/15 text-[#0F5132] dark:text-[#C5A46D]'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${BM_CAT_STYLES[cat].dotClass}`} />
                  <span>{getCategoryLabel(cat)}</span>
                </button>
              ))}
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <div className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]">
                {t.noBookmarksTitle}
              </p>
              <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
                {t.noBookmarksDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBookmarks.map((bm) => {
                const cat = getBookmarkCategory(bm);
                const style = BM_CAT_STYLES[cat];
                return (
                  <div
                    key={bm.id}
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
                          {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} · {bm.surah}:{bm.ayah} ·{' '}
                          {t.pageWord} {bm.page}
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
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#6B6A66] dark:text-[#8E8E93] hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
