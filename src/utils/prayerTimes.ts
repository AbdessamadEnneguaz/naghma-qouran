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
  remainingFormatted: string;
}

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
  const ra = Math.atan2(Math.cos(e * DEG) * Math.sin(l * DEG), Math.cos(l * DEG)) * RAD / 15;
  const eqT = q / 15 - fixHour(ra);
  const decl = Math.asin(Math.sin(e * DEG) * Math.sin(l * DEG)) * RAD;
  return {declination: decl, equationOfTime: eqT};
}

function hourAngleForElevation(lat: number, decl: number, angleBelowHorizonDeg: number): number {
  const num =
    -Math.sin(angleBelowHorizonDeg * DEG) - Math.sin(lat * DEG) * Math.sin(decl * DEG);
  const den = Math.cos(lat * DEG) * Math.cos(decl * DEG);
  const ratio = Math.min(1, Math.max(-1, num / den));
  return (Math.acos(ratio) * RAD) / 15;
}

function asrHourAngle(lat: number, decl: number, shadowFactor = 1): number {
  const elevationRad = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(lat - decl) * DEG)));
  const num = Math.sin(elevationRad) - Math.sin(lat * DEG) * Math.sin(decl * DEG);
  const den = Math.cos(lat * DEG) * Math.cos(decl * DEG);
  const ratio = Math.min(1, Math.max(-1, num / den));
  return (Math.acos(ratio) * RAD) / 15;
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

/**
 * Pure astronomical computation of daily 5 Salah times using standard MWL angles (Fajr 18°, Isha 17°).
 */
export function computeDailyPrayerSchedule(
  date: Date,
  lat: number,
  lng: number,
  tzOffsetHours: number
): DailyPrayerSchedule {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / 360;
  const {declination, equationOfTime} = sunPosition(jd + 0.5);

  const dhuhrHours = fixHour(12 + tzOffsetHours - lng / 15 - equationOfTime);
  const fajrHours = dhuhrHours - hourAngleForElevation(lat, declination, 18);
  const asrHours = dhuhrHours + asrHourAngle(lat, declination, 1);
  const maghribHours = dhuhrHours + hourAngleForElevation(lat, declination, 0.833);
  const ishaHours = dhuhrHours + hourAngleForElevation(lat, declination, 17);

  const defs: Array<{id: PrayerId; nameEn: string; nameAr: string; hours: number}> = [
    {id: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', hours: fajrHours},
    {id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', hours: dhuhrHours},
    {id: 'asr', nameEn: 'Asr', nameAr: 'العصر', hours: asrHours},
    {id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', hours: maghribHours},
    {id: 'isha', nameEn: 'Isha', nameAr: 'العشاء', hours: ishaHours},
  ];

  const entries: PrayerTimeEntry[] = defs.map((item) => {
    const mins = Math.round(fixHour(item.hours) * 60);
    return {
      id: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      minutesFromMidnight: mins,
      formatted24: formatMinutesAs24h(mins),
      formatted12: formatMinutesAs12h(mins),
    };
  });

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  let next = entries.find((e) => e.minutesFromMidnight > nowMinutes);
  let minutesUntilNext = 0;

  if (next) {
    minutesUntilNext = next.minutesFromMidnight - nowMinutes;
  } else {
    next = entries[0];
    minutesUntilNext = 1440 - nowMinutes + next.minutesFromMidnight;
  }

  const remH = Math.floor(minutesUntilNext / 60);
  const remM = minutesUntilNext % 60;
  const sec = 59 - date.getSeconds();
  const remainingFormatted = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return {
    entries,
    nextPrayer: next,
    minutesUntilNext,
    remainingFormatted,
  };
}
