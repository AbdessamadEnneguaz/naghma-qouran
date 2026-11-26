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
        className="w-[82%] max-w-xs h-full pt-safe-top pb-safe-bottom border-s border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Minimal Drawer Header */}
          <div className="p-5 border-b border-[#E2EAE5] dark:border-[#1E2E26] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <NaghmaAppIconImg alt={t.appName} className="h-9 w-9 rounded-xl shrink-0" />
              <div>
                <div className="font-semibold text-sm text-[#142019] dark:text-[#F1F5F3]">
                  {t.appName}
                </div>
                <div className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                  v{currentVersion}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]"
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
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.navSurahs}</span>
              <span className="text-xs text-[#5A6B62] dark:text-[#92A59B]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('qibla');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.qiblaTitle}</span>
              <span className="text-xs text-[#27784C] dark:text-[#52B77F]">›</span>
            </button>

            <button
              type="button"
              data-testid="drawer-adhkar-btn"
              onClick={() => {
                onClose();
                onNavigate('adhkar');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.bentoAdhkarTitle}</span>
              <span className="text-xs text-[#5A6B62] dark:text-[#92A59B]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('khatma');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.bentoKhatmaTitle}</span>
              <span className="text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums">
                {numFmt(khatmaPercent)}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHeartGuide();
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.bentoHeartTitle}</span>
              <span className="text-xs text-[#5A6B62] dark:text-[#92A59B]">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('vault');
              }}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.navVault}</span>
              <span className="text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
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
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-start text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors"
            >
              <span>{t.navPrivacy}</span>
              <span className="text-xs text-[#5A6B62] dark:text-[#92A59B]">›</span>
            </button>

            {!isInstalled && (
              <button
                type="button"
                data-testid="drawer-apk-btn"
                onClick={() => {
                  onClose();
                  onNavigate('download');
                }}
                className="w-full flex items-center justify-between rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#27784C]/8 dark:bg-[#52B77F]/12 px-3.5 py-3 text-start text-sm font-semibold text-[#27784C] dark:text-[#52B77F]"
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] px-3.5 py-2.5 text-xs font-semibold text-white dark:text-[#0A110E]"
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
                  className="w-full flex items-center justify-between rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-3.5 py-2.5 text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]"
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
        <div className="p-4 border-t border-[#E2EAE5] dark:border-[#1E2E26] space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D]">
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
                    ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                    : 'text-[#5A6B62] dark:text-[#92A59B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] py-2.5 px-3 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]"
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
