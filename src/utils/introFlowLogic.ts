import {parseRouteFromLocation} from './routing';

export const INTRO_SEEN_KEY = 'mihrab_intro_seen';

export interface IntroRouteContext {
  pathname: string;
  search?: string;
  hash?: string;
  introSeen: boolean;
  isNativeOrStandalone: boolean;
}

export interface IntroSampleVerse {
  id: string;
  surah: number;
  ayah: number;
  page: number;
  surahAr: string;
  surahEn: string;
  surahFr: string;
  hafsAr: string;
  warshAr: string;
  en: string;
  fr: string;
}

export const INTRO_SAMPLE_VERSES: IntroSampleVerse[] = [
  {
    id: 'fatiha-1',
    surah: 1,
    ayah: 2,
    page: 1,
    surahAr: 'الفاتحة',
    surahEn: 'Al-Faatiha',
    surahFr: 'Al-Fâtiha',
    hafsAr: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    warshAr: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    en: 'All praise is due to Allah, Lord of the worlds.',
    fr: 'Louange à Allah, Seigneur de l’univers.',
  },
  {
    id: 'sharh-5',
    surah: 94,
    ayah: 5,
    page: 596,
    surahAr: 'الشرح',
    surahEn: 'Ash-Sharh',
    surahFr: 'Ash-Sharh',
    hafsAr: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    warshAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    en: 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.',
    fr: 'À côté de la difficulté est, certes, une facilité.',
  },
  {
    id: 'ikhlas-1',
    surah: 112,
    ayah: 1,
    page: 604,
    surahAr: 'الإخلاص',
    surahEn: 'Al-Ikhlaas',
    surahFr: 'Al-Ikhlâs',
    hafsAr: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ',
    warshAr: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ',
    en: 'Say, "He is Allah, the One; Allah, the Eternal Refuge."',
    fr: 'Dis : « Il est Allah, Unique. Allah, Le Seul à être imploré. »',
  },
];

/**
 * Determines whether to display the Web Welcome / Intro presentation page
 * before entering the core app dashboard.
 */
export function shouldShowWebIntroLanding(ctx: IntroRouteContext): boolean {
  const params = new URLSearchParams(ctx.search || '');
  if (params.get('intro') === '1') return true;
  if (params.has('autostart') || params.get('skipIntro') === '1') return false;

  const parsed = parseRouteFromLocation(ctx.pathname || '/', ctx.hash || '');
  if (parsed === 'intro') return true;
  if (parsed !== 'home') return false;

  // Installed APK / Capacitor / PWA standalone launches smoothly straight into Home after Splash
  if (ctx.isNativeOrStandalone) return false;

  return !ctx.introSeen;
}

export function readIntroSeen(storage?: Pick<Storage, 'getItem'>): boolean {
  try {
    if (!storage) return false;
    return storage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeIntroSeen(storage?: Pick<Storage, 'setItem'>, seen = true): void {
  try {
    if (!storage) return;
    storage.setItem(INTRO_SEEN_KEY, seen ? '1' : '0');
  } catch {
    // ignore storage access issues
  }
}
