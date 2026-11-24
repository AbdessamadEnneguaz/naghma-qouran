export interface SwipeDismissResult {
  shouldDismiss: boolean;
  clampedY: number;
}

/**
 * Computes damped vertical offset during finger drag on a bottom sheet.
 * Pulling downward translates 1:1 with the finger; pulling upward applies
 * soft rubber-band resistance up to -14px so it never detaches from bottom.
 */
export function computeSheetDragOffset(deltaY: number): number {
  if (!Number.isFinite(deltaY)) return 0;
  if (deltaY >= 0) {
    return Math.min(deltaY, 640);
  }
  return Math.max(-14, deltaY * 0.18);
}

/**
 * Determines whether a bottom sheet drag gesture should dismiss the sheet
 * based on distance dragged downward (>= thresholdPx) OR downward flick velocity.
 */
export function evaluateSwipeDismiss(
  deltaY: number,
  elapsedMs: number,
  thresholdPx = 90
): SwipeDismissResult {
  const safeDelta = Number.isFinite(deltaY) ? Math.max(0, deltaY) : 0;
  const safeMs = Math.max(16, Number.isFinite(elapsedMs) ? elapsedMs : 300);
  const velocityPxPerMs = safeDelta / safeMs;
  const shouldDismiss =
    safeDelta >= thresholdPx || (safeDelta >= 36 && velocityPxPerMs >= 0.45);
  return {
    shouldDismiss,
    clampedY: computeSheetDragOffset(deltaY),
  };
}
