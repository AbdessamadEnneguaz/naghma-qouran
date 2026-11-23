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

  // Dial rotates counter to heading so top edge is device forward; needle + Kaaba lock to qibla delta
  const dialRotation = -deviceHeading;
  const kaabaAngleFromDeviceForward = guidance.delta;
  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-5 sm:pt-8 pb-8 space-y-4 sm:space-y-5">
      {/* Page Title & Location Bar */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D231E] dark:text-[#FAF5EE] uppercase">
          {t.qiblaTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
          {lang === 'ar' ? coords.labelAr : coords.labelEn} ·{' '}
          {coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°
        </p>
      </div>

      {/* Location & GPS Strip */}
      <div className="rounded-3xl border border-amber-500/15 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-3 sm:p-4 shadow-sm shadow-amber-500/5 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[165px]">
          <label
            htmlFor="qibla-city-select"
            className="text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8] whitespace-nowrap shrink-0"
          >
            {t.selectCityLabel}:
          </label>
          <select
            id="qibla-city-select"
            data-testid="qibla-city-select"
            value={selectedCity.id}
            onChange={(e) => handleSelectCity(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-2.5 py-2 text-xs sm:text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE] truncate focus:outline-none focus:ring-2 focus:ring-[#D97706]"
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
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/25 px-3 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/25 transition-colors whitespace-nowrap"
        >
          <LocateFixed className="h-3.5 w-3.5" />
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

      {/* Main 3D Gold Compass Card */}
      <section className="rounded-3xl border border-amber-500/15 bg-white/90 dark:bg-[#211914]/92 md:bg-white/75 md:dark:bg-[#211914]/85 md:backdrop-blur-md p-5 sm:p-8 shadow-sm shadow-amber-500/5 flex flex-col items-center space-y-4 sm:space-y-5">
        {/* Top Direction Target Triangle */}
        <div className="flex flex-col items-center">
          <div
            className={`w-0 h-0 border-x-[7px] border-x-transparent border-t-[10px] transition-colors ${
              guidance.isAligned ? 'border-t-[#059669]' : 'border-t-[#F97316]'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* 3D Warm Gold Compass Dial */}
        <div
          data-testid="qibla-compass-dial"
          className="relative h-56 w-56 sm:h-72 sm:w-72 flex items-center justify-center"
        >
          {/* Outer Rim Shadow + Gradient */}
          <div
            className={`relative h-full w-full rounded-full bg-gradient-to-b from-amber-100/90 via-[#FDFBF7] to-white dark:from-[#32241A] dark:via-[#221914] dark:to-[#18110D] shadow-lg border-4 transition-colors duration-300 ${
              guidance.isAligned
                ? 'border-[#D97706] ring-4 ring-amber-400/25'
                : 'border-amber-500/25 dark:border-amber-500/30'
            }`}
          >
            {/* Cardinal N / E / S / W Markers (rotate smoothly with device heading) */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{transform: `rotate(${dialRotation}deg)`}}
            >
              <span className="absolute top-3.5 left-1/2 -translate-x-1/2 text-sm font-bold text-[#B45309] dark:text-[#FBBF24]">
                N
              </span>
              <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 text-sm font-bold text-[#6E5649] dark:text-[#D6C7B8]">
                S
              </span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E5649] dark:text-[#D6C7B8]">
                E
              </span>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E5649] dark:text-[#D6C7B8]">
                W
              </span>

              {/* 4 Corner Calibration Dots */}
              {[45, 135, 225, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0"
                  style={{transform: `rotate(${deg}deg)`}}
                >
                  <span className="block mx-auto mt-7 h-1.5 w-1.5 rounded-full bg-amber-600/40 dark:bg-amber-400/40" />
                </div>
              ))}
            </div>

            {/* Qibla Direction Overlay (Kaaba Anchor + 3D Orange Needle) */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{transform: `rotate(${kaabaAngleFromDeviceForward}deg)`}}
            >
              {/* Tiny Kaaba Icon on Perimeter */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#FDFBF7] dark:bg-[#221914] border border-amber-500/30 shadow-md flex items-center justify-center">
                <KaabaIconSvg className="h-4.5 w-4.5" />
              </div>

              {/* 3D Sunset-Orange Tapered Needle */}
              <svg
                viewBox="0 0 80 200"
                className="h-full w-full p-12 drop-shadow-sm"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                {/* Needle Point */}
                <path
                  d="M40 16 L49 98 L31 98 Z"
                  fill="url(#needleGrad)"
                />
                {/* Tail Counterweight */}
                <path
                  d="M34 102 L46 102 L40 132 Z"
                  fill="#D6C7B8"
                  fillOpacity="0.6"
                />
                {/* Pivot Cap */}
                <circle
                  cx="40"
                  cy="100"
                  r="11"
                  fill="url(#needleGrad)"
                  stroke="#FDFBF7"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Angle Readout Card */}
        <div className="w-full max-w-xs rounded-2xl bg-[#FAF5EE] dark:bg-[#17110D] border border-amber-500/15 px-5 py-3.5 text-center space-y-0.5">
          <div
            data-testid="qibla-angle-readout"
            className="text-2xl sm:text-3xl font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
          >
            {numFmt(qiblaBearing)}°
          </div>
          <p className="text-xs font-medium text-[#6E5649] dark:text-[#D6C7B8]">
            {t.qiblaAngleLabel}
          </p>
        </div>

        {/* Rotation Guidance Pill */}
        <div
          data-testid="qibla-guidance-pill"
          className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold tabular-nums transition-colors ${
            guidance.isAligned
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-500/14 text-[#B45309] dark:text-[#FBBF24] border border-amber-500/20'
          }`}
        >
          {lang === 'ar' ? guidance.labelAr : guidance.labelEn}
        </div>

        {/* Calibration / Manual Heading Control */}
        <div className="w-full max-w-sm pt-2 border-t border-amber-500/12 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-[#D97706]" />
              <span>{t.compassCalibrationHint}</span>
            </span>
            <span className="font-semibold text-[#B45309] dark:text-[#FBBF24]">
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
              className="flex-1 accent-[#D97706] cursor-pointer"
            />
            {!sensorActive && (
              <button
                type="button"
                onClick={() => void requestCompassPermission()}
                aria-label="Enable compass sensors"
                className="p-2 rounded-xl border border-amber-500/20 bg-[#FAF5EE] dark:bg-[#17110D] text-[#B45309] dark:text-[#FBBF24]"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
