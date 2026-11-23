import React, {useId, useState} from 'react';
import {Play} from 'lucide-react';
import type {SurahMeta} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import type {PrayerId} from '../utils/prayerTimes';

/**
 * Najm Quran (نَجم القرآن) Warm Honey-Gold 8-Pointed Star Emblem SVG
 */
export const NaghmaEmblemSvg: React.FC<{className?: string}> = ({
  className = 'h-7 w-7',
}) => {
  const uid = useId().replace(/:/g, '');
  const goldId = `nj-gold-${uid}`;
  const bgId = `nj-bg-${uid}`;

  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDFBF7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id={goldId} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${bgId})`} />
      <rect x="12" y="12" width="24" height="24" rx="3" stroke={`url(#${goldId})`} strokeWidth="2.4" />
      <rect
        x="12"
        y="12"
        width="24"
        height="24"
        rx="3"
        stroke={`url(#${goldId})`}
        strokeWidth="2.4"
        transform="rotate(45 24 24)"
      />
      <path d="M27 16.8A7.5 7.5 0 1 0 31.2 29.5A6.2 6.2 0 0 1 27 16.8Z" fill={`url(#${goldId})`} />
    </svg>
  );
};

/**
 * Najm Quran App Icon Image with crisp SVG fallback
 */
export const NaghmaAppIconImg: React.FC<{
  className?: string;
  alt?: string;
}> = ({className = 'h-8 w-8 rounded-xl', alt = 'Najm Quran'}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} bg-[#FDFBF7] border border-amber-500/25 flex items-center justify-center p-0.5`}
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
      className={`${className} object-cover shadow-sm ring-1 ring-amber-500/25`}
    />
  );
};

export const NajmAppIconImg = NaghmaAppIconImg;

/**
 * Soft Minimalist Golden Mosque & Crescent Skyline Silhouette for Hero & Last Read Card
 */
export const MosqueSkylineSvg: React.FC<{className?: string}> = ({className = ''}) => (
  <svg
    viewBox="0 0 360 120"
    fill="none"
    preserveAspectRatio="xMaxYMax slice"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    {/* Subtle Sun / Halo */}
    <circle cx="245" cy="48" r="38" fill="#FDE68A" fillOpacity="0.4" />
    {/* Outer Minarets & Side Domes */}
    <path
      d="M150 120V68L155 52L160 68V120H150Z M326 120V66L331 50L336 66V120H326Z"
      fill="#FFFFFF"
      fillOpacity="0.42"
    />
    {/* Central Grand Dome + Skyline */}
    <path
      d="M168 120V82C168 68 182 58 192 58C202 58 214 68 214 82V120H168Z M214 120V70C214 48 232 34 245 28C258 34 276 48 276 70V120H214Z M276 120V82C276 68 288 58 298 58C308 58 320 68 320 82V120H276Z"
      fill="#FFFFFF"
      fillOpacity="0.52"
    />
    {/* Tall Main Minaret */}
    <path
      d="M286 120V42L291 22L296 42V120H286Z M192 120V46L196.5 28L201 46V120H192Z"
      fill="#FFFFFF"
      fillOpacity="0.48"
    />
    {/* Crescent over Main Dome */}
    <path
      d="M247.5 14.5A6.5 6.5 0 1 0 252.2 25.5A5.3 5.3 0 0 1 247.5 14.5Z"
      fill="#FFFFFF"
      fillOpacity="0.85"
    />
  </svg>
);

/**
 * Custom Warm Desert Illustrated Icons for Prayer Times (Fajr, Dhuhr, Asr, Maghrib, Isha)
 */
