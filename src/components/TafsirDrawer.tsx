import React, {useState} from 'react';
import {Bookmark, Check, Copy, Play, X} from 'lucide-react';
import type {QuranVerse, Riwayat, SurahMeta} from '../types/quran';
import {toArabicDigits} from '../utils/quranLogic';
import {getVerseTextByRiwayat} from '../services/quranLoader';
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
  isBookmarked: boolean;
  onClose: () => void;
  onPlayAyah: (surah: number, ayah: number) => void;
  onToggleBookmark: (verse: QuranVerse) => void;
}

export const TafsirDrawer: React.FC<TafsirDrawerProps> = ({
  lang,
  t,
  verse,
  surahMeta,
  riwayat,
  warshTexts,
  tafsirTexts,
  translations,
  isBookmarked,
  onClose,
  onPlayAyah,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'tafsir' | 'translation'>('tafsir');

  if (!verse) return null;

  const arabicText = getVerseTextByRiwayat(verse, riwayat, warshTexts);
  const tafsir = tafsirTexts?.[verse.index];
  const translation = translations?.[verse.index];
  const surahDisplay =
    lang === 'ar'
      ? surahMeta?.nameAr || `${t.surahWord} ${toArabicDigits(verse.surah)}`
      : surahMeta?.nameEn || `Surah ${verse.surah}`;

  const handleCopy = async () => {
    try {
      const payload = `${arabicText} ﴿${toArabicDigits(verse.ayah)}﴾\n[${surahDisplay} ${verse.surah}:${verse.ayah}]`;
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-sm p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${t.tafsir} ${verse.surah}:${verse.ayah}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#1B1410] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden w-10 h-1.5 bg-amber-500/30 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-amber-500/12">
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
            aria-label="Close Tafsir drawer"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div
            dir="rtl"
            className="rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#241B15] p-4 sm:p-5 font-quran-amiri text-2xl sm:text-3xl leading-[2.2] tracking-normal text-[#2D231E] dark:text-[#FAF5EE]"
          >
            {arabicText}{' '}
            <span className="text-[#B45309] dark:text-[#FBBF24]">
              ﴿{toArabicDigits(verse.ayah)}﴾
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-amber-500/12 dark:bg-[#241B15]">
            <button
              type="button"
              onClick={() => setActiveSection('tafsir')}
              className={`flex-1 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                activeSection === 'tafsir'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.tafsirMuyassarTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('translation')}
              className={`flex-1 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                activeSection === 'translation'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              {t.englishTranslationTab}
            </button>
          </div>

          {activeSection === 'tafsir' ? (
            <div className="space-y-2">
              {tafsir ? (
                <p
                  dir="rtl"
                  className="font-quran-scheherazade text-xl sm:text-2xl leading-[2.0] tracking-normal text-[#2D231E] dark:text-[#FAF5EE]"
                >
                  {tafsir}
                </p>
              ) : (
                <p className="text-sm text-[#6E5649] dark:text-[#D6C7B8]">
                  {t.loadingTafsir}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {translation ? (
                <p
                  dir="ltr"
                  className="text-sm sm:text-base leading-relaxed text-[#2D231E] dark:text-[#FAF5EE]"
                >
                  {translation}
                </p>
              ) : (
                <p className="text-sm text-[#6E5649] dark:text-[#D6C7B8]">
                  {t.loadingTranslation}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-amber-500/12 bg-[#FAF5EE] dark:bg-[#221914] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onPlayAyah(verse.surah, verse.ayah)}
            className="inline-flex items-center gap-2 rounded-full bg-[#D97706] hover:bg-[#B45309] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{t.listenAyah}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(verse)}
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
