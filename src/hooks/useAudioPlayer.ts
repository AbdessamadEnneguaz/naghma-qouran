import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  HifzRepeatCount,
  LoopMode,
  QuranVerse,
  Reciter,
  SurahMeta,
  TalqeenConfig,
} from '../types/quran';
import {
  advanceAyahLoop,
  createAyahLoopState,
  type AyahLoopState,
} from '../utils/audioLoopLogic';
import {
  getAyahAudioCandidates,
  getGlobalAyahNumber,
  getNextSurahAyah,
  getPrevSurahAyah,
  getUpcomingSurahAyahTargets,
  getUpcomingSurahs,
} from '../utils/quranLogic';
import {
  findAyahAtTimeMs,
  getFallbackAyahReciterId,
  shouldFallbackToAyahDeck,
  type AyahTimingSegment,
} from '../utils/surahTimingLogic';
import {getCachedSurahTimingSync, getSurahAyatTiming} from '../services/surahTimingService';
import {getCachedAudioBlob} from '../services/indexedDbVault';
import {findVerseAndPage} from '../services/quranLoader';
import {syncActiveVerseDomHighlight} from '../utils/verseHighlightDom';
import {
  buildMediaSessionMetadataPayload,
  computeSafePositionState,
} from '../utils/mediaSessionLogic';
import {
  disposeAudioKeepAlive,
  startAudioKeepAlive,
  stopAudioKeepAlive,
} from '../utils/backgroundAudioKeepAlive';
import {
  buildMediaNotificationMetadata,
  startOrUpdateNativeMediaService,
  stopNativeMediaService,
  subscribeNativeMediaActions,
} from '../utils/nativeAndroidBridge';
import type {AppLang} from '../i18n/translations';

export type SleepTimerOption = 0 | 15 | 30 | 45 | 60 | -1; // -1 = end of surah
export type ProgressListener = (currentTimeSec: number, durationSec: number) => void;

function getPlaybackErrorMessage(curLang: AppLang): string {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    if (curLang === 'ar') {
      return 'أنت غير متصل بالإنترنت. نص المصحف متاح كاملاً للقراءة، وللاستماع دون اتصال احفظ السورة من المحفوظات.';
    }
    if (curLang === 'fr') {
      return 'Vous êtes hors ligne. Les 604 pages du Moushaf restent lisibles et les sourates enregistrées fonctionnent hors connexion.';
    }
    return 'You are offline. All 604 Mushaf pages remain readable, and any Surah downloaded in the Vault plays offline.';
  }
  if (curLang === 'ar') {
    return 'تعذر تشغيل الصوت حالياً. تحقق من الاتصال أو استخدم التلاوات المحفوظة.';
  }
  if (curLang === 'fr') {
    return 'Lecture audio impossible pour le moment. Vérifiez la connexion ou utilisez une sourate hors ligne.';
  }
  return 'Unable to stream audio. Check connection or use a downloaded Surah.';
}

interface UseAudioPlayerArgs {
  verses: QuranVerse[];
  surahs: SurahMeta[];
  reciter: Reciter;
  playbackSpeed: number;
  audioSyncOffsetSec?: number;
  lang?: AppLang;
  viewSurah?: number;
  viewAyah?: number;
  onActiveVerseChange?: (verse: QuranVerse) => void;
  onFallbackReciter?: (reciterId: string) => void;
}

interface DeckSlot {
  reciterId: string;
  mode: Reciter['mode'];
  surah: number;
  ayah: number;
  candidates: string[];
  candidateIdx: number;
  objectUrl: string | null;
  ready: boolean;
}

function matchesSlot(
  slot: DeckSlot | null,
  reciter: Reciter,
  surah: number,
  ayah: number
): boolean {
  if (!slot) return false;
  if (slot.reciterId !== reciter.id || slot.mode !== reciter.mode) return false;
  if (slot.surah !== surah) return false;
  return reciter.mode === 'surah' ? true : slot.ayah === ayah;
}

