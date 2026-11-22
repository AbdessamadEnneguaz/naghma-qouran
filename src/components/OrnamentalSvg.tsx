import React, {useId, useState} from 'react';
import {Play} from 'lucide-react';
import type {SurahMeta} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';

/**
 * Naghma Quran (نَغمة القرآن) 3D Brand Emblem SVG:
 * Beveled metallic gold 8-pointed Rub el Hizb + emerald acoustic heart
 */
export const NaghmaEmblemSvg: React.FC<{className?: string}> = ({
  className = 'h-7 w-7',
}) => {
  const uid = useId().replace(/:/g, '');
  const goldId = `n-gold-${uid}`;
  const emeraldId = `n-em-${uid}`;
  const bgId = `n-bg-${uid}`;

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bgId} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#163D30" />
          <stop offset="100%" stopColor="#080D0C" />
        </radialGradient>
        <linearGradient id={goldId} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="40%" stopColor="#E4BF56" />
          <stop offset="80%" stopColor="#B4891B" />
          <stop offset="100%" stopColor="#7C5608" />
        </linearGradient>
        <linearGradient id={emeraldId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="32"
        height="32"
        rx="4"
        fill={`url(#${bgId})`}
        stroke={`url(#${goldId})`}
        strokeWidth="2"
      />
      <rect
        x="8"
        y="8"
        width="32"
        height="32"
        rx="4"
        fill={`url(#${bgId})`}
        fillOpacity="0.88"
        stroke={`url(#${goldId})`}
        strokeWidth="2"
        transform="rotate(45 24 24)"
      />
      {/* Sculpted 3D harmonic wave bars */}
      <path
        d="M15.5 23V25M19.5 18V30M24 14V34M28.5 18V30M32.5 23V25"
        stroke={`url(#${goldId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24 16.5V31.5"
        stroke={`url(#${emeraldId})`}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="24" r="1.4" fill="#FCE7A2" />
      <circle cx="32.5" cy="24" r="1.4" fill="#FCE7A2" />
    </svg>
  );
};

/**
 * Tactile 3D App Icon (raster 3D render with resilient SVG fallback)
 */
export const NaghmaAppIconImg: React.FC<{
  className?: string;
  alt?: string;
}> = ({className = 'h-8 w-8 rounded-xl', alt = 'Naghma Quran'}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} bg-[#0B0E11] border border-[#D4AF37]/35 flex items-center justify-center p-1`}
      >
        <NaghmaEmblemSvg className="w-full h-full" />
      </div>
    );
  }

  return (
    <img
      src="/naghma-app-icon.png"
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-cover shadow-[0_6px_16px_rgba(0,0,0,0.42)] ring-1 ring-[#D4AF37]/35`}
    />
  );
};

/**
 * 8-Pointed 3D Islamic Star (Rub el Hizb ۞) badge for Surah numbers
 */
export const RubElHizbBadge: React.FC<{number: number; lang?: AppLang}> = ({
  number,
  lang = 'en',
}) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `rub-${uid}`;

  return (
    <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 h-full w-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.28)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE7A2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8C6410" />
          </linearGradient>
        </defs>
        <rect
          x="9"
          y="9"
          width="26"
          height="26"
          rx="3"
          fill="#D4AF37"
          fillOpacity="0.1"
          stroke={`url(#${gradId})`}
          strokeWidth="1.45"
        />
        <rect
          x="9"
          y="9"
          width="26"
          height="26"
          rx="3"
          fill="#10B981"
          fillOpacity="0.06"
          stroke={`url(#${gradId})`}
          strokeWidth="1.45"
          transform="rotate(45 22 22)"
        />
      </svg>
      <span className="relative z-10 text-xs font-bold text-[#B4891B] dark:text-[#FCE7A2] tabular-nums">
        {lang === 'ar' ? toArabicDigits(number) : number}
      </span>
    </div>
  );
};

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
 * Tactile 3D Layered Islamic SVG Icons for Home Bento Grid Tiles
 */
export const KhatmaBookSvg: React.FC<{className?: string}> = ({
  className = 'h-6 w-6',
}) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`kb-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M4.5 22.5V8C4.5 6.9 5.4 6 6.5 6H14V22.5H6.5C5.4 22.5 4.5 22.9 4.5 22.5Z"
        fill={`url(#kb-${uid})`}
        fillOpacity="0.22"
        stroke={`url(#kb-${uid})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 22.5V8C23.5 6.9 22.6 6 21.5 6H14V22.5H21.5C22.6 22.5 23.5 22.9 23.5 22.5Z"
        fill={`url(#kb-${uid})`}
        fillOpacity="0.34"
        stroke={`url(#kb-${uid})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 6V22.5" stroke="#FCE7A2" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 10.5H11M17 10.5H20M17 14.5H20" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const AdhkarCrescentSvg: React.FC<{className?: string}> = ({
  className = 'h-6 w-6',
}) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`ac-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A6E10" />
        </linearGradient>
      </defs>
      <path
        d="M18.2 5.2A8.8 8.8 0 1 0 23.2 19.4A7.3 7.3 0 0 1 18.2 5.2Z"
        fill={`url(#ac-${uid})`}
        fillOpacity="0.3"
        stroke={`url(#ac-${uid})`}
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 7.8L20 9.8L22.1 10.1L20.5 11.5L21 13.6L19.2 12.5L17.4 13.6L17.9 11.5L16.3 10.1L18.4 9.8L19.2 7.8Z"
        fill="#FCE7A2"
        stroke="#D4AF37"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const TalqeenWaveSvg: React.FC<{className?: string}> = ({
  className = 'h-6 w-6',
}) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`tw-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="12.5" y="4" width="3" height="20" rx="1.5" fill={`url(#tw-${uid})`} />
      <rect x="7.8" y="8" width="2.8" height="12" rx="1.4" fill="#D4AF37" fillOpacity="0.92" />
      <rect x="17.4" y="7" width="2.8" height="14" rx="1.4" fill="#D4AF37" fillOpacity="0.92" />
      <rect x="3.5" y="11" width="2.5" height="6" rx="1.25" fill={`url(#tw-${uid})`} fillOpacity="0.85" />
      <rect x="22" y="11" width="2.5" height="6" rx="1.25" fill={`url(#tw-${uid})`} fillOpacity="0.85" />
    </svg>
  );
};

export const HeartAyahSvg: React.FC<{className?: string}> = ({
  className = 'h-6 w-6',
}) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`ha-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A6E10" />
        </linearGradient>
      </defs>
      <path
        d="M14 23.6C14 23.6 5.2 18 5.2 11.5C5.2 8.3 7.7 5.8 10.7 5.8C12.4 5.8 13.5 6.8 14 7.7C14.5 6.8 15.6 5.8 17.3 5.8C20.3 5.8 22.8 8.3 22.8 11.5C22.8 18 14 23.6 14 23.6Z"
        fill={`url(#ha-${uid})`}
        fillOpacity="0.28"
        stroke={`url(#ha-${uid})`}
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M14 10.8L15.1 13L17.4 13.4L15.7 15L16.1 17.3L14 16.2L11.9 17.3L12.3 15L10.6 13.4L12.9 13L14 10.8Z"
        fill="#34D399"
        stroke="#A7F3D0"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
};
