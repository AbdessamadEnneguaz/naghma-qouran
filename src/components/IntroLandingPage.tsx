import React, {useState} from 'react';
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Compass,
  Download,
  Globe,
  Headphones,
  Moon,
  MoonStar,
  Pause,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';
import type {Riwayat} from '../types/quran';
import {INTRO_SAMPLE_VERSES} from '../utils/introFlowLogic';
import {triggerHaptic} from '../utils/haptics';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface IntroLandingPageProps {
  lang: AppLang;
  t: Translations;
  theme: 'light' | 'dark';
  riwayat: Riwayat;
  isPlayingSample: boolean;
  playingSurah: number;
  playingAyah: number;
  onChangeLang: (lang: AppLang) => void;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onToggleTheme: () => void;
  onPlaySampleVerse: (surah: number, ayah: number) => void;
  onOpenSampleInMushaf: (surah: number, ayah: number) => void;
  onEnterApp: () => void;
  onOpenDownloadApk: () => void;
}

const INTRO_COPY: Record<
  AppLang,
  {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    whatIsLabel: string;
    whatIsDesc: string;
    whyUseLabel: string;
    whyUseDesc: string;
    enterAppBtn: string;
    downloadApkBtn: string;
    trySectionBadge: string;
    trySectionTitle: string;
    trySectionDesc: string;
    listenSample: string;
    pauseSample: string;
    openInMushaf: string;
    insideTitle: string;
    insideSubtitle: string;
    prefsTitle: string;
    ctaFooterTitle: string;
    ctaFooterDesc: string;
  }
