import React, {useEffect, useRef, useState} from 'react';
import {
  Bookmark,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Loader2,
  Play,
  Repeat,
  Share2,
  X,
} from 'lucide-react';
import type {
  BookmarkCategory,
  HifzRepeatCount,
  QuranVerse,
  Riwayat,
  SurahMeta,
} from '../types/quran';
import {toArabicDigits} from '../utils/quranLogic';
import {formatAyahLoopProgress} from '../utils/audioLoopLogic';
import {computeSheetDragOffset, evaluateSwipeDismiss} from '../utils/swipeSheetLogic';
import {renderAyahShareCardPng, type AyahCardFormat} from '../utils/storyCardCanvas';
import {
  fetchVerseFrenchTranslation,
  getVerseTextByRiwayat,
} from '../services/quranLoader';
import type {AppLang, Translations} from '../i18n/translations';

interface TafsirDrawerProps {
  lang: AppLang;
  t: Translations;
  verse: QuranVerse | null;
  surahMeta: SurahMeta | undefined;
  riwayat: Riwayat;
  warshTexts: string[] | null;
  tafsirTexts: string[] | null;
  translations: string[] | null;
  frenchTexts: string[] | null;
  isBookmarked: boolean;
  bookmarkCategory?: BookmarkCategory;
  isPlayingThisVerse: boolean;
  hifzRepeatTarget: HifzRepeatCount;
  hifzRepeatDone: number;
  onClose: () => void;
  onRequestFrenchTranslation: () => void;
  onPlayAyahWithRepeat: (
    surah: number,
    ayah: number,
    repeat: HifzRepeatCount
  ) => void;
  onSelectHifzRepeat: (repeat: HifzRepeatCount) => void;
  onSetBookmarkCategory: (verse: QuranVerse, category: BookmarkCategory) => void;
  onToggleBookmark: (verse: QuranVerse, category?: BookmarkCategory) => void;
}

const HIFZ_OPTIONS: Array<{value: HifzRepeatCount; label: string}> = [
  {value: 1, label: '1x'},
  {value: 3, label: '3x'},
  {value: 5, label: '5x'},
  {value: 'inf', label: '∞'},
];

const BOOKMARK_CATEGORIES: Array<{
  id: BookmarkCategory;
  dotClass: string;
  activeClass: string;
}> = [
  {
    id: 'wird',
    dotClass: 'bg-[#D97706]',
    activeClass:
      'border-[#D97706] bg-amber-500/15 text-[#92400E] dark:text-[#FBBF24]',
  },
  {
    id: 'memorization',
    dotClass: 'bg-[#059669]',
    activeClass:
      'border-[#059669] bg-emerald-500/15 text-[#065F46] dark:text-[#34D399]',
  },
  {
    id: 'favorites',
    dotClass: 'bg-[#E11D48]',
    activeClass:
      'border-[#E11D48] bg-rose-500/15 text-[#9F1239] dark:text-[#FB7185]',
  },
];

