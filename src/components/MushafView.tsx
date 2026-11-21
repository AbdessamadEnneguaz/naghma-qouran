import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Bookmark,
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Maximize2,
  Play,
  X,
} from 'lucide-react';
import type {
  BookmarkEntry,
  OfflineSurahRecord,
  QuranVerse,
  ReaderSettings,
  Reciter,
  SurahMeta,
} from '../types/quran';
import {
  formatHizbLabel,
  stripLeadingBismillah,
  toArabicDigits,
  tokenizeVerseWords,
} from '../utils/quranLogic';
import {getVerseTextByRiwayat} from '../services/quranLoader';
import {MushafCornerOrnament, SurahCartoucheBanner} from './OrnamentalSvg';
import type {AppLang, Translations} from '../i18n/translations';

interface MushafViewProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  verses: QuranVerse[];
  warshTexts: string[] | null;
  translations: string[] | null;
  currentPage: number;
  currentSurahId: number;
  selectedAyahKey: string | null;
  playingSurah: number;
  playingAyah: number;
  isPlaying: boolean;
  settings: ReaderSettings;
  activeReciter: Reciter;
  bookmarks: BookmarkEntry[];
  offlineRecords: OfflineSurahRecord[];
  downloadProgress: {surah: number; completed: number; total: number} | null;
  // Tarteel Focus & Hifz & Voice Follow props
  focusMode: boolean;
  hifzMode: boolean;
  hifzFirstWordHint: boolean;
  revealedAyahKeys: Set<string>;
  matchedWordKeys: Set<string>;
  missedWordKeys: Set<string>;
  mistakePulseKey: string | null;
  onToggleFocusMode: () => void;
  onToggleFirstWordHint: () => void;
  onToggleRevealAyah: (ayahKey: string) => void;
  onRevealAllOnPage: (keys: string[]) => void;
  onMaskAllOnPage: () => void;
  onUpdateSettings: (patch: Partial<ReaderSettings>) => void;
  onChangePage: (page: number) => void;
  onChangeSurah: (surahId: number) => void;
  onOpenTafsir: (verse: QuranVerse) => void;
  onPlayAyah: (surah: number, ayah: number) => void;
  onToggleBookmark: (verse: QuranVerse) => void;
  onDownloadSurah: (surahMeta: SurahMeta) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({
  lang,
  t,
  surahs,
  verses,
  warshTexts,
  translations,
  currentPage,
  currentSurahId,
  selectedAyahKey,
  playingSurah,
  playingAyah,
  isPlaying,
  settings,
  activeReciter,
  bookmarks,
  offlineRecords,
  downloadProgress,
  focusMode,
  hifzMode,
  hifzFirstWordHint,
  revealedAyahKeys,
  matchedWordKeys,
  missedWordKeys,
  mistakePulseKey,
  onToggleFocusMode,
  onToggleFirstWordHint,
  onToggleRevealAyah,
  onRevealAllOnPage,
  onMaskAllOnPage,
  onUpdateSettings,
  onChangePage,
  onChangeSurah,
  onOpenTafsir,
  onPlayAyah,
  onToggleBookmark,
  onDownloadSurah,
}) => {
  const [actionMenuVerse, setActionMenuVerse] = useState<QuranVerse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPageJumper, setShowPageJumper] = useState(false);
  const [pageJumpInput, setPageJumpInput] = useState(String(currentPage));
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPageJumpInput(String(currentPage));
  }, [currentPage]);

  const surahMap = useMemo(() => {
    const map = new Map<number, SurahMeta>();
    for (const s of surahs) map.set(s.id, s);
    return map;
  }, [surahs]);

  const bookmarkIds = useMemo(
    () => new Set(bookmarks.map((b) => b.id)),
    [bookmarks]
  );

  // Strict Page-by-Page Madani Mushaf pagination (Pages 1 to 604)
  const displayVerses = useMemo(
    () => verses.filter((v) => v.page === currentPage),
    [verses, currentPage]
  );

  const pageAyahKeys = useMemo(
    () => displayVerses.map((v) => `${v.surah}:${v.ayah}`),
    [displayVerses]
  );

  const primaryVerse = displayVerses[0];
  const headerSurahMeta = useMemo(() => {
    const idOnPage = displayVerses.some((v) => v.surah === currentSurahId)
      ? currentSurahId
      : primaryVerse?.surah || currentSurahId;
    return surahMap.get(idOnPage);
  }, [displayVerses, currentSurahId, primaryVerse?.surah, surahMap]);

  const isSurahDownloaded = useMemo(
    () =>
      !!headerSurahMeta &&
      offlineRecords.some(
        (r) => r.surah === headerSurahMeta.id && r.reciterId === activeReciter.id
      ),
    [headerSurahMeta, offlineRecords, activeReciter.id]
  );

  const isDownloadingThisSurah =
    !!headerSurahMeta && downloadProgress?.surah === headerSurahMeta.id;

  const hizbInfo = primaryVerse
    ? formatHizbLabel(primaryVerse.hizbQuarter)
    : {hizb: 1, quarter: 1};

  const surahGroups = useMemo(() => {
    const groups: Array<{surah: SurahMeta; items: QuranVerse[]}> = [];
    for (const v of displayVerses) {
      const last = groups[groups.length - 1];
      if (!last || last.surah.id !== v.surah) {
        const meta = surahMap.get(v.surah);
        if (meta) groups.push({surah: meta, items: [v]});
      } else {
        last.items.push(v);
      }
    }
    return groups;
  }, [displayVerses, surahMap]);

  const fontClass =
    settings.font === 'amiri' ? 'font-quran-amiri' : 'font-quran-scheherazade';

  // Smooth auto-scroll to active playing verse
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;
    const key = `${playingSurah}:${playingAyah}`;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-ayah-key="${key}"]`
    );
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }, [isPlaying, playingSurah, playingAyah, currentPage]);

  // Scroll mid-page opening ayah (e.g., Al-Kahf 18:1 on Page 293) into view when selected
  useEffect(() => {
    if (!selectedAyahKey || !containerRef.current) return;
    const idx = displayVerses.findIndex(
      (v) => `${v.surah}:${v.ayah}` === selectedAyahKey
    );
    if (idx > 0) {
      const raf = requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(
          `[data-ayah-key="${selectedAyahKey}"]`
        );
        el?.scrollIntoView({behavior: 'smooth', block: 'center'});
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [selectedAyahKey, displayVerses]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignore vertical scrolls; trigger clean horizontal page flip when swipe > 48px
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx > 48 && currentPage < 604) {
      onChangePage(currentPage + 1);
    } else if (dx < -48 && currentPage > 1) {
      onChangePage(currentPage - 1);
    }
  };

  // Tap empty space on Mushaf canvas to toggle Tap-to-Focus Mode
  const handleCanvasTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"], select, input, a, [role="region"]')) {
      return;
    }
    onToggleFocusMode();
  };

  const handleVerseInteraction = (verse: QuranVerse) => {
    const ayahKey = `${verse.surah}:${verse.ayah}`;
    if (hifzMode && !revealedAyahKeys.has(ayahKey)) {
      onToggleRevealAyah(ayahKey);
      return;
    }
    setActionMenuVerse(verse);
  };

  const handleCopyVerse = async (verse: QuranVerse) => {
    try {
      const text = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
      const sMeta = surahMap.get(verse.surah);
      const payload = `${text} ﴿${toArabicDigits(verse.ayah)}﴾\n[${sMeta?.nameEn || verse.surah} ${verse.surah}:${verse.ayah}]`;
      await navigator.clipboard.writeText(payload);
      const key = `${verse.surah}:${verse.ayah}`;
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  const actionKey = actionMenuVerse
    ? `${actionMenuVerse.surah}:${actionMenuVerse.ayah}`
    : null;
  const isActionVerseBookmarked = !!actionKey && bookmarkIds.has(actionKey);

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`min-h-[calc(100vh-52px)] mushaf-frame transition-all duration-300 ${
        focusMode ? 'pt-5 pb-16' : 'pt-2 sm:pt-3 pb-32'
      }`}
    >
      {/* Minimal Mushaf Navigation Strip (Smoothly fades out in Focus Mode) */}
      <div
        className={`mx-auto max-w-3xl px-4 sm:px-10 transition-all duration-300 ${
          focusMode
            ? 'h-0 overflow-hidden opacity-0 pointer-events-none'
            : 'opacity-100 mb-3 sm:mb-4'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[#B4891B]/16 dark:border-white/8">
          {/* Quick Surah Selector + Clickable Page Jumper + Juz Indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <select
              aria-label={t.surahWord}
              value={headerSurahMeta?.id || currentSurahId}
              onChange={(e) => onChangeSurah(Number(e.target.value))}
              className="max-w-[140px] sm:max-w-[195px] rounded-lg border border-[#B4891B]/22 dark:border-white/12 bg-[#F3ECE0]/80 dark:bg-[#13181E] px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] focus:outline-none focus:ring-2 focus:ring-[#10B981] truncate"
            >
              {surahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'ar'
                    ? `${toArabicDigits(s.id)}. ${s.nameAr.replace('سُورَةُ ', '')}`
                    : `${s.id}. ${s.nameEn}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowPageJumper((v) => !v)}
              aria-expanded={showPageJumper}
              aria-label={t.jumpToPageLabel}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold tabular-nums whitespace-nowrap transition-colors ${
                showPageJumper
                  ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                  : 'border-[#B4891B]/22 dark:border-white/12 bg-[#F3ECE0]/60 dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981]'
              }`}
            >
              <span>
                {lang === 'ar'
                  ? `${t.pageWord} ${toArabicDigits(currentPage)} ${t.ofWord} ٦٠٤`
                  : `${t.pageWord} ${currentPage} ${t.ofWord} 604`}
              </span>
            </button>

            <span className="hidden sm:inline text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums whitespace-nowrap">
              · {lang === 'ar' ? `الجزء ${toArabicDigits(primaryVerse?.juz || 1)}` : `Juz' ${primaryVerse?.juz || 1}`}
            </span>
          </div>

          {/* Riwayat + Offline */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({riwayat: settings.riwayat === 'hafs' ? 'warsh' : 'hafs'})
              }
              className="px-2.5 py-1.5 rounded-lg border border-[#B4891B]/25 dark:border-[#D4AF37]/30 bg-[#F3ECE0]/60 dark:bg-[#13181E] text-[11px] font-semibold text-[#B4891B] dark:text-[#D4AF37] whitespace-nowrap"
            >
              {settings.riwayat === 'hafs'
                ? lang === 'ar'
                  ? 'حفص'
                  : 'Hafs'
                : lang === 'ar'
                  ? 'ورش'
                  : 'Warsh'}
            </button>

            {headerSurahMeta && (
              <button
                type="button"
                onClick={() => onDownloadSurah(headerSurahMeta)}
                disabled={isDownloadingThisSurah}
                title={isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline}
                aria-label={isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline}
                className={`h-7 w-7 flex items-center justify-center rounded-lg border transition-colors ${
                  isSurahDownloaded
                    ? 'border-[#10B981]/35 bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                    : 'border-[#B4891B]/20 dark:border-white/12 bg-[#F3ECE0]/60 dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF] hover:text-[#10B981]'
                }`}
              >
                {isDownloadingThisSurah ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSurahDownloaded ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick 1–604 Page Slider & Direct Jumper */}
        {showPageJumper && (
          <div className="mt-2.5 rounded-xl border border-[#B4891B]/25 dark:border-white/12 bg-[#F3ECE0]/90 dark:bg-[#13181E]/95 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.jumpToPageLabel}
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = Number(pageJumpInput);
                  if (Number.isFinite(num) && num >= 1 && num <= 604) {
                    onChangePage(Math.round(num));
                    setShowPageJumper(false);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={pageJumpInput}
                  onChange={(e) => setPageJumpInput(e.target.value)}
                  aria-label={t.pageWord}
                  className="w-16 rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-2 py-1 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#059669] dark:bg-[#10B981] px-2.5 py-1 text-xs font-semibold text-white dark:text-[#0B0E11]"
                >
                  {t.goBtn}
                </button>
              </form>
            </div>
            <input
              type="range"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => onChangePage(Number(e.target.value))}
              aria-label={t.jumpToPageLabel}
              className="w-full accent-[#10B981] cursor-pointer"
            />
          </div>
        )}

        {/* Hifz Mode Active Strip */}
        {hifzMode && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-2 text-xs">
            <span className="font-medium text-[#059669] dark:text-[#34D399]">
              {t.hifzActiveBanner}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleFirstWordHint}
                className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                  hifzFirstWordHint
                    ? 'bg-[#10B981] text-[#0B0E11]'
                    : 'bg-black/5 dark:bg-white/10 text-[#1C1917] dark:text-[#F4F1EA]'
                }`}
              >
                {t.hifzHintLabel}
              </button>
              <button
                type="button"
                onClick={() =>
                  revealedAyahKeys.size >= pageAyahKeys.length
                    ? onMaskAllOnPage()
                    : onRevealAllOnPage(pageAyahKeys)
                }
                className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:bg-[#10B981]/20"
              >
                {revealedAyahKeys.size >= pageAyahKeys.length ? t.hideAll : t.revealAll}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Structured Ornamental Mushaf Frame Container */}
      <div className="relative mx-auto max-w-4xl lg:px-14 pb-6" dir="ltr">
        {/* Desktop Floating Side Page-Turn Arrows */}
        {!focusMode && (
          <>
            <button
              type="button"
              onClick={() => onChangePage(Math.min(604, currentPage + 1))}
              disabled={currentPage >= 604}
              aria-label={`${t.nextPage} (${Math.min(604, currentPage + 1)})`}
              className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-[#B4891B]/25 dark:border-white/12 bg-[#FAF6EE]/90 dark:bg-[#13181E]/90 text-[#B4891B] dark:text-[#D4AF37] hover:border-[#10B981] disabled:opacity-25 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onChangePage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              aria-label={`${t.prevPage} (${Math.max(1, currentPage - 1)})`}
              className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-[#B4891B]/25 dark:border-white/12 bg-[#FAF6EE]/90 dark:bg-[#13181E]/90 text-[#B4891B] dark:text-[#D4AF37] hover:border-[#10B981] disabled:opacity-25 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <article
          data-testid="mushaf-page-frame"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="relative mx-3 my-2 sm:mx-auto max-w-3xl rounded-2xl border border-amber-500/40 bg-[#FDFBF7] dark:bg-[#0E1318] p-4 sm:p-8 shadow-lg ring-1 ring-inset ring-amber-500/20 overflow-hidden"
        >
          {/* Subtle inner hairline Mushaf border */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 sm:inset-2.5 rounded-xl border border-amber-500/20 dark:border-amber-400/18"
          />
          <MushafCornerOrnament position="top-left" />
          <MushafCornerOrnament position="top-right" />
          <MushafCornerOrnament position="bottom-left" />
          <MushafCornerOrnament position="bottom-right" />

          <div className="relative z-10 px-1 sm:px-3 py-0.5 sm:py-1">
            {/* Subtle Mushaf Page Header Metadata */}
            <div
              dir="ltr"
              className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs text-[#57534E] dark:text-[#9CA3AF] px-3 sm:px-5 pt-0.5 pb-2.5 mb-3.5 sm:mb-6 border-b border-[#B4891B]/18 dark:border-white/8 tabular-nums"
            >
              <span className="font-quran-scheherazade text-xs sm:text-base text-[#B4891B] dark:text-[#D4AF37] whitespace-nowrap">
                الجزء {toArabicDigits(primaryVerse?.juz || 1)} · الحزب{' '}
                {toArabicDigits(hizbInfo.hizb)}
              </span>
              <span className="font-medium whitespace-nowrap">
                {lang === 'ar'
                  ? `${t.pageWord} ${toArabicDigits(currentPage)} ${t.ofWord} ٦٠٤`
                  : `${t.pageWord} ${currentPage} ${t.ofWord} 604`}
              </span>
              <span className="font-quran-scheherazade text-xs sm:text-base text-[#B4891B] dark:text-[#D4AF37] whitespace-nowrap">
                {headerSurahMeta?.nameAr.replace('سُورَةُ ', '')}
              </span>
            </div>

          {/* Surah Groups */}
          <div className="space-y-5 sm:space-y-8">
            {surahGroups.map(({surah, items}) => {
              const startsAtBeginning = items[0]?.ayah === 1;
              const showBismillah =
                startsAtBeginning && surah.id !== 1 && surah.id !== 9;

              return (
                <div key={surah.id} className="space-y-3.5 sm:space-y-5">
                  {startsAtBeginning && (
                    <SurahCartoucheBanner
                      surah={surah}
                      lang={lang}
                      t={t}
                      onPlaySurah={() => onPlayAyah(surah.id, 1)}
                    />
                  )}

                  {showBismillah && (
                    <div
                      dir="rtl"
                      className={`${fontClass} tracking-normal text-center text-[21px] sm:text-3xl leading-[2.05] text-[#B4891B] dark:text-[#D4AF37] py-0.5`}
                    >
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                  )}

                  {settings.showTranslation ? (
                    <div className="divide-y divide-[#B4891B]/12 dark:divide-white/8">
                      {items.map((verse) => {
                        const ayahKey = `${verse.surah}:${verse.ayah}`;
                        const isActiveAudio =
                          isPlaying &&
                          playingSurah === verse.surah &&
                          playingAyah === verse.ayah;
                        const isSelected =
                          selectedAyahKey === ayahKey ||
                          actionKey === ayahKey ||
                          isActiveAudio;
                        const isBookmarked = bookmarkIds.has(ayahKey);
                        const isRevealed = !hifzMode || revealedAyahKeys.has(ayahKey);
                        const rawText = getVerseTextByRiwayat(
                          verse,
                          settings.riwayat,
                          warshTexts
                        );
                        const displayText =
                          settings.riwayat === 'hafs'
                            ? stripLeadingBismillah(rawText, verse.surah, verse.ayah)
                            : rawText;
                        const words = tokenizeVerseWords(displayText);

                        return (
                          <div
                            key={ayahKey}
                            data-ayah-key={ayahKey}
                            className={`py-4 px-2 sm:px-3 rounded-xl transition-colors ${
                              isSelected
                                ? 'bg-[#10B981]/10 dark:bg-[#10B981]/10'
                                : 'hover:bg-black/3 dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
                                {verse.surah}:{verse.ayah}
                                {verse.sajda && (
                                  <span className="ms-2 text-[#059669] dark:text-[#10B981]">
                                    · Sajdah ۩
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onPlayAyah(verse.surah, verse.ayah)}
                                  aria-label={`Play Ayah ${verse.surah}:${verse.ayah}`}
                                  className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[#059669] dark:text-[#10B981] hover:bg-[#10B981]/10"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onToggleBookmark(verse)}
                                  aria-label={`Bookmark Ayah ${verse.surah}:${verse.ayah}`}
                                  className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg ${
                                    isBookmarked
                                      ? 'text-[#B4891B] dark:text-[#D4AF37]'
                                      : 'text-[#57534E] dark:text-[#9CA3AF] hover:text-[#D4AF37]'
                                  }`}
                                >
                                  <Bookmark
                                    className={`h-3.5 w-3.5 ${
                                      isBookmarked ? 'fill-current' : ''
                                    }`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenTafsir(verse)}
                                  aria-label={`Open Tafsir for Ayah ${verse.surah}:${verse.ayah}`}
                                  className="min-h-[32px] px-2 flex items-center gap-1 rounded-lg text-xs text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
                                >
                                  <BookOpenText className="h-3.5 w-3.5" />
                                  <span>{t.tafsir}</span>
                                </button>
                              </div>
                            </div>

                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => handleVerseInteraction(verse)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleVerseInteraction(verse);
                                }
                              }}
                              dir="rtl"
                              className={`w-full text-right ${fontClass} mushaf-script-flow tracking-normal text-[#1C1917] dark:text-[#F4F1EA] cursor-pointer`}
                              style={
                                {
                                  '--q-size': `${settings.fontSize}px`,
                                  '--q-lh': String(settings.lineHeight),
                                } as React.CSSProperties
                              }
                            >
                              {words.map((word, wIdx) => {
                                const wKey = `${ayahKey}:${wIdx}`;
                                const isWordMatched = matchedWordKeys.has(wKey);
                                const isWordMissed =
                                  missedWordKeys.has(wKey) || mistakePulseKey === wKey;
                                const isWordVisible =
                                  isRevealed ||
                                  isWordMatched ||
                                  (hifzFirstWordHint && wIdx === 0);

                                return (
                                  <React.Fragment key={wKey}>
                                    <span
                                      className={`inline tracking-normal transition-all duration-300 rounded-sm ${
                                        !isWordVisible
                                          ? 'blur-[7px] opacity-25 select-none'
                                          : isWordMissed
                                            ? 'bg-rose-500/20 text-amber-600 dark:text-amber-300 underline decoration-rose-400 underline-offset-8 animate-pulse'
                                            : isWordMatched
                                              ? 'text-[#059669] dark:text-[#34D399]'
                                              : ''
                                      }`}
                                    >
                                      {word}
                                    </span>{' '}
                                  </React.Fragment>
                                );
                              })}
                              <span className="inline-block whitespace-nowrap align-baseline mx-1 text-[0.8em] leading-none text-[#B4891B] dark:text-[#D4AF37]">
                                ﴿{toArabicDigits(verse.ayah)}﴾
                              </span>
                            </div>

                            {translations && translations[verse.index] && (
                              <p
                                dir="ltr"
                                className={`mt-2.5 text-sm leading-relaxed text-[#57534E] dark:text-[#9CA3AF] text-left transition-all duration-300 ${
                                  !isRevealed ? 'blur-[4px] opacity-25 select-none' : ''
                                }`}
                              >
                                {translations[verse.index]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Print-Grade Connected RTL Mushaf Flow with Word-Level Hifz & Voice Follow */
                    <div
                      dir="rtl"
                      className={`${fontClass} mushaf-script-flow px-2 sm:px-3 tracking-normal text-right md:text-justify md:[text-align-last:center] text-[#1C1917] dark:text-[#F4F1EA]`}
                      style={
                        {
                          '--q-size': `${settings.fontSize}px`,
                          '--q-lh': String(settings.lineHeight),
                        } as React.CSSProperties
                      }
                    >
                      {items.map((verse) => {
                        const ayahKey = `${verse.surah}:${verse.ayah}`;
                        const isActiveAudio =
                          playingSurah === verse.surah &&
                          playingAyah === verse.ayah &&
                          isPlaying;
                        const isSelected =
                          selectedAyahKey === ayahKey || actionKey === ayahKey;
                        const isBookmarked = bookmarkIds.has(ayahKey);
                        const isRevealed = !hifzMode || revealedAyahKeys.has(ayahKey);
                        const rawText = getVerseTextByRiwayat(
                          verse,
                          settings.riwayat,
                          warshTexts
                        );
                        const displayText =
                          settings.riwayat === 'hafs'
                            ? stripLeadingBismillah(rawText, verse.surah, verse.ayah)
                            : rawText;
                        const words = tokenizeVerseWords(displayText);

                        return (
                          <span
                            key={ayahKey}
                            data-ayah-key={ayahKey}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleVerseInteraction(verse)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleVerseInteraction(verse);
                              }
                            }}
                            aria-label={`Ayah ${verse.surah}:${verse.ayah}`}
                            className={`inline px-1 py-0.5 [box-decoration-break:clone] tracking-normal rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                              isActiveAudio || isSelected
                                ? 'bg-[#D4AF37]/20 text-[#9A710D] dark:text-[#FDE68A]'
                                : '[@media(hover:hover)]:hover:bg-black/[0.04] dark:[@media(hover:hover)]:hover:bg-white/[0.04]'
                            }`}
                          >
                            {words.map((word, wIdx) => {
                              const wKey = `${ayahKey}:${wIdx}`;
                              const isWordMatched = matchedWordKeys.has(wKey);
                              const isWordMissed =
                                missedWordKeys.has(wKey) || mistakePulseKey === wKey;
                              const isWordVisible =
                                isRevealed ||
                                isWordMatched ||
                                (hifzFirstWordHint && wIdx === 0);

                              return (
                                <React.Fragment key={wKey}>
                                  <span
                                    className={`inline tracking-normal transition-all duration-300 rounded-sm ${
                                      !isWordVisible
                                        ? 'blur-[7px] opacity-25 select-none'
                                        : isWordMissed
                                          ? 'bg-rose-500/20 text-amber-600 dark:text-amber-300 underline decoration-rose-400 underline-offset-8 animate-pulse'
                                          : isWordMatched
                                            ? 'text-[#059669] dark:text-[#34D399]'
                                            : ''
                                    }`}
                                  >
                                    {word}
                                  </span>{' '}
                                </React.Fragment>
                              );
                            })}
                            <span
                              className={`inline-block whitespace-nowrap align-baseline mx-1 tracking-normal text-[0.8em] leading-none ${
                                isBookmarked
                                  ? 'text-[#059669] dark:text-[#10B981]'
                                  : 'text-[#B4891B] dark:text-[#D4AF37]'
                              }`}
                            >
                              {verse.sajda ? '۩ ' : ''}﴿{toArabicDigits(verse.ayah)}﴾
                            </span>{' '}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Page Navigation Footer */}
          <div
            dir="ltr"
            className={`mt-6 sm:mt-8 pt-3.5 sm:pt-4 px-3 sm:px-5 pb-0.5 border-t border-[#B4891B]/16 dark:border-white/8 flex items-center justify-between gap-2 sm:gap-4 transition-opacity duration-300 ${
              focusMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={() => onChangePage(Math.min(604, currentPage + 1))}
              disabled={currentPage >= 604}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-[#B4891B]/25 dark:border-white/12 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] disabled:opacity-35 hover:border-[#10B981] transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t.nextPage}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPageJumper((v) => !v)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#F3ECE0]/80 dark:bg-[#13181E] text-[#B4891B] dark:text-[#D4AF37] tabular-nums hover:border-[#10B981] transition-colors whitespace-nowrap"
            >
              <span className="font-quran-scheherazade text-base sm:text-lg leading-none">
                {toArabicDigits(currentPage)} / ٦٠٤
              </span>
            </button>

            <button
              type="button"
              onClick={() => onChangePage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-[#B4891B]/25 dark:border-white/12 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA] disabled:opacity-35 hover:border-[#10B981] transition-colors whitespace-nowrap"
            >
              <span>{t.prevPage}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          </div>
        </article>
      </div>

      {/* Subtle Corner Chip to Exit Tap-to-Focus Mode */}
      {focusMode && (
        <button
          type="button"
          onClick={onToggleFocusMode}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#13181E]/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-[#F4F1EA] shadow-lg hover:border-[#10B981]"
        >
          <Maximize2 className="h-3.5 w-3.5 text-[#10B981]" />
          <span>{t.exitFocus}</span>
        </button>
      )}

      {/* Tap-Ayah Floating Action Menu */}
      {actionMenuVerse && (
        <div
          role="region"
          aria-label={`Actions for Ayah ${actionMenuVerse.surah}:${actionMenuVerse.ayah}`}
          className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.25rem)] max-w-xl rounded-2xl border border-[#B4891B]/40 dark:border-white/16 bg-[#FAF6EE]/96 dark:bg-[#13181E]/96 backdrop-blur-md px-3 py-2 shadow-2xl flex items-center justify-between gap-2"
        >
          <span className="text-xs font-bold text-[#B4891B] dark:text-[#D4AF37] tabular-nums px-1 whitespace-nowrap">
            {actionMenuVerse.surah}:{actionMenuVerse.ayah}
          </span>

          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                onPlayAyah(actionMenuVerse.surah, actionMenuVerse.ayah);
                setActionMenuVerse(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] dark:bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white dark:text-[#0B0E11] whitespace-nowrap hover:opacity-90"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t.playFromHere}</span>
            </button>

            {hifzMode && actionKey && (
              <button
                type="button"
                onClick={() => {
                  onToggleRevealAyah(actionKey);
                  setActionMenuVerse(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-[#B4891B]/25 dark:border-white/15 px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] whitespace-nowrap"
              >
                {revealedAyahKeys.has(actionKey) ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleBookmark(actionMenuVerse)}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActionVerseBookmarked
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#B4891B] dark:text-[#D4AF37]'
                  : 'border-[#B4891B]/25 dark:border-white/15 text-[#1C1917] dark:text-[#F4F1EA]'
              }`}
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${isActionVerseBookmarked ? 'fill-current' : ''}`}
              />
              <span className="hidden sm:inline">
                {isActionVerseBookmarked ? t.bookmarked : t.bookmark}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const target = actionMenuVerse;
                setActionMenuVerse(null);
                onOpenTafsir(target);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-[#B4891B]/25 dark:border-white/15 px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37] whitespace-nowrap"
            >
              <BookOpenText className="h-3.5 w-3.5 text-[#B4891B] dark:text-[#D4AF37]" />
              <span>{t.tafsir}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopyVerse(actionMenuVerse)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#B4891B]/25 dark:border-white/15 px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37] whitespace-nowrap"
            >
              {copiedKey === actionKey ? (
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {copiedKey === actionKey ? t.copied : t.copy}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActionMenuVerse(null)}
            aria-label="Close Ayah action menu"
            className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
