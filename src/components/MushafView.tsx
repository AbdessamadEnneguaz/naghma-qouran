import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Play,
  Share2,
  SlidersHorizontal,
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
  stripTashkeel,
  toArabicDigits,
  tokenizeVerseWords,
} from '../utils/quranLogic';
import {getVerseTextByRiwayat} from '../services/quranLoader';
import {
  ACTIVE_VERSE_ATTR,
  VERSE_KEY_ATTR,
  shouldAutoScrollToVerse,
  syncActiveVerseDomHighlight,
} from '../utils/verseHighlightDom';
import {SurahCartoucheBanner} from './OrnamentalSvg';
import {MushafSettingsSheet} from './MushafSettingsSheet';
import type {AppLang, Translations} from '../i18n/translations';

const AyahMedallion: React.FC<{
  ayah: number;
  isBookmarked: boolean;
  isSajda?: boolean;
}> = ({ayah, isBookmarked, isSajda}) => {
  const digits = toArabicDigits(ayah);
  const svgFontSize = ayah >= 100 ? '9.5' : ayah >= 10 ? '11' : '13';
  const strokeColor = isBookmarked ? '#EA580C' : '#B45309';
  const fillTint = isBookmarked ? 'rgba(234, 88, 12, 0.14)' : 'rgba(217, 119, 6, 0.08)';

  return (
    <span
      className="inline-flex items-center justify-center align-baseline mx-1 whitespace-nowrap select-none"
      style={{verticalAlign: '-0.22em'}}
      aria-hidden="true"
    >
      {isSajda && (
        <span className="text-[0.72em] text-[#D97706] me-0.5 leading-none">۩</span>
      )}
      <svg
        viewBox="0 0 36 36"
        className="w-[1.28em] h-[1.28em] shrink-0 overflow-visible"
      >
        <rect
          x="6.5"
          y="6.5"
          width="23"
          height="23"
          rx="4"
          fill={fillTint}
          stroke={strokeColor}
          strokeWidth="1.45"
        />
        <rect
          x="6.5"
          y="6.5"
          width="23"
          height="23"
          rx="4"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          transform="rotate(45 18 18)"
        />
        <circle
          cx="18"
          cy="18"
          r="9.8"
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.8"
          strokeOpacity="0.55"
        />
        <text
          x="18"
          y="19"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className={
            isBookmarked
              ? 'text-[#EA580C] dark:text-[#FB923C]'
              : 'text-[#92400E] dark:text-[#FBBF24]'
          }
          style={{
            fontFamily: 'var(--font-quran-scheherazade)',
            fontSize: `${svgFontSize}px`,
            fontWeight: 700,
          }}
        >
          {digits}
        </text>
      </svg>
    </span>
  );
};

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

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

type ReaderBrowseTab = 'quran' | 'surah' | 'juz' | 'page';

