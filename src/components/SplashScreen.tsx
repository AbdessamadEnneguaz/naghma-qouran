import React, {useEffect, useState} from 'react';

interface SplashScreenProps {
  isDataReady: boolean;
}

const SPLASH_SESSION_KEY = 'najm_splash_seen';

export const SplashScreen: React.FC<SplashScreenProps> = ({isDataReady}) => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SPLASH_SESSION_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [fading, setFading] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const minTimer = window.setTimeout(
      () => setMinDelayDone(true),
      prefersReduced ? 120 : 1350
    );
    return () => window.clearTimeout(minTimer);
  }, [visible]);

  useEffect(() => {
    if (!visible || !minDelayDone || !isDataReady) return;
    setFading(true);
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // ignore storage restrictions
    }
    const hideTimer = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(hideTimer);
  }, [visible, minDelayDone, isDataReady]);

  if (!visible) return null;

  return (
    <div
      data-testid="najm-splash"
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#F4F7F5] dark:bg-[#0A110E] px-6 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center text-center">
        {/* 3D Reflective Emerald Mihrab Emblem */}
        <div
          data-testid="splash-logo-mark"
          className="relative z-10 flex items-center justify-center animate-[mihrab-logo-enter_560ms_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-[28px] emerald-3d-hero flex items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 gloss-sheen" />
            <svg viewBox="0 0 64 64" className="relative z-10 h-20 w-20 sm:h-24 sm:w-24" fill="none">
              <path
                d="M19 47V30C19 21 32 13.5 32 13.5C32 13.5 45 21 45 30V47"
                stroke="#E6C687"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="160"
                strokeDashoffset="160"
                className="animate-[mihrab-stroke-draw_760ms_cubic-bezier(0.22,1,0.36,1)_100ms_forwards]"
              />
              <path
                d="M23.5 47V31C23.5 24 32 18.2 32 18.2C32 18.2 40.5 24 40.5 31V47"
                stroke="#FFFFFF"
                strokeOpacity="0.5"
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="160"
                strokeDashoffset="160"
                className="animate-[mihrab-stroke-draw_760ms_cubic-bezier(0.22,1,0.36,1)_200ms_forwards]"
              />
              <rect
                x="26.2"
                y="26.2"
                width="11.6"
                height="11.6"
                rx="1.4"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              <rect
                x="26.2"
                y="26.2"
                width="11.6"
                height="11.6"
                rx="1.4"
                stroke="#FFFFFF"
                strokeWidth="1"
                transform="rotate(45 32 32)"
              />
              <circle cx="32" cy="32" r="1.8" fill="#E6C687" />
              <path d="M15 47H49" stroke="#E6C687" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Masked Brand Name Emerging Directly Out From Under the Logo */}
        <div
          data-testid="splash-name-mask"
          className="relative z-0 -mt-1 pt-5 overflow-hidden flex flex-col items-center gap-1.5"
        >
          <p
            dir="rtl"
            className="font-quran-scheherazade text-3xl sm:text-4xl font-bold text-[#142019] dark:text-[#F1F5F3] leading-tight animate-[mihrab-name-emerge_640ms_cubic-bezier(0.22,1,0.36,1)_340ms_both]"
          >
            مِحْرَاب النُّور
          </p>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#27784C] dark:text-[#52B77F] animate-[mihrab-sub-emerge_520ms_cubic-bezier(0.22,1,0.36,1)_480ms_both]">
            Mihrab Noor
          </p>
        </div>
      </div>
    </div>
  );
};
