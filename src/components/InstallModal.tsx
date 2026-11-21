import React from 'react';
import {CheckCircle2, Download, Share, Smartphone, X} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import {getApkDownloadUrl} from '../hooks/usePWAInstall';
import {NaghmaEmblemSvg} from './OrnamentalSvg';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.installAppTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#13181E] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#059669]/12 dark:bg-[#10B981]/12 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
              <NaghmaEmblemSvg className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F7F4EB]">
                {t.installAppTitle}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6]">
                Android APK · PWA · iOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install modal"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CAFA6] hover:bg-[#EAE3D5] dark:hover:bg-[#06100D]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 flex items-center gap-3 text-sm text-[#059669] dark:text-[#10B981] font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{t.installedStandalone}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Android APK Direct Download + Instructions */}
            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#F3ECE0]/70 dark:bg-[#0B0E11]/75 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1C1917] dark:text-[#F4F1EA]">
                <Smartphone className="h-4 w-4 text-[#B4891B] dark:text-[#D4AF37] shrink-0" />
                <span>{t.downloadApkTitle}</span>
              </div>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] leading-relaxed">
                {t.downloadApkDesc}
              </p>
              <a
                href={apkUrl}
                download="naghma-quran.apk"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#059669] dark:bg-[#10B981] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#06100D] hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>{t.downloadApkCta}</span>
              </a>
              <ol className="space-y-1.5 text-[11px] sm:text-xs text-[#57534E] dark:text-[#9CAFA6] pt-1">
                <li>{t.apkStep1}</li>
                <li>{t.apkStep2}</li>
                <li>{t.apkStep3}</li>
              </ol>
            </div>

            {/* Browser PWA / iOS Install */}
            {isInstallable ? (
              <div className="space-y-2.5 pt-1 border-t border-[#B4891B]/15 dark:border-white/10">
                <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] leading-relaxed">
                  {t.installAppDesc}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onTriggerNativeInstall();
                    if (ok) onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#B4891B]/30 dark:border-[#D4AF37]/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37] transition-colors"
                >
                  <Download className="h-4 w-4 text-[#B4891B] dark:text-[#D4AF37]" />
                  <span>{t.installNowBtn}</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="space-y-2 pt-2 border-t border-[#B4891B]/15 dark:border-white/10 text-xs text-[#57534E] dark:text-[#9CAFA6]">
                <p className="font-semibold text-[#1C1917] dark:text-[#F7F4EB]">
                  {lang === 'ar'
                    ? 'التثبيت على iPhone أو iPad (متصفح Safari):'
                    : 'Install on iPhone or iPad (Safari):'}
                </p>
                <ol className="space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <span>{lang === 'ar' ? '١. اضغط على زر المشاركة' : '1. Tap the'}</span>
                    <Share className="h-3.5 w-3.5 inline text-[#B4891B] dark:text-[#D4AF37]" />
                    <strong>{lang === 'ar' ? 'Share' : 'Share'}</strong>
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٢. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : '2. Scroll down and tap Add to Home Screen.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? '٣. اضغط "إضافة" لتشغيل نَغمة القرآن دون إنترنت.'
                      : '3. Tap Add to launch Naghma Quran offline anytime.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-[#B4891B]/15 dark:border-white/10 text-xs text-[#57534E] dark:text-[#9CAFA6]">
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
