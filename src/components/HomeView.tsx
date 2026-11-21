import React, {useMemo, useState} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  HardDrive,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type {
  BookmarkEntry,
  LastReadState,
  OfflineSurahRecord,
  Riwayat,
  SurahMeta,
} from '../types/quran';
import type {KhatmaScheduleSummary} from '../utils/khatmaLogic';
import {getDefaultAdhkarPeriod} from '../data/adhkarData';
import {stripTashkeel, toArabicDigits} from '../utils/quranLogic';
import {
  AdhkarCrescentSvg,
  HeartAyahSvg,
  RubElHizbBadge,
  TalqeenWaveSvg,
} from './OrnamentalSvg';
import type {AppLang, Translations} from '../i18n/translations';

interface HomeViewProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  lastRead: LastReadState | null;
  bookmarks: BookmarkEntry[];
  offlineRecords: OfflineSurahRecord[];
  riwayat: Riwayat;
  khatmaSchedule: KhatmaScheduleSummary;
  talqeenPauseSeconds: 3 | 5 | 8;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onOpenPage: (page: number) => void;
  onOpenSearch: () => void;
  onOpenVault: () => void;
  onOpenKhatma: () => void;
  onOpenAdhkar: () => void;
  onLaunchTalqeen: () => void;
  onOpenHeartGuide: () => void;
  onRemoveBookmark: (id: string) => void;
}

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  t,
  surahs,
  lastRead,
  bookmarks,
  offlineRecords,
  riwayat,
  khatmaSchedule,
  talqeenPauseSeconds,
  onChangeRiwayat,
  onOpenSurah,
  onOpenPage,
  onOpenSearch,
  onOpenVault,
  onOpenKhatma,
  onOpenAdhkar,
  onLaunchTalqeen,
  onOpenHeartGuide,
  onRemoveBookmark,
}) => {
  const [filterText, setFilterText] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [directoryView, setDirectoryView] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [pageJumpInput, setPageJumpInput] = useState('');

  const lastReadSurah = useMemo(
    () => surahs.find((s) => s.id === (lastRead?.surah || 1)) || surahs[0],
    [surahs, lastRead]
  );

  const filteredSurahs = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    const qAr = stripTashkeel(filterText.trim());
    return surahs.filter((s) => {
      if (revelationFilter !== 'all' && s.revelationType !== revelationFilter) {
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
  }, [surahs, filterText, revelationFilter]);

  const offlineSurahIds = useMemo(
    () => new Set(offlineRecords.map((r) => r.surah)),
    [offlineRecords]
  );

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(pageJumpInput);
    if (Number.isInteger(num) && num >= 1 && num <= 604) {
      onOpenPage(num);
      setPageJumpInput('');
    }
  };

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const defaultPeriod = getDefaultAdhkarPeriod();
  const adhkarPeriodLabel =
    defaultPeriod === 'sabah' ? t.adhkarSabah : t.adhkarMasaa;

  // Mini circular progress ring geometry for Khatma Bento card
  const ringR = 16;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC * (1 - khatmaSchedule.percentComplete / 100);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-28 space-y-6 sm:space-y-8">
      {/* Row 1: Continue Reading Hero + Narration/Page Jump Utility */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        <div className="lg:col-span-7 relative rounded-2xl border border-[#B4891B]/30 dark:border-[#D4AF37]/25 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-7 islamic-lattice-bg overflow-hidden flex flex-col justify-between gap-5">
          <div className="space-y-2.5 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#B4891B] dark:text-[#D4AF37]">
                <Bookmark className="h-3.5 w-3.5 fill-current" />
                <span>{lastRead ? t.continueReading : t.beginRecitation}</span>
              </span>
              <span className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
                {riwayat === 'hafs' ? t.hafsLabel : t.warshLabel}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 pt-0.5">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F7F4EB] [text-wrap:balance]">
                {lang === 'ar'
                  ? lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'
                  : lastReadSurah
                    ? `${lastReadSurah.id}. ${lastReadSurah.nameEn}`
                    : '1. Al-Fatiha'}
              </h1>
              {lang === 'en' && (
                <span
                  dir="rtl"
                  className="font-quran-scheherazade text-3xl sm:text-5xl text-[#B4891B] dark:text-[#D4AF37] shrink-0 leading-none"
                >
                  {lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
              {lastRead
                ? lang === 'ar'
                  ? `الآية ${toArabicDigits(lastRead.ayah)} · ${t.pageWord} ${toArabicDigits(lastRead.page)} ${t.ofWord} ٦٠٤`
                  : `Ayah ${lastRead.ayah} · Madani Mushaf Page ${lastRead.page} of 604 · ${lastReadSurah?.meaningEn}`
                : lang === 'ar'
                  ? 'مصحف المدينة المنورة (٦٠٤ صفحة) · متاح بالكامل دون إنترنت'
                  : '604-Page Madani Mushaf · Complete Offline Vault Ready'}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => (lastRead ? onOpenPage(lastRead.page) : onOpenPage(1))}
              className="inline-flex items-center gap-2 rounded-xl bg-[#059669] dark:bg-[#10B981] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white dark:text-[#06100D] hover:opacity-90 transition-opacity"
            >
              <BookOpen className="h-4 w-4" />
              <span>
                {lastRead
                  ? `${t.resumePage} ${lang === 'ar' ? toArabicDigits(lastRead.page) : lastRead.page}`
                  : t.openMushafPage1}
              </span>
              <DirArrow className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-xl border border-[#B4891B]/28 dark:border-[#D4AF37]/25 bg-[#FAF6EE]/90 dark:bg-[#0B0E11]/85 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#1C1917] dark:text-[#F7F4EB] hover:border-[#D4AF37] transition-colors"
            >
              <Search className="h-4 w-4 text-[#B4891B] dark:text-[#D4AF37]" />
              <span>{t.searchBtn}</span>
            </button>
          </div>
        </div>

        {/* Utility Panel: Narration + Direct Page Jump */}
        <div className="lg:col-span-5 rounded-2xl border border-[#B4891B]/22 dark:border-[#D4AF37]/18 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#57534E] dark:text-[#9CAFA6]">
                {t.narrationLabel}
              </span>
              <button
                type="button"
                onClick={onOpenVault}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669] dark:text-[#10B981] hover:underline tabular-nums"
              >
                <HardDrive className="h-3.5 w-3.5" />
                <span>
                  {numFmt(offlineRecords.length)} {t.surahsCached}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FAF6EE] dark:bg-[#0B0E11] border border-[#B4891B]/18 dark:border-white/10">
              <button
                type="button"
                onClick={() => onChangeRiwayat('hafs')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  riwayat === 'hafs'
                    ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                    : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
                }`}
              >
                {t.hafsLabel}
              </button>
              <button
                type="button"
                onClick={() => onChangeRiwayat('warsh')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  riwayat === 'warsh'
                    ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                    : 'text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB]'
                }`}
              >
                {t.warshLabel}
              </button>
            </div>
          </div>

          <form onSubmit={handlePageJumpSubmit} className="space-y-1.5">
            <label
              htmlFor="page-jump-input"
              className="block text-xs font-semibold text-[#57534E] dark:text-[#9CAFA6]"
            >
              {t.jumpToPageLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="page-jump-input"
                type="number"
                min={1}
                max={604}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                placeholder={t.jumpPlaceholder}
                className="flex-1 min-w-0 rounded-xl border border-[#B4891B]/22 dark:border-white/12 bg-[#FAF6EE] dark:bg-[#0B0E11] px-3.5 py-2 text-sm text-[#1C1917] dark:text-[#F7F4EB] placeholder:text-[#57534E]/60 dark:placeholder:text-[#9CAFA6]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] tabular-nums"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl border border-[#B4891B]/35 dark:border-[#D4AF37]/30 px-4 py-2 text-sm font-semibold text-[#B4891B] dark:text-[#D4AF37] hover:bg-[#B4891B]/10 dark:hover:bg-[#D4AF37]/10 transition-colors"
              >
                {t.goBtn}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#57534E] dark:text-[#9CAFA6]">
            <span className="font-medium text-[#1C1917] dark:text-[#F7F4EB]">
              {t.quickOpen}
            </span>
            {[
              {id: 1, en: 'Al-Fatiha', ar: 'الفاتحة'},
              {id: 18, en: 'Al-Kahf', ar: 'الكهف'},
              {id: 36, en: 'Yasin', ar: 'يس'},
              {id: 67, en: 'Al-Mulk', ar: 'الملك'},
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenSurah(item.id)}
                className="hover:text-[#B4891B] dark:hover:text-[#D4AF37] underline underline-offset-4 transition-colors"
              >
                {lang === 'ar' ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Row 2: Luxury Symmetric Bento-Grid Feature Hub */}
      <section aria-label={t.bentoSectionTitle} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
            {t.bentoSectionTitle}
          </h2>
          <span className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
            {lang === 'ar' ? '١٠٠٪ دون إنترنت' : '100% Offline Ready'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          {/* Tile 1: Smart Khatma Planner */}
          <button
            type="button"
            data-testid="bento-khatma"
            onClick={onOpenKhatma}
            className="group text-start rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/20 bg-[#F4EFE4] dark:bg-[#11171D] p-4 sm:p-5 hover:border-[#10B981]/60 transition-colors flex flex-col justify-between gap-4 min-h-[146px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90" aria-hidden="true">
                  <circle
                    cx="20"
                    cy="20"
                    r={ringR}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[#B4891B]/20 dark:text-white/12"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r={ringR}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ringC}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums">
                  {numFmt(khatmaSchedule.percentComplete)}%
                </span>
              </div>

              <span className="text-[11px] font-medium text-[#059669] dark:text-[#34D399] tabular-nums">
                {numFmt(khatmaSchedule.daysRemaining)} {t.daysUnit}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA] group-hover:text-[#059669] dark:group-hover:text-[#34D399] transition-colors">
                {t.bentoKhatmaTitle}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums line-clamp-1">
                {khatmaSchedule.isTodayComplete
                  ? t.todayWirdDone
                  : lang === 'ar'
                    ? `ص ${numFmt(khatmaSchedule.todayStartPage)}–${numFmt(khatmaSchedule.todayEndPage)} · ${numFmt(khatmaSchedule.adaptiveDailyTarget)}/يوم`
                    : `p. ${khatmaSchedule.todayStartPage}–${khatmaSchedule.todayEndPage} · ${khatmaSchedule.adaptiveDailyTarget}/day`}
              </p>
            </div>
          </button>

          {/* Tile 2: Adhkar Sabaa & Masaa */}
          <button
            type="button"
            data-testid="bento-adhkar"
            onClick={onOpenAdhkar}
            className="group text-start rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/20 bg-[#F4EFE4] dark:bg-[#11171D] p-4 sm:p-5 hover:border-[#D4AF37]/65 transition-colors flex flex-col justify-between gap-4 min-h-[146px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="h-10 w-10 rounded-xl border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#FAF6EE]/80 dark:bg-[#0B0E11]/70 flex items-center justify-center text-[#B4891B] dark:text-[#D4AF37]">
                <AdhkarCrescentSvg className="h-5 w-5" />
              </div>

              <span className="text-[11px] font-medium text-[#B4891B] dark:text-[#D4AF37]">
                {adhkarPeriodLabel}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA] group-hover:text-[#B4891B] dark:group-hover:text-[#D4AF37] transition-colors">
                {t.bentoAdhkarTitle}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] line-clamp-1">
                {t.bentoAdhkarSubtitle}
              </p>
            </div>
          </button>

          {/* Tile 3: Talqeen Hifz Quick-Launch */}
          <button
            type="button"
            data-testid="bento-talqeen"
            onClick={onLaunchTalqeen}
            className="group text-start rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/20 bg-[#F4EFE4] dark:bg-[#11171D] p-4 sm:p-5 hover:border-[#10B981]/60 transition-colors flex flex-col justify-between gap-4 min-h-[146px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="h-10 w-10 rounded-xl border border-[#059669]/25 dark:border-[#10B981]/25 bg-[#FAF6EE]/80 dark:bg-[#0B0E11]/70 flex items-center justify-center text-[#059669] dark:text-[#10B981]">
                <TalqeenWaveSvg className="h-5 w-5" />
              </div>

              <span className="text-[11px] font-medium text-[#059669] dark:text-[#34D399] tabular-nums">
                {lang === 'ar'
                  ? `مهلة ${toArabicDigits(talqeenPauseSeconds)}ث`
                  : `${talqeenPauseSeconds}s pause`}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA] group-hover:text-[#059669] dark:group-hover:text-[#34D399] transition-colors">
                {t.bentoTalqeenTitle}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] line-clamp-1">
                {t.bentoTalqeenSubtitle}
              </p>
            </div>
          </button>

          {/* Tile 4: Verses for Your Heart */}
          <button
            type="button"
            data-testid="bento-heart"
            onClick={onOpenHeartGuide}
            className="group text-start rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/20 bg-[#F4EFE4] dark:bg-[#11171D] p-4 sm:p-5 hover:border-[#D4AF37]/65 transition-colors flex flex-col justify-between gap-4 min-h-[146px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="h-10 w-10 rounded-xl border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#FAF6EE]/80 dark:bg-[#0B0E11]/70 flex items-center justify-center text-[#B4891B] dark:text-[#D4AF37]">
                <HeartAyahSvg className="h-5 w-5" />
              </div>

              <span className="text-[11px] font-medium text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
                {lang === 'ar' ? '٥ أحوال · PNG' : '5 Moods · PNG'}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA] group-hover:text-[#B4891B] dark:group-hover:text-[#D4AF37] transition-colors">
                {t.bentoHeartTitle}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] line-clamp-1">
                {t.bentoHeartSubtitle}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Row 3: Directory Tabs + Filter Bar */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#B4891B]/18 dark:border-[#D4AF37]/15 pb-4">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4EFE4] dark:bg-[#11171D] self-start">
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
              {t.tabBookmarks} ({lang === 'ar' ? toArabicDigits(bookmarks.length) : bookmarks.length})
            </button>
          </div>

          {directoryView === 'surahs' && (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#57534E] dark:text-[#9CAFA6]" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={t.filterSurahPlaceholder}
                  aria-label={t.filterSurahPlaceholder}
                  className="w-full rounded-xl border border-[#B4891B]/20 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] ps-9 pe-3 py-2 text-sm text-[#1C1917] dark:text-[#F7F4EB] placeholder:text-[#57534E]/70 dark:placeholder:text-[#9CAFA6]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4EFE4] dark:bg-[#11171D]">
                {(['all', 'Meccan', 'Medinan'] as const).map((rev) => (
                  <button
                    key={rev}
                    type="button"
                    onClick={() => setRevelationFilter(rev)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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
          )}
        </div>

        {/* Directory Content */}
        {directoryView === 'surahs' && (
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
                    <RubElHizbBadge number={surah.id} lang={lang} />
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
                      {t.pageShort} {lang === 'ar' ? toArabicDigits(surah.startPage) : surah.startPage}
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
                      {t.juzWord} {lang === 'ar' ? toArabicDigits(juzNum) : juzNum}
                    </span>
                    <span
                      dir="rtl"
                      className="font-quran-scheherazade text-base text-[#B4891B] dark:text-[#D4AF37]"
                    >
                      الجزء {toArabicDigits(juzNum)}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
                    {t.startsAtPage} {lang === 'ar' ? toArabicDigits(startPage) : startPage}
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
                <Bookmark className="h-7 w-7 mx-auto text-[#B4891B] dark:text-[#D4AF37]" />
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
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {lang === 'ar' ? bm.surahNameAr : bm.surahNameEn} · {bm.surah}:{bm.ayah} · {t.pageWord} {bm.page}
                        </span>
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
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CAFA6] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
