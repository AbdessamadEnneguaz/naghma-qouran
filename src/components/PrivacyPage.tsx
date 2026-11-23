import React from 'react';
import {ArrowLeft, ArrowRight, ExternalLink, Mail, ShieldCheck} from 'lucide-react';
import type {AppLang, Translations} from '../i18n/translations';

interface PrivacyPageProps {
  lang: AppLang;
  t: Translations;
  onBackHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({lang, t, onBackHome}) => {
  const isAr = lang === 'ar';

  return (
    <div
      data-testid="privacy-page"
      className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 sm:pt-10 pb-8 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/14 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D231E] dark:text-[#FAF5EE]">
              {isAr ? 'سياسة الخصوصية — نَجم القرآن' : 'Privacy Policy — Najm Quran'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] mt-0.5 tabular-nums">
              {isAr
                ? 'آخر تحديث: نوفمبر ٢٠٢٦ · تطبيق قرآني يحفظ خصوصيتك ويعمل محلياً دون اتصال'
                : 'Last Updated: November 2026 · Local-first, privacy-respecting Holy Quran web & Android app'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-white/80 dark:bg-[#221914] px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] transition-colors whitespace-nowrap"
        >
          {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
          <span>{t.navHome}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. Local-First Data Storage */}
        <section className="rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#211914]/90 p-5 sm:p-6 shadow-sm space-y-2">
          <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {isAr
              ? '١. التخزين المحلي وحماية البيانات (IndexedDB & LocalStorage)'
              : '1. Local-First Storage & Data Collection'}
          </h2>
          <p className="text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
            {isAr
              ? 'صُمم تطبيق نَجم القرآن (Najm Quran) ليعمل محلياً بالكامل دون الحاجة إلى تسجيل حساب أو إرسال بياناتك الشخصية إلى أي خادم خارجي. يتم حفظ نصوص المصحف الشريف، والإشارات المرجعية، وآخر موضع قراءة، وتقدم الختمة والأذكار، والتلاوات الصوتية المُحمّلة محلياً داخل متصفحك أو جهازك عبر قاعدة بيانات IndexedDB (najm_quran_db) وLocalStorage.'
              : 'Najm Quran is engineered as a local-first application that requires no user registration and collects no personal profile data on private servers. Quranic texts, bookmarks, last-read position, Khatma progress, Adhkar counters, reader preferences, and optional offline Surah audio recordings remain stored directly on your device inside IndexedDB (najm_quran_db) and LocalStorage.'}
          </p>
        </section>

        {/* 2. Optional Device Permissions (GPS & Compass) */}
        <section className="rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#211914]/90 p-5 sm:p-6 shadow-sm space-y-2">
          <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {isAr
              ? '٢. أذونات الموقع وبوصلة القبلة ومواقيت الصلاة'
              : '2. Optional On-Device Location & Sensor Permissions'}
          </h2>
          <p className="text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
            {isAr
              ? 'عند اختيارك تفعيل تحديد الموقع الجغرافي (GPS) أو مستشعر الاتجاه في صفحة بوصلة القبلة أو حساب مواقيت الصلاة، تُجرى جميع الحسابات الفلكية محلياً على جهازك فقط لحساب زاوية القبلة وأوقات الصلاة بدقة، ولا يتم إرسال إحداثياتك أو تخزينها لدى أي طرف.'
              : 'If you optionally grant GPS location or device orientation access inside the Qibla Finder or Prayer Times features, your coordinates are used exclusively for local on-device astronomical calculations and compass bearing rendering. Your coordinates are never transmitted to or stored on external tracking servers.'}
          </p>
        </section>

        {/* 3. Google AdSense & Advertising Cookies */}
        <section
          data-testid="privacy-adsense-section"
          className="rounded-3xl border border-amber-500/20 bg-white/85 dark:bg-[#211914]/90 p-5 sm:p-6 shadow-sm space-y-3"
        >
          <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {isAr
              ? '٣. الإعلانات وملفات تعريف الارتباط (Google AdSense)'
              : '3. Advertising & Third-Party Cookies (Google AdSense)'}
          </h2>
          <p className="text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
            {isAr
              ? 'للمساعدة في تغطية تكاليف الخوادم وإبقاء تطبيق نَجم القرآن مجانياً للجميع، قد يعرض الموقع إعلانات عبر خدمة Google AdSense. تستخدم Google وبائعو الإعلانات التابعون لجهات خارجية ملفات تعريف الارتباط (بما في ذلك ملف تعريف ارتباط DART وإعلانات Google المخصصة) لعرض إعلانات ملائمة استناداً إلى زياراتك السابقة لهذا الموقع أو مواقع أخرى على شبكة الإنترنت.'
              : 'To sustain hosting and keep Najm Quran freely accessible, we may display advertisements served by Google AdSense. Third-party vendors, including Google, use cookies (such as the Google DoubleClick DART cookie) to serve ads based on a user’s prior visits to this website or other websites on the Internet.'}
          </p>
          <p className="text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
            {isAr
              ? 'يمكنك في أي وقت إلغاء الاشتراك في الإعلانات المخصصة وإدارة تفضيلات ملفات تعريف الارتباط الإعلانية لـ Google عبر صفحة إعدادات إعلانات Google الرسمية:'
              : 'Users may opt out of personalized advertising and manage Google AdSense DART cookie preferences at any time by visiting Google Ads Settings:'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/18 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>https://adssettings.google.com</span>
            </a>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#D97706] underline underline-offset-4"
            >
              <span>
                {isAr ? 'سياسة إعلانات وتقنيات Google' : 'Google Advertising Technologies Policy'}
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        {/* 4. Audio Streaming CDN & Offline Reading */}
        <section className="rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#211914]/90 p-5 sm:p-6 shadow-sm space-y-2">
          <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {isAr
              ? '٤. خوادم التلاوات الصوتية والميكروفون'
              : '4. Recitation Streams & Optional Microphone'}
          </h2>
          <p className="text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
            {isAr
              ? 'عند تشغيل التلاوة الصوتية دون تحميل مسبق، يتم جلب ملفات MP3 من خوادم التلاوة القرآنية العامة (مثل MP3Quran وEveryAyah وQuran.com). كما أن ميزة التسميع الصوتي بالمايكروفون لا تعمل إلا عند ضغطك المباشر عليها ووفق أذونات متصفحك.'
              : 'Streaming un-cached recitations requests public Quran MP3 streams and timestamp metadata directly from established Quran audio CDNs (such as MP3Quran, EveryAyah, and Quran.com). Voice recitation matching runs solely when explicitly started by you and honors standard browser microphone permissions.'}
          </p>
        </section>

        {/* 5. Developer & Contact Attribution */}
        <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-white/85 to-orange-400/[0.06] dark:from-amber-500/12 dark:via-[#211914] dark:to-[#1B1410] p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
            {isAr ? '٥. المطوّر ومعلومات التواصل' : '5. Developer Attribution & Contact'}
          </h2>
          <div className="text-sm text-[#4E3629] dark:text-[#D6C7B8] space-y-1.5">
            <p className="font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
              {isAr
                ? 'تصميم وتطوير: عبد الصمد النكاز (Abdessamad Enneguaz)'
                : 'Crafted & Developed by Abdessamad Enneguaz (عبد الصمد النكاز)'}
            </p>
            <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
              {isAr
                ? '© ٢٠٢٦ نَجم القرآن (Najm Quran). جميع الحقوق محفوظة.'
                : '© 2026 Najm Quran (نَجم القرآن). All Rights Reserved.'}
            </p>
          </div>
          <a
            href="mailto:enneguazabdo259@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-[#D97706] hover:bg-[#B45309] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>enneguazabdo259@gmail.com</span>
          </a>
        </section>
      </div>
    </div>
  );
};
