import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Compass, LocateFixed, RotateCw} from 'lucide-react';
import {
  QIBLA_CITIES,
  computeQiblaBearing,
  getRotationGuidance,
  type QiblaCity,
} from '../utils/qiblaLogic';
import {toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';
import {KaabaIconSvg} from './OrnamentalSvg';

interface QiblaPageProps {
  lang: AppLang;
  t: Translations;
}

const CITY_STORAGE_KEY = 'najm_city';
const DEGREE_TICKS = Array.from({length: 72}, (_, idx) => idx * 5);

function getInitialCity(): QiblaCity {
  try {
    const saved = localStorage.getItem(CITY_STORAGE_KEY);
    if (saved) {
      const match = QIBLA_CITIES.find((c) => c.id === saved);
      if (match) return match;
    }
  } catch {
    // ignore storage restriction
  }
  return QIBLA_CITIES[0];
}

export const QiblaPage: React.FC<QiblaPageProps> = ({lang, t}) => {
  const [selectedCity, setSelectedCity] = useState<QiblaCity>(getInitialCity);
  const [coords, setCoords] = useState<{lat: number; lng: number; labelEn: string; labelAr: string}>(() => {
    const city = getInitialCity();
    return {lat: city.lat, lng: city.lng, labelEn: city.nameEn, labelAr: city.nameAr};
  });
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'active' | 'denied'>('idle');

  const qiblaBearing = useMemo(
    () => computeQiblaBearing(coords.lat, coords.lng),
    [coords.lat, coords.lng]
  );

  const guidance = useMemo(
    () => getRotationGuidance(qiblaBearing, deviceHeading),
    [qiblaBearing, deviceHeading]
  );

  const handleSelectCity = (cityId: string) => {
    const city = QIBLA_CITIES.find((c) => c.id === cityId);
    if (!city) return;
    setSelectedCity(city);
    setCoords({lat: city.lat, lng: city.lng, labelEn: city.nameEn, labelAr: city.nameAr});
    setGpsStatus('idle');
    try {
      localStorage.setItem(CITY_STORAGE_KEY, city.id);
    } catch {
      // ignore storage restriction
    }
  };

  const handleUseGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          labelEn: 'Live GPS Location',
          labelAr: 'الموقع الحالي GPS',
        });
        setGpsStatus('active');
      },
      () => {
        setGpsStatus('denied');
      },
      {enableHighAccuracy: true, timeout: 7000}
    );
  }, []);

  // Attach hardware compass sensor when supported
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOrientation = (ev: DeviceOrientationEvent) => {
      const anyEv = ev as DeviceOrientationEvent & {webkitCompassHeading?: number};
      let heading: number | null = null;
      if (typeof anyEv.webkitCompassHeading === 'number' && !Number.isNaN(anyEv.webkitCompassHeading)) {
        heading = anyEv.webkitCompassHeading;
      } else if (typeof ev.alpha === 'number' && !Number.isNaN(ev.alpha)) {
        heading = (360 - ev.alpha) % 360;
      }
      if (heading !== null) {
        setSensorActive(true);
        setDeviceHeading(Math.round(((heading % 360) + 360) % 360));
      }
    };
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, []);

  const requestCompassPermission = async () => {
    const DevOrient = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DevOrient?.requestPermission === 'function') {
      try {
        const res = await DevOrient.requestPermission();
        if (res === 'granted') setSensorActive(true);
      } catch {
        // user declined
      }
    }
  };

  const dialRotation = -deviceHeading;
  const kaabaAngleFromDeviceForward = guidance.delta;
  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-5 sm:pt-8 pb-8 space-y-4 sm:space-y-5">
      {/* Page Title & Location Bar */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#121212] dark:text-[#F4F4F5]">
          {t.qiblaTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
          {lang === 'ar' ? coords.labelAr : coords.labelEn} ·{' '}
          {coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°
        </p>
      </div>

      {/* Location & GPS Strip */}
      <div className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-3 sm:p-4 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[165px]">
          <label
            htmlFor="qibla-city-select"
            className="text-xs font-medium text-[#6B6A66] dark:text-[#8E8E93] whitespace-nowrap shrink-0"
          >
            {t.selectCityLabel}:
          </label>
          <select
            id="qibla-city-select"
            data-testid="qibla-city-select"
            value={selectedCity.id}
            onChange={(e) => handleSelectCity(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#09090B] px-2.5 py-2 text-xs sm:text-sm font-medium text-[#121212] dark:text-[#F4F4F5] truncate focus:outline-none focus:ring-1 focus:ring-[#0F5132] dark:focus:ring-[#C5A46D]"
          >
            {QIBLA_CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {lang === 'ar' ? city.nameAr : city.nameEn}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleUseGps}
          data-testid="qibla-gps-btn"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#F9F8F6] dark:bg-[#18181C] border border-[#E6E4DF] dark:border-[#222226] px-3 py-2 text-xs font-semibold text-[#0F5132] dark:text-[#C5A46D] hover:border-[#0F5132]/40 dark:hover:border-[#C5A46D]/40 transition-colors whitespace-nowrap"
        >
          <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>
            {gpsStatus === 'loading'
              ? lang === 'ar'
                ? 'جارٍ التحديد...'
                : 'Locating...'
              : gpsStatus === 'active'
                ? lang === 'ar'
                  ? 'موقعك مفعّل'
                  : 'GPS Active'
                : t.useGpsBtn}
          </span>
        </button>
      </div>

      {/* Main Precision Instrument Compass Card */}
      <section className="rounded-2xl border border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] p-5 sm:p-8 flex flex-col items-center space-y-5">
        {/* Top Reference Index Tick */}
        <div className="flex flex-col items-center">
          <div
            className={`w-0.5 h-3 rounded-full transition-colors ${
              guidance.isAligned
                ? 'bg-[#0F5132] dark:bg-[#C5A46D]'
                : 'bg-[#121212]/40 dark:bg-white/40'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Minimalist Apple-Watch-Inspired Precision Compass Dial */}
        <div
          data-testid="qibla-compass-dial"
          className="relative h-60 w-60 sm:h-72 sm:w-72 flex items-center justify-center"
        >
          <div
            className={`relative h-full w-full rounded-full bg-[#F9F8F6] dark:bg-[#09090B] border transition-colors duration-300 ${
              guidance.isAligned
                ? 'border-[#0F5132] dark:border-[#C5A46D] ring-4 ring-[#0F5132]/12 dark:ring-[#C5A46D]/18'
                : 'border-[#E6E4DF] dark:border-[#222226]'
            }`}
          >
            {/* Precision Degree Tick Ring + Cardinal N / E / S / W Markers */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{transform: `rotate(${dialRotation}deg)`}}
            >
              <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                  className="text-[#121212] dark:text-white"
                />
                {DEGREE_TICKS.map((deg) => {
                  const isMajor = deg % 30 === 0;
                  return (
                    <line
                      key={deg}
                      x1="120"
                      y1={isMajor ? '10' : '13'}
                      x2="120"
                      y2={isMajor ? '19' : '17'}
                      stroke="currentColor"
                      strokeOpacity={isMajor ? '0.45' : '0.18'}
                      strokeWidth={isMajor ? '1.3' : '0.8'}
                      strokeLinecap="round"
                      transform={`rotate(${deg} 120 120)`}
                      className={
                        deg === 0
                          ? 'text-[#0F5132] dark:text-[#C5A46D]'
                          : 'text-[#121212] dark:text-[#F4F4F5]'
                      }
                    />
                  );
                })}
              </svg>

              <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-wider text-[#0F5132] dark:text-[#C5A46D]">
                N
              </span>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wider text-[#6B6A66] dark:text-[#8E8E93]">
                S
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#6B6A66] dark:text-[#8E8E93]">
                E
              </span>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#6B6A66] dark:text-[#8E8E93]">
                W
              </span>
            </div>

            {/* Qibla Bearing Vector & Architectural Kaaba Marker */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{transform: `rotate(${kaabaAngleFromDeviceForward}deg)`}}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white dark:bg-[#121215] border border-[#0F5132]/40 dark:border-[#C5A46D]/45 shadow-sm flex items-center justify-center text-[#0F5132] dark:text-[#C5A46D]">
                <KaabaIconSvg className="h-4 w-4" />
              </div>

              <svg
                viewBox="0 0 80 200"
                className="h-full w-full p-12"
                aria-hidden="true"
              >
                {/* Upper Directional Needle */}
                <path
                  d="M40 16 L46 96 L34 96 Z"
                  className="fill-[#0F5132] dark:fill-[#C5A46D]"
                />
                {/* Tail Counterweight */}
                <path
                  d="M36 104 L44 104 L40 132 Z"
                  className="fill-[#121212]/20 dark:fill-white/25"
                />
                {/* Center Pivot */}
                <circle
                  cx="40"
                  cy="100"
                  r="6.5"
                  className="fill-white dark:fill-[#121215] stroke-[#0F5132] dark:stroke-[#C5A46D]"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bearing Readout */}
        <div className="w-full max-w-xs rounded-xl bg-[#F9F8F6] dark:bg-[#09090B] border border-[#E6E4DF] dark:border-[#222226] px-5 py-3.5 text-center space-y-0.5">
          <div
            data-testid="qibla-angle-readout"
            className="text-2xl sm:text-3xl font-semibold text-[#121212] dark:text-[#F4F4F5] tabular-nums"
          >
            {numFmt(qiblaBearing)}°
          </div>
          <p className="text-xs font-medium text-[#6B6A66] dark:text-[#8E8E93]">
            {t.qiblaAngleLabel}
          </p>
        </div>

        {/* Alignment Status Pill */}
        <div
          data-testid="qibla-guidance-pill"
          className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold tabular-nums transition-colors ${
            guidance.isAligned
              ? 'bg-[#0F5132] dark:bg-[#C5A46D] text-white dark:text-[#09090B]'
              : 'bg-[#F9F8F6] dark:bg-[#18181C] text-[#0F5132] dark:text-[#C5A46D] border border-[#E6E4DF] dark:border-[#222226]'
          }`}
        >
          {lang === 'ar' ? guidance.labelAr : guidance.labelEn}
        </div>

        {/* Calibration / Manual Heading Control */}
        <div className="w-full max-w-sm pt-3 border-t border-[#E6E4DF] dark:border-[#222226] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6A66] dark:text-[#8E8E93] tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-[#0F5132] dark:text-[#C5A46D]" strokeWidth={1.5} />
              <span>{t.compassCalibrationHint}</span>
            </span>
            <span className="font-semibold text-[#121212] dark:text-[#F4F4F5]">
              {numFmt(deviceHeading)}°
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="range"
              min={0}
              max={359}
              value={deviceHeading}
              onChange={(e) => setDeviceHeading(Number(e.target.value))}
              aria-label={t.compassCalibrationHint}
              className="flex-1 accent-[#0F5132] dark:accent-[#C5A46D] cursor-pointer"
            />
            {!sensorActive && (
              <button
                type="button"
                onClick={() => void requestCompassPermission()}
                aria-label="Enable compass sensors"
                className="p-2 rounded-xl border border-[#E6E4DF] dark:border-[#222226] bg-[#F9F8F6] dark:bg-[#18181C] text-[#0F5132] dark:text-[#C5A46D]"
              >
                <RotateCw className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
