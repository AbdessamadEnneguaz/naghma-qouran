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

export interface PageSwipeTurnResult {
  direction: 'next' | 'prev' | null;
  targetPage: number;
}

/**
 * Computes live finger-tracking horizontal offset for Mushaf page turns.
 * Moving finger right (positive deltaX) peeks toward next page in RTL Mushaf;
 * moving left (negative deltaX) peeks toward previous page.
 * Applies soft 0.25x rubber-band resistance at boundary pages (1 and 604).
 */
export function computePageSwipeDrag(
  deltaX: number,
  currentPage: number,
  minPage = 1,
  maxPage = 604
): number {
  if (!Number.isFinite(deltaX)) return 0;
  const clampedDelta = Math.max(-160, Math.min(160, deltaX));
  if (clampedDelta > 0 && currentPage >= maxPage) {
    return clampedDelta * 0.22;
  }
  if (clampedDelta < 0 && currentPage <= minPage) {
    return clampedDelta * 0.22;
  }
  return clampedDelta * 0.72;
}

/**
 * Determines whether horizontal finger swipe should flip to the next or previous Mushaf page
 * based on displacement (>= 54px) or quick flick velocity (>= 0.40 px/ms after 22px).
 */
export function evaluatePageSwipeTurn(
  deltaX: number,
  elapsedMs: number,
  currentPage: number,
  minPage = 1,
  maxPage = 604
): PageSwipeTurnResult {
  if (!Number.isFinite(deltaX)) {
    return {direction: null, targetPage: currentPage};
  }
  const safeMs = Math.max(16, Number.isFinite(elapsedMs) ? elapsedMs : 300);
  const absDx = Math.abs(deltaX);
  const velocity = absDx / safeMs;
  const passedThreshold = absDx >= 54 || (absDx >= 22 && velocity >= 0.4);
  if (!passedThreshold) {
    return {direction: null, targetPage: currentPage};
  }
  if (deltaX > 0 && currentPage < maxPage) {
    return {direction: 'next', targetPage: currentPage + 1};
  }
  if (deltaX < 0 && currentPage > minPage) {
    return {direction: 'prev', targetPage: currentPage - 1};
  }
  return {direction: null, targetPage: currentPage};
}

