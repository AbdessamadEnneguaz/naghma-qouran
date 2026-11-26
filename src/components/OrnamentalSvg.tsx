import React, {useState} from 'react';
import {Play} from 'lucide-react';
import type {SurahMeta} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import type {PrayerId} from '../utils/prayerTimes';

/**
 * Mihrab Noor (مِحْرَاب النُّور) 3D Emerald & Gold Architectural Mihrab Emblem SVG
 */
export const NaghmaEmblemSvg: React.FC<{className?: string}> = ({
  className = 'h-7 w-7',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="mihrabEmblemGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#33915E" />
        <stop offset="55%" stopColor="#26774B" />
        <stop offset="100%" stopColor="#165031" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#mihrabEmblemGrad)" />
    <rect
      x="1.5"
      y="1.5"
      width="61"
      height="61"
      rx="14.5"
      stroke="#FFFFFF"
      strokeOpacity="0.24"
      strokeWidth="1"
    />
    <path
      d="M19 47V30C19 21 32 13.5 32 13.5C32 13.5 45 21 45 30V47"
      stroke="#E6C687"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.5 47V31C23.5 24 32 18.2 32 18.2C32 18.2 40.5 24 40.5 31V47"
      stroke="#FFFFFF"
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
      stroke="#FFFFFF"
      strokeWidth="0.95"
    />
    <rect
      x="26.2"
      y="26.2"
      width="11.6"
      height="11.6"
      rx="1.4"
      stroke="#FFFFFF"
      strokeWidth="0.95"
      transform="rotate(45 32 32)"
    />
    <circle cx="32" cy="32" r="1.9" fill="#E6C687" />
    <path d="M15 47H49" stroke="#E6C687" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * Mihrab Noor App Icon Image with crisp 3D SVG fallback
 */
export const NaghmaAppIconImg: React.FC<{
  className?: string;
  alt?: string;
}> = ({className = 'h-8 w-8 rounded-xl', alt = 'Mihrab Noor'}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} emerald-3d-hero flex items-center justify-center overflow-hidden`}
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
      className={`${className} object-cover shadow-sm ring-1 ring-[#27784C]/20 dark:ring-white/15`}
    />
  );
};

export const NajmAppIconImg = NaghmaAppIconImg;

/**
 * 3D Illustrated Open Quran on Carved Wooden Rahle Stand (Read Quran Featured Card)
 */
export const Quran3DStandSvg: React.FC<{className?: string}> = ({
  className = 'h-16 w-16',
}) => (
  <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="rahleGroundShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#082817" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#082817" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="woodLight" x1="18" y1="42" x2="78" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C98A4B" />
        <stop offset="55%" stopColor="#9B5E26" />
        <stop offset="100%" stopColor="#6D3D14" />
      </linearGradient>
      <linearGradient id="woodDark" x1="20" y1="54" x2="76" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#864F1F" />
        <stop offset="100%" stopColor="#522B0C" />
      </linearGradient>
      <linearGradient id="pageLeft" x1="12" y1="22" x2="48" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFDF8" />
        <stop offset="70%" stopColor="#F5ECD7" />
        <stop offset="100%" stopColor="#DFD0B2" />
      </linearGradient>
      <linearGradient id="pageRight" x1="48" y1="22" x2="84" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E7D9BC" />
        <stop offset="30%" stopColor="#F7F0DF" />
        <stop offset="100%" stopColor="#FFFDF8" />
      </linearGradient>
      <linearGradient id="coverRim" x1="10" y1="44" x2="86" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1B4D31" />
        <stop offset="50%" stopColor="#2E7D51" />
        <stop offset="100%" stopColor="#153E27" />
      </linearGradient>
    </defs>

    {/* Ground Cast Shadow */}
    <ellipse cx="48" cy="83" rx="28" ry="6" fill="url(#rahleGroundShadow)" />

    {/* Wooden X-Frame Back Legs */}
    <path
      d="M22 80L48 53L74 80H65L48 62L31 80H22Z"
      fill="url(#woodDark)"
    />
    {/* Wooden X-Frame Front Carved Wings */}
    <path
      d="M15 47L48 61L81 47L75 79H67L48 63L29 79H21L15 47Z"
      fill="url(#woodLight)"
      stroke="#E6B27A"
      strokeOpacity="0.45"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    {/* Specular Edge Highlight on Rahle */}
    <path
      d="M16.5 47.5L48 60.8L79.5 47.5"
      stroke="#F5D3A8"
      strokeOpacity="0.6"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Quran Hardcover Base */}
    <path
      d="M11 45C22 50 37 52.5 48 56C59 52.5 74 50 85 45L83 48.5C72 54 58 56.5 48 59.5C38 56.5 24 54 13 48.5L11 45Z"
      fill="url(#coverRim)"
    />

    {/* Page Thickness Stack */}
    <path
      d="M12.5 43C23 47 36 48 48 53C60 48 73 47 83.5 43L84.5 45.5C73.5 50 60 51.5 48 56C36 51.5 22.5 50 11.5 45.5L12.5 43Z"
      fill="#D7C5A3"
    />

    {/* Left Curved Page */}
    <path
      d="M14 21C25 18 39 20.5 48 27V53C37 47.5 23 47 12.5 43L14 21Z"
      fill="url(#pageLeft)"
      stroke="#C5A46D"
      strokeOpacity="0.5"
      strokeWidth="0.7"
    />
    {/* Right Curved Page */}
    <path
      d="M82 21C71 18 57 20.5 48 27V53C59 47.5 73 47 83.5 43L82 21Z"
      fill="url(#pageRight)"
      stroke="#C5A46D"
      strokeOpacity="0.5"
      strokeWidth="0.7"
    />

    {/* Inner Page Gold Margin Frames & Script Lines */}
    <path
      d="M18 24.5C27 22.5 38 24 44.5 28.5V47.5C36.5 43.8 25.5 43.2 17 40.2L18 24.5Z"
      stroke="#27784C"
      strokeOpacity="0.35"
      strokeWidth="0.8"
    />
    <path
      d="M78 24.5C69 22.5 58 24 51.5 28.5V47.5C59.5 43.8 70.5 43.2 79 40.2L78 24.5Z"
      stroke="#27784C"
      strokeOpacity="0.35"
      strokeWidth="0.8"
    />
    <g stroke="#6A7C71" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round">
      <path d="M21 28.5C28 27.5 35 28.2 41 30.5" />
      <path d="M20.5 32.5C27.5 31.5 35 32.2 41 34.5" />
      <path d="M20 36.5C27.5 35.5 35 36.2 41 38.2" />
      <path d="M75 28.5C68 27.5 61 28.2 55 30.5" />
      <path d="M75.5 32.5C68.5 31.5 61 32.2 55 34.5" />
      <path d="M76 36.5C68.5 35.5 61 36.2 55 38.2" />
    </g>

    {/* Gold Spine Reflection & Crimson/Gold Ribbon Bookmark */}
    <path d="M48 27V53" stroke="#9E8254" strokeOpacity="0.45" strokeWidth="1.2" />
    <path d="M48 52L45.5 67L48 64.5L50.5 67L48 52Z" fill="#D9A441" />
  </svg>
);

