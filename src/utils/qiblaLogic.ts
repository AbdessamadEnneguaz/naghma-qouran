export type PrayerMethodId =
  | 'habous'
  | 'mwl'
  | 'umm_al_qura'
  | 'egypt'
  | 'isna'
  | 'uoif'
  | 'diyanet';

export interface QiblaCity {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
  ianaTz: string;
  defaultMethod: PrayerMethodId;
}

export interface ActiveLocationState {
  mode: 'city' | 'gps';
  cityId: string;
  lat: number;
  lng: number;
  nameEn: string;
  nameAr: string;
  ianaTz: string;
  tzOffsetHours: number;
  method: PrayerMethodId;
}

export const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206,
} as const;

export const QIBLA_CITIES: QiblaCity[] = [
  {id: 'casablanca', nameEn: 'Casablanca, Morocco', nameAr: 'الدار البيضاء، المغرب', lat: 33.5731, lng: -7.5898, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'rabat', nameEn: 'Rabat, Morocco', nameAr: 'الرباط، المغرب', lat: 34.0209, lng: -6.8416, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'marrakech', nameEn: 'Marrakech, Morocco', nameAr: 'مراكش، المغرب', lat: 31.6295, lng: -7.9811, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'fes', nameEn: 'Fes, Morocco', nameAr: 'فاس، المغرب', lat: 34.0181, lng: -5.0078, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'tangier', nameEn: 'Tangier, Morocco', nameAr: 'طنجة، المغرب', lat: 35.7595, lng: -5.834, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'agadir', nameEn: 'Agadir, Morocco', nameAr: 'أكادير، المغرب', lat: 30.4278, lng: -9.5981, tzOffsetHours: 1, ianaTz: 'Africa/Casablanca', defaultMethod: 'habous'},
  {id: 'algiers', nameEn: 'Algiers, Algeria', nameAr: 'الجزائر العاصمة', lat: 36.7538, lng: 3.0588, tzOffsetHours: 1, ianaTz: 'Africa/Algiers', defaultMethod: 'egypt'},
  {id: 'tunis', nameEn: 'Tunis, Tunisia', nameAr: 'تونس العاصمة', lat: 36.8065, lng: 10.1815, tzOffsetHours: 1, ianaTz: 'Africa/Tunis', defaultMethod: 'mwl'},
  {id: 'makkah', nameEn: 'Makkah, Saudi Arabia', nameAr: 'مكة المكرمة', lat: 21.4225, lng: 39.8262, tzOffsetHours: 3, ianaTz: 'Asia/Riyadh', defaultMethod: 'umm_al_qura'},
  {id: 'madinah', nameEn: 'Madinah, Saudi Arabia', nameAr: 'المدينة المنورة', lat: 24.4672, lng: 39.6111, tzOffsetHours: 3, ianaTz: 'Asia/Riyadh', defaultMethod: 'umm_al_qura'},
  {id: 'dubai', nameEn: 'Dubai, UAE', nameAr: 'دبي، الإمارات', lat: 25.2048, lng: 55.2708, tzOffsetHours: 4, ianaTz: 'Asia/Dubai', defaultMethod: 'umm_al_qura'},
  {id: 'cairo', nameEn: 'Cairo, Egypt', nameAr: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357, tzOffsetHours: 2, ianaTz: 'Africa/Cairo', defaultMethod: 'egypt'},
  {id: 'istanbul', nameEn: 'Istanbul, Turkey', nameAr: 'إسطنبول، تركيا', lat: 41.0082, lng: 28.9784, tzOffsetHours: 3, ianaTz: 'Europe/Istanbul', defaultMethod: 'diyanet'},
  {id: 'paris', nameEn: 'Paris, France', nameAr: 'باريس، فرنسا', lat: 48.8566, lng: 2.3522, tzOffsetHours: 1, ianaTz: 'Europe/Paris', defaultMethod: 'uoif'},
  {id: 'brussels', nameEn: 'Brussels, Belgium', nameAr: 'بروكسل، بلجيكا', lat: 50.8503, lng: 4.3517, tzOffsetHours: 1, ianaTz: 'Europe/Brussels', defaultMethod: 'mwl'},
  {id: 'madrid', nameEn: 'Madrid, Spain', nameAr: 'مدريد، إسبانيا', lat: 40.4168, lng: -3.7038, tzOffsetHours: 1, ianaTz: 'Europe/Madrid', defaultMethod: 'mwl'},
  {id: 'amsterdam', nameEn: 'Amsterdam, Netherlands', nameAr: 'أمستردام، هولندا', lat: 52.3676, lng: 4.9041, tzOffsetHours: 1, ianaTz: 'Europe/Amsterdam', defaultMethod: 'mwl'},
  {id: 'london', nameEn: 'London, UK', nameAr: 'لندن، المملكة المتحدة', lat: 51.5074, lng: -0.1278, tzOffsetHours: 0, ianaTz: 'Europe/London', defaultMethod: 'mwl'},
  {id: 'newyork', nameEn: 'New York, USA', nameAr: 'نيويورك، أمريكا', lat: 40.7128, lng: -74.006, tzOffsetHours: -5, ianaTz: 'America/New_York', defaultMethod: 'isna'},
  {id: 'montreal', nameEn: 'Montreal, Canada', nameAr: 'مونتريال، كندا', lat: 45.5017, lng: -73.5673, tzOffsetHours: -5, ianaTz: 'America/Toronto', defaultMethod: 'isna'},
  {id: 'sylhet', nameEn: 'Sylhet, Bangladesh', nameAr: 'سيلهيت، بنغلاديش', lat: 24.8949, lng: 91.8687, tzOffsetHours: 6, ianaTz: 'Asia/Dhaka', defaultMethod: 'mwl'},
  {id: 'jakarta', nameEn: 'Jakarta, Indonesia', nameAr: 'جاكرتا، إندونيسيا', lat: -6.2088, lng: 106.8456, tzOffsetHours: 7, ianaTz: 'Asia/Jakarta', defaultMethod: 'mwl'},
];

