import React from 'react';
import {RefreshCw, X} from 'lucide-react';
import type {AppRoute} from '../utils/routing';
import type {ThemeMode} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import type {UpdateCheckStatus} from '../hooks/useAppUpdater';
import {toArabicDigits} from '../utils/quranLogic';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  theme: ThemeMode;
  isInstalled: boolean;
  khatmaPercent: number;
  cachedSurahCount: number;
  currentVersion: string;
  updateAvailable: boolean;
  updateStatus: UpdateCheckStatus;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
  onOpenHeartGuide: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onCheckUpdates: () => void;
  onApplyUpdate: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  lang,
  t,
  theme,
  isInstalled,
  khatmaPercent,
  cachedSurahCount,
  currentVersion,
  updateAvailable,
  updateStatus,
  onClose,
  onNavigate,
  onOpenHeartGuide,
  onToggleTheme,
  onToggleLang,
  onCheckUpdates,
  onApplyUpdate,
}) => {
  if (!isOpen) return null;

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.mobileMenuTitle}
      data-testid="mobile-menu-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[82%] max-w-xs h-full pt-safe-top pb-safe-bottom border-s border-amber-500/20 bg-[#FDFBF7] dark:bg-[#1B1410] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Minimal Drawer Header */}
          <div className="p-5 border-b border-amber-500/12 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <NaghmaAppIconImg alt={t.appName} className="h-9 w-9 rounded-xl shrink-0" />
              <div>
                <div className="font-bold text-sm text-[#2D231E] dark:text-[#FAF5EE]">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                  v{currentVersion}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Clean Text-First Destinations */}
          <div className="px-3.5 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('surahs');
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.navSurahs}</span>
              <span className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('qibla');
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.qiblaTitle}</span>
              <span className="text-xs text-[#D97706] dark:text-[#FBBF24]">›</span>
            </button>

            <button
              type="button"
              data-testid="drawer-adhkar-btn"
              onClick={() => {
                onClose();
                onNavigate('adhkar');
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.bentoAdhkarTitle}</span>
              <span className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('khatma');
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.bentoKhatmaTitle}</span>
              <span className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] tabular-nums">
                {numFmt(khatmaPercent)}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHeartGuide();
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.bentoHeartTitle}</span>
              <span className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('vault');
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-start text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:bg-amber-500/10 transition-colors"
            >
              <span>{t.navVault}</span>
              <span className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
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
                className="w-full flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/12 px-3.5 py-3 text-start text-sm font-bold text-[#B45309] dark:text-[#FBBF24]"
              >
                <span>{t.downloadApkHeroCta}</span>
                <span className="text-xs">APK ›</span>
              </button>
            )}

            {/* Live OTA Update Check */}
            <div className="pt-2">
              {updateAvailable ? (
                <button
                  type="button"
                  data-testid="drawer-apply-update-btn"
                  onClick={onApplyUpdate}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#D97706] px-3.5 py-2.5 text-xs font-bold text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    {lang === 'ar' ? 'تحديث جديد متاح — اضغط للتحديث' : 'Update Ready — Tap to Refresh'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="drawer-check-update-btn"
                  onClick={onCheckUpdates}
                  className="w-full flex items-center justify-between rounded-2xl border border-amber-500/15 px-3.5 py-2.5 text-xs font-medium text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E] dark:hover:text-[#FAF5EE]"
                >
                  <span>{lang === 'ar' ? 'التحقق من التحديثات' : 'Check for Updates'}</span>
                  <span className="text-[11px]">
                    {updateStatus === 'checking'
                      ? lang === 'ar'
                        ? 'جارٍ الفحص...'
                        : 'Checking...'
                      : updateStatus === 'uptodate'
                        ? lang === 'ar'
                          ? 'مُحدّث'
                          : 'Up to date'
                        : updateStatus === 'offline'
                          ? lang === 'ar'
                            ? 'دون اتصال'
                            : 'Offline'
                          : `v${currentVersion}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-amber-500/12 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-2xl border border-amber-500/20 bg-white/80 dark:bg-[#241B15] py-2.5 px-3 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
          >
            {theme === 'dark' ? (lang === 'ar' ? 'الوضع النهاري' : 'Light Mode') : (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode')}
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="rounded-2xl border border-amber-500/20 bg-white/80 dark:bg-[#241B15] py-2.5 px-3 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
          >
            {t.langToggleLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
