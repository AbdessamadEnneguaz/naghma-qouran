import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AudioLines,
  BookOpenText,
  Check,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Eye,
  EyeOff,
  Gauge,
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
  Users,
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
  cyclePlaybackSpeed,
  cycleSleepTimer,
  getReciterMonogram,
  localizeReciterSubtitle,
} from '../utils/reciterPickerLogic';
import {
  WAVEFORM_BAR_COUNT,
  computePlayedBarCount,
  computeSeekSecondsFromPointer,
  generateWaveformBars,
} from '../utils/waveformLogic';
import type {ProgressListener, SleepTimerOption} from '../hooks/useAudioPlayer';
import type {AppLang, Translations} from '../i18n/translations';
import {ReciterPickerList} from './ReciterPickerList';

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
  const [drawerTab, setDrawerTab] = useState<'controls' | 'reciters'>('controls');

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

  // Direct 60fps DOM paint via pub-sub listener (zero React re-renders)
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
              <div className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-3.5 py-2.5 text-xs text-[#142019] dark:text-[#F1F5F3] shadow-lg flex items-center justify-between gap-2">
                <span>{voiceError}</span>
                <button
                  type="button"
                  onClick={onClearVoiceError}
                  aria-label="Dismiss microphone notice"
                  className="p-1 rounded-lg hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229] shrink-0"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-white dark:bg-[#111C17] px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27784C] dark:bg-[#52B77F] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27784C] dark:bg-[#52B77F]" />
                  </span>
                  <span className="font-semibold text-[#27784C] dark:text-[#52B77F] truncate">
                    {hasMistakePulse
                      ? t.micSkippedHint
                      : interimText
                        ? interimText
                        : t.micListening}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  <span className="text-[11px] font-medium text-[#5A6B62] dark:text-[#92A59B]">
                    {lang === 'ar' ? toArabicDigits(matchedCount) : matchedCount}{' '}
                    {t.micMatchedWords}
                  </span>
                  {matchedCount > 0 && (
                    <button
                      type="button"
                      onClick={onResetVoiceProgress}
                      title="Reset"
                      aria-label="Reset voice follow progress"
                      className="p-1 rounded-md hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229] text-[#5A6B62] dark:text-[#92A59B]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
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
            <div className="rounded-xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-white dark:bg-[#111C17] px-3.5 py-2 text-xs shadow-lg flex items-center justify-between gap-2">
              <span className="font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums">
                {t.talqeenPromptPrefix}{' '}
                {lang === 'ar'
                  ? `${toArabicDigits(talqeenCountdown)} ث`
                  : `${talqeenCountdown}s`}
              </span>
              <button
                type="button"
                onClick={onSkipTalqeenPause}
                className="rounded-lg bg-[#27784C] dark:bg-[#52B77F] px-3 py-1 text-[11px] font-semibold text-white dark:text-[#0A110E]"
              >
                {t.talqeenSkipPause}
              </button>
            </div>
          </div>
        )}

        {/* Interactive 3D Audio Settings Drawer */}
        {expanded && (
          <div
            data-testid="audio-player-drawer"
            className="w-full max-w-2xl pointer-events-auto rounded-3xl surface-3d shadow-2xl px-4 sm:px-5 py-4 space-y-4 max-h-[68vh] overflow-y-auto"
          >
            {/* Header Info + Tab Switcher (Audio Tiles vs Big Reciters List) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2EAE5] dark:border-[#1E2E26]">
              <button
                type="button"
                onClick={onJumpToActiveAyah}
                className="min-w-0 text-start hover:opacity-80 transition-opacity"
              >
                <div className="text-sm sm:text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate tabular-nums">
                  {surahTitle} · {ayahBadge}
                </div>
                <div className="text-[11px] sm:text-xs text-[#27784C] dark:text-[#52B77F] font-medium truncate">
                  {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
                </div>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex rounded-xl bg-[#F4F7F5] dark:bg-[#0A110E] border border-[#E2EAE5] dark:border-[#1E2E26] p-0.5">
                  <button
                    type="button"
                    data-testid="drawer-tab-controls"
                    onClick={() => setDrawerTab('controls')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      drawerTab === 'controls'
                        ? 'btn-3d-emerald text-white'
                        : 'text-[#5A6B62] dark:text-[#92A59B]'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>
                      {lang === 'ar' ? 'الإعدادات' : lang === 'fr' ? 'Réglages' : 'Controls'}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-testid="drawer-tab-reciters"
                    onClick={() => setDrawerTab('reciters')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all tabular-nums ${
                      drawerTab === 'reciters'
                        ? 'btn-3d-emerald text-white'
                        : 'text-[#5A6B62] dark:text-[#92A59B]'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>
                      {lang === 'ar'
                        ? `القراء (${toArabicDigits(RECITERS.length)})`
                        : lang === 'fr'
                          ? `Récitateurs (${RECITERS.length})`
                          : `Reciters (${RECITERS.length})`}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label={t.closeWord}
                  className="h-9 w-9 flex items-center justify-center rounded-full surface-3d text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {audioError && (
              <p className="text-xs font-medium text-[#27784C] dark:text-[#52B77F]">
                {audioError}
              </p>
            )}

            {drawerTab === 'reciters' ? (
              <ReciterPickerList
                lang={lang}
                activeReciterId={reciter.id}
                isPlaying={isPlaying}
                onSelectReciter={(id) => {
                  onChangeReciter(id);
                }}
              />
            ) : (
              <div className="space-y-4">
                {/* Transport & Timeline Control Strip */}
                <div className="rounded-2xl surface-3d px-3.5 py-2.5 flex items-center justify-between gap-2 tabular-nums">
                  <span className="text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]">
                    {formatAudioTime(currentTime)}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onPlayPrev}
                      aria-label={t.prevSurah}
                      className="h-9 w-9 rounded-xl surface-3d surface-3d-interactive flex items-center justify-center text-[#142019] dark:text-[#F1F5F3]"
                    >
                      <SkipBack className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={onTogglePlayPause}
                      aria-label={isPlaying ? t.pauseReciter : t.playReciter}
                      className="h-10 w-10 rounded-full btn-3d-emerald text-white flex items-center justify-center"
                    >
                      {isBuffering ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                      ) : isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current ms-0.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onPlayNext}
                      aria-label={t.nextSurah}
                      className="h-9 w-9 rounded-xl surface-3d surface-3d-interactive flex items-center justify-center text-[#142019] dark:text-[#F1F5F3]"
                    >
                      <SkipForward className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]">
                    {formatAudioTime(duration)}
                  </span>
                </div>

                {/* Big Interactive 3D Active Reciter Selector Card (opens full Reciter Card List) */}
                <button
                  type="button"
                  data-testid="drawer-open-reciters-card"
                  onClick={() => setDrawerTab('reciters')}
                  className="w-full min-h-[72px] rounded-2xl emerald-3d-hero p-3.5 sm:p-4 text-white text-start flex items-center gap-3.5 relative overflow-hidden hover:-translate-y-0.5 active:scale-[0.985] transition-transform"
                >
                  <div className="pointer-events-none absolute inset-0 gloss-sheen" />
                  <span className="relative z-10 h-12 w-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {isPlaying ? (
                      <AudioLines className="h-5 w-5 animate-pulse" strokeWidth={2} />
                    ) : (
                      getReciterMonogram(reciter.nameEn)
                    )}
                  </span>
                  <div className="relative z-10 min-w-0 flex-1 space-y-0.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                      {lang === 'ar'
                        ? `القارئ الحالي · اضغط لاختيار من ${toArabicDigits(RECITERS.length)} قارئ`
                        : lang === 'fr'
                          ? `Récitateur · Choisir parmi ${RECITERS.length}`
                          : `Active Reciter · Choose from ${RECITERS.length}`}
                    </div>
                    <div className="text-sm sm:text-base font-bold truncate">
                      {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
                    </div>
                    <div className="text-[11px] text-white/85 truncate">
                      {localizeReciterSubtitle(reciter, lang)}
                    </div>
                  </div>
                  <span className="relative z-10 h-8 w-8 rounded-full bg-white text-[#27784C] flex items-center justify-center shrink-0 shadow-sm">
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} />
                  </span>
                </button>

                {/* Big Interactive 3D Square Audio Settings Grid (miraba3at okbar) */}
                <div
                  data-testid="audio-settings-squares-grid"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
                >
                  {/* Square 1: Playback Speed */}
                  <button
                    type="button"
                    data-testid="tile-audio-speed"
                    onClick={() => onChangeSpeed(cyclePlaybackSpeed(playbackSpeed))}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      playbackSpeed !== 1
                        ? 'emerald-3d-hero text-white'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          playbackSpeed !== 1
                            ? 'bg-white/20 text-white'
                            : 'btn-3d-emerald text-white'
                        }`}
                      >
                        <Gauge className="h-5 w-5" strokeWidth={1.85} />
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums whitespace-nowrap shrink-0 ${
                          playbackSpeed !== 1
                            ? 'bg-white text-[#27784C]'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        {playbackSpeed}x
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {lang === 'ar' ? 'سرعة التلاوة' : lang === 'fr' ? 'Vitesse' : 'Speed'}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          playbackSpeed !== 1
                            ? 'text-white/85'
                            : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'تبطيء أو تسريع الصوت'
                          : lang === 'fr'
                            ? 'Ralentir ou accélérer'
                            : 'Tap to cycle pace'}
                      </p>
                    </div>
                  </button>

                  {/* Square 2: Repeat / Loop Mode */}
                  <button
                    type="button"
                    data-testid="tile-audio-repeat"
                    onClick={onCycleLoopMode}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      loopMode !== 'none'
                        ? 'emerald-3d-hero text-white'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          loopMode !== 'none'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        {loopMode === 'ayah' ? (
                          <Repeat1 className="h-5 w-5" strokeWidth={1.85} />
                        ) : (
                          <Repeat className="h-5 w-5" strokeWidth={1.85} />
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                          loopMode !== 'none'
                            ? 'bg-white text-[#27784C]'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {loopMode === 'none'
                          ? t.repeatOff
                          : loopMode === 'ayah'
                            ? t.repeatAyah
                            : t.repeatSurah}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {lang === 'ar' ? 'تكرار الآية' : lang === 'fr' ? 'Répétition' : 'Repeat'}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          loopMode !== 'none'
                            ? 'text-white/85'
                            : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'إعادة الآية أو السورة'
                          : lang === 'fr'
                            ? 'Boucler verset ou sourate'
                            : 'Loop verse or surah'}
                      </p>
                    </div>
                  </button>

                  {/* Square 3: Voice Recite Follow */}
                  <button
                    type="button"
                    data-testid="tile-audio-voice"
                    onClick={onToggleVoiceRecite}
                    aria-pressed={isListening}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      isListening
                        ? 'emerald-3d-hero text-white ring-2 ring-emerald-400/50'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isListening
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        {isListening ? (
                          <MicOff className="h-5 w-5 animate-pulse" strokeWidth={1.85} />
                        ) : (
                          <Mic className="h-5 w-5" strokeWidth={1.85} />
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                          isListening
                            ? 'bg-rose-500 text-white'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {isListening
                          ? lang === 'ar'
                            ? 'يستمع'
                            : 'Live'
                          : lang === 'ar'
                            ? 'متوقف'
                            : 'Tap'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {isListening ? t.micStop : t.micRecite}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          isListening
                            ? 'text-white/85'
                            : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'اقرأ وتأكد من حفظك'
                          : lang === 'fr'
                            ? 'Suivi vocal en direct'
                            : 'Recite & track words'}
                      </p>
                    </div>
                  </button>

                  {/* Square 4: Hifz Masking Mode */}
                  <button
                    type="button"
                    data-testid="tile-audio-hifz"
                    onClick={onToggleHifzMode}
                    aria-pressed={hifzMode}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      hifzMode
                        ? 'emerald-3d-hero text-white'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          hifzMode
                            ? 'bg-white/20 text-white'
                            : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        {hifzMode ? (
                          <EyeOff className="h-5 w-5" strokeWidth={1.85} />
                        ) : (
                          <Eye className="h-5 w-5" strokeWidth={1.85} />
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                          hifzMode
                            ? 'bg-white text-[#27784C]'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {hifzMode ? (lang === 'ar' ? 'مفعّل' : 'ON') : lang === 'ar' ? 'إيقاف' : 'OFF'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {t.hifzMode}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          hifzMode ? 'text-white/85' : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'إخفاء الآيات لاختبار الحفظ'
                          : lang === 'fr'
                            ? 'Masquer pour mémoriser'
                            : 'Blur verses to test memory'}
                      </p>
                    </div>
                  </button>

                  {/* Square 5: Translation Show/Hide */}
                  <button
                    type="button"
                    data-testid="tile-audio-translation"
                    onClick={() => onUpdateSettings({showTranslation: !settings.showTranslation})}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      settings.showTranslation
                        ? 'emerald-3d-hero text-white'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          settings.showTranslation
                            ? 'bg-white/20 text-white'
                            : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        <BookOpenText className="h-5 w-5" strokeWidth={1.85} />
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                          settings.showTranslation
                            ? 'bg-white text-[#27784C]'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {settings.showTranslation
                          ? lang === 'ar'
                            ? 'ظاهرة'
                            : 'ON'
                          : lang === 'ar'
                            ? 'مخفية'
                            : 'OFF'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {lang === 'ar' ? 'الترجمة' : lang === 'fr' ? 'Traduction' : 'Translation'}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          settings.showTranslation
                            ? 'text-white/85'
                            : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'إظهار المعاني تحت الآية'
                          : lang === 'fr'
                            ? 'Afficher le sens des versets'
                            : 'Show verse meaning'}
                      </p>
                    </div>
                  </button>

                  {/* Square 6: Sleep Timer */}
                  <button
                    type="button"
                    data-testid="tile-audio-sleep"
                    onClick={() => onChangeSleepTimer(cycleSleepTimer(sleepTimer))}
                    className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                      sleepTimer !== 0
                        ? 'emerald-3d-hero text-white'
                        : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          sleepTimer !== 0
                            ? 'bg-white/20 text-white'
                            : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                        }`}
                      >
                        <Clock className="h-5 w-5" strokeWidth={1.85} />
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums whitespace-nowrap shrink-0 ${
                          sleepTimer !== 0
                            ? 'bg-white text-[#27784C]'
                            : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {sleepSecondsLeft > 0
                          ? formatAudioTime(sleepSecondsLeft)
                          : sleepTimer === -1
                            ? t.endOfSurah
                            : sleepTimer > 0
                              ? `${sleepTimer}m`
                              : 'OFF'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">
                        {lang === 'ar' ? 'مؤقت النوم' : lang === 'fr' ? 'Minuteur' : 'Sleep Timer'}
                      </div>
                      <p
                        className={`text-[10.5px] leading-snug mt-0.5 ${
                          sleepTimer !== 0
                            ? 'text-white/85'
                            : 'text-[#5A6B62] dark:text-[#92A59B]'
                        }`}
                      >
                        {lang === 'ar'
                          ? 'إيقاف التلاوة تلقائياً'
                          : lang === 'fr'
                            ? 'Arrêt automatique'
                            : 'Auto-stop after duration'}
                      </p>
                    </div>
                  </button>

                  {/* Square 7: Offline Surah Download */}
                  {surahMeta && (
                    <button
                      type="button"
                      data-testid="tile-audio-offline"
                      onClick={() => onDownloadSurah(surahMeta)}
                      disabled={isDownloadingCurrent}
                      className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                        isCurrentSurahOffline
                          ? 'emerald-3d-hero text-white'
                          : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrentSurahOffline
                              ? 'bg-white/20 text-white'
                              : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                          }`}
                        >
                          {isDownloadingCurrent ? (
                            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.85} />
                          ) : isCurrentSurahOffline ? (
                            <Check className="h-5 w-5" strokeWidth={2} />
                          ) : (
                            <Download className="h-5 w-5" strokeWidth={1.85} />
                          )}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums whitespace-nowrap shrink-0 ${
                            isCurrentSurahOffline
                              ? 'bg-white text-[#27784C]'
                              : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#27784C] dark:text-[#52B77F]'
                          }`}
                        >
                          {isDownloadingCurrent
                            ? `${downloadProgress?.completed}/${downloadProgress?.total}`
                            : isCurrentSurahOffline
                              ? lang === 'ar'
                                ? 'محفوظ'
                                : 'Saved'
                              : lang === 'ar'
                                ? 'حفظ'
                                : 'Save'}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">
                          {lang === 'ar'
                            ? 'حفظ للاستماع'
                            : lang === 'fr'
                              ? 'Hors ligne'
                              : 'Save Offline'}
                        </div>
                        <p
                          className={`text-[10.5px] leading-snug mt-0.5 ${
                            isCurrentSurahOffline
                              ? 'text-white/85'
                              : 'text-[#5A6B62] dark:text-[#92A59B]'
                          }`}
                        >
                          {lang === 'ar'
                            ? 'تشغيل السورة بدون إنترنت'
                            : lang === 'fr'
                              ? 'Écouter sans internet'
                              : 'Play anytime offline'}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Square 8: Keep Screen Awake */}
                  {wakeLockSupported && onToggleWakeLock && (
                    <button
                      type="button"
                      data-testid="wake-lock-toggle"
                      onClick={onToggleWakeLock}
                      aria-pressed={wakeLockEnabled}
                      className={`min-h-[118px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 transition-all active:scale-[0.97] ${
                        wakeLockEnabled
                          ? 'emerald-3d-hero text-white'
                          : 'surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            wakeLockEnabled
                              ? 'bg-white/20 text-white'
                              : 'bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14] text-[#27784C] dark:text-[#52B77F]'
                          }`}
                        >
                          <Sun className="h-5 w-5" strokeWidth={1.85} />
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                            wakeLockEnabled
                              ? 'bg-white text-[#27784C]'
                              : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]'
                          }`}
                        >
                          {wakeLockEnabled ? (lang === 'ar' ? 'مضيئة' : 'ON') : 'OFF'}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">
                          {t.wakeLockLabel}
                        </div>
                        <p
                          className={`text-[10.5px] leading-snug mt-0.5 ${
                            wakeLockEnabled
                              ? 'text-white/85'
                              : 'text-[#5A6B62] dark:text-[#92A59B]'
                          }`}
                        >
                          {wakeLockActive
                            ? t.wakeLockActive
                            : lang === 'ar'
                              ? 'منع انطفاء الشاشة'
                              : lang === 'fr'
                                ? 'Écran toujours allumé'
                                : 'Keep display awake'}
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Talqeen Memorization Interactive 3D Tile */}
                <div className="rounded-2xl surface-3d p-3.5 sm:p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#142019] dark:text-[#F1F5F3]">
                        {t.talqeenTitle}
                      </div>
                      <p className="text-[11px] text-[#5A6B62] dark:text-[#92A59B]">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        talqeen.enabled
                          ? 'btn-3d-emerald text-white'
                          : 'surface-3d text-[#5A6B62] dark:text-[#92A59B]'
                      }`}
                    >
                      {talqeen.enabled ? t.talqeenEnabled : t.talqeenOff}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs tabular-nums">
                      <span className="font-medium text-[#5A6B62] dark:text-[#92A59B]">
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
                        className="w-14 rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2 py-1 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]"
                      />
                      <span className="text-[#5A6B62] dark:text-[#92A59B]">{t.talqeenToWord}</span>
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
                        className="w-14 rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2 py-1 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium text-[#5A6B62] dark:text-[#92A59B]">
                        {t.talqeenPauseLabel}:
                      </span>
                      {([3, 5, 8] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => onUpdateTalqeen({pauseSeconds: sec})}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                            talqeen.pauseSeconds === sec
                              ? 'btn-3d-emerald text-white'
                              : 'surface-3d text-[#5A6B62] dark:text-[#92A59B]'
                          }`}
                        >
                          {lang === 'ar' ? `${toArabicDigits(sec)}ث` : `${sec}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {!isInstalled && onOpenInstall && (
                  <div className="rounded-2xl surface-3d p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]">
                        {t.downloadApkTitle}
                      </div>
                      <p className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate">
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
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl surface-3d px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] whitespace-nowrap"
                    >
                      <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{t.downloadApkBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3D Reflective Emerald Waveform Capsule Player */}
        <div
          data-testid="waveform-capsule-player"
          className="w-full max-w-[366px] sm:max-w-lg pointer-events-auto rounded-full surface-3d px-2.5 py-2 flex items-center gap-3"
        >
          {/* Left 3D Reflective Emerald Play/Pause Button */}
          <button
            type="button"
            data-testid="capsule-play-btn"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? t.pauseReciter : t.playReciter}
            className="w-10 h-10 rounded-full btn-3d-emerald text-white flex items-center justify-center transition-all shrink-0"
          >
            {isBuffering ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ms-0.5" />
            )}
          </button>

          {/* Center Fine Acoustic Waveform */}
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
            className="flex-1 min-w-0 h-8 flex items-center justify-between gap-[2px] sm:gap-[3px] cursor-pointer touch-none select-none px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27784C] dark:focus-visible:ring-[#52B77F] rounded-full"
          >
            {waveformBars.map((amp, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  barRefs.current[idx] = el;
                }}
                data-played="false"
                className="w-[2px] rounded-full transition-colors duration-75 bg-[#27784C]/20 dark:bg-white/20 data-[played=true]:bg-[#27784C] dark:data-[played=true]:bg-[#52B77F]"
                style={{height: `${Math.round(amp * 100)}%`}}
              />
            ))}
          </div>

          {/* Right Compact Drawer Toggle */}
          <button
            type="button"
            data-testid="capsule-drawer-toggle"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={t.settingsBtn}
            title={`${surahTitle} · ${ayahBadge} · ${playbackSpeed}x`}
            className={`h-8 px-2.5 inline-flex items-center gap-1 rounded-full text-[11px] font-semibold transition-all shrink-0 tabular-nums ${
              expanded
                ? 'btn-3d-emerald text-white'
                : 'bg-[#EAF1EC] dark:bg-[#192A22] text-[#27784C] dark:text-[#52B77F] hover:bg-[#DCE9E0] dark:hover:bg-[#1E3229]'
            }`}
          >
            <span className="max-w-[54px] truncate">{ayahBadge}</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 rotate-180 transition-transform" strokeWidth={1.75} />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
