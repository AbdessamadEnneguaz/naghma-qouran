import React, {useEffect, useState} from 'react';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface SplashScreenProps {
  isDataReady: boolean;
}

const SPLASH_SESSION_KEY = 'naghma_splash_seen';

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
    const minTimer = window.setTimeout(() => setMinDelayDone(true), 920);
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
      data-testid="naghma-splash"
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E11] px-6 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Obsidian-emerald ambient radial halo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(16, 185, 129, 0.14) 0%, rgba(212, 175, 55, 0.1) 28%, rgba(11, 14, 17, 0) 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4 animate-[naghma-splash-in_550ms_cubic-bezier(0.22,1,0.36,1)_both]">
        <NaghmaAppIconImg
          alt="Naghma Quran"
          className="h-24 w-24 rounded-[26px] shadow-2xl shadow-[#D4AF37]/18"
        />

        <div className="space-y-1">
          <p
            dir="rtl"
            className="font-quran-scheherazade text-4xl sm:text-5xl font-bold text-[#D4AF37] leading-tight"
          >
            نَغمة القرآن
          </p>
          <p className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-[#F4F1EA]/85">
            Naghma Quran
          </p>
        </div>
      </div>
    </div>
  );
};
