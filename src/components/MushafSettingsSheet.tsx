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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-6"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] pb-safe-bottom shadow-2xl overflow-hidden will-change-transform"
      >
        {/* Top Drag Handle Zone — Finger Swipe-Down to Dismiss */}
        <div
          data-testid="settings-drag-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className="touch-none select-none cursor-grab active:cursor-grabbing px-5 pt-3 pb-3.5 border-b border-[#E6E4DF] dark:border-[#222226]"
        >
          <div className="w-12 h-1 rounded-full bg-[#D6D3CB] dark:bg-[#2F2F35] mx-auto mb-3" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#121212] dark:text-[#F4F4F5]">
                {t.quickSettingsTitle}
              </h2>
              <p className="text-[11px] text-[#6B6A66] dark:text-[#8E8E93]">
                {t.swipeDownToCloseHint}
              </p>
            </div>
            <button
              type="button"
              data-testid="settings-close-btn"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#6B6A66] dark:text-[#8E8E93] hover:bg-[#F4F2ED] dark:hover:bg-[#1E1E22] transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 4 Clean, Touch-Friendly Reader Controls */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* 1. Font Size (- / + large tactile controls) */}
          <div className="min-h-[60px] rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-10 w-10 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] flex items-center justify-center shrink-0">
                <Type className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] truncate">
                  {t.fontSizeLabel}
                </div>
                <div
                  data-testid="settings-font-size-value"
                  className="text-xs font-medium text-[#0F5132] dark:text-[#C5A46D] tabular-nums"
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
                className="min-h-[44px] min-w-[44px] rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] disabled:opacity-35 flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4" strokeWidth={1.5} />
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
                className="min-h-[44px] min-w-[44px] rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#121212] dark:text-[#F4F4F5] hover:border-[#0F5132] dark:hover:border-[#C5A46D] disabled:opacity-35 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
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
                  className={`min-h-[60px] rounded-xl border px-3.5 py-2.5 flex items-center gap-3 text-start transition-colors ${
                    active
                      ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/14 text-[#0F5132] dark:text-[#C5A46D]'
                      : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] text-[#121212] dark:text-[#F4F4F5]'
                  }`}
                >
                  <span
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active
                        ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                        : 'border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                    }`}
                  >
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-quran-scheherazade text-lg font-bold leading-tight">
                      {opt.titleAr}
                    </div>
                    <div className="text-[11px] font-medium opacity-80">{opt.titleEn}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. Theme Toggle */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              data-testid="settings-theme-light"
              onClick={() => onUpdateSettings({theme: 'light'})}
              className={`min-h-[60px] rounded-xl border px-3 py-2.5 flex items-center gap-2.5 text-start transition-colors ${
                settings.theme === 'light'
                  ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/14 text-[#0F5132] dark:text-[#C5A46D]'
                  : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] text-[#121212] dark:text-[#F4F4F5]'
              }`}
            >
              <span
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'light'
                    ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                    : 'border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                }`}
              >
                <Sun className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="text-xs sm:text-sm font-semibold leading-tight">
                {t.themeWarmDay}
              </span>
            </button>

            <button
              type="button"
              data-testid="settings-theme-dark"
              onClick={() => onUpdateSettings({theme: 'dark'})}
              className={`min-h-[60px] rounded-xl border px-3 py-2.5 flex items-center gap-2.5 text-start transition-colors ${
                settings.theme === 'dark'
                  ? 'border-[#0F5132] dark:border-[#C5A46D] bg-[#0F5132]/8 dark:bg-[#C5A46D]/14 text-[#0F5132] dark:text-[#C5A46D]'
                  : 'border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] text-[#121212] dark:text-[#F4F4F5]'
              }`}
            >
              <span
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  settings.theme === 'dark'
                    ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
                    : 'border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#6B6A66] dark:text-[#8E8E93]'
                }`}
              >
                <Moon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="text-xs sm:text-sm font-semibold leading-tight">
                {t.themeNightComfort}
              </span>
            </button>
          </div>

          {/* 4. Reciter (1-Tap Prominent Selector) */}
          <label
            htmlFor="quick-settings-reciter"
            className="min-h-[60px] rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] px-4 py-2.5 flex items-center gap-3 cursor-pointer"
          >
            <span className="h-10 w-10 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] text-[#0F5132] dark:text-[#C5A46D] flex items-center justify-center shrink-0">
              <Volume2 className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-[11px] font-medium text-[#6B6A66] dark:text-[#8E8E93]">
                {t.reciterSelectLabel}
              </div>
              <select
                id="quick-settings-reciter"
                data-testid="settings-reciter-select"
                value={settings.reciterId}
                onChange={(e) => onUpdateSettings({reciterId: e.target.value})}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F4F4F5] focus:outline-none"
              >
                <optgroup label={t.warshGroup}>
                  {warshReciters.map((r) => (
                    <option key={r.id} value={r.id} className="text-[#121212] bg-white">
                      {lang === 'ar' ? r.nameAr : `${r.nameEn} · ${r.nameAr}`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t.hafsGroup}>
                  {hafsReciters.map((r) => (
                    <option key={r.id} value={r.id} className="text-[#121212] bg-white">
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
