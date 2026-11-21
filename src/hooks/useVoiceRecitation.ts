import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  evaluateSpokenWords,
  type PageWordTarget,
} from '../utils/quranLogic';
import type {Translations} from '../i18n/translations';

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: {transcript: string};
    };
  };
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

interface UseVoiceRecitationOptions {
  pageWords: PageWordTarget[];
  pageKey: string; // changes when page/surah changes
  t: Translations;
}

export function useVoiceRecitation({
  pageWords,
  pageKey,
  t,
}: UseVoiceRecitationOptions) {
  const isSupported = useMemo(() => !!getSpeechRecognitionCtor(), []);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [matchedWordKeys, setMatchedWordKeys] = useState<Set<string>>(() => new Set());
  const [missedWordKeys, setMissedWordKeys] = useState<Set<string>>(() => new Set());
  const [mistakePulseKey, setMistakePulseKey] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const cursorRef = useRef(0);
  const processedInterimTokensRef = useRef(0);
  const pageWordsRef = useRef(pageWords);
  pageWordsRef.current = pageWords;

  const resetProgress = useCallback(() => {
    cursorRef.current = 0;
    processedInterimTokensRef.current = 0;
    setMatchedWordKeys(new Set());
    setMissedWordKeys(new Set());
    setMistakePulseKey(null);
    setInterimText('');
  }, []);

  // Reset recitation cursor cleanly whenever page or surah changes
  useEffect(() => {
    resetProgress();
  }, [pageKey, resetProgress]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setIsListening(false);
    setInterimText('');
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore stop errors
    }
    recognitionRef.current = null;
  }, []);

  const handleTranscriptDelta = useCallback((chunk: string) => {
    if (!chunk.trim()) return;
    const words = pageWordsRef.current;
    if (!words.length) return;

    const res = evaluateSpokenWords(chunk, words, cursorRef.current);
    cursorRef.current = res.nextCursor;

    if (res.newlyMatchedKeys.length > 0) {
      setMatchedWordKeys((prev) => {
        const next = new Set(prev);
        for (const k of res.newlyMatchedKeys) next.add(k);
        return next;
      });
    }
    if (res.newlyMissedKeys.length > 0) {
      setMissedWordKeys((prev) => {
        const next = new Set(prev);
        for (const k of res.newlyMissedKeys) next.add(k);
        return next;
      });
    }
    if (res.mistakeKey) {
      setMistakePulseKey(res.mistakeKey);
      setTimeout(() => {
        setMistakePulseKey((curr) => (curr === res.mistakeKey ? null : curr));
      }, 1400);
    } else if (res.newlyMatchedKeys.length > 0) {
      setMistakePulseKey(null);
    }
  }, []);

  const startListening = useCallback(() => {
    setVoiceError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceError(t.micUnsupported);
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        let latestDisplay = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';
          latestDisplay = transcript;

          const tokens = transcript.trim().split(/\s+/).filter(Boolean);
          if (result.isFinal) {
            const remaining = tokens.slice(processedInterimTokensRef.current).join(' ');
            processedInterimTokensRef.current = 0;
            if (remaining) handleTranscriptDelta(remaining);
          } else {
            // Process newly spoken stable words in interim results for low-latency word follow
            if (tokens.length > processedInterimTokensRef.current) {
              const delta = tokens.slice(processedInterimTokensRef.current).join(' ');
              processedInterimTokensRef.current = tokens.length;
              if (delta) handleTranscriptDelta(delta);
            }
          }
        }
        setInterimText(latestDisplay.trim());
      };

      rec.onerror = (event) => {
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed' ||
          event.error === 'audio-capture'
        ) {
          setVoiceError(t.micPermissionDenied);
          stopListening();
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setVoiceError(t.micPermissionDenied);
          stopListening();
        }
      };

      rec.onend = () => {
        if (listeningRef.current) {
          processedInterimTokensRef.current = 0;
          try {
            rec.start();
          } catch {
            stopListening();
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
      listeningRef.current = true;
      setIsListening(true);
      processedInterimTokensRef.current = 0;
      rec.start();
    } catch {
      setVoiceError(t.micPermissionDenied);
      stopListening();
    }
  }, [handleTranscriptDelta, stopListening, t.micPermissionDenied, t.micUnsupported]);

  const toggleListening = useCallback(() => {
    if (listeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Expose manual/test helper to simulate or inject spoken Arabic words if needed
  const simulateSpoken = useCallback(
    (arabicText: string) => {
      setInterimText(arabicText);
      handleTranscriptDelta(arabicText);
    },
    [handleTranscriptDelta]
  );

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore unmount errors
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    voiceError,
    interimText,
    matchedWordKeys,
    missedWordKeys,
    mistakePulseKey,
    clearVoiceError: () => setVoiceError(null),
    toggleListening,
    stopListening,
    resetProgress,
    simulateSpoken,
  };
}
