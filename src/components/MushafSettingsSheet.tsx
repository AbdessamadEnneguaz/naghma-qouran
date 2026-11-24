import React, {useCallback, useEffect, useRef} from 'react';
import {BookOpen, Minus, Moon, Plus, Sun, Type, Volume2, X} from 'lucide-react';
import type {ReaderSettings} from '../types/quran';
import {RECITERS} from '../data/reciters';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import {computeSheetDragOffset, evaluateSwipeDismiss} from '../utils/swipeSheetLogic';

interface MushafSettingsSheetProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  settings: ReaderSettings;
  onUpdateSettings: (patch: Partial<ReaderSettings>) => void;
  onClose: () => void;
}

const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 38;

export const MushafSettingsSheet: React.FC<MushafSettingsSheetProps> = ({
  isOpen,
  lang,
  t,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startY: number;
    startTimeMs: number;
    offsetY: number;
  }>({
    active: false,
    startY: 0,
    startTimeMs: 0,
    offsetY: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.style.transition = '';
      sheetRef.current.style.transform = '';
      dragStateRef.current.active = false;
      dragStateRef.current.offsetY = 0;
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select')) return;
    dragStateRef.current = {
      active: true,
      startY: e.clientY,
      startTimeMs: performance.now(),
      offsetY: 0,
    };
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore unsupported capture
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active || !sheetRef.current) return;
    const rawDelta = e.clientY - dragStateRef.current.startY;
    const clamped = computeSheetDragOffset(rawDelta);
    dragStateRef.current.offsetY = clamped;
    sheetRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
  }, []);

  const finishDrag = useCallback(() => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    const elapsedMs = performance.now() - dragStateRef.current.startTimeMs;
    const result = evaluateSwipeDismiss(dragStateRef.current.offsetY, elapsedMs);
    dragStateRef.current.offsetY = 0;

    if (result.shouldDismiss) {
      onClose();
      return;
    }

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
      sheetRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  }, [onClose]);

  if (!isOpen) return null;

  const hafsReciters = RECITERS.filter((r) => r.riwayat === 'hafs');
  const warshReciters = RECITERS.filter((r) => r.riwayat === 'warsh');
  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.quickSettingsTitle}
      data-testid="mushaf-settings-sheet"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-6"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl md:rounded-3xl border border-amber-500/22 bg-[#FDFBF7] dark:bg-[#1B1410] pb-safe-bottom shadow-2xl overflow-hidden will-change-transform"
      >
        {/* Top Drag Handle Zone — Finger Swipe-Down to Dismiss */}
        <div
          data-testid="settings-drag-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className="touch-none select-none cursor-grab active:cursor-grabbing px-5 pt-3 pb-3.5 border-b border-amber-500/12"
        >
          <div className="w-14 h-1.5 rounded-full bg-amber-600/35 dark:bg-amber-400/35 mx-auto mb-2.5" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.quickSettingsTitle}
              </h2>
              <p className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8]">
                {t.swipeDownToCloseHint}
              </p>
            </div>
            <button
              type="button"
              data-testid="settings-close-btn"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 4 Oversized, Crystal-Clear Reader Controls */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* 1. Font Size (- / + large tactile controls) */}
          <div className="min-h-[60px] rounded-2xl border border-amber-500/16 bg-white/85 dark:bg-[#241B15] px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-11 w-11 rounded-2xl bg-amber-500/14 text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                <Type className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] truncate">
                  {t.fontSizeLabel}
                </div>
                <div
                  data-testid="settings-font-size-value"
                  className="text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums"
                >
                  {numFmt(settings.fontSize)} px
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="settings-font-decrease"
                aria-label="Decrease font size"
                disabled={settings.fontSize <= MIN_FONT_SIZE}
                onClick={() =>
                  onUpdateSettings({
                    fontSize: Math.max(MIN_FONT_SIZE, settings.fontSize - 2),
                  })
                }
                className="min-h-[48px] min-w-[48px] rounded-2xl border border-amber-500/25 bg-[#FAF5EE] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] disabled:opacity-35 flex items-center justify-center transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                data-testid="settings-font-increase"
                aria-label="Increase font size"
                disabled={settings.fontSize >= MAX_FONT_SIZE}
                onClick={() =>
                  onUpdateSettings({
                    fontSize: Math.min(MAX_FONT_SIZE, settings.fontSize + 2),
                  })
                }
                className="min-h-[48px] min-w-[48px] rounded-2xl border border-amber-500/25 bg-[#FAF5EE] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] disabled:opacity-35 flex items-center justify-center transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2. Riwayah (حفص / ورش) Big Toggle */}
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                {
                  id: 'hafs' as const,
                  titleAr: 'حفص',
                  titleEn: 'Hafs',
                },
                {
                  id: 'warsh' as const,
                  titleAr: 'ورش',
                  titleEn: 'Warsh',
                },
              ]
            ).map((opt) => {
              const active = settings.riwayat === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`settings-riwayat-${opt.id}`}
                  onClick={() => onUpdateSettings({riwayat: opt.id})}
                  className={`min-h-[60px] rounded-2xl border px-3.5 py-2.5 flex items-center gap-3 text-start transition-colors ${
                    active
                      ? 'border-[#D97706] bg-amber-500/15 text-[#92400E] dark:text-[#FBBF24]'
                      : 'border-amber-500/16 bg-white/85 dark:bg-[#241B15] text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706]/50'
                  }`}
                >
                  <span
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active
                        ? 'bg-[#D97706] text-white'
                        : 'bg-amber-500/12 text-[#B45309] dark:text-[#FBBF24]'
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-quran-scheherazade text-lg font-bold leading-tight">
                      {opt.titleAr}
                    </div>
                    <div className="text-[11px] font-semibold opacity-80">{opt.titleEn}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. Theme (نهاري دافئ / ليلي مريح) Big Toggle */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              data-testid="settings-theme-light"
              onClick={() => onUpdateSettings({theme: 'light'})}
              className={`min-h-[60px] rounded-2xl border px-3 py-2.5 flex items-center gap-2.5 text-start transition-colors ${
                settings.theme === 'light'
                  ? 'border-[#D97706] bg-amber-500/15 text-[#92400E] dark:text-[#FBBF24]'
                  : 'border-amber-500/16 bg-white/85 dark:bg-[#241B15] text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706]/50'
              }`}
            >
              <span
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'light'
                    ? 'bg-[#D97706] text-white'
                    : 'bg-amber-500/12 text-[#B45309] dark:text-[#FBBF24]'
                }`}
              >
                <Sun className="h-5 w-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold leading-tight">{t.themeWarmDay}</span>
            </button>

            <button
              type="button"
              data-testid="settings-theme-dark"
              onClick={() => onUpdateSettings({theme: 'dark'})}
              className={`min-h-[60px] rounded-2xl border px-3 py-2.5 flex items-center gap-2.5 text-start transition-colors ${
                settings.theme === 'dark'
                  ? 'border-[#D97706] bg-amber-500/15 text-[#92400E] dark:text-[#FBBF24]'
                  : 'border-amber-500/16 bg-white/85 dark:bg-[#241B15] text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706]/50'
              }`}
            >
              <span
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'dark'
                    ? 'bg-[#D97706] text-white'
                    : 'bg-amber-500/12 text-[#B45309] dark:text-[#FBBF24]'
                }`}
              >
                <Moon className="h-5 w-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold leading-tight">
                {t.themeNightComfort}
              </span>
            </button>
          </div>

          {/* 4. Reciter (1-Tap Prominent Selector) */}
          <label
            htmlFor="quick-settings-reciter"
            className="min-h-[60px] rounded-2xl border border-amber-500/16 bg-white/85 dark:bg-[#241B15] px-4 py-2.5 flex items-center gap-3 cursor-pointer"
          >
            <span className="h-11 w-11 rounded-2xl bg-amber-500/14 text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
              <Volume2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                {t.reciterSelectLabel}
              </div>
              <select
                id="quick-settings-reciter"
                data-testid="settings-reciter-select"
                value={settings.reciterId}
                onChange={(e) => onUpdateSettings({reciterId: e.target.value})}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none"
              >
                <optgroup label={t.warshGroup}>
                  {warshReciters.map((r) => (
                    <option key={r.id} value={r.id} className="text-[#2D231E] bg-[#FDFBF7]">
                      {lang === 'ar' ? r.nameAr : `${r.nameEn} · ${r.nameAr}`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t.hafsGroup}>
                  {hafsReciters.map((r) => (
                    <option key={r.id} value={r.id} className="text-[#2D231E] bg-[#FDFBF7]">
                      {lang === 'ar' ? r.nameAr : `${r.nameEn} · ${r.nameAr}`}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
