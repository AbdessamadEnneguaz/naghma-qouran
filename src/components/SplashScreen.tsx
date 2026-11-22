import React, {useEffect, useState} from 'react';
import {NaghmaAppIconImg} from './OrnamentalSvg';

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
    const minTimer = window.setTimeout(() => setMinDelayDone(true), 880);
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
    const hideTimer = window.setTimeout(() => setVisible(false), 300);
    return () => window.clearTimeout(hideTimer);
  }, [visible, minDelayDone, isDataReady]);

  if (!visible) return null;

  return (
    <div
      data-testid="najm-splash"
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FDFBF7] to-[#FAF0E0] dark:from-[#17110D] dark:to-[#110C09] px-6 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(217, 119, 6, 0.14) 0%, rgba(249, 115, 22, 0.06) 35%, transparent 68%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4 animate-[naghma-splash-in_520ms_cubic-bezier(0.22,1,0.36,1)_both]">
        <NaghmaAppIconImg
          alt="Najm Quran"
          className="h-24 w-24 rounded-[26px] shadow-xl shadow-amber-900/15"
        />

        <div className="space-y-1">
          <p
            dir="rtl"
            className="font-quran-scheherazade text-4xl sm:text-5xl font-bold text-[#B45309] dark:text-[#FBBF24] leading-tight"
          >
            نَجم القرآن
          </p>
          <p className="text-sm sm:text-base font-semibold tracking-[0.16em] uppercase text-[#4E3629] dark:text-[#F5E6D3]">
            Najm Quran
          </p>
        </div>
      </div>
    </div>
  );
};
