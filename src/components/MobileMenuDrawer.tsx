import React from 'react';
import {
  CalendarCheck2,
  Globe,
  HardDrive,
  HeartHandshake,
  Moon,
  Smartphone,
  Sun,
  X,
} from 'lucide-react';
import type {AppRoute} from '../utils/routing';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import {NaghmaEmblemSvg} from './OrnamentalSvg';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  theme: ThemeMode;
  isInstalled: boolean;
  khatmaPercent: number;
  cachedSurahCount: number;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
  onOpenHeartGuide: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  lang,
  t,
  theme,
  isInstalled,
  khatmaPercent,
  cachedSurahCount,
  onClose,
  onNavigate,
  onOpenHeartGuide,
  onToggleTheme,
  onToggleLang,
}) => {
  if (!isOpen) return null;

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.mobileMenuTitle}
      data-testid="mobile-menu-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[84%] max-w-xs h-full border-s border-[#B4891B]/30 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#0E1318] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Ornamental Drawer Header */}
          <div className="p-5 border-b border-[#B4891B]/18 dark:border-white/10 islamic-lattice-bg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <NaghmaEmblemSvg className="h-7 w-7 shrink-0" />
              <div>
                <div className="font-bold text-sm text-[#1C1917] dark:text-[#F4F1EA]">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#B4891B] dark:text-[#D4AF37]">
                  {t.mobileMenuTitle}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-[#B4891B]/20 dark:border-white/12 text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Menu Destinations */}
          <div className="px-3.5 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('khatma');
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] px-3.5 py-3 text-start hover:border-[#10B981] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                <CalendarCheck2 className="h-4.5 w-4.5 text-[#10B981]" />
                <span>{t.bentoKhatmaTitle}</span>
              </span>
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] tabular-nums">
                {numFmt(khatmaPercent)}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHeartGuide();
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] px-3.5 py-3 text-start hover:border-[#D4AF37] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                <HeartHandshake className="h-4.5 w-4.5 text-[#B4891B] dark:text-[#D4AF37]" />
                <span>{t.bentoHeartTitle}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('vault');
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] px-3.5 py-3 text-start hover:border-[#10B981] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                <HardDrive className="h-4.5 w-4.5 text-[#059669] dark:text-[#10B981]" />
                <span>{t.navVault}</span>
              </span>
              <span className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
                {numFmt(cachedSurahCount)}
              </span>
            </button>

            {!isInstalled && (
              <button
                type="button"
                data-testid="drawer-apk-btn"
                onClick={() => {
                  onClose();
                  onNavigate('download');
                }}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#D4AF37]/45 bg-gradient-to-r from-[#D4AF37]/18 to-[#10B981]/12 px-3.5 py-3 text-start hover:border-[#D4AF37] transition-colors"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-[#B4891B] dark:text-[#FDE68A]">
                  <Smartphone className="h-4.5 w-4.5 shrink-0" />
                  <span>{t.downloadApkHeroCta}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Controls: Theme Toggle + Language Switch */}
        <div className="p-4 border-t border-[#B4891B]/16 dark:border-white/10 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#B4891B]/22 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] py-2.5 px-3 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#D4AF37]" />
            ) : (
              <Moon className="h-4 w-4 text-[#B4891B]" />
            )}
            <span>{theme === 'dark' ? (lang === 'ar' ? 'نهاري' : 'Light') : (lang === 'ar' ? 'ليلي' : 'Dark')}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#B4891B]/22 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] py-2.5 px-3 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
          >
            <Globe className="h-4 w-4 text-[#10B981]" />
            <span>{t.langToggleLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
