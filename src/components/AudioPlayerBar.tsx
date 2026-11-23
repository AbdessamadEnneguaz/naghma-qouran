import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Check,
  ChevronUp,
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
  Sun,
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
import {
  WAVEFORM_BAR_COUNT,
  computePlayedBarCount,
  computeSeekSecondsFromPointer,
  generateWaveformBars,
} from '../utils/waveformLogic';
import type {ProgressListener, SleepTimerOption} from '../hooks/useAudioPlayer';
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
  subscribeProgress: (listener: ProgressListener) => () => void;
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
  wakeLockSupported?: boolean;
  wakeLockEnabled?: boolean;
  wakeLockActive?: boolean;
  onToggleWakeLock?: () => void;
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
  subscribeProgress,
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
  wakeLockSupported = true,
  wakeLockEnabled = false,
  wakeLockActive = false,
  onToggleWakeLock,
  onUpdateTalqeen,
  onSkipTalqeenPause,
  onOpenInstall,
}) => {
  const [expanded, setExpanded] = useState(false);

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const isDraggingRef = useRef(false);
  const latestDurationRef = useRef(duration);
  latestDurationRef.current = duration;

  useEffect(() => {
    if (forceExpandSignal > 0) {
      setExpanded(true);
    }
  }, [forceExpandSignal]);

  useEffect(() => {
    if (collapseSignal > 0) {
      setExpanded(false);
    }
  }, [collapseSignal]);

  const surahMeta = useMemo(
    () => surahs.find((s) => s.id === activeSurah),
    [surahs, activeSurah]
  );
  const warshReciters = useMemo(() => RECITERS.filter((r) => r.riwayat === 'warsh'), []);
  const hafsReciters = useMemo(() => RECITERS.filter((r) => r.riwayat === 'hafs'), []);

  const waveformBars = useMemo(
    () =>
      generateWaveformBars(
        `${activeSurah}:${reciter.mode === 'ayah' ? activeAyah : 0}:${reciter.id}`,
        WAVEFORM_BAR_COUNT
      ),
    [activeSurah, activeAyah, reciter.id, reciter.mode]
  );

  const paintBars = useCallback((curSec: number, durSec: number) => {
    const playedCount = computePlayedBarCount(curSec, durSec, WAVEFORM_BAR_COUNT);
    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const el = barRefs.current[i];
      if (!el) continue;
      const isPlayed = i < playedCount;
      el.dataset.played = isPlayed ? 'true' : 'false';
    }
  }, []);

  // Direct 60fps DOM paint via pub-sub listener (zero React re-renders!)
  useEffect(() => {
    paintBars(currentTime, duration);
    const unsub = subscribeProgress((curSec, durSec) => {
      if (!isDraggingRef.current) {
        if (durSec > 0) latestDurationRef.current = durSec;
        paintBars(curSec, durSec > 0 ? durSec : latestDurationRef.current);
      }
    });
    return unsub;
  }, [subscribeProgress, paintBars, currentTime, duration, waveformBars]);

  const seekFromClientX = useCallback(
    (clientX: number, commit: boolean) => {
      const track = waveformRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const dur = latestDurationRef.current;
      if (dur <= 0) return;
      const targetSec = computeSeekSecondsFromPointer(clientX, rect.left, rect.width, dur);
      paintBars(targetSec, dur);
      if (commit) {
        onSeek(targetSec);
      }
    },
    [onSeek, paintBars]
  );

  const handleWaveformPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer events
    }
    seekFromClientX(e.clientX, true);
  };

  const handleWaveformPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    seekFromClientX(e.clientX, false);
  };

  const handleWaveformPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    seekFromClientX(e.clientX, true);
  };

  const handleWaveformKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const dur = latestDurationRef.current;
    if (dur <= 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(dur, currentTime + 5));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    }
  };

  const isCurrentSurahOffline = offlineRecords.some(
    (r) => r.surah === activeSurah && r.reciterId === reciter.id
  );
  const isDownloadingCurrent = downloadProgress?.surah === activeSurah;

  const surahTitle =
    lang === 'ar'
      ? surahMeta?.nameAr.replace('سُورَةُ ', '') || 'الفاتحة'
      : surahMeta?.transliteration || surahMeta?.nameEn || 'Al-Fatihah';

  const ayahBadge =
    reciter.mode === 'ayah'
      ? lang === 'ar'
        ? `${toArabicDigits(activeSurah)}:${toArabicDigits(activeAyah)}`
        : `${activeSurah}:${activeAyah}`
      : lang === 'ar'
        ? `${toArabicDigits(activeSurah)}`
        : `S${activeSurah}`;

  return (
    <div
      className={`fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom,0px))] md:bottom-4 left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
        hideOnMobileIdle ? 'hidden md:block' : ''
      } ${
        focusMode
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto max-w-2xl px-3 flex flex-col items-center gap-2">
        {/* Live Voice Follow Status Strip */}
        {(isListening || voiceError) && (
          <div className="w-full max-w-lg pointer-events-auto">
            {voiceError ? (
              <div className="rounded-2xl border border-amber-500/35 bg-white/95 dark:bg-[#221914]/95 px-3.5 py-2.5 text-xs text-[#B45309] dark:text-[#FBBF24] shadow-lg flex items-center justify-between gap-2">
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
              <div className="rounded-2xl border border-amber-500/35 bg-white/95 dark:bg-[#221914]/95 px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
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
                    {lang === 'ar' ? toArabicDigits(matchedCount) : matchedCount}{' '}
                    {t.micMatchedWords}
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
          <div className="w-full max-w-lg pointer-events-auto">
            <div className="rounded-2xl border border-amber-500/40 bg-white/95 dark:bg-[#221914]/95 px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
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

        {/* Expandable Settings & Reciter Drawer (Floating Sheet Above Capsule) */}
        {expanded && (
          <div
            data-testid="audio-player-drawer"
            className="w-full max-w-2xl pointer-events-auto rounded-3xl border border-amber-500/20 bg-[#FDFBF7]/98 dark:bg-[#1E1611]/98 md:backdrop-blur-md shadow-2xl px-4 sm:px-5 py-4 space-y-4 max-h-[58vh] overflow-y-auto"
          >
            {/* Header Info + Quick Actions (Mic, Hifz, Jump, Close) */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-500/12">
              <button
                type="button"
                onClick={onJumpToActiveAyah}
                className="min-w-0 text-start hover:opacity-80 transition-opacity"
              >
                <div className="text-sm font-bold text-[#2D231E] dark:text-[#FAF5EE] truncate tabular-nums">
                  {surahTitle} · {ayahBadge}
                </div>
                <div className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8] truncate">
                  {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onToggleVoiceRecite}
                  aria-pressed={isListening}
                  aria-label={isListening ? t.micStop : t.micRecite}
                  className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors ${
                    isListening
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-amber-500/25 bg-amber-500/10 text-[#7C4A15] dark:text-[#FBBF24]'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onToggleHifzMode}
                  aria-pressed={hifzMode}
                  aria-label={t.hifzMode}
                  className={`h-8 px-2.5 inline-flex items-center gap-1 rounded-full border text-[11px] font-semibold transition-colors ${
                    hifzMode
                      ? 'border-[#7C4A15] bg-[#7C4A15] text-white'
                      : 'border-amber-500/20 bg-white dark:bg-[#2A2018] text-[#4E3629] dark:text-[#D6C7B8]'
                  }`}
                >
                  {hifzMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{t.hifzMode}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label={t.closeWord}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-[#6E5649] dark:text-[#D6C7B8] hover:bg-amber-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {audioError && (
              <p className="text-xs font-medium text-[#B45309] dark:text-[#FBBF24]">
                {audioError}
              </p>
            )}

            {/* Transport & Elapsed Readout */}
            <div className="flex items-center justify-between text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
              <span>
                {t.elapsed}: {formatAudioTime(currentTime)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPlayPrev}
                  aria-label={t.prevSurah}
                  className="p-1.5 rounded-full bg-amber-500/12 text-[#7C4A15] dark:text-[#FBBF24]"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onPlayNext}
                  aria-label={t.nextSurah}
                  className="p-1.5 rounded-full bg-amber-500/12 text-[#7C4A15] dark:text-[#FBBF24]"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
              <span>
                {t.duration}: {formatAudioTime(duration)}
              </span>
            </div>

            {/* Row 1: Reciter, Repeat, Speed, Offline, Sleep Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
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
                  className="w-full rounded-xl border border-amber-500/20 bg-white dark:bg-[#17110D] px-3 py-2 text-xs font-medium text-[#2D231E] dark:text-[#FAF5EE] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
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
                      ? 'border-[#7C4A15] bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                      : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
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

                <div className="inline-flex items-center rounded-xl border border-amber-500/20 bg-white dark:bg-[#17110D] p-0.5 tabular-nums">
                  {SPEEDS.map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onChangeSpeed(spd)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        playbackSpeed === spd
                          ? 'bg-[#7C4A15] text-white'
                          : 'text-[#6E5649] dark:text-[#D6C7B8]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {surahMeta && (
                  <button
                    type="button"
                    onClick={() => onDownloadSurah(surahMeta)}
                    disabled={isDownloadingCurrent}
                    aria-label={isCurrentSurahOffline ? t.offlineReady : t.downloadSurahOffline}
                    className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl border transition-colors ${
                      isCurrentSurahOffline
                        ? 'border-[#D97706]/40 bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                        : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
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
            </div>

            {/* Sleep Timer & Typography Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2 border-t border-amber-500/12">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D97706] shrink-0" />
                <select
                  aria-label={t.sleepTimerOff}
                  value={sleepTimer}
                  onChange={(e) =>
                    onChangeSleepTimer(Number(e.target.value) as SleepTimerOption)
                  }
                  className="flex-1 rounded-xl border border-amber-500/20 bg-white dark:bg-[#17110D] px-2.5 py-2 text-xs font-medium text-[#2D231E] dark:text-[#FAF5EE]"
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
                  className="w-full accent-[#7C4A15]"
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
                  className="w-full accent-[#7C4A15]"
                />
              </div>
            </div>

            {/* Font Family, Translation, Wake Lock */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onUpdateSettings({font: 'amiri'})}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium border whitespace-nowrap ${
                  settings.font === 'amiri'
                    ? 'border-[#7C4A15] bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                    : 'border-amber-500/15 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                Amiri Quran
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({font: 'scheherazade'})}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium border whitespace-nowrap ${
                  settings.font === 'scheherazade'
                    ? 'border-[#7C4A15] bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                    : 'border-amber-500/15 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                Scheherazade
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({showTranslation: !settings.showTranslation})}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  settings.showTranslation
                    ? 'border-[#7C4A15] bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                    : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                {settings.showTranslation ? t.translationVisible : t.translationHidden}
              </button>

              {wakeLockSupported && onToggleWakeLock && (
                <button
                  type="button"
                  data-testid="wake-lock-toggle"
                  onClick={onToggleWakeLock}
                  aria-pressed={wakeLockEnabled}
                  aria-label={t.wakeLockLabel}
                  title={t.wakeLockDesc}
                  className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                    wakeLockEnabled
                      ? 'border-[#7C4A15] bg-amber-500/15 text-[#7C4A15] dark:text-[#FBBF24]'
                      : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  <Sun
                    className={`h-3.5 w-3.5 shrink-0 ${
                      wakeLockActive ? 'text-[#D97706] dark:text-[#FBBF24]' : ''
                    }`}
                  />
                  <span>{wakeLockEnabled ? t.wakeLockActive : t.wakeLockOff}</span>
                </button>
              )}
            </div>

            {/* Verse Timing Sync Fine Offset */}
            <div className="pt-2.5 border-t border-amber-500/12 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-between sm:min-w-[180px] gap-2 text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
                <label htmlFor="dock-sync-offset">{t.audioSyncOffsetLabel}</label>
                <span data-testid="sync-offset-readout" className="text-[#7C4A15] dark:text-[#FBBF24]">
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
                  className="rounded-lg border border-amber-500/20 bg-white dark:bg-[#17110D] px-2.5 py-1 text-[11px] font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
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
                  className="w-full accent-[#7C4A15]"
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
                  className="rounded-lg border border-amber-500/20 bg-white dark:bg-[#17110D] px-2.5 py-1 text-[11px] font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
                >
                  +0.5s
                </button>
                {settings.audioSyncOffsetSec !== 0 && (
                  <button
                    type="button"
                    data-testid="sync-nudge-reset"
                    onClick={() => onUpdateSettings({audioSyncOffsetSec: 0})}
                    className="rounded-lg border border-amber-500/20 px-2 py-1 text-[11px] font-semibold text-[#6E5649] dark:text-[#D6C7B8]"
                  >
                    {t.resetOffsetLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Talqeen Memorization Mode */}
            <div className="pt-2.5 border-t border-amber-500/12 space-y-2">
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                    talqeen.enabled
                      ? 'border-[#7C4A15] bg-amber-500/18 text-[#7C4A15] dark:text-[#FBBF24]'
                      : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                  }`}
                >
                  {talqeen.enabled ? t.talqeenEnabled : t.talqeenOff}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
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
                    className="w-14 rounded-lg border border-amber-500/20 bg-white dark:bg-[#17110D] px-2 py-1 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
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
                    className="w-14 rounded-lg border border-amber-500/20 bg-white dark:bg-[#17110D] px-2 py-1 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE]"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
                    {t.talqeenPauseLabel}:
                  </span>
                  {([3, 5, 8] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateTalqeen({pauseSeconds: sec})}
                      className={`px-2 py-1 rounded-full border text-xs font-semibold tabular-nums transition-colors ${
                        talqeen.pauseSeconds === sec
                          ? 'border-[#7C4A15] bg-amber-500/18 text-[#7C4A15] dark:text-[#FBBF24]'
                          : 'border-amber-500/20 bg-white dark:bg-[#17110D] text-[#6E5649] dark:text-[#D6C7B8]'
                      }`}
                    >
                      {lang === 'ar' ? `${toArabicDigits(sec)}ث` : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isInstalled && onOpenInstall && (
              <div className="pt-2.5 border-t border-amber-500/12 flex items-center justify-between gap-3">
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
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-[#7C4A15] dark:text-[#FBBF24] whitespace-nowrap"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{t.downloadApkBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Luxury Waveform Capsule Audio Player (Exact Match to Reference Capsule) */}
        <div
          data-testid="waveform-capsule-player"
          className="w-full max-w-[366px] sm:max-w-lg pointer-events-auto rounded-full bg-[#F5DEC1] dark:bg-[#2A2018] shadow-md shadow-amber-900/10 border border-[#7C4A15]/10 dark:border-amber-500/20 px-2.5 py-2 flex items-center gap-3"
        >
          {/* Left Circular Deep Bronze-Espresso Play/Pause Button */}
          <button
            type="button"
            data-testid="capsule-play-btn"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? t.pauseReciter : t.playReciter}
            className="w-10 h-10 rounded-full bg-[#7C4A15] hover:bg-[#663C10] active:scale-95 text-white flex items-center justify-center shadow-sm transition-all shrink-0"
          >
            {isBuffering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ms-0.5" />
            )}
          </button>

          {/* Center Symmetric Interactive Multi-Bar Acoustic Waveform */}
          <div
            ref={waveformRef}
            dir="ltr"
            role="slider"
            tabIndex={0}
            data-testid="waveform-seeker"
            aria-label="Seek recitation progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration > 0 ? duration : 100)}
            aria-valuenow={Math.round(currentTime)}
            onPointerDown={handleWaveformPointerDown}
            onPointerMove={handleWaveformPointerMove}
            onPointerUp={handleWaveformPointerUp}
            onPointerCancel={handleWaveformPointerUp}
            onKeyDown={handleWaveformKeyDown}
            className="flex-1 min-w-0 h-8 flex items-center justify-between gap-[2px] sm:gap-[3px] cursor-pointer touch-none select-none px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C4A15] rounded-full"
          >
            {waveformBars.map((amp, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  barRefs.current[idx] = el;
                }}
                data-played="false"
                className="w-[2.5px] sm:w-[3px] rounded-full transition-colors duration-75 bg-[#DFC29D]/55 dark:bg-[#DFC29D]/30 data-[played=true]:bg-[#7C4A15] dark:data-[played=true]:bg-[#F59E0B]"
                style={{height: `${Math.round(amp * 100)}%`}}
              />
            ))}
          </div>

          {/* Right Subtle Pill Badge / Controls Drawer Toggle */}
          <button
            type="button"
            data-testid="capsule-drawer-toggle"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={t.settingsBtn}
            title={`${surahTitle} · ${ayahBadge} · ${playbackSpeed}x`}
            className={`h-8 px-2.5 inline-flex items-center gap-1 rounded-full text-[11px] font-bold transition-colors shrink-0 tabular-nums ${
              expanded
                ? 'bg-[#7C4A15] text-white'
                : 'bg-white/60 dark:bg-black/25 text-[#5C360E] dark:text-[#FDE68A] hover:bg-white/85'
            }`}
          >
            <span className="max-w-[54px] truncate">{ayahBadge}</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 rotate-180 transition-transform" />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
