import React from 'react';
import {Moon, Sun} from 'lucide-react';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import type {AppRoute} from '../utils/routing';
import {NaghmaAppIconImg} from './OrnamentalSvg';

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
    {id: 'mushaf', label: t.navMushaf},
    {id: 'surahs', label: t.navSurahs},
    {id: 'qibla', label: t.navQibla},
    {id: 'adhkar', label: t.navAdhkar},
  ];

  return (
    <header
      className={`sticky top-0 z-30 pt-safe-top border-b border-amber-500/12 dark:border-amber-500/15 bg-[#FDFBF7]/92 dark:bg-[#17110D]/92 backdrop-blur-md transition-all duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
          aria-label={t.appName}
        >
          <NaghmaAppIconImg alt={t.appName} className="h-8 w-8 rounded-xl shrink-0" />
          <span className="text-base font-bold tracking-tight text-[#2D231E] dark:text-[#FAF5EE]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-xl text-[#B45309] dark:text-[#FBBF24]">
                نَجم القرآن
              </span>
            ) : (
              'Najm Quran'
            )}
          </span>
        </button>

        {/* Clean Desktop Text Navigation (5 concise links) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {desktopLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              aria-current={activeRoute === link.id ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeRoute === link.id
                  ? 'text-[#D97706] dark:text-[#FBBF24] font-semibold'
                  : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E] dark:hover:text-[#FAF5EE]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Minimal Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              data-testid="header-apk-btn"
              onClick={() => onNavigate('download')}
              aria-label={t.downloadApkBtn}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeRoute === 'download'
                  ? 'bg-[#D97706] text-white'
                  : 'bg-amber-500/14 text-[#B45309] dark:text-[#FBBF24] border border-amber-500/25 hover:bg-amber-500/22'
              }`}
            >
              APK
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'en' ? 'Switch interface to Arabic' : 'Switch interface to English'}
            className="h-8 px-2.5 rounded-full text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10 transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="h-8 w-8 flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
