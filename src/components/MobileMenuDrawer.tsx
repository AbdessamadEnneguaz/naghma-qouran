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
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[82%] max-w-xs h-full pt-safe-top pb-safe-bottom border-s border-[#B4891B]/20 dark:border-white/10 bg-[#FAF6EE] dark:bg-[#0E1318] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Minimal Drawer Header */}
          <div className="p-5 border-b border-[#B4891B]/12 dark:border-white/8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <NaghmaAppIconImg alt={t.appName} className="h-9 w-9 rounded-xl shrink-0" />
              <div>
                <div className="font-bold text-sm text-[#1C1917] dark:text-[#F4F1EA]">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
                  v{currentVersion}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-[#57534E] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/8"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Clean Text-First Destinations (Zero Icon Clutter) */}
          <div className="px-3.5 space-y-1.5">
            <button
              type="button"
              data-testid="drawer-adhkar-btn"
              onClick={() => {
                onClose();
                onNavigate('adhkar');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>{t.bentoAdhkarTitle}</span>
              <span className="text-xs text-[#57534E] dark:text-[#9CA3AF]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('khatma');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>{t.bentoKhatmaTitle}</span>
              <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] tabular-nums">
                {numFmt(khatmaPercent)}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHeartGuide();
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>{t.bentoHeartTitle}</span>
              <span className="text-xs text-[#57534E] dark:text-[#9CA3AF]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('vault');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>{t.navVault}</span>
              <span className="text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
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
                className="w-full flex items-center justify-between rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/12 px-3.5 py-3 text-start text-sm font-bold text-[#9A6E10] dark:text-[#FDE68A]"
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-3.5 py-2.5 text-xs font-bold text-[#0A0D10]"
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
                  className="w-full flex items-center justify-between rounded-xl border border-[#B4891B]/18 dark:border-white/10 px-3.5 py-2.5 text-xs font-medium text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
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
        <div className="p-4 border-t border-[#B4891B]/12 dark:border-white/8 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-xl border border-[#B4891B]/20 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] py-2.5 px-3 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
          >
            {theme === 'dark' ? (lang === 'ar' ? 'الوضع النهاري' : 'Light Mode') : (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode')}
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="rounded-xl border border-[#B4891B]/20 dark:border-white/12 bg-[#F4EFE4] dark:bg-[#11171D] py-2.5 px-3 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
          >
            {t.langToggleLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
