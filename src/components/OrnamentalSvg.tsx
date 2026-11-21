import React from 'react';
import {Play} from 'lucide-react';
import type {SurahMeta} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';

/**
 * Naghma Quran (نَغمة القرآن) Brand Emblem:
 * Octagonal Islamic Rub el Hizb (۞) paired with harmonic acoustic sound-wave curves
 */
export const NaghmaEmblemSvg: React.FC<{className?: string}> = ({
  className = 'h-7 w-7',
}) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="9"
      y="9"
      width="30"
      height="30"
      rx="3.5"
      fill="#D4AF37"
      fillOpacity="0.08"
      stroke="#D4AF37"
      strokeWidth="1.75"
    />
    <rect
      x="9"
      y="9"
      width="30"
      height="30"
      rx="3.5"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="1.75"
      transform="rotate(45 24 24)"
    />
    {/* Subtle harmonic recitation sound-wave emblem */}
    <path
      d="M15.5 24V24M19.5 18.5V29.5M24 14.5V33.5M28.5 18.5V29.5M32.5 24V24"
      stroke="#D4AF37"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <path
      d="M24 17V31"
      stroke="#10B981"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="15.5" cy="24" r="1.2" fill="#D4AF37" />
    <circle cx="32.5" cy="24" r="1.2" fill="#D4AF37" />
  </svg>
);

/**
 * 8-Pointed Islamic Star (Rub el Hizb ۞) badge for Surah numbers
 */
export const RubElHizbBadge: React.FC<{number: number; lang?: AppLang}> = ({
  number,
  lang = 'en',
}) => (
  <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
    <svg
      viewBox="0 0 44 44"
      className="absolute inset-0 h-full w-full text-[#B4891B] dark:text-[#D4AF37]"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="9"
        width="26"
        height="26"
        rx="2"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="9"
        y="9"
        width="26"
        height="26"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        transform="rotate(45 22 22)"
      />
    </svg>
    <span className="relative z-10 text-xs font-bold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
      {lang === 'ar' ? toArabicDigits(number) : number}
    </span>
  </div>
);

/**
 * Corner Arabesque Filigree SVG for the Mushaf Page Double Border
 */
export const MushafCornerOrnament: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({position}) => {
  const rotateClass =
    position === 'top-left'
      ? ''
      : position === 'top-right'
        ? 'scale-x-[-1]'
        : position === 'bottom-left'
          ? 'scale-y-[-1]'
          : 'scale-[-1]';

  const posClass =
    position === 'top-left'
      ? 'top-1.5 left-1.5'
      : position === 'top-right'
        ? 'top-1.5 right-1.5'
        : position === 'bottom-left'
          ? 'bottom-1.5 left-1.5'
          : 'bottom-1.5 right-1.5';

  return (
    <svg
      viewBox="0 0 48 48"
      className={`pointer-events-none absolute ${posClass} ${rotateClass} h-6 w-6 sm:h-9 sm:w-9 text-[#B4891B]/65 dark:text-[#D4AF37]/60`}
      aria-hidden="true"
    >
      <path
        d="M2 2 L34 2 M2 2 L2 34"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 6 L24 6 C17 6 12 11 12 18 C12 11 6 17 6 24 Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <path
        d="M26 2 C22 8 18 10 12 10 M2 26 C8 22 10 18 10 12"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
      />
    </svg>
  );
};

/**
 * Ornate Surah Header Cartouche Banner (تاج السورة)
 */
export const SurahCartoucheBanner: React.FC<{
  surah: SurahMeta;
  lang: AppLang;
  t: Translations;
  onPlaySurah: () => void;
}> = ({surah, lang, t, onPlaySurah}) => {
  const revLabel = surah.revelationType === 'Meccan' ? t.meccan : t.medinan;
  const countLabel =
    lang === 'ar'
      ? `${toArabicDigits(surah.totalAyahs)} ${t.ayahsWord}`
      : `${surah.totalAyahs} ${t.versesWord}`;

  return (
    <div className="relative my-2.5 sm:my-3 rounded-2xl border border-[#B4891B]/35 dark:border-[#D4AF37]/30 bg-[#F4EEE1]/90 dark:bg-[#13181E]/90 px-3 sm:px-7 py-2.5 sm:py-3.5 overflow-hidden">
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#B4891B]/18 dark:border-[#D4AF37]/15" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 sm:px-4">
        <span className="text-[11px] sm:text-xs font-medium text-[#57534E] dark:text-[#9CA3AF] tabular-nums whitespace-nowrap order-2 sm:order-1">
          {revLabel} · {countLabel}
        </span>

        <h2
          dir="rtl"
          className="font-quran-scheherazade text-xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F4F1EA] whitespace-nowrap order-1 sm:order-2"
        >
          {surah.nameAr}
        </h2>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlaySurah();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#059669]/30 dark:border-[#10B981]/30 bg-[#059669]/10 dark:bg-[#10B981]/10 px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#059669] dark:text-[#10B981] hover:bg-[#059669]/20 dark:hover:bg-[#10B981]/20 transition-colors whitespace-nowrap shrink-0 order-3"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>{t.playSurah}</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Custom 1.5px Stroke Islamic SVG Icons for Home Bento Grid Tiles
 */
export const KhatmaBookSvg: React.FC<{className?: string}> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 19.5V6.5C4 5.4 4.9 4.5 6 4.5H12V19.5H6C4.9 19.5 4 19.9 4 19.5Z" />
    <path d="M20 19.5V6.5C20 5.4 19.1 4.5 18 4.5H12V19.5H18C19.1 19.5 20 19.9 20 19.5Z" />
    <path d="M12 4.5V19.5" />
    <path d="M7.5 9H9.5M14.5 9H16.5M14.5 12.5H16.5" />
  </svg>
);

export const AdhkarCrescentSvg: React.FC<{className?: string}> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15.5 4.2A7.5 7.5 0 1 0 19.8 16.5A6.2 6.2 0 0 1 15.5 4.2Z" />
    <path d="M16.5 6.5L17.2 8.2L19 8.5L17.6 9.7L18 11.5L16.5 10.5L15 11.5L15.4 9.7L14 8.5L15.8 8.2L16.5 6.5Z" />
  </svg>
);

export const TalqeenWaveSvg: React.FC<{className?: string}> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 4V20" />
    <path d="M8 8V16" />
    <path d="M16 7V17" />
    <path d="M4.5 10.5V13.5" />
    <path d="M19.5 10.5V13.5" />
  </svg>
);

export const HeartAyahSvg: React.FC<{className?: string}> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 20.2C12 20.2 4.5 15.4 4.5 9.8C4.5 7.1 6.6 5 9.2 5C10.7 5 11.6 5.8 12 6.6C12.4 5.8 13.3 5 14.8 5C17.4 5 19.5 7.1 19.5 9.8C19.5 15.4 12 20.2 12 20.2Z" />
    <path d="M12 9.5L13 11.4L14.9 11.7L13.5 13L13.8 14.9L12 14L10.2 14.9L10.5 13L9.1 11.7L11 11.4L12 9.5Z" />
  </svg>
);

