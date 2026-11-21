import React, {useMemo, useState} from 'react';
import {
  BookOpen,
  Download,
  Loader2,
  Play,
  X,
} from 'lucide-react';
import {MOOD_AYAHS, MOOD_CATEGORIES} from '../data/moodAyahs';
import type {MoodAyahEntry, MoodCategoryId} from '../types/quran';
import type {AppLang, Translations} from '../i18n/translations';
import {renderHeartStoryCardPng} from '../utils/storyCardCanvas';
import {toArabicDigits} from '../utils/quranLogic';

interface HeartGuideModalProps {
  isOpen: boolean;
  lang: AppLang;
  t: Translations;
  onClose: () => void;
  onPlayAyah: (surah: number, ayah: number) => void;
  onOpenSurah: (surah: number, ayah: number) => void;
}

export const HeartGuideModal: React.FC<HeartGuideModalProps> = ({
  isOpen,
  lang,
  t,
  onClose,
  onPlayAyah,
  onOpenSurah,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodCategoryId>('calm');
  const [renderingId, setRenderingId] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<{
    dataUrl: string;
    filename: string;
    entry: MoodAyahEntry;
  } | null>(null);

  const moodMeta = useMemo(
    () => MOOD_CATEGORIES.find((m) => m.id === selectedMood) || MOOD_CATEGORIES[0],
    [selectedMood]
  );

  const filteredAyahs = useMemo(
    () => MOOD_AYAHS.filter((a) => a.mood === selectedMood),
    [selectedMood]
  );

  if (!isOpen) return null;

  const handleSaveStory = async (entry: MoodAyahEntry) => {
    try {
      setRenderingId(entry.id);
      const {dataUrl, filename} = await renderHeartStoryCardPng(entry, lang);
      setPreviewCard({dataUrl, filename, entry});

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setRenderingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.heartGuideTitle}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6"
    >
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#B4891B]/30 dark:border-[#D4AF37]/25 bg-[#FAF6EE] dark:bg-[#11171D] p-4 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#B4891B]/15 dark:border-white/10 pb-3.5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F4F1EA]">
              {t.heartGuideTitle}
            </h2>
            <p className="text-xs text-[#57534E] dark:text-[#9CA3AF]">
              {lang === 'ar' ? moodMeta.subtitleAr : moodMeta.subtitleEn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeWord}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#B4891B]/20 dark:border-white/12 text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {MOOD_CATEGORIES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedMood(m.id);
                setPreviewCard(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                selectedMood === m.id
                  ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#34D399]'
                  : 'border-[#B4891B]/20 dark:border-white/12 bg-[#F3ECE0] dark:bg-[#0B0E11] text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
              }`}
            >
              {lang === 'ar' ? m.labelAr : m.labelEn}
            </button>
          ))}
        </div>

        {/* Generated Story Card Preview Banner */}
        {previewCard && (
          <div className="rounded-2xl border border-[#10B981]/35 bg-[#10B981]/10 p-4 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={previewCard.dataUrl}
              alt={`${previewCard.entry.surahNameEn} ${previewCard.entry.surah}:${previewCard.entry.ayah} Story Card`}
              className="w-24 aspect-[9/16] rounded-xl border border-[#D4AF37]/40 object-cover shadow-md shrink-0"
            />
            <div className="flex-1 space-y-2 text-center sm:text-start">
              <p className="text-sm font-bold text-[#059669] dark:text-[#34D399]">
                {t.storyCardReadyTitle}
              </p>
              <p className="text-xs text-[#57534E] dark:text-[#D6D3C9]">
                {t.storyCardReadyDesc} ({previewCard.filename})
              </p>
              <a
                href={previewCard.dataUrl}
                download={previewCard.filename}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] dark:bg-[#10B981] px-3.5 py-2 text-xs font-semibold text-white dark:text-[#0B0E11]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadPngAgain}</span>
              </a>
            </div>
          </div>
        )}

        {/* Curated Mood Verses */}
        <div className="space-y-4">
          {filteredAyahs.map((entry) => {
            const isBusy = renderingId === entry.id;
            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-[#B4891B]/22 dark:border-white/10 bg-[#F3ECE0]/70 dark:bg-[#0B0E11]/70 p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
                  <span>
                    {lang === 'ar'
                      ? `${entry.surahNameAr} · الآية ${toArabicDigits(entry.ayah)}`
                      : `${entry.surahNameEn} · ${entry.surah}:${entry.ayah}`}
                  </span>
                  <span className="text-[#57534E] dark:text-[#9CA3AF]">
                    {lang === 'ar'
                      ? `${t.pageWord} ${toArabicDigits(entry.page)}`
                      : `${t.pageWord} ${entry.page}`}
                  </span>
                </div>

                <p
                  dir="rtl"
                  className="font-quran-amiri text-2xl sm:text-[26px] leading-[2.25] tracking-normal text-[#1C1917] dark:text-[#F4F1EA] text-right"
                >
                  {entry.arabic}
                </p>

                <p className="text-xs sm:text-sm leading-relaxed text-[#57534E] dark:text-[#D6D3C9]">
                  “{entry.translationEn}”
                </p>

                <p className="text-xs text-[#059669] dark:text-[#34D399]">
                  {lang === 'ar' ? entry.reflectionAr : entry.reflectionEn}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#B4891B]/12 dark:border-white/8">
                  <button
                    type="button"
                    onClick={() => onPlayAyah(entry.surah, entry.ayah)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] dark:bg-[#10B981] px-3.5 py-2 text-xs font-semibold text-white dark:text-[#0B0E11] hover:opacity-90"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{t.listenAyah}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSurah(entry.surah, entry.ayah);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#B4891B]/25 dark:border-white/14 px-3.5 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981]"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{t.openInMushafBtn}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleSaveStory(entry)}
                    className="ms-auto inline-flex items-center gap-1.5 rounded-xl border border-[#B4891B]/35 dark:border-[#D4AF37]/35 bg-[#D4AF37]/12 px-3.5 py-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{t.saveStoryCardBtn}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
