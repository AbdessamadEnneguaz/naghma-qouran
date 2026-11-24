import React, {useEffect, useState} from 'react';

interface SplashScreenProps {
  isDataReady: boolean;
}

const SPLASH_SESSION_KEY = 'najm_splash_seen';

const FLOATING_MOTES = [
  {left: '18%', top: '34%', size: 7, delay: '0ms', duration: '2600ms'},
  {left: '79%', top: '28%', size: 5, delay: '220ms', duration: '2400ms'},
  {left: '26%', top: '66%', size: 6, delay: '380ms', duration: '2800ms'},
  {left: '74%', top: '64%', size: 8, delay: '140ms', duration: '2500ms'},
  {left: '50%', top: '22%', size: 5, delay: '300ms', duration: '2300ms'},
];

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
      prefersReduced ? 120 : 1250
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
    const hideTimer = window.setTimeout(() => setVisible(false), 350);
    return () => window.clearTimeout(hideTimer);
  }, [visible, minDelayDone, isDataReady]);

  if (!visible) return null;

  return (
    <div
      data-testid="najm-splash"
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#FBF4E7] to-[#F7E9D2] dark:from-[#17110D] dark:via-[#140E0B] dark:to-[#0E0A07] px-6 transition-opacity duration-350 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Breathing Honey-Gold Radial Aura */}
      <div
        className="pointer-events-none absolute h-80 w-80 sm:h-96 sm:w-96 rounded-full animate-[najm-aura-breathe_2400ms_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(249, 115, 22, 0.10) 42%, transparent 72%)',
        }}
      />

      {/* Subtle Floating Desert-Gold Light Motes */}
      {FLOATING_MOTES.map((mote, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute rounded-full bg-[#F59E0B]/45 dark:bg-[#FBBF24]/35 animate-[najm-mote-float_ease-in-out_infinite]"
          style={{
            left: mote.left,
            top: mote.top,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            animationDelay: mote.delay,
            animationDuration: mote.duration,
          }}
        />
      ))}

      {/* Centered Emblem & Staggered Calligraphic Title */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5">
        <div className="relative flex items-center justify-center animate-[najm-splash-emblem-in_550ms_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Animated 8-Pointed Rub el Hizb + Crescent SVG Reveal */}
          <svg
            viewBox="0 0 112 112"
            className="h-28 w-28 sm:h-32 sm:w-32 drop-shadow-xl"
            fill="none"
          >
            <defs>
              <linearGradient id="najm-splash-card" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="100%" stopColor="#FEF3C7" />
              </linearGradient>
              <linearGradient id="najm-splash-gold" x1="12%" y1="10%" x2="90%" y2="90%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="52%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>

            <rect
              x="6"
              y="6"
              width="100"
              height="100"
              rx="28"
              fill="url(#najm-splash-card)"
              stroke="#D97706"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />

            {/* Outer Star Square 1 with stroke-dashoffset draw */}
            <rect
              x="28"
              y="28"
              width="56"
              height="56"
              rx="6"
              stroke="url(#najm-splash-gold)"
              strokeWidth="3.2"
              strokeDasharray="180"
              strokeDashoffset="180"
              className="animate-[najm-stroke-draw_820ms_cubic-bezier(0.22,1,0.36,1)_80ms_forwards]"
            />

            {/* Rotated Star Square 2 */}
            <rect
              x="28"
              y="28"
              width="56"
              height="56"
              rx="6"
              stroke="url(#najm-splash-gold)"
              strokeWidth="3.2"
              transform="rotate(45 56 56)"
              strokeDasharray="180"
              strokeDashoffset="180"
              className="animate-[najm-stroke-draw_820ms_cubic-bezier(0.22,1,0.36,1)_220ms_forwards]"
            />

            {/* Center Golden Crescent & Mihrab Star */}
            <g
              style={{transformOrigin: '56px 56px'}}
              className="animate-[najm-crescent-fill_520ms_cubic-bezier(0.22,1,0.36,1)_420ms_both]"
            >
              <path
                d="M62.5 39.5A17.5 17.5 0 1 0 72.2 69.2A14.5 14.5 0 0 1 62.5 39.5Z"
                fill="url(#najm-splash-gold)"
              />
              <path
                d="M66.2 46.5L67.6 50L71.2 50.4L68.4 52.8L69.3 56.4L66.2 54.4L63.1 56.4L64 52.8L61.2 50.4L64.8 50L66.2 46.5Z"
                fill="#F59E0B"
              />
            </g>
          </svg>
        </div>

        <div className="space-y-1.5">
          <p
            dir="rtl"
            className="font-quran-scheherazade text-4xl sm:text-5xl font-bold text-[#B45309] dark:text-[#FBBF24] leading-tight animate-[najm-title-stagger_520ms_cubic-bezier(0.22,1,0.36,1)_280ms_both]"
          >
            مِحْرَاب النُّور
          </p>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#4E3629] dark:text-[#F5E6D3] animate-[najm-title-stagger_520ms_cubic-bezier(0.22,1,0.36,1)_430ms_both]">
            Mihrab Noor
          </p>
        </div>
      </div>
    </div>
  );
};
