export const WAVEFORM_BAR_COUNT = 42;

/**
 * Generates deterministic normalized acoustic bar heights (0.22..1.0)
 * with organic multi-peak envelopes matching a calm Quranic cadence.
 */
export function generateWaveformBars(
  seedKey: string,
  count = WAVEFORM_BAR_COUNT
): number[] {
  const safeCount = Math.max(8, Math.min(96, Math.floor(count)));
  let hash = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    hash ^= seedKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const bars: number[] = [];
  for (let i = 0; i < safeCount; i++) {
    // Advance deterministic PRNG
    hash ^= (i + 1) * 0x9e3779b1;
    hash = Math.imul(hash, 0x85ebca6b);
    const rand = ((hash >>> 0) % 1000) / 1000;

    // Gentle dual-lobe organic envelope + natural micro-peaks (tapered at edges)
    const t = i / Math.max(1, safeCount - 1);
    const edgeTaper = 0.55 + 0.45 * Math.sin(t * Math.PI);
    const phraseWave = 0.52 + 0.48 * Math.abs(Math.sin(t * Math.PI * 3.4 + (hash % 7) * 0.35));
    const microPeak = i % 2 === 0 ? 0.82 + rand * 0.18 : 0.48 + rand * 0.42;

    const raw = edgeTaper * phraseWave * microPeak;
    const clamped = Math.max(0.2, Math.min(1, Number(raw.toFixed(3))));
    bars.push(clamped);
  }
  return bars;
}

/**
 * Maps a horizontal pointer coordinate inside the waveform bar container
 * to an exact clamped timestamp in seconds.
 */
export function computeSeekSecondsFromPointer(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
  durationSec: number
): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return 0;
  if (!Number.isFinite(rectWidth) || rectWidth <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, (clientX - rectLeft) / rectWidth));
  return Math.max(0, Math.min(durationSec, ratio * durationSec));
}

/**
 * Computes how many waveform bars are filled/played for a given playback time.
 */
export function computePlayedBarCount(
  currentTimeSec: number,
  durationSec: number,
  barCount = WAVEFORM_BAR_COUNT
): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return 0;
  if (!Number.isFinite(currentTimeSec) || currentTimeSec <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, currentTimeSec / durationSec));
  return Math.round(ratio * barCount);
}