/**
 * Delicate Translucent Mosque Dome Silhouette for the Hero Prayer Card Watermark
 */
export const HeroMosqueWatermarkSvg: React.FC<{className?: string}> = ({
  className = 'w-44 h-28',
}) => (
  <svg viewBox="0 0 220 120" fill="currentColor" className={className} aria-hidden="true">
    {/* Right Minaret */}
    <path d="M188 120V46h8v74h-8zm4-86c-3 8-5 12-5 12h10s-2-4-5-12z" />
    <rect x="186" y="64" width="12" height="3" rx="1" />
    <rect x="186" y="45" width="12" height="3" rx="1" />
    {/* Left Minaret */}
    <path d="M36 120V60h6v60h-6zm3-69c-2.5 6-4 9-4 9h8s-1.5-3-4-9z" />
    {/* Central Dome */}
    <path d="M72 120V82c0-21 16-36 36-42 20 6 36 21 36 42v38H72z" />
    {/* Finial */}
    <path d="M107 28h2v13h-2z" />
    <circle cx="108" cy="26" r="2.2" />
    {/* Side Domes & Base */}
    <path d="M46 120V94c0-11 10-20 22-23 12 3 20 12 20 23v26H46z" />
    <path d="M132 120V94c0-11 10-20 22-23 12 3 20 12 20 23v26h-42z" />
    <rect x="16" y="106" width="188" height="14" rx="2" />
  </svg>
);

