import React, {useEffect, useState} from 'react';
import {Download} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import {getApkDownloadUrl} from '../hooks/usePWAInstall';
import {
  APP_VERSION,
  DEFAULT_APK_FILENAME,
  DEFAULT_APK_MIME,
  DEFAULT_APK_SIZE_BYTES,
  formatApkSizeMb,
  isLocalApkPath,
} from '../utils/apkHelpers';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface DownloadApkPageProps {
  lang: AppLang;
  t: Translations;
  isInstallable: boolean;
  isInstalled: boolean;
  currentVersion?: string;
  onTriggerNativeInstall: () => Promise<boolean>;
}

export const DownloadApkPage: React.FC<DownloadApkPageProps> = ({
  lang,
  t,
  isInstallable,
  isInstalled,
  currentVersion = APP_VERSION,
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
      ? `v${currentVersion} · مجاني · ${apkSizeLabel} · تحديث تلقائي مباشر`
      : `v${currentVersion} · Free · ${apkSizeLabel} · Live OTA Updates`;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-10 pb-8 space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-8 lg:p-10">
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums">
              <span data-testid="apk-version-meta">{versionMetaText}</span>
              {apkVerified && (
                <span
                  data-testid="apk-verified-badge"
                  className="rounded-lg border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#27784C]/8 dark:bg-[#52B77F]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]"
                >
                  {lang === 'ar' ? 'جاهز للتحميل' : 'APK Ready'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#142019] dark:text-[#F1F5F3] [text-wrap:balance]">
              {t.downloadPageHeading}
            </h1>

            <p className="text-sm sm:text-base text-[#5A6B62] dark:text-[#92A59B] leading-relaxed max-w-xl">
              {t.downloadPageSubheading}
            </p>
          </div>

          {isInstalled ? (
            <div className="rounded-xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#27784C]/8 dark:bg-[#52B77F]/12 p-4 text-sm font-semibold text-[#27784C] dark:text-[#52B77F]">
              {t.installedStandalone}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-6 py-3.5 text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity whitespace-nowrap"
                >
                  <Download className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>{t.downloadApkCta}</span>
                  <span className="text-xs font-medium opacity-90 tabular-nums" dir="ltr">
                    ({apkSizeLabel})
                  </span>
                </a>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={() => void onTriggerNativeInstall()}
                    className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-5 py-3.5 text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors whitespace-nowrap"
                  >
                    {t.installNowBtn}
                  </button>
                )}
              </div>

              {downloadStarted && (
                <p className="text-xs font-medium text-[#27784C] dark:text-[#52B77F]">
                  {lang === 'ar'
                    ? 'بدأ تنزيل mihrab-noor.apk — افتح الملف من إشعارات المتصفح للتثبيت.'
                    : 'Downloading mihrab-noor.apk — open the file from your browser downloads to install.'}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#E2EAE5] dark:border-[#1E2E26] space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-[#142019] dark:text-[#F1F5F3]">
              {lang === 'ar' ? 'خطوات التثبيت والتحديث التلقائي' : 'Installation & Auto-Update Guide'}
            </h2>
            <ol className="space-y-1.5 text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
              <li>{t.apkStep1}</li>
              <li>{t.apkStep2}</li>
              <li>{t.apkStep3}</li>
            </ol>
            <p
              data-testid="apk-uninstall-tip"
              className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-3.5 py-2.5 text-xs font-medium text-[#142019] dark:text-[#F1F5F3]"
            >
              {t.apkUninstallTip}
            </p>
            <p className="text-xs text-[#27784C] dark:text-[#52B77F] pt-1">
              {lang === 'ar'
                ? 'التحديثات المباشرة: أي تحسين أو ميزة جديدة تُنشر هنا تصلك تلقائياً داخل التطبيق دون حاجة لإعادة التحميل.'
                : 'Live OTA Sync: Future design improvements and features published here sync automatically to your installed app.'}
            </p>
          </div>
        </div>

        {/* Right: Clean Architectural Phone Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            aria-label="Mihrab Noor Android App Preview"
            className="w-[248px] sm:w-[264px] rounded-[34px] border-[4px] border-[#1E3229] bg-[#F4F7F5] p-3.5 shadow-xl space-y-3"
          >
            <div className="mx-auto h-1 w-12 rounded-full bg-black/15" />

            <div className="flex items-center justify-between px-1.5 text-[#142019]">
              <div className="flex items-center gap-1.5">
                <NaghmaAppIconImg alt="Mihrab Noor" className="h-5 w-5 rounded-md" />
                <span className="font-quran-scheherazade text-base font-bold text-[#27784C]">
                  مِحْرَاب النُّور
                </span>
              </div>
              <span dir="ltr" className="text-[10px] text-[#5A6B62] tabular-nums">١ / ٦٠٤</span>
            </div>

            <div className="rounded-2xl border border-[#E2EAE5] bg-white p-3.5 space-y-2">
              <div className="text-center border-b border-[#E2EAE5] pb-1.5">
                <span className="font-quran-scheherazade text-base text-[#27784C] font-bold">
                  سُورَةُ ٱلْفَاتِحَةِ
                </span>
              </div>

              <div dir="rtl" className="font-quran-amiri text-[15px] leading-[2.05] text-[#142019] text-right">
                <span className="bg-[#27784C]/10 text-[#27784C] px-1 rounded">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾
                </span>{' '}
                ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿٣﴾
              </div>

              <div className="pt-1.5 border-t border-[#E2EAE5] flex items-center justify-between text-[10px] text-[#5A6B62] tabular-nums">
                <span>الحزب ١</span>
                <span dir="ltr" className="text-[#27784C] font-semibold">١ / ٦٠٤</span>
                <span>الفاتحة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3">
          <h2 className="text-sm sm:text-base font-semibold text-[#142019] dark:text-[#F1F5F3]">
            {t.downloadHighlightsTitle}
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="text-[#27784C] dark:text-[#52B77F] font-bold">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3">
          <h2 className="text-sm sm:text-base font-semibold text-[#142019] dark:text-[#F1F5F3]">
            {t.downloadAndroidStudioTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] leading-relaxed">
            {t.downloadAndroidStudioDesc}
          </p>
          <div
            dir="ltr"
            className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3.5 py-2.5 text-[11px] font-mono text-[#27784C] dark:text-[#52B77F] overflow-x-auto"
          >
            npm run android:sync && npx cap open android
          </div>
        </div>
      </section>
    </div>
  );
};
