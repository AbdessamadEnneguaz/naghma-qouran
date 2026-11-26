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
      className={`sticky top-0 z-30 pt-safe-top border-b border-[#E2EAE5] dark:border-[#1E2E26] bg-white/95 dark:bg-[#111C17]/95 shadow-[0_4px_20px_-8px_rgba(17,68,43,0.08)] transition-transform duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27784C] dark:focus-visible:ring-[#52B77F]"
          aria-label={t.appName}
        >
          <NaghmaAppIconImg alt={t.appName} className="h-8 w-8 rounded-xl shrink-0" />
          <span className="text-base font-bold tracking-tight text-[#142019] dark:text-[#F1F5F3]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-xl text-[#27784C] dark:text-[#52B77F]">
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
                  ? 'text-[#27784C] dark:text-[#52B77F] font-semibold'
                  : 'text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
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
              className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeRoute === 'download'
                  ? 'btn-3d-emerald text-white'
                  : 'surface-3d text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C]/35'
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
            className="h-8 px-2.5 rounded-xl text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] hover:bg-[#27784C]/[0.06] dark:hover:bg-white/[0.06] transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] hover:bg-[#27784C]/[0.06] dark:hover:bg-white/[0.06] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
