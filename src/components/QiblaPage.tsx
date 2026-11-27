import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Clock, Compass, LocateFixed, RotateCw} from 'lucide-react';
import {
  LOCATION_UPDATED_EVENT,
  QIBLA_CITIES,
  computeQiblaBearing,
  getRotationGuidance,
  loadActiveLocation,
  saveGpsLocation,
  saveSelectedCity,
  saveStoredPrayerMethod,
  type ActiveLocationState,
  type PrayerMethodId,
} from '../utils/qiblaLogic';
import {
  PRAYER_METHODS,
  computeDailyPrayerSchedule,
  fetchOfficialPrayerEntries,
  type PrayerTimeEntry,
} from '../utils/prayerTimes';
import {toArabicDigits} from '../utils/quranLogic';
import type {AppLang, Translations} from '../i18n/translations';
import {KaabaIconSvg} from './OrnamentalSvg';

interface QiblaPageProps {
  lang: AppLang;
  t: Translations;
}

const DEGREE_TICKS = Array.from({length: 72}, (_, idx) => idx * 5);

export const QiblaPage: React.FC<QiblaPageProps> = ({lang, t}) => {
  const [activeLoc, setActiveLoc] = useState<ActiveLocationState>(() => loadActiveLocation());
  const [officialEntries, setOfficialEntries] = useState<PrayerTimeEntry[] | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'active' | 'denied'>(() =>
    activeLoc.mode === 'gps' ? 'active' : 'idle'
  );

  useEffect(() => {
    const syncLoc = () => setActiveLoc(loadActiveLocation());
    window.addEventListener(LOCATION_UPDATED_EVENT, syncLoc);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, syncLoc);
  }, []);

  useEffect(() => {
    let active = true;
    setOfficialEntries(null);
    void fetchOfficialPrayerEntries(
      new Date(),
      activeLoc.lat,
      activeLoc.lng,
      activeLoc.method,
      activeLoc.ianaTz
    ).then((entries) => {
      if (active && entries) setOfficialEntries(entries);
    });
    return () => {
      active = false;
    };
  }, [activeLoc.lat, activeLoc.lng, activeLoc.method, activeLoc.ianaTz]);

  const prayerSchedule = useMemo(
    () =>
      computeDailyPrayerSchedule(
        new Date(),
        activeLoc.lat,
        activeLoc.lng,
        activeLoc.tzOffsetHours,
        {
          method: activeLoc.method,
          officialEntries,
        }
      ),
    [activeLoc, officialEntries]
  );

  const qiblaBearing = useMemo(
    () => computeQiblaBearing(activeLoc.lat, activeLoc.lng),
    [activeLoc.lat, activeLoc.lng]
  );

  const guidance = useMemo(
    () => getRotationGuidance(qiblaBearing, deviceHeading),
    [qiblaBearing, deviceHeading]
  );

  const handleSelectCity = (cityId: string) => {
    setActiveLoc(saveSelectedCity(cityId));
    setGpsStatus('idle');
  };

  const handleSelectMethod = (method: PrayerMethodId) => {
    saveStoredPrayerMethod(method);
    setActiveLoc(loadActiveLocation());
  };

  const handleUseGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setActiveLoc(saveGpsLocation(pos.coords.latitude, pos.coords.longitude));
        setGpsStatus('active');
      },
      () => {
        setGpsStatus('denied');
      },
      {enableHighAccuracy: true, timeout: 7000}
    );
  }, []);

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
      {/* Page Title & Coordinates */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#142019] dark:text-[#F1F5F3]">
          {t.qiblaTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
          {lang === 'ar' ? activeLoc.nameAr : activeLoc.nameEn} ·{' '}
          {activeLoc.lat.toFixed(2)}°, {activeLoc.lng.toFixed(2)}°
        </p>
      </div>

      {/* Location, GPS & Exact Authority Method Strip */}
      <div className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-[165px]">
            <label
              htmlFor="qibla-city-select"
              className="text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] whitespace-nowrap shrink-0"
            >
              {t.selectCityLabel}:
            </label>
            <select
              id="qibla-city-select"
              data-testid="qibla-city-select"
              value={activeLoc.cityId}
              onChange={(e) => handleSelectCity(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2.5 py-2 text-xs sm:text-sm font-medium text-[#142019] dark:text-[#F1F5F3] truncate focus:outline-none focus:ring-1 focus:ring-[#27784C] dark:focus:ring-[#52B77F]"
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
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#F4F7F5] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26] px-3 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C]/40 dark:hover:border-[#52B77F]/40 transition-colors whitespace-nowrap"
          >
            <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>
              {gpsStatus === 'loading'
                ? lang === 'ar'
                  ? 'جارٍ التحديد...'
                  : 'Locating...'
                : gpsStatus === 'active'
                  ? lang === 'ar'
                    ? 'GPS مفعّل'
                    : 'GPS Active'
                  : t.useGpsBtn}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-[#E2EAE5]/70 dark:border-[#1E2E26]/70">
          <label
            htmlFor="prayer-method-select"
            className="text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'طريقة الحساب:' : 'Method:'}
          </label>
          <select
            id="prayer-method-select"
            data-testid="prayer-method-select"
            value={activeLoc.method}
            onChange={(e) => handleSelectMethod(e.target.value as PrayerMethodId)}
            className="min-w-0 flex-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2.5 py-1.5 text-xs font-medium text-[#142019] dark:text-[#F1F5F3] truncate focus:outline-none focus:ring-1 focus:ring-[#27784C] dark:focus:ring-[#52B77F]"
          >
            {Object.values(PRAYER_METHODS).map((m) => (
              <option key={m.id} value={m.id}>
                {lang === 'ar' ? m.nameAr : m.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exact 5 Daily Prayers Card */}
      <section
        aria-label={t.prayerTimesTitle}
        data-testid="qibla-prayer-schedule"
        className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]">
            <Clock className="h-4 w-4 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.75} />
            <span>{t.prayerTimesTitle}</span>
          </div>
          <span className="text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]">
            {prayerSchedule.source === 'official-api'
              ? lang === 'ar'
                ? 'توقيت رسمي مطابق'
                : 'Official Synced'
              : lang === 'ar'
                ? 'حساب فلكي دقيق'
                : 'Precision Calculation'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {prayerSchedule.entries.map((entry) => {
            const isNext = entry.id === prayerSchedule.nextPrayer.id;
            return (
              <div
                key={entry.id}
                className={`rounded-xl p-2 sm:p-3 text-center border transition-colors ${
                  isNext
                    ? 'emerald-3d-hero text-white border-transparent'
                    : 'bg-[#F4F7F5] dark:bg-[#0A110E] border-[#E2EAE5] dark:border-[#1E2E26] text-[#142019] dark:text-[#F1F5F3]'
                }`}
              >
                <div className={`text-[10.5px] sm:text-xs font-medium ${isNext ? 'text-white/90' : 'text-[#5A6B62] dark:text-[#92A59B]'}`}>
                  {lang === 'ar' ? entry.nameAr : entry.nameEn}
                </div>
                <div className="text-xs sm:text-sm font-bold tabular-nums mt-0.5">
                  {entry.formatted24}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Precision Instrument Compass Card */}
      <section className="rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-8 flex flex-col items-center space-y-5">
        <div className="flex flex-col items-center">
          <div
            className={`w-0.5 h-3 rounded-full transition-colors ${
              guidance.isAligned
                ? 'bg-[#27784C] dark:bg-[#52B77F]'
                : 'bg-[#142019]/40 dark:bg-white/40'
            }`}
            aria-hidden="true"
          />
        </div>

        <div
          data-testid="qibla-compass-dial"
          className="relative h-60 w-60 sm:h-72 sm:w-72 flex items-center justify-center"
        >
          <div
            className={`relative h-full w-full rounded-full bg-[#F4F7F5] dark:bg-[#0A110E] border transition-colors duration-300 ${
              guidance.isAligned
                ? 'border-[#27784C] dark:border-[#52B77F] ring-4 ring-[#27784C]/12 dark:ring-[#52B77F]/18'
                : 'border-[#E2EAE5] dark:border-[#1E2E26]'
            }`}
          >
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
                  className="text-[#142019] dark:text-white"
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
                          ? 'text-[#27784C] dark:text-[#52B77F]'
                          : 'text-[#142019] dark:text-[#F1F5F3]'
                      }
                    />
                  );
                })}
              </svg>

              <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-wider text-[#27784C] dark:text-[#52B77F]">
                N
              </span>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]">
                S
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]">
                E
              </span>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]">
                W
              </span>
            </div>

            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{transform: `rotate(${kaabaAngleFromDeviceForward}deg)`}}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white dark:bg-[#111C17] border border-[#27784C]/40 dark:border-[#52B77F]/45 shadow-sm flex items-center justify-center text-[#27784C] dark:text-[#52B77F]">
                <KaabaIconSvg className="h-4 w-4" />
              </div>

              <svg viewBox="0 0 80 200" className="h-full w-full p-12" aria-hidden="true">
                <path d="M40 16 L46 96 L34 96 Z" className="fill-[#27784C] dark:fill-[#52B77F]" />
                <path
                  d="M36 104 L44 104 L40 132 Z"
                  className="fill-[#142019]/20 dark:fill-white/25"
                />
                <circle
                  cx="40"
                  cy="100"
                  r="6.5"
                  className="fill-white dark:fill-[#111C17] stroke-[#27784C] dark:stroke-[#52B77F]"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs rounded-xl bg-[#F4F7F5] dark:bg-[#0A110E] border border-[#E2EAE5] dark:border-[#1E2E26] px-5 py-3.5 text-center space-y-0.5">
          <div
            data-testid="qibla-angle-readout"
            className="text-2xl sm:text-3xl font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
          >
            {numFmt(qiblaBearing)}°
          </div>
          <p className="text-xs font-medium text-[#5A6B62] dark:text-[#92A59B]">
            {t.qiblaAngleLabel}
          </p>
        </div>

        <div
          data-testid="qibla-guidance-pill"
          className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold tabular-nums transition-colors ${
            guidance.isAligned
              ? 'bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]'
              : 'bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F] border border-[#E2EAE5] dark:border-[#1E2E26]'
          }`}
        >
          {lang === 'ar' ? guidance.labelAr : guidance.labelEn}
        </div>

        <div className="w-full max-w-sm pt-3 border-t border-[#E2EAE5] dark:border-[#1E2E26] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
              <span>{t.compassCalibrationHint}</span>
            </span>
            <span className="font-semibold text-[#142019] dark:text-[#F1F5F3]">
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
              className="flex-1 accent-[#27784C] dark:accent-[#52B77F] cursor-pointer"
            />
            {!sensorActive && (
              <button
                type="button"
                onClick={() => void requestCompassPermission()}
                aria-label="Enable compass sensors"
                className="p-2 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F]"
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
