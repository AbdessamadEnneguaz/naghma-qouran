import {useCallback, useEffect, useMemo, useState} from 'react';
import {AlertCircle, Bell, Loader2, RefreshCw, WifiOff, X} from 'lucide-react';
import type {
  BookmarkEntry,
  LastReadState,
  OfflineSurahRecord,
  QuranVerse,
  ReaderSettings,
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
  loadReciterSyncOffset,
  loadSettings,
  saveBookmarks,
  saveLastRead,
  saveReciterSyncOffset,
  saveSettings,
} from './services/indexedDbVault';
import {
  getVerseTextByRiwayat,
  loadCoreQuranBundle,
  loadEnglishTranslation,
  loadTafsirMuyassar,
  loadWarshTexts,
} from './services/quranLoader';
import {
  clampPage,
  normalizeSpeechWord,
  stripLeadingBismillah,
  tokenizeVerseWords,
  type PageWordTarget,
} from './utils/quranLogic';
import {
  parseRouteFromLocation,
  routeToPath,
  type AppRoute,
} from './utils/routing';
import {useAudioPlayer} from './hooks/useAudioPlayer';
import {useAppUpdater} from './hooks/useAppUpdater';
import {useKhatmaReminders} from './hooks/useKhatmaReminders';
import {useOnlineStatus, usePWAInstall} from './hooks/usePWAInstall';
import {useVoiceRecitation} from './hooks/useVoiceRecitation';
import {TRANSLATIONS, type AppLang} from './i18n/translations';
import {Header} from './components/Header';
import {HomeView} from './components/HomeView';
import {MushafView} from './components/MushafView';
import {SurahsPage} from './components/SurahsPage';
import {QiblaPage} from './components/QiblaPage';
import {AdhkarPage} from './components/AdhkarPage';
import {KhatmaPage} from './components/KhatmaPage';
import {DownloadApkPage} from './components/DownloadApkPage';
import {VaultView} from './components/VaultView';
import {AudioPlayerBar} from './components/AudioPlayerBar';
import {MobileBottomNav} from './components/MobileBottomNav';
import {MobileMenuDrawer} from './components/MobileMenuDrawer';
import {TafsirDrawer} from './components/TafsirDrawer';
import {SearchModal} from './components/SearchModal';
import {InstallModal} from './components/InstallModal';
import {HeartGuideModal} from './components/HeartGuideModal';
import {SplashScreen} from './components/SplashScreen';

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  riwayat: 'hafs',
  font: 'amiri',
  fontSize: 26,
  lineHeight: 2.4,
  showTranslation: false,
  readerMode: 'mushaf',
  reciterId: 'hafs_alafasy',
  playbackSpeed: 1,
  audioSyncOffsetSec: 0,
};

