import React from 'react';
import {CheckCircle2, Download, Share, Smartphone, X} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import {getApkDownloadUrl} from '../hooks/usePWAInstall';
import {DEFAULT_APK_FILENAME} from '../utils/apkHelpers';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface InstallModalProps {
  lang: AppLang;
  t: Translations;
  isOpen: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onClose: () => void;
  onTriggerNativeInstall: () => Promise<boolean>;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  lang,
  t,
  isOpen,
  isInstallable,
  isInstalled,
  isIOS,
  onClose,
  onTriggerNativeInstall,
}) => {
  if (!isOpen) return null;

  const apkUrl = getApkDownloadUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.installAppTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#1B1410] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <NaghmaAppIconImg
              alt="Najm Quran"
              className="h-11 w-11 rounded-2xl shrink-0"
            />
            <div>
              <h3 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.installAppTitle}
              </h3>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
                Android APK · PWA · iOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install modal"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-[#B45309] dark:text-[#FBBF24] font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{t.installedStandalone}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/25 bg-[#FAF5EE] dark:bg-[#241B15] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                <Smartphone className="h-4 w-4 text-[#D97706] shrink-0" />
                <span>{t.downloadApkTitle}</span>
              </div>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] leading-relaxed">
                {t.downloadApkDesc}
              </p>
              <a
                href={apkUrl}
                download={DEFAULT_APK_FILENAME}
                type="application/vnd.android.package-archive"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D97706] hover:bg-[#B45309] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>{t.downloadApkCta}</span>
                <span className="text-xs opacity-90 tabular-nums" dir="ltr">
                  (6.5 MB)
                </span>
              </a>
              <ol className="space-y-1.5 text-[11px] sm:text-xs text-[#6E5649] dark:text-[#D6C7B8] pt-1">
                <li>{t.apkStep1}</li>
                <li>{t.apkStep2}</li>
                <li>{t.apkStep3}</li>
              </ol>
            </div>

            {isInstallable ? (
              <div className="space-y-2.5 pt-1 border-t border-amber-500/12">
                <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] leading-relaxed">
                  {t.installAppDesc}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onTriggerNativeInstall();
                    if (ok) onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors"
                >
                  <Download className="h-4 w-4 text-[#D97706]" />
                  <span>{t.installNowBtn}</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="space-y-2 pt-2 border-t border-amber-500/12 text-xs text-[#6E5649] dark:text-[#D6C7B8]">
                <p className="font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                  {lang === 'ar'
                    ? 'التثبيت على iPhone أو iPad (متصفح Safari):'
                    : 'Install on iPhone or iPad (Safari):'}
                </p>
                <ol className="space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <span>{lang === 'ar' ? '١. اضغط على زر المشاركة' : '1. Tap the'}</span>
                    <Share className="h-3.5 w-3.5 inline text-[#D97706]" />
                    <strong>Share</strong>
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٢. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : '2. Scroll down and tap Add to Home Screen.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٣. اضغط "إضافة" لتشغيل نَجم القرآن دون إنترنت.'
                      : '3. Tap Add to launch Najm Quran offline anytime.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-amber-500/12 text-xs text-[#6E5649] dark:text-[#D6C7B8]">
                <p className="leading-relaxed">{t.installAppDesc}</p>
                <ul className="space-y-1.5">
                  <li>
                    <strong>{lang === 'ar' ? 'أندرويد (Chrome):' : 'Android (Chrome / Edge):'}</strong>{' '}
                    {lang === 'ar'
                      ? 'افتح قائمة المتصفح (⋮) واختر "تثبيت التطبيق" أو "الإضافة للشاشة الرئيسية".'
                      : 'Open the browser menu (⋮) and tap Install app or Add to Home screen.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'الحاسوب (Chrome / Edge):' : 'Desktop (Chrome / Edge):'}</strong>{' '}
                    {lang === 'ar'
                      ? 'اضغط على أيقونة التثبيت في شريط العنوان.'
                      : 'Click the Install icon in the address bar.'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
