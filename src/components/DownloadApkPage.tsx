import React, {useEffect, useState} from 'react';
import {
  CheckCircle2,
  Code2,
  Download,
  Mic,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import {getApkDownloadUrl} from '../hooks/usePWAInstall';
import {
  DEFAULT_APK_FILENAME,
  DEFAULT_APK_MIME,
  DEFAULT_APK_SIZE_BYTES,
  formatApkSizeMb,
  isLocalApkPath,
} from '../utils/apkHelpers';
import {NaghmaEmblemSvg} from './OrnamentalSvg';

interface DownloadApkPageProps {
  lang: AppLang;
  t: Translations;
  isInstallable: boolean;
  isInstalled: boolean;
  onTriggerNativeInstall: () => Promise<boolean>;
}

export const DownloadApkPage: React.FC<DownloadApkPageProps> = ({
  lang,
  t,
  isInstallable,
  isInstalled,
  onTriggerNativeInstall,
}) => {
  const apkUrl = getApkDownloadUrl();
  const [apkSizeLabel, setApkSizeLabel] = useState<string>(() =>
    formatApkSizeMb(DEFAULT_APK_SIZE_BYTES)
  );
  const [apkVerified, setApkVerified] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  useEffect(() => {
    if (!isLocalApkPath(apkUrl) || isInstalled) return;
    let active = true;
    fetch(apkUrl, {method: 'HEAD'})
      .then((res) => {
        if (!active || !res.ok) return;
        const len = Number(res.headers.get('content-length') || 0);
        if (len > 0) {
          setApkSizeLabel(formatApkSizeMb(len));
        }
        setApkVerified(true);
      })
      .catch(() => {
        // Leave fallback size label intact
      });
    return () => {
      active = false;
    };
  }, [apkUrl, isInstalled]);

  const highlights = [
    t.downloadHighlight1,
    t.downloadHighlight2,
    t.downloadHighlight3,
    t.downloadHighlight4,
  ];

  const versionMetaText =
    lang === 'ar'
      ? `v1.0.0 · مجاني · ${apkSizeLabel} · يعمل دون إنترنت`
      : `v1.0.0 · Free · ${apkSizeLabel} · 100% Offline`;

  return (
    <div className="mx-auto max-w-6xl px-3.5 sm:px-6 md:px-8 pt-6 sm:pt-9 pb-36 md:pb-28 space-y-8">
      {/* Main 2-Column Split: Download Details + Styled Android Device Mockup */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center rounded-2xl border border-[#B4891B]/30 dark:border-[#D4AF37]/25 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-8 lg:p-10 islamic-lattice-bg">
        {/* Left: Copy, Version Metadata, Download CTAs & 3-Step Guide */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
              <Smartphone className="h-4 w-4 shrink-0" />
              <span data-testid="apk-version-meta">{versionMetaText}</span>
              {apkVerified && (
                <span
                  data-testid="apk-verified-badge"
                  className="inline-flex items-center gap-1 rounded-md border border-[#10B981]/35 bg-[#10B981]/12 px-2 py-0.5 text-[11px] font-semibold text-[#059669] dark:text-[#34D399]"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>{lang === 'ar' ? 'ملف APK متاح للتحميل' : 'APK Ready'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1C1917] dark:text-[#F4F1EA] [text-wrap:balance]">
              {t.downloadPageHeading}
            </h1>

            <p className="text-sm sm:text-base text-[#57534E] dark:text-[#9CAFA6] leading-relaxed max-w-2xl">
              {t.downloadPageSubheading}
            </p>
          </div>

          {isInstalled ? (
            <div className="rounded-xl border border-[#10B981]/35 bg-[#10B981]/12 p-4 flex items-center gap-3 text-sm font-semibold text-[#059669] dark:text-[#34D399]">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{t.installedStandalone}</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={apkUrl}
                  download={DEFAULT_APK_FILENAME}
                  type={DEFAULT_APK_MIME}
                  data-testid="download-page-apk-cta"
                  onClick={() => setDownloadStarted(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B4891B] px-6 py-3.5 text-sm font-bold text-[#0B0E11] shadow-lg shadow-[#D4AF37]/20 hover:opacity-95 transition-opacity whitespace-nowrap"
                >
                  <Download className="h-4.5 w-4.5 shrink-0" />
                  <span>{t.downloadApkCta}</span>
                  <span className="text-xs font-semibold opacity-80 tabular-nums" dir="ltr">
                    ({apkSizeLabel})
                  </span>
                </a>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={() => void onTriggerNativeInstall()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/12 px-5 py-3.5 text-sm font-semibold text-[#059669] dark:text-[#34D399] hover:bg-[#10B981]/20 transition-colors whitespace-nowrap"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>{t.installNowBtn}</span>
                  </button>
                )}
              </div>

              {downloadStarted && (
                <p className="text-xs font-medium text-[#059669] dark:text-[#34D399] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? 'بدأ تنزيل naghma-quran.apk — افتح الملف من إشعارات المتصفح للتثبيت.'
                      : 'Downloading naghma-quran.apk — open the file from your browser downloads to install.'}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* 3-Step Installation Guide */}
          <div className="pt-4 border-t border-[#B4891B]/18 dark:border-white/10 space-y-2.5">
            <h2 className="text-xs font-bold tracking-wide text-[#1C1917] dark:text-[#F4F1EA]">
              {lang === 'ar' ? 'خطوات التثبيت على أندرويد' : '3-Step Android Installation Guide'}
            </h2>
            <ol className="space-y-1.5 text-xs sm:text-sm text-[#57534E] dark:text-[#D6D3C9]">
              <li>{t.apkStep1}</li>
              <li>{t.apkStep2}</li>
              <li>{t.apkStep3}</li>
            </ol>
          </div>
        </div>

        {/* Right: Stylized Android Phone Preview Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            aria-label="Naghma Quran Android App Preview"
            className="w-[260px] sm:w-[278px] rounded-[34px] border-[5px] border-[#262B31] dark:border-[#242B33] bg-[#0B0E11] p-3 shadow-2xl space-y-3"
          >
            {/* Speaker Notch */}
            <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15" />

            {/* Phone App Header */}
            <div className="flex items-center justify-between px-1.5 pt-0.5 text-[#F4F1EA]">
              <div className="flex items-center gap-1.5">
                <NaghmaEmblemSvg className="h-5 w-5" />
                <span className="font-quran-scheherazade text-base text-[#D4AF37]">نَغمة القرآن</span>
              </div>
              <span dir="ltr" className="text-[10px] text-[#9CA3AF] tabular-nums">١ / ٦٠٤</span>
            </div>

            {/* Framed Mushaf Preview Card inside Phone */}
            <div className="rounded-2xl border border-amber-500/40 bg-[#0E1318] p-3.5 space-y-2.5 ring-1 ring-inset ring-amber-500/20">
              <div className="text-center border-b border-amber-500/20 pb-1.5">
                <span className="font-quran-scheherazade text-base text-[#D4AF37]">
                  سُورَةُ ٱلْفَاتِحَةِ
                </span>
              </div>

              <div dir="rtl" className="font-quran-amiri text-[15px] leading-[2.05] text-[#F4F1EA] text-right">
                <span className="bg-[#D4AF37]/20 text-[#FDE68A] px-1 rounded">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾
                </span>{' '}
                ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿٣﴾ مَٰلِكِ يَوْمِ ٱلدِّينِ ﴿٤﴾
              </div>

              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#9CA3AF] tabular-nums">
                <span>الحزب ١</span>
                <span dir="ltr" className="text-[#D4AF37]">١ / ٦٠٤</span>
                <span>الفاتحة</span>
              </div>
            </div>

            {/* Mini Player + Bottom Nav Preview inside Phone */}
            <div className="rounded-xl border border-white/10 bg-[#11171D] px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#F4F1EA] truncate">
                {lang === 'ar' ? 'محمد اللحيدان' : 'Al-Luhaidan'}
              </span>
              <div className="h-7 w-7 rounded-full bg-[#10B981] text-[#0B0E11] flex items-center justify-center">
                <Mic className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-semibold text-[#D4AF37]">
                {t.hifzMode}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights + Capacitor Android Studio Note */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-6 space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA]">
            {t.downloadHighlightsTitle}
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#57534E] dark:text-[#D6D3C9]">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F4F1EA]">
            <Code2 className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
            <h2>{t.downloadAndroidStudioTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#D6D3C9] leading-relaxed">
            {t.downloadAndroidStudioDesc}
          </p>
          <div
            dir="ltr"
            className="rounded-xl border border-[#B4891B]/18 dark:border-white/10 bg-[#FAF6EE] dark:bg-[#0B0E11] px-3.5 py-2.5 text-[11px] font-mono text-[#059669] dark:text-[#34D399] overflow-x-auto"
          >
            npm run build && npx cap sync android && npx cap open android
          </div>
        </div>
      </section>
    </div>
  );
};
