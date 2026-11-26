import React, {useMemo, useState} from 'react';
import {AudioLines, Check, Play, Search, X} from 'lucide-react';
import type {Reciter} from '../types/quran';
import {RECITERS} from '../data/reciters';
import type {AppLang} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';
import {
  type ReciterRiwayatFilter,
  filterReciters,
  getReciterMonogram,
  localizeReciterSubtitle,
} from '../utils/reciterPickerLogic';

interface ReciterPickerListProps {
  lang: AppLang;
  activeReciterId: string;
  isPlaying?: boolean;
  onSelectReciter: (reciterId: string) => void;
  maxHeightClass?: string;
}

export const ReciterPickerList: React.FC<ReciterPickerListProps> = ({
  lang,
  activeReciterId,
  isPlaying = false,
  onSelectReciter,
  maxHeightClass = 'max-h-[340px] sm:max-h-[380px]',
}) => {
  const activeReciter = useMemo(
    () => RECITERS.find((r) => r.id === activeReciterId),
    [activeReciterId]
  );

  const [riwayatFilter, setRiwayatFilter] = useState<ReciterRiwayatFilter>(
    activeReciter?.riwayat || 'all'
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => filterReciters(RECITERS, riwayatFilter, query),
    [riwayatFilter, query]
  );

  const warshCount = useMemo(
    () => RECITERS.filter((r) => r.riwayat === 'warsh').length,
    []
  );
  const hafsCount = useMemo(
    () => RECITERS.filter((r) => r.riwayat === 'hafs').length,
    []
  );

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div className="space-y-3" data-testid="reciter-picker-list">
      {/* Search + Riwayah Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            className="h-4 w-4 text-[#5A6B62] dark:text-[#92A59B] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث عن القارئ بالاسم أو الرواية...'
                : lang === 'fr'
                  ? 'Rechercher un récitateur...'
                  : 'Search reciter by name or style...'
            }
            aria-label={lang === 'ar' ? 'بحث عن قارئ' : 'Search reciters'}
            data-testid="reciter-search-input"
            className="w-full rounded-2xl surface-3d ps-10 pe-9 py-2.5 text-xs sm:text-sm font-medium text-[#142019] dark:text-[#F1F5F3] placeholder:text-[#5A6B62]/70 dark:placeholder:text-[#92A59B]/70 focus:outline-none focus:ring-2 focus:ring-[#27784C] dark:focus:ring-[#52B77F]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear reciter search"
              className="absolute end-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-[#5A6B62] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              {
                id: 'all' as const,
                label:
                  lang === 'ar'
                    ? `الكل (${numFmt(RECITERS.length)})`
                    : lang === 'fr'
                      ? `Tous (${RECITERS.length})`
                      : `All (${RECITERS.length})`,
              },
              {
                id: 'warsh' as const,
                label:
                  lang === 'ar'
                    ? `ورش (${numFmt(warshCount)})`
                    : `Warsh (${warshCount})`,
              },
              {
                id: 'hafs' as const,
                label:
                  lang === 'ar'
                    ? `حفص (${numFmt(hafsCount)})`
                    : `Hafs (${hafsCount})`,
              },
            ] as const
          ).map((tab) => {
            const active = riwayatFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`reciter-filter-${tab.id}`}
                onClick={() => setRiwayatFilter(tab.id)}
                className={`flex-1 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all tabular-nums ${
                  active
                    ? 'btn-3d-emerald text-white'
                    : 'surface-3d text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big Sculpted 3D Reciter Cards List */}
      <div className={`${maxHeightClass} overflow-y-auto space-y-2.5 pe-0.5 pb-1`}>
        {filtered.length === 0 ? (
          <div className="rounded-2xl surface-3d p-6 text-center text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]">
            {lang === 'ar'
              ? 'لم يتم العثور على قارئ مطابق'
              : lang === 'fr'
                ? 'Aucun récitateur trouvé'
                : 'No matching reciters found'}
          </div>
        ) : (
          filtered.map((r) => {
            const selected = r.id === activeReciterId;
            const monogram = getReciterMonogram(r.nameEn);
            const primaryTitle = lang === 'ar' ? r.nameAr : r.nameEn;
            const secondaryTitle = lang === 'ar' ? r.nameEn : r.nameAr;
            const subtitle = localizeReciterSubtitle(r, lang);

            return (
              <button
                key={r.id}
                type="button"
                data-testid={`reciter-card-${r.id}`}
                aria-pressed={selected}
                onClick={() => onSelectReciter(r.id)}
                className={`w-full min-h-[76px] rounded-2xl p-3.5 sm:p-4 text-start flex items-center gap-3.5 transition-all active:scale-[0.985] ${
                  selected
                    ? 'emerald-3d-hero text-white shadow-md'
                    : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                }`}
              >
                {/* Large 3D Monogram / Equalizer Emblem */}
                <span
                  className={`relative h-12 w-12 sm:h-13 sm:w-13 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm tracking-tight overflow-hidden ${
                    selected
                      ? 'bg-white/20 border border-white/30 text-white shadow-inner'
                      : 'bg-[#27784C]/[0.1] dark:bg-[#52B77F]/[0.15] border border-[#27784C]/20 dark:border-[#52B77F]/25 text-[#27784C] dark:text-[#52B77F]'
                  }`}
                >
                  {selected && isPlaying ? (
                    <AudioLines className="h-5 w-5 animate-pulse" strokeWidth={2} />
                  ) : (
                    <span>{monogram}</span>
                  )}
                </span>

                {/* Large Dual-Script Name & Clear Audio Style Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm sm:text-[15px] font-bold leading-snug truncate">
                      {primaryTitle}
                    </span>
                    <span
                      className={`text-xs font-medium truncate ${
                        selected
                          ? 'text-white/85'
                          : 'text-[#5A6B62] dark:text-[#92A59B]'
                      }`}
                    >
                      {secondaryTitle}
                    </span>
                  </div>

                  <div
                    className={`text-[11px] sm:text-xs font-medium leading-snug truncate ${
                      selected
                        ? 'text-white/90'
                        : 'text-[#5A6B62] dark:text-[#92A59B]'
                    }`}
                  >
                    {subtitle}
                  </div>
                </div>

                {/* Right Active Check / Select Badge */}
                <span
                  aria-hidden="true"
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    selected
                      ? 'bg-white text-[#27784C] shadow-sm'
                      : 'border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F]'
                  }`}
                >
                  {selected ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current ms-0.5" />
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
