import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Search, X} from 'lucide-react';
import type {QuranVerse, SearchResult, SurahMeta} from '../types/quran';
import {
  highlightArabicWords,
  highlightLatinQuery,
  searchQuran,
  toArabicDigits,
} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';

interface SearchModalProps {
  lang: AppLang;
  t: Translations;
  isOpen: boolean;
  verses: QuranVerse[];
  surahs: SurahMeta[];
  translations: string[] | null;
  frenchTexts?: string[] | null;
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
  frenchTexts,
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
    const primaryTr = lang === 'fr' && frenchTexts ? frenchTexts : translations || undefined;
    const secondaryTr = lang === 'fr' ? translations || undefined : frenchTexts || undefined;
    return searchQuran(verses, surahs, query, primaryTr, 40, secondaryTr);
  }, [verses, surahs, query, translations, frenchTexts, lang]);

  if (!isOpen) return null;

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  const suggestions = [
    {
      label:
        lang === 'ar'
          ? '2:255 (آية الكرسي)'
          : '2:255 (Ayat al-Kursi)',
      query: '2:255',
    },
    {
      label:
        lang === 'ar'
          ? 'p:604 (الصفحة الأخيرة)'
          : lang === 'fr'
            ? 'p:604 (Dernière page)'
            : 'p:604 (Last Page)',
      query: 'p:604',
    },
    {label: 'الرحمن', query: 'الرحمن'},
    {
      label: lang === 'ar' ? 'الحمد لله' : lang === 'fr' ? 'mercy / الحمد لله' : 'mercy',
      query: lang === 'ar' ? 'الحمد لله' : 'mercy',
    },
  ];

  const DirArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 sm:p-6 pt-10 sm:pt-16"
      role="dialog"
      aria-modal="true"
      data-testid="search-modal"
      aria-label={t.searchBtn}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2EAE5] dark:border-[#1E2E26]">
          <Search className="h-5 w-5 text-[#27784C] dark:text-[#52B77F] shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            data-testid="search-modal-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchBtn}
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[#142019] dark:text-[#F1F5F3] placeholder:text-[#5A6B62]/65 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] px-2 py-1"
            >
              {t.clear}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeWord}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!query.trim() ? (
            <div className="space-y-4 py-2">
              <p className="text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]">
                {t.searchShortcutsTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => setQuery(s.query)}
                    className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-3.5 py-2.5 text-start text-xs sm:text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                    <DirArrow className="h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B]">{t.searchFooterNote}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#5A6B62] dark:text-[#92A59B]">
              {t.noSearchMatch}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                {numFmt(results.length)} {t.matchesFound}
              </p>
              {results.map((item, idx) => {
                const arSegments = highlightArabicWords(item.text, query);
                const trSegments = item.translation
                  ? highlightLatinQuery(item.translation, query)
                  : [];

                return (
                  <button
                    key={`${item.type}-${item.surah}-${item.ayah}-${idx}`}
                    type="button"
                    data-testid={`search-result-${item.surah}-${item.ayah}`}
                    onClick={() => {
                      onSelectResult(item);
                      onClose();
                    }}
                    className="w-full text-start rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums">
                      <span className="truncate">
                        {lang === 'ar' ? item.surahNameAr : item.surahNameEn} ·{' '}
                        {lang === 'ar'
                          ? `${toArabicDigits(item.surah)}:${toArabicDigits(item.ayah)}`
                          : `${item.surah}:${item.ayah}`}{' '}
                        · {t.pageWord} {numFmt(item.page)} · {t.juzWord}{' '}
                        {numFmt(item.juz || 1)}
                      </span>
                      <span className="font-quran-scheherazade text-base shrink-0">
                        {item.surahNameAr}
                      </span>
                    </div>

                    <p
                      dir="rtl"
                      className="font-quran-amiri text-xl leading-[2.0] tracking-normal text-[#142019] dark:text-[#F1F5F3]"
                    >
                      {arSegments.map((seg, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {seg.highlighted ? (
                            <mark className="bg-[#27784C]/15 dark:bg-[#52B77F]/25 text-inherit rounded px-0.5">
                              {seg.text}
                            </mark>
                          ) : (
                            seg.text
                          )}
                          {sIdx < arSegments.length - 1 ? ' ' : ''}
                        </React.Fragment>
                      ))}{' '}
                      <span className="text-[#27784C] dark:text-[#52B77F]">
                        ﴿{toArabicDigits(item.ayah)}﴾
                      </span>
                    </p>

                    {trSegments.length > 0 && (
                      <p
                        dir="ltr"
                        className="text-xs text-[#5A6B62] dark:text-[#92A59B] line-clamp-2"
                      >
                        {trSegments.map((seg, sIdx) =>
                          seg.highlighted ? (
                            <mark
                              key={sIdx}
                              className="bg-[#27784C]/15 dark:bg-[#52B77F]/25 text-[#142019] dark:text-[#F1F5F3] rounded px-0.5 font-semibold"
                            >
                              {seg.text}
                            </mark>
                          ) : (
                            <React.Fragment key={sIdx}>{seg.text}</React.Fragment>
                          )
                        )}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
