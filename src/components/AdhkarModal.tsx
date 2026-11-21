import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {ADHKAR_ITEMS, getDefaultAdhkarPeriod} from '../data/adhkarData';
import type {AdhkarCategory} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import {getLocalDateISO} from '../utils/khatmaLogic';
import {
  loadAdhkarProgress,
  saveAdhkarProgress,
} from '../services/indexedDbVault';

interface AdhkarModalProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  onClose: () => void;
}

export const AdhkarModal: React.FC<AdhkarModalProps> = ({
  isOpen,
  lang,
  t,
  onClose,
}) => {
  const [category, setCategory] = useState<AdhkarCategory>(() =>
    getDefaultAdhkarPeriod()
  );
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

  if (!isOpen || !currentItem) return null;

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const currentCount = counts[currentItem.id] || 0;
  const isDone = currentCount >= currentItem.targetCount;
  const progressRatio = Math.min(1, currentCount / Math.max(1, currentItem.targetCount));
  const ringRadius = 32;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - progressRatio);

  const handleCategorySwitch = (nextCat: AdhkarCategory) => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCategory(nextCat);
    const nextList = ADHKAR_ITEMS.filter((i) => i.category === nextCat);
    const firstPending = nextList.findIndex(
      (i) => (counts[i.id] || 0) < i.targetCount
    );
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.adhkarTitle}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#B4891B]/30 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#11171D] p-4 sm:p-7 shadow-2xl space-y-5">
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-[#B4891B]/15 dark:border-white/10 pb-3.5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F4F1EA]">
              {t.adhkarTitle}
            </h2>
            <p className="text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
              {numFmt(completedInCategory)} / {numFmt(items.length)} {t.completedWord}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCategory}
              title={t.resetAdhkarBtn}
              aria-label={t.resetAdhkarBtn}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#B4891B]/20 dark:border-white/12 text-[#57534E] dark:text-[#9CA3AF] hover:text-[#10B981]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#B4891B]/20 dark:border-white/12 text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Category Segmented Switch */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F3ECE0] dark:bg-[#0B0E11] border border-[#B4891B]/15 dark:border-white/8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySwitch(cat.id)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap truncate transition-colors ${
                category === cat.id
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#0B0E11]'
                  : 'text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interactive Tap-Anywhere Dhikr & Circular Tasbih Card */}
        <button
          type="button"
          data-testid="adhkar-tap-card"
          onClick={handleTapDhikr}
          className={`w-full text-start rounded-2xl border p-5 sm:p-6 transition-all active:scale-[0.99] space-y-5 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
            isDone
              ? 'border-[#10B981]/50 bg-[#10B981]/10'
              : 'border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#F3ECE0]/70 dark:bg-[#0B0E11]/75 hover:border-[#10B981]/50'
          }`}
        >
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
            <span>
              {lang === 'ar' ? currentItem.titleAr : currentItem.titleEn}
            </span>
            <span>
              {numFmt(safeIdx + 1)} / {numFmt(items.length)}
            </span>
          </div>

          <p
            dir="rtl"
            className="font-quran-amiri text-2xl sm:text-[28px] leading-[2.2] tracking-normal text-[#1C1917] dark:text-[#F4F1EA] text-right whitespace-pre-line"
          >
            {currentItem.arabic}
          </p>

          {lang === 'en' && (
            <div className="space-y-1.5 border-t border-[#B4891B]/12 dark:border-white/8 pt-3">
              <p className="text-xs italic text-[#B4891B] dark:text-[#D4AF37]/90">
                {currentItem.transliteration}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[#57534E] dark:text-[#D6D3C9]">
                {currentItem.translation}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#B4891B]/12 dark:border-white/8">
            <div className="text-xs text-[#57534E] dark:text-[#9CA3AF] space-y-0.5 min-w-0">
              <div className="font-medium text-[#059669] dark:text-[#34D399]">
                {lang === 'ar' ? currentItem.virtueAr : currentItem.virtueEn}
              </div>
              <div>{isDone ? t.dhikrCompletedHint : t.tapToCountHint}</div>
            </div>

            {/* Animated SVG Circular Tasbih Counter */}
            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-[#B4891B]/20 dark:text-white/12"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke={isDone ? '#10B981' : '#D4AF37'}
                  strokeWidth="6"
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
                <span className="text-base font-bold text-[#1C1917] dark:text-[#F4F1EA]">
                  {numFmt(currentCount)}
                </span>
                <span className="text-[10px] text-[#57534E] dark:text-[#9CA3AF]">
                  / {numFmt(currentItem.targetCount)}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Bottom Prev / Dots / Next Stepper */}
        <div dir="ltr" className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={safeIdx === 0}
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-[#B4891B]/25 dark:border-white/12 px-3.5 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t.prevWord}</span>
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>
              {completedInCategory === items.length
                ? t.allAdhkarDone
                : `${numFmt(completedInCategory)}/${numFmt(items.length)}`}
            </span>
          </span>

          <button
            type="button"
            disabled={safeIdx >= items.length - 1}
            onClick={() => setActiveIdx((i) => Math.min(items.length - 1, i + 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-[#B4891B]/25 dark:border-white/12 px-3.5 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] disabled:opacity-35"
          >
            <span>{t.nextWord}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
