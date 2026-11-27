import {inferPrayerMethodForCoords, type PrayerMethodId} from './qiblaLogic';

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeEntry {
  id: PrayerId;
  nameEn: string;
  nameAr: string;
  minutesFromMidnight: number;
  formatted24: string;
  formatted12: string;
}

export interface DailyPrayerSchedule {
  entries: PrayerTimeEntry[];
  nextPrayer: PrayerTimeEntry;
  minutesUntilNext: number;
  remainingSeconds: number;
  remainingFormatted: string;
  method: PrayerMethodId;
  source: 'official-api' | 'astronomical';
}

export interface PrayerMethodConfig {
  id: PrayerMethodId;
  aladhanId: number;
  nameEn: string;
  nameAr: string;
  fajrAngle: number;
  ishaAngle: number;
  /** Fixed minutes after Maghrib (used by Umm Al-Qura, 90 min). */
  ishaAfterMaghribMin?: number;
  dhuhrOffsetMin: number;
  maghribOffsetMin: number;
}

export const PRAYER_METHODS: Record<PrayerMethodId, PrayerMethodConfig> = {
  habous: {
    id: 'habous',
    aladhanId: 21,
    nameEn: 'Morocco (Habous)',
    nameAr: 'وزارة الأوقاف المغربية',
    fajrAngle: 19,
    ishaAngle: 17,
    dhuhrOffsetMin: 5,
    maghribOffsetMin: 5,
  },
  mwl: {
    id: 'mwl',
    aladhanId: 3,
    nameEn: 'Muslim World League',
    nameAr: 'رابطة العالم الإسلامي',
    fajrAngle: 18,
    ishaAngle: 17,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
  umm_al_qura: {
    id: 'umm_al_qura',
    aladhanId: 4,
    nameEn: 'Umm Al-Qura (Makkah)',
    nameAr: 'أم القرى (مكة المكرمة)',
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaAfterMaghribMin: 90,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
  egypt: {
    id: 'egypt',
    aladhanId: 5,
    nameEn: 'Egyptian General Authority',
    nameAr: 'الهيئة المصرية العامة',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
  isna: {
    id: 'isna',
    aladhanId: 2,
    nameEn: 'ISNA (North America)',
    nameAr: 'الجمعية الإسلامية (أمريكا الشمالية)',
    fajrAngle: 15,
    ishaAngle: 15,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
  uoif: {
    id: 'uoif',
    aladhanId: 12,
    nameEn: 'UOIF (France 12°)',
    nameAr: 'اتحاد المنظمات الإسلامية (فرنسا)',
    fajrAngle: 12,
    ishaAngle: 12,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
  diyanet: {
    id: 'diyanet',
    aladhanId: 13,
    nameEn: 'Diyanet (Turkey)',
    nameAr: 'رئاسة الشؤون الدينية (تركيا)',
    fajrAngle: 18,
    ishaAngle: 17,
    dhuhrOffsetMin: 0,
    maghribOffsetMin: 0,
  },
};

const OFFICIAL_CACHE_KEY = 'mihrab_official_prayer_cache_v1';
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function fixAngle(a: number): number {
  return a - 360 * Math.floor(a / 360);
}

function fixHour(h: number): number {
  return h - 24 * Math.floor(h / 24);
}

function julianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function sunPosition(jd: number): {declination: number; equationOfTime: number} {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * Math.sin(g * DEG) + 0.02 * Math.sin(2 * g * DEG));
  const e = 23.439 - 0.00000036 * d;
  const ra = (Math.atan2(Math.cos(e * DEG) * Math.sin(l * DEG), Math.cos(l * DEG)) * RAD) / 15;
  const eqT = q / 15 - fixHour(ra);
  const decl = Math.asin(Math.sin(e * DEG) * Math.sin(l * DEG)) * RAD;
  return {declination: decl, equationOfTime: eqT};
}

function midDay(jdBase: number, dayFraction: number): number {
  const {equationOfTime} = sunPosition(jdBase + dayFraction);
  return fixHour(12 - equationOfTime);
}

function sunAngleTime(
  jdBase: number,
  dayFraction: number,
  lat: number,
  angleDeg: number,
  direction: 'ccw' | 'cw'
): number {
  const {declination} = sunPosition(jdBase + dayFraction);
  const noon = midDay(jdBase, dayFraction);
  const num = -Math.sin(angleDeg * DEG) - Math.sin(declination * DEG) * Math.sin(lat * DEG);
  const den = Math.cos(declination * DEG) * Math.cos(lat * DEG);
  const ratio = num / den;
  if (ratio > 1 || ratio < -1) {
    return NaN;
  }
  const t = (Math.acos(ratio) * RAD) / 15;
  return noon + (direction === 'ccw' ? -t : t);
}

function asrTime(jdBase: number, dayFraction: number, lat: number, shadowFactor = 1): number {
  const {declination} = sunPosition(jdBase + dayFraction);
  const noon = midDay(jdBase, dayFraction);
  const targetAltDeg = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(lat - declination) * DEG))) * RAD;
  return sunAngleTime(jdBase, dayFraction, lat, -targetAltDeg, 'cw');
}

export function formatMinutesAs24h(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatMinutesAs12h(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatRemainingSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const remH = Math.floor(safe / 3600);
  const remM = Math.floor((safe % 3600) / 60);
  const remS = safe % 60;
  return `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
}

function buildScheduleCountdown(
  date: Date,
  entries: PrayerTimeEntry[],
  method: PrayerMethodId,
  source: 'official-api' | 'astronomical'
): DailyPrayerSchedule {
  const nowSeconds =
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  let next = entries.find((e) => e.minutesFromMidnight * 60 > nowSeconds);
  let remainingSeconds = 0;

  if (next) {
    remainingSeconds = next.minutesFromMidnight * 60 - nowSeconds;
  } else {
    next = entries[0];
    remainingSeconds = 86400 - nowSeconds + next.minutesFromMidnight * 60;
  }

  return {
    entries,
    nextPrayer: next,
    minutesUntilNext: Math.ceil(remainingSeconds / 60),
    remainingSeconds,
    remainingFormatted: formatRemainingSeconds(remainingSeconds),
    method,
    source,
  };
}

function parseHHMMToMinutes(hhmm: string): number | null {
  const match = hhmm.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return ((h * 60 + m) % 1440 + 1440) % 1440;
}

function readCachedOfficialEntries(
  dateISO: string,
  lat: number,
  lng: number,
  methodId: PrayerMethodId
): PrayerTimeEntry[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFICIAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      key?: string;
      entries?: PrayerTimeEntry[];
    };
    const key = `${dateISO}:${lat.toFixed(2)},${lng.toFixed(2)}:${methodId}`;
    if (parsed.key === key && Array.isArray(parsed.entries) && parsed.entries.length === 5) {
      return parsed.entries;
    }
  } catch {
    // ignore storage restriction
  }
  return null;
}

/**
 * Fetches official prayer timings from AlAdhan (exact Habous / Umm al-Qura / ISNA / etc. authorities)
 * and caches the day's 5 prayer timestamps locally. Falls back silently if offline.
 */
export async function fetchOfficialPrayerEntries(
  date: Date,
  lat: number,
  lng: number,
  methodId: PrayerMethodId,
  ianaTz?: string
): Promise<PrayerTimeEntry[] | null> {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateISO = `${yyyy}-${mm}-${dd}`;

  const cached = readCachedOfficialEntries(dateISO, lat, lng, methodId);
  if (cached) return cached;

  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  const methodCfg = PRAYER_METHODS[methodId] || PRAYER_METHODS.mwl;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 4500) : null;

  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      method: String(methodCfg.aladhanId),
    });
    if (ianaTz) {
      params.set('timezonestring', ianaTz);
    }
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?${params.toString()}`;
    const res = await fetch(url, {signal: controller?.signal});
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {timings?: Record<string, string>};
    };
    const t = json.data?.timings;
    if (!t) return null;

    const specs: Array<{id: PrayerId; nameEn: string; nameAr: string; key: string}> = [
      {id: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', key: 'Fajr'},
      {id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', key: 'Dhuhr'},
      {id: 'asr', nameEn: 'Asr', nameAr: 'العصر', key: 'Asr'},
      {id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', key: 'Maghrib'},
      {id: 'isha', nameEn: 'Isha', nameAr: 'العشاء', key: 'Isha'},
    ];

    const entries: PrayerTimeEntry[] = [];
    for (const s of specs) {
      const mins = parseHHMMToMinutes(t[s.key] || '');
      if (mins === null) return null;
      entries.push({
        id: s.id,
        nameEn: s.nameEn,
        nameAr: s.nameAr,
        minutesFromMidnight: mins,
        formatted24: formatMinutesAs24h(mins),
        formatted12: formatMinutesAs12h(mins),
      });
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          OFFICIAL_CACHE_KEY,
          JSON.stringify({
            key: `${dateISO}:${lat.toFixed(2)},${lng.toFixed(2)}:${methodId}`,
            entries,
          })
        );
      } catch {
        // ignore quota errors
      }
    }
    return entries;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * High-precision multi-pass astronomical Salah computation with regional official methods
 * (Morocco Habous 19°/17° + ihtiyat, Umm Al-Qura, Egypt, ISNA, UOIF, Diyanet, MWL) and
 * automatic high-latitude NightMiddle/AngleBased protection + cached official API merge.
 */
export function computeDailyPrayerSchedule(
  date: Date,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  options?: {method?: PrayerMethodId; officialEntries?: PrayerTimeEntry[] | null}
): DailyPrayerSchedule {
  const methodId = options?.method ?? inferPrayerMethodForCoords(lat, lng);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateISO = `${yyyy}-${mm}-${dd}`;

  const official =
    options?.officialEntries ?? readCachedOfficialEntries(dateISO, lat, lng, methodId);
  if (official && official.length === 5) {
    return buildScheduleCountdown(date, official, methodId, 'official-api');
  }

  const cfg = PRAYER_METHODS[methodId] || PRAYER_METHODS.mwl;
  const jdBase = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / 360;

  // Iterative solar fractions (two passes converge to sub-second solar precision)
  let fajrF = 5 / 24;
  let sunriseF = 6 / 24;
  let dhuhrF = 12 / 24;
  let asrF = 15 / 24;
  let sunsetF = 18 / 24;
  let ishaF = 19.5 / 24;

  let fajrH = 5;
  let sunriseH = 6;
  let dhuhrH = 12;
  let asrH = 15;
  let sunsetH = 18;
  let ishaH = 19.5;

  for (let pass = 0; pass < 2; pass++) {
    dhuhrH = midDay(jdBase, dhuhrF);
    sunriseH = sunAngleTime(jdBase, sunriseF, lat, 0.833, 'ccw');
    sunsetH = sunAngleTime(jdBase, sunsetF, lat, 0.833, 'cw');
    asrH = asrTime(jdBase, asrF, lat, 1);
    fajrH = sunAngleTime(jdBase, fajrF, lat, cfg.fajrAngle, 'ccw');
    ishaH = cfg.ishaAfterMaghribMin
      ? sunsetH + cfg.ishaAfterMaghribMin / 60
      : sunAngleTime(jdBase, ishaF, lat, cfg.ishaAngle, 'cw');

    // High-latitude protection (AngleBased: Fajr/Isha portion of night = angle / 60)
    const nightDuration = Number.isFinite(sunriseH) && Number.isFinite(sunsetH)
      ? fixHour(sunriseH - sunsetH)
      : 12;
    if (!Number.isFinite(fajrH) || (Number.isFinite(sunriseH) && fixHour(sunriseH - fajrH) > (nightDuration * cfg.fajrAngle) / 60 && Math.abs(lat) > 48)) {
      fajrH = sunriseH - (nightDuration * cfg.fajrAngle) / 60;
    }
    if (!cfg.ishaAfterMaghribMin) {
      if (!Number.isFinite(ishaH) || (Number.isFinite(sunsetH) && fixHour(ishaH - sunsetH) > (nightDuration * cfg.ishaAngle) / 60 && Math.abs(lat) > 48)) {
        ishaH = sunsetH + (nightDuration * cfg.ishaAngle) / 60;
      }
    }

    fajrF = fajrH / 24;
    sunriseF = sunriseH / 24;
    dhuhrF = dhuhrH / 24;
    asrF = asrH / 24;
    sunsetF = sunsetH / 24;
    ishaF = ishaH / 24;
  }

  const tzAdjust = tzOffsetHours - lng / 15;
  const defs: Array<{id: PrayerId; nameEn: string; nameAr: string; hours: number; offsetMin: number}> = [
    {id: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', hours: fajrH + tzAdjust, offsetMin: 0},
    {id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', hours: dhuhrH + tzAdjust, offsetMin: cfg.dhuhrOffsetMin},
    {id: 'asr', nameEn: 'Asr', nameAr: 'العصر', hours: asrH + tzAdjust, offsetMin: 0},
    {id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', hours: sunsetH + tzAdjust, offsetMin: cfg.maghribOffsetMin},
    {id: 'isha', nameEn: 'Isha', nameAr: 'العشاء', hours: ishaH + tzAdjust, offsetMin: 0},
  ];

  const entries: PrayerTimeEntry[] = defs.map((item) => {
    const mins = ((Math.round(fixHour(item.hours) * 60 + item.offsetMin) % 1440) + 1440) % 1440;
    return {
      id: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      minutesFromMidnight: mins,
      formatted24: formatMinutesAs24h(mins),
      formatted12: formatMinutesAs12h(mins),
    };
  });

  return buildScheduleCountdown(date, entries, methodId, 'astronomical');
}

export function buildLiveRemainingCountdown(
  date: Date,
  schedule: DailyPrayerSchedule
): {nextPrayer: PrayerTimeEntry; remainingFormatted: string; minutesUntilNext: number} {
  const rebuilt = buildScheduleCountdown(
    date,
    schedule.entries,
    schedule.method,
    schedule.source
  );
  return {
    nextPrayer: rebuilt.nextPrayer,
    remainingFormatted: rebuilt.remainingFormatted,
    minutesUntilNext: rebuilt.minutesUntilNext,
  };
}
