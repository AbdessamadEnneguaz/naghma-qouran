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
    {id: 'adhkar', label: t.navAdhkar},
    {id: 'khatma', label: t.navKhatma},
  ];

  return (
    <header
      className={`sticky top-0 z-30 pt-safe-top border-b border-[#B4891B]/12 dark:border-white/8 bg-[#FAF6EE]/95 dark:bg-[#0A0D10]/95 backdrop-blur-md transition-all duration-300 ${
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
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          aria-label={t.appName}
        >
          <NaghmaAppIconImg
            alt={t.appName}
            className="h-7 w-7 rounded-lg shrink-0"
          />
          <span className="text-base font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-xl text-[#B4891B] dark:text-[#D4AF37]">
                نَغمة القرآن
              </span>
            ) : (
              'Naghma Quran'
            )}
          </span>
        </button>

        {/* Clean Desktop Text Navigation */}
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
                  ? 'text-[#059669] dark:text-[#10B981] font-semibold'
                  : 'text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
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
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeRoute === 'download'
                  ? 'bg-[#D4AF37] text-[#0A0D10]'
                  : 'bg-[#D4AF37]/15 text-[#9A6E10] dark:text-[#FDE68A] hover:bg-[#D4AF37]/25'
              }`}
            >
              APK
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'en' ? 'Switch interface to Arabic' : 'Switch interface to English'}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-[#57534E] dark:text-[#D6D3C9] hover:bg-black/5 dark:hover:bg-white/8 transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
