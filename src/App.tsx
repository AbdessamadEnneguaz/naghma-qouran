import {Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, Bell, Loader2, RefreshCw, WifiOff, X} from 'lucide-react';
import type {
  BookmarkCategory,
  BookmarkEntry,
  LastReadState,
  OfflineSurahRecord,
  QuranVerse,
  ReaderSettings,
  ReadingStats,
  Reciter,
  SearchResult,
  SurahMeta,
} from './types/quran';
import {getReciterById} from './data/reciters';
import {
  clearAllAudioCache,
  deleteOfflineSurah,
  downloadSurahOffline,
  getOfflineSurahs,
  getQuranVaultKeys,
  getStorageEstimate,
  loadBookmarks,
  loadLastRead,
  loadReadingStats,
  loadReciterSyncOffset,
  loadSettings,
  saveBookmarks,
  saveLastRead,
  saveReadingStats,
  saveReciterSyncOffset,
  saveSettings,
} from './services/indexedDbVault';
import {
  findVerseAndPage,
  getVerseTextByRiwayat,
  loadAllHafsVerses,
  loadEnglishTranslation,
  loadFrenchTranslation,
  loadPageVerses,
  loadStartupQuranBundle,
  loadTafsirMuyassar,
  loadWarshTexts,
  warmOfflineDatasetsInIndexedDb,
} from './services/quranLoader';
import {
  clampPage,
  getBookmarkCategory,
  normalizeSpeechWord,
  resolveActiveContextTarget,
  stripLeadingBismillah,
  tokenizeVerseWords,
  type PageWordTarget,
} from './utils/quranLogic';
import {createDefaultReadingStats, recordPageRead} from './utils/readingStreakLogic';
import {
  parseRouteFromLocation,
  routeToPath,
  type AppRoute,
} from './utils/routing';
import {
  readIntroSeen,
  shouldShowWebIntroLanding,
  writeIntroSeen,
} from './utils/introFlowLogic';
import {useAudioPlayer} from './hooks/useAudioPlayer';
import {useAppUpdater} from './hooks/useAppUpdater';
import {useKhatmaReminders} from './hooks/useKhatmaReminders';
import {useOnlineStatus, usePWAInstall} from './hooks/usePWAInstall';
import {useVoiceRecitation} from './hooks/useVoiceRecitation';
import {useWakeLock} from './hooks/useWakeLock';
import {TRANSLATIONS, type AppLang} from './i18n/translations';
import {Header} from './components/Header';
import {HomeView} from './components/HomeView';
import {AppFooter} from './components/AppFooter';
import {AudioPlayerBar} from './components/AudioPlayerBar';
import {MobileBottomNav} from './components/MobileBottomNav';
import {MobileMenuDrawer} from './components/MobileMenuDrawer';
import {SplashScreen} from './components/SplashScreen';

const MushafView = lazy(() =>
  import('./components/MushafView').then((m) => ({default: m.MushafView}))
);
const SurahsPage = lazy(() =>
  import('./components/SurahsPage').then((m) => ({default: m.SurahsPage}))
);
const QiblaPage = lazy(() =>
  import('./components/QiblaPage').then((m) => ({default: m.QiblaPage}))
);
const AdhkarPage = lazy(() =>
  import('./components/AdhkarPage').then((m) => ({default: m.AdhkarPage}))
);
const KhatmaPage = lazy(() =>
  import('./components/KhatmaPage').then((m) => ({default: m.KhatmaPage}))
);
const DownloadApkPage = lazy(() =>
  import('./components/DownloadApkPage').then((m) => ({default: m.DownloadApkPage}))
);
const VaultView = lazy(() =>
  import('./components/VaultView').then((m) => ({default: m.VaultView}))
);
const PrivacyPage = lazy(() =>
  import('./components/PrivacyPage').then((m) => ({default: m.PrivacyPage}))
);
const TafsirDrawer = lazy(() =>
  import('./components/TafsirDrawer').then((m) => ({default: m.TafsirDrawer}))
);
const SearchModal = lazy(() =>
  import('./components/SearchModal').then((m) => ({default: m.SearchModal}))
);
const InstallModal = lazy(() =>
  import('./components/InstallModal').then((m) => ({default: m.InstallModal}))
);
const HeartGuideModal = lazy(() =>
  import('./components/HeartGuideModal').then((m) => ({default: m.HeartGuideModal}))
);
const OnboardingModal = lazy(() =>
  import('./components/OnboardingModal').then((m) => ({default: m.OnboardingModal}))
);
const NotificationsModal = lazy(() =>
  import('./components/NotificationsModal').then((m) => ({default: m.NotificationsModal}))
);
const IntroLandingPage = lazy(() =>
  import('./components/IntroLandingPage').then((m) => ({default: m.IntroLandingPage}))
);

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  riwayat: 'hafs',
  font: 'amiri',
  fontSize: 25,
  lineHeight: 2.35,
  showTranslation: false,
  readerMode: 'mushaf',
  reciterId: 'hafs_alafasy',
  playbackSpeed: 1,
  audioSyncOffsetSec: 0,
};

const ONBOARDING_STORAGE_KEY = 'najm_onboarding_done';

function detectNativeOrStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.protocol === 'file:' ||
    window.location.protocol === 'capacitor:' ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
  );
}

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  const showIntro = shouldShowWebIntroLanding({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    introSeen: readIntroSeen(window.localStorage),
    isNativeOrStandalone: detectNativeOrStandalone(),
  });
  if (showIntro) return 'intro';
  return parseRouteFromLocation(window.location.pathname, window.location.hash);
}

function getInitialShowOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).has('autostart')) return false;
    if (getInitialRoute() === 'intro') return false;
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== '1';
  } catch {
    return false;
  }
}

function getInitialLang(): AppLang {
  try {
    const saved =
      localStorage.getItem('najm_lang') ||
      localStorage.getItem('naghma_lang') ||
      localStorage.getItem('noor_lang');
    if (saved === 'ar' || saved === 'en' || saved === 'fr') return saved;
  } catch {
    // ignore storage access issues
  }
  return 'en';
}

