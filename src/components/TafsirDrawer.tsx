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
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#13181E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden w-10 h-1.5 bg-[#57534E]/30 dark:bg-[#9CAFA6]/30 rounded-full mx-auto mt-3" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#B4891B]/16 dark:border-[#D4AF37]/14">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F7F4EB] truncate tabular-nums">
              {surahDisplay} ·{' '}
              {lang === 'ar'
                ? `${toArabicDigits(verse.surah)}:${toArabicDigits(verse.ayah)}`
                : `Ayah ${verse.surah}:${verse.ayah}`}
            </h3>
            <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
              {t.pageWord} {lang === 'ar' ? toArabicDigits(verse.page) : verse.page} ·{' '}
              {t.juzWord} {lang === 'ar' ? toArabicDigits(verse.juz) : verse.juz} ·{' '}
              {riwayat === 'warsh' ? t.warshLabel : t.hafsLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Tafsir drawer"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#57534E] dark:text-[#9CAFA6] hover:bg-[#EAE3D5] dark:hover:bg-[#06100D] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div
            dir="rtl"
            className="rounded-2xl border border-[#B4891B]/18 dark:border-[#D4AF37]/16 bg-[#F3ECE0] dark:bg-[#06100D] p-4 sm:p-5 font-quran-amiri text-2xl sm:text-3xl leading-[2.2] tracking-normal text-[#1C1917] dark:text-[#F7F4EB]"
          >
            {arabicText}{' '}
            <span className="text-[#B4891B] dark:text-[#D4AF37]">
              ﴿{toArabicDigits(verse.ayah)}﴾
            </span>
          </div>

          {/* Segmented Switch: Tafsir Al-Muyassar vs English Translation */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE0] dark:bg-[#06100D]">
            <button
              type="button"
              onClick={() => setActiveSection('tafsir')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeSection === 'tafsir'
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                  : 'text-[#57534E] dark:text-[#9CAFA6]'
              }`}
            >
              {t.tafsirMuyassarTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('translation')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeSection === 'translation'
                  ? 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#06100D]'
                  : 'text-[#57534E] dark:text-[#9CAFA6]'
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
                  className="font-quran-scheherazade text-xl sm:text-2xl leading-[2.0] tracking-normal text-[#1C1917] dark:text-[#F7F4EB]"
                >
                  {tafsir}
                </p>
              ) : (
                <p className="text-sm text-[#57534E] dark:text-[#9CAFA6]">
                  {t.loadingTafsir}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {translation ? (
                <p
                  dir="ltr"
                  className="text-sm sm:text-base leading-relaxed text-[#1C1917] dark:text-[#F7F4EB]"
                >
                  {translation}
                </p>
              ) : (
                <p className="text-sm text-[#57534E] dark:text-[#9CAFA6]">
                  {t.loadingTranslation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#B4891B]/16 dark:border-[#D4AF37]/14 bg-[#F3ECE0]/70 dark:bg-[#06100D]/70 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onPlayAyah(verse.surah, verse.ayah)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#059669] dark:bg-[#10B981] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#06100D] hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{t.listenAyah}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(verse)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                isBookmarked
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#B4891B] dark:text-[#D4AF37]'
                  : 'border-[#B4891B]/22 dark:border-[#D4AF37]/22 text-[#1C1917] dark:text-[#F7F4EB]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? t.bookmarked : t.bookmark}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#B4891B]/22 dark:border-[#D4AF37]/22 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F7F4EB] hover:border-[#D4AF37] transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-[#10B981]" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