const CITY_STORAGE_KEY = 'najm_city';
const GPS_LOCATION_STORAGE_KEY = 'mihrab_gps_location_v1';
const METHOD_STORAGE_KEY = 'mihrab_prayer_method_v1';
export const LOCATION_UPDATED_EVENT = 'mihrab:location-updated';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Resolves exact UTC offset in hours for an IANA timezone on a given date (DST-aware).
 */
export function resolveTimezoneOffsetHours(
  ianaTz: string | undefined,
  date: Date,
  fallbackOffsetHours: number
): number {
  if (!ianaTz) return fallbackOffsetHours;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTz,
      timeZoneName: 'shortOffset',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const match = tzPart.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) {
      if (tzPart === 'GMT' || tzPart === 'UTC') return 0;
      return fallbackOffsetHours;
    }
    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2] || 0);
    const mins = Number(match[3] || 0);
    return sign * (hours + mins / 60);
  } catch {
    return fallbackOffsetHours;
  }
}

export function resolveCityTimezoneOffsetHours(city: QiblaCity, date: Date = new Date()): number {
  return resolveTimezoneOffsetHours(city.ianaTz, date, city.tzOffsetHours);
}

export function inferPrayerMethodForCoords(lat: number, lng: number): PrayerMethodId {
  // Morocco bounding region -> Official Ministry of Habous & Islamic Affairs
  if (lat >= 20.5 && lat <= 36.2 && lng >= -17.5 && lng <= -0.8) {
    return 'habous';
  }
  // Arabian Peninsula -> Umm Al-Qura
  if (lat >= 15 && lat <= 32.5 && lng >= 34 && lng <= 60) {
    return 'umm_al_qura';
  }
  // Egypt / North Africa East -> Egyptian General Authority
  if (lat >= 22 && lat <= 32 && lng >= 24 && lng <= 34.5) {
    return 'egypt';
  }
  // France -> UOIF 12 deg
  if (lat >= 41.3 && lat <= 51.2 && lng >= -5.2 && lng <= 9.6) {
    return 'uoif';
  }
  // Turkey -> Diyanet
  if (lat >= 35.8 && lat <= 42.2 && lng >= 26 && lng <= 45) {
    return 'diyanet';
  }
  // North America -> ISNA
  if (lat >= 24 && lat <= 70 && lng >= -170 && lng <= -52) {
    return 'isna';
  }
  return 'mwl';
}

