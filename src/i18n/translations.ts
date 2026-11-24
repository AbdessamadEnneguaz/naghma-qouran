export type AppLang = 'en' | 'ar' | 'fr';

export interface Translations {
  appName: string;
  navHome: string;
  navSurahs: string;
  navMushaf: string;
  navQibla: string;
  navAdhkar: string;
  navKhatma: string;
  navVault: string;
  navPrivacy: string;
  navMore: string;
  footerCraftedBy: string;
  footerCopyright: string;
  mobileMenuTitle: string;
  mobileThemeLabel: string;
  mobileLangLabel: string;
  browseAllSurahsBtn: string;
  allJuzFilter: string;
  langToggleLabel: string;
  themeToLight: string;
  themeToDark: string;
  offlineBanner: string;
  // Home & Hero & Reading Streak
  lastReadLabel: string;
  continueReading: string;
  beginRecitation: string;
  resumePage: string;
  openMushafPage1: string;
  dailyWird: string;
  searchBtn: string;
  narrationLabel: string;
  hafsLabel: string;
  warshLabel: string;
  surahsCached: string;
  jumpToPageLabel: string;
  jumpPlaceholder: string;
  goBtn: string;
  quickOpen: string;
  readingStreakTitle: string;
  streakDaysUnit: string;
  pagesTodayLabel: string;
  totalPagesReadLabel: string;
  tabSurahs: string;
  tabJuz: string;
  tabBookmarks: string;
  filterSurahPlaceholder: string;
  filterAll: string;
  filterMeccan: string;
  filterMedinan: string;
  meccan: string;
  medinan: string;
  ayahsWord: string;
  pageShort: string;
  juzWord: string;
  startsAtPage: string;
  noBookmarksTitle: string;
  noBookmarksDesc: string;
  noSurahMatch: string;
  offlineTag: string;
  // Bookmark Categories
  bookmarkCategoryLabel: string;
  catWird: string;
  catMemorization: string;
  catFavorites: string;
  // Prayer Times & Smart Features
  prayerTimesTitle: string;
  remainingTimeLabel: string;
  smartFeaturesTitle: string;
  featureReminder: string;
  featureMemorize: string;
  featureRuqyah: string;
  featureDuaQa: string;
  // Qibla Finder
  qiblaTitle: string;
  qiblaAngleLabel: string;
  useGpsBtn: string;
  selectCityLabel: string;
  compassCalibrationHint: string;
  // Mushaf Reader & Sliding Mode Toggle
  modeQuran: string;
  modeSurah: string;
  modeJuz: string;
  modePage: string;
  backToSurahs: string;
  mushafPageMode: string;
  surahViewMode: string;
  downloadSurahOffline: string;
  offlineShort: string;
  offlineReady: string;
  displaySettings: string;
  arabicFontSize: string;
  lineSpacing: string;
  uthmaniTypeface: string;
  englishTranslation: string;
  translationVisible: string;
  translationHidden: string;
  madaniMushaf: string;
  pageWord: string;
  ofWord: string;
  versesWord: string;
  playSurah: string;
  nextPage: string;
  prevPage: string;
  nextSurah: string;
  prevSurah: string;
  surahWord: string;
  // Tap-Ayah & Verse Sheet Actions
  playFromHere: string;
  bookmark: string;
  bookmarked: string;
  tafsir: string;
  copy: string;
  copied: string;
  shareWord: string;
  // Audio Player
  fullSurah: string;
  repeatOff: string;
  repeatAyah: string;
  repeatSurah: string;
  repeatShort: string;
  reciterLabel: string;
  sleepTimerOff: string;
  minutesUnit: string;
  endOfSurah: string;
  elapsed: string;
  duration: string;
  warshGroup: string;
  hafsGroup: string;
  audioSyncOffsetLabel: string;
  resetOffsetLabel: string;
  wakeLockLabel: string;
  wakeLockActive: string;
  wakeLockOff: string;
  wakeLockDesc: string;
  // Verse Bottom Sheet (Tafsir / EN / FR / Hifz Loop / Share Card)
  tafsirMuyassarTab: string;
  englishTranslationTab: string;
  frenchTranslationTab: string;
  listenAyah: string;
  loadingTafsir: string;
  loadingTranslation: string;
  loadingFrenchTranslation: string;
  hifzRepeatLabel: string;
  shareCardBtn: string;
  cardFormatStory: string;
  cardFormatSquare: string;
  // Search Modal
  searchPlaceholder: string;
  clear: string;
  searchShortcutsTitle: string;
  searchFooterNote: string;
  noSearchMatch: string;
  matchesFound: string;
  // Vault View
  vaultTitle: string;
  vaultSubtitle: string;
  quranTextStoredTitle: string;
  quranTextStoredDesc: string;
  audioCachedLabel: string;
  totalStorageLabel: string;
  quickDownloadFor: string;
  saveBtn: string;
  savedBtn: string;
  savedAudioTitle: string;
  clearAllAudio: string;
  noAudioSavedDesc: string;
  installAppTitle: string;
  installAppDesc: string;
  installNowBtn: string;
  installedStandalone: string;
  downloadApkBtn: string;
  downloadApkHeroCta: string;
  downloadApkTitle: string;
  downloadApkDesc: string;
  downloadApkCta: string;
  downloadPageHeading: string;
  downloadPageSubheading: string;
  downloadVersionMeta: string;
  downloadHighlightsTitle: string;
  downloadHighlight1: string;
  downloadHighlight2: string;
  downloadHighlight3: string;
  downloadHighlight4: string;
  downloadAndroidStudioTitle: string;
  downloadAndroidStudioDesc: string;
  apkStep1: string;
  apkStep2: string;
  apkStep3: string;
  // Hifz, Voice Recite & Focus Mode
  hifzMode: string;
  hifzActiveBanner: string;
  hifzHintLabel: string;
  revealAll: string;
  hideAll: string;
  micRecite: string;
  micListening: string;
  micStop: string;
  micUnsupported: string;
  micPermissionDenied: string;
  micMatchedWords: string;
  micSkippedHint: string;
  focusModeHint: string;
  exitFocus: string;
  settingsBtn: string;
  playReciter: string;
  pauseReciter: string;
  closeWord: string;
  prevWord: string;
  nextWord: string;
  // Bento Feature Hub
  bentoSectionTitle: string;
  bentoKhatmaTitle: string;
  bentoKhatmaSubtitle: string;
  bentoAdhkarTitle: string;
  bentoAdhkarSubtitle: string;
  bentoTalqeenTitle: string;
  bentoTalqeenSubtitle: string;
  bentoHeartTitle: string;
  bentoHeartSubtitle: string;
  // Khatma & Notifications (Daily Wird + Friday Al-Kahf)
  khatmaTitle: string;
  khatmaSubtitle: string;
  khatmaGoalDuration: string;
  daysUnit: string;
  customDaysLabel: string;
  applyBtn: string;
  daysRemainingLabel: string;
  paceAhead: string;
  paceOnTrack: string;
  paceAdaptiveCatchup: string;
  khatmaCompletedLabel: string;
  todayWirdDone: string;
  openTodayPagesBtn: string;
  markTodayDoneBtn: string;
  logCustomPagesLabel: string;
  addPagesBtn: string;
  resetKhatmaBtn: string;
  dailyReminderTitle: string;
  dailyReminderDesc: string;
  enableReminderBtn: string;
  reminderEnabledLabel: string;
  reminderTimeLabel: string;
  sendTestReminderBtn: string;
  testReminderSent: string;
  notificationBlockedHint: string;
  fridayKahfTitle: string;
  fridayKahfDesc: string;
  openKahfBtn: string;
  testKahfBtn: string;
  // Adhkar & Tasbih
  adhkarTitle: string;
  adhkarSabah: string;
  adhkarMasaa: string;
  adhkarPostPrayer: string;
  completedWord: string;
  resetAdhkarBtn: string;
  tapToCountHint: string;
  dhikrCompletedHint: string;
  allAdhkarDone: string;
  // Talqeen
  talqeenTitle: string;
  talqeenDesc: string;
  talqeenEnabled: string;
  talqeenOff: string;
  talqeenRangeLabel: string;
  talqeenToWord: string;
  talqeenPauseLabel: string;
  talqeenPromptPrefix: string;
  talqeenSkipPause: string;
  talqeenSwitchAyahNote: string;
  // Heart Ayah Guide & Story Cards
  heartGuideTitle: string;
  saveStoryCardBtn: string;
  openInMushafBtn: string;
  storyCardReadyTitle: string;
  storyCardReadyDesc: string;
  downloadPngAgain: string;
  // First-Launch Onboarding
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingStep1: string;
  onboardingStep2: string;
  onboardingStep3: string;
  onboardingNext: string;
  onboardingSkip: string;
  onboardingStart: string;
  // Mushaf Quick Settings Bottom Sheet
  quickSettingsTitle: string;
  themeWarmDay: string;
  themeNightComfort: string;
  fontSizeLabel: string;
  reciterSelectLabel: string;
  swipeDownToCloseHint: string;
  // Home Features Showcase
  featuresShowcaseTitle: string;
  showcaseMushafTitle: string;
  showcaseMushafDesc: string;
  showcaseAudioTitle: string;
  showcaseAudioDesc: string;
  showcaseHifzTitle: string;
  showcaseHifzDesc: string;
  showcaseQiblaTitle: string;
  showcaseQiblaDesc: string;
  showcaseDailyTitle: string;
  showcaseDailyDesc: string;
  apkUninstallTip: string;
}

