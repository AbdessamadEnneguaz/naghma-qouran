import React, {useEffect, useMemo, useState} from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Compass,
  Download,
  HardDrive,
  MoonStar,
  Search,
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
import {toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';
import {PrayerTimeIconSvg} from './OrnamentalSvg';

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
  talqeenPauseSeconds?: 3 | 5 | 8;
  isInstalled: boolean;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onOpenPage: (page: number) => void;
  onOpenSearch: () => void;
  onOpenAllSurahs: () => void;
  onOpenVault: () => void;
  onOpenKhatma: () => void;
  onOpenAdhkar: () => void;
  onOpenQibla: () => void;
  onOpenDownloadApk: () => void;
  onLaunchTalqeen?: () => void;
  onOpenHeartGuide?: () => void;
  onRemoveBookmark?: (id: string) => void;
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

const PrayerTimesSection = React.memo<{lang: AppLang; t: Translations}>(({lang, t}) => {
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

  return (
    <section
      aria-label={t.prayerTimesTitle}
      data-testid="home-prayer-times"
      className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-4 sm:p-5 space-y-3.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
            <span className="font-semibold text-[#121212] dark:text-[#F4F4F5] text-sm">
              {t.prayerTimesTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-[#0F5132] dark:text-[#C5A46D]">
              {lang === 'ar'
                ? prayerSchedule.nextPrayer.nameAr
                : prayerSchedule.nextPrayer.nameEn}{' '}
              {prayerSchedule.remainingFormatted}
            </span>
          </div>
        </div>

        <select
          aria-label={t.selectCityLabel}
          value={selectedCity.id}
          onChange={(e) => handleCityChange(e.target.value)}
          className="rounded-lg border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-2.5 py-1.5 text-xs font-medium text-[#121212] dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#0F5132] dark:focus:ring-[#C5A46D]"
        >
          {QIBLA_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'ar' ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Crisp 5-Column Horizontal Prayer Strip */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {prayerSchedule.entries.map((entry) => {
          const isNext = entry.id === prayerSchedule.nextPrayer.id;
          return (
            <div
              key={entry.id}
              className={`rounded-xl px-1.5 py-2.5 sm:p-3 flex flex-col items-center text-center gap-1 border transition-colors ${
                isNext
                  ? 'border-[#0F5132] bg-[#0F5132]/[0.05] dark:border-[#C5A46D] dark:bg-[#C5A46D]/[0.08]'
                  : 'border-[#E6E4DF]/75 dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B]'
              }`}
            >
              <span
                className={
                  isNext
                    ? 'text-[#0F5132] dark:text-[#C5A46D]'
                    : 'text-[#6B6A66] dark:text-[#8E8E93]'
                }
              >
                <PrayerTimeIconSvg id={entry.id} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#6B6A66] dark:text-[#8E8E93] truncate max-w-full">
                {lang === 'ar' ? entry.nameAr : entry.nameEn}
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold tabular-nums ${
                  isNext
                    ? 'text-[#0F5132] dark:text-[#C5A46D]'
                    : 'text-[#121212] dark:text-[#F4F4F5]'
                }`}
              >
                {entry.formatted24}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

const HomeViewInner: React.FC<HomeViewProps> = ({
  lang,
  t,
  surahs,
  lastRead,
  offlineRecords,
  riwayat,
  khatmaSchedule,
  readingStats,
  isInstalled,
  onChangeRiwayat,
  onOpenSurah,
  onOpenPage,
  onOpenSearch,
  onOpenAllSurahs,
  onOpenVault,
  onOpenKhatma,
  onOpenAdhkar,
  onOpenQibla,
  onOpenDownloadApk,
}) => {
  const effectiveStats = useMemo(
    () => getEffectiveReadingStats(readingStats),
    [readingStats]
  );
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
  const currentReadingPage = Math.max(1, Math.min(604, lastRead?.page || 1));
  const pageProgressPct = Math.max(2, Math.round((currentReadingPage / 604) * 100));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-5 sm:pt-8 pb-8 space-y-5">
      {/* 1. Minimalist Architectural "Continue Reading" Card */}
      <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C6D46] dark:text-[#C5A46D] tabular-nums">
              {t.lastReadLabel} · {riwayat === 'hafs' ? t.hafsLabel : t.warshLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#121212] dark:text-[#F4F4F5] truncate">
              {lang === 'ar'
                ? lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'
                : lastReadSurah?.nameEn || 'Al-Fatihah'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
              {lastRead
                ? lang === 'ar'
                  ? `سورة ${toArabicDigits(lastRead.surah)} · الآية ${toArabicDigits(lastRead.ayah)} · ${t.pageWord} ${toArabicDigits(lastRead.page)} من ٦٠٤`
                  : `Surah ${lastRead.surah} · Ayah ${lastRead.ayah} · Page ${lastRead.page} of 604`
                : lang === 'ar'
                  ? 'سورة ١ · الآية ١ · صفحة ١ من ٦٠٤'
                  : 'Surah 1 · Ayah 1 · Page 1 of 604'}
            </p>
          </div>

          {lang !== 'ar' && (
            <span
              dir="rtl"
              className="font-quran-scheherazade text-3xl sm:text-4xl text-[#0F5132] dark:text-[#C5A46D] shrink-0 leading-none"
            >
              {lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'}
            </span>
          )}
        </div>

        {/* Ultra-Fine 2px Page Progress Track + Quiet Reading Streak Line */}
        <div className="space-y-2">
          <div className="h-[2px] w-full rounded-full bg-[#E6E4DF] dark:bg-[#222226] overflow-hidden">
            <div
              className="h-full bg-[#0F5132] dark:bg-[#C5A46D] transition-all duration-300"
              style={{width: `${pageProgressPct}%`}}
            />
          </div>
          <div
            data-testid="home-reading-streak"
            className="flex items-center justify-between text-[11px] font-medium text-[#6B6A66] dark:text-[#8E8E93] tabular-nums"
          >
            <span>
              {t.readingStreakTitle}: {numFmt(effectiveStats.currentStreakDays)} {t.streakDaysUnit} ·{' '}
              {t.pagesTodayLabel}: {numFmt(effectiveStats.todayPagesRead)}
            </span>
            <span>{numFmt(pageProgressPct)}%</span>
          </div>
        </div>

        {/* Sleek Action Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => (lastRead ? onOpenPage(lastRead.page) : onOpenPage(1))}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3F27] dark:bg-[#C5A46D] dark:hover:bg-[#B8945A] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#09090B] transition-colors whitespace-nowrap"
          >
            <span>
              {lastRead
                ? `${t.resumePage} (${numFmt(lastRead.page)})`
                : t.openMushafPage1}
            </span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            data-testid="home-browse-surahs-btn"
            onClick={onOpenAllSurahs}
            className="min-h-[44px] rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-4 py-2.5 text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors whitespace-nowrap"
          >
            {t.browseAllSurahsBtn}
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t.searchBtn}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-3.5 py-2.5 text-sm font-medium text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            <span>{t.searchBtn}</span>
          </button>

          {!isInstalled && (
            <button
              type="button"
              data-testid="hero-apk-btn"
              onClick={onOpenDownloadApk}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-4 py-2.5 text-sm font-medium text-[#0F5132] dark:text-[#C5A46D] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors whitespace-nowrap"
            >
              <Download className="h-4 w-4" strokeWidth={1.5} />
              <span>{t.downloadApkBtn}</span>
            </button>
          )}
        </div>

        {/* Riwayah Switcher & Direct Page Jump */}
        <div className="pt-3.5 border-t border-[#E6E4DF] dark:border-[#222226] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#F9F8F6] dark:bg-[#09090B] p-1 border border-[#E6E4DF] dark:border-[#222226] self-start">
            <button
              type="button"
              onClick={() => onChangeRiwayat('hafs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                riwayat === 'hafs'
                  ? 'bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] shadow-xs border border-[#E6E4DF]/80 dark:border-[#222226]'
                  : 'text-[#6B6A66] dark:text-[#8E8E93]'
              }`}
            >
              {t.hafsLabel}
            </button>
            <button
              type="button"
              onClick={() => onChangeRiwayat('warsh')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                riwayat === 'warsh'
                  ? 'bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] shadow-xs border border-[#E6E4DF]/80 dark:border-[#222226]'
                  : 'text-[#6B6A66] dark:text-[#8E8E93]'
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
              className="w-28 sm:w-36 rounded-lg border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-3 py-1.5 text-xs sm:text-sm text-[#121212] dark:text-[#F4F4F5] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#0F5132] dark:focus:ring-[#C5A46D]"
            />
            <button
              type="submit"
              className="rounded-lg border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors"
            >
              {t.goBtn}
            </button>
          </form>
        </div>
      </section>

      {/* 2. Clean Horizontal 5-Column Prayer Strip */}
      <PrayerTimesSection lang={lang} t={t} />

      {/* 3. Refined 2-Column 6-Tile Monochrome Feature Grid */}
      <section
        aria-label={t.featuresShowcaseTitle}
        data-testid="home-features-showcase"
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6A66] dark:text-[#8E8E93]">
            {t.featuresShowcaseTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {(
            [
              {
                id: 'mushaf',
                Icon: BookOpen,
                title: t.navMushaf,
                meta: `${numFmt(604)} ${t.pageShort}`,
                onClick: () => onOpenPage(currentReadingPage),
              },
              {
                id: 'qibla',
                Icon: Compass,
                title: t.qiblaTitle,
                meta: lang === 'ar' ? 'اتجاه مكة' : lang === 'fr' ? 'Boussole' : 'Compass',
                onClick: onOpenQibla,
              },
              {
                id: 'daily',
                Icon: MoonStar,
                title: t.navAdhkar,
                meta: lang === 'ar' ? 'الأذكار والتسبيح' : 'Adhkar & Tasbih',
                onClick: onOpenAdhkar,
              },
              {
                id: 'khatma',
                Icon: CalendarCheck,
                title: t.navKhatma,
                meta: `${numFmt(khatmaSchedule.percentComplete)}%`,
                onClick: onOpenKhatma,
              },
              {
                id: 'search',
                Icon: Search,
                title: t.searchBtn,
                meta: lang === 'ar' ? '٦٢٣٦ آية' : '6,236 Ayahs',
                onClick: onOpenSearch,
              },
              {
                id: 'vault',
                Icon: HardDrive,
                title: t.navVault,
                meta: `${numFmt(offlineRecords.length)} ${t.surahsCached}`,
                onClick: onOpenVault,
              },
            ] as const
          ).map(({id, Icon, title, meta, onClick}) => (
            <button
              key={id}
              type="button"
              data-testid={`showcase-card-${id}`}
              onClick={onClick}
              className="min-h-[68px] text-start rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-3.5 sm:p-4 hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors flex items-center gap-3"
            >
              <span className="h-9 w-9 rounded-lg border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] text-[#0F5132] dark:text-[#C5A46D] flex items-center justify-center shrink-0">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] truncate">
                  {title}
                </div>
                <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] truncate tabular-nums">
                  {meta}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Quick Surahs Directory */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6A66] dark:text-[#8E8E93]">
            {lang === 'ar'
              ? 'سور مختارة'
              : lang === 'fr'
                ? 'Sourates choisies'
                : 'Quick Surahs'}
          </h2>
          <button
            type="button"
            onClick={onOpenAllSurahs}
            className="text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] hover:underline"
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
              className="text-start rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] px-4 py-3 hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-8 w-8 rounded-lg border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] flex items-center justify-center tabular-nums shrink-0">
                  {String(surah.id).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] truncate">
                    {lang === 'ar' ? surah.nameAr : surah.nameEn}
                  </div>
                  <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                    {numFmt(surah.totalAyahs)} {t.ayahsWord} · {t.pageShort} {numFmt(surah.startPage)}
                  </div>
                </div>
              </div>
              <span
                dir="rtl"
                className="font-quran-scheherazade text-lg text-[#8C6D46] dark:text-[#C5A46D] shrink-0"
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

export const HomeView = React.memo(HomeViewInner);
