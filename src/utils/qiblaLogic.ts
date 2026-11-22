export interface QiblaCity {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
}

export const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206,
} as const;

export const QIBLA_CITIES: QiblaCity[] = [
  {id: 'casablanca', nameEn: 'Casablanca, Morocco', nameAr: 'الدار البيضاء، المغرب', lat: 33.5731, lng: -7.5898, tzOffsetHours: 1},
  {id: 'rabat', nameEn: 'Rabat, Morocco', nameAr: 'الرباط، المغرب', lat: 34.0209, lng: -6.8416, tzOffsetHours: 1},
  {id: 'makkah', nameEn: 'Makkah, Saudi Arabia', nameAr: 'مكة المكرمة', lat: 21.4225, lng: 39.8262, tzOffsetHours: 3},
  {id: 'madinah', nameEn: 'Madinah, Saudi Arabia', nameAr: 'المدينة المنورة', lat: 24.4672, lng: 39.6111, tzOffsetHours: 3},
  {id: 'cairo', nameEn: 'Cairo, Egypt', nameAr: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357, tzOffsetHours: 2},
  {id: 'istanbul', nameEn: 'Istanbul, Turkey', nameAr: 'إسطنبول، تركيا', lat: 41.0082, lng: 28.9784, tzOffsetHours: 3},
  {id: 'london', nameEn: 'London, UK', nameAr: 'لندن، المملكة المتحدة', lat: 51.5074, lng: -0.1278, tzOffsetHours: 0},
  {id: 'paris', nameEn: 'Paris, France', nameAr: 'باريس، فرنسا', lat: 48.8566, lng: 2.3522, tzOffsetHours: 1},
  {id: 'sylhet', nameEn: 'Sylhet, Bangladesh', nameAr: 'سيلهيت، بنغلاديش', lat: 24.8949, lng: 91.8687, tzOffsetHours: 6},
  {id: 'jakarta', nameEn: 'Jakarta, Indonesia', nameAr: 'جاكرتا، إندونيسيا', lat: -6.2088, lng: 106.8456, tzOffsetHours: 7},
  {id: 'newyork', nameEn: 'New York, USA', nameAr: 'نيويورك، أمريكا', lat: 40.7128, lng: -74.006, tzOffsetHours: -5},
];

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

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
