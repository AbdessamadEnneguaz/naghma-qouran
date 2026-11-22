import React, {useState} from 'react';
import {
  Check,
  Clock,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Repeat,
  Repeat1,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Smartphone,
  X,
} from 'lucide-react';
import type {
  LoopMode,
  OfflineSurahRecord,
  ReaderSettings,
  Reciter,
  SurahMeta,
  TalqeenConfig,
} from '../types/quran';
import {RECITERS} from '../data/reciters';
import {formatAudioTime, toArabicDigits} from '../utils/quranLogic';
import type {SleepTimerOption} from '../hooks/useAudioPlayer';
import type {AppLang, Translations} from '../i18n/translations';

interface AudioPlayerBarProps {
  lang: AppLang;
  t: Translations;
  surahs: SurahMeta[];
  activeSurah: number;
  activeAyah: number;
  isPlaying: boolean;
  isBuffering: boolean;
  audioError: string | null;
  reciter: Reciter;
  loopMode: LoopMode;
  playbackSpeed: number;
  sleepTimer: SleepTimerOption;
  sleepSecondsLeft: number;
  currentTime: number;
  duration: number;
  settings: ReaderSettings;
  offlineRecords: OfflineSurahRecord[];
  downloadProgress: {surah: number; completed: number; total: number} | null;
  focusMode: boolean;
  hifzMode: boolean;
  isListening: boolean;
  voiceError: string | null;
  interimText: string;
  matchedCount: number;
  hasMistakePulse: boolean;
  onToggleHifzMode: () => void;
  onToggleVoiceRecite: () => void;
  onResetVoiceProgress: () => void;
  onClearVoiceError: () => void;
  onUpdateSettings: (patch: Partial<ReaderSettings>) => void;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (seconds: number) => void;
  onChangeReciter: (reciterId: string) => void;
  onCycleLoopMode: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeSleepTimer: (opt: SleepTimerOption) => void;
  onDownloadSurah: (surahMeta: SurahMeta) => void;
  onJumpToActiveAyah: () => void;
  talqeen: TalqeenConfig;
  talqeenCountdown: number | null;
  forceExpandSignal: number;
  collapseSignal: number;
  isInstalled?: boolean;
  hideOnMobileIdle?: boolean;
  onUpdateTalqeen: (patch: Partial<TalqeenConfig>) => void;
  onSkipTalqeenPause: () => void;
  onOpenInstall?: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  lang,
  t,
  surahs,
  activeSurah,
  activeAyah,
  isPlaying,
  isBuffering,
  audioError,
  reciter,
  loopMode,
  playbackSpeed,
  sleepTimer,
  sleepSecondsLeft,
  currentTime,
  duration,
  settings,
  offlineRecords,
  downloadProgress,
  focusMode,
  hifzMode,
  isListening,
  voiceError,
  interimText,
  matchedCount,
  hasMistakePulse,
  onToggleHifzMode,
  onToggleVoiceRecite,
  onResetVoiceProgress,
  onClearVoiceError,
  onUpdateSettings,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onChangeReciter,
  onCycleLoopMode,
  onChangeSpeed,
  onChangeSleepTimer,
  onDownloadSurah,
  onJumpToActiveAyah,
  talqeen,
  talqeenCountdown,
  forceExpandSignal,
  collapseSignal,
  isInstalled = false,
  hideOnMobileIdle = false,
  onUpdateTalqeen,
  onSkipTalqeenPause,
  onOpenInstall,
}) => {
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    if (forceExpandSignal > 0) {
      setExpanded(true);
    }
  }, [forceExpandSignal]);

  React.useEffect(() => {
    if (collapseSignal > 0) {
      setExpanded(false);
    }
  }, [collapseSignal]);

  const surahMeta = surahs.find((s) => s.id === activeSurah);
  const warshReciters = RECITERS.filter((r) => r.riwayat === 'warsh');
  const hafsReciters = RECITERS.filter((r) => r.riwayat === 'hafs');

  const isCurrentSurahOffline = offlineRecords.some(
    (r) => r.surah === activeSurah && r.reciterId === reciter.id
  );
  const isDownloadingCurrent = downloadProgress?.surah === activeSurah;

  const progressPct =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(playbackSpeed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    onChangeSpeed(next);
  };

  const surahTitle =
    lang === 'ar'
      ? surahMeta?.nameAr || 'الفاتحة'
      : surahMeta?.nameEn || 'Al-Fatiha';

  const ayahBadge =
    reciter.mode === 'ayah'
      ? lang === 'ar'
        ? `${toArabicDigits(activeSurah)}:${toArabicDigits(activeAyah)}`
        : `${activeSurah}:${activeAyah}`
      : t.fullSurah;

  return (
    <div
      className={`fixed bottom-[calc(4.6rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
        hideOnMobileIdle ? 'hidden md:block' : ''
      } ${
        focusMode
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Live Voice Follow Status Strip or Fallback Banner */}
      {(isListening || voiceError) && (
        <div className="mx-auto max-w-3xl px-3 mb-2">
          {voiceError ? (
            <div className="rounded-2xl border border-amber-500/35 bg-white/95 dark:bg-[#221914]/95 backdrop-blur-md px-3.5 py-2.5 text-xs text-[#B45309] dark:text-[#FBBF24] shadow-lg flex items-center justify-between gap-2">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={onClearVoiceError}
                aria-label="Dismiss microphone notice"
                className="p-1 rounded-lg hover:bg-amber-500/10 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/35 bg-white/95 dark:bg-[#221914]/95 backdrop-blur-md px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D97706]" />
                </span>
                <span className="font-semibold text-[#B45309] dark:text-[#FBBF24] truncate">
                  {hasMistakePulse
                    ? t.micSkippedHint
                    : interimText
                      ? interimText
                      : t.micListening}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="text-[11px] font-semibold text-[#4E3629] dark:text-[#D6C7B8]">
                  {lang === 'ar' ? toArabicDigits(matchedCount) : matchedCount} {t.micMatchedWords}
                </span>
                {matchedCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetVoiceProgress}
                    title="Reset"
                    aria-label="Reset voice follow progress"
                    className="p-1 rounded-md hover:bg-amber-500/10 text-[#6E5649] dark:text-[#D6C7B8]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Talqeen Repeat-Aloud Pause Banner */}
      {talqeenCountdown !== null && (
        <div className="mx-auto max-w-3xl px-3 mb-2">
          <div className="rounded-2xl border border-amber-500/40 bg-white/95 dark:bg-[#221914]/95 backdrop-blur-md px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
            <span className="font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
              {t.talqeenPromptPrefix}{' '}
              {lang === 'ar'
                ? `${toArabicDigits(talqeenCountdown)} ث`
                : `${talqeenCountdown}s`}
            </span>
            <button
              type="button"
              onClick={onSkipTalqeenPause}
              className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]"
            >
              {t.talqeenSkipPause}
            </button>
          </div>
        </div>
      )}

      {/* Warm Honey & Ivory Floating/Docked Audio Container */}
      <div className="mx-2.5 md:mx-0 rounded-3xl md:rounded-none border md:border-x-0 md:border-b-0 border-amber-500/20 bg-white/94 dark:bg-[#1E1611]/95 backdrop-blur-md shadow-lg md:shadow-none overflow-hidden">
        {/* Top Warm Sunset Audio Progress Bar */}
        <div className="relative h-1 w-full bg-amber-500/15">
          <div
            className="h-full bg-gradient-to-r from-[#D97706] to-[#F97316] transition-all duration-100"
            style={{width: `${progressPct}%`}}
          />
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step="any"
            value={duration > 0 ? currentTime : 0}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek recitation progress"
            className="absolute inset-0 h-3 -top-1 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Expandable Settings & Reciter Drawer */}
        {expanded && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 border-b border-amber-500/12 space-y-4 max-h-[56vh] overflow-y-auto">
            {audioError && (
              <p className="text-xs font-medium text-[#B45309] dark:text-[#FBBF24]">
                {audioError}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
              <span>
                {t.elapsed}: {formatAudioTime(currentTime)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPlayPrev}
                  aria-label={t.prevSurah}
                  className="p-1.5 rounded-full bg-amber-500/12 text-[#B45309] dark:text-[#FBBF24]"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onPlayNext}
                  aria-label={t.nextSurah}
                  className="p-1.5 rounded-full bg-amber-500/12 text-[#B45309] dark:text-[#FBBF24]"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
              <span>
                {t.duration}: {formatAudioTime(duration)}
              </span>
            </div>

            {/* Row 1: Reciter, Repeat/Speed/Download, Sleep Timer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="space-y-1">
                <label
                  htmlFor="dock-reciter-select"
                  className="block text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8]"
                >
                  {t.reciterLabel} ({RECITERS.length})
                </label>
                <select
                  id="dock-reciter-select"
                  value={reciter.id}
                  onChange={(e) => onChangeReciter(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-2 text-xs font-medium text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  <optgroup label={t.warshGroup}>
                    {warshReciters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {lang === 'ar' ? `${r.nameAr} — ${r.nameEn}` : `${r.nameEn} — ${r.nameAr}`}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t.hafsGroup}>
                    {hafsReciters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {lang === 'ar' ? `${r.nameAr} — ${r.nameEn}` : `${r.nameEn} — ${r.nameAr}`}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCycleLoopMode}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    loopMode !== 'none'
                      ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                      : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
                  }`}
                >
                  {loopMode === 'ayah' ? (
                    <Repeat1 className="h-3.5 w-3.5" />
                  ) : (
                    <Repeat className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {loopMode === 'none'
                      ? t.repeatOff
                      : loopMode === 'ayah'
                        ? t.repeatAyah
                        : t.repeatSurah}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={nextSpeed}
                  className="rounded-xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-2 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
                >
                  {playbackSpeed}x
                </button>

                {surahMeta && (
                  <button
                    type="button"
                    onClick={() => onDownloadSurah(surahMeta)}
                    disabled={isDownloadingCurrent}
                    aria-label={isCurrentSurahOffline ? t.offlineReady : t.downloadSurahOffline}
                    className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl border transition-colors ${
                      isCurrentSurahOffline
                        ? 'border-[#D97706]/40 bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                        : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
                    }`}
                  >
                    {isDownloadingCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D97706]" />
                    ) : isCurrentSurahOffline ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D97706] shrink-0" />
                <select
                  aria-label={t.sleepTimerOff}
                  value={sleepTimer}
                  onChange={(e) =>
                    onChangeSleepTimer(Number(e.target.value) as SleepTimerOption)
                  }
                  className="flex-1 rounded-xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-2 text-xs font-medium text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  <option value={0}>{t.sleepTimerOff}</option>
                  <option value={15}>15 {t.minutesUnit}</option>
                  <option value={30}>30 {t.minutesUnit}</option>
                  <option value={45}>45 {t.minutesUnit}</option>
                  <option value={60}>60 {t.minutesUnit}</option>
                  <option value={-1}>{t.endOfSurah}</option>
                </select>
                {sleepSecondsLeft > 0 && (
                  <span className="text-xs font-semibold text-[#D97706] tabular-nums">
                    {formatAudioTime(sleepSecondsLeft)}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Typography & Display Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-amber-500/12">
              <div className="space-y-1">
                <label
                  htmlFor="dock-font-size"
                  className="flex justify-between text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8] tabular-nums"
                >
                  <span>{t.arabicFontSize}</span>
                  <span>{settings.fontSize}px</span>
                </label>
                <input
                  id="dock-font-size"
                  type="range"
                  min={18}
                  max={38}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({fontSize: Number(e.target.value)})}
                  className="w-full accent-[#D97706]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="dock-line-height"
                  className="flex justify-between text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8] tabular-nums"
                >
                  <span>{t.lineSpacing}</span>
                  <span>{settings.lineHeight.toFixed(2)}</span>
                </label>
                <input
                  id="dock-line-height"
                  type="range"
                  min={1.9}
                  max={2.7}
                  step={0.05}
                  value={settings.lineHeight}
                  onChange={(e) => onUpdateSettings({lineHeight: Number(e.target.value)})}
                  className="w-full accent-[#D97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 items-end">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({font: 'amiri'})}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border ${
                    settings.font === 'amiri'
                      ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                      : 'border-amber-500/15 bg-[#FDFBF7] dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  Amiri Quran
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({font: 'scheherazade'})}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border ${
                    settings.font === 'scheherazade'
                      ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                      : 'border-amber-500/15 bg-[#FDFBF7] dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  Scheherazade
                </button>
              </div>

              <button
                type="button"
                onClick={() => onUpdateSettings({showTranslation: !settings.showTranslation})}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                  settings.showTranslation
                    ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                    : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                {settings.showTranslation ? t.translationVisible : t.translationHidden}
              </button>
            </div>

            {/* Row 2B: Verse Timing Sync Fine Offset */}
            <div className="pt-2.5 border-t border-amber-500/12 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center justify-between sm:min-w-[220px] gap-2 text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                <label htmlFor="dock-sync-offset">{t.audioSyncOffsetLabel}</label>
                <span
                  data-testid="sync-offset-readout"
                  className="text-[#B45309] dark:text-[#FBBF24]"
                >
                  {settings.audioSyncOffsetSec > 0 ? '+' : ''}
                  {settings.audioSyncOffsetSec.toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  data-testid="sync-nudge-minus"
                  onClick={() => {
                    const next = Math.max(
                      -5,
                      Math.round((settings.audioSyncOffsetSec - 0.5) * 10) / 10
                    );
                    onUpdateSettings({audioSyncOffsetSec: next});
                  }}
                  aria-label="Sync offset minus 0.5 seconds"
                  className="rounded-lg border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-2.5 py-1 text-[11px] font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors shrink-0 tabular-nums"
                >
                  -0.5s
                </button>
                <input
                  id="dock-sync-offset"
                  type="range"
                  min={-5}
                  max={5}
                  step={0.1}
                  value={settings.audioSyncOffsetSec}
                  onChange={(e) =>
                    onUpdateSettings({
                      audioSyncOffsetSec: Math.round(Number(e.target.value) * 10) / 10,
                    })
                  }
                  aria-label={t.audioSyncOffsetLabel}
                  className="w-full accent-[#D97706]"
                />
                <button
                  type="button"
                  data-testid="sync-nudge-plus"
                  onClick={() => {
                    const next = Math.min(
                      5,
                      Math.round((settings.audioSyncOffsetSec + 0.5) * 10) / 10
                    );
                    onUpdateSettings({audioSyncOffsetSec: next});
                  }}
                  aria-label="Sync offset plus 0.5 seconds"
                  className="rounded-lg border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-2.5 py-1 text-[11px] font-semibold text-[#2D231E] dark:text-[#FAF5EE] hover:border-[#D97706] transition-colors shrink-0 tabular-nums"
                >
                  +0.5s
                </button>
                {settings.audioSyncOffsetSec !== 0 && (
                  <button
                    type="button"
                    data-testid="sync-nudge-reset"
                    onClick={() => onUpdateSettings({audioSyncOffsetSec: 0})}
                    className="rounded-lg border border-amber-500/20 px-2 py-1 text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8] hover:text-[#2D231E] shrink-0"
                  >
                    {t.resetOffsetLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Row 3: Talqeen Memorization Mode */}
            <div className="pt-3 border-t border-amber-500/12 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                    {t.talqeenTitle}
                  </div>
                  <p className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8]">
                    {reciter.mode === 'ayah' ? t.talqeenDesc : t.talqeenSwitchAyahNote}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextEnabled = !talqeen.enabled;
                    if (nextEnabled && reciter.mode !== 'ayah') {
                      onChangeReciter('hafs_alafasy');
                    }
                    onUpdateTalqeen({enabled: nextEnabled});
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                    talqeen.enabled
                      ? 'border-[#D97706] bg-amber-500/18 text-[#B45309] dark:text-[#FBBF24]'
                      : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  {talqeen.enabled ? t.talqeenEnabled : t.talqeenOff}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                    {t.talqeenRangeLabel}:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={surahMeta?.totalAyahs || 286}
                    value={talqeen.startAyah}
                    onChange={(e) =>
                      onUpdateTalqeen({
                        startAyah: Math.max(
                          1,
                          Math.min(surahMeta?.totalAyahs || 286, Number(e.target.value) || 1)
                        ),
                      })
                    }
                    aria-label="Talqeen start ayah"
                    className="w-16 rounded-lg border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-2 py-1 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
                  />
                  <span className="text-[#6E5649] dark:text-[#D6C7B8]">{t.talqeenToWord}</span>
                  <input
                    type="number"
                    min={talqeen.startAyah}
                    max={surahMeta?.totalAyahs || 286}
                    value={talqeen.endAyah}
                    onChange={(e) =>
                      onUpdateTalqeen({
                        endAyah: Math.max(
                          talqeen.startAyah,
                          Math.min(
                            surahMeta?.totalAyahs || 286,
                            Number(e.target.value) || talqeen.startAyah
                          )
                        ),
                      })
                    }
                    aria-label="Talqeen end ayah"
                    className="w-16 rounded-lg border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-2 py-1 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                    {t.talqeenPauseLabel}:
                  </span>
                  {([3, 5, 8] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateTalqeen({pauseSeconds: sec})}
                      className={`px-2.5 py-1 rounded-full border text-xs font-semibold tabular-nums transition-colors ${
                        talqeen.pauseSeconds === sec
                          ? 'border-[#D97706] bg-amber-500/18 text-[#B45309] dark:text-[#FBBF24]'
                          : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                      }`}
                    >
                      {lang === 'ar' ? `${toArabicDigits(sec)}ث` : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isInstalled && onOpenInstall && (
              <div className="pt-3 border-t border-amber-500/12 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                    {t.downloadApkTitle}
                  </div>
                  <p className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] truncate">
                    {t.downloadApkDesc}
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="settings-apk-btn"
                  onClick={() => {
                    setExpanded(false);
                    onOpenInstall();
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{t.downloadApkBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Compact Player Bar */}
        <div className="mx-auto max-w-5xl px-3 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onTogglePlayPause}
              aria-label={isPlaying ? t.pauseReciter : t.playReciter}
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-[#D97706] text-white shadow-sm hover:bg-[#B45309] transition-colors shrink-0"
            >
              {isBuffering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ms-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onJumpToActiveAyah}
              className="min-w-0 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] rounded-lg px-0.5 sm:px-1"
            >
              <div
                className={`font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate tabular-nums ${
                  lang === 'ar'
                    ? 'font-quran-scheherazade text-sm sm:text-base'
                    : 'text-xs sm:text-sm'
                }`}
              >
                {surahTitle} · {ayahBadge}
              </div>
              <div className="hidden sm:block text-[11px] text-[#6E5649] dark:text-[#D6C7B8] truncate">
                {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleVoiceRecite}
              aria-pressed={isListening}
              aria-label={isListening ? t.micStop : t.micRecite}
              className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full shadow-sm transition-all ${
                isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-500/25'
                  : 'bg-amber-500/15 border border-amber-500/30 text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/25'
              }`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleHifzMode}
              aria-pressed={hifzMode}
              aria-label={t.hifzMode}
              className={`h-9 px-2.5 sm:px-3.5 inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold transition-colors whitespace-nowrap ${
                hifzMode
                  ? 'border-[#D97706] bg-amber-500/18 text-[#B45309] dark:text-[#FBBF24]'
                  : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#221914] text-[#4E3629] dark:text-[#D6C7B8]'
              }`}
            >
              {hifzMode ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t.hifzMode}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0">
            <select
              aria-label={t.reciterLabel}
              value={reciter.id}
              onChange={(e) => onChangeReciter(e.target.value)}
              className="hidden md:block w-40 lg:w-48 rounded-full border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-1.5 text-xs font-medium text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706] truncate"
            >
              <optgroup label={t.warshGroup}>
                {warshReciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {lang === 'ar' ? r.nameAr : r.nameEn}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t.hafsGroup}>
                {hafsReciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {lang === 'ar' ? r.nameAr : r.nameEn}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={t.settingsBtn}
              className={`h-9 px-2.5 sm:px-3 inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold transition-colors shrink-0 ${
                expanded
                  ? 'border-[#D97706] bg-amber-500/18 text-[#B45309] dark:text-[#FBBF24]'
                  : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#221914] text-[#6E5649] dark:text-[#D6C7B8]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t.settingsBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
