import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {ADHKAR_ITEMS, getDefaultAdhkarPeriod} from '../data/adhkarData';
import type {AdhkarCategory} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import {getLocalDateISO} from '../utils/khatmaLogic';
import {loadAdhkarProgress, saveAdhkarProgress} from '../services/indexedDbVault';
import {AdhkarCrescentSvg} from './OrnamentalSvg';

interface AdhkarPageProps {
  lang: AppLang;
  t: Translations;
}

export const AdhkarPage: React.FC<AdhkarPageProps> = ({lang, t}) => {
  const [category, setCategory] = useState<AdhkarCategory>(() => getDefaultAdhkarPeriod());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const advanceTimerRef = useRef<number | null>(null);
  const dateISO = getLocalDateISO();

  useEffect(() => {
    void loadAdhkarProgress(dateISO).then((saved) => {
      setCounts(saved);
    });
  }, [dateISO]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const items = useMemo(
    () => ADHKAR_ITEMS.filter((item) => item.category === category),
    [category]
  );

  const safeIdx = Math.min(activeIdx, Math.max(0, items.length - 1));
  const currentItem = items[safeIdx];

  const completedInCategory = useMemo(
    () => items.filter((item) => (counts[item.id] || 0) >= item.targetCount).length,
    [items, counts]
  );

  if (!currentItem) return null;

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const currentCount = counts[currentItem.id] || 0;
  const isDone = currentCount >= currentItem.targetCount;
  const progressRatio = Math.min(1, currentCount / Math.max(1, currentItem.targetCount));
  const ringRadius = 38;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - progressRatio);

  const handleCategorySwitch = (nextCat: AdhkarCategory) => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCategory(nextCat);
    const nextList = ADHKAR_ITEMS.filter((i) => i.category === nextCat);
    const firstPending = nextList.findIndex((i) => (counts[i.id] || 0) < i.targetCount);
    setActiveIdx(firstPending >= 0 ? firstPending : 0);
  };

  const handleTapDhikr = () => {
    if (isDone) {
      if (safeIdx < items.length - 1) setActiveIdx(safeIdx + 1);
      return;
    }

    const nextCount = Math.min(currentItem.targetCount, currentCount + 1);
    const nextCounts = {...counts, [currentItem.id]: nextCount};
    setCounts(nextCounts);
    void saveAdhkarProgress(dateISO, nextCounts);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(nextCount >= currentItem.targetCount ? [18, 30, 18] : 14);
      } catch {
        // ignore vibration restriction
      }
    }

    if (nextCount >= currentItem.targetCount && safeIdx < items.length - 1) {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = window.setTimeout(() => {
        setActiveIdx((prev) => Math.min(items.length - 1, prev + 1));
      }, 280);
    }
  };

  const handleResetCategory = () => {
    const nextCounts = {...counts};
    for (const item of items) {
      delete nextCounts[item.id];
    }
    setCounts(nextCounts);
    void saveAdhkarProgress(dateISO, nextCounts);
    setActiveIdx(0);
  };

  const categories: Array<{id: AdhkarCategory; label: string}> = [
    {id: 'sabah', label: t.adhkarSabah},
    {id: 'masaa', label: t.adhkarMasaa},
    {id: 'postPrayer', label: t.adhkarPostPrayer},
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl border border-amber-500/20 bg-white/80 dark:bg-[#211914] flex items-center justify-center shrink-0 shadow-sm">
            <AdhkarCrescentSvg className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D231E] dark:text-[#FAF5EE]">
              {t.adhkarTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
              {numFmt(completedInCategory)} / {numFmt(items.length)} {t.completedWord} ·{' '}
              {t.tapToCountHint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-amber-500/12 dark:bg-[#211914] border border-amber-500/15">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySwitch(cat.id)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-[#D97706] text-white shadow-sm'
                    : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetCategory}
            title={t.resetAdhkarBtn}
            aria-label={t.resetAdhkarBtn}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full border border-amber-500/20 bg-white/80 dark:bg-[#211914] text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#D97706] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-4">
          <button
            type="button"
            data-testid="adhkar-tap-card"
            onClick={handleTapDhikr}
            className={`w-full text-start rounded-3xl border p-5 sm:p-8 transition-all active:scale-[0.99] space-y-6 cursor-pointer select-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] ${
              isDone
                ? 'border-[#D97706]/45 bg-amber-500/12'
                : 'border-amber-500/15 bg-white/80 dark:bg-[#211914]/90 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
              <span>{lang === 'ar' ? currentItem.titleAr : currentItem.titleEn}</span>
              <span>
                {numFmt(safeIdx + 1)} / {numFmt(items.length)}
              </span>
            </div>

            <p
              dir="rtl"
              className="font-quran-amiri text-2xl sm:text-[32px] leading-[2.25] tracking-normal text-[#2D231E] dark:text-[#FAF5EE] text-right whitespace-pre-line"
            >
              {currentItem.arabic}
            </p>

            {lang === 'en' && (
              <div className="space-y-1.5 border-t border-amber-500/12 pt-3.5">
                <p className="text-xs italic text-[#B45309] dark:text-[#FBBF24]/90">
                  {currentItem.transliteration}
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8]">
                  {currentItem.translation}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-amber-500/12">
              <div className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] space-y-1 min-w-0">
                <div className="font-semibold text-[#D97706] dark:text-[#FBBF24]">
                  {lang === 'ar' ? currentItem.virtueAr : currentItem.virtueEn}
                </div>
                <div>{isDone ? t.dhikrCompletedHint : t.tapToCountHint}</div>
              </div>

              <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90" aria-hidden="true">
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6.5"
                    className="text-amber-500/18"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    fill="none"
                    stroke={isDone ? '#F97316' : '#D97706'}
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeDasharray={ringCirc}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-200"
                  />
                </svg>
                <div
                  data-testid="adhkar-counter-value"
                  className="absolute inset-0 flex flex-col items-center justify-center tabular-nums"
                >
                  <span className="text-lg font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                    {numFmt(currentCount)}
                  </span>
                  <span className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8]">
                    / {numFmt(currentItem.targetCount)}
                  </span>
                </div>
              </div>
            </div>
          </button>

          <div dir="ltr" className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={safeIdx === 0}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-white/80 dark:bg-[#211914] px-4 py-2 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t.prevWord}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
              <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
              <span>
                {completedInCategory === items.length
                  ? t.allAdhkarDone
                  : `${numFmt(completedInCategory)} / ${numFmt(items.length)}`}
              </span>
            </span>

            <button
              type="button"
              disabled={safeIdx >= items.length - 1}
              onClick={() => setActiveIdx((i) => Math.min(items.length - 1, i + 1))}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-white/80 dark:bg-[#211914] px-4 py-2 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] disabled:opacity-35"
            >
              <span>{t.nextWord}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl border border-amber-500/14 bg-white/75 dark:bg-[#211914]/85 p-3.5 space-y-2 shadow-sm">
          {items.map((item, idx) => {
            const c = counts[item.id] || 0;
            const itemDone = c >= item.targetCount;
            const isSelected = idx === safeIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`w-full text-start rounded-2xl px-3.5 py-2.5 border transition-colors flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'border-[#D97706] bg-amber-500/12 text-[#2D231E] dark:text-[#FAF5EE]'
                    : 'border-transparent hover:bg-amber-500/[0.06] text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate text-[#2D231E] dark:text-[#FAF5EE]">
                    {numFmt(idx + 1)}. {lang === 'ar' ? item.titleAr : item.titleEn}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs tabular-nums">
                  {itemDone && <CheckCircle2 className="h-3.5 w-3.5 text-[#D97706]" />}
                  <span className={itemDone ? 'text-[#B45309] dark:text-[#FBBF24] font-semibold' : ''}>
                    {numFmt(c)}/{numFmt(item.targetCount)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