function getInitialLang(): AppLang {
  try {
    const saved =
      localStorage.getItem('najm_lang') ||
      localStorage.getItem('naghma_lang') ||
      localStorage.getItem('noor_lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // ignore storage access issues
  }
  return 'en';
}

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  return parseRouteFromLocation(window.location.pathname, window.location.hash);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [warshTexts, setWarshTexts] = useState<string[] | null>(null);
  const [tafsirTexts, setTafsirTexts] = useState<string[] | null>(null);
  const [translations, setTranslations] = useState<string[] | null>(null);

  const [lang, setLang] = useState<AppLang>(getInitialLang);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [lastRead, setLastRead] = useState<LastReadState | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [highlightedAyahKey, setHighlightedAyahKey] = useState<string | null>(null);

  // Tarteel Focus, Hifz Mask & Live Voice Follow state
  const [focusMode, setFocusMode] = useState(false);
  const [hifzMode, setHifzMode] = useState(false);
  const [hifzFirstWordHint, setHifzFirstWordHint] = useState(false);
  const [revealedAyahKeys, setRevealedAyahKeys] = useState<Set<string>>(() => new Set());

  const [showSearch, setShowSearch] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showHeartModal, setShowHeartModal] = useState(false);
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

  const isOnline = useOnlineStatus();
  const {isInstallable, isInstalled, isIOS, triggerNativeInstall} = usePWAInstall();
  const updater = useAppUpdater();
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

  // Listen for browser Back/Forward navigation
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

  // Load saved preferences + core Quran bundle on startup
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [savedSettings, savedLastRead, savedBookmarks, core] = await Promise.all([
          loadSettings(),
          loadLastRead(),
          loadBookmarks(),
          loadCoreQuranBundle(),
        ]);

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
        setSurahs(core.surahs);
        setVerses(core.hafsVerses);
        setBookmarks(savedBookmarks);

        if (savedLastRead) {
          setLastRead(savedLastRead);
          setCurrentPage(savedLastRead.page);
          setCurrentSurahId(savedLastRead.surah);
        }

        setLoading(false);

        Promise.all([
          loadWarshTexts().then((w) => {
            if (!cancelled) setWarshTexts(w);
          }),
          loadTafsirMuyassar().then((tf) => {
            if (!cancelled) setTafsirTexts(tf);
          }),
          loadEnglishTranslation().then((tr) => {
            if (!cancelled) setTranslations(tr);
          }),
        ])
          .then(() => {
            if (!cancelled) void refreshVaultStats();
          })
          .catch(() => {
            // Optional secondary caches fail softly if offline on very first un-cached visit
          });

        void refreshVaultStats();
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
    };
  }, [refreshVaultStats]);

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
      metaTheme.setAttribute('content', settings.theme === 'dark' ? '#17110D' : '#FDFBF7');
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

  // Build flattened word targets strictly for current Mushaf page (1..604)
  const activePageKey = `page:${currentPage}:${settings.riwayat}`;

  const pageWords = useMemo<PageWordTarget[]>(() => {
    const pageVerses = verses.filter((v) => v.page === currentPage);
    const list: PageWordTarget[] = [];
    for (const v of pageVerses) {
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
  }, [verses, currentPage, settings.riwayat, warshTexts]);

  const voice = useVoiceRecitation({
    pageWords,
    pageKey: activePageKey,
    t,
  });

  // Sync reader page & highlight when audio advances verse-by-verse
  const handleAudioVerseChange = useCallback(
    (verse: QuranVerse) => {
      setHighlightedAyahKey(`${verse.surah}:${verse.ayah}`);
      setCurrentPage(verse.page);
      setCurrentSurahId(verse.surah);
      persistLastRead(verse.surah, verse.ayah, verse.page, 'mushaf');
    },
    [persistLastRead]
  );

  const player = useAudioPlayer({
    verses,
    surahs,
    reciter: activeReciter,
    playbackSpeed: settings.playbackSpeed,
    audioSyncOffsetSec: settings.audioSyncOffsetSec ?? 0,
    onActiveVerseChange: handleAudioVerseChange,
  });

  useEffect(() => {
    setRevealedAyahKeys(new Set());
  }, [activePageKey]);

  const openPage = useCallback(
    (page: number) => {
      const clamped = clampPage(page);
      const firstOnPage = verses.find((v) => v.page === clamped);
      setCurrentPage(clamped);
      if (firstOnPage) {
        setCurrentSurahId(firstOnPage.surah);
        persistLastRead(firstOnPage.surah, firstOnPage.ayah, clamped, 'mushaf');
      }
      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');
    },
    [verses, persistLastRead, updateSettings, navigateToRoute]
  );

  const openSurah = useCallback(
    (surahId: number, ayah = 1) => {
      const target =
        verses.find((v) => v.surah === surahId && v.ayah === ayah) ||
        verses.find((v) => v.surah === surahId);
      const sMeta = surahs.find((s) => s.id === surahId);
      const targetPage = clampPage(target?.page ?? sMeta?.startPage ?? 1);
      setCurrentSurahId(surahId);
      setCurrentPage(targetPage);
      if (target) {
        setHighlightedAyahKey(`${target.surah}:${target.ayah}`);
        persistLastRead(target.surah, target.ayah, targetPage, 'mushaf');
      }
      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');
    },
    [verses, surahs, persistLastRead, updateSettings, navigateToRoute]
  );

  const handleSearchResult = useCallback(
    (res: SearchResult) => {
      const clamped = clampPage(res.page);
      setCurrentSurahId(res.surah);
      setCurrentPage(clamped);
      setHighlightedAyahKey(`${res.surah}:${res.ayah}`);
      persistLastRead(res.surah, res.ayah, clamped, 'mushaf');
      updateSettings({readerMode: 'mushaf'});
      navigateToRoute('mushaf');
    },
    [persistLastRead, updateSettings, navigateToRoute]
  );

  const handleToggleBookmark = useCallback(
    (verse: QuranVerse) => {
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
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#17110D] flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          <div className="text-center space-y-1">
            <p className="font-quran-scheherazade text-2xl text-[#B45309] dark:text-[#FBBF24]">
              نَجم القرآن · المصحف الشريف
            </p>
            <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">
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
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#17110D] flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <p className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE]">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-[#D97706] px-5 py-2 text-xs font-semibold text-white"
        >
          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  const isMushafFocus = activeRoute === 'mushaf' && focusMode;
  const hideAudioBarOnMobileIdle =
    activeRoute !== 'mushaf' && !player.hasStarted && !player.isPlaying && !voice.isListening;

  return (
    <div className="min-h-screen text-[#2D231E] dark:text-[#FAF5EE] transition-colors">
      <SplashScreen isDataReady={!loading} />
      <Header
        activeRoute={activeRoute}
        lang={lang}
        t={t}
        theme={settings.theme}
        hidden={isMushafFocus}
        isInstalled={isInstalled}
        onNavigate={navigateToRoute}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        onToggleTheme={() => updateSettings({theme: settings.theme === 'dark' ? 'light' : 'dark'})}
      />

      {updater.updateAvailable && !dismissedUpdateBanner && !isMushafFocus && (
        <div
          role="status"
          data-testid="ota-update-banner"
          className="bg-amber-500/14 border-b border-amber-500/25 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center gap-3"
        >
          <span>
            {lang === 'ar' ? 'يتوفر تحديث جديد للتطبيق' : 'A new update is ready'}
          </span>
          <button
            type="button"
            onClick={() => void updater.applyUpdateNow()}
            className="inline-flex items-center gap-1 rounded-full bg-[#D97706] px-3 py-1 text-[11px] font-bold text-white hover:opacity-90"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{lang === 'ar' ? 'تحديث الآن' : 'Update Now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissedUpdateBanner(true)}
            aria-label={t.closeWord}
            className="p-0.5 rounded opacity-75 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!isOnline && !isMushafFocus && (
        <div className="bg-amber-500/12 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs font-medium text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {khatma.toastPreview && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 end-3 sm:end-6 z-50 w-[calc(100%-1.5rem)] max-w-sm rounded-3xl border border-amber-500/30 bg-white/95 dark:bg-[#211914]/95 backdrop-blur-md p-3.5 shadow-2xl flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-2xl bg-amber-500/15 text-[#D97706] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-bold text-[#2D231E] dark:text-[#FAF5EE]">
              {khatma.toastPreview.title}
            </p>
            <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] leading-relaxed">
              {khatma.toastPreview.body}
            </p>
          </div>
          <button
            type="button"
            onClick={khatma.dismissToast}
            aria-label={t.closeWord}
            className="p-1 rounded-full text-[#6E5649] hover:text-[#2D231E]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <main>
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
            talqeenPauseSeconds={player.talqeen.pauseSeconds}
            isInstalled={isInstalled}
            onChangeRiwayat={(riwayat) => updateSettings({riwayat})}
            onOpenSurah={openSurah}
            onOpenPage={openPage}
            onOpenSearch={() => setShowSearch(true)}
            onOpenAllSurahs={() => navigateToRoute('surahs')}
            onOpenVault={() => navigateToRoute('vault')}
            onOpenKhatma={() => navigateToRoute('khatma')}
            onOpenAdhkar={() => navigateToRoute('adhkar')}
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

        {activeRoute === 'surahs' && (
          <SurahsPage
            lang={lang}
            t={t}
            surahs={surahs}
            bookmarks={bookmarks}
            offlineRecords={offlineRecords}
            onOpenSurah={openSurah}
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
            onChangeReminderTime={khatma.setReminderTime}
            onSendTestReminder={khatma.sendReminderNow}
            onOpenMushafPage={openPage}
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
            verses={verses}
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
      </main>

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
        settings={settings}
        offlineRecords={offlineRecords}
        downloadProgress={downloadProgress}
        focusMode={isMushafFocus}
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
        onUpdateTalqeen={player.updateTalqeen}
        onSkipTalqeenPause={player.skipTalqeenPause}
        onOpenInstall={() => navigateToRoute('download')}
      />

      <MobileBottomNav
        activeRoute={activeRoute}
        t={t}
        hidden={isMushafFocus}
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
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        onCheckUpdates={() => void updater.checkForUpdates(true)}
        onApplyUpdate={() => void updater.applyUpdateNow()}
      />

      <TafsirDrawer
        lang={lang}
        t={t}
        verse={selectedVerse}
        surahMeta={surahs.find((s) => s.id === selectedVerse?.surah)}
        riwayat={settings.riwayat}
        warshTexts={warshTexts}
        tafsirTexts={tafsirTexts}
        translations={translations}
        isBookmarked={
          !!selectedVerse &&
          bookmarks.some((b) => b.id === `${selectedVerse.surah}:${selectedVerse.ayah}`)
        }
        onClose={() => setSelectedVerse(null)}
        onPlayAyah={(s, a) => void player.playVerse(s, a)}
        onToggleBookmark={handleToggleBookmark}
      />

      <SearchModal
        lang={lang}
        t={t}
        isOpen={showSearch}
        verses={verses}
        surahs={surahs}
        translations={translations}
        onClose={() => setShowSearch(false)}
        onSelectResult={handleSearchResult}
      />

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

      <HeartGuideModal
        isOpen={showHeartModal}
        lang={lang}
        t={t}
        onClose={() => setShowHeartModal(false)}
        onPlayAyah={(s, a) => void player.playVerse(s, a)}
        onOpenSurah={openSurah}
      />
    </div>
  );
}
