import React, {useEffect, useMemo, useState} from 'react';
import {
  Bell,
  Bookmark,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronRight,
  Compass,
  Copy,
  Download,
  Headphones,
  MapPin,
  MoonStar,
  Search,
  Share2,
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
import {triggerHaptic} from '../utils/haptics';
import type {AppLang, Translations} from '../i18n/translations';
import {
  HeroMosqueWatermarkSvg,
  Quran3DStandSvg,
  SurahRosetteSvg,
} from './OrnamentalSvg';

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
  hasActiveNotifications?: boolean;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onOpenSurah: (surahId: number, ayah?: number) => void;
  onOpenPage: (page: number) => void;
  onOpenSearch: () => void;
  onOpenNotifications?: () => void;
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

const FREQUENT_READINGS = [
  {id: 36, rosetteAr: 'سورة يس', nameEn: 'Surah Yaseen', nameFr: 'Sourate Yâ-Sîn', nameAr: 'سورة يس'},
  {id: 55, rosetteAr: 'الرحمن', nameEn: 'Surah Rehman', nameFr: 'Sourate Ar-Rahmân', nameAr: 'سورة الرحمن'},
  {id: 56, rosetteAr: 'الواقعة', nameEn: "Surah Waqi'ah", nameFr: 'Sourate Al-Wâqi‘ah', nameAr: 'سورة الواقعة'},
  {id: 67, rosetteAr: 'الملك', nameEn: 'Surah Mulk', nameFr: 'Sourate Al-Mulk', nameAr: 'سورة الملك'},
] as const;

const DAILY_VERSES = [
  {
    surah: 2,
    ayah: 286,
    refEn: 'Al-Baqarah · 2:286',
    refAr: 'البقرة · ٢٨٦',
    ar: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ',
    en: 'Allah does not burden a soul beyond that it can bear.',
    fr: 'Allah n’impose à aucune âme une charge supérieure à sa capacité.',
  },
  {
    surah: 94,
    ayah: 6,
    refEn: 'Ash-Sharh · 94:6',
    refAr: 'الشرح · ٦',
    ar: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    en: 'For indeed, with hardship will be ease. Indeed, with hardship will be ease.',
    fr: 'À côté de la difficulté est, certes, une facilité.',
  },
  {
    surah: 13,
    ayah: 28,
    refEn: "Ar-Ra'd · 13:28",
    refAr: 'الرعد · ٢٨',
    ar: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    en: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    fr: 'N’est-ce point par l’évocation d’Allah que se tranquillisent les cœurs ?',
  },
  {
    surah: 2,
    ayah: 152,
    refEn: 'Al-Baqarah · 2:152',
    refAr: 'البقرة · ١٥٢',
    ar: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    en: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    fr: 'Souvenez-vous de Moi donc, Je Me souviendrai de vous. Remerciez-Moi.',
  },
  {
    surah: 39,
    ayah: 53,
    refEn: 'Az-Zumar · 39:53',
    refAr: 'الزمر · ٥٣',
    ar: 'لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا',
    en: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
    fr: 'Ne désespérez pas de la miséricorde d’Allah. Car Allah pardonne tous les péchés.',
  },
  {
    surah: 65,
    ayah: 3,
    refEn: 'At-Talaq · 65:3',
    refAr: 'الطلاق · ٣',
    ar: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ',
    en: 'And whoever relies upon Allah – then He is sufficient for him.',
    fr: 'Et quiconque place sa confiance en Allah, Il lui suffit.',
  },
] as const;

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

function formatHeroDate(d: Date, lang: AppLang): string {
  try {
    return new Intl.DateTimeFormat(
      lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-GB',
      {weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'}
    ).format(d);
  } catch {
    return d.toDateString();
  }
}

const HomeViewInner: React.FC<HomeViewProps> = ({
  lang,
  t,
  surahs,
  lastRead,
  bookmarks,
  offlineRecords,
  riwayat,
  khatmaSchedule,
  readingStats,
  isInstalled,
  hasActiveNotifications = false,
  onChangeRiwayat,
  onOpenSurah,
  onOpenPage,
  onOpenSearch,
  onOpenNotifications,
  onOpenAllSurahs,
  onOpenVault,
  onOpenKhatma,
  onOpenAdhkar,
  onOpenQibla,
  onOpenDownloadApk,
}) => {
  const [selectedCity, setSelectedCity] = useState<QiblaCity>(getStoredCity);
  const [now, setNow] = useState<Date>(() => new Date());
  const [pageJumpInput, setPageJumpInput] = useState('');
  const [copiedVerse, setCopiedVerse] = useState(false);

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

  const nextPrayerIdx = useMemo(() => {
    const idx = prayerSchedule.entries.findIndex(
      (e) => e.id === prayerSchedule.nextPrayer.id
    );
    return idx >= 0 ? idx : 0;
  }, [prayerSchedule]);

  const effectiveStats = useMemo(
    () => getEffectiveReadingStats(readingStats),
    [readingStats]
  );

  const lastReadSurah = useMemo(
    () => surahs.find((s) => s.id === (lastRead?.surah || 1)) || surahs[0],
    [surahs, lastRead]
  );

  const dailyVerse = useMemo(() => {
    const dayIdx = Math.floor(now.getTime() / 86_400_000) % DAILY_VERSES.length;
    return DAILY_VERSES[dayIdx];
  }, [now]);

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

  const handleCopyDailyVerse = async () => {
    const text = `${dailyVerse.ar}\n\n${
      lang === 'fr' ? dailyVerse.fr : dailyVerse.en
    } (${dailyVerse.refEn}) — Mihrab Noor`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(true);
      window.setTimeout(() => setCopiedVerse(false), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  const handleShareDailyVerse = async () => {
    const text = `${dailyVerse.ar}\n\n${
      lang === 'fr' ? dailyVerse.fr : dailyVerse.en
    } (${dailyVerse.refEn})`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({title: 'Mihrab Noor', text});
        return;
      } catch {
        // fallback to copy
      }
    }
    await handleCopyDailyVerse();
  };

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const currentReadingPage = Math.max(1, Math.min(604, lastRead?.page || 1));
  const pageProgressPct = Math.max(2, Math.round((currentReadingPage / 604) * 100));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-4 sm:pt-6 pb-8 space-y-6">
      {/* 1. Location & Quick Controls Bar (matching reference top location row + Riwayah/Jump) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin
              className="h-4 w-4 text-[#27784C] dark:text-[#52B77F] shrink-0"
              strokeWidth={2}
            />
            <select
              aria-label={t.selectCityLabel}
              value={selectedCity.id}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] pe-1 py-1 focus:outline-none cursor-pointer truncate max-w-[205px] sm:max-w-none"
            >
              {QIBLA_CITIES.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-white dark:bg-[#111C17] text-[#142019] dark:text-[#F1F5F3]"
                >
                  {lang === 'ar' ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenDownloadApk}
              className="sm:hidden inline-flex items-center gap-1 rounded-xl surface-3d px-2.5 py-1.5 text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{t.downloadApkBtn}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl surface-3d p-0.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onChangeRiwayat('hafs')}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                riwayat === 'hafs'
                  ? 'btn-3d-emerald text-white'
                  : 'text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
              }`}
            >
              {t.hafsLabel}
            </button>
            <button
              type="button"
              onClick={() => onChangeRiwayat('warsh')}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                riwayat === 'warsh'
                  ? 'btn-3d-emerald text-white'
                  : 'text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
              }`}
            >
              {t.warshLabel}
            </button>
          </div>

          <form onSubmit={handlePageJumpSubmit} className="hidden sm:flex items-center gap-1.5">
            <input
              id="page-jump-input"
              type="number"
              min={1}
              max={604}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              placeholder={t.jumpPlaceholder}
              aria-label={t.jumpToPageLabel}
              className="w-28 rounded-xl surface-3d px-3 py-1.5 text-xs text-[#142019] dark:text-[#F1F5F3] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#27784C]"
            />
            <button
              type="submit"
              className="rounded-xl surface-3d px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C]/35"
            >
              {t.goBtn}
            </button>
          </form>

          {!isInstalled && (
            <button
              type="button"
              data-testid="hero-apk-btn"
              onClick={onOpenDownloadApk}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl surface-3d px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C]/35 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{t.downloadApkBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Signature 3D Reflective Emerald Hero Prayer Timeline Card with Ambient LED Halo */}
      <section
        aria-label={t.prayerTimesTitle}
        data-testid="home-prayer-times"
        className="relative overflow-hidden rounded-[22px] sm:rounded-3xl emerald-3d-hero led-backdrop p-5 sm:p-7 text-white"
      >
        {/* Top-left 3D specular gloss reflection */}
        <div className="pointer-events-none absolute inset-0 gloss-sheen" />
        {/* Delicate translucent mosque dome & minaret silhouette */}
        <div className="pointer-events-none absolute -bottom-2 end-2 text-white/[0.11]">
          <HeroMosqueWatermarkSvg className="w-48 h-28 sm:w-64 sm:h-36" />
        </div>

        <div className="relative z-10 space-y-5">
          {/* Top Row: Next Prayer & Time | Bismillah Calligraphy | Date */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'ar'
                  ? prayerSchedule.nextPrayer.nameAr
                  : prayerSchedule.nextPrayer.nameEn}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 tabular-nums">
                <span className="font-semibold text-white">
                  {prayerSchedule.nextPrayer.formatted24}
                </span>
                <span aria-hidden="true">·</span>
                <span>{prayerSchedule.remainingFormatted}</span>
              </div>
            </div>

            <div
              dir="rtl"
              className="hidden sm:block font-quran-scheherazade text-2xl text-white/95 leading-none pt-1"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            <div className="text-end space-y-0.5">
              <div className="text-xs font-medium text-white/85 tabular-nums">
                {formatHeroDate(now, lang)}
              </div>
              <div
                data-testid="home-reading-streak"
                className="text-[11px] font-medium text-white/80 tabular-nums"
              >
                {t.readingStreakTitle}: {numFmt(effectiveStats.currentStreakDays)}{' '}
                {t.streakDaysUnit} · {t.pageShort} {numFmt(currentReadingPage)}/
                {numFmt(604)}
              </div>
            </div>
          </div>

          {/* 5-Prayer Connected Timeline Nodes */}
          <div className="relative pt-1 pb-1">
            {/* Horizontal connecting bar */}
            <div
              aria-hidden="true"
              className="absolute top-[11px] inset-x-[10%] h-[1.5px] bg-white/30"
            />
            <div className="relative grid grid-cols-5 gap-1">
              {prayerSchedule.entries.map((entry, idx) => {
                const isNext = entry.id === prayerSchedule.nextPrayer.id;
                const isReached = idx <= nextPrayerIdx;
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col items-center text-center gap-1.5"
                  >
                    <span
                      className={`relative z-10 h-3.5 w-3.5 rounded-full transition-all ${
                        isNext
                          ? 'bg-white ring-4 ring-white/30 shadow-[0_0_12px_rgba(255,255,255,0.95)]'
                          : isReached
                            ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.65)]'
                            : 'bg-[#1D5E3A] border-2 border-white/85'
                      }`}
                    />
                    <span className="text-[11px] sm:text-xs font-medium text-white/95 truncate max-w-full">
                      {lang === 'ar' ? entry.nameAr : entry.nameEn}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-white/75 tabular-nums">
                      {entry.formatted24}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Thin Page Progress + All Prayers Pill Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex-1 max-w-xs space-y-1">
              <div className="h-[3px] w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300"
                  style={{width: `${pageProgressPct}%`}}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenQibla}
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#1D633D] shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:bg-[#F4F7F5] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <span>{lang === 'ar' ? 'كل الصلوات والقبلة' : 'All Prayers'}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Features 2x2 Elevated 3D Bento Grid (Exact Layout Match) */}
      <section
        aria-label={t.featuresShowcaseTitle}
        data-testid="home-features-showcase"
        className="space-y-3.5"
      >
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-[3px] h-4 rounded-full bg-[#27784C] dark:bg-[#52B77F]"
            />
            <h2 className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3]">
              {t.featuresShowcaseTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {onOpenNotifications && (
              <button
                type="button"
                data-testid="home-notifications-pill"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenNotifications();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl led-icon-tile px-2.5 py-1 text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F] tactile-press"
              >
                <Bell className="h-3.5 w-3.5" strokeWidth={1.85} />
                <span>{lang === 'ar' ? 'الإشعارات' : lang === 'fr' ? 'Alertes' : 'Alerts'}</span>
                {hasActiveNotifications && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 led-dot-pulse" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenSearch();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:underline tactile-press"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{t.searchBtn}</span>
            </button>
          </div>
        </div>

        {/* Primary 2x2 Bento matching screenshot */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Featured 3D Emerald "Read Quran" Card with LED Backlight */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenPage(currentReadingPage);
            }}
            className="relative overflow-hidden rounded-2xl emerald-3d-hero led-backdrop p-3.5 sm:p-5 text-white text-start flex flex-col justify-between gap-2 min-h-[124px] hover:-translate-y-0.5 tactile-press"
          >
            <div className="pointer-events-none absolute inset-0 gloss-sheen" />
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <Quran3DStandSvg className="h-11 w-11 sm:h-16 sm:w-16 shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.28)]" />
              <div className="min-w-0 space-y-0.5">
                <div className="text-sm sm:text-base font-bold leading-tight">
                  {lang === 'ar'
                    ? 'قراءة القرآن'
                    : lang === 'fr'
                      ? 'Lire le Coran'
                      : 'Read Quran'}
                </div>
                <p className="text-[10.5px] sm:text-xs text-white/85 leading-snug">
                  {lang === 'ar'
                    ? 'مصدر الطمأنينة والسكينة'
                    : lang === 'fr'
                      ? 'Source de paix et sérénité'
                      : 'Strength & Serenity'}
                </p>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="relative z-10 self-end h-7 w-7 rounded-full bg-white text-[#27784C] shadow-sm flex items-center justify-center shrink-0"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} />
            </span>
          </button>

          {/* Card 2: "Last Read" 3D Porcelain Card */}
          <button
            type="button"
            data-testid="showcase-card-mushaf"
            onClick={() => {
              triggerHaptic('light');
              if (lastRead) onOpenPage(lastRead.page);
              else onOpenPage(1);
            }}
            className="rounded-2xl surface-3d surface-3d-interactive tactile-press p-4 sm:p-5 text-start flex flex-col justify-between gap-2 min-h-[124px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="h-10 w-10 rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <span className="text-[11px] font-medium text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                {t.pageShort} {numFmt(currentReadingPage)}
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate">
                  {t.lastReadLabel}
                </div>
                <div className="text-[11px] sm:text-xs text-[#5A6B62] dark:text-[#92A59B] truncate">
                  {lang === 'ar'
                    ? lastReadSurah?.nameAr || 'سُورَةُ ٱلْفَاتِحَةِ'
                    : lastReadSurah?.nameEn || 'Al-Fatihah'}
                </div>
              </div>
              <span
                aria-hidden="true"
                className="h-7 w-7 rounded-full border border-[#27784C]/25 dark:border-[#52B77F]/30 text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
              </span>
            </div>
          </button>

          {/* Card 3: "Learn Quran" / All Surahs & Audio 3D Card */}
          <button
            type="button"
            data-testid="home-browse-surahs-btn"
            onClick={() => {
              triggerHaptic('light');
              onOpenAllSurahs();
            }}
            className="rounded-2xl surface-3d surface-3d-interactive tactile-press p-4 sm:p-5 text-start flex flex-col justify-between gap-2 min-h-[118px]"
          >
            <span className="h-10 w-10 rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0">
              <Headphones className="h-5 w-5" strokeWidth={1.7} />
            </span>

            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate">
                  {lang === 'ar'
                    ? 'السور والتلاوة'
                    : lang === 'fr'
                      ? 'Sourates & Audio'
                      : 'Learn Quran'}
                </div>
                <div className="text-[11px] sm:text-xs text-[#5A6B62] dark:text-[#92A59B] truncate">
                  {lang === 'ar'
                    ? '١١٤ سورة · تلاوة وتفسير'
                    : 'Audio & Translation'}
                </div>
              </div>
              <span
                aria-hidden="true"
                className="h-7 w-7 rounded-full border border-[#27784C]/25 dark:border-[#52B77F]/30 text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
              </span>
            </div>
          </button>

          {/* Card 4: "Bookmarks & Offline Vault" 3D Card */}
          <button
            type="button"
            data-testid="showcase-card-vault"
            onClick={() => {
              triggerHaptic('light');
              onOpenVault();
            }}
            className="rounded-2xl surface-3d surface-3d-interactive tactile-press p-4 sm:p-5 text-start flex flex-col justify-between gap-2 min-h-[118px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="h-10 w-10 rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0">
                <Bookmark className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]">
                <span>{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" strokeWidth={2} />
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate">
                  {t.tabBookmarks}
                </div>
                <div className="text-[11px] sm:text-xs text-[#5A6B62] dark:text-[#92A59B] truncate tabular-nums">
                  {numFmt(bookmarks.length)} · {numFmt(offlineRecords.length)} {t.surahsCached}
                </div>
              </div>
              <span
                aria-hidden="true"
                className="h-7 w-7 rounded-full border border-[#27784C]/25 dark:border-[#52B77F]/30 text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
              </span>
            </div>
          </button>
        </div>

        {/* Compact Secondary Tools Strip (Qibla, Adhkar, Khatma, Search) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(
            [
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
            ] as const
          ).map(({id, Icon, title, meta, onClick}) => (
            <button
              key={id}
              type="button"
              data-testid={`showcase-card-${id}`}
              onClick={() => {
                triggerHaptic('light');
                onClick();
              }}
              className="rounded-xl surface-3d surface-3d-interactive tactile-press p-3 text-start flex items-center gap-2.5"
            >
              <span className="h-9 w-9 rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] truncate">
                  {title}
                </div>
                <div className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate tabular-nums">
                  {meta}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Frequent Readings Row (4 Iconic Emerald Shamseh Rosette Cards) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-[3px] h-4 rounded-full bg-[#27784C] dark:bg-[#52B77F]"
            />
            <h2 className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3]">
              {lang === 'ar'
                ? 'قراءات متكررة'
                : lang === 'fr'
                  ? 'Lectures fréquentes'
                  : 'Frequent Readings'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenAllSurahs}
            className="text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:underline"
          >
            {t.browseAllSurahsBtn}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FREQUENT_READINGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenSurah(item.id)}
              className="rounded-2xl surface-3d surface-3d-interactive py-4 px-3 flex flex-col items-center justify-center gap-2.5 text-center"
            >
              <SurahRosetteSvg
                arabicTitle={item.rosetteAr}
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] leading-tight">
                {lang === 'ar'
                  ? item.nameAr
                  : lang === 'fr'
                    ? item.nameFr
                    : item.nameEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Verse of the Day 3D Reflection Card */}
      <section
        aria-label={lang === 'ar' ? 'آية اليوم' : 'Verse of the Day'}
        className="rounded-2xl surface-3d p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void handleShareDailyVerse()}
            aria-label={lang === 'ar' ? 'مشاركة الآية' : 'Share verse'}
            className="h-9 w-9 rounded-xl hover:bg-[#27784C]/[0.08] dark:hover:bg-white/[0.06] text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] flex items-center justify-center transition-colors"
          >
            <Share2 className="h-4 w-4" strokeWidth={1.6} />
          </button>

          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="hidden sm:block h-px w-8 bg-gradient-to-r from-transparent to-[#27784C]/50"
            />
            <span className="text-xs sm:text-sm font-bold text-[#27784C] dark:text-[#52B77F]">
              {lang === 'ar'
                ? 'آية اليوم'
                : lang === 'fr'
                  ? 'Verset du jour'
                  : 'Verse of the Day'}
            </span>
            <span
              aria-hidden="true"
              className="hidden sm:block h-px w-8 bg-gradient-to-l from-transparent to-[#27784C]/50"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleCopyDailyVerse()}
            aria-label={lang === 'ar' ? 'نسخ الآية' : 'Copy verse'}
            className="h-9 w-9 rounded-xl hover:bg-[#27784C]/[0.08] dark:hover:bg-white/[0.06] text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] flex items-center justify-center transition-colors"
          >
            {copiedVerse ? (
              <Check className="h-4 w-4 text-[#27784C] dark:text-[#52B77F]" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>
        </div>

        <div className="text-center space-y-2.5 px-1 sm:px-6">
          <p
            dir="rtl"
            className="font-quran-amiri text-2xl sm:text-[28px] leading-[2.2] text-[#142019] dark:text-[#F1F5F3]"
          >
            {dailyVerse.ar}
          </p>
          <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] max-w-2xl mx-auto leading-relaxed">
            {lang === 'fr' ? dailyVerse.fr : dailyVerse.en}
          </p>
          <div>
            <button
              type="button"
              onClick={() => onOpenSurah(dailyVerse.surah, dailyVerse.ayah)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:underline"
            >
              <span>{lang === 'ar' ? dailyVerse.refAr : dailyVerse.refEn}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const HomeView = React.memo(HomeViewInner);
