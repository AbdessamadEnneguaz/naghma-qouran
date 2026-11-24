import type {HifzRepeatCount} from '../types/quran';

export interface AyahLoopState {
  surah: number;
  ayah: number;
  target: HifzRepeatCount;
  completedLoops: number;
}

export function createAyahLoopState(
  surah: number,
  ayah: number,
  target: HifzRepeatCount
): AyahLoopState {
  return {
    surah,
    ayah,
    target,
    completedLoops: 0,
  };
}

/**
 * Called when the single-verse audio finishes once.
 * Returns whether playback should repeat the same verse or stop/complete.
 */
export function advanceAyahLoop(state: AyahLoopState): {
  shouldRepeat: boolean;
  nextState: AyahLoopState;
} {
  const nextCompleted = state.completedLoops + 1;
  if (state.target === 'inf') {
    return {
      shouldRepeat: true,
      nextState: {...state, completedLoops: nextCompleted},
    };
  }
  const targetNum = Math.max(1, Number(state.target) || 1);
  if (nextCompleted < targetNum) {
    return {
      shouldRepeat: true,
      nextState: {...state, completedLoops: nextCompleted},
    };
  }
  return {
    shouldRepeat: false,
    nextState: {...state, completedLoops: targetNum},
  };
}

export function formatAyahLoopProgress(
  completedLoops: number,
  target: HifzRepeatCount
): string {
  if (target === 'inf') return '∞';
  const safeTarget = Math.max(1, Number(target) || 1);
  const currentPass = Math.min(safeTarget, completedLoops + 1);
  return `${currentPass}/${safeTarget}`;
}