export function useAudioPlayer({
  verses,
  surahs,
  reciter,
  playbackSpeed,
  audioSyncOffsetSec = 0,
  lang = 'en',
  viewSurah = 1,
  viewAyah = 1,
  onActiveVerseChange,
  onFallbackReciter,
}: UseAudioPlayerArgs) {
  const decksRef = useRef<[HTMLAudioElement, HTMLAudioElement] | null>(null);
  const lookahead2Ref = useRef<HTMLAudioElement | null>(null);
  const activeDeckIdxRef = useRef<0 | 1>(0);
  const deckSlotsRef = useRef<[DeckSlot | null, DeckSlot | null]>([null, null]);
  const lookahead2SlotRef = useRef<DeckSlot | null>(null);

  const exactTimingCacheRef = useRef<Map<string, AyahTimingSegment[] | null>>(new Map());
  const pendingSurahSeekAyahRef = useRef<{surah: number; ayah: number} | null>(null);
  const loadedTrackRef = useRef<{surah: number; ayah: number; reciterId: string} | null>(null);
  const progressListenersRef = useRef<Set<ProgressListener>>(new Set());

  const playEpochRef = useRef<number>(0);
  const preloadEpochRef = useRef<number>(0);
  const autoplayIntendedRef = useRef<boolean>(false);
  const talqeenTimerRef = useRef<number | null>(null);
  const lastPositionSyncMsRef = useRef<number>(0);
  const lastUiClockCommitMsRef = useRef<number>(0);

  const [activeSurah, setActiveSurah] = useState<number>(viewSurah);
  const [activeAyah, setActiveAyah] = useState<number>(viewAyah);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [sleepTimer, setSleepTimer] = useState<SleepTimerOption>(0);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const [talqeen, setTalqeen] = useState<TalqeenConfig>({
    enabled: false,
    startAyah: 1,
    endAyah: 7,
    pauseSeconds: 5,
  });
  const [talqeenCountdown, setTalqeenCountdown] = useState<number | null>(null);
  const [hifzRepeatTarget, setHifzRepeatTargetState] = useState<HifzRepeatCount>(1);
  const [hifzRepeatDone, setHifzRepeatDone] = useState<number>(0);
  const hifzLoopRef = useRef<AyahLoopState | null>(null);

  const clearTalqeenTimer = useCallback(() => {
    if (talqeenTimerRef.current !== null) {
      window.clearInterval(talqeenTimerRef.current);
      talqeenTimerRef.current = null;
    }
    setTalqeenCountdown(null);
  }, []);

  const stateRef = useRef({
    activeSurah,
    activeAyah,
    hasStarted,
    isPlaying,
    loopMode,
    sleepTimer,
    reciter,
    verses,
    surahs,
    playbackSpeed,
    audioSyncOffsetSec,
    lang,
    talqeen,
    hifzRepeatTarget,
  });
  stateRef.current = {
    activeSurah,
    activeAyah,
    hasStarted,
    isPlaying,
    loopMode,
    sleepTimer,
    reciter,
    verses,
    surahs,
    playbackSpeed,
    audioSyncOffsetSec,
    lang,
    talqeen,
    hifzRepeatTarget,
  };

  const subscribeProgress = useCallback((listener: ProgressListener) => {
    progressListenersRef.current.add(listener);
    const activeAudio = decksRef.current?.[activeDeckIdxRef.current];
    if (activeAudio) {
      const dur = Number.isFinite(activeAudio.duration) ? activeAudio.duration : 0;
      listener(activeAudio.currentTime || 0, dur);
    }
    return () => {
      progressListenersRef.current.delete(listener);
    };
  }, []);

  const emitProgress = useCallback((curSec: number, durSec: number, forceUiState = false) => {
    for (const listener of progressListenersRef.current) {
      listener(curSec, durSec);
    }
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (forceUiState || now - lastUiClockCommitMsRef.current >= 480) {
      lastUiClockCommitMsRef.current = now;
      setCurrentTime(curSec);
      if (durSec > 0) setDuration(durSec);
    }
  }, []);

  const notifyActiveVerseChange = useCallback(
    async (surah: number, ayah: number) => {
      syncActiveVerseDomHighlight(surah, ayah, true);
      const localMatch = stateRef.current.verses.find(
        (item) => item.surah === surah && item.ayah === ayah
      );
      if (localMatch) {
        onActiveVerseChange?.(localMatch);
        return;
      }
      const located = await findVerseAndPage(surah, ayah);
      if (located && stateRef.current.activeSurah === surah && stateRef.current.activeAyah === ayah) {
        onActiveVerseChange?.(located.verse);
      }
    },
    [onActiveVerseChange]
  );

  // Sync direct DOM highlight whenever play state or active coordinates change
  useEffect(() => {
    syncActiveVerseDomHighlight(activeSurah, activeAyah, isPlaying);
  }, [activeSurah, activeAyah, isPlaying]);

  const syncMediaSessionPosition = useCallback(
    (audioDuration: number, audioCurrentTime: number, speed: number, force = false) => {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
      const ms = navigator.mediaSession as MediaSession & {
        setPositionState?: (state?: MediaPositionState) => void;
      };
      if (typeof ms.setPositionState !== 'function') return;

      const now = Date.now();
      if (!force && now - lastPositionSyncMsRef.current < 900) return;

      const posState = computeSafePositionState(audioDuration, audioCurrentTime, speed);
      if (!posState) return;
      lastPositionSyncMsRef.current = now;
      try {
        ms.setPositionState(posState);
      } catch {
        // Some WebViews throw on partial metadata duration
      }
    },
    []
  );

  const getVerifiedTimingSegments = useCallback(
    (targetReciter: Reciter, surah: number): AyahTimingSegment[] => {
      const exactKey = `${targetReciter.id}:${surah}`;
      if (exactTimingCacheRef.current.has(exactKey)) {
        return exactTimingCacheRef.current.get(exactKey) ?? [];
      }
      const syncCached = getCachedSurahTimingSync(targetReciter.id, surah);
      if (syncCached && syncCached.length > 0) {
        exactTimingCacheRef.current.set(exactKey, syncCached);
        return syncCached;
      }
      return [];
    },
    []
  );

  const ensureSurahTiming = useCallback(
    async (targetReciter: Reciter, surah: number, triggeredByPlayback = false) => {
      if (targetReciter.mode !== 'surah') return;
      const key = `${targetReciter.id}:${surah}`;
      const existing = exactTimingCacheRef.current.get(key);
      if (existing && existing.length > 0) return;

      const surahVerses = stateRef.current.verses.filter((v) => v.surah === surah);
      const [segments, cachedChapter] = await Promise.all([
        getSurahAyatTiming(targetReciter, surah, surahVerses),
        getCachedAudioBlob(targetReciter, surah),
      ]);

      if (
        (!segments || segments.length === 0) &&
        triggeredByPlayback &&
        shouldFallbackToAyahDeck({
          reciterMode: targetReciter.mode,
          timingResolved: true,
          hasSegments: false,
          hasOfflineChapter: Boolean(cachedChapter),
        }) &&
        onFallbackReciter &&
        stateRef.current.reciter.id === targetReciter.id &&
        stateRef.current.activeSurah === surah
      ) {
        onFallbackReciter(getFallbackAyahReciterId(targetReciter.riwayat));
        return;
      }

      if (!segments || segments.length === 0) return;
      exactTimingCacheRef.current.set(key, segments);

      const activeAudio = decksRef.current?.[activeDeckIdxRef.current];
      if (
        !activeAudio ||
        stateRef.current.reciter.id !== targetReciter.id ||
        stateRef.current.activeSurah !== surah
      ) {
        return;
      }

      const pending = pendingSurahSeekAyahRef.current;
      if (pending && pending.surah === surah && pending.ayah > 1) {
        const seg = segments.find((s) => s.ayah === pending.ayah);
        if (seg && Number.isFinite(activeAudio.duration) && activeAudio.duration > 0) {
          activeAudio.currentTime = Math.min(
            Math.max(0, activeAudio.duration - 0.5),
            seg.startMs / 1000
          );
          pendingSurahSeekAyahRef.current = null;
        }
      }

      if (!activeAudio.paused) {
        const matchedAyah = findAyahAtTimeMs(
          segments,
          activeAudio.currentTime * 1000,
          stateRef.current.audioSyncOffsetSec
        );
        if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
          stateRef.current.activeAyah = matchedAyah;
          loadedTrackRef.current = {
            surah,
            ayah: matchedAyah,
            reciterId: targetReciter.id,
          };
          setActiveAyah(matchedAyah);
          void notifyActiveVerseChange(surah, matchedAyah);
        }
      }
    },
    [notifyActiveVerseChange, onFallbackReciter]
  );

  // Sync displayed Surah/Ayah immediately when navigating Surahs/Mushaf pages while idle/paused
  useEffect(() => {
    if (isPlaying || talqeenCountdown !== null) return;
    if (viewSurah < 1 || viewSurah > 114 || viewAyah < 1) return;

    setActiveSurah(viewSurah);
    setActiveAyah(viewAyah);
    stateRef.current.activeSurah = viewSurah;
    stateRef.current.activeAyah = viewAyah;

    const loaded = loadedTrackRef.current;
    if (loaded && (loaded.surah !== viewSurah || loaded.ayah !== viewAyah)) {
      emitProgress(0, 0, true);
      setDuration(0);
    }

    if (reciter.mode === 'surah') {
      void ensureSurahTiming(reciter, viewSurah, false);
    }
  }, [
    viewSurah,
    viewAyah,
    isPlaying,
    talqeenCountdown,
    reciter,
    ensureSurahTiming,
    emitProgress,
  ]);

  // Keep Talqeen ayah bounds synced with active Surah total ayahs
  useEffect(() => {
    const meta = surahs.find((s) => s.id === activeSurah);
    if (!meta) return;
    setTalqeen((prev) => {
      const clampedStart = Math.max(1, Math.min(meta.totalAyahs, prev.startAyah));
      const clampedEnd = Math.max(clampedStart, Math.min(meta.totalAyahs, prev.endAyah));
      if (clampedStart === prev.startAyah && clampedEnd === prev.endAyah) return prev;
      return {...prev, startAyah: clampedStart, endAyah: clampedEnd};
    });
  }, [activeSurah, surahs]);

  const releaseSlot = useCallback(
    (audio: HTMLAudioElement | null, slot: DeckSlot | null) => {
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      if (slot?.objectUrl) {
        URL.revokeObjectURL(slot.objectUrl);
      }
    },
    []
  );

  const resolveAudioSource = useCallback(
    async (
      targetReciter: Reciter,
      surah: number,
      ayah: number
    ): Promise<{candidates: string[]; objectUrl: string | null}> => {
      const globalAyah = getGlobalAyahNumber(surah, ayah);
      const cachedBlob = await getCachedAudioBlob(
        targetReciter,
        surah,
        targetReciter.mode === 'ayah' ? ayah : undefined
      );
      if (cachedBlob) {
        const objUrl = URL.createObjectURL(cachedBlob);
        return {
          candidates: [objUrl, ...getAyahAudioCandidates(targetReciter, surah, ayah, globalAyah)],
          objectUrl: objUrl,
        };
      }
      return {
        candidates: getAyahAudioCandidates(targetReciter, surah, ayah, globalAyah),
        objectUrl: null,
      };
    },
    []
  );

  const assignTargetToBuffer = useCallback(
    async (
      audio: HTMLAudioElement,
      getSlot: () => DeckSlot | null,
      setSlot: (next: DeckSlot | null) => void,
      targetReciter: Reciter,
      surah: number,
      ayah: number,
      _epoch: number,
      isCurrentEpoch: () => boolean
    ) => {
      const existing = getSlot();
      if (matchesSlot(existing, targetReciter, surah, ayah) && audio.src) {
        return;
      }

      const resolved = await resolveAudioSource(targetReciter, surah, ayah);
      if (!isCurrentEpoch()) {
        if (resolved.objectUrl) URL.revokeObjectURL(resolved.objectUrl);
        return;
      }

      releaseSlot(audio, getSlot());
      const nextSlot: DeckSlot = {
        reciterId: targetReciter.id,
        mode: targetReciter.mode,
        surah,
        ayah,
        candidates: resolved.candidates,
        candidateIdx: 0,
        objectUrl: resolved.objectUrl,
        ready: false,
      };
      setSlot(nextSlot);
      audio.preload = 'auto';
      audio.src = resolved.candidates[0];
      audio.load();
    },
    [releaseSlot, resolveAudioSource]
  );

  /**
   * O(1) Lookahead buffer: preloads N+1 into Standby Deck and N+2 into Lookahead2
   * without scanning all 6,236 verses.
   */
  const preloadUpcoming = useCallback(
    async (curSurah: number, curAyah: number) => {
      const decks = decksRef.current;
      const lookahead2 = lookahead2Ref.current;
      if (!decks || !lookahead2) return;

      const epoch = ++preloadEpochRef.current;
      const isCurrent = () => preloadEpochRef.current === epoch;
      const {reciter: curReciter} = stateRef.current;

      const targets: Array<{surah: number; ayah: number}> =
        curReciter.mode === 'ayah'
          ? getUpcomingSurahAyahTargets(curSurah, curAyah, 2)
          : getUpcomingSurahs(curSurah, 2).map((s) => ({surah: s, ayah: 1}));

      const standbyIdx: 0 | 1 = activeDeckIdxRef.current === 0 ? 1 : 0;
      const standbyAudio = decks[standbyIdx];

      if (targets[0]) {
        const t1 = targets[0];
        const currentStandby = deckSlotsRef.current[standbyIdx];
        if (!matchesSlot(currentStandby, curReciter, t1.surah, t1.ayah)) {
          const l2 = lookahead2SlotRef.current;
          if (matchesSlot(l2, curReciter, t1.surah, t1.ayah) && l2) {
            releaseSlot(standbyAudio, currentStandby);
            const promotedSlot: DeckSlot = {...l2, ready: false};
            lookahead2SlotRef.current = null;
            lookahead2.pause();
            lookahead2.removeAttribute('src');
            lookahead2.load();

            deckSlotsRef.current[standbyIdx] = promotedSlot;
            standbyAudio.preload = 'auto';
            standbyAudio.src =
              promotedSlot.candidates[promotedSlot.candidateIdx] || promotedSlot.candidates[0];
            standbyAudio.load();
          } else {
            await assignTargetToBuffer(
              standbyAudio,
              () => deckSlotsRef.current[standbyIdx],
              (next) => {
                deckSlotsRef.current[standbyIdx] = next;
              },
              curReciter,
              t1.surah,
              t1.ayah,
              epoch,
              isCurrent
            );
          }
        }
      } else {
        releaseSlot(standbyAudio, deckSlotsRef.current[standbyIdx]);
        deckSlotsRef.current[standbyIdx] = null;
      }

      if (!isCurrent()) return;

      if (targets[1]) {
        const t2 = targets[1];
        await assignTargetToBuffer(
          lookahead2,
          () => lookahead2SlotRef.current,
          (next) => {
            lookahead2SlotRef.current = next;
          },
          curReciter,
          t2.surah,
          t2.ayah,
          epoch,
          isCurrent
        );
      } else {
        releaseSlot(lookahead2, lookahead2SlotRef.current);
        lookahead2SlotRef.current = null;
      }
    },
    [assignTargetToBuffer, releaseSlot]
  );

  const loadAndPlay = useCallback(
    async (surah: number, ayah: number, autoplay = true) => {
      const decks = decksRef.current;
      if (!decks) return;

      clearTalqeenTimer();

      const epoch = ++playEpochRef.current;
      const curReciter = stateRef.current.reciter;
      autoplayIntendedRef.current = autoplay;
      pendingSurahSeekAyahRef.current =
        curReciter.mode === 'surah' && ayah > 1 ? {surah, ayah} : null;

      if (curReciter.mode === 'surah') {
        void ensureSurahTiming(curReciter, surah, autoplay);
      }

      setActiveSurah(surah);
      setActiveAyah(ayah);
      stateRef.current.activeSurah = surah;
      stateRef.current.activeAyah = ayah;
      setHasStarted(true);
      setAudioError(null);
      emitProgress(0, 0, true);
      setDuration(0);

      syncActiveVerseDomHighlight(surah, ayah, autoplay);
      void notifyActiveVerseChange(surah, ayah);

      if (autoplay) {
        startAudioKeepAlive();
      }

      const curIdx = activeDeckIdxRef.current;
      const standbyIdx: 0 | 1 = curIdx === 0 ? 1 : 0;
      const standbySlot = deckSlotsRef.current[standbyIdx];
      const standbyDeck = decks[standbyIdx];

      if (
        matchesSlot(standbySlot, curReciter, surah, ayah) &&
        standbyDeck.src &&
        standbyDeck.error === null
      ) {
        decks[curIdx].pause();
        decks[curIdx].currentTime = 0;
        activeDeckIdxRef.current = standbyIdx;
        standbyDeck.currentTime = 0;
        standbyDeck.playbackRate = stateRef.current.playbackSpeed;
        const dur = Number.isFinite(standbyDeck.duration) ? standbyDeck.duration : 0;
        setDuration(dur);
        emitProgress(0, dur, true);
        setIsBuffering(standbyDeck.readyState < 3);

        try {
          if (autoplay) {
            await standbyDeck.play();
            if (playEpochRef.current !== epoch) return;
            loadedTrackRef.current = {surah, ayah, reciterId: curReciter.id};
            setIsPlaying(true);
          } else {
            loadedTrackRef.current = {surah, ayah, reciterId: curReciter.id};
            setIsPlaying(false);
          }
          setIsBuffering(false);
          void preloadUpcoming(surah, ayah);
          return;
        } catch (err) {
          if (playEpochRef.current !== epoch) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
        }
      }

      const activeDeck = decks[activeDeckIdxRef.current];
      const activeIdx = activeDeckIdxRef.current;
      activeDeck.pause();
      setIsBuffering(true);

      try {
        const resolved = await resolveAudioSource(curReciter, surah, ayah);
        if (playEpochRef.current !== epoch) {
          if (resolved.objectUrl) URL.revokeObjectURL(resolved.objectUrl);
          return;
        }

        releaseSlot(activeDeck, deckSlotsRef.current[activeIdx]);
        const nextSlot: DeckSlot = {
          reciterId: curReciter.id,
          mode: curReciter.mode,
          surah,
          ayah,
          candidates: resolved.candidates,
          candidateIdx: 0,
          objectUrl: resolved.objectUrl,
          ready: false,
        };
        deckSlotsRef.current[activeIdx] = nextSlot;
        activeDeck.preload = 'auto';
        activeDeck.src = resolved.candidates[0];
        activeDeck.playbackRate = stateRef.current.playbackSpeed;

        if (autoplay) {
          await activeDeck.play();
          if (playEpochRef.current !== epoch) return;
          loadedTrackRef.current = {surah, ayah, reciterId: curReciter.id};
          setIsPlaying(true);
        } else {
          loadedTrackRef.current = {surah, ayah, reciterId: curReciter.id};
          setIsPlaying(false);
        }
        setIsBuffering(false);
        void preloadUpcoming(surah, ayah);
      } catch (err) {
        if (playEpochRef.current !== epoch) return;
        setIsBuffering(false);
        setIsPlaying(false);
        stopAudioKeepAlive();
        syncActiveVerseDomHighlight(surah, ayah, false);
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAudioError(getPlaybackErrorMessage(stateRef.current.lang));
      }
    },
    [
      clearTalqeenTimer,
      emitProgress,
      ensureSurahTiming,
      notifyActiveVerseChange,
      preloadUpcoming,
      releaseSlot,
      resolveAudioSource,
    ]
  );

  // Initialize Dual-Deck HTML5 Audio Elements + 2-Verse Lookahead Buffer once
  useEffect(() => {
    const deck0 = new Audio();
    const deck1 = new Audio();
    const lookahead2 = new Audio();
    deck0.preload = 'auto';
    deck1.preload = 'auto';
    lookahead2.preload = 'auto';

    decksRef.current = [deck0, deck1];
    lookahead2Ref.current = lookahead2;
    activeDeckIdxRef.current = 0;

    const attachDeckListeners = (deckIdx: 0 | 1, audio: HTMLAudioElement) => {
      const handleTimeUpdate = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        const curSec = audio.currentTime || 0;
        const durSec = Number.isFinite(audio.duration) ? audio.duration : 0;
        const isBackground =
          typeof document !== 'undefined' && document.visibilityState === 'hidden';

        if (audio.paused || isBackground) {
          emitProgress(curSec, durSec, true);
        }
        if (durSec > 0 && !audio.paused) {
          syncMediaSessionPosition(durSec, curSec, stateRef.current.playbackSpeed);
        }

        const pending = pendingSurahSeekAyahRef.current;
        const {
          reciter: r,
          activeSurah: s,
          audioSyncOffsetSec: offsetSec,
        } = stateRef.current;

        if (pending && r.mode === 'surah' && pending.surah === s && durSec > 0) {
          const seekSegs = getVerifiedTimingSegments(r, s);
          if (seekSegs.length > 0) {
            const targetSeg = seekSegs.find((seg) => seg.ayah === pending.ayah);
            pendingSurahSeekAyahRef.current = null;
            if (targetSeg) {
              audio.currentTime = Math.min(
                Math.max(0, durSec - 0.5),
                targetSeg.startMs / 1000
              );
            }
          }
        } else if (isBackground && !audio.paused && r.mode === 'surah' && durSec > 0) {
          const segments = getVerifiedTimingSegments(r, s);
          if (segments.length > 0) {
            const matchedAyah = findAyahAtTimeMs(segments, curSec * 1000, offsetSec);
            if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
              stateRef.current.activeAyah = matchedAyah;
              loadedTrackRef.current = {
                surah: s,
                ayah: matchedAyah,
                reciterId: r.id,
              };
              setActiveAyah(matchedAyah);
              void notifyActiveVerseChange(s, matchedAyah);
            }
          }
        }
      };

      const handleEnded = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;

        const {
          activeSurah: s,
          activeAyah: a,
          loopMode: loop,
          sleepTimer: sleep,
          reciter: r,
          surahs: allSurahs,
          talqeen: tq,
          playbackSpeed: speed,
        } = stateRef.current;

        if (tq.enabled && r.mode === 'ayah') {
          const meta = allSurahs.find((item) => item.id === s);
          const maxSurahAyah = meta?.totalAyahs || a;
          const rangeStart = Math.max(1, Math.min(maxSurahAyah, tq.startAyah));
          const rangeEnd = Math.max(rangeStart, Math.min(maxSurahAyah, tq.endAyah));
          const nextAyahInRange = a >= rangeEnd || a < rangeStart ? rangeStart : a + 1;

          autoplayIntendedRef.current = false;
          setIsPlaying(false);
          let remaining = tq.pauseSeconds;
          clearTalqeenTimer();
          setTalqeenCountdown(remaining);

          talqeenTimerRef.current = window.setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              clearTalqeenTimer();
              void loadAndPlay(s, nextAyahInRange, true);
            } else {
              setTalqeenCountdown(remaining);
            }
          }, 1000);
          return;
        }

        const activeLoop = hifzLoopRef.current;
        if (
          activeLoop &&
          activeLoop.target !== 1 &&
          activeLoop.surah === s &&
          activeLoop.ayah === a &&
          r.mode === 'ayah'
        ) {
          const {shouldRepeat, nextState} = advanceAyahLoop(activeLoop);
          hifzLoopRef.current = nextState;
          setHifzRepeatDone(nextState.completedLoops);
          if (shouldRepeat) {
            audio.currentTime = 0;
            audio.playbackRate = speed;
            autoplayIntendedRef.current = true;
            void audio.play().catch(() => {
              void loadAndPlay(s, a, true);
            });
            return;
          }
          hifzLoopRef.current = null;
          setHifzRepeatDone(0);
          autoplayIntendedRef.current = false;
          stopAudioKeepAlive();
          setIsPlaying(false);
          emitProgress(0, Number.isFinite(audio.duration) ? audio.duration : 0, true);
          return;
        }

        if (loop === 'ayah' && r.mode === 'ayah') {
          audio.currentTime = 0;
          audio.playbackRate = speed;
          autoplayIntendedRef.current = true;
          void audio.play().catch(() => {
            void loadAndPlay(s, a, true);
          });
          return;
        }

        let nextTarget: {surah: number; ayah: number} | null = null;

        if (r.mode === 'surah') {
          if (loop === 'surah') {
            audio.currentTime = 0;
            audio.playbackRate = speed;
            autoplayIntendedRef.current = true;
            void audio.play().catch(() => {
              void loadAndPlay(s, 1, true);
            });
            return;
          }
          if (sleep === -1) {
            autoplayIntendedRef.current = false;
            setIsPlaying(false);
            setSleepTimer(0);
            return;
          }
          if (s < 114) {
            nextTarget = {surah: s + 1, ayah: 1};
          } else {
            autoplayIntendedRef.current = false;
            setIsPlaying(false);
            return;
          }
        } else {
          const next = getNextSurahAyah(s, a);
          if (!next) {
            if (loop === 'surah') {
              nextTarget = {surah: s, ayah: 1};
            } else {
              autoplayIntendedRef.current = false;
              setIsPlaying(false);
              return;
            }
          } else if (next.surah !== s) {
            if (loop === 'surah') {
              nextTarget = {surah: s, ayah: 1};
            } else if (sleep === -1) {
              autoplayIntendedRef.current = false;
              setIsPlaying(false);
              setSleepTimer(0);
              return;
            } else {
              nextTarget = next;
            }
          } else {
            nextTarget = next;
          }
        }

        if (!nextTarget) return;

        const decks = decksRef.current;
        const standbyIdx: 0 | 1 = deckIdx === 0 ? 1 : 0;
        const standbyAudio = decks?.[standbyIdx];
        const standbySlot = deckSlotsRef.current[standbyIdx];

        if (
          standbyAudio &&
          matchesSlot(standbySlot, r, nextTarget.surah, nextTarget.ayah) &&
          standbyAudio.src &&
          standbyAudio.error === null
        ) {
          activeDeckIdxRef.current = standbyIdx;
          autoplayIntendedRef.current = true;
          playEpochRef.current += 1;

          standbyAudio.playbackRate = speed;
          if (standbyAudio.currentTime > 0) {
            standbyAudio.currentTime = 0;
          }

          standbyAudio.play().catch((err) => {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            void loadAndPlay(nextTarget!.surah, nextTarget!.ayah, true);
          });

          if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
            try {
              navigator.mediaSession.playbackState = 'playing';
            } catch {
              // ignore WebView mediaSession quirk
            }
          }

          stateRef.current.activeSurah = nextTarget.surah;
          stateRef.current.activeAyah = nextTarget.ayah;
          loadedTrackRef.current = {
            surah: nextTarget.surah,
            ayah: nextTarget.ayah,
            reciterId: r.id,
          };
          setActiveSurah(nextTarget.surah);
          setActiveAyah(nextTarget.ayah);
          const dur = Number.isFinite(standbyAudio.duration) ? standbyAudio.duration : 0;
          setDuration(dur);
          emitProgress(0, dur, true);
          setIsPlaying(true);
          startAudioKeepAlive();
          setIsBuffering(standbyAudio.readyState < 3);

          void notifyActiveVerseChange(nextTarget.surah, nextTarget.ayah);

          if (r.mode === 'surah') {
            void ensureSurahTiming(r, nextTarget.surah, true);
          }

          void preloadUpcoming(nextTarget.surah, nextTarget.ayah);
          return;
        }

        void loadAndPlay(nextTarget.surah, nextTarget.ayah, true);
      };

      const handlePlay = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        startAudioKeepAlive();
        setIsPlaying(true);
      };

      const handlePause = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        if (audio.ended) return;
        stopAudioKeepAlive();
        setIsPlaying(false);
        const durSec = Number.isFinite(audio.duration) ? audio.duration : 0;
        emitProgress(audio.currentTime || 0, durSec, true);
      };

      const handleWaiting = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        setIsBuffering(true);
      };

      const handleCanPlay = () => {
        const slot = deckSlotsRef.current[deckIdx];
        if (slot) slot.ready = true;
        if (deckIdx !== activeDeckIdxRef.current) return;
        setIsBuffering(false);
        const durSec = Number.isFinite(audio.duration) ? audio.duration : 0;
        if (durSec > 0) {
          setDuration(durSec);
          emitProgress(audio.currentTime || 0, durSec, false);
        }
      };

      const handleError = () => {
        const slot = deckSlotsRef.current[deckIdx];
        if (slot && slot.candidateIdx + 1 < slot.candidates.length) {
          slot.candidateIdx += 1;
          slot.ready = false;
          audio.src = slot.candidates[slot.candidateIdx];
          if (deckIdx === activeDeckIdxRef.current && autoplayIntendedRef.current) {
            audio.playbackRate = stateRef.current.playbackSpeed;
            void audio.play().catch(() => {
              // Handled on subsequent error
            });
          } else {
            audio.load();
          }
          return;
        }

        if (deckIdx !== activeDeckIdxRef.current) return;
        stopAudioKeepAlive();
        setIsBuffering(false);
        setIsPlaying(false);
        setAudioError(getPlaybackErrorMessage(stateRef.current.lang));
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    };

    const handleLookahead2Error = () => {
      const slot = lookahead2SlotRef.current;
      if (slot && slot.candidateIdx + 1 < slot.candidates.length) {
        slot.candidateIdx += 1;
        lookahead2.src = slot.candidates[slot.candidateIdx];
        lookahead2.load();
      }
    };
    const handleLookahead2Ready = () => {
      if (lookahead2SlotRef.current) lookahead2SlotRef.current.ready = true;
    };

    const detach0 = attachDeckListeners(0, deck0);
    const detach1 = attachDeckListeners(1, deck1);
    lookahead2.addEventListener('error', handleLookahead2Error);
    lookahead2.addEventListener('canplaythrough', handleLookahead2Ready);

    return () => {
      clearTalqeenTimer();
      disposeAudioKeepAlive();
      void stopNativeMediaService();
      detach0();
      detach1();
      lookahead2.removeEventListener('error', handleLookahead2Error);
      lookahead2.removeEventListener('canplaythrough', handleLookahead2Ready);
      releaseSlot(deck0, deckSlotsRef.current[0]);
      releaseSlot(deck1, deckSlotsRef.current[1]);
      releaseSlot(lookahead2, lookahead2SlotRef.current);
      deckSlotsRef.current = [null, null];
      lookahead2SlotRef.current = null;
    };
  }, [
    clearTalqeenTimer,
    emitProgress,
    ensureSurahTiming,
    getVerifiedTimingSegments,
    loadAndPlay,
    notifyActiveVerseChange,
    preloadUpcoming,
    releaseSlot,
    syncMediaSessionPosition,
  ]);

  // 60fps zero-re-render pub-sub loop for waveform bar + DOM verse highlight (throttles React clock to ~2Hz)
  // Includes a 1s interval fallback when tab/screen is backgrounded so Surah verse sync & MediaSession stay current.
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;

    const runSyncFrame = () => {
      const audio = decksRef.current?.[activeDeckIdxRef.current];
      if (!audio || audio.paused) return;

      const curSec = audio.currentTime || 0;
      const durSec = Number.isFinite(audio.duration) ? audio.duration : 0;

      emitProgress(curSec, durSec, false);

      const {
        reciter: r,
        activeSurah: s,
        audioSyncOffsetSec: offsetSec,
        playbackSpeed: speed,
      } = stateRef.current;

      if (durSec > 0) {
        syncMediaSessionPosition(durSec, curSec, speed);
      }

      if (r.mode === 'surah' && durSec > 0) {
        const segments = getVerifiedTimingSegments(r, s);
        const pending = pendingSurahSeekAyahRef.current;
        if (pending && pending.surah === s && pending.ayah > 1 && segments.length > 0) {
          const targetSeg = segments.find((seg) => seg.ayah === pending.ayah);
          pendingSurahSeekAyahRef.current = null;
          if (targetSeg) {
            audio.currentTime = Math.min(
              Math.max(0, durSec - 0.5),
              targetSeg.startMs / 1000
            );
          }
        } else if (segments.length > 0) {
          const matchedAyah = findAyahAtTimeMs(segments, curSec * 1000, offsetSec);
          if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
            stateRef.current.activeAyah = matchedAyah;
            loadedTrackRef.current = {
              surah: s,
              ayah: matchedAyah,
              reciterId: r.id,
            };
            setActiveAyah(matchedAyah);
            void notifyActiveVerseChange(s, matchedAyah);
          }
        }
      }
    };

    const tick = () => {
      runSyncFrame();
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    const bgInterval = window.setInterval(() => {
      if (document.hidden) {
        runSyncFrame();
      }
    }, 1000);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearInterval(bgInterval);
    };
  }, [
    isPlaying,
    emitProgress,
    getVerifiedTimingSegments,
    notifyActiveVerseChange,
    syncMediaSessionPosition,
  ]);

  // Update playback speed immediately across active & standby decks
  useEffect(() => {
    const decks = decksRef.current;
    if (decks) {
      decks[0].playbackRate = playbackSpeed;
      decks[1].playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Reload current verse/surah & clear stale standby buffers when switching reciter
  const prevReciterIdRef = useRef(reciter.id);
  useEffect(() => {
    if (prevReciterIdRef.current !== reciter.id) {
      prevReciterIdRef.current = reciter.id;
      const decks = decksRef.current;
      const lookahead2 = lookahead2Ref.current;
      if (decks) {
        const standbyIdx: 0 | 1 = activeDeckIdxRef.current === 0 ? 1 : 0;
        releaseSlot(decks[standbyIdx], deckSlotsRef.current[standbyIdx]);
        deckSlotsRef.current[standbyIdx] = null;
      }
      if (lookahead2) {
        releaseSlot(lookahead2, lookahead2SlotRef.current);
        lookahead2SlotRef.current = null;
      }
      if (hasStarted) {
        void loadAndPlay(activeSurah, activeAyah, isPlaying);
      }
    }
  }, [
    reciter.id,
    hasStarted,
    activeSurah,
    activeAyah,
    isPlaying,
    loadAndPlay,
    releaseSlot,
  ]);

  // Countdown sleep timer
  useEffect(() => {
    if (sleepTimer <= 0) {
      setSleepSecondsLeft(0);
      return;
    }
    setSleepSecondsLeft(sleepTimer * 60);
    const id = window.setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev <= 1) {
          const decks = decksRef.current;
          decks?.[activeDeckIdxRef.current]?.pause();
          stopAudioKeepAlive();
          autoplayIntendedRef.current = false;
          setIsPlaying(false);
          setSleepTimer(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [sleepTimer]);

  const togglePlayPause = useCallback(async () => {
    const decks = decksRef.current;
    if (!decks) return;
    const activeDeck = decks[activeDeckIdxRef.current];

    if (talqeenCountdown !== null) {
      clearTalqeenTimer();
      stopAudioKeepAlive();
      autoplayIntendedRef.current = false;
      setIsPlaying(false);
      return;
    }

    const targetSurah = stateRef.current.activeSurah;
    const targetAyah = stateRef.current.talqeen.enabled
      ? stateRef.current.talqeen.startAyah
      : stateRef.current.activeAyah;
    const loaded = loadedTrackRef.current;
    const matchesCurrentContext =
      loaded !== null &&
      loaded.surah === targetSurah &&
      loaded.ayah === targetAyah &&
      loaded.reciterId === stateRef.current.reciter.id &&
      Boolean(activeDeck.src);

    if (!hasStarted || !activeDeck.src || (activeDeck.paused && !matchesCurrentContext)) {
      await loadAndPlay(targetSurah, targetAyah, true);
      return;
    }

    if (activeDeck.paused) {
      startAudioKeepAlive();
      autoplayIntendedRef.current = true;
      try {
        await activeDeck.play();
        void preloadUpcoming(targetSurah, targetAyah);
      } catch {
        await loadAndPlay(targetSurah, targetAyah, true);
      }
    } else {
      autoplayIntendedRef.current = false;
      stopAudioKeepAlive();
      activeDeck.pause();
    }
  }, [
    hasStarted,
    loadAndPlay,
    preloadUpcoming,
    talqeenCountdown,
    clearTalqeenTimer,
  ]);

  const playNext = useCallback(() => {
    clearTalqeenTimer();
    if (reciter.mode === 'surah') {
      if (activeSurah < 114) {
        void loadAndPlay(activeSurah + 1, 1, true);
      }
      return;
    }
    const next = getNextSurahAyah(activeSurah, activeAyah);
    if (next) void loadAndPlay(next.surah, next.ayah, true);
  }, [reciter.mode, activeSurah, activeAyah, loadAndPlay, clearTalqeenTimer]);

  const playPrev = useCallback(() => {
    clearTalqeenTimer();
    if (reciter.mode === 'surah') {
      if (activeSurah > 1) {
        void loadAndPlay(activeSurah - 1, 1, true);
      }
      return;
    }
    const prev = getPrevSurahAyah(activeSurah, activeAyah);
    if (prev) void loadAndPlay(prev.surah, prev.ayah, true);
  }, [reciter.mode, activeSurah, activeAyah, loadAndPlay, clearTalqeenTimer]);

  const seekTo = useCallback(
    (seconds: number) => {
      const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
      if (activeDeck && Number.isFinite(seconds)) {
        const durSec = Number.isFinite(activeDeck.duration) ? activeDeck.duration : 0;
        const clamped = durSec > 0 ? Math.max(0, Math.min(durSec, seconds)) : Math.max(0, seconds);
        activeDeck.currentTime = clamped;
        emitProgress(clamped, durSec, true);
        if (durSec > 0) {
          syncMediaSessionPosition(durSec, clamped, stateRef.current.playbackSpeed, true);
        }

        const {
          reciter: r,
          activeSurah: s,
          audioSyncOffsetSec: offsetSec,
        } = stateRef.current;
        if (r.mode === 'surah') {
          const segments = getVerifiedTimingSegments(r, s);
          if (segments.length > 0) {
            const matchedAyah = findAyahAtTimeMs(segments, clamped * 1000, offsetSec);
            if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
              stateRef.current.activeAyah = matchedAyah;
              setActiveAyah(matchedAyah);
              void notifyActiveVerseChange(s, matchedAyah);
            }
          }
        }
      }
    },
    [emitProgress, getVerifiedTimingSegments, notifyActiveVerseChange, syncMediaSessionPosition]
  );

  const cycleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === 'none') return 'ayah';
      if (prev === 'ayah') return 'surah';
      return 'none';
    });
  }, []);

  const updateTalqeen = useCallback(
    (patch: Partial<TalqeenConfig>) => {
      setTalqeen((prev) => {
        const next = {...prev, ...patch};
        if (next.endAyah < next.startAyah) next.endAyah = next.startAyah;
        if (!next.enabled) {
          clearTalqeenTimer();
        }
        return next;
      });
    },
    [clearTalqeenTimer]
  );

  const skipTalqeenPause = useCallback(() => {
    if (talqeenCountdown === null) return;
    clearTalqeenTimer();
    const {activeSurah: s, activeAyah: a, talqeen: tq, surahs: allSurahs} =
      stateRef.current;
    const meta = allSurahs.find((item) => item.id === s);
    const maxSurahAyah = meta?.totalAyahs || a;
    const rangeStart = Math.max(1, Math.min(maxSurahAyah, tq.startAyah));
    const rangeEnd = Math.max(rangeStart, Math.min(maxSurahAyah, tq.endAyah));
    const nextAyahInRange = a >= rangeEnd || a < rangeStart ? rangeStart : a + 1;
    void loadAndPlay(s, nextAyahInRange, true);
  }, [talqeenCountdown, clearTalqeenTimer, loadAndPlay]);

  const startTalqeenSession = useCallback(
    (surah: number, startAyah: number, endAyah: number, pauseSeconds: 3 | 5 | 8 = 5) => {
      setTalqeen({
        enabled: true,
        startAyah,
        endAyah: Math.max(startAyah, endAyah),
        pauseSeconds,
      });
      void loadAndPlay(surah, startAyah, true);
    },
    [loadAndPlay]
  );

  // Sync Media Session metadata & playback state for Android lock screen / notification controls
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!hasStarted && !isPlaying) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {
        // ignore unsupported browser
      }
      return;
    }

    const surahMeta = surahs.find((s) => s.id === activeSurah);
    const payload = buildMediaSessionMetadataPayload({
      surah: activeSurah,
      ayah: activeAyah,
      surahMeta,
      reciter,
      lang,
    });

    try {
      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: payload.title,
          artist: payload.artist,
          album: payload.album,
          artwork: payload.artwork,
        });
      }
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // Ignore MediaMetadata errors on partial WebViews
    }

    const activeAudio = decksRef.current?.[activeDeckIdxRef.current];
    if (activeAudio && Number.isFinite(activeAudio.duration) && activeAudio.duration > 0) {
      syncMediaSessionPosition(
        activeAudio.duration,
        activeAudio.currentTime || 0,
        playbackSpeed,
        true
      );
    }

    if (isPlaying) {
      const surahLabel =
        lang === 'ar'
          ? surahMeta?.nameAr || `سورة ${activeSurah}`
          : surahMeta?.nameEn || `Surah ${activeSurah}`;
      const reciterLabel = lang === 'ar' ? reciter.nameAr : reciter.nameEn;
      const nativeMeta = buildMediaNotificationMetadata(
        surahLabel,
        activeSurah,
        activeAyah,
        reciterLabel,
        lang
      );
      void startOrUpdateNativeMediaService({
        title: nativeMeta.title,
        body: nativeMeta.body,
        isPlaying: true,
        surah: activeSurah,
        ayah: activeAyah,
      });
    } else if (!hasStarted) {
      void stopNativeMediaService();
    } else {
      const surahLabel =
        lang === 'ar'
          ? surahMeta?.nameAr || `سورة ${activeSurah}`
          : surahMeta?.nameEn || `Surah ${activeSurah}`;
      const reciterLabel = lang === 'ar' ? reciter.nameAr : reciter.nameEn;
      const nativeMeta = buildMediaNotificationMetadata(
        surahLabel,
        activeSurah,
        activeAyah,
        reciterLabel,
        lang
      );
      void startOrUpdateNativeMediaService({
        title: nativeMeta.title,
        body: nativeMeta.body,
        isPlaying: false,
        surah: activeSurah,
        ayah: activeAyah,
      });
    }
  }, [
    hasStarted,
    isPlaying,
    activeSurah,
    activeAyah,
    reciter,
    surahs,
    lang,
    playbackSpeed,
    syncMediaSessionPosition,
  ]);

  // Wire lock-screen & notification bar action handlers
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    if (typeof ms.setActionHandler !== 'function') return;

    const safeSetHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Action may be unsupported on older Android WebViews
      }
    };

    safeSetHandler('play', () => {
      const decks = decksRef.current;
      const activeDeck = decks?.[activeDeckIdxRef.current];
      const {
        activeSurah: s,
        activeAyah: a,
        hasStarted: started,
        reciter: r,
      } = stateRef.current;
      const loaded = loadedTrackRef.current;
      const matchesContext =
        loaded !== null &&
        loaded.surah === s &&
        loaded.ayah === a &&
        loaded.reciterId === r.id &&
        Boolean(activeDeck?.src);

      if (!activeDeck || !started || !activeDeck.src || !matchesContext) {
        void loadAndPlay(s, a, true);
        return;
      }
      startAudioKeepAlive();
      autoplayIntendedRef.current = true;
      void activeDeck
        .play()
        .then(() => {
          setIsPlaying(true);
          void preloadUpcoming(s, a);
        })
        .catch(() => {
          void loadAndPlay(s, a, true);
        });
    });

    safeSetHandler('pause', () => {
      clearTalqeenTimer();
      stopAudioKeepAlive();
      autoplayIntendedRef.current = false;
      const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
      activeDeck?.pause();
      setIsPlaying(false);
    });

    safeSetHandler('previoustrack', () => {
      playPrev();
    });

    safeSetHandler('nexttrack', () => {
      playNext();
    });

    safeSetHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number' && Number.isFinite(details.seekTime)) {
        seekTo(details.seekTime);
      }
    });

    safeSetHandler('stop', () => {
      clearTalqeenTimer();
      stopAudioKeepAlive();
      autoplayIntendedRef.current = false;
      const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
      if (activeDeck) {
        activeDeck.pause();
        activeDeck.currentTime = 0;
      }
      setIsPlaying(false);
      emitProgress(0, 0, true);
      try {
        ms.playbackState = 'none';
      } catch {
        // ignore
      }
    });

    let unsubscribeNative: (() => void) | null = null;
    void subscribeNativeMediaActions((action) => {
      if (action === 'play') {
        const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
        const {activeSurah: s, activeAyah: a, hasStarted: started} = stateRef.current;
        if (!activeDeck || !started || !activeDeck.src) {
          void loadAndPlay(s, a, true);
          return;
        }
        startAudioKeepAlive();
        autoplayIntendedRef.current = true;
        void activeDeck.play().then(() => setIsPlaying(true)).catch(() => {
          void loadAndPlay(s, a, true);
        });
      } else if (action === 'pause') {
        clearTalqeenTimer();
        stopAudioKeepAlive();
        autoplayIntendedRef.current = false;
        decksRef.current?.[activeDeckIdxRef.current]?.pause();
        setIsPlaying(false);
      } else if (action === 'next') {
        playNext();
      } else if (action === 'previous') {
        playPrev();
      } else if (action === 'stop') {
        clearTalqeenTimer();
        stopAudioKeepAlive();
        autoplayIntendedRef.current = false;
        const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
        if (activeDeck) {
          activeDeck.pause();
          activeDeck.currentTime = 0;
        }
        setIsPlaying(false);
        emitProgress(0, 0, true);
        void stopNativeMediaService();
      }
    }).then((unsub) => {
      unsubscribeNative = unsub;
    });

    return () => {
      unsubscribeNative?.();
      safeSetHandler('play', null);
      safeSetHandler('pause', null);
      safeSetHandler('previoustrack', null);
      safeSetHandler('nexttrack', null);
      safeSetHandler('seekto', null);
      safeSetHandler('stop', null);
    };
  }, [
    clearTalqeenTimer,
    emitProgress,
    loadAndPlay,
    playNext,
    playPrev,
    preloadUpcoming,
    seekTo,
  ]);

  const setHifzRepeatTarget = useCallback((repeat: HifzRepeatCount) => {
    setHifzRepeatTargetState(repeat);
    setHifzRepeatDone(0);
    if (repeat === 1) {
      hifzLoopRef.current = null;
    } else if (hifzLoopRef.current) {
      hifzLoopRef.current = createAyahLoopState(
        hifzLoopRef.current.surah,
        hifzLoopRef.current.ayah,
        repeat
      );
    }
  }, []);

  const playVerse = useCallback(
    (surah: number, ayah: number) => {
      hifzLoopRef.current = null;
      setHifzRepeatDone(0);
      return loadAndPlay(surah, ayah, true);
    },
    [loadAndPlay]
  );

  const playVerseWithRepeat = useCallback(
    (surah: number, ayah: number, repeat?: HifzRepeatCount) => {
      const effectiveTarget = repeat ?? stateRef.current.hifzRepeatTarget;
      setHifzRepeatTargetState(effectiveTarget);
      setHifzRepeatDone(0);
      if (effectiveTarget !== 1) {
        hifzLoopRef.current = createAyahLoopState(surah, ayah, effectiveTarget);
        if (stateRef.current.reciter.mode !== 'ayah' && onFallbackReciter) {
          onFallbackReciter(getFallbackAyahReciterId(stateRef.current.reciter.riwayat));
        }
      } else {
        hifzLoopRef.current = null;
      }
      return loadAndPlay(surah, ayah, true);
    },
    [loadAndPlay, onFallbackReciter]
  );

  return {
    activeSurah,
    activeAyah,
    isPlaying,
    isBuffering,
    audioError,
    hasStarted,
    loopMode,
    sleepTimer,
    sleepSecondsLeft,
    currentTime,
    duration,
    talqeen,
    talqeenCountdown,
    hifzRepeatTarget,
    hifzRepeatDone,
    subscribeProgress,
    playVerse,
    playVerseWithRepeat,
    setHifzRepeatTarget,
    togglePlayPause,
    playNext,
    playPrev,
    seekTo,
    cycleLoopMode,
    setSleepTimer,
    updateTalqeen,
    skipTalqeenPause,
    startTalqeenSession,
  };
}
