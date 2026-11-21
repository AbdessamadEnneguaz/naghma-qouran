import React from 'react';
import {Moon, Smartphone, Sun} from 'lucide-react';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {NaghmaEmblemSvg} from './OrnamentalSvg';

export type ActiveTab = 'home' | 'reader' | 'vault';

interface HeaderProps {
  activeTab: ActiveTab;
  lang: AppLang;
  t: Translations;
  theme: ThemeMode;
  hidden?: boolean;
  isInstalled?: boolean;
  onNavigate: (tab: ActiveTab) => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  lang,
  t,
  theme,
  hidden = false,
  isInstalled = false,
  onNavigate,
  onToggleLang,
  onToggleTheme,
  onOpenInstall,
}) => {
  const tabs: Array<{id: ActiveTab; label: string}> = [
    {id: 'home', label: t.navSurahs},
    {id: 'reader', label: t.navMushaf},
    {id: 'vault', label: t.navVault},
  ];

  return (
    <header
      className={`sticky top-0 z-30 h-[52px] md:h-15 border-b border-[#B4891B]/16 dark:border-white/8 bg-[#FAF6EE]/94 dark:bg-[#0B0E11]/94 backdrop-blur-md transition-all duration-300 ${
        hidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 md:gap-6 px-3 sm:px-6">
        {/* Zone 1: Naghma Quran Brand Mark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg px-1 py-1"
          aria-label={t.appName}
        >
          <NaghmaEmblemSvg className="h-6 w-6 md:h-7 md:w-7 shrink-0" />
          <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA]">
            {lang === 'ar' ? (
              <span className="font-quran-scheherazade text-lg sm:text-xl text-[#B4891B] dark:text-[#D4AF37]">
                نَغمة<span className="hidden sm:inline"> القرآن</span>
              </span>
            ) : (
              <>
                Naghma<span className="hidden sm:inline"> Quran</span>{' '}
                <span className="hidden md:inline font-quran-scheherazade font-normal text-[#B4891B] dark:text-[#D4AF37]">
                  نَغمة
                </span>
              </>
            )}
          </span>
        </button>

        {/* Zone 2: Clean 3-tab navigation (Surahs, Mushaf, Vault) */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-2.5 sm:gap-6 md:gap-7 text-xs sm:text-sm font-semibold"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#10B981] text-[#1C1917] dark:text-[#F4F1EA]'
                  : 'border-transparent text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Download APK (Browser only) + Language Toggle + Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isInstalled && onOpenInstall && (
            <button
              type="button"
              data-testid="header-apk-btn"
              onClick={onOpenInstall}
              aria-label={t.downloadApkBtn}
              title={t.downloadApkBtn}
              className="min-h-[32px] px-2 sm:px-2.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 text-[#059669] dark:text-[#34D399] hover:bg-[#10B981]/18 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{t.downloadApkBtn}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'en' ? 'Switch interface to Arabic' : 'Switch interface to English'}
            className="min-h-[32px] px-2 sm:px-2.5 rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0]/70 dark:bg-[#13181E] text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37] transition-colors whitespace-nowrap shrink-0"
          >
            {t.langToggleLabel}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CA3AF] hover:bg-[#EAE3D5] dark:hover:bg-[#13181E] hover:text-[#1C1917] dark:hover:text-[#F4F1EA] transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
