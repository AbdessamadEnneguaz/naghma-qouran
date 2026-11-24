import React, {useEffect, useMemo, useState} from 'react';
import {
  BellRing,
  BookHeart,
  BookOpen,
  ChevronRight,
  Download,
  Flame,
  Lightbulb,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  BookmarkEntry,
  LastReadState,
  OfflineSurahRecord,
  ReadingStats,
  Riwayat,
  SurahMeta,
} from '../types/quran';
import type {KhatmaScheduleSummary} from '../utils/khatmaLogic';
import {getEffectiveReadingStats} from '../utils/readingStreakLogic';
import {computeDailyPrayerSchedule} from '../utils/prayerTimes';
import {QIBLA_CITIES, type QiblaCity} from '../utils/qiblaLogic';
import {getDefaultAdhkarPeriod} from '../data/adhkarData';
import {toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';
import {MosqueSkylineSvg, PrayerTimeIconSvg} from './OrnamentalSvg';

interface HomeViewProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  lastRead: LastReadState | null;
  bookmarks: BookmarkEntry[];
  offlineRecords: OfflineSurahRecord[];
  riwayat: Riwayat;
  khatmaSchedule: KhatmaScheduleSummary;
  readingStats: ReadingStats;
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
const CITY_STORAGE_KEY = 'najm_city';

function getStoredCity(): QiblaCity {
  try {
    const saved = localStorage.getItem(CITY_STORAGE_KEY);
    if (saved) {
      const match = QIBLA_CITIES.find((c) => c.id === saved);
      if (match) return match;
    }
  } catch {
    // ignore storage errors
  }
  return QIBLA_CITIES[0];
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  t,
  surahs,
  lastRead,
  offlineRecords,
  riwayat,
  khatmaSchedule,
  readingStats,
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
  const effectiveStats = useMemo(
    () => getEffectiveReadingStats(readingStats),
    [readingStats]
  );
  const [pageJumpInput, setPageJumpInput] = useState('');
  const [selectedCity, setSelectedCity] = useState<QiblaCity>(getStoredCity);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const prayerSchedule = useMemo(
    () =>
      computeDailyPrayerSchedule(
        now,
        selectedCity.lat,
        selectedCity.lng,
        selectedCity.tzOffsetHours
      ),
    [now, selectedCity]
  );

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

  const handleCityChange = (cityId: string) => {
    const found = QIBLA_CITIES.find((c) => c.id === cityId);
    if (!found) return;
    setSelectedCity(found);
    try {
      localStorage.setItem(CITY_STORAGE_KEY, found.id);
    } catch {
      // ignore storage errors
    }
  };

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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-5 sm:pt-8 pb-8 space-y-6">
      {/* 1. Luxury Warm Sand & Honey Gold Hero "Last Read" Card */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/22 via-amber-400/12 to-orange-400/12 dark:from-amber-500/18 dark:via-[#261B13] dark:to-orange-500/10 p-5 sm:p-8 shadow-sm shadow-amber-500/10 space-y-5">
        {/* Minimalist Golden Mosque Skyline Silhouette */}
        <MosqueSkylineSvg className="absolute right-0 bottom-0 h-32 sm:h-40 w-64 sm:w-80 opacity-85 dark:opacity-25" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#FBBF24] tabular-nums">
              {t.lastReadLabel} · {riwayat === 'hafs' ? t.hafsLabel : t.warshLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D231E] dark:text-[#FAF5EE]">
              {lang === 'ar'
                ? lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'
                : lastReadSurah
                  ? `${lastReadSurah.nameEn}`
                  : 'Al-Fatihah'}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#4E3629] dark:text-[#E5D5C3] tabular-nums">
              {lastRead
                ? lang === 'ar'
                  ? `سورة ${toArabicDigits(lastRead.surah)} · الآية ${toArabicDigits(lastRead.ayah)} · ${t.pageWord} ${toArabicDigits(lastRead.page)}`
                  : `Surah ${lastRead.surah} · Ayah ${lastRead.ayah} · Page ${lastRead.page}`
                : lang === 'ar'
                  ? 'سورة ١ · الآية ١ · صفحة ١ من ٦٠٤'
                  : 'Surah 1 · Ayah 1 · Page 1 of 604'}
            </p>
          </div>

          {lang !== 'ar' && (
            <span
              dir="rtl"
              className="font-quran-scheherazade text-3xl sm:text-4xl text-[#B45309] dark:text-[#FBBF24] self-start sm:self-center leading-none"
            >
              {lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'}
            </span>
          )}
        </div>

        {/* Hero Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => (lastRead ? onOpenPage(lastRead.page) : onOpenPage(1))}
            className="rounded-full bg-[#D97706] hover:bg-[#B45309] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-700/20 transition-colors"
          >
            {lastRead
              ? `${t.resumePage} (${numFmt(lastRead.page)})`
              : t.openMushafPage1}
          </button>

          <button
            type="button"
            data-testid="home-browse-surahs-btn"
            onClick={onOpenAllSurahs}
            className="rounded-full border border-amber-500/25 bg-white/80 dark:bg-[#221914]/85 px-4 py-2.5 text-sm font-medium text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors"
          >
            {t.browseAllSurahsBtn}
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t.searchBtn}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/65 dark:bg-[#221914]/70 border border-amber-500/15 px-3.5 py-2.5 text-sm font-medium text-[#4E3629] dark:text-[#D6C7B8] hover:text-[#2D231E] dark:hover:text-[#FAF5EE] transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t.searchBtn}</span>
          </button>

          {!isInstalled && (
            <button
              type="button"
              data-testid="hero-apk-btn"
              onClick={onOpenDownloadApk}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/45 bg-white/85 dark:bg-[#2A1F17] px-4 py-2.5 text-sm font-semibold text-[#B45309] dark:text-[#FBBF24] shadow-sm hover:bg-amber-500/15 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.downloadApkHeroCta}</span>
            </button>
          )}
        </div>

        {/* Narration Toggle & Direct Page Jump */}
        <div className="relative z-10 pt-3.5 border-t border-amber-500/18 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-white/75 dark:bg-[#1B1410]/90 p-1 border border-amber-500/15 self-start">
            <button
              type="button"
              onClick={() => onChangeRiwayat('hafs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                riwayat === 'hafs'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.hafsLabel}
            </button>
            <button
              type="button"
              onClick={() => onChangeRiwayat('warsh')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                riwayat === 'warsh'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
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
              className="w-32 sm:w-40 rounded-full border border-amber-500/20 bg-white/85 dark:bg-[#1B1410] px-3.5 py-1.5 text-xs sm:text-sm text-[#2D231E] dark:text-[#FAF5EE] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-500/25 bg-white/80 dark:bg-[#221914] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] transition-colors"
            >
              {t.goBtn}
            </button>
          </form>
        </div>
      </section>

      {/* Reading Streak & Pages Read Strip */}
      <section
        aria-label={t.readingStreakTitle}
        data-testid="home-reading-streak"
        className="rounded-3xl border border-amber-500/14 bg-white/85 dark:bg-[#211914]/90 px-4 py-3.5 sm:px-6 sm:py-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-2xl bg-amber-500/14 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
              {t.readingStreakTitle}
            </div>
            <div className="text-base sm:text-lg font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
              {numFmt(effectiveStats.currentStreakDays)} {t.streakDaysUnit}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:gap-7 tabular-nums">
          <div>
            <div className="text-[11px] font-medium text-[#6E5649] dark:text-[#D6C7B8]">
              {t.pagesTodayLabel}
            </div>
            <div className="text-sm sm:text-base font-bold text-[#B45309] dark:text-[#FBBF24]">
              {numFmt(effectiveStats.todayPagesRead)} {t.pageShort}
            </div>
          </div>

          <div className="h-7 w-px bg-amber-500/18" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#D97706] shrink-0 hidden sm:block" />
            <div>
              <div className="text-[11px] font-medium text-[#6E5649] dark:text-[#D6C7B8]">
                {t.totalPagesReadLabel}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {numFmt(effectiveStats.totalPagesRead)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Prayer Times Bento Section (Fajr, Dhuhr, Asr, Maghrib, Isha) */}
      <section
        aria-label={t.prayerTimesTitle}
        data-testid="home-prayer-times"
        className="rounded-3xl border border-amber-500/12 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-4 sm:p-6 shadow-sm shadow-amber-500/5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
              {t.prayerTimesTitle}
            </h2>
            <p className="text-xs font-medium text-[#B45309] dark:text-[#FBBF24] tabular-nums mt-0.5">
              {t.remainingTimeLabel}:{' '}
              <span className="font-bold">
                {lang === 'ar'
                  ? prayerSchedule.nextPrayer.nameAr
                  : prayerSchedule.nextPrayer.nameEn}{' '}
                {prayerSchedule.remainingFormatted}
              </span>
            </p>
          </div>

          <select
            aria-label={t.selectCityLabel}
            value={selectedCity.id}
            onChange={(e) => handleCityChange(e.target.value)}
            className="rounded-full border border-amber-500/20 bg-[#FAF5EE] dark:bg-[#17110D] px-3 py-1.5 text-xs font-semibold text-[#4E3629] dark:text-[#D6C7B8] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          >
            {QIBLA_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {prayerSchedule.entries.map((entry) => {
            const isNext = entry.id === prayerSchedule.nextPrayer.id;
            return (
              <div
                key={entry.id}
                className={`rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 border transition-colors ${
                  isNext
                    ? 'bg-gradient-to-b from-amber-500/18 to-orange-400/10 border-amber-500/35 shadow-sm'
                    : 'bg-[#FAF5EE]/80 dark:bg-[#19120E]/80 border-amber-500/10'
                }`}
              >
                <PrayerTimeIconSvg id={entry.id} className="h-7 w-7" />
                <span className="text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                  {lang === 'ar' ? entry.nameAr : entry.nameEn}
                </span>
                <span className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
                  {entry.formatted24}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Smart Features Bento Section */}
      <section aria-label={t.smartFeaturesTitle} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#4E3629] dark:text-[#E5D5C3]">
            {t.smartFeaturesTitle}
          </h2>
          <button
            type="button"
            onClick={onOpenVault}
            className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] hover:underline tabular-nums"
          >
            {numFmt(offlineRecords.length)} {t.surahsCached}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            data-testid="bento-khatma"
            onClick={onOpenKhatma}
            className="text-start rounded-3xl border border-amber-500/12 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-4 shadow-sm shadow-amber-500/5 hover:border-amber-500/40 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-amber-500/14 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                {numFmt(khatmaSchedule.percentComplete)}%
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.featureReminder}
              </div>
              <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 truncate tabular-nums">
                {khatmaSchedule.isTodayComplete
                  ? t.todayWirdDone
                  : lang === 'ar'
                    ? `ص ${numFmt(khatmaSchedule.todayStartPage)}–${numFmt(khatmaSchedule.todayEndPage)}`
                    : `Wird p. ${khatmaSchedule.todayStartPage}–${khatmaSchedule.todayEndPage}`}
              </div>
            </div>
          </button>

          <button
            type="button"
            data-testid="bento-talqeen"
            onClick={onLaunchTalqeen}
            className="text-start rounded-3xl border border-amber-500/12 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-4 shadow-sm shadow-amber-500/5 hover:border-amber-500/40 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-orange-400/15 text-[#EA580C] dark:text-[#FB923C] flex items-center justify-center">
                <Lightbulb className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                {lang === 'ar'
                  ? `${toArabicDigits(talqeenPauseSeconds)}ث`
                  : `${talqeenPauseSeconds}s`}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.featureMemorize}
              </div>
              <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 truncate">
                {t.bentoTalqeenSubtitle}
              </div>
            </div>
          </button>

          <button
            type="button"
            data-testid="bento-heart"
            onClick={onOpenHeartGuide}
            className="text-start rounded-3xl border border-amber-500/12 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-4 shadow-sm shadow-amber-500/5 hover:border-amber-500/40 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-amber-500/14 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                <BookHeart className="h-5 w-5" />
              </span>
              <ChevronRight className="h-4 w-4 text-[#6E5649]/60" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.featureRuqyah}
              </div>
              <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 truncate">
                {t.bentoHeartSubtitle}
              </div>
            </div>
          </button>

          <button
            type="button"
            data-testid="bento-adhkar"
            onClick={onOpenAdhkar}
            className="text-start rounded-3xl border border-amber-500/12 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-4 shadow-sm shadow-amber-500/5 hover:border-amber-500/40 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-orange-400/15 text-[#EA580C] dark:text-[#FB923C] flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-[#B45309] dark:text-[#FBBF24]">
                {adhkarPeriodLabel}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.featureDuaQa}
              </div>
              <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 truncate">
                {t.bentoAdhkarSubtitle}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Quick Surahs Directory (Numbered Warm Badges matching image_17) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#4E3629] dark:text-[#E5D5C3]">
            {lang === 'ar'
              ? 'سور مختارة'
              : lang === 'fr'
                ? 'Coran · Sourates choisies'
                : 'Al-Quran · Quick Surahs'}
          </h2>
          <button
            type="button"
            onClick={onOpenAllSurahs}
            className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] hover:underline"
          >
            {t.browseAllSurahsBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {featuredSurahs.map((surah) => (
            <button
              key={surah.id}
              type="button"
              onClick={() => onOpenSurah(surah.id)}
              className="text-start rounded-2xl border border-amber-500/12 bg-white/75 dark:bg-[#211914]/85 px-4 py-3 hover:border-amber-500/40 shadow-sm shadow-amber-500/5 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-8 w-8 rounded-full bg-amber-500/14 text-xs font-bold text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center tabular-nums shrink-0">
                  {String(surah.id).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate">
                    {lang === 'ar' ? surah.nameAr : surah.nameEn}
                  </div>
                  <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                    {numFmt(surah.totalAyahs)} {t.ayahsWord} · {t.pageShort} {numFmt(surah.startPage)}
                  </div>
                </div>
              </div>
              <span
                dir="rtl"
                className="font-quran-scheherazade text-lg text-[#B45309] dark:text-[#FBBF24] shrink-0"
              >
                {surah.nameAr.replace('سُورَةُ ', '')}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