> = {
  en: {
    badge: 'Quran · Prayer · Adhkar · Android & Web',
    heroTitle: 'Your quiet sanctuary for reading, listening, and memorizing the Holy Quran',
    heroSubtitle:
      'Mihrab Noor brings the authentic Madani & Warsh Mushaf, 32 renowned reciters, live Prayer Times, Qibla compass, and daily Adhkar into one fast, distraction-free experience — free forever, offline-ready, with zero ads.',
    whatIsLabel: 'What is Mihrab Noor?',
    whatIsDesc:
      'A dedicated Islamic & Quran companion designed to look as calm as real Mushaf paper while giving you modern 2026 spatial speed, offline storage, and haptic precision.',
    whyUseLabel: 'Why use it every day?',
    whyUseDesc:
      'Keep your daily Khatma streak alive, memorize faster with Hifz word-masking & ayah loops, and receive timely Prayer, Adhkar, and Friday Al-Kahf notifications straight on your phone.',
    enterAppBtn: 'Enter Application',
    downloadApkBtn: 'Get Android APK',
    trySectionBadge: 'Live Interactive Try-Out',
    trySectionTitle: 'Try reading & listening right here before entering',
    trySectionDesc:
      'Switch between Hafs and Warsh scripts or play a live verse recitation before launching the full app.',
    listenSample: 'Listen Live',
    pauseSample: 'Playing...',
    openInMushaf: 'Open in Mushaf',
    insideTitle: 'Everything waiting inside Mihrab Noor',
    insideSubtitle: 'Built cleanly for both everyday mobile phones and desktop browsers.',
    prefsTitle: 'Set your quick preferences before entering:',
    ctaFooterTitle: 'Ready to begin your recitation?',
    ctaFooterDesc: 'Open the full web application now or install the standalone Android APK.',
  },
  ar: {
    badge: 'القرآن الكريم · الصلاة · الأذكار · الويب وأندرويد',
    heroTitle: 'مِحرابك الهادئ لقراءة القرآن الكريم والاستماع والحفظ بخشوع',
    heroSubtitle:
      'يجمع «مِحْرَاب النُّور» بين المصحف المدني ومصحف ورش، و٣٢ قارئاً بتزامن صوتي دقيق، ومواقيت الصلاة، والقبلة، والأذكار اليومية في تطبيق واحد سريع، بدون إعلانات ويعمل حتى بدون إنترنت.',
    whatIsLabel: 'ما هو مِحْرَاب النُّور؟',
    whatIsDesc:
      'مصحف رقمي وتطبيق إسلامي متكامل صُمِّم ليمنحك صفاء الورق الحقيقي مع سرعة فائقة، وحفظ محلي للسور، وتفاعل سلس بلمسة الإصبع.',
    whyUseLabel: 'لماذا ستعتمده يومياً؟',
    whyUseDesc:
      'لمتابعة وردك اليومي والختمة، والحفظ الذكي بتكرار الآيات وإخفاء الكلمات، مع تنبيهات ذكية قبل الصلاة ولأذكار الصباح والمساء وسورة الكهف يوم الجمعة.',
    enterAppBtn: 'دخول التطبيق الآن',
    downloadApkBtn: 'تحميل تطبيق أندرويد APK',
    trySectionBadge: 'تجربة حية ومباشرة',
    trySectionTitle: 'جرّب القراءة والاستماع مباشرة قبل الدخول',
    trySectionDesc:
      'بدّل بين رواية حفص وورش أو استمع للتلاوة الحية لأي آية ثم انتقل مباشرة إلى التطبيق الكامل.',
    listenSample: 'استمع للتلاوة',
    pauseSample: 'جاري التشغيل...',
    openInMushaf: 'فتح في المصحف',
    insideTitle: 'ماذا يوجد داخل مِحْرَاب النُّور؟',
    insideSubtitle: 'كل ما تحتاجه في عبادتك اليومية في مكان واحد أنيق ومجاني بالكامل.',
    prefsTitle: 'اختر لغتك والرواية المفضلة قبل الدخول:',
    ctaFooterTitle: 'هل أنت مستعد لبدء وردك اليومي؟',
    ctaFooterDesc: 'افتح تطبيق الويب الكامل الآن أو ثبّت ملف APK مباشرة على هاتفك الأندرويد.',
  },
  fr: {
    badge: 'Coran · Prières · Adhkar · Web & Android',
    heroTitle: 'Votre sanctuaire épuré pour lire, écouter et mémoriser le Saint Coran',
    heroSubtitle:
      'Mihrab Noor réunit le Mushaf Médinois (Hafs & Warsh), 32 récitateurs synchronisés, les horaires de prière, la Qibla et les Adhkar dans une expérience fluide, sans publicité et utilisable hors ligne.',
    whatIsLabel: 'Qu’est-ce que Mihrab Noor ?',
    whatIsDesc:
      'Une application coranique moderne pensée pour retrouver la sérénité du papier tout en offrant audio haute précision, coffre hors ligne et gestes tactiles réactifs.',
    whyUseLabel: 'À quoi sert-elle au quotidien ?',
    whyUseDesc:
      'Suivre votre Khatma quotidienne, mémoriser avec boucles de versets et recevoir des rappels automatiques de prière, Adhkar et sourate Al-Kahf sur votre téléphone.',
    enterAppBtn: 'Entrer dans l’application',
    downloadApkBtn: 'Télécharger l’APK Android',
    trySectionBadge: 'Essai interactif en direct',
    trySectionTitle: 'Essayez la lecture et l’audio ici avant d’entrer',
    trySectionDesc:
      'Comparez instantanément les lectures Hafs et Warsh ou écoutez un verset avant d’ouvrir l’application complète.',
    listenSample: 'Écouter',
    pauseSample: 'En lecture...',
    openInMushaf: 'Ouvrir le Mushaf',
    insideTitle: 'Ce que vous trouverez dans Mihrab Noor',
    insideSubtitle: 'Pensé pour la clarté absolue sur mobile comme sur ordinateur.',
    prefsTitle: 'Choisissez vos préférences rapides avant de commencer :',
    ctaFooterTitle: 'Prêt à commencer votre lecture ?',
    ctaFooterDesc: 'Accédez à l’application web complète ou téléchargez l’APK Android autonome.',
  },
};

