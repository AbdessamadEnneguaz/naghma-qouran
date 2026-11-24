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
      className={`sticky top-0 z-30 pt-safe-top border-b border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] transition-transform duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-[#C5A46D]"
          aria-label={t.appName}
        >
          <NaghmaAppIconImg alt={t.appName} className="h-8 w-8 rounded-lg shrink-0" />
          <span className="text-base font-semibold tracking-tight text-[#121212] dark:text-[#F4F4F5]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-xl text-[#0F5132] dark:text-[#C5A46D]">
                مِحْرَاب النُّور
              </span>
            ) : (
              'Mihrab Noor'
            )}
          </span>
        </button>

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
                  ? 'text-[#0F5132] dark:text-[#C5A46D] font-semibold'
                  : 'text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              data-testid="header-apk-btn"
              onClick={() => onNavigate('download')}
              aria-label={t.downloadApkBtn}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                activeRoute === 'download'
                  ? 'bg-[#0F5132] dark:bg-[#C5A46D] border-transparent text-white dark:text-[#09090B]'
                  : 'bg-white dark:bg-[#121215] border-[#E6E4DF] dark:border-[#222226] text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D]'
              }`}
            >
              APK
            </button>
          )}
          <button
            type="button"
            data-testid="header-lang-btn"
            onClick={onToggleLang}
            aria-label={
              lang === 'en'
                ? 'Passer en français'
                : lang === 'fr'
                  ? 'التبديل إلى العربية'
                  : 'Switch interface to English'
            }
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