export const TafsirDrawer: React.FC<TafsirDrawerProps> = ({
  lang,
  t,
  verse,
  surahMeta,
  riwayat,
  warshTexts,
  tafsirTexts,
  translations,
  frenchTexts,
  isBookmarked,
  bookmarkCategory,
  isPlayingThisVerse,
  hifzRepeatTarget,
  hifzRepeatDone,
  onClose,
  onRequestFrenchTranslation,
  onPlayAyahWithRepeat,
  onSelectHifzRepeat,
  onSetBookmarkCategory,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'tafsir' | 'en' | 'fr'>(() =>
    lang === 'fr' ? 'fr' : 'tafsir'
  );
  const [singleFrText, setSingleFrText] = useState<string | null>(null);
  const [loadingFr, setLoadingFr] = useState(false);

  const [cardFormat, setCardFormat] = useState<AyahCardFormat>('story');
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardPreview, setCardPreview] = useState<{
    dataUrl: string;
    filename: string;
    shared?: boolean;
  } | null>(null);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startY: number;
    startTimeMs: number;
    offsetY: number;
  }>({active: false, startY: 0, startTimeMs: 0, offsetY: 0});

  useEffect(() => {
    setCardPreview(null);
    setSingleFrText(null);
    dragStateRef.current.active = false;
    dragStateRef.current.offsetY = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = '';
      sheetRef.current.style.transform = '';
    }
  }, [verse?.surah, verse?.ayah]);

  useEffect(() => {
    if (!verse || activeSection !== 'fr') return;
    if (frenchTexts?.[verse.index]) return;
    onRequestFrenchTranslation();
    let cancelled = false;
    setLoadingFr(true);
    void fetchVerseFrenchTranslation(verse.surah, verse.ayah)
      .then((txt) => {
        if (!cancelled && txt) setSingleFrText(txt);
      })
      .finally(() => {
        if (!cancelled) setLoadingFr(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSection, verse, frenchTexts, onRequestFrenchTranslation]);

  if (!verse) return null;

  const arabicText = getVerseTextByRiwayat(verse, riwayat, warshTexts);
  const tafsir = tafsirTexts?.[verse.index];
  const translationEn = translations?.[verse.index];
  const translationFr = frenchTexts?.[verse.index] || singleFrText;

  const surahDisplay =
    lang === 'ar'
      ? surahMeta?.nameAr || `${t.surahWord} ${toArabicDigits(verse.surah)}`
      : surahMeta?.nameEn || `Surah ${verse.surah}`;

  const getCategoryLabel = (cat: BookmarkCategory) =>
    cat === 'wird'
      ? t.catWird
      : cat === 'memorization'
        ? t.catMemorization
        : t.catFavorites;

  const handleCopy = async () => {
    try {
      const payload = `${arabicText} ﴿${toArabicDigits(verse.ayah)}﴾\n[${surahDisplay} ${verse.surah}:${verse.ayah}]`;
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleShareImageCard = async () => {
    if (generatingCard) return;
    setGeneratingCard(true);
    try {
      const activeTranslation =
        activeSection === 'fr' && translationFr
          ? translationFr
          : translationEn || translationFr || undefined;

      const {blob, dataUrl, filename} = await renderAyahShareCardPng({
        surah: verse.surah,
        ayah: verse.ayah,
        page: verse.page,
        surahNameAr: surahMeta?.nameAr || '',
        surahNameEn: surahMeta?.nameEn || `Surah ${verse.surah}`,
        arabic: arabicText,
        translation: activeTranslation,
        reflection:
          lang === 'ar'
            ? `مصحف المدينة المنورة · صفحة ${toArabicDigits(verse.page)}`
            : `Madani Mushaf · Page ${verse.page}`,
        format: cardFormat,
        lang,
      });

      let sharedViaSheet = false;
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          const file = new File([blob], filename, {type: 'image/png'});
          const canShareFiles =
            typeof navigator.canShare === 'function'
              ? navigator.canShare({files: [file]})
              : true;
          if (canShareFiles) {
            await navigator.share({
              files: [file],
              title: `${surahDisplay} ${verse.surah}:${verse.ayah}`,
              text: `${surahDisplay} (${verse.surah}:${verse.ayah}) · Mihrab Noor`,
            });
            sharedViaSheet = true;
          }
        } catch {
          // User cancelled or file-share unsupported; trigger clean PNG download fallback
        }
      }

      if (!sharedViaSheet) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setCardPreview({dataUrl, filename, shared: sharedViaSheet});
      window.requestAnimationFrame(() => {
        cardPreviewRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      });
    } catch {
      // ignore canvas errors
    } finally {
      setGeneratingCard(false);
    }
  };

  const cardPreviewRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
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
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active || !sheetRef.current) return;
    const clamped = computeSheetDragOffset(e.clientY - dragStateRef.current.startY);
    dragStateRef.current.offsetY = clamped;
    sheetRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
  };

  const handlePointerUp = () => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    const elapsedMs = performance.now() - dragStateRef.current.startTimeMs;
    const res = evaluateSwipeDismiss(dragStateRef.current.offsetY, elapsedMs);
    dragStateRef.current.offsetY = 0;
    if (res.shouldDismiss) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
      sheetRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      data-testid="verse-bottom-sheet"
      aria-label={`${t.tafsir} ${verse.surah}:${verse.ayah}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-amber-500/22 bg-[#FDFBF7] dark:bg-[#1B1410] shadow-2xl overflow-hidden will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interactive Draggable Handle + Header */}
        <div
          data-testid="sheet-drag-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none select-none cursor-grab active:cursor-grabbing"
        >
          <div className="w-12 h-1.5 bg-amber-600/35 dark:bg-amber-400/35 rounded-full mx-auto mt-3 mb-1" />

          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-amber-500/12">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#2D231E] dark:text-[#FAF5EE] truncate tabular-nums">
                {surahDisplay} ·{' '}
                {lang === 'ar'
                  ? `${toArabicDigits(verse.surah)}:${toArabicDigits(verse.ayah)}`
                  : `Ayah ${verse.surah}:${verse.ayah}`}
              </h3>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                {t.pageWord} {lang === 'ar' ? toArabicDigits(verse.page) : verse.page} ·{' '}
                {t.juzWord} {lang === 'ar' ? toArabicDigits(verse.juz) : verse.juz} ·{' '}
                {riwayat === 'warsh' ? t.warshLabel : t.hafsLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Arabic Uthmani Ayah Card */}
          <div
            dir="rtl"
            className="rounded-3xl border border-amber-500/15 bg-white/85 dark:bg-[#241B15] p-4 sm:p-5 font-quran-amiri text-2xl sm:text-3xl leading-[2.2] tracking-normal text-[#2D231E] dark:text-[#FAF5EE]"
          >
            {arabicText}{' '}
            <span className="text-[#B45309] dark:text-[#FBBF24]">
              ﴿{toArabicDigits(verse.ayah)}﴾
            </span>
          </div>

          {/* 3-Tab Commentary Switcher: Tafsir Al-Muyassar | English | Français */}
          <div
            role="tablist"
            aria-label="Commentary & Translation"
            className="flex items-center gap-1 p-1 rounded-full bg-amber-500/12 dark:bg-[#241B15]"
          >
            <button
              type="button"
              role="tab"
              data-testid="sheet-tab-tafsir"
              aria-selected={activeSection === 'tafsir'}
              onClick={() => setActiveSection('tafsir')}
              className={`flex-1 py-2 px-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'tafsir'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.tafsirMuyassarTab}
            </button>
            <button
              type="button"
              role="tab"
              data-testid="sheet-tab-en"
              aria-selected={activeSection === 'en'}
              onClick={() => setActiveSection('en')}
              className={`flex-1 py-2 px-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'en'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.englishTranslationTab}
            </button>
            <button
              type="button"
              role="tab"
              data-testid="sheet-tab-fr"
              aria-selected={activeSection === 'fr'}
              onClick={() => setActiveSection('fr')}
              className={`flex-1 py-2 px-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'fr'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.frenchTranslationTab}
            </button>
          </div>

          {/* Tab Panel Content */}
          <div className="min-h-[72px]">
            {activeSection === 'tafsir' ? (
              tafsir ? (
                <p
                  dir="rtl"
                  data-testid="sheet-content-tafsir"
                  className="font-quran-scheherazade text-xl sm:text-2xl leading-[2.0] tracking-normal text-[#2D231E] dark:text-[#FAF5EE]"
                >
                  {tafsir}
                </p>
              ) : (
                <p className="text-sm text-[#6E5649] dark:text-[#D6C7B8]">{t.loadingTafsir}</p>
              )
            ) : activeSection === 'en' ? (
              translationEn ? (
                <p
                  dir="ltr"
                  data-testid="sheet-content-en"
                  className="text-sm sm:text-base leading-relaxed text-[#2D231E] dark:text-[#FAF5EE]"
                >
                  {translationEn}
                </p>
              ) : (
                <p className="text-sm text-[#6E5649] dark:text-[#D6C7B8]">
                  {t.loadingTranslation}
                </p>
              )
            ) : translationFr ? (
              <p
                dir="ltr"
                data-testid="sheet-content-fr"
                className="text-sm sm:text-base leading-relaxed text-[#2D231E] dark:text-[#FAF5EE]"
              >
                {translationFr}
              </p>
            ) : (
              <p className="text-sm text-[#6E5649] dark:text-[#D6C7B8] flex items-center gap-2">
                {loadingFr && <Loader2 className="h-4 w-4 animate-spin text-[#D97706]" />}
                <span>{t.loadingFrenchTranslation}</span>
              </p>
            )}
          </div>

          {/* Hifz Loop Repeat Control Strip (1x, 3x, 5x, ∞) */}
          <div className="rounded-2xl border border-amber-500/14 bg-white/75 dark:bg-[#241B15]/85 p-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4E3629] dark:text-[#E5D5C3]">
              <Repeat className="h-4 w-4 text-[#D97706]" />
              <span>{t.hifzRepeatLabel}</span>
              {isPlayingThisVerse && hifzRepeatTarget !== 1 && (
                <span
                  data-testid="hifz-loop-progress"
                  className="text-[#B45309] dark:text-[#FBBF24] font-bold tabular-nums"
                >
                  · {formatAyahLoopProgress(hifzRepeatDone, hifzRepeatTarget)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {HIFZ_OPTIONS.map((opt) => {
                const active = hifzRepeatTarget === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    data-testid={`hifz-loop-btn-${opt.value}`}
                    onClick={() => {
                      onSelectHifzRepeat(opt.value);
                      onPlayAyahWithRepeat(verse.surah, verse.ayah, opt.value);
                    }}
                    className={`min-w-[40px] px-3 py-1.5 rounded-full text-xs font-bold border tabular-nums transition-colors ${
                      active
                        ? 'border-[#7C4A15] bg-[#7C4A15] text-white'
                        : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#4E3629] dark:text-[#D6C7B8] hover:border-[#D97706]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Color Categorized Bookmark Selector */}
          <div className="rounded-2xl border border-amber-500/14 bg-white/75 dark:bg-[#241B15]/85 p-3.5 space-y-2">
            <div className="text-xs font-semibold text-[#4E3629] dark:text-[#E5D5C3]">
              {t.bookmarkCategoryLabel}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {BOOKMARK_CATEGORIES.map((cat) => {
                const isSelectedCat = isBookmarked && bookmarkCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-testid={`bookmark-cat-btn-${cat.id}`}
                    onClick={() => {
                      if (isSelectedCat) {
                        onToggleBookmark(verse, cat.id);
                      } else {
                        onSetBookmarkCategory(verse, cat.id);
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      isSelectedCat
                        ? cat.activeClass
                        : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#4E3629] dark:text-[#D6C7B8] hover:border-[#D97706]'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cat.dotClass}`} />
                    <span>{getCategoryLabel(cat.id)}</span>
                    {isSelectedCat && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-Click Shareable Ayah Image Card Strip */}
          <div className="rounded-2xl border border-amber-500/14 bg-white/75 dark:bg-[#241B15]/85 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 p-1">
                <button
                  type="button"
                  data-testid="card-format-story"
                  onClick={() => {
                    setCardFormat('story');
                    setCardPreview(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    cardFormat === 'story'
                      ? 'bg-[#D97706] text-white'
                      : 'text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  {t.cardFormatStory}
                </button>
                <button
                  type="button"
                  data-testid="card-format-square"
                  onClick={() => {
                    setCardFormat('square');
                    setCardPreview(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    cardFormat === 'square'
                      ? 'bg-[#D97706] text-white'
                      : 'text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  {t.cardFormatSquare}
                </button>
              </div>

              <button
                type="button"
                data-testid="sheet-share-card-btn"
                onClick={() => void handleShareImageCard()}
                disabled={generatingCard}
                className="inline-flex items-center gap-2 rounded-full bg-[#B45309] hover:bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {generatingCard ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span>{t.shareCardBtn}</span>
              </button>
            </div>

            {cardPreview && (
              <div
                ref={cardPreviewRef}
                data-testid="ayah-card-preview"
                className="flex items-center justify-between gap-3 pt-2 border-t border-amber-500/12"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cardPreview.dataUrl}
                    alt={`${surahDisplay} ${verse.surah}:${verse.ayah}`}
                    className="h-14 w-14 rounded-xl object-cover border border-amber-500/25 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2D231E] dark:text-[#FAF5EE] truncate">
                      {t.storyCardReadyTitle}
                    </p>
                    <p className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] truncate">
                      {cardPreview.filename}
                    </p>
                  </div>
                </div>
                <a
                  href={cardPreview.dataUrl}
                  download={cardPreview.filename}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 px-3 py-1.5 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PNG</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-5 py-3.5 border-t border-amber-500/12 bg-[#FAF5EE] dark:bg-[#221914] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-testid="sheet-listen-btn"
            onClick={() => onPlayAyahWithRepeat(verse.surah, verse.ayah, hifzRepeatTarget)}
            className="inline-flex items-center gap-2 rounded-full bg-[#D97706] hover:bg-[#B45309] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>
              {t.listenAyah}
              {hifzRepeatTarget !== 1
                ? ` (${hifzRepeatTarget === 'inf' ? '∞' : `${hifzRepeatTarget}x`})`
                : ''}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="sheet-bookmark-btn"
              onClick={() => onToggleBookmark(verse, bookmarkCategory || 'favorites')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                isBookmarked
                  ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                  : 'border-amber-500/20 text-[#2D231E] dark:text-[#FAF5EE]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? t.bookmarked : t.bookmark}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleShareImageCard()}
              aria-label={t.shareWord}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-[#D97706]" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
