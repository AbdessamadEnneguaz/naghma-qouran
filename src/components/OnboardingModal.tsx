import React, {useMemo, useState} from 'react';
import {Check, ChevronRight, Volume2} from 'lucide-react';
import type {Riwayat} from '../types/quran';
import {RECITERS} from '../data/reciters';
import type {AppLang, Translations} from '../i18n/translations';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface OnboardingModalProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  riwayat: Riwayat;
  reciterId: string;
  onChangeLang: (lang: AppLang) => void;
  onChangeRiwayat: (riwayat: Riwayat) => void;
  onChangeReciter: (reciterId: string) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  lang,
  t,
  riwayat,
  reciterId,
  onChangeLang,
  onChangeRiwayat,
  onChangeReciter,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const recommendedReciters = useMemo(() => {
    const filtered = RECITERS.filter((r) => r.riwayat === riwayat);
    return filtered.slice(0, 6);
  }, [riwayat]);

  if (!isOpen) return null;

  const stepTitle =
    step === 1 ? t.onboardingStep1 : step === 2 ? t.onboardingStep2 : t.onboardingStep3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="onboarding-modal"
      aria-label={t.onboardingTitle}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Top Brand + Skip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <NaghmaAppIconImg alt={t.appName} className="h-11 w-11 rounded-xl shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[#121212] dark:text-[#F4F4F5] truncate">
                {t.onboardingTitle}
              </h2>
              <p className="text-xs text-[#6B6A66] dark:text-[#8E8E93] mt-0.5">
                {t.onboardingSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="onboarding-skip-btn"
            onClick={onComplete}
            className="text-xs font-semibold text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#0F5132] dark:hover:text-[#C5A46D] px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0"
          >
            {t.onboardingSkip}
          </button>
        </div>

        {/* 3-Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D]">
            <span>{stepTitle}</span>
            <span className="tabular-nums">{step} / 3</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Step ${idx}`}
                onClick={() => setStep(idx as 1 | 2 | 3)}
                className={`h-1 rounded-full transition-colors ${
                  idx <= step ? 'bg-[#0F5132] dark:bg-[#C5A46D]' : 'bg-[#E6E4DF] dark:bg-[#222226]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-2.5" data-testid="onboarding-step-1">
            {(
              [
                {id: 'ar', primary: 'العربية', secondary: 'واجهة عربية أصيلة من اليمين لليسار'},
                {id: 'en', primary: 'English', secondary: 'Clean English navigation & Sahih translation'},
                {id: 'fr', primary: 'Français', secondary: 'Interface française & traduction Hamidullah'},
              ] as const
            ).map((opt) => {
              const selected = lang === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`onboarding-lang-${opt.id}`}
                  onClick={() => onChangeLang(opt.id)}
                  className={`rounded-xl border p-4 text-start flex items-center justify-between gap-3 transition-colors ${
                    selected
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/12'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]">
                      {opt.primary}
                    </div>
                    <div className="text-xs text-[#6B6A66] dark:text-[#8E8E93] mt-0.5">
                      {opt.secondary}
                    </div>
                  </div>
                  {selected && (
                    <span className="h-6 w-6 rounded-full bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B] flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-2.5" data-testid="onboarding-step-2">
            {(
              [
                {
                  id: 'hafs',
                  title: t.hafsLabel,
                  subAr: 'رواية حفص عن عاصم · مصحف المدينة',
                  subFr: 'Lecture la plus répandue dans le monde avec récitateurs Tajwid',
                  subEn: 'Most widely read narration worldwide with Tajweed reciters',
                },
                {
                  id: 'warsh',
                  title: t.warshLabel,
                  subAr: 'رواية ورش عن نافع من طريق الأزرق',
                  subFr: 'Lecture maghrébine authentique avec Omar Al-Qazabri & Laayoune Al-Kouchi',
                  subEn: 'Beloved Maghrebi narration with Omar Al-Qazabri & Laayoune Al-Kouchi',
                },
              ] as const
            ).map((opt) => {
              const selected = riwayat === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`onboarding-riwayat-${opt.id}`}
                  onClick={() => {
                    onChangeRiwayat(opt.id);
                    const match = RECITERS.find((r) => r.riwayat === opt.id);
                    if (match) onChangeReciter(match.id);
                  }}
                  className={`rounded-xl border p-4 text-start flex items-center justify-between gap-3 transition-colors ${
                    selected
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/12'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]">
                      {opt.title}
                    </div>
                    <div className="text-xs text-[#6B6A66] dark:text-[#8E8E93]">
                      {lang === 'ar' ? opt.subAr : lang === 'fr' ? opt.subFr : opt.subEn}
                    </div>
                  </div>
                  {selected && (
                    <span className="h-6 w-6 rounded-full bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B] flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pe-1"
            data-testid="onboarding-step-3"
          >
            {recommendedReciters.map((r) => {
              const selected = reciterId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  data-testid={`onboarding-reciter-${r.id}`}
                  onClick={() => onChangeReciter(r.id)}
                  className={`rounded-xl border p-3 text-start flex items-center justify-between gap-2.5 transition-colors ${
                    selected
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/12'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#121212] dark:text-[#F4F4F5] truncate">
                      {lang === 'ar' ? r.nameAr : r.nameEn}
                    </div>
                    <div className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93] truncate">
                      {lang === 'ar' ? r.nameEn : r.nameAr}
                    </div>
                  </div>
                  <Volume2
                    strokeWidth={1.5}
                    className={`h-4 w-4 shrink-0 ${
                      selected
                        ? 'text-[#0F5132] dark:text-[#C5A46D]'
                        : 'text-[#6B6A66]/60 dark:text-[#8E8E93]/60'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : 1))}
              className="rounded-xl border border-[#E6E4DF] dark:border-[#222226] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#6B6A66] dark:text-[#8E8E93]"
            >
              {t.prevWord}
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              data-testid="onboarding-next-btn"
              onClick={() => setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : 3))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] hover:opacity-90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#09090B] transition-opacity"
            >
              <span>{t.onboardingNext}</span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              data-testid="onboarding-start-btn"
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F5132] dark:bg-[#C5A46D] hover:opacity-90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#09090B] transition-opacity"
            >
              <Check className="h-4 w-4" strokeWidth={1.5} />
              <span>{t.onboardingStart}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
