import React, {useState} from 'react';
import {Play} from 'lucide-react';
import type {SurahMeta} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import type {PrayerId} from '../utils/prayerTimes';

/**
 * Mihrab Noor (مِحْرَاب النُّور) Crisp Architectural Mihrab Emblem SVG
 */
export const NaghmaEmblemSvg: React.FC<{className?: string}> = ({
  className = 'h-7 w-7',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#0F5132" />
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="14"
      stroke="#C5A46D"
      strokeOpacity="0.28"
      strokeWidth="1"
    />
    <path
      d="M19 47V30C19 21 32 13.5 32 13.5C32 13.5 45 21 45 30V47"
      stroke="#C5A46D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.5 47V31C23.5 24 32 18.2 32 18.2C32 18.2 40.5 24 40.5 31V47"
      stroke="#C5A46D"
      strokeOpacity="0.45"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="26.2"
      y="26.2"
      width="11.6"
      height="11.6"
      rx="1.4"
      stroke="#F9F8F6"
      strokeWidth="0.95"
    />
    <rect
      x="26.2"
      y="26.2"
      width="11.6"
      height="11.6"
      rx="1.4"
      stroke="#F9F8F6"
      strokeWidth="0.95"
      transform="rotate(45 32 32)"
    />
    <circle cx="32" cy="32" r="1.8" fill="#C5A46D" />
    <path d="M15 47H49" stroke="#C5A46D" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * Mihrab Noor App Icon Image with crisp architectural SVG fallback
 */
export const NaghmaAppIconImg: React.FC<{
  className?: string;
  alt?: string;
}> = ({className = 'h-8 w-8 rounded-xl', alt = 'Mihrab Noor'}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} bg-[#0F5132] border border-[#C5A46D]/30 flex items-center justify-center overflow-hidden`}
      >
        <NaghmaEmblemSvg className="w-full h-full" />
      </div>
    );
  }

  return (
    <img
      src="/najm-app-icon.png"
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-cover ring-1 ring-black/10 dark:ring-white/10`}
    />
  );
};

export const NajmAppIconImg = NaghmaAppIconImg;

/**
 * Monochrome Thin-Stroke (1.5px) Astronomical Line Icons for Prayer Times
 */
export const PrayerTimeIconSvg: React.FC<{id: PrayerId; className?: string}> = ({
  id,
  className = 'h-4 w-4',
}) => {
  switch (id) {
    case 'fajr':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M5 17a7 7 0 0 1 14 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M3 19.5h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M12 4.5v2.5M7 7.5l1.5 1.5M17 7.5L15.5 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'dhuhr':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'asr':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="15" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 18.5h9.5a3 3 0 0 0 .3-5.98A4.2 4.2 0 0 0 8.5 11.8a3.4 3.4 0 0 0-1.5 6.7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'maghrib':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 17a5 5 0 0 1 5-5 5 5 0 0 1-5 5Z"
            fill="none"
          />
          <path
            d="M6.5 16.5a5.5 5.5 0 0 1 11 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M3 19h18M12 5.5v3M9.5 8l2.5 2 2.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'isha':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M15.5 6.2A6.5 6.5 0 1 0 19.8 16.5A5.3 5.3 0 0 1 15.5 6.2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M18.5 6.5v2M17.5 7.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Monochrome 1.5px Architectural Kaaba Indicator for Qibla Compass
 */
export const KaabaIconSvg: React.FC<{className?: string}> = ({className = 'h-4 w-4'}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M5 9.5h14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 19v-4.5h3V19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Architectural Editorial Hairline Surah Title Frame
 */
export const SurahCartoucheBanner: React.FC<{
  surah: SurahMeta;
  lang: AppLang;
  t: Translations;
  onPlaySurah: () => void;
}> = ({surah, lang, t, onPlaySurah}) => {
  return (
    <div
      data-testid={`surah-banner-${surah.id}`}
      className="relative my-2 sm:my-3 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F4F2ED]/70 dark:bg-[#16161A] px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPlaySurah();
        }}
        title={t.playSurah}
        aria-label={t.playSurah}
        className="h-8 w-8 rounded-full border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] hover:bg-[#0F5132] hover:text-white dark:hover:bg-[#C5A46D] dark:hover:text-[#09090B] flex items-center justify-center shrink-0 transition-colors"
      >
        <Play className="h-3.5 w-3.5 ms-0.5" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <h2
          dir="rtl"
          className="font-quran-scheherazade text-2xl sm:text-[28px] leading-snug font-bold text-[#121212] dark:text-[#F4F4F5] truncate"
        >
          {surah.nameAr}
        </h2>
      </div>

      <div
        aria-hidden="true"
        className="h-8 w-8 flex items-center justify-center shrink-0 text-[#8C6D46] dark:text-[#C5A46D]"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
          <rect
            x="7"
            y="7"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <rect
            x="7"
            y="7"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.25"
            transform="rotate(45 16 16)"
          />
          <circle cx="16" cy="16" r="2.2" fill="currentColor" fillOpacity="0.6" />
        </svg>
      </div>

      <span className="sr-only">
        {lang === 'ar'
          ? `${surah.nameAr} · ${toArabicDigits(surah.totalAyahs)} ${t.ayahsWord}`
          : `${surah.nameEn} · ${surah.totalAyahs} ${t.versesWord}`}
      </span>
    </div>
  );
};