const RouteFallback = () => (
  <div className="py-20 flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
  </div>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [pageVerses, setPageVerses] = useState<QuranVerse[]>([]);
  const [searchVerses, setSearchVerses] = useState<QuranVerse[]>([]);
  const [warshTexts, setWarshTexts] = useState<string[] | null>(null);
  const [tafsirTexts, setTafsirTexts] = useState<string[] | null>(null);
  const [translations, setTranslations] = useState<string[] | null>(null);
  const [frenchTexts, setFrenchTexts] = useState<string[] | null>(null);

  const [lang, setLang] = useState<AppLang>(getInitialLang);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [lastRead, setLastRead] = useState<LastReadState | null>(null);
  const [readingStats, setReadingStats] = useState<ReadingStats>(() =>
    createDefaultReadingStats()
  );
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [highlightedAyahKey, setHighlightedAyahKey] = useState<string | null>(null);

  const [focusMode, setFocusMode] = useState(false);
  const [hifzMode, setHifzMode] = useState(false);
  const [hifzFirstWordHint, setHifzFirstWordHint] = useState(false);
  const [revealedAyahKeys, setRevealedAyahKeys] = useState<Set<string>>(() => new Set());

  const [showOnboarding, setShowOnboarding] = useState<boolean>(getInitialShowOnboarding);
  const [showSearch, setShowSearch] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showHeartModal, setShowHeartModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [audioExpandSignal, setAudioExpandSignal] = useState(0);
  const [audioCollapseSignal, setAudioCollapseSignal] = useState(0);

  const [offlineRecords, setOfflineRecords] = useState<OfflineSurahRecord[]>([]);
  const [vaultKeys, setVaultKeys] = useState<string[]>([]);
  const [storageEstimate, setStorageEstimate] = useState({usage: 0, quota: 0});
  const [downloadProgress, setDownloadProgress] = useState<{
    surah: number;
    completed: number;
    total: number;
  } | null>(null);

  const pageRequestIdRef = useRef(0);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const isOnline = useOnlineStatus();
  const {isInstallable, isInstalled, isIOS, triggerNativeInstall} = usePWAInstall();
  const updater = useAppUpdater();
  const wakeLock = useWakeLock();
  const [dismissedUpdateBanner, setDismissedUpdateBanner] = useState(false);
  const activeReciter = useMemo(() => getReciterById(settings.reciterId), [settings.reciterId]);
  const t = TRANSLATIONS[lang];
  const khatma = useKhatmaReminders(lang);

  const refreshVaultStats = useCallback(async () => {
    const [recs, keys, est] = await Promise.all([
      getOfflineSurahs(),
      getQuranVaultKeys(),
      getStorageEstimate(),
    ]);
    setOfflineRecords(recs);
    setVaultKeys(keys);
    setStorageEstimate(est);
  }, []);

  const navigateToRoute = useCallback(
    (route: AppRoute, options?: {replace?: boolean}) => {
      setFocusMode(false);
      setShowMobileMenu(false);
      if (route !== 'mushaf') {
        setAudioCollapseSignal((n) => n + 1);
      }
      if (route === 'vault') {
        void refreshVaultStats();
      }
      setActiveRoute(route);

      if (typeof window !== 'undefined') {
        const targetPath = routeToPath(route);
        if (window.location.protocol === 'file:') {
          const nextHash = `#${targetPath}`;
          if (window.location.hash !== nextHash) {
            window.location.hash = nextHash;
          }
        } else {
          const current = window.location.pathname;
          if (current !== targetPath) {
            try {
              if (options?.replace) {
                window.history.replaceState({route}, '', targetPath);
              } else {
                window.history.pushState({route}, '', targetPath);
              }
            } catch {
              window.location.hash = `#${targetPath}`;
            }
          }
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    },
    [refreshVaultStats]
  );

  useEffect(() => {
    const syncFromBrowserUrl = () => {
      const next = parseRouteFromLocation(window.location.pathname, window.location.hash);
      setFocusMode(false);
      setShowMobileMenu(false);
      setActiveRoute(next);
    };
    window.addEventListener('popstate', syncFromBrowserUrl);
    window.addEventListener('hashchange', syncFromBrowserUrl);
    return () => {
      window.removeEventListener('popstate', syncFromBrowserUrl);
      window.removeEventListener('hashchange', syncFromBrowserUrl);
    };
  }, []);

  // Fast startup: hydrate only Surah index + active Mushaf page (~10-20 verses)
  useEffect(() => {
    let cancelled = false;
    let idleTimer: number | undefined;

    async function init() {
      try {
        const [savedSettings, savedLastRead, savedBookmarks, savedStats] = await Promise.all([
          loadSettings(),
          loadLastRead(),
          loadBookmarks(),
          loadReadingStats(),
        ]);

        const initialPage = clampPage(savedLastRead?.page || 1);
        const startup = await loadStartupQuranBundle(initialPage);

        if (cancelled) return;

        const reciterId = savedSettings.reciterId || DEFAULT_SETTINGS.reciterId;
        const mergedSettings: ReaderSettings = {
          ...DEFAULT_SETTINGS,
          ...savedSettings,
          theme: savedSettings.theme || 'light',
          audioSyncOffsetSec: loadReciterSyncOffset(reciterId),
          readerMode: 'mushaf',
        };
        setSettings(mergedSettings);
        setSurahs(startup.surahs);
        setPageVerses(startup.initialPageVerses);
        setBookmarks(savedBookmarks);
        if (savedStats) {
          setReadingStats(savedStats);
        }

        if (savedLastRead) {
          setLastRead(savedLastRead);
          setCurrentPage(initialPage);
          setCurrentSurahId(savedLastRead.surah);
        }

        setLoading(false);

        if (mergedSettings.riwayat === 'warsh') {
          void loadWarshTexts().then((w) => {
            if (!cancelled) setWarshTexts(w);
          });
        }
        if (mergedSettings.showTranslation) {
          void loadEnglishTranslation().then((tr) => {
            if (!cancelled) setTranslations(tr);
          });
        }

        void refreshVaultStats();

        // Warm IndexedDB offline store quietly in background without bloating React RAM
        idleTimer = window.setTimeout(() => {
          if (!cancelled) {
            void warmOfflineDatasetsInIndexedDb().then(() => {
              if (!cancelled) void refreshVaultStats();
            });
          }
        }, 2500);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to initialize Quran vault.');
          setLoading(false);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    };
  }, [refreshVaultStats]);

  // Lazy-load Warsh script only when Warsh riwayat is active
  useEffect(() => {
    if (settings.riwayat !== 'warsh' || warshTexts) return;
    let cancelled = false;
    void loadWarshTexts()
      .then((w) => {
        if (!cancelled) setWarshTexts(w);
      })
      .catch(() => {
        // Offline soft fallback
      });
    return () => {
      cancelled = true;
    };
  }, [settings.riwayat, warshTexts]);

  // Lazy-load English translation only when showTranslation is enabled
  useEffect(() => {
    if (!settings.showTranslation || translations) return;
    let cancelled = false;
    void loadEnglishTranslation()
      .then((tr) => {
        if (!cancelled) setTranslations(tr);
      })
      .catch(() => {
        // Offline soft fallback
      });
    return () => {
      cancelled = true;
    };
  }, [settings.showTranslation, translations]);

  // Lazy-load Tafsir & Translation when TafsirDrawer opens
  useEffect(() => {
    if (!selectedVerse) return;
    let cancelled = false;
    if (!tafsirTexts) {
      void loadTafsirMuyassar()
        .then((tf) => {
          if (!cancelled) setTafsirTexts(tf);
        })
        .catch(() => {});
    }
    if (!translations) {
      void loadEnglishTranslation()
        .then((tr) => {
          if (!cancelled) setTranslations(tr);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [selectedVerse, tafsirTexts, translations]);

  const ensureFrenchTranslationLoaded = useCallback(() => {
    if (frenchTexts) return;
    void loadFrenchTranslation()
      .then((fr) => setFrenchTexts(fr))
      .catch(() => {});
  }, [frenchTexts]);

  // Lazy-load French translation when interface is switched to French
  useEffect(() => {
    if (lang === 'fr' && !frenchTexts) {
      ensureFrenchTranslationLoaded();
    }
  }, [lang, frenchTexts, ensureFrenchTranslationLoaded]);

  // Lazy-load full 6,236 search corpus + translations only when Search modal opens
  useEffect(() => {
    if (!showSearch) return;
    let cancelled = false;
    if (searchVerses.length === 0) {
      void loadAllHafsVerses()
        .then((all) => {
          if (!cancelled) setSearchVerses(all);
        })
        .catch(() => {});
    }
    if (!translations) {
      void loadEnglishTranslation()
        .then((tr) => {
          if (!cancelled) setTranslations(tr);
        })
        .catch(() => {});
    }
    if (lang === 'fr' && !frenchTexts) {
      void loadFrenchTranslation()
        .then((fr) => {
          if (!cancelled) setFrenchTexts(fr);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [showSearch, searchVerses.length, translations, lang, frenchTexts]);

  // Apply Dark / Light theme class and native colorScheme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('najm_theme', settings.theme);
    } catch {
      // ignore storage errors
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', settings.theme === 'dark' ? '#0A110E' : '#F4F7F5');
    }
  }, [settings.theme]);

  // Apply Language & RTL/LTR direction to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('najm_lang', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const targetReciterId = patch.reciterId ?? prev.reciterId;
      const nextSyncOffset =
        patch.audioSyncOffsetSec !== undefined
          ? patch.audioSyncOffsetSec
          : patch.reciterId && patch.reciterId !== prev.reciterId
            ? loadReciterSyncOffset(patch.reciterId)
            : prev.audioSyncOffsetSec;

      if (patch.audioSyncOffsetSec !== undefined) {
        saveReciterSyncOffset(targetReciterId, patch.audioSyncOffsetSec);
      }

      const next: ReaderSettings = {
        ...prev,
        ...patch,
        audioSyncOffsetSec: nextSyncOffset,
      };
      void saveSettings(next);
      return next;
    });
  }, []);

  const recordPageStat = useCallback((page: number) => {
    setReadingStats((prev) => {
      const next = recordPageRead(prev, page);
      void saveReadingStats(next);
      return next;
    });
  }, []);

  const persistLastRead = useCallback(
    (surah: number, ayah: number, page: number, mode = settings.readerMode) => {
      const next: LastReadState = {
        surah,
        ayah,
        page,
        mode,
        updatedAt: Date.now(),
      };
      setLastRead(next);
      void saveLastRead(next);
    },
    [settings.readerMode]
  );

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }
    setShowOnboarding(false);
  }, []);

  const cycleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'fr' : prev === 'fr' ? 'ar' : 'en'));
  }, []);

  const loadPageIntoView = useCallback(async (page: number): Promise<QuranVerse[]> => {
    const clamped = clampPage(page);
    const reqId = ++pageRequestIdRef.current;
    const loaded = await loadPageVerses(clamped);
    if (pageRequestIdRef.current === reqId) {
      setPageVerses(loaded);
    }
    // Prefetch neighbor pages into fast memory cache
    if (clamped < 604) void loadPageVerses(clamped + 1);
    if (clamped > 1) void loadPageVerses(clamped - 1);
    return loaded;
  }, []);

  const activePageKey = `page:${currentPage}:${settings.riwayat}`;

  const pageWords = useMemo<PageWordTarget[]>(() => {
    const list: PageWordTarget[] = [];
    for (const v of pageVerses) {
      if (v.page !== currentPage) continue;
      const raw = getVerseTextByRiwayat(v, settings.riwayat, warshTexts);
      const display =
        settings.riwayat === 'hafs' ? stripLeadingBismillah(raw, v.surah, v.ayah) : raw;
      const words = tokenizeVerseWords(display);
      for (let i = 0; i < words.length; i++) {
        list.push({
          key: `${v.surah}:${v.ayah}:${i}`,
          ayahKey: `${v.surah}:${v.ayah}`,
          display: words[i],
          normalized: normalizeSpeechWord(words[i]),
        });
      }
    }
    return list;
  }, [pageVerses, currentPage, settings.riwayat, warshTexts]);

  const voice = useVoiceRecitation({
    pageWords,
    pageKey: activePageKey,
    t,
  });

  // Sync reader page & highlight when audio advances verse-by-verse
  const handleAudioVerseChange = useCallback(
    (verse: QuranVerse) => {
      setHighlightedAyahKey(`${verse.surah}:${verse.ayah}`);
      if (verse.page !== currentPageRef.current) {
        setCurrentPage(verse.page);
        void loadPageIntoView(verse.page);
      }
      setCurrentSurahId(verse.surah);
      persistLastRead(verse.surah, verse.ayah, verse.page, 'mushaf');
    },
    [loadPageIntoView, persistLastRead]
  );

  const handleFallbackReciter = useCallback(
    (fallbackReciterId: string) => {
      updateSettings({reciterId: fallbackReciterId});
    },
    [updateSettings]
  );

  const activeContextTarget = useMemo(
    () =>
      resolveActiveContextTarget({
        activeRoute,
        verses: pageVerses,
        currentPage,
        currentSurahId,
        highlightedAyahKey,
        lastRead,
      }),
    [activeRoute, pageVerses, currentPage, currentSurahId, highlightedAyahKey, lastRead]
  );

  const player = useAudioPlayer({
    verses: pageVerses,
    surahs,
    reciter: activeReciter,
    playbackSpeed: settings.playbackSpeed,
    audioSyncOffsetSec: settings.audioSyncOffsetSec ?? 0,
    lang,
    viewSurah: activeContextTarget.surah,
    viewAyah: activeContextTarget.ayah,
    onActiveVerseChange: handleAudioVerseChange,
    onFallbackReciter: handleFallbackReciter,
  });

  useEffect(() => {
    setRevealedAyahKeys(new Set());
  }, [activePageKey]);

  const openPage = useCallback(
    (page: number) => {
      const clamped = clampPage(page);
      setCurrentPage(clamped);
      recordPageStat(clamped);
      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');

      void loadPageIntoView(clamped).then((loaded) => {
        const firstOnPage = loaded[0];
        setHighlightedAyahKey((prev) => {
          if (!prev) return null;
          const [sStr, aStr] = prev.split(':');
          const stillOnPage = loaded.some(
            (v) => v.surah === Number(sStr) && v.ayah === Number(aStr)
          );
          return stillOnPage ? prev : null;
        });
        if (firstOnPage) {
          setCurrentSurahId(firstOnPage.surah);
          persistLastRead(firstOnPage.surah, firstOnPage.ayah, clamped, 'mushaf');
        }
      });
    },
    [loadPageIntoView, persistLastRead, recordPageStat, updateSettings, navigateToRoute]
  );

  const openSurah = useCallback(
    (surahId: number, ayah = 1) => {
      const sMeta = surahs.find((s) => s.id === surahId);
      const optimisticPage = clampPage(sMeta?.startPage ?? 1);

      setCurrentSurahId(surahId);
      if (ayah <= 1) {
        setCurrentPage(optimisticPage);
        setHighlightedAyahKey(`${surahId}:1`);
        recordPageStat(optimisticPage);
        persistLastRead(surahId, 1, optimisticPage, 'mushaf');
        void loadPageIntoView(optimisticPage);
      } else {
        void findVerseAndPage(surahId, ayah).then((located) => {
          if (!located) return;
          setCurrentPage(located.page);
          setPageVerses(located.pageVerses);
          setHighlightedAyahKey(`${located.verse.surah}:${located.verse.ayah}`);
          recordPageStat(located.page);
          persistLastRead(located.verse.surah, located.verse.ayah, located.page, 'mushaf');
        });
      }

      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');
    },
    [surahs, loadPageIntoView, persistLastRead, recordPageStat, updateSettings, navigateToRoute]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) return;

    const handleSwMessage = (event: MessageEvent) => {
      const payload = event.data as
        | {type?: string; route?: AppRoute; surahId?: number | null}
        | undefined;
      if (!payload || payload.type !== 'MIHRAB_NOTIFICATION_NAVIGATE') return;
      if (payload.surahId && Number.isFinite(Number(payload.surahId))) {
        openSurah(Number(payload.surahId), 1);
      } else if (payload.route) {
        navigateToRoute(payload.route);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [openSurah, navigateToRoute]);

  const coldSurahHandledRef = useRef(false);
  useEffect(() => {
    if (coldSurahHandledRef.current || surahs.length === 0 || typeof window === 'undefined') {
      return;
    }
    const rawSurah = new URLSearchParams(window.location.search).get('surah');
    if (rawSurah) {
      coldSurahHandledRef.current = true;
      const surahId = Number(rawSurah);
      if (Number.isFinite(surahId) && surahId >= 1 && surahId <= 114) {
        openSurah(surahId, 1);
      }
    }
  }, [surahs, openSurah]);

  const markIntroCompleted = useCallback(() => {
    try {
      writeIntroSeen(window.localStorage, true);
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      // ignore storage issues
    }
    setShowOnboarding(false);
  }, []);

  const handleSearchResult = useCallback(
    (res: SearchResult) => {
      const clamped = clampPage(res.page);
      setCurrentSurahId(res.surah);
      setCurrentPage(clamped);
      setHighlightedAyahKey(`${res.surah}:${res.ayah}`);
      recordPageStat(clamped);
      persistLastRead(res.surah, res.ayah, clamped, 'mushaf');
      void loadPageIntoView(clamped);
      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');
    },
    [loadPageIntoView, persistLastRead, recordPageStat, updateSettings, navigateToRoute]
  );

  const handleToggleBookmark = useCallback(
    (verse: QuranVerse, category: BookmarkCategory = 'favorites') => {
      const id = `${verse.surah}:${verse.ayah}`;
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === id);
        let next: BookmarkEntry[];
        if (exists) {
          next = prev.filter((b) => b.id !== id);
        } else {
          const sMeta = surahs.find((s) => s.id === verse.surah);
          const snippet = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
          const entry: BookmarkEntry = {
            id,
            surah: verse.surah,
            ayah: verse.ayah,
            page: verse.page,
            surahNameAr: sMeta?.nameAr || '',
            surahNameEn: sMeta?.nameEn || `Surah ${verse.surah}`,
            snippet,
            category,
            createdAt: Date.now(),
          };
          next = [entry, ...prev];
        }
        void saveBookmarks(next);
        return next;
      });
    },
    [surahs, settings.riwayat, warshTexts]
  );

  const handleSetBookmarkCategory = useCallback(
    (verse: QuranVerse, category: BookmarkCategory) => {
      const id = `${verse.surah}:${verse.ayah}`;
      setBookmarks((prev) => {
        const existingIdx = prev.findIndex((b) => b.id === id);
        let next: BookmarkEntry[];
        if (existingIdx !== -1) {
          next = prev.map((b, idx) => (idx === existingIdx ? {...b, category} : b));
        } else {
          const sMeta = surahs.find((s) => s.id === verse.surah);
          const snippet = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
          const entry: BookmarkEntry = {
            id,
            surah: verse.surah,
            ayah: verse.ayah,
            page: verse.page,
            surahNameAr: sMeta?.nameAr || '',
            surahNameEn: sMeta?.nameEn || `Surah ${verse.surah}`,
            snippet,
            category,
            createdAt: Date.now(),
          };
          next = [entry, ...prev];
        }
        void saveBookmarks(next);
        return next;
      });
    },
    [surahs, settings.riwayat, warshTexts]
  );

  const handleRemoveBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      void saveBookmarks(next);
      return next;
    });
  }, []);

  const handleDownloadSurah = useCallback(
    async (surahMeta: SurahMeta) => {
      if (downloadProgress) return;
      try {
        await downloadSurahOffline(activeReciter, surahMeta, (completed, total) => {
          setDownloadProgress({surah: surahMeta.id, completed, total});
        });
        await refreshVaultStats();
      } catch {
        // Handled cleanly by resetting progress
      } finally {
        setDownloadProgress(null);
      }
    },
    [activeReciter, downloadProgress, refreshVaultStats]
  );

  const handleDeleteOfflineRecord = useCallback(
    async (reciter: Reciter, surahMeta: SurahMeta) => {
      await deleteOfflineSurah(reciter, surahMeta);
      await refreshVaultStats();
    },
    [refreshVaultStats]
  );

  const handleClearAudioCache = useCallback(async () => {
    await clearAllAudioCache();
    await refreshVaultStats();
  }, [refreshVaultStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }
      if (e.key === 'Escape') {
        if (showMobileMenu) {
          setShowMobileMenu(false);
          return;
        }
        if (focusMode) {
          setFocusMode(false);
          return;
        }
      }
      if (
        activeRoute === 'mushaf' &&
        !showSearch &&
        !showInstallModal &&
        !selectedVerse &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        if (e.key === 'ArrowLeft' && currentPage < 604) {
          openPage(currentPage + 1);
        } else if (e.key === 'ArrowRight' && currentPage > 1) {
          openPage(currentPage - 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeRoute,
    currentPage,
    focusMode,
    showMobileMenu,
    showSearch,
    showInstallModal,
    selectedVerse,
    openPage,
  ]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await triggerNativeInstall();
      if (accepted) return;
    }
    setShowInstallModal(true);
  };

  if (loading) {
    return (
      <>
        <SplashScreen isDataReady={false} />
        <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#0A110E] flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
          <div className="text-center space-y-1">
            <p className="font-quran-scheherazade text-2xl text-[#27784C] dark:text-[#52B77F]">
              مِحْرَاب النُّور · المصحف الشريف
            </p>
            <p className="text-xs text-[#5A6B62] dark:text-[#92A59B]">
              {lang === 'ar'
                ? 'جارٍ تهيئة المصحف الشريف للعمل دون اتصال...'
                : 'Preparing offline Quran vault in IndexedDB...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#0A110E] flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#27784C] dark:bg-[#52B77F] px-5 py-2 text-xs font-semibold text-white dark:text-[#0A110E]"
        >
          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  const isMushafFocus = activeRoute === 'mushaf' && focusMode;
  const isIntroRoute = activeRoute === 'intro';
  const hideAppChrome = isMushafFocus || isIntroRoute;
  const hideAudioBarOnMobileIdle =
    activeRoute !== 'mushaf' && !player.hasStarted && !player.isPlaying && !voice.isListening;

  return (
    <div className="min-h-screen text-[#142019] dark:text-[#F1F5F3] transition-colors">
      <SplashScreen isDataReady={!loading} />
      <Header
        activeRoute={activeRoute}
        lang={lang}
        t={t}
        theme={settings.theme}
        hidden={hideAppChrome}
        isInstalled={isInstalled}
        hasActiveNotifications={khatma.hasActiveNotifications}
        onNavigate={navigateToRoute}
        onOpenNotifications={() => setShowNotifications(true)}
        onToggleLang={cycleLang}
        onToggleTheme={() => updateSettings({theme: settings.theme === 'dark' ? 'light' : 'dark'})}
      />

      {updater.updateAvailable && !dismissedUpdateBanner && !isMushafFocus && (
        <div
          role="status"
          data-testid="ota-update-banner"
          className="bg-[#EAF1EC] dark:bg-[#15241D] border-b border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] flex items-center justify-center gap-3"
        >
          <span>
            {lang === 'ar' ? 'يتوفر تحديث جديد للتطبيق' : 'A new update is ready'}
          </span>
          <button
            type="button"
            onClick={() => void updater.applyUpdateNow()}
            className="inline-flex items-center gap-1 rounded-lg bg-[#27784C] dark:bg-[#52B77F] px-3 py-1 text-[11px] font-semibold text-white dark:text-[#0A110E] hover:opacity-90"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
            <span>{lang === 'ar' ? 'تحديث الآن' : 'Update Now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissedUpdateBanner(true)}
            aria-label={t.closeWord}
            className="p-0.5 rounded opacity-75 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {!isOnline && !isMushafFocus && (
        <div className="bg-[#EAF1EC] dark:bg-[#15241D] border-b border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-1.5 text-center text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {khatma.toastPreview && (
        <div
          role="status"
          aria-live="polite"
          data-testid="khatma-toast"
          className="fixed top-16 end-3 sm:end-6 z-50 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-3.5 shadow-2xl flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]">
              {khatma.toastPreview.title}
            </p>
            <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] leading-relaxed">
              {khatma.toastPreview.body}
            </p>
            {khatma.toastPreview.action === 'kahf' && (
              <button
                type="button"
                onClick={() => {
                  khatma.dismissToast();
                  openSurah(18, 1);
                }}
                className="mt-1 inline-flex items-center rounded-lg bg-[#27784C] dark:bg-[#52B77F] px-3 py-1 text-[11px] font-semibold text-white dark:text-[#0A110E]"
              >
                {t.openKahfBtn}
              </button>
            )}
            {(khatma.toastPreview.action === 'qibla' || khatma.toastPreview.action === 'adhkar') && (
              <button
                type="button"
                onClick={() => {
                  const target: AppRoute =
                    khatma.toastPreview?.action === 'adhkar' ? 'adhkar' : 'qibla';
                  khatma.dismissToast();
                  navigateToRoute(target);
                }}
                className="mt-1 inline-flex items-center rounded-lg bg-[#27784C] dark:bg-[#52B77F] px-3 py-1 text-[11px] font-semibold text-white dark:text-[#0A110E]"
              >
                {khatma.toastPreview.action === 'qibla' ? t.navQibla : t.navAdhkar}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={khatma.dismissToast}
            aria-label={t.closeWord}
            className="p-1 rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <main>
        <Suspense fallback={<RouteFallback />}>
          {activeRoute === 'intro' && (
            <IntroLandingPage
              lang={lang}
              t={t}
              theme={settings.theme}
              riwayat={settings.riwayat}
              isPlayingSample={player.isPlaying}
              playingSurah={player.activeSurah}
              playingAyah={player.activeAyah}
              onChangeLang={(nextLang) => setLang(nextLang)}
              onChangeRiwayat={(riwayat) => updateSettings({riwayat})}
              onToggleTheme={() =>
                updateSettings({theme: settings.theme === 'dark' ? 'light' : 'dark'})
              }
              onPlaySampleVerse={(s, a) => {
                void player.playVerse(s, a);
              }}
              onOpenSampleInMushaf={(s, a) => {
                markIntroCompleted();
                openSurah(s, a);
              }}
              onEnterApp={() => {
                markIntroCompleted();
                navigateToRoute('home');
              }}
              onOpenDownloadApk={() => {
                markIntroCompleted();
                navigateToRoute('download');
              }}
            />
          )}
        </Suspense>

        {activeRoute === 'home' && (
          <HomeView
            lang={lang}
            t={t}
            surahs={surahs}
            lastRead={lastRead}
            bookmarks={bookmarks}
            offlineRecords={offlineRecords}
            riwayat={settings.riwayat}
            khatmaSchedule={khatma.schedule}
            readingStats={readingStats}
            talqeenPauseSeconds={player.talqeen.pauseSeconds}
            isInstalled={isInstalled}
            hasActiveNotifications={khatma.hasActiveNotifications}
            onChangeRiwayat={(riwayat) => updateSettings({riwayat})}
            onOpenSurah={openSurah}
            onOpenPage={openPage}
            onOpenSearch={() => setShowSearch(true)}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenAllSurahs={() => navigateToRoute('surahs')}
            onOpenVault={() => navigateToRoute('vault')}
            onOpenKhatma={() => navigateToRoute('khatma')}
            onOpenAdhkar={() => navigateToRoute('adhkar')}
            onOpenQibla={() => navigateToRoute('qibla')}
            onOpenDownloadApk={() => navigateToRoute('download')}
            onLaunchTalqeen={() => {
              const targetSurah = lastRead?.surah || currentSurahId || 1;
              const targetMeta = surahs.find((s) => s.id === targetSurah);
              const startA = lastRead?.ayah || 1;
              const endA = Math.min(targetMeta?.totalAyahs || 7, startA + 4);
              if (activeReciter.mode !== 'ayah') {
                updateSettings({reciterId: 'hafs_alafasy'});
              }
              player.updateTalqeen({enabled: true, startAyah: startA, endAyah: endA});
              openSurah(targetSurah, startA);
              setAudioExpandSignal((n) => n + 1);
            }}
            onOpenHeartGuide={() => setShowHeartModal(true)}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        <Suspense fallback={<RouteFallback />}>
          {activeRoute === 'surahs' && (
            <SurahsPage
              lang={lang}
              t={t}
              surahs={surahs}
              bookmarks={bookmarks}
              offlineRecords={offlineRecords}
              onOpenSurah={openSurah}
              onPlaySurah={(surahId) => {
                openSurah(surahId, 1);
                void player.playVerse(surahId, 1);
              }}
              onOpenPage={openPage}
              onRemoveBookmark={handleRemoveBookmark}
            />
          )}

          {activeRoute === 'qibla' && <QiblaPage lang={lang} t={t} />}

          {activeRoute === 'adhkar' && <AdhkarPage lang={lang} t={t} />}

          {activeRoute === 'khatma' && (
            <KhatmaPage
              lang={lang}
              t={t}
              plan={khatma.plan}
              schedule={khatma.schedule}
              permission={khatma.permission}
              onChangeGoalDays={khatma.setGoalDays}
              onLogPages={khatma.logPagesRead}
              onMarkTodayComplete={khatma.markTodayComplete}
              onResetPlan={khatma.resetPlan}
              onToggleReminder={khatma.toggleReminder}
              onToggleFridayKahf={khatma.toggleFridayKahf}
              onChangeReminderTime={khatma.setReminderTime}
              onSendTestReminder={khatma.sendReminderNow}
              onSendTestKahf={khatma.sendFridayKahfNow}
              onOpenMushafPage={openPage}
              onOpenKahfSurah={() => openSurah(18, 1)}
            />
          )}

          {activeRoute === 'download' && (
            <DownloadApkPage
              lang={lang}
              t={t}
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              currentVersion={updater.currentVersion}
              onTriggerNativeInstall={triggerNativeInstall}
            />
          )}

          {activeRoute === 'vault' && (
            <VaultView
              lang={lang}
              t={t}
              surahs={surahs}
              bookmarks={bookmarks}
              activeReciter={activeReciter}
              offlineRecords={offlineRecords}
              vaultKeys={vaultKeys}
              storageEstimate={storageEstimate}
              downloadProgress={downloadProgress}
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              onOpenSurah={openSurah}
              onRemoveBookmark={handleRemoveBookmark}
              onDownloadSurah={(meta) => void handleDownloadSurah(meta)}
              onDeleteOfflineRecord={(r, s) => void handleDeleteOfflineRecord(r, s)}
              onClearAudioCache={() => void handleClearAudioCache()}
              onOpenInstall={() => void handleInstallClick()}
            />
          )}

          {activeRoute === 'mushaf' && (
            <MushafView
              lang={lang}
              t={t}
              surahs={surahs}
              verses={pageVerses}
              warshTexts={warshTexts}
              translations={translations}
              currentPage={currentPage}
              currentSurahId={currentSurahId}
              selectedAyahKey={highlightedAyahKey}
              playingSurah={player.activeSurah}
              playingAyah={player.activeAyah}
              isPlaying={player.isPlaying}
              settings={settings}
              activeReciter={activeReciter}
              bookmarks={bookmarks}
              offlineRecords={offlineRecords}
              downloadProgress={downloadProgress}
              focusMode={focusMode}
              hifzMode={hifzMode}
              hifzFirstWordHint={hifzFirstWordHint}
              revealedAyahKeys={revealedAyahKeys}
              matchedWordKeys={voice.matchedWordKeys}
              missedWordKeys={voice.missedWordKeys}
              mistakePulseKey={voice.mistakePulseKey}
              onToggleFocusMode={() => setFocusMode((f) => !f)}
              onToggleFirstWordHint={() => setHifzFirstWordHint((h) => !h)}
              onToggleRevealAyah={(key) =>
                setRevealedAyahKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              onRevealAllOnPage={(keys) => setRevealedAyahKeys(new Set(keys))}
              onMaskAllOnPage={() => setRevealedAyahKeys(new Set())}
              onUpdateSettings={updateSettings}
              onChangePage={openPage}
              onChangeSurah={(id) => openSurah(id, 1)}
              onOpenTafsir={(v) => {
                setHighlightedAyahKey(`${v.surah}:${v.ayah}`);
                setSelectedVerse(v);
                persistLastRead(v.surah, v.ayah, v.page);
              }}
              onPlayAyah={(s, a) => {
                setHighlightedAyahKey(`${s}:${a}`);
                void player.playVerse(s, a);
              }}
              onToggleBookmark={handleToggleBookmark}
              onDownloadSurah={(meta) => void handleDownloadSurah(meta)}
            />
          )}

          {activeRoute === 'privacy' && (
            <PrivacyPage
              lang={lang}
              t={t}
              onBackHome={() => navigateToRoute('home')}
            />
          )}
        </Suspense>
      </main>

      <AppFooter
        lang={lang}
        t={t}
        hidden={hideAppChrome}
        isInstalled={isInstalled}
        onNavigate={navigateToRoute}
      />

      <AudioPlayerBar
        lang={lang}
        t={t}
        surahs={surahs}
        activeSurah={player.activeSurah}
        activeAyah={player.activeAyah}
        isPlaying={player.isPlaying}
        isBuffering={player.isBuffering}
        audioError={player.audioError}
        reciter={activeReciter}
        loopMode={player.loopMode}
        playbackSpeed={settings.playbackSpeed}
        sleepTimer={player.sleepTimer}
        sleepSecondsLeft={player.sleepSecondsLeft}
        currentTime={player.currentTime}
        duration={player.duration}
        subscribeProgress={player.subscribeProgress}
        settings={settings}
        offlineRecords={offlineRecords}
        downloadProgress={downloadProgress}
        focusMode={isMushafFocus || (isIntroRoute && !player.hasStarted && !player.isPlaying)}
        hifzMode={hifzMode}
        isListening={voice.isListening}
        voiceError={voice.voiceError}
        interimText={voice.interimText}
        matchedCount={voice.matchedWordKeys.size}
        hasMistakePulse={!!voice.mistakePulseKey}
        onToggleHifzMode={() => {
          setHifzMode((prev) => {
            const next = !prev;
            if (next && activeRoute !== 'mushaf') {
              navigateToRoute('mushaf');
            }
            if (!next) setRevealedAyahKeys(new Set());
            return next;
          });
        }}
        onToggleVoiceRecite={() => {
          if (activeRoute !== 'mushaf') navigateToRoute('mushaf');
          voice.toggleListening();
        }}
        onResetVoiceProgress={voice.resetProgress}
        onClearVoiceError={voice.clearVoiceError}
        onUpdateSettings={updateSettings}
        onTogglePlayPause={() => void player.togglePlayPause()}
        onPlayNext={player.playNext}
        onPlayPrev={player.playPrev}
        onSeek={player.seekTo}
        onChangeReciter={(reciterId) => updateSettings({reciterId})}
        onCycleLoopMode={player.cycleLoopMode}
        onChangeSpeed={(playbackSpeed) => updateSettings({playbackSpeed})}
        onChangeSleepTimer={player.setSleepTimer}
        onDownloadSurah={(meta) => void handleDownloadSurah(meta)}
        onJumpToActiveAyah={() => openSurah(player.activeSurah, player.activeAyah)}
        talqeen={player.talqeen}
        talqeenCountdown={player.talqeenCountdown}
        forceExpandSignal={audioExpandSignal}
        collapseSignal={audioCollapseSignal}
        isInstalled={isInstalled}
        hideOnMobileIdle={hideAudioBarOnMobileIdle}
        wakeLockSupported={wakeLock.isSupported}
        wakeLockEnabled={wakeLock.enabled}
        wakeLockActive={wakeLock.isActive}
        onToggleWakeLock={wakeLock.toggleWakeLock}
        onUpdateTalqeen={player.updateTalqeen}
        onSkipTalqeenPause={player.skipTalqeenPause}
        onOpenInstall={() => navigateToRoute('download')}
      />

      <MobileBottomNav
        activeRoute={activeRoute}
        t={t}
        hidden={hideAppChrome}
        isDrawerOpen={showMobileMenu}
        onNavigate={navigateToRoute}
        onOpenMenu={() => setShowMobileMenu(true)}
      />

      <MobileMenuDrawer
        isOpen={showMobileMenu}
        lang={lang}
        t={t}
        theme={settings.theme}
        isInstalled={isInstalled}
        khatmaPercent={khatma.schedule.percentComplete}
        cachedSurahCount={offlineRecords.length}
        currentVersion={updater.currentVersion}
        updateAvailable={updater.updateAvailable}
        updateStatus={updater.status}
        onClose={() => setShowMobileMenu(false)}
        onNavigate={navigateToRoute}
        onOpenHeartGuide={() => setShowHeartModal(true)}
        onToggleTheme={() =>
          updateSettings({theme: settings.theme === 'dark' ? 'light' : 'dark'})
        }
        onToggleLang={cycleLang}
        onSelectLang={(nextLang) => setLang(nextLang)}
        onCheckUpdates={() => void updater.checkForUpdates(true)}
        onApplyUpdate={() => void updater.applyUpdateNow()}
      />

      <Suspense fallback={null}>
        {selectedVerse && (() => {
          const existingBm = bookmarks.find(
            (b) => b.id === `${selectedVerse.surah}:${selectedVerse.ayah}`
          );
          return (
            <TafsirDrawer
              lang={lang}
              t={t}
              verse={selectedVerse}
              surahMeta={surahs.find((s) => s.id === selectedVerse.surah)}
              riwayat={settings.riwayat}
              warshTexts={warshTexts}
              tafsirTexts={tafsirTexts}
              translations={translations}
              frenchTexts={frenchTexts}
              isBookmarked={Boolean(existingBm)}
              bookmarkCategory={existingBm ? getBookmarkCategory(existingBm) : undefined}
              isPlayingThisVerse={
                player.isPlaying &&
                player.activeSurah === selectedVerse.surah &&
                player.activeAyah === selectedVerse.ayah
              }
              hifzRepeatTarget={player.hifzRepeatTarget}
              hifzRepeatDone={player.hifzRepeatDone}
              onClose={() => setSelectedVerse(null)}
              onRequestFrenchTranslation={ensureFrenchTranslationLoaded}
              onPlayAyahWithRepeat={(s, a, repeat) =>
                void player.playVerseWithRepeat(s, a, repeat)
              }
              onSelectHifzRepeat={player.setHifzRepeatTarget}
              onSetBookmarkCategory={handleSetBookmarkCategory}
              onToggleBookmark={handleToggleBookmark}
            />
          );
        })()}

        {showSearch && (
          <SearchModal
            lang={lang}
            t={t}
            isOpen={showSearch}
            verses={searchVerses.length > 0 ? searchVerses : pageVerses}
            surahs={surahs}
            translations={translations}
            frenchTexts={frenchTexts}
            onClose={() => setShowSearch(false)}
            onSelectResult={handleSearchResult}
          />
        )}

        {showInstallModal && (
          <InstallModal
            lang={lang}
            t={t}
            isOpen={showInstallModal}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            isIOS={isIOS}
            onClose={() => setShowInstallModal(false)}
            onTriggerNativeInstall={triggerNativeInstall}
          />
        )}

        {showHeartModal && (
          <HeartGuideModal
            isOpen={showHeartModal}
            lang={lang}
            t={t}
            onClose={() => setShowHeartModal(false)}
            onPlayAyah={(s, a) => void player.playVerse(s, a)}
            onOpenSurah={openSurah}
          />
        )}

        {showOnboarding && (
          <OnboardingModal
            isOpen={showOnboarding}
            lang={lang}
            t={t}
            riwayat={settings.riwayat}
            reciterId={settings.reciterId}
            onChangeLang={(nextLang) => setLang(nextLang)}
            onChangeRiwayat={(riwayat) => updateSettings({riwayat})}
            onChangeReciter={(reciterId) => updateSettings({reciterId})}
            onComplete={completeOnboarding}
          />
        )}

        {showNotifications && (
          <NotificationsModal
            isOpen={showNotifications}
            lang={lang}
            t={t}
            permission={khatma.permission}
            plan={khatma.plan}
            channelPrefs={khatma.channelPrefs}
            onClose={() => setShowNotifications(false)}
            onEnsurePermission={khatma.ensureNotificationPermission}
            onToggleReminder={khatma.toggleReminder}
            onChangeReminderTime={khatma.setReminderTime}
            onToggleFridayKahf={khatma.toggleFridayKahf}
            onTogglePrayerAlerts={khatma.togglePrayerAlerts}
            onToggleAdhkarAlerts={khatma.toggleAdhkarAlerts}
            onSendTestNotification={khatma.sendReminderNow}
          />
        )}
      </Suspense>
    </div>
  );
}
