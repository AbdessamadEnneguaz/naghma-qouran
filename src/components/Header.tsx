import React from 'react';
import {Moon, Smartphone, Sun} from 'lucide-react';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import type {AppRoute} from '../utils/routing';
import {NaghmaEmblemSvg} from './OrnamentalSvg';

interface HeaderProps {
  activeRoute: AppRoute;
  lang: AppLang;
  t: Translations;
  theme: ThemeMode;
  hidden?: boolean;
  isInstalled?: boolean;
  onNavigate: (route: AppRoute) => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRoute,
  lang,
  t,
  theme,
  hidden = false,
  isInstalled = false,
  onNavigate,
  onToggleLang,
  onToggleTheme,
}) => {
  const desktopLinks: Array<{id: AppRoute; label: string}> = [
    {id: 'home', label: t.navHome},
    {id: 'surahs', label: t.navSurahs},
    {id: 'mushaf', label: t.navMushaf},
    {id: 'adhkar', label: t.navAdhkar},
    {id: 'khatma', label: t.navKhatma},
  ];

  return (
    <header
      className={`sticky top-0 z-30 h-[52px] md:h-15 border-b border-[#B4891B]/16 dark:border-white/8 bg-[#FAF6EE]/94 dark:bg-[#0B0E11]/94 backdrop-blur-md transition-all duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 md:gap-8 px-3.5 sm:px-6">
        {/* Zone 1: Naghma Quran Brand Mark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg px-1 py-1"
          aria-label={t.appName}
        >
          <NaghmaEmblemSvg className="h-6 w-6 md:h-7 md:w-7 shrink-0" />
          <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-xl text-[#B4891B] dark:text-[#D4AF37]">
                نَغمة القرآن
              </span>
            ) : (
              <>
                Naghma Quran{' '}
                <span className="hidden lg:inline font-quran-scheherazade font-normal text-[#B4891B] dark:text-[#D4AF37]">
                  نَغمة
                </span>
              </>
            )}
          </span>
        </button>

        {/* Zone 2: Clean 5-link Desktop Navigation (Mobile uses Floating Glass Bottom Dock + Drawer) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-semibold"
        >
          {desktopLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              aria-current={activeRoute === link.id ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
                activeRoute === link.id
                  ? 'border-[#10B981] text-[#1C1917] dark:text-[#F4F1EA]'
                  : 'border-transparent text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Prominent Golden Download APK (Browser only) + Lang + Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              data-testid="header-apk-btn"
              onClick={() => onNavigate('download')}
              aria-label={t.downloadApkBtn}
              title={t.downloadApkBtn}
              className={`min-h-[34px] px-2.5 sm:px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                activeRoute === 'download'
                  ? 'bg-[#D4AF37] text-[#0B0E11] shadow-sm'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#B4891B] text-[#0B0E11] hover:opacity-92 shadow-sm shadow-[#D4AF37]/15'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 shrink-0" />
              <span>{t.downloadApkBtn}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'en' ? 'Switch interface to Arabic' : 'Switch interface to English'}
            className="min-h-[34px] px-2.5 rounded-xl border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0]/70 dark:bg-[#13181E] text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37] transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl text-[#57534E] dark:text-[#9CA3AF] hover:bg-[#EAE3D5] dark:hover:bg-[#13181E] hover:text-[#1C1917] dark:hover:text-[#F4F1EA] transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
