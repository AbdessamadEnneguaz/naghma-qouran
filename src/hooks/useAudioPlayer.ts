import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  LoopMode,
  QuranVerse,
  Reciter,
  SurahMeta,
  TalqeenConfig,
} from '../types/quran';
import {
  getAyahAudioCandidates,
  getGlobalAyahNumber,
  getNextAyah,
  getPrevAyah,
  getUpcomingAyahs,
  getUpcomingSurahs,
} from '../utils/quranLogic';
import {findAyahAtTimeMs, type AyahTimingSegment} from '../utils/surahTimingLogic';
import {getCachedSurahTimingSync, getSurahAyatTiming} from '../services/surahTimingService';
import {getCachedAudioBlob} from '../services/indexedDbVault';
import {
  buildMediaSessionMetadataPayload,
  computeSafePositionState,
} from '../utils/mediaSessionLogic';
import type {AppLang} from '../i18n/translations';

export type SleepTimerOption = 0 | 15 | 30 | 45 | 60 | -1; // -1 = end of surah

interface UseAudioPlayerArgs {
  verses: QuranVerse[];
  surahs: SurahMeta[];
  reciter: Reciter;
  playbackSpeed: number;
  audioSyncOffsetSec?: number;
  lang?: AppLang;
  onActiveVerseChange?: (verse: QuranVerse) => void;
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
  onActiveVerseChange,
}: UseAudioPlayerArgs) {
  const decksRef = useRef<[HTMLAudioElement, HTMLAudioElement] | null>(null);
  const lookahead2Ref = useRef<HTMLAudioElement | null>(null);
  const activeDeckIdxRef = useRef<0 | 1>(0);
  const deckSlotsRef = useRef<[DeckSlot | null, DeckSlot | null]>([null, null]);
  const lookahead2SlotRef = useRef<DeckSlot | null>(null);

  const exactTimingCacheRef = useRef<Map<string, AyahTimingSegment[] | null>>(new Map());
  const pendingSurahSeekAyahRef = useRef<{surah: number; ayah: number} | null>(null);

  const playEpochRef = useRef<number>(0);
  const preloadEpochRef = useRef<number>(0);
  const autoplayIntendedRef = useRef<boolean>(false);
  const talqeenTimerRef = useRef<number | null>(null);
  const lastPositionSyncMsRef = useRef<number>(0);

  const [activeSurah, setActiveSurah] = useState<number>(1);
  const [activeAyah, setActiveAyah] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [sleepTimer, setSleepTimer] = useState<SleepTimerOption>(0);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Talqeen (Listen & Repeat) Memorization Mode
  const [talqeen, setTalqeen] = useState<TalqeenConfig>({
    enabled: false,
    startAyah: 1,
    endAyah: 7,
    pauseSeconds: 5,
  });
  const [talqeenCountdown, setTalqeenCountdown] = useState<number | null>(null);

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
  };

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
    async (targetReciter: Reciter, surah: number) => {
      if (targetReciter.mode !== 'surah') return;
      const key = `${targetReciter.id}:${surah}`;
      const existing = exactTimingCacheRef.current.get(key);
      if (existing && existing.length > 0) return;

      const surahVerses = stateRef.current.verses.filter((v) => v.surah === surah);
      const segments = await getSurahAyatTiming(targetReciter, surah, surahVerses);
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

      // Apply pending "Play from here" ayah seek if audio duration is ready
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

      // Immediately sync active highlight to verified timestamp
      if (!activeAudio.paused) {
        const matchedAyah = findAyahAtTimeMs(
          segments,
          activeAudio.currentTime * 1000,
          stateRef.current.audioSyncOffsetSec
        );
        if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
          stateRef.current.activeAyah = matchedAyah;
          setActiveAyah(matchedAyah);
          const v = stateRef.current.verses.find(
            (item) => item.surah === surah && item.ayah === matchedAyah
          );
          if (v && onActiveVerseChange) onActiveVerseChange(v);
        }
      }
    },
    [onActiveVerseChange]
  );

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
      epoch: number,
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
   * Lookahead buffer: whenever a verse (or Surah in Surah mode) starts playing,
   * immediately preload the next 2 verses (N+1 into the Standby Deck, N+2 into Lookahead2)
   * with preload="auto" so streams are buffered in memory before transition.
   */
  const preloadUpcoming = useCallback(
    async (curSurah: number, curAyah: number) => {
      const decks = decksRef.current;
      const lookahead2 = lookahead2Ref.current;
      if (!decks || !lookahead2) return;

      const epoch = ++preloadEpochRef.current;
      const isCurrent = () => preloadEpochRef.current === epoch;
      const {reciter: curReciter, verses: allVerses} = stateRef.current;

      const targets: Array<{surah: number; ayah: number}> =
        curReciter.mode === 'ayah'
          ? getUpcomingAyahs(allVerses, curSurah, curAyah, 2).map((v) => ({
              surah: v.surah,
              ayah: v.ayah,
            }))
          : getUpcomingSurahs(curSurah, 2).map((s) => ({surah: s, ayah: 1}));

      const standbyIdx: 0 | 1 = activeDeckIdxRef.current === 0 ? 1 : 0;
      const standbyAudio = decks[standbyIdx];

      // Preload N+1 into Standby Deck
      if (targets[0]) {
        const t1 = targets[0];
        const currentStandby = deckSlotsRef.current[standbyIdx];
        if (!matchesSlot(currentStandby, curReciter, t1.surah, t1.ayah)) {
          // Promote lookahead2 directly if it already holds N+1!
          const l2 = lookahead2SlotRef.current;
          if (matchesSlot(l2, curReciter, t1.surah, t1.ayah) && l2) {
            releaseSlot(standbyAudio, currentStandby);
            const promotedSlot: DeckSlot = {
              ...l2,
              ready: false,
            };
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

      // Preload N+2 into Lookahead2 background buffer
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
        void ensureSurahTiming(curReciter, surah);
      }

      setActiveSurah(surah);
      setActiveAyah(ayah);
      stateRef.current.activeSurah = surah;
      stateRef.current.activeAyah = ayah;
      setHasStarted(true);
      setAudioError(null);
      setCurrentTime(0);
      setDuration(0);

      const foundVerse = stateRef.current.verses.find(
        (v) => v.surah === surah && v.ayah === ayah
      );
      if (foundVerse && onActiveVerseChange) {
        onActiveVerseChange(foundVerse);
      }

      // Check if Standby Deck already holds this exact verse pre-buffered!
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
        setDuration(Number.isFinite(standbyDeck.duration) ? standbyDeck.duration : 0);
        setIsBuffering(standbyDeck.readyState < 3);

        try {
          if (autoplay) {
            await standbyDeck.play();
            if (playEpochRef.current !== epoch) return;
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
          setIsBuffering(false);
          void preloadUpcoming(surah, ayah);
          return;
        } catch (err) {
          if (playEpochRef.current !== epoch) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // Fall through to full load on error
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
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
        setIsBuffering(false);
        void preloadUpcoming(surah, ayah);
      } catch (err) {
        if (playEpochRef.current !== epoch) return;
        setIsBuffering(false);
        setIsPlaying(false);
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAudioError(
          'Audio unavailable offline for this verse. Download Surah for offline playback.'
        );
      }
    },
    [clearTalqeenTimer, onActiveVerseChange, preloadUpcoming, releaseSlot, resolveAudioSource]
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
        const isBackground =
          typeof document !== 'undefined' && document.visibilityState === 'hidden';
        // While visible & playing, the 60fps requestAnimationFrame loop drives currentTime;
        // while paused or backgrounded (rAF throttled when screen is off), timeupdate keeps UI & lock-screen state synced.
        if (audio.paused || isBackground) {
          setCurrentTime(curSec);
        }
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
          if (!audio.paused) {
            syncMediaSessionPosition(audio.duration, curSec, stateRef.current.playbackSpeed);
          }
        }
        const pending = pendingSurahSeekAyahRef.current;
        const {
          reciter: r,
          activeSurah: s,
          verses: allVerses,
          audioSyncOffsetSec: offsetSec,
        } = stateRef.current;
        if (pending && r.mode === 'surah' && pending.surah === s && audio.duration > 0) {
          const seekSegs = getVerifiedTimingSegments(r, s);
          if (seekSegs.length > 0) {
            const targetSeg = seekSegs.find((seg) => seg.ayah === pending.ayah);
            pendingSurahSeekAyahRef.current = null;
            if (targetSeg) {
              audio.currentTime = Math.min(
                Math.max(0, audio.duration - 0.5),
                targetSeg.startMs / 1000
              );
            }
          }
        } else if (isBackground && !audio.paused && r.mode === 'surah' && audio.duration > 0) {
          const segments = getVerifiedTimingSegments(r, s);
          if (segments.length > 0) {
            const matchedAyah = findAyahAtTimeMs(segments, curSec * 1000, offsetSec);
            if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
              stateRef.current.activeAyah = matchedAyah;
              setActiveAyah(matchedAyah);
              const v = allVerses.find(
                (item) => item.surah === s && item.ayah === matchedAyah
              );
              if (v && onActiveVerseChange) onActiveVerseChange(v);
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
          verses: allVerses,
          surahs: allSurahs,
          talqeen: tq,
          playbackSpeed: speed,
        } = stateRef.current;

        // 1. Talqeen Mode: pause (3s / 5s / 8s) for user to repeat aloud, then loop range
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

        // 2. Repeat single Ayah immediately on the active deck (zero gap)
        if (loop === 'ayah' && r.mode === 'ayah') {
          audio.currentTime = 0;
          audio.playbackRate = speed;
          autoplayIntendedRef.current = true;
          void audio.play().catch(() => {
            void loadAndPlay(s, a, true);
          });
          return;
        }

        // 3. Determine next target (Ayah or Surah)
        let nextTarget: {surah: number; ayah: number; verse?: QuranVerse} | null = null;

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
            const firstVerse = allVerses.find((v) => v.surah === s + 1 && v.ayah === 1);
            nextTarget = {surah: s + 1, ayah: 1, verse: firstVerse};
          } else {
            autoplayIntendedRef.current = false;
            setIsPlaying(false);
            return;
          }
        } else {
          const next = getNextAyah(allVerses, s, a);
          if (!next) {
            if (loop === 'surah') {
              const firstVerse = allVerses.find((v) => v.surah === s && v.ayah === 1);
              nextTarget = {surah: s, ayah: 1, verse: firstVerse};
            } else {
              autoplayIntendedRef.current = false;
              setIsPlaying(false);
              return;
            }
          } else if (next.surah !== s) {
            if (loop === 'surah') {
              const firstVerse = allVerses.find((v) => v.surah === s && v.ayah === 1);
              nextTarget = {surah: s, ayah: 1, verse: firstVerse};
            } else if (sleep === -1) {
              autoplayIntendedRef.current = false;
              setIsPlaying(false);
              setSleepTimer(0);
              return;
            } else {
              nextTarget = {surah: next.surah, ayah: next.ayah, verse: next};
            }
          } else {
            nextTarget = {surah: next.surah, ayah: next.ayah, verse: next};
          }
        }

        if (!nextTarget) return;

        // 4. Synchronous Dual-Deck Zero-Gap Handoff to pre-buffered Standby Deck
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

          // Start audio playback immediately, then synchronize state in the same tick (0ms drift)
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
          setActiveSurah(nextTarget.surah);
          setActiveAyah(nextTarget.ayah);
          setCurrentTime(0);
          setDuration(
            Number.isFinite(standbyAudio.duration) ? standbyAudio.duration : 0
          );
          setIsPlaying(true);
          setIsBuffering(standbyAudio.readyState < 3);

          if (nextTarget.verse && onActiveVerseChange) {
            onActiveVerseChange(nextTarget.verse);
          }

          if (r.mode === 'surah') {
            void ensureSurahTiming(r, nextTarget.surah);
          }

          // Immediately warm the newly freed deck with N+2 & lookahead with N+3
          void preloadUpcoming(nextTarget.surah, nextTarget.ayah);
          return;
        }

        // Fallback when standby wasn't pre-populated (e.g. Repeat Surah jump to 1)
        void loadAndPlay(nextTarget.surah, nextTarget.ayah, true);
      };

      const handlePlay = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        setIsPlaying(true);
      };

      const handlePause = () => {
        if (deckIdx !== activeDeckIdxRef.current) return;
        // Ignore transient pause fired by ended event right before deck swap
        if (audio.ended) return;
        setIsPlaying(false);
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
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      };

      const handleError = () => {
        const slot = deckSlotsRef.current[deckIdx];
        // Silently retry fallback CDN candidates if available
        if (slot && slot.candidateIdx + 1 < slot.candidates.length) {
          slot.candidateIdx += 1;
          slot.ready = false;
          audio.src = slot.candidates[slot.candidateIdx];
          if (deckIdx === activeDeckIdxRef.current && autoplayIntendedRef.current) {
            audio.playbackRate = stateRef.current.playbackSpeed;
            void audio.play().catch(() => {
              // Handled on subsequent error if all candidates fail
            });
          } else {
            audio.load();
          }
          return;
        }

        if (deckIdx !== activeDeckIdxRef.current) return;
        setIsBuffering(false);
        setIsPlaying(false);
        setAudioError(
          'Unable to stream audio. Check connection or use a downloaded Surah.'
        );
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
    ensureSurahTiming,
    getVerifiedTimingSegments,
    loadAndPlay,
    onActiveVerseChange,
    preloadUpcoming,
    releaseSlot,
    syncMediaSessionPosition,
  ]);

  // High-frequency 60fps requestAnimationFrame clock loop for zero-lag verse sync
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;

    const tick = () => {
      const audio = decksRef.current?.[activeDeckIdxRef.current];
      if (audio && !audio.paused) {
        const curSec = audio.currentTime || 0;
        setCurrentTime(curSec);
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }

        const {
          reciter: r,
          activeSurah: s,
          verses: allVerses,
          audioSyncOffsetSec: offsetSec,
          playbackSpeed: speed,
        } = stateRef.current;

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          syncMediaSessionPosition(audio.duration, curSec, speed);
        }

        if (r.mode === 'surah' && audio.duration > 0) {
          const segments = getVerifiedTimingSegments(r, s);
          const pending = pendingSurahSeekAyahRef.current;
          if (pending && pending.surah === s && pending.ayah > 1 && segments.length > 0) {
            const targetSeg = segments.find((seg) => seg.ayah === pending.ayah);
            pendingSurahSeekAyahRef.current = null;
            if (targetSeg) {
              audio.currentTime = Math.min(
                Math.max(0, audio.duration - 0.5),
                targetSeg.startMs / 1000
              );
            }
          } else if (segments.length > 0) {
            const matchedAyah = findAyahAtTimeMs(segments, curSec * 1000, offsetSec);
            if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
              stateRef.current.activeAyah = matchedAyah;
              setActiveAyah(matchedAyah);
              const v = allVerses.find(
                (item) => item.surah === s && item.ayah === matchedAyah
              );
              if (v && onActiveVerseChange) onActiveVerseChange(v);
            }
          }
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, getVerifiedTimingSegments, onActiveVerseChange, syncMediaSessionPosition]);

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
      autoplayIntendedRef.current = false;
      setIsPlaying(false);
      return;
    }
    if (!hasStarted || !activeDeck.src) {
      const start = stateRef.current.talqeen.enabled
        ? stateRef.current.talqeen.startAyah
        : activeAyah;
      await loadAndPlay(activeSurah, start, true);
      return;
    }
    if (activeDeck.paused) {
      autoplayIntendedRef.current = true;
      try {
        await activeDeck.play();
        void preloadUpcoming(activeSurah, activeAyah);
      } catch {
        await loadAndPlay(activeSurah, activeAyah, true);
      }
    } else {
      autoplayIntendedRef.current = false;
      activeDeck.pause();
    }
  }, [
    activeSurah,
    activeAyah,
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
    const next = getNextAyah(verses, activeSurah, activeAyah);
    if (next) void loadAndPlay(next.surah, next.ayah, true);
  }, [reciter.mode, verses, activeSurah, activeAyah, loadAndPlay, clearTalqeenTimer]);

  const playPrev = useCallback(() => {
    clearTalqeenTimer();
    if (reciter.mode === 'surah') {
      if (activeSurah > 1) {
        void loadAndPlay(activeSurah - 1, 1, true);
      }
      return;
    }
    const prev = getPrevAyah(verses, activeSurah, activeAyah);
    if (prev) void loadAndPlay(prev.surah, prev.ayah, true);
  }, [reciter.mode, verses, activeSurah, activeAyah, loadAndPlay, clearTalqeenTimer]);

  const seekTo = useCallback(
    (seconds: number) => {
      const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
      if (activeDeck && Number.isFinite(seconds)) {
        activeDeck.currentTime = seconds;
        setCurrentTime(seconds);
        if (Number.isFinite(activeDeck.duration) && activeDeck.duration > 0) {
          syncMediaSessionPosition(
            activeDeck.duration,
            seconds,
            stateRef.current.playbackSpeed,
            true
          );
        }

        const {
          reciter: r,
          activeSurah: s,
          verses: allVerses,
          audioSyncOffsetSec: offsetSec,
        } = stateRef.current;
        if (r.mode === 'surah') {
          const segments = getVerifiedTimingSegments(r, s);
          if (segments.length > 0) {
            const matchedAyah = findAyahAtTimeMs(segments, seconds * 1000, offsetSec);
            if (matchedAyah !== null && matchedAyah !== stateRef.current.activeAyah) {
              stateRef.current.activeAyah = matchedAyah;
              setActiveAyah(matchedAyah);
              const v = allVerses.find(
                (item) => item.surah === s && item.ayah === matchedAyah
              );
              if (v && onActiveVerseChange) onActiveVerseChange(v);
            }
          }
        }
      }
    },
    [getVerifiedTimingSegments, onActiveVerseChange, syncMediaSessionPosition]
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

  // Wire lock-screen & notification bar action handlers (play, pause, prev, next, seekto, stop)
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
      const {activeSurah: s, activeAyah: a, hasStarted: started} = stateRef.current;
      if (!activeDeck || !started || !activeDeck.src) {
        void loadAndPlay(s, a, true);
        return;
      }
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
      autoplayIntendedRef.current = false;
      const activeDeck = decksRef.current?.[activeDeckIdxRef.current];
      if (activeDeck) {
        activeDeck.pause();
        activeDeck.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      try {
        ms.playbackState = 'none';
      } catch {
        // ignore
      }
    });

    return () => {
      safeSetHandler('play', null);
      safeSetHandler('pause', null);
      safeSetHandler('previoustrack', null);
      safeSetHandler('nexttrack', null);
      safeSetHandler('seekto', null);
      safeSetHandler('stop', null);
    };
  }, [clearTalqeenTimer, loadAndPlay, playNext, playPrev, preloadUpcoming, seekTo]);

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
    playVerse: (surah: number, ayah: number) => loadAndPlay(surah, ayah, true),
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
