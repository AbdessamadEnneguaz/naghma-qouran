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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E4DF] dark:border-[#222226] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#121212] dark:text-[#F4F4F5]">
              {isAr ? 'سياسة الخصوصية — مِحْرَاب النُّور' : 'Privacy Policy — Mihrab Noor'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6A66] dark:text-[#8E8E93] mt-0.5 tabular-nums">
              {isAr
                ? 'آخر تحديث: نوفمبر ٢٠٢٦ · تطبيق قرآني يحفظ خصوصيتك ويعمل محلياً دون اتصال'
                : 'Last Updated: November 2026 · Local-first, privacy-respecting Holy Quran web & Android app'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] px-4 py-2 text-xs font-semibold text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors whitespace-nowrap"
        >
          {isAr ? (
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          <span>{t.navHome}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. Local-First Data Storage */}
        <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-6 space-y-2">
          <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {isAr
              ? '١. التخزين المحلي وحماية البيانات (IndexedDB & LocalStorage)'
              : '1. Local-First Storage & Data Collection'}
          </h2>
          <p className="text-sm leading-relaxed text-[#6B6A66] dark:text-[#A1A1AA]">
            {isAr
              ? 'صُمم تطبيق مِحْرَاب النُّور (Mihrab Noor) ليعمل محلياً بالكامل دون الحاجة إلى تسجيل حساب أو إرسال بياناتك الشخصية إلى أي خادم خارجي. يتم حفظ نصوص المصحف الشريف، والإشارات المرجعية، وآخر موضع قراءة، وتقدم الختمة والأذكار، والتلاوات الصوتية المُحمّلة محلياً داخل متصفحك أو جهازك عبر قاعدة بيانات IndexedDB (najm_quran_db) وLocalStorage.'
              : 'Mihrab Noor is engineered as a local-first application that requires no user registration and collects no personal profile data on private servers. Quranic texts, bookmarks, last-read position, Khatma progress, Adhkar counters, reader preferences, and optional offline Surah audio recordings remain stored directly on your device inside IndexedDB (najm_quran_db) and LocalStorage.'}
          </p>
        </section>

        {/* 2. Optional Device Permissions (GPS & Compass) */}
        <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-6 space-y-2">
          <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {isAr
              ? '٢. أذونات الموقع وبوصلة القبلة ومواقيت الصلاة'
              : '2. Optional On-Device Location & Sensor Permissions'}
          </h2>
          <p className="text-sm leading-relaxed text-[#6B6A66] dark:text-[#A1A1AA]">
            {isAr
              ? 'عند اختيارك تفعيل تحديد الموقع الجغرافي (GPS) أو مستشعر الاتجاه في صفحة بوصلة القبلة أو حساب مواقيت الصلاة، تُجرى جميع الحسابات الفلكية محلياً على جهازك فقط لحساب زاوية القبلة وأوقات الصلاة بدقة، ولا يتم إرسال إحداثياتك أو تخزينها لدى أي طرف.'
              : 'If you optionally grant GPS location or device orientation access inside the Qibla Finder or Prayer Times features, your coordinates are used exclusively for local on-device astronomical calculations and compass bearing rendering. Your coordinates are never transmitted to or stored on external tracking servers.'}
          </p>
        </section>

        {/* 3. Google AdSense & Advertising Cookies */}
        <section
          data-testid="privacy-adsense-section"
          className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-6 space-y-3"
        >
          <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {isAr
              ? '٣. الإعلانات وملفات تعريف الارتباط (Google AdSense)'
              : '3. Advertising & Third-Party Cookies (Google AdSense)'}
          </h2>
          <p className="text-sm leading-relaxed text-[#6B6A66] dark:text-[#A1A1AA]">
            {isAr
              ? 'للمساعدة في تغطية تكاليف الخوادم وإبقاء تطبيق مِحْرَاب النُّور مجانياً للجميع، قد يعرض الموقع إعلانات عبر خدمة Google AdSense. تستخدم Google وبائعو الإعلانات التابعون لجهات خارجية ملفات تعريف الارتباط (بما في ذلك ملف تعريف ارتباط DART وإعلانات Google المخصصة) لعرض إعلانات ملائمة استناداً إلى زياراتك السابقة لهذا الموقع أو مواقع أخرى على شبكة الإنترنت.'
              : 'To sustain hosting and keep Mihrab Noor freely accessible, we may display advertisements served by Google AdSense. Third-party vendors, including Google, use cookies (such as the Google DoubleClick DART cookie) to serve ads based on a user’s prior visits to this website or other websites on the Internet.'}
          </p>
          <p className="text-sm leading-relaxed text-[#6B6A66] dark:text-[#A1A1AA]">
            {isAr
              ? 'يمكنك في أي وقت إلغاء الاشتراك في الإعلانات المخصصة وإدارة تفضيلات ملفات تعريف الارتباط الإعلانية لـ Google عبر صفحة إعدادات إعلانات Google الرسمية:'
              : 'Users may opt out of personalized advertising and manage Google AdSense DART cookie preferences at any time by visiting Google Ads Settings:'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] px-4 py-2 text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] hover:border-[#0F5132] dark:hover:border-[#C5A46D] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>https://adssettings.google.com</span>
            </a>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#0F5132] dark:hover:text-[#C5A46D] underline underline-offset-4"
            >
              <span>
                {isAr ? 'سياسة إعلانات وتقنيات Google' : 'Google Advertising Technologies Policy'}
              </span>
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            </a>
          </div>
        </section>

        {/* 4. Audio Streaming CDN & Offline Reading */}
        <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-6 space-y-2">
          <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {isAr
              ? '٤. خوادم التلاوات الصوتية والميكروفون'
              : '4. Recitation Streams & Optional Microphone'}
          </h2>
          <p className="text-sm leading-relaxed text-[#6B6A66] dark:text-[#A1A1AA]">
            {isAr
              ? 'عند تشغيل التلاوة الصوتية دون تحميل مسبق، يتم جلب ملفات MP3 من خوادم التلاوة القرآنية العامة (مثل MP3Quran وEveryAyah وQuran.com). كما أن ميزة التسميع الصوتي بالمايكروفون لا تعمل إلا عند ضغطك المباشر عليها ووفق أذونات متصفحك.'
              : 'Streaming un-cached recitations requests public Quran MP3 streams and timestamp metadata directly from established Quran audio CDNs (such as MP3Quran, EveryAyah, and Quran.com). Voice recitation matching runs solely when explicitly started by you and honors standard browser microphone permissions.'}
          </p>
        </section>

        {/* 5. Developer & Contact Attribution */}
        <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-6 space-y-3">
          <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
            {isAr ? '٥. المطوّر ومعلومات التواصل' : '5. Developer Attribution & Contact'}
          </h2>
          <div className="text-sm text-[#6B6A66] dark:text-[#A1A1AA] space-y-1.5">
            <p className="font-semibold text-[#121212] dark:text-[#F4F4F5]">
              {isAr
                ? 'تصميم وتطوير: عبد الصمد النكاز (Abdessamad Enneguaz)'
                : 'Crafted & Developed by Abdessamad Enneguaz (عبد الصمد النكاز)'}
            </p>
            <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
              © 2026 Mihrab Noor (مِحْرَاب النُّور). Crafted &amp; Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد
            </p>
          </div>
          <a
            href="mailto:enneguazabdo259@gmail.com"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] hover:opacity-90 px-5 py-2.5 text-xs font-semibold text-white dark:text-[#09090B] transition-opacity"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>enneguazabdo259@gmail.com</span>
          </a>
        </section>
      </div>
    </div>
  );
};