export const TRANSLATIONS: Record<AppLang, Translations> = {
  en: {
    appName: 'Mihrab Noor',
    navHome: 'Home',
    navSurahs: 'Surahs',
    navMushaf: 'Quran',
    navQibla: 'Qibla',
    navAdhkar: 'Tasbih',
    navKhatma: 'Khatma',
    navVault: 'Vault',
    navPrivacy: 'Privacy Policy',
    navMore: 'More',
    footerCraftedBy: 'Crafted & Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد',
    footerCopyright:
      '© 2026 Mihrab Noor (مِحْرَاب النُّور). Crafted & Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد',
    mobileMenuTitle: 'Mihrab Noor Menu',
    mobileThemeLabel: 'Appearance',
    mobileLangLabel: 'Language',
    browseAllSurahsBtn: 'Browse Surahs',
    allJuzFilter: "All Juz'",
    langToggleLabel: 'FR',
    themeToLight: 'Switch to Warm Sand light mode',
    themeToDark: 'Switch to Warm Espresso dark mode',
    offlineBanner: 'Offline Mode — Reading from local IndexedDB Quran Vault',
    lastReadLabel: 'Last Read',
    continueReading: 'Last Read',
    beginRecitation: 'Last Read',
    resumePage: 'Resume Reading',
    openMushafPage1: 'Open Quran',
    dailyWird: 'Daily Wird · Al-Kahf',
    searchBtn: 'Search',
    narrationLabel: 'Narration · الرواية',
    hafsLabel: "Hafs 'an 'Asim · حفص",
    warshLabel: "Warsh 'an Nafi' · ورش",
    surahsCached: 'Surahs Cached',
    jumpToPageLabel: 'Jump to Mushaf Page (1 – 604)',
    jumpPlaceholder: 'Page 1–604',
    goBtn: 'Go',
    quickOpen: 'Quick Open:',
    readingStreakTitle: 'Reading Streak',
    streakDaysUnit: 'days',
    pagesTodayLabel: 'Today',
    totalPagesReadLabel: 'Pages Read',
    tabSurahs: '114 Surahs',
    tabJuz: "30 Juz'",
    tabBookmarks: 'Bookmarks',
    filterSurahPlaceholder: 'Filter Surah name or #...',
    filterAll: 'All',
    filterMeccan: 'Meccan',
    filterMedinan: 'Medinan',
    meccan: 'Meccan',
    medinan: 'Medinan',
    ayahsWord: 'Ayahs',
    pageShort: 'p.',
    juzWord: "Juz'",
    startsAtPage: 'Starts at Page',
    noBookmarksTitle: 'No bookmarks saved yet',
    noBookmarksDesc: 'Tap any Ayah while reading to bookmark it offline.',
    noSurahMatch: 'No Surahs matched your filter.',
    offlineTag: 'Offline',
    bookmarkCategoryLabel: 'Category',
    catWird: 'Daily Wird',
    catMemorization: 'Memorization',
    catFavorites: 'Favorites',
    prayerTimesTitle: 'Prayer Times',
    remainingTimeLabel: 'Remaining Time',
    smartFeaturesTitle: 'Smart Features',
    featureReminder: 'Reminder',
    featureMemorize: 'Memorize',
    featureRuqyah: 'Ruqyah',
    featureDuaQa: 'Dua & Adhkar',
    qiblaTitle: 'Qibla Finder',
    qiblaAngleLabel: "Device's angle to qibla",
    useGpsBtn: 'Use Live GPS',
    selectCityLabel: 'City',
    compassCalibrationHint: 'Rotate compass dial or enable device sensors',
    modeQuran: 'Quran',
    modeSurah: 'Surah',
    modeJuz: 'Juz',
    modePage: 'Page',
    backToSurahs: 'Back to Surahs',
    mushafPageMode: 'Mushaf Page',
    surahViewMode: 'Surah View',
    downloadSurahOffline: 'Download Surah Offline',
    offlineShort: 'Offline',
    offlineReady: 'Offline Ready',
    displaySettings: 'Display Settings',
    arabicFontSize: 'Arabic Font Size',
    lineSpacing: 'Line Spacing',
    uthmaniTypeface: 'Uthmani Typeface',
    englishTranslation: 'English Translation',
    translationVisible: 'Translation: Visible',
    translationHidden: 'Translation: Hidden',
    madaniMushaf: 'Madani Mushaf',
    pageWord: 'Page',
    ofWord: 'of',
    versesWord: 'Verses',
    playSurah: 'Play Surah',
    nextPage: 'Next Page',
    prevPage: 'Prev Page',
    nextSurah: 'Next Surah',
    prevSurah: 'Prev Surah',
    surahWord: 'Surah',
    playFromHere: 'Play',
    bookmark: 'Bookmark',
    bookmarked: 'Saved',
    tafsir: 'Tafsir',
    copy: 'Copy',
    copied: 'Copied',
    shareWord: 'Share',
    fullSurah: 'Full Surah',
    repeatOff: 'Repeat: Off',
    repeatAyah: 'Repeat Ayah',
    repeatSurah: 'Repeat Surah',
    repeatShort: 'Repeat',
    reciterLabel: 'Reciter (Warsh & Hafs)',
    sleepTimerOff: 'Sleep Timer: Off',
    minutesUnit: 'min',
    endOfSurah: 'End of Surah',
    elapsed: 'Elapsed',
    duration: 'Duration',
    warshGroup: "Warsh 'an Nafi' (ورش عن نافع)",
    hafsGroup: "Hafs 'an 'Asim (حفص عن عاصم)",
    audioSyncOffsetLabel: 'Ayah Highlight Sync Offset',
    resetOffsetLabel: 'Reset',
    wakeLockLabel: 'Keep Screen On',
    wakeLockActive: 'Screen Awake: On',
    wakeLockOff: 'Screen Awake: Off',
    wakeLockDesc: 'Prevents screen sleep during long recitation sessions',
    tafsirMuyassarTab: 'التفسير الميسر',
    englishTranslationTab: 'English',
    frenchTranslationTab: 'Français',
    listenAyah: 'Listen Ayah',
    loadingTafsir: 'Loading Tafsir Al-Muyassar...',
    loadingTranslation: 'Loading English translation...',
    loadingFrenchTranslation: 'Loading French translation...',
    hifzRepeatLabel: 'Hifz Loop',
    shareCardBtn: 'Share Image Card',
    cardFormatStory: '9:16 Story',
    cardFormatSquare: '1:1 Post',
    searchPlaceholder: 'Search Arabic (no tashkeel needed), English, 2:255, or p:604...',
    clear: 'Clear',
    searchShortcutsTitle: 'Instant Offline Search & Jump Shortcuts',
    searchFooterNote: 'Runs 100% locally in-memory across all 6,236 verses.',
    noSearchMatch: 'No verses or Surahs matched your query.',
    matchesFound: 'matches found',
    vaultTitle: 'Bookmarks & Offline Vault',
    vaultSubtitle: 'Manage saved Ayahs, offline audio files, and app installation',
    quranTextStoredTitle: 'Full Quran Text & 604-Page Mushaf Stored Offline',
    quranTextStoredDesc: '114 Surahs · 6,236 Verses · Hafs, Warsh & Tafsir Al-Muyassar cached in IndexedDB',
    audioCachedLabel: 'Audio Cached',
    totalStorageLabel: 'App Storage',
    quickDownloadFor: 'Quick Download for',
    saveBtn: 'Save',
    savedBtn: 'Saved',
    savedAudioTitle: 'Saved Offline Audio',
    clearAllAudio: 'Clear All Audio',
    noAudioSavedDesc: 'No MP3 recitations cached yet. Save any Surah above or inside the reader.',
    installAppTitle: 'Install Mihrab Noor (Android APK & PWA)',
    installAppDesc: 'Install Mihrab Noor as an offline standalone app on Android, desktop, or iOS.',
    installNowBtn: 'Install Web App',
    installedStandalone: 'Mihrab Noor is running in standalone installed mode.',
    downloadApkBtn: 'Download APK',
    downloadApkHeroCta: 'Download Android APK',
    downloadApkTitle: 'Android App (APK)',
    downloadApkDesc: 'Download the Android APK for offline reading, prayer times, and Qibla compass.',
    downloadApkCta: 'Download mihrab-noor.apk',
    downloadPageHeading: 'Mihrab Noor for Android',
    downloadPageSubheading:
      'Carry the complete 604-page Madani Mushaf, Hafs & Warsh narrations, Prayer Times, Qibla compass, and Adhkar offline on Android.',
    downloadVersionMeta: 'v3.0.0 · Free · 11.1 MB · Live OTA Updates',
    downloadHighlightsTitle: 'Built for Serene Daily Recitation',
    downloadHighlight1: '604-Page Madani Mushaf with zero-gap Hafs & Warsh audio',
    downloadHighlight2: 'Accurate Qibla Compass & astronomical Prayer Times',
    downloadHighlight3: 'Morning, Evening & Post-Prayer Adhkar with tactile Tasbih',
    downloadHighlight4: 'Smart Khatma planner with daily reminder alerts',
    downloadAndroidStudioTitle: 'Capacitor & Android Studio Ready',
    downloadAndroidStudioDesc:
      'Preconfigured capacitor.config.json (com.mihrabnoor.app) with custom Mihrab Noor icons to build a signed APK.',
    apkStep1: '1. Tap Download mihrab-noor.apk to save the Android installer package.',
    apkStep2: '2. Open the downloaded file and allow "Install unknown apps" for your browser if prompted.',
    apkStep3: '3. Tap Install and launch Mihrab Noor directly from your home screen.',
    hifzMode: 'Hifz Mask',
    hifzActiveBanner: 'Hifz Mode · Tap any veiled Ayah to peek or recite aloud',
    hifzHintLabel: 'First-Word Hint',
    revealAll: 'Reveal All',
    hideAll: 'Mask Page',
    micRecite: 'Recite',
    micListening: 'Listening (ar-SA)... Recite aloud',
    micStop: 'Stop Mic',
    micUnsupported: 'Live voice recognition is not supported in this browser. Try Chrome, Edge, or Android WebView.',
    micPermissionDenied: 'Microphone permission was denied or is unavailable. Check browser permissions to recite aloud.',
    micMatchedWords: 'matched',
    micSkippedHint: 'Word skipped or differed — check highlighted word',
    focusModeHint: 'Tap page to exit focus mode',
    exitFocus: 'Exit Focus',
    settingsBtn: 'Settings',
    playReciter: 'Play Reciter',
    pauseReciter: 'Pause',
    closeWord: 'Close',
    prevWord: 'Prev',
    nextWord: 'Next',
    bentoSectionTitle: 'Daily Spiritual Workspace',
    bentoKhatmaTitle: 'Smart Khatma Planner',
    bentoKhatmaSubtitle: 'Adaptive daily target',
    bentoAdhkarTitle: 'Adhkar & Tasbih',
    bentoAdhkarSubtitle: 'Tap Tasbih & supplications',
    bentoTalqeenTitle: 'Talqeen Hifz',
    bentoTalqeenSubtitle: 'Listen & repeat pause loop',
    bentoHeartTitle: 'Verses for Your Heart',
    bentoHeartSubtitle: 'Mood guide & PNG Story cards',
    khatmaTitle: 'Smart Adaptive Khatma Planner',
    khatmaSubtitle: 'Auto-recalculates remaining pages/day if you miss a day or read ahead',
    khatmaGoalDuration: 'Khatma Goal Duration',
    daysUnit: 'days',
    customDaysLabel: 'Custom days',
    applyBtn: 'Set',
    daysRemainingLabel: 'days left',
    paceAhead: 'Ahead of schedule',
    paceOnTrack: 'On track',
    paceAdaptiveCatchup: 'Recalculated pace',
    khatmaCompletedLabel: 'Khatma completed',
    todayWirdDone: 'Alhamdulillah! Today’s daily pages are complete.',
    openTodayPagesBtn: 'Open Mushaf Page',
    markTodayDoneBtn: 'Mark Today Complete',
    logCustomPagesLabel: 'Log custom pages read',
    addPagesBtn: 'Log Pages',
    resetKhatmaBtn: 'Reset Khatma plan',
    dailyReminderTitle: 'Daily Khatma Push Reminder',
    dailyReminderDesc: 'Works via Browser & PWA Service Worker notifications',
    enableReminderBtn: 'Enable Reminder',
    reminderEnabledLabel: 'Reminder Active',
    reminderTimeLabel: 'Preferred time',
    sendTestReminderBtn: 'Send Test Reminder',
    testReminderSent: 'Reminder preview triggered!',
    notificationBlockedHint: 'Browser notifications are blocked in settings — in-app toast preview displayed.',
    fridayKahfTitle: 'Friday Surah Al-Kahf Reminder',
    fridayKahfDesc: 'Weekly Friday morning reminder to recite Surah Al-Kahf',
    openKahfBtn: 'Read Al-Kahf',
    testKahfBtn: 'Preview Al-Kahf Alert',
    adhkarTitle: 'Adhkar & Interactive Tasbih',
    adhkarSabah: 'Morning',
    adhkarMasaa: 'Evening',
    adhkarPostPrayer: 'Post-Prayer',
    completedWord: 'completed',
    resetAdhkarBtn: 'Reset category counters',
    tapToCountHint: 'Tap anywhere on card to count',
    dhikrCompletedHint: 'Completed — tap to continue',
    allAdhkarDone: 'All Adhkar complete',
    talqeenTitle: 'Talqeen Mode (Listen & Repeat)',
    talqeenDesc: 'Loops an Ayah range with a configurable pause after each verse to repeat aloud',
    talqeenEnabled: 'Talqeen: On',
    talqeenOff: 'Talqeen: Off',
    talqeenRangeLabel: 'Ayah Range',
    talqeenToWord: 'to',
    talqeenPauseLabel: 'Repeat Pause',
    talqeenPromptPrefix: 'Repeat aloud · Next Ayah in',
    talqeenSkipPause: 'Next Now',
    talqeenSwitchAyahNote: 'Switch to an Ayah-by-Ayah reciter for verse-level Talqeen pauses.',
    heartGuideTitle: 'Verses for Your Heart & Ruqyah',
    saveStoryCardBtn: 'Save Story Card',
    openInMushafBtn: 'Open in Mushaf',
    storyCardReadyTitle: 'Desert Gold Story Card Exported',
    storyCardReadyDesc: '1080×1920 PNG saved locally for WhatsApp & Instagram',
    downloadPngAgain: 'Download PNG',
    onboardingTitle: 'Welcome to Mihrab Noor',
    onboardingSubtitle: 'Personalize your serene Quran workspace in three quick steps',
    onboardingStep1: 'Choose App Language',
    onboardingStep2: 'Choose Quran Narration',
    onboardingStep3: 'Pick Favorite Reciter',
    onboardingNext: 'Continue',
    onboardingSkip: 'Skip',
    onboardingStart: 'Start Reading',
    quickSettingsTitle: 'Quick Reader Settings',
    themeWarmDay: 'Warm Day',
    themeNightComfort: 'Night Comfort',
    fontSizeLabel: 'Font Size',
    reciterSelectLabel: 'Reciter',
    swipeDownToCloseHint: 'Swipe down to close',
    featuresShowcaseTitle: 'Everything in Mihrab Noor',
    showcaseMushafTitle: 'Offline 604-Page Mushaf',
    showcaseMushafDesc: 'Crystal-clear Uthmani script in Hafs & Warsh narrations, anytime offline.',
    showcaseAudioTitle: '32+ Reciters & Waveform Sync',
    showcaseAudioDesc: 'Seamless background audio with live verse highlight and lock-screen controls.',
    showcaseHifzTitle: 'Tafsir, Translation & Hifz Loop',
    showcaseHifzDesc: 'Tap any verse for Tafsir Al-Muyassar, repeat loops, and Story PNG cards.',
    showcaseQiblaTitle: 'Live Qibla & Prayer Times',
    showcaseQiblaDesc: 'Astronomical prayer countdowns and calibrated compass bearing on device.',
    showcaseDailyTitle: 'Instant Search, Adhkar & Khatma',
    showcaseDailyDesc: 'Tactile Tasbih, morning/evening Adhkar, and adaptive Khatma planner.',
    apkUninstallTip:
      'Updating from an older version? Uninstall any previous build first if Android shows a signature conflict.',
  },
  ar: {
    appName: 'مِحْرَاب النُّور',
    navHome: 'الرئيسية',
    navSurahs: 'السور',
    navMushaf: 'القرآن',
    navQibla: 'القبلة',
    navAdhkar: 'التسبيح',
    navKhatma: 'الختمة',
    navVault: 'المحفوظات',
    navPrivacy: 'سياسة الخصوصية',
    navMore: 'المزيد',
    footerCraftedBy: 'تطوير وتصميم: عبد الصمد النكاز · Crafted by Abdessamad Enneguaz',
    footerCopyright:
      '© 2026 Mihrab Noor (مِحْرَاب النُّور). Crafted & Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد',
    mobileMenuTitle: 'قائمة مِحْرَاب النُّور',
    mobileThemeLabel: 'المظهر',
    mobileLangLabel: 'اللغة',
    browseAllSurahsBtn: 'تصفح السور',
    allJuzFilter: 'كل الأجزاء',
    langToggleLabel: 'EN',
    themeToLight: 'التبديل إلى وضع الرمل الدافئ النهاري',
    themeToDark: 'التبديل إلى الوضع الدافئ الليلي',
    offlineBanner: 'وضع عدم الاتصال — القراءة من الذاكرة المحلية للمصحف',
    lastReadLabel: 'آخر قراءة',
    continueReading: 'آخر قراءة',
    beginRecitation: 'آخر قراءة',
    resumePage: 'متابعة القراءة',
    openMushafPage1: 'فتح القرآن',
    dailyWird: 'الورد اليومي · الكهف',
    searchBtn: 'بحث',
    narrationLabel: 'الرواية المعتمدة',
    hafsLabel: 'حفص عن عاصم',
    warshLabel: 'ورش عن نافع',
    surahsCached: 'سور محفوظة',
    jumpToPageLabel: 'الانتقال إلى صفحة المصحف (١ – ٦٠٤)',
    jumpPlaceholder: 'صفحة ١–٦٠٤',
    goBtn: 'انتقال',
    quickOpen: 'وصول سريع:',
    readingStreakTitle: 'سلسلة القراءة',
    streakDaysUnit: 'يوم',
    pagesTodayLabel: 'اليوم',
    totalPagesReadLabel: 'إجمالي الصفحات',
    tabSurahs: 'السور (١١٤)',
    tabJuz: 'الأجزاء (٣٠)',
    tabBookmarks: 'العلامات',
    filterSurahPlaceholder: 'ابحث باسم السورة أو رقمها...',
    filterAll: 'الكل',
    filterMeccan: 'مكية',
    filterMedinan: 'مدنية',
    meccan: 'مكية',
    medinan: 'مدنية',
    ayahsWord: 'آية',
    pageShort: 'ص',
    juzWord: 'الجزء',
    startsAtPage: 'تبدأ من صفحة',
    noBookmarksTitle: 'لا توجد علامات مرجعية محفوظة',
    noBookmarksDesc: 'اضغط على أي آية أثناء القراءة لحفظها والعودة إليها لاحقاً.',
    noSurahMatch: 'لا توجد سورة مطابقة للبحث.',
    offlineTag: 'محفوظة',
    bookmarkCategoryLabel: 'تصنيف العلامة',
    catWird: 'الورد اليومي',
    catMemorization: 'الحفظ',
    catFavorites: 'المفضلة',
    prayerTimesTitle: 'مواقيت الصلاة',
    remainingTimeLabel: 'الوقت المتبقي',
    smartFeaturesTitle: 'الأدوات الذكية',
    featureReminder: 'التذكير',
    featureMemorize: 'الحفظ',
    featureRuqyah: 'الرقية والسكينة',
    featureDuaQa: 'الأدعية والأذكار',
    qiblaTitle: 'بوصلة القبلة',
    qiblaAngleLabel: 'زاوية الجهاز نحو القبلة',
    useGpsBtn: 'تحديد موقعي GPS',
    selectCityLabel: 'المدينة',
    compassCalibrationHint: 'أدر قرص البوصلة أو فعّل مستشعرات الجهاز',
    modeQuran: 'القرآن',
    modeSurah: 'سورة',
    modeJuz: 'جزء',
    modePage: 'صفحة',
    backToSurahs: 'العودة للسور',
    mushafPageMode: 'صفحات المصحف',
    surahViewMode: 'عرض السورة',
    downloadSurahOffline: 'تحميل السورة دون إنترنت',
    offlineShort: 'تحميل',
    offlineReady: 'متاحة دون إنترنت',
    displaySettings: 'إعدادات الخط والعرض',
    arabicFontSize: 'حجم الخط العربي',
    lineSpacing: 'تباعد الأسطر',
    uthmaniTypeface: 'نوع الخط العثماني',
    englishTranslation: 'الترجمة الإنجليزية',
    translationVisible: 'الترجمة: ظاهرة',
    translationHidden: 'الترجمة: مخفية',
    madaniMushaf: 'مصحف المدينة المنورة',
    pageWord: 'صفحة',
    ofWord: 'من',
    versesWord: 'آيات',
    playSurah: 'استماع للسورة',
    nextPage: 'الصفحة التالية',
    prevPage: 'الصفحة السابقة',
    nextSurah: 'السورة التالية',
    prevSurah: 'السورة السابقة',
    surahWord: 'سورة',
    playFromHere: 'تشغيل',
    bookmark: 'حفظ',
    bookmarked: 'محفوظة',
    tafsir: 'التفسير',
    copy: 'نسخ',
    copied: 'تم النسخ',
    shareWord: 'مشاركة',
    fullSurah: 'السورة كاملة',
    repeatOff: 'التكرار: متوقف',
    repeatAyah: 'تكرار الآية',
    repeatSurah: 'تكرار السورة',
    repeatShort: 'تكرار',
    reciterLabel: 'اختر القارئ (ورش وحفص)',
    sleepTimerOff: 'مؤقت الإيقاف: متوقف',
    minutesUnit: 'دقيقة',
    endOfSurah: 'نهاية السورة',
    elapsed: 'المنقضي',
    duration: 'المدة',
    warshGroup: 'رواية ورش عن نافع',
    hafsGroup: 'رواية حفص عن عاصم',
    audioSyncOffsetLabel: 'ضبط تزامن تمييز الآيات',
    resetOffsetLabel: 'إعادة ضبط',
    wakeLockLabel: 'إبقاء الشاشة مضاءة',
    wakeLockActive: 'الشاشة مضاءة: مُفعّل',
    wakeLockOff: 'الشاشة مضاءة: متوقف',
    wakeLockDesc: 'يمنع انطفاء الشاشة تلقائياً أثناء القراءة والتلاوة',
    tafsirMuyassarTab: 'التفسير الميسر',
    englishTranslationTab: 'English',
    frenchTranslationTab: 'Français',
    listenAyah: 'سماع الآية',
    loadingTafsir: 'جارٍ تحميل التفسير الميسر...',
    loadingTranslation: 'جارٍ تحميل الترجمة الإنجليزية...',
    loadingFrenchTranslation: 'جارٍ تحميل الترجمة الفرنسية...',
    hifzRepeatLabel: 'تكرار الحفظ',
    shareCardBtn: 'بطاقة صورة للمشاركة',
    cardFormatStory: 'قصة ٩:١٦',
    cardFormatSquare: 'مربع ١:١',
    searchPlaceholder: 'ابحث في الآيات (بدون تشكيل) أو اكتب 2:255 أو p:604...',
    clear: 'مسح',
    searchShortcutsTitle: 'اختصارات البحث والانتقال الفوري',
    searchFooterNote: 'يعمل محلياً ١٠٠٪ عبر جميع الآيات (٦٢٣٦ آية) دون اتصال.',
    noSearchMatch: 'لم يتم العثور على آيات مطابقة.',
    matchesFound: 'نتيجة مطابقة',
    vaultTitle: 'العلامات المرجعية والمحفوظات',
    vaultSubtitle: 'إدارة الآيات المحفوظة وتنزيلات التلاوة الصوتية وتثبيت التطبيق',
    quranTextStoredTitle: 'نص القرآن الكريم كاملاً (٦٠٤ صفحة) محفوظ دون إنترنت',
    quranTextStoredDesc: '١١٤ سورة · ٦٢٣٦ آية · حفص وورش والتفسير الميسر محفوظة في IndexedDB',
    audioCachedLabel: 'الصوتيات المحفوظة',
    totalStorageLabel: 'إجمالي المساحة',
    quickDownloadFor: 'تحميل سريع بصوت القارئ:',
    saveBtn: 'تحميل',
    savedBtn: 'محفوظة',
    savedAudioTitle: 'السور المحفوظة صوتياً',
    clearAllAudio: 'حذف جميع الصوتيات',
    noAudioSavedDesc: 'لا توجد تلاوات محملة بعد. يمكنك تحميل أي سورة للاستماع دون إنترنت.',
    installAppTitle: 'تثبيت مِحْرَاب النُّور (APK / PWA)',
    installAppDesc: 'ثبّت تطبيق مِحْرَاب النُّور على هاتفك الأندرويد أو الآيفون أو الحاسوب للعمل دون إنترنت.',
    installNowBtn: 'تثبيت كتطبيق ويب',
    installedStandalone: 'تطبيق مِحْرَاب النُّور يعمل الآن كتطبيق مثبت ومستقل.',
    downloadApkBtn: 'تحميل APK',
    downloadApkHeroCta: 'تحميل تطبيق الأندرويد APK',
    downloadApkTitle: 'تطبيق أندرويد (APK)',
    downloadApkDesc: 'حمّل تطبيق أندرويد للاستماع وقراءة المصحف ومواقيت الصلاة والقبلة دون إنترنت.',
    downloadApkCta: 'تنزيل mihrab-noor.apk',
    downloadPageHeading: 'مِحْرَاب النُّور لأجهزة أندرويد',
    downloadPageSubheading:
      'احمل مصحف المدينة (٦٠٤ صفحة) بروايتي حفص وورش ومواقيت الصلاة وبوصلة القبلة والأذكار دون اتصال.',
    downloadVersionMeta: 'v3.0.0 · مجاني · 11.1 MB · تحديث تلقائي مباشر',
    downloadHighlightsTitle: 'تجربة خاشعة ومتكاملة دون إنترنت',
    downloadHighlight1: 'مصحف المدينة المنورة (٦٠٤ صفحة) مع تلاوة متصلة بلا تقطع',
    downloadHighlight2: 'بوصلة القبلة الدقيقة ومواقيت الصلاة الفلكية',
    downloadHighlight3: 'أذكار الصباح والمساء وبعد الصلاة مع عدّاد تسبيح تفاعلي',
    downloadHighlight4: 'مُخطِّط الختمة الذكي مع تنبيهات الورد اليومي',
    downloadAndroidStudioTitle: 'جاهز للبناء عبر Capacitor و Android Studio',
    downloadAndroidStudioDesc:
      'يتضمن المشروع ملف capacitor.config.json (com.mihrabnoor.app) وأيقونات مِحْرَاب النُّور لبناء ملف APK موقّع.',
    apkStep1: '١. اضغط على «تنزيل mihrab-noor.apk» لحفظ ملف التثبيت.',
    apkStep2: '٢. افتح الملف واسمح بتثبيت التطبيقات من هذا المتصفح عند الطلب.',
    apkStep3: '٣. اضغط «تثبيت» وافتح مِحْرَاب النُّور مباشرة من شاشتك الرئيسية.',
    hifzMode: 'وضع الحفظ',
    hifzActiveBanner: 'وضع الحفظ · اضغط على أي آية مخفية للمراجعة أو ابدأ التسميع الصوتي',
    hifzHintLabel: 'إظهار أول كلمة',
    revealAll: 'كشف الكل',
    hideAll: 'إخفاء الصفحة',
    micRecite: 'تسميع',
    micListening: 'جارٍ الاستماع (ar-SA)... اتلُ بصوت مسموع',
    micStop: 'إيقاف المايك',
    micUnsupported: 'التعرف الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome أو Edge أو تطبيق أندرويد.',
    micPermissionDenied: 'تعذر الوصول إلى الميكروفون أو تم رفض الإذن. يرجى تفعيل إذن الميكروفون للمتابعة.',
    micMatchedWords: 'كلمة مطابقة',
    micSkippedHint: 'تم تجاوز كلمة أو اختلاف التلاوة — راجع الموضع المحدد',
    focusModeHint: 'اضغط على الصفحة لإظهار الأدوات',
    exitFocus: 'إظهار الأدوات',
    settingsBtn: 'الإعدادات',
    playReciter: 'تشغيل القارئ',
    pauseReciter: 'إيقاف',
    closeWord: 'إغلاق',
    prevWord: 'السابق',
    nextWord: 'التالي',
    bentoSectionTitle: 'الواحة الإيمانية اليومية',
    bentoKhatmaTitle: 'مُخطِّط الختمة الذكي',
    bentoKhatmaSubtitle: 'تعديل تلقائي للأوراد اليومية',
    bentoAdhkarTitle: 'الأذكار والتسبيح',
    bentoAdhkarSubtitle: 'عدّاد تسبيح تفاعلي دون اتصال',
    bentoTalqeenTitle: 'التلقين والحفظ',
    bentoTalqeenSubtitle: 'تكرار مع مهلة للترديد',
    bentoHeartTitle: 'دليل الآيات والرقية',
    bentoHeartSubtitle: 'حالات القلب وبطاقات القصص',
    khatmaTitle: 'مُخطِّط الختمة التكيفي الذكي',
    khatmaSubtitle: 'يُعيد حساب الصفحات المتبقية تلقائياً إذا تقدمت أو فاتك يوم',
    khatmaGoalDuration: 'مدة الختمة المستهدفة',
    daysUnit: 'يوم',
    customDaysLabel: 'أيام مخصصة',
    applyBtn: 'تعيين',
    daysRemainingLabel: 'يوماً متبقياً',
    paceAhead: 'متقدم عن الجدول',
    paceOnTrack: 'في المسار الصحيح',
    paceAdaptiveCatchup: 'تمت إعادة توزيع الصفحات',
    khatmaCompletedLabel: 'تمت الختمة بحمد الله',
    todayWirdDone: 'ما شاء الله! أتممت وردك اليومي بنجاح.',
    openTodayPagesBtn: 'افتح صفحة الورد',
    markTodayDoneBtn: 'إتمام ورد اليوم',
    logCustomPagesLabel: 'تسجيل صفحات مقروءة',
    addPagesBtn: 'تسجيل',
    resetKhatmaBtn: 'إعادة ضبط الخطة',
    dailyReminderTitle: 'إشعارات التذكير اليومي بالختمة',
    dailyReminderDesc: 'يعمل عبر إشعارات المتصفح وتطبيق الويب التقدمي',
    enableReminderBtn: 'تفعيل التذكير',
    reminderEnabledLabel: 'التذكير مُفعّل',
    reminderTimeLabel: 'الوقت المفضل',
    sendTestReminderBtn: 'إرسال إشعار تجريبي',
    testReminderSent: 'تم إرسال التذكير!',
    notificationBlockedHint: 'إشعارات المتصفح محظورة حالياً — تم عرض معاينة الإشعار داخل التطبيق.',
    fridayKahfTitle: 'تذكير سورة الكهف يوم الجمعة',
    fridayKahfDesc: 'تنبيه أسبوعي كل صباح جمعة لقراءة سورة الكهف',
    openKahfBtn: 'قراءة سورة الكهف',
    testKahfBtn: 'معاينة تنبيه الجمعة',
    adhkarTitle: 'الأذكار والتسبيح التفاعلي',
    adhkarSabah: 'الصباح',
    adhkarMasaa: 'المساء',
    adhkarPostPrayer: 'بعد الصلاة',
    completedWord: 'مكتمل',
    resetAdhkarBtn: 'إعادة تصفير القسم',
    tapToCountHint: 'اضغط في أي مكان على البطاقة للتسبيح',
    dhikrCompletedHint: 'تمت القراءة — اضغط للانتقال',
    allAdhkarDone: 'اكتملت أذكار القسم',
    talqeenTitle: 'وضع التلقين (استمع وردِّد)',
    talqeenDesc: 'يكرر نطاق آيات محدد مع مهلة صمت لترديد كل آية غيباً',
    talqeenEnabled: 'التلقين: مُفعّل',
    talqeenOff: 'التلقين: متوقف',
    talqeenRangeLabel: 'نطاق الآيات',
    talqeenToWord: 'إلى',
    talqeenPauseLabel: 'مهلة الترديد',
    talqeenPromptPrefix: 'ردِّد الآن · الآية التالية خلال',
    talqeenSkipPause: 'تخطي المهلة',
    talqeenSwitchAyahNote: 'اختر قارئاً بنظام الآية لتفعيل مهلة التلقين بين الآيات.',
    heartGuideTitle: 'دليل الآيات لقلبك والرقية',
    saveStoryCardBtn: 'حفظ بطاقة قصة',
    openInMushafBtn: 'عرض في المصحف',
    storyCardReadyTitle: 'تم تصميم بطاقة القصة الذهبية',
    storyCardReadyDesc: 'بطاقة PNG عالية الدقة جاهزة للمشاركة على واتساب وإنستغرام',
    downloadPngAgain: 'تنزيل الصورة مجدداً',
    onboardingTitle: 'مرحباً بك في مِحْرَاب النُّور',
    onboardingSubtitle: 'خصّص تجربة قراءة المصحف الشريف في ثلاث خطوات سريعة',
    onboardingStep1: 'اختر لغة التطبيق',
    onboardingStep2: 'اختر الرواية المعتمدة',
    onboardingStep3: 'اختر القارئ المفضل',
    onboardingNext: 'التالي',
    onboardingSkip: 'تخطي',
    onboardingStart: 'ابدأ القراءة',
    quickSettingsTitle: 'إعدادات القراءة السريعة',
    themeWarmDay: 'نهاري دافئ',
    themeNightComfort: 'ليلي مريح',
    fontSizeLabel: 'حجم الخط',
    reciterSelectLabel: 'القارئ',
    swipeDownToCloseHint: 'اسحب للأسفل للإغلاق',
    featuresShowcaseTitle: 'مميزات تطبيق مِحْرَاب النُّور',
    showcaseMushafTitle: 'مصحف المدينة (٦٠٤ صفحة) دون إنترنت',
    showcaseMushafDesc: 'خط عثماني واضح بروايتي حفص عن عاصم وورش عن نافع دون انقطاع.',
    showcaseAudioTitle: 'أكثر من ٣٢ قارئاً وتزامن فوري',
    showcaseAudioDesc: 'تلاوة في الخلفية وشاشة القفل مع تمييز حيّ للآية وموجة صوتية سلسة.',
    showcaseHifzTitle: 'التفسير الميسر وحلقة الحفظ',
    showcaseHifzDesc: 'اضغط أي آية للتفسير أو التكرار المحدد للحفظ أو إنشاء بطاقة مشاركة أنيقة.',
    showcaseQiblaTitle: 'بوصلة القبلة ومواقيت الصلاة',
    showcaseQiblaDesc: 'حسابات فلكية دقيقة للصلوات الخمس واتجاه القبلة محلياً على جهازك.',
    showcaseDailyTitle: 'بحث فوري وأذكار وختمة ذكية',
    showcaseDailyDesc: 'عدّاد تسبيح تفاعلي وأذكار يومية ومُخطِّط ختمة يتكيّف مع تقدمك.',
    apkUninstallTip:
      'إذا كنت تُحدّث من إصدار قديم وظهرت رسالة تعارض في التثبيت، يُرجى إزالة النسخة السابقة أولاً ثم تثبيت مِحْرَاب النُّور.',
  },
  fr: {
    appName: 'Mihrab Noor',
    navHome: 'Accueil',
    navSurahs: 'Sourates',
    navMushaf: 'Coran',
    navQibla: 'Qibla',
    navAdhkar: 'Tasbih',
    navKhatma: 'Khatma',
    navVault: 'Coffre',
    navPrivacy: 'Confidentialité',
    navMore: 'Plus',
    footerCraftedBy: 'Conçu et développé par Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد',
    footerCopyright:
      '© 2026 Mihrab Noor (مِحْرَاب النُّور). Crafted & Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد',
    mobileMenuTitle: 'Menu Mihrab Noor',
    mobileThemeLabel: 'Apparence',
    mobileLangLabel: 'Langue',
    browseAllSurahsBtn: 'Parcourir les sourates',
    allJuzFilter: 'Tous les Juz',
    langToggleLabel: 'عربي',
    themeToLight: 'Passer au mode Sable Chaud',
    themeToDark: 'Passer au mode Expresso Nuit',
    offlineBanner: 'Mode hors ligne — Lecture depuis la base locale IndexedDB',
    lastReadLabel: 'Dernière lecture',
    continueReading: 'Dernière lecture',
    beginRecitation: 'Dernière lecture',
    resumePage: 'Reprendre la lecture',
    openMushafPage1: 'Ouvrir le Coran',
    dailyWird: 'Wird du jour · Al-Kahf',
    searchBtn: 'Rechercher',
    narrationLabel: 'Lecture · الرواية',
    hafsLabel: "Hafs 'an 'Asim · حفص",
    warshLabel: "Warsh 'an Nafi' · ورش",
    surahsCached: 'Sourates en cache',
    jumpToPageLabel: 'Aller à la page du Moushaf (1 – 604)',
    jumpPlaceholder: 'Page 1–604',
    goBtn: 'Aller',
    quickOpen: 'Accès rapide :',
    readingStreakTitle: 'Série de lecture',
    streakDaysUnit: 'jours',
    pagesTodayLabel: "Aujourd'hui",
    totalPagesReadLabel: 'Pages lues',
    tabSurahs: '114 Sourates',
    tabJuz: '30 Juz',
    tabBookmarks: 'Favoris',
    filterSurahPlaceholder: 'Filtrer par nom ou numéro...',
    filterAll: 'Tout',
    filterMeccan: 'Mecquoise',
    filterMedinan: 'Médinoise',
    meccan: 'Mecquoise',
    medinan: 'Médinoise',
    ayahsWord: 'Versets',
    pageShort: 'p.',
    juzWord: 'Juz',
    startsAtPage: 'Commence page',
    noBookmarksTitle: 'Aucun marque-page enregistré',
    noBookmarksDesc: 'Touchez un verset pendant la lecture pour le sauvegarder hors ligne.',
    noSurahMatch: 'Aucune sourate ne correspond à votre filtre.',
    offlineTag: 'Hors ligne',
    bookmarkCategoryLabel: 'Catégorie',
    catWird: 'Wird quotidien',
    catMemorization: 'Mémorisation',
    catFavorites: 'Favoris',
    prayerTimesTitle: 'Horaires de Prière',
    remainingTimeLabel: 'Temps restant',
    smartFeaturesTitle: 'Outils Spirituels',
    featureReminder: 'Rappels',
    featureMemorize: 'Mémoriser',
    featureRuqyah: 'Sérénité',
    featureDuaQa: 'Adhkar',
    qiblaTitle: 'Boussole Qibla',
    qiblaAngleLabel: "Angle vers la Qibla",
    useGpsBtn: 'Utiliser GPS',
    selectCityLabel: 'Ville',
    compassCalibrationHint: 'Tournez la boussole ou activez les capteurs',
    modeQuran: 'Coran',
    modeSurah: 'Sourate',
    modeJuz: 'Juz',
    modePage: 'Page',
    backToSurahs: 'Retour aux sourates',
    mushafPageMode: 'Page Moushaf',
    surahViewMode: 'Vue Sourate',
    downloadSurahOffline: 'Télécharger hors ligne',
    offlineShort: 'Hors ligne',
    offlineReady: 'Disponible hors ligne',
    displaySettings: "Réglages d'affichage",
    arabicFontSize: 'Taille du texte arabe',
    lineSpacing: 'Interligne',
    uthmaniTypeface: 'Calligraphie Uthmani',
    englishTranslation: 'Traduction',
    translationVisible: 'Traduction : Visible',
    translationHidden: 'Traduction : Masquée',
    madaniMushaf: 'Moushaf de Médine',
    pageWord: 'Page',
    ofWord: 'sur',
    versesWord: 'Versets',
    playSurah: 'Écouter la sourate',
    nextPage: 'Page suivante',
    prevPage: 'Page préc.',
    nextSurah: 'Sourate suiv.',
    prevSurah: 'Sourate préc.',
    surahWord: 'Sourate',
    playFromHere: 'Écouter',
    bookmark: 'Marquer',
    bookmarked: 'Enregistré',
    tafsir: 'Tafsir',
    copy: 'Copier',
    copied: 'Copié',
    shareWord: 'Partager',
    fullSurah: 'Sourate complète',
    repeatOff: 'Répétition : Non',
    repeatAyah: 'Répéter Verset',
    repeatSurah: 'Répéter Sourate',
    repeatShort: 'Répéter',
    reciterLabel: 'Récitateur (Warsh & Hafs)',
    sleepTimerOff: 'Minuteur : Arrêt',
    minutesUnit: 'min',
    endOfSurah: 'Fin de sourate',
    elapsed: 'Écoulé',
    duration: 'Durée',
    warshGroup: "Warsh 'an Nafi' (ورش عن نافع)",
    hafsGroup: "Hafs 'an 'Asim (حفص عن عاصم)",
    audioSyncOffsetLabel: 'Décalage de synchro des versets',
    resetOffsetLabel: 'Réinitialiser',
    wakeLockLabel: 'Garder écran allumé',
    wakeLockActive: 'Écran actif : Oui',
    wakeLockOff: 'Écran actif : Non',
    wakeLockDesc: 'Empêche la mise en veille pendant la lecture',
    tafsirMuyassarTab: 'التفسير الميسر',
    englishTranslationTab: 'English',
    frenchTranslationTab: 'Français',
    listenAyah: 'Écouter le verset',
    loadingTafsir: 'Chargement du Tafsir Al-Muyassar...',
    loadingTranslation: 'Chargement de la traduction anglaise...',
    loadingFrenchTranslation: 'Chargement de la traduction française...',
    hifzRepeatLabel: 'Boucle Hifz',
    shareCardBtn: 'Partager en image',
    cardFormatStory: 'Story 9:16',
    cardFormatSquare: 'Carré 1:1',
    searchPlaceholder: 'Rechercher en arabe (sans harakat), français, anglais, 2:255 ou p:604...',
    clear: 'Effacer',
    searchShortcutsTitle: 'Recherche rapide & raccourcis',
    searchFooterNote: 'Fonctionne 100% hors ligne sur les 6 236 versets.',
    noSearchMatch: 'Aucun verset ou sourate trouvé.',
    matchesFound: 'résultats',
    vaultTitle: 'Marque-pages & Coffre Hors Ligne',
    vaultSubtitle: 'Gérez vos versets sauvegardés, récitations audio et installation',
    quranTextStoredTitle: 'Coran complet (604 pages) stocké hors ligne',
    quranTextStoredDesc: '114 Sourates · 6 236 Versets · Hafs, Warsh et Tafsir en cache IndexedDB',
    audioCachedLabel: 'Audio en cache',
    totalStorageLabel: 'Stockage App',
    quickDownloadFor: 'Téléchargement rapide pour',
    saveBtn: 'Sauver',
    savedBtn: 'Sauvé',
    savedAudioTitle: 'Audio hors ligne sauvegardé',
    clearAllAudio: 'Tout effacer',
    noAudioSavedDesc: 'Aucune récitation enregistrée pour le moment.',
    installAppTitle: 'Installer Mihrab Noor (APK & PWA)',
    installAppDesc: "Installez Mihrab Noor comme application autonome hors ligne sur Android, iOS ou PC.",
    installNowBtn: 'Installer App Web',
    installedStandalone: 'Mihrab Noor fonctionne en mode application autonome.',
    downloadApkBtn: 'Télécharger APK',
    downloadApkHeroCta: 'Télécharger APK Android',
    downloadApkTitle: 'Application Android (APK)',
    downloadApkDesc: 'Téléchargez l’APK Android pour lire, écouter et consulter les prières hors ligne.',
    downloadApkCta: 'Télécharger mihrab-noor.apk',
    downloadPageHeading: 'Mihrab Noor pour Android',
    downloadPageSubheading:
      'Emportez le Moushaf de Médine complet (604 pages), Hafs & Warsh, horaires de prière et boussole Qibla hors ligne.',
    downloadVersionMeta: 'v3.0.0 · Gratuit · 11.1 Mo · Mises à jour OTA en direct',
    downloadHighlightsTitle: 'Conçu pour une récitation sereine',
    downloadHighlight1: 'Moushaf complet de 604 pages avec audio Hafs & Warsh sans coupure',
    downloadHighlight2: 'Boussole Qibla précise & horaires de prière astronomiques',
    downloadHighlight3: 'Adhkar du matin, du soir et après la prière avec compteur Tasbih',
    downloadHighlight4: 'Planificateur de Khatma adaptatif avec rappels quotidiens',
    downloadAndroidStudioTitle: 'Prêt pour Capacitor & Android Studio',
    downloadAndroidStudioDesc:
      'Configuré avec capacitor.config.json (com.mihrabnoor.app) pour compiler votre APK signé.',
    apkStep1: '1. Appuyez sur Télécharger mihrab-noor.apk pour enregistrer le fichier.',
    apkStep2: '2. Ouvrez le fichier téléchargé et autorisez l’installation si demandé.',
    apkStep3: '3. Appuyez sur Installer et lancez Mihrab Noor depuis votre écran.',
    hifzMode: 'Masque Hifz',
    hifzActiveBanner: 'Mode Hifz · Touchez un verset masqué pour le révéler ou réciter à voix haute',
    hifzHintLabel: '1er Mot',
    revealAll: 'Tout révéler',
    hideAll: 'Tout masquer',
    micRecite: 'Réciter',
    micListening: 'Écoute (ar-SA)... Récitez à voix haute',
    micStop: 'Arrêter micro',
    micUnsupported: 'La reconnaissance vocale n’est pas prise en charge sur ce navigateur.',
    micPermissionDenied: 'Permission microphone refusée ou indisponible.',
    micMatchedWords: 'trouvés',
    micSkippedHint: 'Mot sauté ou différent — vérifiez le mot souligné',
    focusModeHint: 'Touchez la page pour quitter le mode focus',
    exitFocus: 'Quitter Focus',
    settingsBtn: 'Réglages',
    playReciter: 'Lire',
    pauseReciter: 'Pause',
    closeWord: 'Fermer',
    prevWord: 'Préc.',
    nextWord: 'Suiv.',
    bentoSectionTitle: 'Espace Spirituel Quotidien',
    bentoKhatmaTitle: 'Planificateur Khatma',
    bentoKhatmaSubtitle: 'Objectif quotidien adaptatif',
    bentoAdhkarTitle: 'Adhkar & Tasbih',
    bentoAdhkarSubtitle: 'Compteur et invocations',
    bentoTalqeenTitle: 'Mémorisation Talqeen',
    bentoTalqeenSubtitle: 'Écouter et répéter avec pause',
    bentoHeartTitle: 'Versets pour le Cœur',
    bentoHeartSubtitle: 'Guide spirituel & cartes image',
    khatmaTitle: 'Planificateur Adaptatif de Khatma',
    khatmaSubtitle: 'Recalcule automatiquement les pages quotidiennes restantes',
    khatmaGoalDuration: 'Durée de la Khatma',
    daysUnit: 'jours',
    customDaysLabel: 'Jours personnalisés',
    applyBtn: 'Valider',
    daysRemainingLabel: 'jours restants',
    paceAhead: 'En avance',
    paceOnTrack: 'Dans les temps',
    paceAdaptiveCatchup: 'Rythme recalculé',
    khatmaCompletedLabel: 'Khatma terminée',
    todayWirdDone: 'Alhamdulillah ! Votre lecture du jour est complète.',
    openTodayPagesBtn: 'Ouvrir la page du jour',
    markTodayDoneBtn: 'Marquer terminé',
    logCustomPagesLabel: 'Enregistrer des pages lues',
    addPagesBtn: 'Ajouter',
    resetKhatmaBtn: 'Réinitialiser le plan',
    dailyReminderTitle: 'Rappel Quotidien de Khatma',
    dailyReminderDesc: 'Notifications via navigateur & Service Worker PWA',
    enableReminderBtn: 'Activer le rappel',
    reminderEnabledLabel: 'Rappel actif',
    reminderTimeLabel: 'Heure souhaitée',
    sendTestReminderBtn: 'Tester le rappel',
    testReminderSent: 'Aperçu du rappel affiché !',
    notificationBlockedHint: 'Les notifications système sont bloquées — aperçu affiché dans l’app.',
    fridayKahfTitle: 'Rappel du Vendredi — Sourate Al-Kahf',
    fridayKahfDesc: 'Notification hebdomadaire chaque vendredi matin pour lire Al-Kahf',
    openKahfBtn: 'Lire Al-Kahf',
    testKahfBtn: 'Tester Al-Kahf',
    adhkarTitle: 'Adhkar & Tasbih Interactif',
    adhkarSabah: 'Matin',
    adhkarMasaa: 'Soir',
    adhkarPostPrayer: 'Après Prière',
    completedWord: 'complétés',
    resetAdhkarBtn: 'Réinitialiser la catégorie',
    tapToCountHint: 'Touchez la carte pour compter',
    dhikrCompletedHint: 'Terminé — touchez pour continuer',
    allAdhkarDone: 'Tous les Adhkar complétés',
    talqeenTitle: 'Mode Talqeen (Écouter & Répéter)',
    talqeenDesc: 'Répète une plage de versets avec une pause configurable',
    talqeenEnabled: 'Talqeen : Activé',
    talqeenOff: 'Talqeen : Désactivé',
    talqeenRangeLabel: 'Plage de versets',
    talqeenToWord: 'à',
    talqeenPauseLabel: 'Pause',
    talqeenPromptPrefix: 'Répétez à voix haute · Prochain dans',
    talqeenSkipPause: 'Passer',
    talqeenSwitchAyahNote: 'Choisissez un récitateur verset par verset pour activer les pauses Talqeen.',
    heartGuideTitle: 'Versets pour votre Cœur & Ruqyah',
    saveStoryCardBtn: 'Image Story',
    openInMushafBtn: 'Ouvrir dans le Moushaf',
    storyCardReadyTitle: 'Carte Dorée Exportée',
    storyCardReadyDesc: 'Image PNG prête à être partagée sur WhatsApp & Instagram',
    downloadPngAgain: 'Télécharger PNG',
    onboardingTitle: 'Bienvenue sur Mihrab Noor',
    onboardingSubtitle: 'Configurez votre espace coranique en 3 étapes rapides',
    onboardingStep1: 'Choisissez la langue',
    onboardingStep2: 'Choisissez la lecture (Riwayah)',
    onboardingStep3: 'Récitateur favori',
    onboardingNext: 'Continuer',
    onboardingSkip: 'Passer',
    onboardingStart: 'Commencer la lecture',
    quickSettingsTitle: 'Réglages rapides du Moushaf',
    themeWarmDay: 'Jour Doux',
    themeNightComfort: 'Nuit Douce',
    fontSizeLabel: 'Taille du texte',
    reciterSelectLabel: 'Récitateur',
    swipeDownToCloseHint: 'Glisser vers le bas pour fermer',
    featuresShowcaseTitle: 'Tout dans Mihrab Noor',
    showcaseMushafTitle: 'Moushaf 604 pages hors ligne',
    showcaseMushafDesc: 'Calligraphie Uthmani nette en Hafs et Warsh, accessible sans internet.',
    showcaseAudioTitle: '32+ Récitateurs & Synchro',
    showcaseAudioDesc: 'Lecture en arrière-plan, contrôles écran verrouillé et surbrillance directe.',
    showcaseHifzTitle: 'Tafsir, Traduction & Boucle Hifz',
    showcaseHifzDesc: 'Touchez un verset pour le Tafsir, la répétition Hifz ou une carte Story PNG.',
    showcaseQiblaTitle: 'Boussole Qibla & Horaires',
    showcaseQiblaDesc: 'Calculs astronomiques précis des 5 prières et direction Qibla hors ligne.',
    showcaseDailyTitle: 'Recherche, Adhkar & Khatma',
    showcaseDailyDesc: 'Tasbih tactile, Adhkar quotidiens et planificateur de Khatma adaptatif.',
    apkUninstallTip:
      'Mise à jour depuis une ancienne version ? Désinstallez d’abord l’ancienne application si Android signale un conflit.',
  },
};
