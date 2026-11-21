import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Search, X} from 'lucide-react';
import type {QuranVerse, SearchResult, SurahMeta} from '../types/quran';
import {searchQuran, toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';

interface SearchModalProps {
  lang: AppLang;
  t: Translations;
  isOpen: boolean;
  verses: QuranVerse[];
  surahs: SurahMeta[];
  translations: string[] | null;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  lang,
  t,
  isOpen,
  verses,
  surahs,
  translations,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchQuran(verses, surahs, query, translations || undefined, 40);
  }, [verses, surahs, query, translations]);

  if (!isOpen) return null;

  const suggestions = [
    {
      label: lang === 'ar' ? '2:255 (آية الكرسي)' : '2:255 (Ayat al-Kursi)',
      query: '2:255',
    },
    {
      label: lang === 'ar' ? 'p:604 (الصفحة الأخيرة)' : 'p:604 (Last Page)',
      query: 'p:604',
    },
    {label: 'الرحمن', query: 'الرحمن'},
    {label: 'الحمد لله', query: 'الحمد لله'},
  ];

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 pt-10 sm:pt-16"
      role="dialog"
      aria-modal="true"
      aria-label={t.searchBtn}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#13181E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#B4891B]/16 dark:border-[#D4AF37]/14">
          <Search className="h-5 w-5 text-[#B4891B] dark:text-[#D4AF37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchBtn}
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[#1C1917] dark:text-[#F7F4EB] placeholder:text-[#57534E]/60 dark:placeholder:text-[#9CAFA6]/55 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[#57534E] dark:text-[#9CAFA6] hover:text-[#1C1917] dark:hover:text-[#F7F4EB] px-2 py-1"
            >
              {t.clear}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#57534E] dark:text-[#9CAFA6] hover:bg-[#EAE3D5] dark:hover:bg-[#06100D]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!query.trim() ? (
            <div className="space-y-4 py-2">
              <p className="text-xs font-semibold text-[#57534E] dark:text-[#9CAFA6]">
                {t.searchShortcutsTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => setQuery(s.query)}
                    className="rounded-xl border border-[#B4891B]/18 dark:border-[#D4AF37]/16 bg-[#F3ECE0] dark:bg-[#06100D] px-3.5 py-2.5 text-start text-xs sm:text-sm font-medium text-[#1C1917] dark:text-[#F7F4EB] hover:border-[#D4AF37] transition-colors flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                    <DirArrow className="h-3.5 w-3.5 text-[#B4891B] dark:text-[#D4AF37]" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6]">
                {t.searchFooterNote}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#57534E] dark:text-[#9CAFA6]">
              {t.noSearchMatch}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#57534E] dark:text-[#9CAFA6] tabular-nums">
                {lang === 'ar' ? toArabicDigits(results.length) : results.length} {t.matchesFound}
              </p>
              {results.map((item, idx) => (
                <button
                  key={`${item.type}-${item.surah}-${item.ayah}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className="w-full text-start rounded-xl border border-[#B4891B]/16 dark:border-[#D4AF37]/14 bg-[#F3ECE0]/60 dark:bg-[#06100D]/70 p-3.5 hover:border-[#D4AF37] transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
                    <span>
                      {lang === 'ar' ? item.surahNameAr : item.surahNameEn} ·{' '}
                      {lang === 'ar'
                        ? `${toArabicDigits(item.surah)}:${toArabicDigits(item.ayah)}`
                        : `${item.surah}:${item.ayah}`}{' '}
                      · {t.pageWord} {lang === 'ar' ? toArabicDigits(item.page) : item.page}
                    </span>
                    <span className="font-quran-scheherazade text-base">
                      {item.surahNameAr}
                    </span>
                  </div>
                  <p
                    dir="rtl"
                    className="font-quran-amiri text-xl leading-[2.0] tracking-normal text-[#1C1917] dark:text-[#F7F4EB]"
                  >
                    {item.text}{' '}
                    <span className="text-[#B4891B] dark:text-[#D4AF37]">
                      ﴿{toArabicDigits(item.ayah)}﴾
                    </span>
                  </p>
                  {item.translation && (
                    <p
                      dir="ltr"
                      className="text-xs text-[#57534E] dark:text-[#9CAFA6] line-clamp-2"
                    >
                      {item.translation}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
