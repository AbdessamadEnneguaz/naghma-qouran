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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-sm p-3 sm:p-6 pt-10 sm:pt-16"
      role="dialog"
      aria-modal="true"
      aria-label={t.searchBtn}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-3xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#1B1410] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-amber-500/12">
          <Search className="h-5 w-5 text-[#D97706] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchBtn}
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[#2D231E] dark:text-[#FAF5EE] placeholder:text-[#6E5649]/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E] px-2 py-1"
            >
              {t.clear}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!query.trim() ? (
            <div className="space-y-4 py-2">
              <p className="text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                {t.searchShortcutsTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => setQuery(s.query)}
                    className="rounded-2xl border border-amber-500/15 bg-white/80 dark:bg-[#241B15] px-3.5 py-2.5 text-start text-xs sm:text-sm font-medium text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                    <DirArrow className="h-3.5 w-3.5 text-[#D97706]" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
                {t.searchFooterNote}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6E5649] dark:text-[#D6C7B8]">
              {t.noSearchMatch}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
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
                  className="w-full text-start rounded-2xl border border-amber-500/14 bg-white/80 dark:bg-[#241B15] p-3.5 hover:border-[#D97706] transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
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
                    className="font-quran-amiri text-xl leading-[2.0] tracking-normal text-[#2D231E] dark:text-[#FAF5EE]"
                  >
                    {item.text}{' '}
                    <span className="text-[#B45309] dark:text-[#FBBF24]">
                      ﴿{toArabicDigits(item.ayah)}﴾
                    </span>
                  </p>
                  {item.translation && (
                    <p
                      dir="ltr"
                      className="text-xs text-[#6E5649] dark:text-[#D6C7B8] line-clamp-2"
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
