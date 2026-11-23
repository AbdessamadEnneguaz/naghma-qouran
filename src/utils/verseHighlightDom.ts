export const VERSE_KEY_ATTR = 'data-verse-key';
export const ACTIVE_VERSE_ATTR = 'data-active-verse';
export const ACTIVE_VERSE_CLASS = 'najm-active-verse';

/**
 * Returns true only when enough quiet time has elapsed since the user manually
 * scrolled, ensuring auto-scroll never fights manual reading/scrolling.
 */
export function shouldAutoScrollToVerse(
  lastUserScrollMs: number,
  nowMs: number,
  cooldownMs = 4000
): boolean {
  if (!Number.isFinite(lastUserScrollMs) || lastUserScrollMs <= 0) return true;
  if (!Number.isFinite(nowMs)) return true;
  return nowMs - lastUserScrollMs >= cooldownMs;
}

/**
 * Updates `[data-verse-key="surah:ayah"]` directly in the DOM without forcing a
 * full-page React re-render on every playback tick.
 */
export function syncActiveVerseDomHighlight(
  surah: number,
  ayah: number,
  isActive: boolean,
  root?: ParentNode | null
): HTMLElement | null {
  const scope: ParentNode | null =
    root !== undefined ? root : typeof document !== 'undefined' ? document : null;
  if (!scope) return null;

  const targetKey = `${surah}:${ayah}`;
  const existing = scope.querySelectorAll<HTMLElement>(`[${ACTIVE_VERSE_ATTR}="true"]`);
  existing.forEach((el) => {
    if (!isActive || el.getAttribute(VERSE_KEY_ATTR) !== targetKey) {
      el.removeAttribute(ACTIVE_VERSE_ATTR);
      el.classList.remove(ACTIVE_VERSE_CLASS);
    }
  });

  if (!isActive) return null;

  const match = scope.querySelector<HTMLElement>(`[${VERSE_KEY_ATTR}="${targetKey}"]`);
  if (match) {
    match.setAttribute(ACTIVE_VERSE_ATTR, 'true');
    match.classList.add(ACTIVE_VERSE_CLASS);
  }
  return match;
}
