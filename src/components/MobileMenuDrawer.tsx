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
  onSelectLang?: (lang: AppLang) => void;
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
  onSelectLang,
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
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[82%] max-w-xs h-full pt-safe-top pb-safe-bottom border-s border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Minimal Drawer Header */}
          <div className="p-5 border-b border-[#E6E4DF] dark:border-[#222226] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <NaghmaAppIconImg alt={t.appName} className="h-9 w-9 rounded-xl shrink-0" />
              <div>
                <div className="font-semibold text-sm text-[#121212] dark:text-[#F4F4F5]">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                  v{currentVersion}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-[#6B6A66] dark:text-[#8E8E93] hover:bg-[#F4F2ED] dark:hover:bg-[#1E1E22]"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Clean Text-First Destinations */}
          <div className="px-3.5 space-y-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('surahs');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.navSurahs}</span>
              <span className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('qibla');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.qiblaTitle}</span>
              <span className="text-xs text-[#0F5132] dark:text-[#C5A46D]">›</span>
            </button>

            <button
              type="button"
              data-testid="drawer-adhkar-btn"
              onClick={() => {
                onClose();
                onNavigate('adhkar');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.bentoAdhkarTitle}</span>
              <span className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('khatma');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.bentoKhatmaTitle}</span>
              <span className="text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] tabular-nums">
                {numFmt(khatmaPercent)}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHeartGuide();
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.bentoHeartTitle}</span>
              <span className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('vault');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.navVault}</span>
              <span className="text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
                {numFmt(cachedSurahCount)}
              </span>
            </button>

            <button
              type="button"
              data-testid="drawer-privacy-btn"
              onClick={() => {
                onClose();
                onNavigate('privacy');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#121212] dark:text-[#F4F4F5] hover:bg-[#F9F8F6] dark:hover:bg-[#18181C] transition-colors"
            >
              <span>{t.navPrivacy}</span>
              <span className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">›</span>
            </button>

            {!isInstalled && (
              <button
                type="button"
                data-testid="drawer-apk-btn"
                onClick={() => {
                  onClose();
                  onNavigate('download');
                }}
                className="w-full flex items-center justify-between rounded-xl border border-[#0F5132]/25 dark:border-[#C5A46D]/30 bg-[#0F5132]/8 dark:bg-[#C5A46D]/12 px-3.5 py-3 text-start text-sm font-semibold text-[#0F5132] dark:text-[#C5A46D]"
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] px-3.5 py-2.5 text-xs font-semibold text-white dark:text-[#09090B]"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>
                    {lang === 'ar' ? 'تحديث جديد متاح — اضغط للتحديث' : 'Update Ready — Tap to Refresh'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="drawer-check-update-btn"
                  onClick={onCheckUpdates}
                  className="w-full flex items-center justify-between rounded-xl border border-[#E6E4DF] dark:border-[#222226] px-3.5 py-2.5 text-xs font-medium text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5]"
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
        <div className="p-4 border-t border-[#E6E4DF] dark:border-[#222226] space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C]">
            {(
              [
                {id: 'ar', label: 'عربي'},
                {id: 'en', label: 'EN'},
                {id: 'fr', label: 'FR'},
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`drawer-lang-${opt.id}`}
                onClick={() => (onSelectLang ? onSelectLang(opt.id) : onToggleLang())}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  lang === opt.id
                    ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                    : 'text-[#6B6A66] dark:text-[#8E8E93]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] py-2.5 px-3 text-xs font-semibold text-[#121212] dark:text-[#F4F4F5]"
          >
            {theme === 'dark'
              ? lang === 'ar'
                ? 'الوضع النهاري'
                : lang === 'fr'
                  ? 'Mode Jour'
                  : 'Light Mode'
              : lang === 'ar'
                ? 'الوضع الليلي'
                : lang === 'fr'
                  ? 'Mode Nuit'
                  : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
