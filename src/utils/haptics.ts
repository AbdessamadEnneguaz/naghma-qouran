export type HapticStyle = 'light' | 'medium' | 'success';

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 8,
  medium: 16,
  success: [10, 26, 12],
};

export function getHapticPattern(style: HapticStyle = 'light'): number | number[] {
  return HAPTIC_PATTERNS[style];
}

export function shouldTriggerHaptics(
  nav: Pick<Navigator, 'vibrate'> | undefined,
  win: Pick<Window, 'matchMedia'> | undefined
): boolean {
  if (!nav || typeof nav.vibrate !== 'function') return false;
  if (win && typeof win.matchMedia === 'function') {
    try {
      if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
    } catch {
      // ignore matchMedia errors
    }
  }
  return true;
}

/**
 * Triggers a crisp, non-blocking tactile micro-vibration on supported mobile devices
 * and Android WebView APKs while silently ignoring unsupported browsers.
 */
export function triggerHaptic(style: HapticStyle = 'light'): boolean {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    const win = typeof window !== 'undefined' ? window : undefined;
    if (!shouldTriggerHaptics(nav, win)) return false;
    return Boolean(nav!.vibrate(getHapticPattern(style)));
  } catch {
    return false;
  }
}
