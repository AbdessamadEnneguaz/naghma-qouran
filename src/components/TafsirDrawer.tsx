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
    dotClass: 'bg-[#27784C] dark:bg-[#52B77F]',
    activeClass:
      'border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]',
  },
  {
    id: 'memorization',
    dotClass: 'bg-[#27784C] dark:bg-[#34D399]',
    activeClass:
      'border-[#27784C] dark:border-[#34D399] bg-[#27784C]/10 dark:bg-emerald-500/15 text-[#27784C] dark:text-[#34D399]',
  },
  {
    id: 'favorites',
    dotClass: 'bg-[#142019] dark:bg-[#F1F5F3]',
    activeClass:
      'border-[#142019] dark:border-[#F1F5F3] bg-[#142019]/10 dark:bg-white/10 text-[#142019] dark:text-[#F1F5F3]',
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
  const cardPreviewRef = useRef<HTMLDivElement | null>(null);
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
          // User cancelled or file-share unsupported
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      data-testid="verse-bottom-sheet"
      aria-label={`${t.tafsir} ${verse.surah}:${verse.ayah}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-t-3xl md:rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl overflow-hidden will-change-transform"
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
          <div className="w-12 h-1 bg-[#CBDAD0] dark:bg-[#243B30] rounded-full mx-auto mt-3 mb-1" />

          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[#E2EAE5] dark:border-[#1E2E26]">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#142019] dark:text-[#F1F5F3] truncate tabular-nums">
                {surahDisplay} ·{' '}
                {lang === 'ar'
                  ? `${toArabicDigits(verse.surah)}:${toArabicDigits(verse.ayah)}`
                  : `Ayah ${verse.surah}:${verse.ayah}`}
              </h3>
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                {t.pageWord} {lang === 'ar' ? toArabicDigits(verse.page) : verse.page} ·{' '}
                {t.juzWord} {lang === 'ar' ? toArabicDigits(verse.juz) : verse.juz} ·{' '}
                {riwayat === 'warsh' ? t.warshLabel : t.hafsLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeWord}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229] transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Arabic Uthmani Ayah Card */}
          <div
            dir="rtl"
            className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-4 sm:p-5 font-quran-amiri text-2xl sm:text-3xl leading-[2.2] tracking-normal text-[#142019] dark:text-[#F1F5F3]"
          >
            {arabicText}{' '}
            <span className="text-[#27784C] dark:text-[#52B77F]">
              ﴿{toArabicDigits(verse.ayah)}﴾
            </span>
          </div>

          {/* 3-Tab Commentary Switcher */}
          <div
            role="tablist"
            aria-label="Commentary & Translation"
            className="flex items-center gap-1 p-1 rounded-xl bg-[#EAF1EC] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26]"
          >
            <button
              type="button"
              role="tab"
              data-testid="sheet-tab-tafsir"
              aria-selected={activeSection === 'tafsir'}
              onClick={() => setActiveSection('tafsir')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'tafsir'
                  ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                  : 'text-[#5A6B62] dark:text-[#92A59B]'
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
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'en'
                  ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                  : 'text-[#5A6B62] dark:text-[#92A59B]'
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
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'fr'
                  ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                  : 'text-[#5A6B62] dark:text-[#92A59B]'
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
                  className="font-quran-scheherazade text-xl sm:text-2xl leading-[2.0] tracking-normal text-[#142019] dark:text-[#F1F5F3]"
                >
                  {tafsir}
                </p>
              ) : (
                <p className="text-sm text-[#5A6B62] dark:text-[#92A59B]">{t.loadingTafsir}</p>
              )
            ) : activeSection === 'en' ? (
              translationEn ? (
                <p
                  dir="ltr"
                  data-testid="sheet-content-en"
                  className="text-sm sm:text-base leading-relaxed text-[#142019] dark:text-[#F1F5F3]"
                >
                  {translationEn}
                </p>
              ) : (
                <p className="text-sm text-[#5A6B62] dark:text-[#92A59B]">
                  {t.loadingTranslation}
                </p>
              )
            ) : translationFr ? (
              <p
                dir="ltr"
                data-testid="sheet-content-fr"
                className="text-sm sm:text-base leading-relaxed text-[#142019] dark:text-[#F1F5F3]"
              >
                {translationFr}
              </p>
            ) : (
              <p className="text-sm text-[#5A6B62] dark:text-[#92A59B] flex items-center gap-2">
                {loadingFr && <Loader2 className="h-4 w-4 animate-spin text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />}
                <span>{t.loadingFrenchTranslation}</span>
              </p>
            )}
          </div>

          {/* Hifz Loop Repeat Control Strip */}
          <div className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]">
              <Repeat className="h-4 w-4 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
              <span>{t.hifzRepeatLabel}</span>
              {isPlayingThisVerse && hifzRepeatTarget !== 1 && (
                <span
                  data-testid="hifz-loop-progress"
                  className="text-[#27784C] dark:text-[#52B77F] font-semibold tabular-nums"
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
                    className={`min-w-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border tabular-nums transition-colors ${
                      active
                        ? 'border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                        : 'border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categorized Bookmark Selector */}
          <div className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 space-y-2">
            <div className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]">
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
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      isSelectedCat
                        ? cat.activeClass
                        : 'border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#5A6B62] dark:text-[#92A59B]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${cat.dotClass}`} />
                    <span>{getCategoryLabel(cat.id)}</span>
                    {isSelectedCat && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-Click Shareable Ayah Image Card Strip */}
          <div className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-1">
                <button
                  type="button"
                  data-testid="card-format-story"
                  onClick={() => {
                    setCardFormat('story');
                    setCardPreview(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    cardFormat === 'story'
                      ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                      : 'text-[#5A6B62] dark:text-[#92A59B]'
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
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    cardFormat === 'square'
                      ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
                      : 'text-[#5A6B62] dark:text-[#92A59B]'
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-4 py-2 text-xs font-semibold text-white dark:text-[#0A110E] transition-opacity whitespace-nowrap disabled:opacity-60"
              >
                {generatingCard ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                <span>{t.shareCardBtn}</span>
              </button>
            </div>

            {cardPreview && (
              <div
                ref={cardPreviewRef}
                data-testid="ayah-card-preview"
                className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cardPreview.dataUrl}
                    alt={`${surahDisplay} ${verse.surah}:${verse.ayah}`}
                    className="h-14 w-14 rounded-xl object-cover border border-[#E2EAE5] dark:border-[#1E2E26] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] truncate">
                      {t.storyCardReadyTitle}
                    </p>
                    <p className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate">
                      {cardPreview.filename}
                    </p>
                  </div>
                </div>
                <a
                  href={cardPreview.dataUrl}
                  download={cardPreview.filename}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] shrink-0"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>PNG</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-5 py-3.5 border-t border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#111C17] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-testid="sheet-listen-btn"
            onClick={() => onPlayAyahWithRepeat(verse.surah, verse.ayah, hifzRepeatTarget)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity"
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
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                isBookmarked
                  ? 'border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]'
                  : 'border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] text-[#142019] dark:text-[#F1F5F3]'
              }`}
            >
              <Bookmark className="h-4 w-4" strokeWidth={1.5} />
              <span>{isBookmarked ? t.bookmarked : t.bookmark}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleShareImageCard()}
              aria-label={t.shareWord}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.5} />
              )}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
