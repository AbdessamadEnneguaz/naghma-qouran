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
  // Tarteel Focus, Hifz & Voice Follow props
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
  // Talqeen Memorization props
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
      className={`fixed bottom-[calc(3.625rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
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
            <div className="rounded-xl border border-amber-500/35 bg-[#FAF6EE]/96 dark:bg-[#13181E]/96 backdrop-blur-md px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300 shadow-lg flex items-center justify-between gap-2">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={onClearVoiceError}
                aria-label="Dismiss microphone notice"
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#10B981]/35 bg-[#FAF6EE]/96 dark:bg-[#13181E]/96 backdrop-blur-md px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
                </span>
                <span className="font-semibold text-[#059669] dark:text-[#34D399] truncate">
                  {hasMistakePulse
                    ? t.micSkippedHint
                    : interimText
                      ? interimText
                      : t.micListening}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="text-[11px] font-semibold text-[#B4891B] dark:text-[#D4AF37]">
                  {lang === 'ar' ? toArabicDigits(matchedCount) : matchedCount} {t.micMatchedWords}
                </span>
                {matchedCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetVoiceProgress}
                    title="Reset"
                    aria-label="Reset voice follow progress"
                    className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-[#57534E] dark:text-[#9CA3AF]"
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
          <div className="rounded-xl border border-[#D4AF37]/45 bg-[#FAF6EE]/96 dark:bg-[#11171D]/96 backdrop-blur-md px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
            <span className="font-semibold text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
              {t.talqeenPromptPrefix}{' '}
              {lang === 'ar'
                ? `${toArabicDigits(talqeenCountdown)} ث`
                : `${talqeenCountdown}s`}
            </span>
            <button
              type="button"
              onClick={onSkipTalqeenPause}
              className="rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2.5 py-1 text-[11px] font-semibold text-[#B4891B] dark:text-[#D4AF37]"
            >
              {t.talqeenSkipPause}
            </button>
          </div>
        </div>
      )}

      {/* Main Dock Container */}
      <div className="bg-[#FAF6EE]/96 dark:bg-[#0B0E11]/96 backdrop-blur-md border-t border-[#B4891B]/16 dark:border-white/10">
        {/* Top Thin Audio Seek Bar */}
        <div className="relative h-1 w-full bg-[#B4891B]/16 dark:bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] transition-all duration-100"
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 border-b border-[#B4891B]/15 dark:border-white/8 space-y-4 max-h-[60vh] overflow-y-auto">
            {audioError && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {audioError}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
              <span>
                {t.elapsed}: {formatAudioTime(currentTime)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPlayPrev}
                  aria-label={t.prevSurah}
                  className="p-1.5 rounded-lg bg-[#F3ECE0] dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA]"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onPlayNext}
                  aria-label={t.nextSurah}
                  className="p-1.5 rounded-lg bg-[#F3ECE0] dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA]"
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
                  className="block text-[11px] font-semibold text-[#57534E] dark:text-[#9CA3AF]"
                >
                  {t.reciterLabel} ({RECITERS.length})
                </label>
                <select
                  id="dock-reciter-select"
                  value={reciter.id}
                  onChange={(e) => onChangeReciter(e.target.value)}
                  className="w-full rounded-xl border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-3 py-2 text-xs font-medium text-[#1C1917] dark:text-[#F4F1EA] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
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
                      ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                      : 'border-[#B4891B]/20 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA]'
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
                  className="rounded-xl border border-[#B4891B]/20 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-3 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums"
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
                        ? 'border-[#10B981]/35 bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                        : 'border-[#B4891B]/20 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA]'
                    }`}
                  >
                    {isDownloadingCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />
                    ) : isCurrentSurahOffline ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#B4891B] dark:text-[#D4AF37] shrink-0" />
                <select
                  aria-label={t.sleepTimerOff}
                  value={sleepTimer}
                  onChange={(e) =>
                    onChangeSleepTimer(Number(e.target.value) as SleepTimerOption)
                  }
                  className="flex-1 rounded-xl border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-3 py-2 text-xs font-medium text-[#1C1917] dark:text-[#F4F1EA] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value={0}>{t.sleepTimerOff}</option>
                  <option value={15}>15 {t.minutesUnit}</option>
                  <option value={30}>30 {t.minutesUnit}</option>
                  <option value={45}>45 {t.minutesUnit}</option>
                  <option value={60}>60 {t.minutesUnit}</option>
                  <option value={-1}>{t.endOfSurah}</option>
                </select>
                {sleepSecondsLeft > 0 && (
                  <span className="text-xs font-semibold text-[#10B981] tabular-nums">
                    {formatAudioTime(sleepSecondsLeft)}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Typography & Display Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#B4891B]/12 dark:border-white/8">
              <div className="space-y-1">
                <label
                  htmlFor="dock-font-size"
                  className="flex justify-between text-[11px] font-semibold text-[#57534E] dark:text-[#9CA3AF] tabular-nums"
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
                  className="w-full accent-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="dock-line-height"
                  className="flex justify-between text-[11px] font-semibold text-[#57534E] dark:text-[#9CA3AF] tabular-nums"
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
                  className="w-full accent-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 items-end">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({font: 'amiri'})}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border ${
                    settings.font === 'amiri'
                      ? 'border-[#10B981] bg-[#10B981]/15 text-[#1C1917] dark:text-[#F4F1EA]'
                      : 'border-transparent bg-[#F3ECE0] dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF]'
                  }`}
                >
                  Amiri Quran
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({font: 'scheherazade'})}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border ${
                    settings.font === 'scheherazade'
                      ? 'border-[#10B981] bg-[#10B981]/15 text-[#1C1917] dark:text-[#F4F1EA]'
                      : 'border-transparent bg-[#F3ECE0] dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF]'
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
                    ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                    : 'border-[#B4891B]/20 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF]'
                }`}
              >
                {settings.showTranslation ? t.translationVisible : t.translationHidden}
              </button>
            </div>

            {/* Row 2B: Instant Verse Timing Sync Nudge (-0.5s / +0.5s) & Fine Offset (-5.0s to +5.0s) */}
            <div className="pt-2.5 border-t border-[#B4891B]/12 dark:border-white/8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center justify-between sm:min-w-[220px] gap-2 text-[11px] font-semibold text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
                <label htmlFor="dock-sync-offset">{t.audioSyncOffsetLabel}</label>
                <span
                  data-testid="sync-offset-readout"
                  className="text-[#B4891B] dark:text-[#D4AF37]"
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
                  className="rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-2.5 py-1 text-[11px] font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981] transition-colors shrink-0 tabular-nums"
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
                  className="w-full accent-[#10B981]"
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
                  className="rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-2.5 py-1 text-[11px] font-semibold text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#10B981] transition-colors shrink-0 tabular-nums"
                >
                  +0.5s
                </button>
                {settings.audioSyncOffsetSec !== 0 && (
                  <button
                    type="button"
                    data-testid="sync-nudge-reset"
                    onClick={() => onUpdateSettings({audioSyncOffsetSec: 0})}
                    className="rounded-lg border border-[#B4891B]/25 dark:border-white/14 px-2 py-1 text-[11px] font-semibold text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA] shrink-0"
                  >
                    {t.resetOffsetLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Row 3: Talqeen Memorization Mode (Listen & Repeat with Pause) */}
            <div className="pt-3 border-t border-[#B4891B]/12 dark:border-white/8 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                    {t.talqeenTitle}
                  </div>
                  <p className="text-[11px] text-[#57534E] dark:text-[#9CA3AF]">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                    talqeen.enabled
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#B4891B] dark:text-[#FDE68A]'
                      : 'border-[#B4891B]/22 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF]'
                  }`}
                >
                  {talqeen.enabled ? t.talqeenEnabled : t.talqeenOff}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-semibold text-[#57534E] dark:text-[#9CA3AF]">
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
                    className="w-16 rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-2 py-1 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
                  />
                  <span className="text-[#57534E] dark:text-[#9CA3AF]">{t.talqeenToWord}</span>
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
                    className="w-16 rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-2 py-1 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-[#57534E] dark:text-[#9CA3AF]">
                    {t.talqeenPauseLabel}:
                  </span>
                  {([3, 5, 8] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateTalqeen({pauseSeconds: sec})}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
                        talqeen.pauseSeconds === sec
                          ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#34D399]'
                          : 'border-[#B4891B]/20 dark:border-white/12 bg-[#F3ECE0] dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF]'
                      }`}
                    >
                      {lang === 'ar' ? `${toArabicDigits(sec)}ث` : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isInstalled && onOpenInstall && (
              <div className="pt-3 border-t border-[#B4891B]/12 dark:border-white/8 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                    {t.downloadApkTitle}
                  </div>
                  <p className="text-[11px] text-[#57534E] dark:text-[#9CA3AF] truncate">
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
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[#10B981]/35 bg-[#10B981]/12 px-3 py-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399] hover:bg-[#10B981]/20 transition-colors whitespace-nowrap"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{t.downloadApkBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Streamlined Tarteel-Style Bottom Dock: Play Reciter | Mic Recite | Hifz Mask | Settings/Reciter */}
        <div className="mx-auto max-w-5xl px-2.5 sm:px-6 h-[60px] sm:h-[62px] flex items-center justify-between gap-1.5 sm:gap-4">
          {/* 1. Play Reciter & Active Ayah */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onTogglePlayPause}
              aria-label={isPlaying ? t.pauseReciter : t.playReciter}
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-[#10B981]/15 border border-[#10B981]/35 text-[#059669] dark:text-[#10B981] hover:bg-[#10B981]/25 transition-colors shrink-0"
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
              className="min-w-0 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-lg px-0.5 sm:px-1"
            >
              <div
                className={`font-semibold text-[#1C1917] dark:text-[#F4F1EA] truncate tabular-nums ${
                  lang === 'ar'
                    ? 'font-quran-scheherazade text-sm sm:text-base'
                    : 'text-xs sm:text-sm'
                }`}
              >
                {surahTitle} · {ayahBadge}
              </div>
              <div className="hidden sm:block text-[11px] text-[#57534E] dark:text-[#9CA3AF] truncate">
                {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
              </div>
            </button>
          </div>

          {/* 2. Spotlight Center Controls: Mic Recite & Hifz Mask */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleVoiceRecite}
              aria-pressed={isListening}
              aria-label={isListening ? t.micStop : t.micRecite}
              className={`relative h-11 w-11 sm:h-12 sm:w-12 -mt-2.5 sm:-mt-3 flex items-center justify-center rounded-full shadow-lg transition-all ${
                isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-105'
                  : 'bg-[#059669] dark:bg-[#10B981] text-white dark:text-[#0B0E11] hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleHifzMode}
              aria-pressed={hifzMode}
              aria-label={t.hifzMode}
              className={`h-9 px-2.5 sm:px-3.5 inline-flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
                hifzMode
                  ? 'border-[#D4AF37] bg-[#D4AF37]/18 text-[#B4891B] dark:text-[#FDE68A]'
                  : 'border-[#B4891B]/22 dark:border-white/14 bg-[#F3ECE0]/70 dark:bg-[#13181E] text-[#1C1917] dark:text-[#F4F1EA] hover:border-[#D4AF37]'
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

          {/* 3. End: Quick Reciter Select (Desktop) + Settings Toggle */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0">
            <select
              aria-label={t.reciterLabel}
              value={reciter.id}
              onChange={(e) => onChangeReciter(e.target.value)}
              className="hidden md:block w-40 lg:w-48 rounded-xl border border-[#B4891B]/22 dark:border-white/14 bg-[#F3ECE0] dark:bg-[#13181E] px-2.5 py-1.5 text-xs font-medium text-[#1C1917] dark:text-[#F4F1EA] focus:outline-none focus:ring-2 focus:ring-[#10B981] truncate"
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
              className={`h-9 px-2.5 sm:px-3 inline-flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${
                expanded
                  ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#10B981]'
                  : 'border-[#B4891B]/20 dark:border-white/14 bg-[#F3ECE0]/70 dark:bg-[#13181E] text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
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
