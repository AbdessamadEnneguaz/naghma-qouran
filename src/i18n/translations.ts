export type AppLang = 'en' | 'ar';

export interface Translations {
  appName: string;
  navSurahs: string;
  navMushaf: string;
  navVault: string;
  langToggleLabel: string;
  themeToLight: string;
  themeToDark: string;
  offlineBanner: string;
  // Home
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
  // Mushaf Reader
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
  // Tap-Ayah Floating Menu
  playFromHere: string;
  bookmark: string;
  bookmarked: string;
  tafsir: string;
  copy: string;
  copied: string;
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
  // Tafsir Drawer
  tafsirMuyassarTab: string;
  englishTranslationTab: string;
  listenAyah: string;
  loadingTafsir: string;
  loadingTranslation: string;
  // Search Modal
  searchPlaceholder: string;
  clear: string;
  searchShortcutsTitle: string;
  searchFooterNote: string;
  noSearchMatch: string;
  matchesFound: string;
  // Vault View (Bookmarks + Offline + Install)
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
  downloadApkTitle: string;
  downloadApkDesc: string;
  downloadApkCta: string;
  apkStep1: string;
  apkStep2: string;
  apkStep3: string;
  // Tarteel Hifz, Voice Recite & Focus Mode
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
  // Khatma Planner & Notifications
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
  // Talqeen Memorization Mode
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
}