const MushafViewInner: React.FC<MushafViewProps> = ({
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
  const [browseTab, setBrowseTab] = useState<ReaderBrowseTab>('quran');
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [surahQuery, setSurahQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sharedKey, setSharedKey] = useState<string | null>(null);
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
    const surahStartingHere = displayVerses.find((v) => v.ayah === 1)?.surah;
    const idOnPage =
      surahStartingHere ||
      (displayVerses.some((v) => v.surah === currentSurahId)
        ? currentSurahId
        : primaryVerse?.surah || currentSurahId);
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

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim().toLowerCase();
    const qAr = stripTashkeel(surahQuery.trim());
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        String(s.id) === q ||
        s.nameEn.toLowerCase().includes(q) ||
        s.meaningEn.toLowerCase().includes(q) ||
        stripTashkeel(s.nameAr).includes(qAr)
    );
  }, [surahs, surahQuery]);

  const fontClass =
    settings.font === 'amiri' ? 'font-quran-amiri' : 'font-quran-scheherazade';

  const lastScrolledPlayingRef = useRef<string | null>(null);
  const lastUserScrollMsRef = useRef<number>(0);

  useEffect(() => {
    const markUserScroll = () => {
      lastUserScrollMsRef.current = Date.now();
    };
    window.addEventListener('wheel', markUserScroll, {passive: true});
    window.addEventListener('touchmove', markUserScroll, {passive: true});
    return () => {
      window.removeEventListener('wheel', markUserScroll);
      window.removeEventListener('touchmove', markUserScroll);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    syncActiveVerseDomHighlight(playingSurah, playingAyah, isPlaying, containerRef.current);

    if (!isPlaying) {
      lastScrolledPlayingRef.current = null;
      return;
    }
    const key = `${playingSurah}:${playingAyah}@${currentPage}`;
    if (lastScrolledPlayingRef.current === key) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[${VERSE_KEY_ATTR}="${playingSurah}:${playingAyah}"]`
    );
    if (el) {
      lastScrolledPlayingRef.current = key;
      if (shouldAutoScrollToVerse(lastUserScrollMsRef.current, Date.now(), 4000)) {
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  }, [isPlaying, playingSurah, playingAyah, currentPage, displayVerses]);

  useEffect(() => {
    if (!selectedAyahKey || !containerRef.current) return;
    const idx = displayVerses.findIndex(
      (v) => `${v.surah}:${v.ayah}` === selectedAyahKey
    );
    if (idx > 0 && shouldAutoScrollToVerse(lastUserScrollMsRef.current, Date.now(), 2500)) {
      const raf = requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(
          `[${VERSE_KEY_ATTR}="${selectedAyahKey}"]`
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
    if (browseTab !== 'quran') return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx > 48 && currentPage < 604) {
      onChangePage(currentPage + 1);
    } else if (dx < -48 && currentPage > 1) {
      onChangePage(currentPage - 1);
    }
  };

  const handleCanvasTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (browseTab !== 'quran' || settingsSheetOpen) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, [role="button"], select, input, a, [role="region"], [role="dialog"]'
      )
    ) {
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
    onOpenTafsir(verse);
  };

  const formatVersePayload = (verse: QuranVerse) => {
    const text = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
    const sMeta = surahMap.get(verse.surah);
    const tr = translations?.[verse.index];
    return `${text} ﴿${toArabicDigits(verse.ayah)}﴾${tr ? `\n"${tr}"` : ''}\n[${sMeta?.nameEn || verse.surah} ${verse.surah}:${verse.ayah} · Mihrab Noor]`;
  };

  const handleCopyVerse = async (verse: QuranVerse) => {
    try {
      await navigator.clipboard.writeText(formatVersePayload(verse));
      const key = `${verse.surah}:${verse.ayah}`;
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  const handleShareVerse = async (verse: QuranVerse) => {
    const key = `${verse.surah}:${verse.ayah}`;
    const payload = formatVersePayload(verse);
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: `Mihrab Noor ${verse.surah}:${verse.ayah}`,
          text: payload,
        });
      } else {
        await navigator.clipboard.writeText(payload);
      }
      setSharedKey(key);
      setTimeout(() => setSharedKey(null), 1800);
    } catch {
      // Fallback copy if share cancelled
      try {
        await navigator.clipboard.writeText(payload);
        setSharedKey(key);
        setTimeout(() => setSharedKey(null), 1800);
      } catch {
        // ignore clipboard failure
      }
    }
  };

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`min-h-[calc(100vh-52px)] mushaf-frame transition-all duration-300 ${
        focusMode ? 'pt-5 pb-16' : 'pt-2 sm:pt-4 pb-44 md:pb-32'
      }`}
    >
      {/* Top Reader Bar & Interactive Quran / Surah / Juz / Page Toggle */}
      <div
        className={`mx-auto max-w-3xl px-4 sm:px-8 transition-all duration-300 ${
          focusMode
            ? 'h-0 overflow-hidden opacity-0 pointer-events-none'
            : 'opacity-100 mb-3 sm:mb-4 space-y-2.5'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Interactive Segmented Toggle: Quran | Surah | Juz | Page */}
          <div
            role="tablist"
            aria-label="Mushaf Browse Modes"
            data-testid="mushaf-browse-toggle"
            className="inline-flex items-center rounded-full bg-amber-500/12 dark:bg-[#241B15] border border-amber-500/15 p-1"
          >
            {(
              [
                {id: 'quran', label: t.modeQuran},
                {id: 'surah', label: t.modeSurah},
                {id: 'juz', label: t.modeJuz},
                {id: 'page', label: t.modePage},
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                data-testid={`mushaf-tab-${tab.id}`}
                aria-selected={browseTab === tab.id}
                onClick={() => setBrowseTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  browseTab === tab.id
                    ? 'bg-white dark:bg-[#D97706] text-[#B45309] dark:text-white shadow-sm'
                    : 'text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E] dark:hover:text-[#FAF5EE]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Decluttered Controls: Touch-Friendly Settings Sheet Trigger + Offline Download */}
          <div className="flex items-center gap-2">
            {headerSurahMeta && (
              <button
                type="button"
                onClick={() => onDownloadSurah(headerSurahMeta)}
                disabled={isDownloadingThisSurah}
                title={isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline}
                aria-label={isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border transition-colors ${
                  isSurahDownloaded
                    ? 'border-[#D97706]/40 bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                    : 'border-amber-500/20 bg-white/85 dark:bg-[#221914] text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#D97706]'
                }`}
              >
                {isDownloadingThisSurah ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSurahDownloaded ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            )}

            <button
              type="button"
              data-testid="mushaf-settings-trigger"
              onClick={() => setSettingsSheetOpen(true)}
              aria-label={t.settingsBtn}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/25 bg-white/90 dark:bg-[#221914] text-xs sm:text-sm font-bold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] shadow-sm transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span>{t.settingsBtn}</span>
            </button>
          </div>
        </div>

        {/* Hifz Mode Active Strip */}
        {hifzMode && browseTab === 'quran' && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs">
            <span className="font-semibold text-[#B45309] dark:text-[#FBBF24]">
              {t.hifzActiveBanner}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleFirstWordHint}
                className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  hifzFirstWordHint
                    ? 'bg-[#D97706] text-white'
                    : 'bg-white/75 dark:bg-[#221914] text-[#2D231E] dark:text-[#FAF5EE]'
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
                className="px-2.5 py-1 rounded-full bg-white/75 dark:bg-[#221914] font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
              >
                {revealedAyahKeys.size >= pageAyahKeys.length ? t.hideAll : t.revealAll}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline Tab: SURAH LIST */}
      {browseTab === 'surah' && (
        <div className="mx-auto max-w-3xl px-4 sm:px-8 space-y-3" data-testid="mushaf-surah-panel">
          <input
            type="text"
            value={surahQuery}
            onChange={(e) => setSurahQuery(e.target.value)}
            placeholder={t.filterSurahPlaceholder}
            aria-label={t.filterSurahPlaceholder}
            className="w-full rounded-2xl border border-amber-500/18 bg-white/80 dark:bg-[#211914] px-4 py-2.5 text-sm text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
          <div className="rounded-3xl border border-amber-500/12 bg-white/75 dark:bg-[#211914]/85 divide-y divide-amber-500/10 overflow-hidden shadow-sm">
            {filteredSurahs.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChangeSurah(s.id);
                  setBrowseTab('quran');
                }}
                className="w-full px-4 py-3 text-start hover:bg-amber-500/8 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-8 w-8 rounded-full bg-amber-500/12 text-xs font-bold text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center tabular-nums shrink-0">
                    {String(s.id).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate">
                      {lang === 'ar' ? s.nameAr : s.nameEn}
                    </div>
                    <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                      {numFmt(s.totalAyahs)} {t.ayahsWord} · {t.pageShort} {numFmt(s.startPage)}
                    </div>
                  </div>
                </div>
                <span
                  dir="rtl"
                  className="font-quran-scheherazade text-lg text-[#B45309] dark:text-[#FBBF24] shrink-0"
                >
                  {s.nameAr.replace('سُورَةُ ', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline Tab: JUZ LIST */}
      {browseTab === 'juz' && (
        <div className="mx-auto max-w-3xl px-4 sm:px-8" data-testid="mushaf-juz-panel">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {JUZ_START_PAGES.map((startPage, idx) => {
              const juzNum = idx + 1;
              return (
                <button
                  key={juzNum}
                  type="button"
                  onClick={() => {
                    onChangePage(startPage);
                    setBrowseTab('quran');
                  }}
                  className="rounded-2xl border border-amber-500/15 bg-white/80 dark:bg-[#211914] p-4 text-start hover:border-[#D97706] transition-colors space-y-1 shadow-sm"
                >
                  <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
                    {t.juzWord} {numFmt(juzNum)}
                  </div>
                  <div className="font-quran-scheherazade text-base text-[#B45309] dark:text-[#FBBF24]">
                    الجزء {toArabicDigits(juzNum)}
                  </div>
                  <div className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                    {t.pageShort} {numFmt(startPage)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Tab: PAGE JUMPER */}
      {browseTab === 'page' && (
        <div className="mx-auto max-w-3xl px-4 sm:px-8" data-testid="mushaf-page-panel">
          <div className="rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#211914] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                  {t.jumpToPageLabel}
                </h2>
                <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                  {t.pageWord} {numFmt(currentPage)} {t.ofWord} {numFmt(604)}
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = Number(pageJumpInput);
                  if (Number.isFinite(num) && num >= 1 && num <= 604) {
                    onChangePage(Math.round(num));
                    setBrowseTab('quran');
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={pageJumpInput}
                  onChange={(e) => setPageJumpInput(e.target.value)}
                  aria-label={t.pageWord}
                  className="w-20 rounded-full border border-amber-500/25 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-1.5 text-xs font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#D97706] px-4 py-1.5 text-xs font-semibold text-white"
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
              className="w-full accent-[#D97706] cursor-pointer"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                {label: lang === 'ar' ? 'الفاتحة · ص ١' : 'Al-Fatihah · p.1', p: 1},
                {label: lang === 'ar' ? 'البقرة · ص ٢' : 'Al-Baqarah · p.2', p: 2},
                {label: lang === 'ar' ? 'الكهف · ص ٢٩٣' : 'Al-Kahf · p.293', p: 293},
                {label: lang === 'ar' ? 'يس · ص ٤٤٠' : 'Ya-Sin · p.440', p: 440},
                {label: lang === 'ar' ? 'الملك · ص ٥٦٢' : 'Al-Mulk · p.562', p: 562},
              ].map((item) => (
                <button
                  key={item.p}
                  type="button"
                  onClick={() => {
                    onChangePage(item.p);
                    setBrowseTab('quran');
                  }}
                  className="rounded-full border border-amber-500/20 bg-[#FAF5EE] dark:bg-[#17110D] px-3.5 py-1.5 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Warm Borderless Mushaf Reading Canvas */}
      {browseTab === 'quran' && (
        <div className="relative mx-auto max-w-4xl lg:px-14 pb-6" dir="ltr">
          {!focusMode && (
            <>
              <button
                type="button"
                onClick={() => onChangePage(Math.min(604, currentPage + 1))}
                disabled={currentPage >= 604}
                aria-label={`${t.nextPage} (${Math.min(604, currentPage + 1)})`}
                className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-white/85 dark:bg-[#221914]/90 text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] disabled:opacity-25 shadow-sm transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onChangePage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                aria-label={`${t.prevPage} (${Math.max(1, currentPage - 1)})`}
                className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-white/85 dark:bg-[#221914]/90 text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] disabled:opacity-25 shadow-sm transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <article
            data-testid="mushaf-page-frame"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="relative mx-2.5 my-1 sm:mx-auto max-w-3xl rounded-3xl border border-amber-500/15 bg-white/92 dark:bg-[#211914]/95 md:bg-white/80 md:dark:bg-[#211914]/90 md:backdrop-blur-md p-4 sm:p-8 shadow-sm shadow-amber-500/5 overflow-hidden"
          >
            <div className="relative z-10 px-0.5 sm:px-2 py-0.5 sm:py-1">
              {/* Subtle Madani Mushaf Page Header (Surah on one side, Juz' on opposite side) */}
              <div
                dir="rtl"
                data-testid="mushaf-top-header"
                className="flex items-center justify-between gap-2 text-xs font-medium text-amber-900/60 dark:text-amber-200/65 px-2 sm:px-4 pt-0.5 pb-2.5 mb-3.5 sm:mb-5 border-b border-amber-500/12 tabular-nums"
              >
                <span className="font-quran-scheherazade text-sm sm:text-base whitespace-nowrap truncate">
                  {lang === 'ar'
                    ? headerSurahMeta?.nameAr.replace('سُورَةُ ', '')
                    : `${headerSurahMeta?.nameAr.replace('سُورَةُ ', '') || ''} · ${
                        headerSurahMeta?.transliteration || headerSurahMeta?.nameEn || ''
                      }`}
                </span>
                <span className="whitespace-nowrap">
                  {lang === 'ar'
                    ? `الجزء ${toArabicDigits(primaryVerse?.juz || 1)}`
                    : `الجزء ${toArabicDigits(primaryVerse?.juz || 1)} · Part ${
                        primaryVerse?.juz || 1
                      }`}
                </span>
              </div>

              {/* Surah Groups */}
              <div className="space-y-4 sm:space-y-6">
                {surahGroups.map(({surah, items}) => {
                  const startsAtBeginning = items[0]?.ayah === 1;
                  const showBismillah =
                    startsAtBeginning && surah.id !== 1 && surah.id !== 9;

                  return (
                    <div key={surah.id} className="space-y-2.5 sm:space-y-3.5">
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
                          data-testid={`surah-bismillah-${surah.id}`}
                          className={`${fontClass} tracking-normal text-center text-[21px] sm:text-[26px] leading-[2.05] text-[#2D231E] dark:text-[#FDE68A]/95 py-0.5`}
                        >
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </div>
                      )}

                      {settings.showTranslation ? (
                        <div className="divide-y divide-amber-500/10">
                          {items.map((verse) => {
                            const ayahKey = `${verse.surah}:${verse.ayah}`;
                            const isActiveAudio =
                              isPlaying &&
                              playingSurah === verse.surah &&
                              playingAyah === verse.ayah;
                            const isSelected = selectedAyahKey === ayahKey || isActiveAudio;
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
                                {...{[VERSE_KEY_ATTR]: ayahKey}}
                                {...(isActiveAudio ? {[ACTIVE_VERSE_ATTR]: 'true'} : {})}
                                className={`py-4 px-2.5 sm:px-4 rounded-2xl transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500/12 dark:bg-amber-500/15'
                                    : 'hover:bg-amber-500/[0.04]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-bold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                                    {verse.surah}:{verse.ayah}
                                    {verse.sajda && (
                                      <span className="ms-1.5 text-[#D97706]">· Sajdah ۩</span>
                                    )}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => onOpenTafsir(verse)}
                                    className="text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#D97706]"
                                  >
                                    {t.tafsir}
                                  </button>
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
                                  className={`w-full text-right ${fontClass} mushaf-script-flow tracking-normal text-[#2D231E] dark:text-[#FAF5EE] cursor-pointer`}
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
                                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 underline decoration-rose-400 underline-offset-8 animate-pulse'
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
                                  <span className="inline-block whitespace-nowrap align-baseline mx-1 text-[0.8em] leading-none text-[#B45309] dark:text-[#FBBF24]">
                                    ﴿{toArabicDigits(verse.ayah)}﴾
                                  </span>
                                </div>

                                {translations && translations[verse.index] && (
                                  <p
                                    dir="ltr"
                                    className={`mt-2.5 text-sm leading-relaxed text-[#4E3629] dark:text-[#D6C7B8] text-left transition-all duration-300 ${
                                      !isRevealed ? 'blur-[4px] opacity-25 select-none' : ''
                                    }`}
                                  >
                                    {translations[verse.index]}
                                  </p>
                                )}

                                {/* Subtle Quick Amber Circular Action Icons Below Each Verse */}
                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onPlayAyah(verse.surah, verse.ayah)}
                                    aria-label={`Play Ayah ${verse.surah}:${verse.ayah}`}
                                    className="h-8 w-8 flex items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500 hover:text-white transition-colors"
                                  >
                                    <Play className="h-3.5 w-3.5 fill-current ms-0.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onToggleBookmark(verse)}
                                    aria-label={`Bookmark Ayah ${verse.surah}:${verse.ayah}`}
                                    className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors ${
                                      isBookmarked
                                        ? 'border-[#D97706] bg-[#D97706] text-white'
                                        : 'border-amber-500/25 bg-amber-500/10 text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/20'
                                    }`}
                                  >
                                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => void handleShareVerse(verse)}
                                    aria-label={`Share Ayah ${verse.surah}:${verse.ayah}`}
                                    className="h-8 w-8 flex items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/20 transition-colors"
                                  >
                                    {sharedKey === ayahKey ? (
                                      <Check className="h-3.5 w-3.5" />
                                    ) : (
                                      <Share2 className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Authentic Continuous Justified Madani Mushaf RTL Block */
                        <div
                          dir="rtl"
                          data-testid={`mushaf-justified-block-${surah.id}`}
                          className={`${fontClass} mushaf-script-flow mushaf-justified px-1 sm:px-3 text-[#2D231E] dark:text-[#FAF5EE]`}
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
                            const isSelected = selectedAyahKey === ayahKey || isActiveAudio;
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
                                {...{[VERSE_KEY_ATTR]: ayahKey}}
                                {...(isActiveAudio ? {[ACTIVE_VERSE_ATTR]: 'true'} : {})}
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
                                className={`inline px-0.5 [box-decoration-break:clone] tracking-normal rounded transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D97706] ${
                                  isSelected
                                    ? 'bg-[#FDE68A]/75 dark:bg-amber-500/25'
                                    : '[@media(hover:hover)]:hover:bg-[#FDE68A]/35 dark:[@media(hover:hover)]:hover:bg-amber-500/10'
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
                                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 underline decoration-rose-400 underline-offset-8 animate-pulse'
                                              : isWordMatched
                                                ? 'text-[#059669] dark:text-[#34D399]'
                                                : ''
                                        }`}
                                      >
                                        {word}
                                      </span>
                                      {wIdx < words.length - 1 ? ' ' : '\u00A0'}
                                    </React.Fragment>
                                  );
                                })}
                                <AyahMedallion
                                  ayah={verse.ayah}
                                  isBookmarked={isBookmarked}
                                  isSajda={verse.sajda}
                                />{' '}
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
                className={`mt-6 sm:mt-8 pt-3.5 sm:pt-4 px-2 sm:px-4 pb-0.5 border-t border-amber-500/12 flex items-center justify-between gap-2 sm:gap-4 transition-opacity duration-300 ${
                  focusMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onChangePage(Math.min(604, currentPage + 1))}
                  disabled={currentPage >= 604}
                  className="min-h-[40px] inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-500/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] disabled:opacity-35 hover:border-[#D97706] transition-colors whitespace-nowrap"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{t.nextPage}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrowseTab('page')}
                  className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-full border border-amber-500/25 bg-[#FAF5EE] dark:bg-[#19120E] text-[#B45309] dark:text-[#FBBF24] tabular-nums hover:border-[#D97706] transition-colors whitespace-nowrap"
                >
                  <span className="font-quran-scheherazade text-base sm:text-lg leading-none">
                    {toArabicDigits(currentPage)} / ٦٠٤
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="min-h-[40px] inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-500/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] disabled:opacity-35 hover:border-[#D97706] transition-colors whitespace-nowrap"
                >
                  <span>{t.prevPage}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Subtle Corner Chip to Exit Tap-to-Focus Mode */}
      {focusMode && (
        <button
          type="button"
          onClick={onToggleFocusMode}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-white/95 dark:bg-[#221914]/98 md:backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] shadow-lg hover:border-[#D97706]"
        >
          <Maximize2 className="h-3.5 w-3.5 text-[#D97706]" />
          <span>{t.exitFocus}</span>
        </button>
      )}

      <MushafSettingsSheet
        isOpen={settingsSheetOpen}
        lang={lang}
        t={t}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onClose={() => setSettingsSheetOpen(false)}
      />
    </div>
  );
};

export const MushafView = React.memo(MushafViewInner);

