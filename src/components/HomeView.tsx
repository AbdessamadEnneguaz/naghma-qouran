import React, {useMemo, useState} from 'react';
import type {
  BookmarkEntry,
  LastReadState,
  OfflineSurahRecord,
  Riwayat,
  SurahMeta,
} from '../types/quran';
import type {KhatmaScheduleSummary} from '../utils/khatmaLogic';
import {getDefaultAdhkarPeriod} from '../data/adhkarData';
import {toArabicDigits} from '../utils/quranLogic';
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
  isInstalled: boolean;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onOpenPage: (page: number) => void;
  onOpenSearch: () => void;
  onOpenAllSurahs: () => void;
  onOpenVault: () => void;
  onOpenKhatma: () => void;
  onOpenAdhkar: () => void;
  onOpenDownloadApk: () => void;
  onLaunchTalqeen: () => void;
  onOpenHeartGuide: () => void;
  onRemoveBookmark: (id: string) => void;
}

const FEATURED_SURAH_IDS = [1, 2, 18, 36, 55, 67];

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  t,
  surahs,
  lastRead,
  offlineRecords,
  riwayat,
  khatmaSchedule,
  talqeenPauseSeconds,
  isInstalled,
  onChangeRiwayat,
  onOpenSurah,
  onOpenPage,
  onOpenSearch,
  onOpenAllSurahs,
  onOpenVault,
  onOpenKhatma,
  onOpenAdhkar,
  onOpenDownloadApk,
  onLaunchTalqeen,
  onOpenHeartGuide,
}) => {
  const [pageJumpInput, setPageJumpInput] = useState('');

  const lastReadSurah = useMemo(
    () => surahs.find((s) => s.id === (lastRead?.surah || 1)) || surahs[0],
    [surahs, lastRead]
  );

  const featuredSurahs = useMemo(
    () =>
      FEATURED_SURAH_IDS.map((id) => surahs.find((s) => s.id === id)).filter(
        Boolean
      ) as SurahMeta[],
    [surahs]
  );

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(pageJumpInput);
    if (Number.isInteger(num) && num >= 1 && num <= 604) {
      onOpenPage(num);
      setPageJumpInput('');
    }
  };

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const defaultPeriod = getDefaultAdhkarPeriod();
  const adhkarPeriodLabel = defaultPeriod === 'sabah' ? t.adhkarSabah : t.adhkarMasaa;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-9 pb-28 md:pb-24 space-y-8">
      {/* 1. Calm Primary Reading Card (Zero Icon Clutter) */}
      <section className="rounded-2xl border border-[#B4891B]/22 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
              {lastRead ? t.continueReading : t.beginRecitation} ·{' '}
              {riwayat === 'hafs' ? t.hafsLabel : t.warshLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
              {lang === 'ar'
                ? lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'
                : lastReadSurah
                  ? `${lastReadSurah.id}. ${lastReadSurah.nameEn}`
                  : '1. Al-Fatiha'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
              {lastRead
                ? lang === 'ar'
                  ? `الآية ${toArabicDigits(lastRead.ayah)} · ${t.pageWord} ${toArabicDigits(lastRead.page)} ${t.ofWord} ٦٠٤`
                  : `Ayah ${lastRead.ayah} · Page ${lastRead.page} of 604`
                : lang === 'ar'
                  ? 'مصحف المدينة المنورة · ٦٠٤ صفحة دون إنترنت'
                  : 'Madani Mushaf · 604 Pages Offline'}
            </p>
          </div>

          {lang === 'en' && (
            <span
              dir="rtl"
              className="font-quran-scheherazade text-3xl sm:text-4xl text-[#B4891B] dark:text-[#D4AF37] self-start sm:self-center leading-none"
            >
              {lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'}
            </span>
          )}
        </div>

        {/* Simple, Clear Action Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => (lastRead ? onOpenPage(lastRead.page) : onOpenPage(1))}
            className="rounded-xl bg-[#059669] dark:bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#06100D] hover:opacity-90 transition-opacity"
          >
            {lastRead
              ? `${t.resumePage} ${lang === 'ar' ? toArabicDigits(lastRead.page) : lastRead.page}`
              : t.openMushafPage1}
          </button>

          <button
            type="button"
            data-testid="home-browse-surahs-btn"
            onClick={onOpenAllSurahs}
            className="rounded-xl border border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0A0D10] px-4 py-2.5 text-sm font-medium text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981] transition-colors"
          >
            {t.browseAllSurahsBtn}
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA] transition-colors"
          >
            {t.searchBtn}
          </button>

          {!isInstalled && (
            <button
              type="button"
              data-testid="hero-apk-btn"
              onClick={onOpenDownloadApk}
              className="rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/12 px-4 py-2.5 text-sm font-semibold text-[#9A6E10] dark:text-[#FDE68A] hover:bg-[#D4AF37]/20 transition-colors"
            >
              {t.downloadApkHeroCta}
            </button>
          )}
        </div>

        {/* Simple Narration & Page Jump Row */}
        <div className="pt-4 border-t border-[#B4891B]/12 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#FAF6EE] dark:bg-[#0A0D10] p-1 border border-[#B4891B]/16 dark:border-white/10 self-start">
            <button
              type="button"
              onClick={() => onChangeRiwayat('hafs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                riwayat === 'hafs'
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                  : 'text-[#57534E] dark:text-[#9CA3AF]'
              }`}
            >
              {t.hafsLabel}
            </button>
            <button
              type="button"
              onClick={() => onChangeRiwayat('warsh')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                riwayat === 'warsh'
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                  : 'text-[#57534E] dark:text-[#9CA3AF]'
              }`}
            >
              {t.warshLabel}
            </button>
          </div>

          <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-2">
            <input
              id="page-jump-input"
              type="number"
              min={1}
              max={604}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              placeholder={t.jumpPlaceholder}
              aria-label={t.jumpToPageLabel}
              className="w-36 sm:w-44 rounded-xl border border-[#B4891B]/20 dark:border-white/12 bg-[#FAF6EE] dark:bg-[#0A0D10] px-3 py-1.5 text-xs sm:text-sm text-[#1C1917] dark:text-[#F4F1EA] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            <button
              type="submit"
              className="rounded-xl border border-[#B4891B]/25 dark:border-white/14 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981] transition-colors"
            >
              {t.goBtn}
            </button>
          </form>
        </div>
      </section>

      {/* 2. Clean 2x2 Minimalist Tools (Text-Only, Zero Icon Overload) */}
      <section aria-label={t.bentoSectionTitle} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#57534E] dark:text-[#9CA3AF]">
            {t.bentoSectionTitle}
          </h2>
          <button
            type="button"
            onClick={onOpenVault}
            className="text-xs font-medium text-[#059669] dark:text-[#10B981] hover:underline tabular-nums"
          >
            {numFmt(offlineRecords.length)} {t.surahsCached}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            data-testid="bento-khatma"
            onClick={onOpenKhatma}
            className="text-start rounded-2xl border border-[#B4891B]/18 dark:border-white/10 bg-[#F4EFE4]/60 dark:bg-[#11171D] px-5 py-4 hover:border-[#10B981] transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.bentoKhatmaTitle}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#9CA3AF] mt-0.5 tabular-nums">
                {khatmaSchedule.isTodayComplete
                  ? t.todayWirdDone
                  : lang === 'ar'
                    ? `ص ${numFmt(khatmaSchedule.todayStartPage)}–${numFmt(khatmaSchedule.todayEndPage)} · ${numFmt(khatmaSchedule.adaptiveDailyTarget)}/يوم`
                    : `p. ${khatmaSchedule.todayStartPage}–${khatmaSchedule.todayEndPage} · ${khatmaSchedule.adaptiveDailyTarget}/day`}
              </div>
            </div>
            <span className="text-sm font-bold text-[#059669] dark:text-[#10B981] tabular-nums shrink-0">
              {numFmt(khatmaSchedule.percentComplete)}%
            </span>
          </button>

          <button
            type="button"
            data-testid="bento-adhkar"
            onClick={onOpenAdhkar}
            className="text-start rounded-2xl border border-[#B4891B]/18 dark:border-white/10 bg-[#F4EFE4]/60 dark:bg-[#11171D] px-5 py-4 hover:border-[#D4AF37] transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.bentoAdhkarTitle}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#9CA3AF] mt-0.5">
                {t.bentoAdhkarSubtitle}
              </div>
            </div>
            <span className="text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] shrink-0">
              {adhkarPeriodLabel}
            </span>
          </button>

          <button
            type="button"
            data-testid="bento-talqeen"
            onClick={onLaunchTalqeen}
            className="text-start rounded-2xl border border-[#B4891B]/18 dark:border-white/10 bg-[#F4EFE4]/60 dark:bg-[#11171D] px-5 py-4 hover:border-[#10B981] transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.bentoTalqeenTitle}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#9CA3AF] mt-0.5">
                {t.bentoTalqeenSubtitle}
              </div>
            </div>
            <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] tabular-nums shrink-0">
              {lang === 'ar'
                ? `${toArabicDigits(talqeenPauseSeconds)}ث`
                : `${talqeenPauseSeconds}s`}
            </span>
          </button>

          <button
            type="button"
            data-testid="bento-heart"
            onClick={onOpenHeartGuide}
            className="text-start rounded-2xl border border-[#B4891B]/18 dark:border-white/10 bg-[#F4EFE4]/60 dark:bg-[#11171D] px-5 py-4 hover:border-[#D4AF37] transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.bentoHeartTitle}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#9CA3AF] mt-0.5">
                {t.bentoHeartSubtitle}
              </div>
            </div>
            <span className="text-xs text-[#57534E] dark:text-[#9CA3AF] shrink-0">›</span>
          </button>
        </div>
      </section>

      {/* 3. Simple Essential Surahs List (Clean Typography Only) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#57534E] dark:text-[#9CA3AF]">
          {lang === 'ar' ? 'سور شائعة' : 'Quick Surahs'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {featuredSurahs.map((surah) => (
            <button
              key={surah.id}
              type="button"
              onClick={() => onOpenSurah(surah.id)}
              className="text-start rounded-xl border border-[#B4891B]/16 dark:border-white/8 bg-[#F4EFE4]/45 dark:bg-[#11171D]/80 px-4 py-3 hover:border-[#10B981] transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-[#B4891B] dark:text-[#D4AF37] tabular-nums w-6 shrink-0">
                  {numFmt(surah.id)}
                </span>
                <span className="text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] truncate">
                  {lang === 'ar' ? surah.nameAr : surah.nameEn}
                </span>
              </div>
              <span className="text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums shrink-0">
                {t.pageShort} {numFmt(surah.startPage)}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
