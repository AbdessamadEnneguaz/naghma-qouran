import React from 'react';
import {Bell, Moon, Sun} from 'lucide-react';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import type {AppRoute} from '../utils/routing';
import {triggerHaptic} from '../utils/haptics';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface HeaderProps {
  activeRoute: AppRoute;
  lang: AppLang;
  t: Translations;
  theme: ThemeMode;
  hidden?: boolean;
  isInstalled?: boolean;
  hasActiveNotifications?: boolean;
  onNavigate: (route: AppRoute) => void;
  onOpenNotifications: () => void;
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
  hasActiveNotifications = false,
  onNavigate,
  onOpenNotifications,
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
      className={`sticky top-0 z-30 pt-safe-top border-b border-[#E2EAE5]/80 dark:border-[#1E2E26]/80 bg-white/85 dark:bg-[#0D1612]/88 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgba(17,68,43,0.12)] transition-transform duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-xl tactile-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27784C] dark:focus-visible:ring-[#52B77F]"
          aria-label={t.appName}
        >
          <span className="relative rounded-xl led-backdrop">
            <NaghmaAppIconImg alt={t.appName} className="h-8 w-8 rounded-xl shrink-0" />
          </span>
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
              onClick={() => {
                triggerHaptic('light');
                onNavigate(link.id);
              }}
              aria-current={activeRoute === link.id ? 'page' : undefined}
              className={`relative whitespace-nowrap shrink-0 py-1 tactile-press ${
                activeRoute === link.id
                  ? 'text-[#27784C] dark:text-[#52B77F] font-semibold'
                  : 'text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
              }`}
            >
              {link.label}
              {activeRoute === link.id && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-1 -bottom-0.5 h-[2px] rounded-full bg-[#27784C] dark:bg-[#52B77F] led-dot-pulse"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              data-testid="header-apk-btn"
              onClick={() => {
                triggerHaptic('light');
                onNavigate('download');
              }}
              aria-label={t.downloadApkBtn}
              className={`h-8.5 px-3 rounded-xl text-xs font-semibold tactile-press whitespace-nowrap shrink-0 ${
                activeRoute === 'download'
                  ? 'btn-3d-emerald text-white'
                  : 'led-icon-tile text-[#27784C] dark:text-[#52B77F]'
              }`}
            >
              APK
            </button>
          )}
          <button
            type="button"
            data-testid="header-notifications-btn"
            onClick={() => {
              triggerHaptic('light');
              onOpenNotifications();
            }}
            aria-label={lang === 'ar' ? 'إشعارات التطبيق' : 'App Notifications'}
            title={lang === 'ar' ? 'إشعارات التطبيق' : 'App Notifications'}
            className="relative h-8.5 w-8.5 flex items-center justify-center rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F]"
          >
            <Bell className="h-4 w-4" strokeWidth={1.8} />
            <span
              aria-hidden="true"
              className={`absolute top-1.5 end-1.5 h-2 w-2 rounded-full transition-opacity ${
                hasActiveNotifications
                  ? 'bg-emerald-500 led-dot-pulse opacity-100'
                  : 'bg-[#27784C]/40 dark:bg-[#52B77F]/50 opacity-75'
              }`}
            />
          </button>
          <button
            type="button"
            data-testid="header-lang-btn"
            onClick={() => {
              triggerHaptic('light');
              onToggleLang();
            }}
            aria-label={
              lang === 'en'
                ? 'Passer en français'
                : lang === 'fr'
                  ? 'التبديل إلى العربية'
                  : 'Switch interface to English'
            }
            className="h-8.5 px-2.5 rounded-xl surface-3d tactile-press text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleTheme();
            }}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