export function findNearestQiblaCity(lat: number, lng: number): QiblaCity {
  let best = QIBLA_CITIES[0];
  let bestDist = Infinity;
  for (const city of QIBLA_CITIES) {
    const dLat = city.lat - lat;
    const dLng = city.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}

export function loadStoredPrayerMethod(fallbackMethod: PrayerMethodId): PrayerMethodId {
  try {
    const saved = localStorage.getItem(METHOD_STORAGE_KEY) as PrayerMethodId | null;
    if (
      saved === 'habous' ||
      saved === 'mwl' ||
      saved === 'umm_al_qura' ||
      saved === 'egypt' ||
      saved === 'isna' ||
      saved === 'uoif' ||
      saved === 'diyanet'
    ) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return fallbackMethod;
}

export function saveStoredPrayerMethod(method: PrayerMethodId): void {
  try {
    localStorage.setItem(METHOD_STORAGE_KEY, method);
    window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function loadActiveLocation(date: Date = new Date()): ActiveLocationState {
  let city = QIBLA_CITIES[0];
  try {
    const gpsRaw = localStorage.getItem(GPS_LOCATION_STORAGE_KEY);
    if (gpsRaw) {
      const gps = JSON.parse(gpsRaw) as {
        lat?: number;
        lng?: number;
        nameEn?: string;
        nameAr?: string;
      };
      if (typeof gps.lat === 'number' && typeof gps.lng === 'number') {
        const nearest = findNearestQiblaCity(gps.lat, gps.lng);
        const inferred = inferPrayerMethodForCoords(gps.lat, gps.lng);
        const localTz =
          typeof Intl !== 'undefined'
            ? Intl.DateTimeFormat().resolvedOptions().timeZone || nearest.ianaTz
            : nearest.ianaTz;
        const offset = -date.getTimezoneOffset() / 60;
        return {
          mode: 'gps',
          cityId: nearest.id,
          lat: gps.lat,
          lng: gps.lng,
          nameEn: gps.nameEn || `GPS (${nearest.nameEn.split(',')[0]})`,
          nameAr: gps.nameAr || `GPS (${nearest.nameAr.split('،')[0]})`,
          ianaTz: localTz,
          tzOffsetHours: Number.isFinite(offset)
            ? offset
            : resolveCityTimezoneOffsetHours(nearest, date),
          method: loadStoredPrayerMethod(inferred),
        };
      }
    }
    const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
    if (savedCity) {
      const match = QIBLA_CITIES.find((c) => c.id === savedCity);
      if (match) city = match;
    }
  } catch {
    // ignore storage restriction
  }

  return {
    mode: 'city',
    cityId: city.id,
    lat: city.lat,
    lng: city.lng,
    nameEn: city.nameEn,
    nameAr: city.nameAr,
    ianaTz: city.ianaTz,
    tzOffsetHours: resolveCityTimezoneOffsetHours(city, date),
    method: loadStoredPrayerMethod(city.defaultMethod),
  };
}

export function saveSelectedCity(cityId: string): ActiveLocationState {
  const city = QIBLA_CITIES.find((c) => c.id === cityId) || QIBLA_CITIES[0];
  try {
    localStorage.setItem(CITY_STORAGE_KEY, city.id);
    localStorage.removeItem(GPS_LOCATION_STORAGE_KEY);
    localStorage.setItem(METHOD_STORAGE_KEY, city.defaultMethod);
    window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT));
  } catch {
    // ignore
  }
  return loadActiveLocation();
}

export function saveGpsLocation(lat: number, lng: number): ActiveLocationState {
  const nearest = findNearestQiblaCity(lat, lng);
  const inferred = inferPrayerMethodForCoords(lat, lng);
  try {
    localStorage.setItem(
      GPS_LOCATION_STORAGE_KEY,
      JSON.stringify({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        nameEn: `GPS · ${nearest.nameEn.split(',')[0]}`,
        nameAr: `موقعك · ${nearest.nameAr.split('،')[0]}`,
      })
    );
    localStorage.setItem(CITY_STORAGE_KEY, nearest.id);
    localStorage.setItem(METHOD_STORAGE_KEY, inferred);
    window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT));
  } catch {
    // ignore
  }
  return loadActiveLocation();
}

/**
 * Great-circle initial bearing from (lat, lng) to the Holy Kaaba (degrees clockwise from North, 0..360).
 */
export function computeQiblaBearing(lat: number, lng: number): number {
  const phi1 = lat * DEG_TO_RAD;
  const phi2 = KAABA_COORDS.lat * DEG_TO_RAD;
  const dLambda = (KAABA_COORDS.lng - lng) * DEG_TO_RAD;

  const y = Math.sin(dLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);

  if (Math.abs(x) < 1e-12 && Math.abs(y) < 1e-12) {
    return 0;
  }

  const bearing = Math.atan2(y, x) * RAD_TO_DEG;
  return Math.round(((bearing % 360) + 360) % 360);
}

/**
 * Computes signed angle delta (-180..+180) from deviceHeading to qiblaBearing.
 * Negative = turn left (counter-clockwise), Positive = turn right (clockwise).
 */
export function computeQiblaDelta(qiblaBearing: number, deviceHeading: number): number {
  const diff = (((qiblaBearing - deviceHeading) % 360) + 540) % 360 - 180;
  return Math.round(diff);
}

export interface RotationGuidance {
  delta: number;
  isAligned: boolean;
  direction: 'aligned' | 'left' | 'right';
  labelEn: string;
  labelAr: string;
}

export function getRotationGuidance(
  qiblaBearing: number,
  deviceHeading: number
): RotationGuidance {
  const delta = computeQiblaDelta(qiblaBearing, deviceHeading);
  const absDeg = Math.abs(delta);

  if (absDeg <= 5) {
    return {
      delta,
      isAligned: true,
      direction: 'aligned',
      labelEn: 'You are facing the Qibla',
      labelAr: 'أنت تتجه نحو القبلة الآن',
    };
  }

  if (delta < 0) {
    return {
      delta,
      isAligned: false,
      direction: 'left',
      labelEn: `Rotate the phone ${absDeg}° to the left`,
      labelAr: `أدِر الهاتف ${absDeg}° إلى اليسار`,
    };
  }

  return {
    delta,
    isAligned: false,
    direction: 'right',
    labelEn: `Rotate the phone ${absDeg}° to the right`,
    labelAr: `أدِر الهاتف ${absDeg}° إلى اليمين`,
  };
}