export const TRANSLATIONS: Record<AppLang, Translations> = {
  en: {
    appName: 'Naghma Quran',
    navSurahs: 'Surahs',
    navMushaf: 'Mushaf',
    navVault: 'Vault',
    langToggleLabel: 'عربي',
    themeToLight: 'Switch to Warm Parchment light mode',
    themeToDark: 'Switch to Deep Emerald dark mode',
    offlineBanner: 'Offline Mode — Reading from local IndexedDB Quran Vault',
    continueReading: 'Continue Reading · علامة الوقف',
    beginRecitation: 'Begin Recitation · علامة الوقف',
    resumePage: 'Resume Page',
    openMushafPage1: 'Open Mushaf Page 1',
    dailyWird: 'Daily Wird · Al-Kahf',
    searchBtn: 'Search',
    narrationLabel: 'Narration · الرواية',
    hafsLabel: "Hafs 'an 'Asim · حفص",
    warshLabel: "Warsh 'an Nafi' · ورش",
    surahsCached: 'Surahs Cached',
    jumpToPageLabel: 'Jump to Mushaf Page (1 – 604)',
    jumpPlaceholder: 'e.g. 128 or 604',
    goBtn: 'Go',
    quickOpen: 'Quick Open:',
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
    playFromHere: 'Play from here',
    bookmark: 'Bookmark',
    bookmarked: 'Bookmarked',
    tafsir: 'Tafsir',
    copy: 'Copy',
    copied: 'Copied',
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
    tafsirMuyassarTab: 'التفسير الميسر (Al-Muyassar)',
    englishTranslationTab: 'English Translation',
    listenAyah: 'Listen Ayah',
    loadingTafsir: 'Loading Tafsir Al-Muyassar...',
    loadingTranslation: 'Loading English translation...',
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
    installAppTitle: 'Install Naghma Quran (Android APK & PWA)',
    installAppDesc: 'Install Naghma Quran as an offline standalone app on Android, desktop, or iOS.',
    installNowBtn: 'Install Web App',
    installedStandalone: 'Naghma Quran is running in standalone installed mode.',
    downloadApkBtn: 'Download APK',
    downloadApkTitle: 'Android App (APK)',
    downloadApkDesc: 'Download the native Android WebView APK for 100% offline reading and recitation.',
    downloadApkCta: 'Download naghma-quran.apk',
    apkStep1: '1. Tap Download naghma-quran.apk to save the installer.',
    apkStep2: '2. Open the file and allow "Install unknown apps" for your browser if prompted.',
    apkStep3: '3. Tap Install and launch Naghma Quran from your Android home screen.',
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
    bentoAdhkarTitle: 'Adhkar Sabaa & Masaa',
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
    heartGuideTitle: 'Verses for Your Heart',
    saveStoryCardBtn: 'Save Story Card',
    openInMushafBtn: 'Open in Mushaf',
    storyCardReadyTitle: 'Emerald & Gold Story Card Exported',
    storyCardReadyDesc: '1080×1920 PNG saved locally for WhatsApp & Instagram',
    downloadPngAgain: 'Download PNG',
  },
  ar: {
    appName: 'نَغمة القرآن',
    navSurahs: 'السور',
    navMushaf: 'المصحف',
    navVault: 'المحفوظات',
    langToggleLabel: 'EN',
    themeToLight: 'التبديل إلى وضع المصحف النهاري',
    themeToDark: 'التبديل إلى الوضع الزمردي الليلي',
    offlineBanner: 'وضع عدم الاتصال — القراءة من الذاكرة المحلية للمصحف',
    continueReading: 'أكمل القراءة · علامة الوقف',
    beginRecitation: 'ابدأ التلاوة · علامة الوقف',
    resumePage: 'متابعة الصفحة',
    openMushafPage1: 'فتح المصحف · صفحة ١',
    dailyWird: 'الورد اليومي · الكهف',
    searchBtn: 'بحث',
    narrationLabel: 'الرواية المعتمدة',
    hafsLabel: 'حفص عن عاصم',
    warshLabel: 'ورش عن نافع',
    surahsCached: 'سور محفوظة',
    jumpToPageLabel: 'الانتقال إلى صفحة المصحف (١ – ٦٠٤)',
    jumpPlaceholder: 'مثال: ١٢٨ أو 604',
    goBtn: 'انتقال',
    quickOpen: 'وصول سريع:',
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
    playFromHere: 'التلاوة من هنا',
    bookmark: 'حفظ علامة',
    bookmarked: 'تم الحفظ',
    tafsir: 'التفسير',
    copy: 'نسخ',
    copied: 'تم النسخ',
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
    tafsirMuyassarTab: 'التفسير الميسر',
    englishTranslationTab: 'الترجمة الإنجليزية',
    listenAyah: 'سماع الآية',
    loadingTafsir: 'جارٍ تحميل التفسير الميسر...',
    loadingTranslation: 'جارٍ تحميل الترجمة...',
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
    installAppTitle: 'تثبيت نَغمة القرآن (APK / PWA)',
    installAppDesc: 'ثبّت تطبيق نَغمة القرآن على هاتفك الأندرويد أو الآيفون أو الحاسوب للعمل دون إنترنت.',
    installNowBtn: 'تثبيت كتطبيق ويب',
    installedStandalone: 'تطبيق نَغمة القرآن يعمل الآن كتطبيق مثبت ومستقل.',
    downloadApkBtn: 'تحميل APK',
    downloadApkTitle: 'تطبيق أندرويد (APK)',
    downloadApkDesc: 'حمّل ملف APK لتشغيل المصحف والتلاوة كـتطبيق أندرويد مستقل دون إنترنت.',
    downloadApkCta: 'تنزيل naghma-quran.apk',
    apkStep1: '١. اضغط على «تنزيل naghma-quran.apk» لحفظ ملف التثبيت.',
    apkStep2: '٢. افتح الملف واسمح بتثبيت التطبيقات من هذا المتصفح عند الطلب.',
    apkStep3: '٣. اضغط «تثبيت» وافتح نَغمة القرآن مباشرة من شاشتك الرئيسية.',
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
    bentoAdhkarTitle: 'أذكار الصباح والمساء',
    bentoAdhkarSubtitle: 'عدّاد تسبيح تفاعلي دون اتصال',
    bentoTalqeenTitle: 'التلقين والحفظ',
    bentoTalqeenSubtitle: 'تكرار مع مهلة للترديد',
    bentoHeartTitle: 'دليل الآيات للقلب',
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
    heartGuideTitle: 'دليل الآيات لقلبك',
    saveStoryCardBtn: 'حفظ بطاقة قصة',
    openInMushafBtn: 'عرض في المصحف',
    storyCardReadyTitle: 'تم تصميم بطاقة القصة الذهبية',
    storyCardReadyDesc: 'بطاقة PNG عالية الدقة جاهزة للمشاركة على واتساب وإنستغرام',
    downloadPngAgain: 'تنزيل الصورة مجدداً',
  },
};