/**
 * 16-Pointed Emerald Islamic Shamseh Rosette Framing Surah Arabic Calligraphy
 */
export const SurahRosetteSvg: React.FC<{
  arabicTitle: string;
  className?: string;
}> = ({arabicTitle, className = 'w-20 h-20'}) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="rosetteEmerald" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B9B67" />
        <stop offset="55%" stopColor="#27784C" />
        <stop offset="100%" stopColor="#1B5A38" />
      </linearGradient>
    </defs>

    {/* Rotated 8-point geometric star layers */}
    <g stroke="url(#rosetteEmerald)" strokeWidth="1.35">
      <rect x="20" y="20" width="60" height="60" rx="4" fill="#27784C" fillOpacity="0.06" />
      <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(22.5 50 50)" />
      <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(45 50 50)" />
      <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(67.5 50 50)" />
    </g>

    {/* Outer Scalloped Ring */}
    <circle
      cx="50"
      cy="50"
      r="33"
      fill="none"
      stroke="#27784C"
      strokeOpacity="0.28"
      strokeWidth="1"
    />

    {/* Inner Crisp Porcelain / Emerald Medallion */}
    <circle
      cx="50"
      cy="50"
      r="27"
      className="fill-white dark:fill-[#111C17]"
      stroke="url(#rosetteEmerald)"
      strokeWidth="1.6"
    />
    <circle
      cx="50"
      cy="50"
      r="23.5"
      fill="none"
      stroke="#27784C"
      strokeOpacity="0.35"
      strokeWidth="0.7"
    />

    <text
      x="50"
      y="51"
      textAnchor="middle"
      dominantBaseline="central"
      direction="rtl"
      className="fill-[#142019] dark:fill-[#F1F5F3]"
      style={{
        fontFamily: 'var(--font-quran-scheherazade)',
        fontSize: arabicTitle.length > 10 ? '13.5px' : '15.5px',
        fontWeight: 700,
      }}
    >
      {arabicTitle}
    </text>
  </svg>
);

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
 * 3D Reflective Surah Title Frame
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
      className="relative my-2 sm:my-3 rounded-2xl surface-3d px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 overflow-hidden"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPlaySurah();
        }}
        title={t.playSurah}
        aria-label={t.playSurah}
        className="h-9 w-9 rounded-full btn-3d-emerald text-white flex items-center justify-center shrink-0"
      >
        <Play className="h-3.5 w-3.5 ms-0.5 fill-current" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <h2
          dir="rtl"
          className="font-quran-scheherazade text-2xl sm:text-[28px] leading-snug font-bold text-[#142019] dark:text-[#F1F5F3] truncate"
        >
          {surah.nameAr}
        </h2>
      </div>

      <div
        aria-hidden="true"
        className="h-9 w-9 flex items-center justify-center shrink-0 text-[#27784C] dark:text-[#52B77F]"
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
          <circle cx="16" cy="16" r="2.2" fill="currentColor" fillOpacity="0.65" />
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