export const IntroLandingPage: React.FC<IntroLandingPageProps> = ({
  lang,
  t,
  theme,
  riwayat,
  isPlayingSample,
  playingSurah,
  playingAyah,
  onChangeLang,
  onChangeRiwayat,
  onToggleTheme,
  onPlaySampleVerse,
  onOpenSampleInMushaf,
  onEnterApp,
  onOpenDownloadApk,
}) => {
  const [sampleIdx, setSampleIdx] = useState(0);
  const copy = INTRO_COPY[lang];
  const sample = INTRO_SAMPLE_VERSES[sampleIdx] || INTRO_SAMPLE_VERSES[0];
  const isPlayingCurrentSample =
    isPlayingSample && playingSurah === sample.surah && playingAyah === sample.ayah;

  const featuresGrid = [
    {
      id: 'mushaf',
      Icon: BookOpen,
      title:
        lang === 'ar'
          ? 'مصحف حفص وورش (٦٠٤ صفحات)'
          : lang === 'fr'
            ? 'Mushaf Hafs & Warsh (604 pages)'
            : 'Hafs & Warsh Mushaf (604 Pages)',
      desc:
        lang === 'ar'
          ? 'تصفح بالسحب يميناً ويساراً، حفظ تلقائي للصفحة، ووضع تركيز خالٍ من التشتيت.'
          : lang === 'fr'
            ? 'Feuilletage tactile par glissement, reprise automatique et mode sans distraction.'
            : 'Finger-swipe page turns, auto-resume bookmarking, and distraction-free focus mode.',
    },
    {
      id: 'audio',
      Icon: Headphones,
      title:
        lang === 'ar'
          ? '٣٢ قارئاً وتزامن آية بآية'
          : lang === 'fr'
            ? '32 Récitateurs & Sync Précise'
            : '32 Reciters & Pinpoint Sync',
      desc:
        lang === 'ar'
          ? 'مؤشر صوتي تفاعلي بـ ٤٢ موجة مع تكرار الآيات ووضع التلقين للحفظ.'
          : lang === 'fr'
            ? 'Lecteur onde interactive, boucle Hifz, mode Talqeen et minuterie de veille.'
            : 'Interactive 42-bar waveform scrubber, Hifz repeat loops, and Talqeen pause tutor.',
    },
    {
      id: 'tafsir',
      Icon: Sparkles,
      title:
        lang === 'ar'
          ? 'التفسير الميسر وبطاقات الآيات'
          : lang === 'fr'
            ? 'Tafsir & Cartes à Partager'
            : 'Tafsir & Shareable Cards',
      desc:
        lang === 'ar'
          ? 'اضغط على أي آية لعرض التفسير والترجمة وتوليد صورة عالية الجودة للمشاركة.'
          : lang === 'fr'
            ? 'Touchez un verset pour le Tafsir, la traduction et l’export d’image HD.'
            : 'Tap any verse for Tafsir Al-Muyassar, translations, and crisp HD image cards.',
    },
    {
      id: 'prayer',
      Icon: Compass,
      title:
        lang === 'ar'
          ? 'مواقيت الصلاة والقبلة الدقيقة'
          : lang === 'fr'
            ? 'Prières & Boussole Qibla'
            : 'Prayer Times & Qibla Compass',
      desc:
        lang === 'ar'
          ? 'عد تنازلي فوري للصلاة القادمة مع بوصلة قبلة متجاوبة مع حركة الهاتف.'
          : lang === 'fr'
            ? 'Compte à rebours en direct jusqu’à la prochaine prière et boussole Qibla.'
            : 'Live countdown to next Adhan paired with an interactive responsive Qibla compass.',
    },
    {
      id: 'adhkar',
      Icon: MoonStar,
      title:
        lang === 'ar'
          ? 'أذكار الصباح والمساء والمسبحة'
          : lang === 'fr'
            ? 'Adhkar & Tasbih Tactile'
            : 'Adhkar & Haptic Tasbih',
      desc:
        lang === 'ar'
          ? 'عداد أذكار يومي باهتزاز لطيف مع حفظ الإنجاز اليومي تلقائياً.'
          : lang === 'fr'
            ? 'Compteur quotidien avec retour haptique et sauvegarde automatique.'
            : 'Daily morning, evening & post-prayer Adhkar counter with soft haptic feedback.',
    },
    {
      id: 'alerts',
      Icon: BellRing,
      title:
        lang === 'ar'
          ? 'إشعارات ذكية ونسخة APK'
          : lang === 'fr'
            ? 'Alertes & APK Android'
            : 'Push Alerts & Android APK',
      desc:
        lang === 'ar'
          ? 'تنبيهات قبل الأذان والورد اليومي وسورة الكهف مع ملف APK مستقل للعمل دون نت.'
          : lang === 'fr'
            ? 'Rappels Adhan, Khatma et Al-Kahf sur votre appareil + APK hors ligne.'
            : 'Timely Prayer, Wird, and Friday Al-Kahf device alerts plus standalone Android APK.',
    },
  ];

  return (
    <div
      data-testid="intro-landing-page"
      className="min-h-screen bg-[#F4F7F5] dark:bg-[#0A110E] text-[#142019] dark:text-[#F1F5F3]"
    >
      {/* Translucent Top Welcome Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E2EAE5]/80 dark:border-[#1E2E26]/80 bg-white/80 dark:bg-[#111C17]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl h-14 px-3 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-9 w-9 rounded-xl emerald-3d-hero led-backdrop flex items-center justify-center shrink-0">
              <NaghmaAppIconImg alt="Mihrab Noor" className="h-6 w-6 rounded-lg" />
            </span>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-bold tracking-tight truncate block leading-tight">
                {t.appName}
              </span>
              <span className="text-[10px] font-semibold text-[#27784C] dark:text-[#52B77F] tracking-wide uppercase block leading-none">
                v3.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="inline-flex items-center rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-0.5">
              {(['ar', 'en', 'fr'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onChangeLang(code);
                  }}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                    lang === code
                      ? 'bg-white dark:bg-[#111C17] text-[#27784C] dark:text-[#52B77F] shadow-sm'
                      : 'text-[#5A6B62] dark:text-[#92A59B]'
                  }`}
                >
                  {code === 'ar' ? 'ع' : code}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onToggleTheme();
              }}
              aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
              className="h-9 w-9 rounded-xl led-icon-tile flex items-center justify-center text-[#27784C] dark:text-[#52B77F] tactile-press"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>

            <button
              type="button"
              data-testid="intro-top-enter-btn"
              onClick={() => {
                triggerHaptic('medium');
                onEnterApp();
              }}
              className="btn-3d-emerald tactile-press rounded-xl px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span className="sm:hidden">
                {lang === 'ar' ? 'دخول' : lang === 'fr' ? 'Ouvrir' : 'Open'}
              </span>
              <span className="hidden sm:inline">{copy.enterAppBtn}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 pb-16 space-y-10 sm:space-y-12">
        {/* Hero Presentation Section: What it is & Why it exists */}
        <section className="rounded-3xl emerald-3d-hero led-backdrop p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 gloss-sheen opacity-80" />
          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-[11px] font-bold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-[#6EE7B7] led-dot-pulse animate-pulse" />
              <span>{copy.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
              {copy.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-white/88 leading-relaxed max-w-2xl">
              {copy.heroSubtitle}
            </p>

            {/* Quick What & Why Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-md space-y-1.5">
                <div className="text-xs font-bold text-[#A7F3D0]">{copy.whatIsLabel}</div>
                <p className="text-xs leading-relaxed text-white/90">{copy.whatIsDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-md space-y-1.5">
                <div className="text-xs font-bold text-[#A7F3D0]">{copy.whyUseLabel}</div>
                <p className="text-xs leading-relaxed text-white/90">{copy.whyUseDesc}</p>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="intro-enter-app-btn"
                onClick={() => {
                  triggerHaptic('success');
                  onEnterApp();
                }}
                className="tactile-press rounded-2xl bg-white text-[#145331] hover:bg-[#ECFDF5] px-6 py-3.5 text-sm font-bold shadow-xl inline-flex items-center gap-2"
              >
                <span>{copy.enterAppBtn}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} />
              </button>

              <button
                type="button"
                data-testid="intro-download-apk-btn"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenDownloadApk();
                }}
                className="tactile-press rounded-2xl bg-black/25 hover:bg-black/35 border border-white/25 px-5 py-3.5 text-sm font-semibold text-white inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.9} />
                <span>{copy.downloadApkBtn}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Live Interactive Try-It Preview Box */}
        <section
          aria-labelledby="intro-try-heading"
          data-testid="intro-live-sandbox"
          className="rounded-3xl surface-3d led-backdrop p-5 sm:p-7 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#27784C] dark:text-[#52B77F]">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.85} />
                <span>{copy.trySectionBadge}</span>
              </div>
              <h2
                id="intro-try-heading"
                className="text-lg sm:text-xl font-bold text-[#142019] dark:text-[#F1F5F3]"
              >
                {copy.trySectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
                {copy.trySectionDesc}
              </p>
            </div>

            {/* Live Riwayah Toggle inside Trial Card */}
            <div className="inline-flex items-center rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-1 shrink-0 self-start">
              {(['hafs', 'warsh'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  data-testid={`intro-sample-riwayat-${r}`}
                  onClick={() => {
                    triggerHaptic('light');
                    onChangeRiwayat(r);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    riwayat === r
                      ? 'btn-3d-emerald text-white'
                      : 'text-[#5A6B62] dark:text-[#92A59B]'
                  }`}
                >
                  {r === 'hafs' ? t.hafsLabel : t.warshLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Surah Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {INTRO_SAMPLE_VERSES.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                data-testid={`intro-sample-tab-${v.id}`}
                onClick={() => {
                  triggerHaptic('light');
                  setSampleIdx(idx);
                }}
                className={`tactile-press rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  sampleIdx === idx
                    ? 'emerald-3d-hero text-white'
                    : 'surface-3d text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
                }`}
              >
                {lang === 'ar'
                  ? `سورة ${v.surahAr}`
                  : lang === 'fr'
                    ? `${v.surahFr} (${v.surah}:${v.ayah})`
                    : `${v.surahEn} (${v.surah}:${v.ayah})`}
              </button>
            ))}
          </div>

          {/* Live Ayah Display + Real Audio Preview & Jump into Mushaf */}
          <div className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-5 sm:p-6 space-y-4">
            <p
              dir="rtl"
              data-testid="intro-sample-arabic"
              className="font-quran-amiri text-2xl sm:text-3xl leading-[2.1] text-center text-[#142019] dark:text-[#F1F5F3]"
            >
              {riwayat === 'warsh' ? sample.warshAr : sample.hafsAr}
            </p>
            <p className="text-xs sm:text-sm text-center text-[#5A6B62] dark:text-[#92A59B] max-w-xl mx-auto">
              {lang === 'fr' ? sample.fr : sample.en}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                data-testid="intro-play-sample-btn"
                onClick={() => {
                  triggerHaptic('medium');
                  onPlaySampleVerse(sample.surah, sample.ayah);
                }}
                className="btn-3d-emerald tactile-press rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2"
              >
                {isPlayingCurrentSample ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                <span>{isPlayingCurrentSample ? copy.pauseSample : copy.listenSample}</span>
              </button>

              <button
                type="button"
                data-testid="intro-open-mushaf-sample-btn"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenSampleInMushaf(sample.surah, sample.ayah);
                }}
                className="surface-3d surface-3d-interactive tactile-press rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-[#27784C] dark:text-[#52B77F] inline-flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" strokeWidth={1.85} />
                <span>{copy.openInMushaf}</span>
              </button>
            </div>
          </div>
        </section>

        {/* What's Inside: 6 LED Square Cards */}
        <section aria-labelledby="intro-inside-heading" className="space-y-5">
          <div className="space-y-1">
            <h2
              id="intro-inside-heading"
              className="text-xl sm:text-2xl font-bold text-[#142019] dark:text-[#F1F5F3]"
            >
              {copy.insideTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
              {copy.insideSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuresGrid.map((feat) => {
              const Icon = feat.Icon;
              return (
                <div
                  key={feat.id}
                  className="rounded-2xl surface-3d p-5 space-y-3 hover:border-[#27784C]/35 dark:hover:border-[#52B77F]/35 transition-all"
                >
                  <span className="h-12 w-12 rounded-2xl led-icon-tile text-[#27784C] dark:text-[#52B77F] flex items-center justify-center">
                    <Icon className="h-5 w-5" strokeWidth={1.85} />
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3]">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#5A6B62] dark:text-[#92A59B]">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Launch Bar with Quick Preferences */}
        <section className="rounded-3xl surface-3d led-backdrop p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#27784C] dark:text-[#52B77F]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.85} />
              <span>100% Free · Offline-Ready · Zero Ads</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142019] dark:text-[#F1F5F3]">
              {copy.ctaFooterTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
              {copy.ctaFooterDesc}
            </p>

            {/* Quick Language Strip */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]">
                <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{copy.prefsTitle}</span>
              </span>
              {(
                [
                  {id: 'ar' as const, label: 'العربية'},
                  {id: 'en' as const, label: 'English'},
                  {id: 'fr' as const, label: 'Français'},
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onChangeLang(item.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold tactile-press ${
                    lang === item.id
                      ? 'btn-3d-emerald text-white'
                      : 'surface-3d text-[#5A6B62] dark:text-[#92A59B]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenDownloadApk();
              }}
              className="surface-3d surface-3d-interactive tactile-press rounded-2xl px-5 py-3.5 text-sm font-bold text-[#142019] dark:text-[#F1F5F3] inline-flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4 text-[#27784C] dark:text-[#52B77F]" />
              <span>{copy.downloadApkBtn}</span>
            </button>

            <button
              type="button"
              data-testid="intro-bottom-enter-btn"
              onClick={() => {
                triggerHaptic('success');
                onEnterApp();
              }}
              className="btn-3d-emerald led-backdrop tactile-press rounded-2xl px-6 py-3.5 text-sm font-bold text-white inline-flex items-center gap-2"
            >
              <span>{copy.enterAppBtn}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
