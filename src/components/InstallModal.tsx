import React from 'react';
import {CheckCircle2, Download, Share, Smartphone, X} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import {getApkDownloadUrl} from '../hooks/usePWAInstall';
import {DEFAULT_APK_FILENAME, DEFAULT_APK_SIZE_BYTES, formatApkSizeMb} from '../utils/apkHelpers';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.installAppTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <NaghmaAppIconImg
              alt="Mihrab Noor"
              className="h-11 w-11 rounded-xl shrink-0"
            />
            <div>
              <h3 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
                {t.installAppTitle}
              </h3>
              <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
                Android APK · PWA · iOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install modal"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#6B6A66] dark:text-[#8E8E93] hover:bg-[#F4F2ED] dark:hover:bg-[#1E1E22]"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.5} />
          </button>
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-[#0F5132]/30 dark:border-[#C5A46D]/35 bg-[#0F5132]/8 dark:bg-[#C5A46D]/12 p-4 flex items-center gap-3 text-sm text-[#0F5132] dark:text-[#C5A46D] font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            <span>{t.installedStandalone}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]">
                <Smartphone className="h-4 w-4 text-[#0F5132] dark:text-[#C5A46D] shrink-0" strokeWidth={1.5} />
                <span>{t.downloadApkTitle}</span>
              </div>
              <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] leading-relaxed">
                {t.downloadApkDesc}
              </p>
              <a
                href={apkUrl}
                download={DEFAULT_APK_FILENAME}
                type="application/vnd.android.package-archive"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] hover:opacity-90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#09090B] transition-opacity"
              >
                <Download className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>{t.downloadApkCta}</span>
                <span className="text-xs opacity-90 tabular-nums" dir="ltr">
                  ({formatApkSizeMb(DEFAULT_APK_SIZE_BYTES)})
                </span>
              </a>
              <ol className="space-y-1.5 text-[11px] sm:text-xs text-[#6B6A66] dark:text-[#8E8E93] pt-1">
                <li>{t.apkStep1}</li>
                <li>{t.apkStep2}</li>
                <li>{t.apkStep3}</li>
              </ol>
            </div>

            {isInstallable ? (
              <div className="space-y-2.5 pt-1 border-t border-[#E6E4DF] dark:border-[#222226]">
                <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] leading-relaxed">
                  {t.installAppDesc}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onTriggerNativeInstall();
                    if (ok) onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E6E4DF] dark:border-[#222226] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors"
                >
                  <Download className="h-4 w-4 text-[#0F5132] dark:text-[#C5A46D]" strokeWidth={1.5} />
                  <span>{t.installNowBtn}</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="space-y-2 pt-2 border-t border-[#E6E4DF] dark:border-[#222226] text-xs text-[#6B6A66] dark:text-[#8E8E93]">
                <p className="font-semibold text-[#121212] dark:text-[#F4F4F5]">
                  {lang === 'ar'
                    ? 'التثبيت على iPhone أو iPad (متصفح Safari):'
                    : 'Install on iPhone or iPad (Safari):'}
                </p>
                <ol className="space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <span>{lang === 'ar' ? '١. اضغط على زر المشاركة' : '1. Tap the'}</span>
                    <Share className="h-3.5 w-3.5 inline text-[#0F5132] dark:text-[#C5A46D]" strokeWidth={1.5} />
                    <strong>Share</strong>
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٢. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : '2. Scroll down and tap Add to Home Screen.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٣. اضغط "إضافة" لتشغيل مِحْرَاب النُّور دون إنترنت.'
                      : '3. Tap Add to launch Mihrab Noor offline anytime.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-[#E6E4DF] dark:border-[#222226] text-xs text-[#6B6A66] dark:text-[#8E8E93]">
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