export const PrayerTimeIconSvg: React.FC<{id: PrayerId; className?: string}> = ({
  id,
  className = 'h-7 w-7',
}) => {
  switch (id) {
    case 'fajr':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M8 22a8 8 0 0 1 16 0" fill="#FB923C" fillOpacity="0.35" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5 24h22" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 7v4M9.5 11.5l2 2M22.5 11.5l-2 2" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'dhuhr':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="5.5" fill="#FBBF24" fillOpacity="0.4" stroke="#D97706" strokeWidth="1.8" />
          <path
            d="M16 5v3M16 24v3M5 16h3M24 16h3M8.2 8.2l2.1 2.1M21.7 21.7l2.1 2.1M23.8 8.2l-2.1 2.1M10.3 21.7l-2.1 2.1"
            stroke="#EA580C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'asr':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="19" cy="13" r="5" fill="#FB923C" fillOpacity="0.45" stroke="#EA580C" strokeWidth="1.7" />
          <path
            d="M10 24h12a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 12 14.5a4.5 4.5 0 0 0-2 9.5Z"
            fill="#FDE68A"
            stroke="#B45309"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'maghrib':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M19.5 8.5A7.5 7.5 0 1 0 24.5 21.2A6.2 6.2 0 0 1 19.5 8.5Z"
            fill="#F97316"
            fillOpacity="0.35"
            stroke="#EA580C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="11" r="1.4" fill="#F59E0B" />
        </svg>
      );
    case 'isha':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M18.5 7.5A8 8 0 1 0 25 20.5A6.5 6.5 0 0 1 18.5 7.5Z"
            fill="#D97706"
            fillOpacity="0.3"
            stroke="#B45309"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M22.5 9.5v3M21 11h3" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Tiny Minimalist Kaaba Badge for Qibla Compass Top Anchor
 */
export const KaabaIconSvg: React.FC<{className?: string}> = ({className = 'h-5 w-5'}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="2" fill="#2D231E" />
    <rect x="4" y="8.5" width="16" height="2.4" fill="#F59E0B" />
    <rect x="10.5" y="13.5" width="3" height="6.5" rx="0.6" fill="#D97706" />
  </svg>
);

/**
 * Authentic Ornamental Rectangular Madani Surah Title Banner
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
      className="relative my-2 sm:my-3 rounded-xl border border-amber-700/30 dark:border-amber-400/30 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.13] to-amber-500/[0.06] ring-1 ring-inset ring-amber-600/20 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2"
    >
      {/* Left End Ornamental Rosette + Subtle Play Surah Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPlaySurah();
        }}
        title={t.playSurah}
        aria-label={t.playSurah}
        className="h-8 w-8 rounded-full border border-amber-700/30 dark:border-amber-400/35 bg-white/80 dark:bg-[#2A201A]/90 text-[#B45309] dark:text-[#FBBF24] hover:bg-[#D97706] hover:text-white flex items-center justify-center shrink-0 transition-colors"
      >
        <Play className="h-3.5 w-3.5 fill-current ms-0.5" />
      </button>

      {/* Center Classic Uthmani Surah Title */}
      <div className="min-w-0 flex-1 text-center">
        <h2
          dir="rtl"
          className="font-quran-scheherazade text-2xl sm:text-[28px] leading-snug font-bold text-[#2D231E] dark:text-[#FAF5EE] truncate"
        >
          {surah.nameAr}
        </h2>
      </div>

      {/* Right End Matching Islamic 8-Pointed Flourish */}
      <div
        aria-hidden="true"
        className="h-8 w-8 flex items-center justify-center shrink-0 text-[#B45309]/70 dark:text-[#FBBF24]/70"
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          <rect
            x="7"
            y="7"
            width="18"
            height="18"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect
            x="7"
            y="7"
            width="18"
            height="18"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.4"
            transform="rotate(45 16 16)"
          />
          <circle cx="16" cy="16" r="3" fill="currentColor" fillOpacity="0.35" />
        </svg>
      </div>

      {/* Subtle bilingual count caption when hovered/assisted */}
      <span className="sr-only">
        {lang === 'ar'
          ? `${surah.nameAr} · ${toArabicDigits(surah.totalAyahs)} ${t.ayahsWord}`
          : `${surah.nameEn} · ${surah.totalAyahs} ${t.versesWord}`}
      </span>
    </div>
  );
};

export const AdhkarCrescentSvg: React.FC<{className?: string}> = ({
  className = 'h-6 w-6',
}) => (
  <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
    <path
      d="M18.2 5.2A8.8 8.8 0 1 0 23.2 19.4A7.3 7.3 0 0 1 18.2 5.2Z"
      fill="#F59E0B"
      fillOpacity="0.28"
      stroke="#D97706"
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
    <path
      d="M19.2 7.8L20 9.8L22.1 10.1L20.5 11.5L21 13.6L19.2 12.5L17.4 13.6L17.9 11.5L16.3 10.1L18.4 9.8L19.2 7.8Z"
      fill="#F59E0B"
    />
  </svg>
);
