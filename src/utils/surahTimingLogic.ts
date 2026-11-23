import type {QuranVerse} from '../types/quran';
import {stripTashkeel} from './quranLogic';

export interface AyahTimingSegment {
  ayah: number;
  startMs: number;
  endMs: number;
}

export interface AcousticValley {
  midMs: number;
  ratio: number; // local silence depth ratio vs surrounding 2.4s mean (lower = deeper pause)
}

interface RawMp3QuranTimingRow {
  ayah?: number | string;
  start_time?: number | string;
  end_time?: number | string;
}

interface RawQuranComTimestampRow {
  verse_key?: string;
  ayah?: number | string;
  timestamp_from?: number | string;
  timestamp_to?: number | string;
}

function normalizeSegments(parsed: AyahTimingSegment[]): AyahTimingSegment[] {
  if (parsed.length === 0) return [];
  parsed.sort((a, b) => a.ayah - b.ayah || a.startMs - b.startMs);

  const deduped: AyahTimingSegment[] = [];
  const seen = new Set<number>();
  for (const row of parsed) {
    if (seen.has(row.ayah)) continue;
    seen.add(row.ayah);
    deduped.push({...row});
  }

  for (let i = 0; i < deduped.length; i++) {
    const cur = deduped[i];
    const next = deduped[i + 1];
    if (next) {
      if (cur.endMs <= cur.startMs || cur.endMs > next.startMs) {
        cur.endMs = Math.max(cur.startMs, next.startMs);
      }
    } else if (cur.endMs <= cur.startMs) {
      cur.endMs = cur.startMs + 4000;
    }
  }

  return deduped;
}

/**
 * Parses Quran.com v4 chapter_recitations JSON (`audio_file.timestamps[]`)
 * containing `verse_key`, `timestamp_from`, and `timestamp_to` in milliseconds.
 */
export function parseQuranComChapterTimestamps(raw: unknown): AyahTimingSegment[] {
  if (!raw || typeof raw !== 'object') return [];
  const record = raw as {
    audio_file?: {timestamps?: unknown};
    timestamps?: unknown;
  };
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(record.audio_file?.timestamps)
      ? record.audio_file!.timestamps
      : Array.isArray(record.timestamps)
        ? record.timestamps
        : null;

  if (!Array.isArray(list) || list.length === 0) return [];

  const parsed: AyahTimingSegment[] = [];
  for (const item of list as RawQuranComTimestampRow[]) {
    let ayah = Number(item?.ayah);
    if (!Number.isInteger(ayah) && typeof item?.verse_key === 'string') {
      const parts = item.verse_key.split(':');
      if (parts.length === 2) {
        ayah = Number(parts[1]);
      }
    }
    const startMs = Number(item?.timestamp_from);
    const endMs = Number(item?.timestamp_to);
    if (!Number.isInteger(ayah) || ayah < 1) continue;
    if (!Number.isFinite(startMs) || startMs < 0) continue;
    parsed.push({
      ayah,
      startMs,
      endMs: Number.isFinite(endMs) && endMs > startMs ? endMs : startMs,
    });
  }

  return normalizeSegments(parsed);
}

/**
 * Parses and normalizes MP3Quran v3 ayat_timing JSON rows into clean,
 * monotonic millisecond intervals starting from Ayah 1.
 */
export function parseMp3QuranAyatTiming(raw: unknown): AyahTimingSegment[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const parsed: AyahTimingSegment[] = [];
  for (const item of raw as RawMp3QuranTimingRow[]) {
    const ayah = Number(item?.ayah);
    const startMs = Number(item?.start_time);
    const endMs = Number(item?.end_time);
    if (!Number.isInteger(ayah) || ayah < 1) continue;
    if (!Number.isFinite(startMs) || startMs < 0) continue;
    parsed.push({
      ayah,
      startMs,
      endMs: Number.isFinite(endMs) && endMs > startMs ? endMs : startMs,
    });
  }

  return normalizeSegments(parsed);
}

/**
 * Extracts real acoustic pause/waqf local minima from decoded PCM samples
 * without making character-length duration guesses.
 */
export function extractAcousticPauseValleys(
  pcmSamples: Float32Array,
  sampleRate: number,
  frameMs = 40
): AcousticValley[] {
  if (pcmSamples.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    return [];
  }

  const hop = Math.max(1, Math.floor((sampleRate * frameMs) / 1000));
  const rms: number[] = [];
  for (let i = 0; i + hop <= pcmSamples.length; i += hop) {
    let sum = 0;
    for (let j = 0; j < hop; j++) {
      const s = pcmSamples[i + j];
      sum += s * s;
    }
    rms.push(Math.sqrt(sum / hop));
  }

  if (rms.length < 8) return [];

  const sorted = [...rms].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p65 = sorted[Math.floor(sorted.length * 0.65)];
  const thresh = p10 + (p65 - p10) * 0.28;

  const valleys: AcousticValley[] = [];
  for (let k = 2; k < rms.length - 2; k++) {
    const wStart = Math.max(0, k - 25);
    const wEnd = Math.min(rms.length, k + 26);
    let mean = 0;
    for (let m = wStart; m < wEnd; m++) mean += rms[m];
    mean /= wEnd - wStart;

    const isLocalMin =
      rms[k] <= rms[k - 1] &&
      rms[k] <= rms[k + 1] &&
      rms[k] <= rms[k - 2] &&
      rms[k] <= rms[k + 2];

    const ratio = rms[k] / Math.max(mean, 1e-6);
    if (isLocalMin && (rms[k] <= thresh || ratio <= 0.45)) {
      const midMs = k * frameMs;
      if (valleys.length === 0 || midMs - valleys[valleys.length - 1].midMs >= 750) {
        valleys.push({midMs, ratio});
      } else if (ratio < valleys[valleys.length - 1].ratio) {
        valleys[valleys.length - 1] = {midMs, ratio};
      }
    }
  }

  return valleys;
}

function estimateVerseAcousticWeights(ordered: QuranVerse[]): number[] {
  return ordered.map((v) => {
    const clean = stripTashkeel(v.text).replace(/\s+/g, '');
    const letterCount = Math.max(2, clean.length);
    const maddBonus = (v.text.match(/[آٱاويىٰ]/g) || []).length * 0.35;
    return letterCount + maddBonus + 3;
  });
}

/**
 * Aligns `N` verses onto actual detected acoustic silence/waqf pause valleys via
 * Dynamic Programming. Supports opening Isti'adha / Basmala lead-ins cleanly and
 * NEVER fabricates proportional boundaries when acoustic valleys are absent.
 */
export function alignVersesToAcousticValleys(
  surahVerses: QuranVerse[],
  durationMs: number,
  surahId: number,
  valleys: AcousticValley[]
): AyahTimingSegment[] {
  if (
    surahVerses.length === 0 ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0 ||
    valleys.length === 0
  ) {
    return [];
  }

  const ordered = [...surahVerses].sort((a, b) => a.ayah - b.ayah);
  const V = ordered.length;

  // Filter interior valleys inside (400ms .. durationMs - 400ms)
  let candidates = valleys
    .filter((v) => v.midMs >= 400 && v.midMs <= durationMs - 400)
    .sort((a, b) => a.midMs - b.midMs);

  if (candidates.length === 0) return [];

  // Keep deepest pauses bounded so DP runs in < 10ms even on long Surahs
  const maxValleys = Math.max(260, V * 3);
  if (candidates.length > maxValleys) {
    candidates = [...candidates]
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, maxValleys)
      .sort((a, b) => a.midMs - b.midMs);
  }

  // Boundary time list B: [0, ...valleyMidMs, durationMs]
  const B: Array<{ms: number; ratio: number}> = [
    {ms: 0, ratio: 0.25},
    ...candidates.map((c) => ({ms: c.midMs, ratio: c.ratio})),
    {ms: durationMs, ratio: 0.1},
  ];
  const M = B.length;

  // Need at least V distinct intervals if possible; otherwise cannot place acoustic boundaries without guessing
  if (M - 1 < V) {
    return [];
  }

  const weights = estimateVerseAcousticWeights(ordered);
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;
  const expectedFracs = weights.map((w) => w / totalWeight);

  // Possible start boundaries: 0, plus any early pause (1500ms..11500ms) representing Isti'adha / Basmala
  const startIndices: number[] = [0];
  if (surahId !== 9) {
    for (let idx = 1; idx < M - V; idx++) {
      if (B[idx].ms >= 1500 && B[idx].ms <= 11500 && B[idx].ratio <= 0.35) {
        startIndices.push(idx);
      }
    }
  }

  let bestCost = Number.POSITIVE_INFINITY;
  let bestBoundaries: number[] | null = null;

  for (const startIdx of startIndices) {
    const activeDur = durationMs - B[startIdx].ms;
    if (activeDur < V * 600) continue;

    const dp = Array.from({length: V + 1}, () =>
      new Float64Array(M).fill(Number.POSITIVE_INFINITY)
    );
    const parent = Array.from({length: V + 1}, () => new Int32Array(M).fill(-1));

    // Prefer skipping clean deep opening pause (Isti'adha / Basmala) when available
    const introBonus = startIdx > 0 ? -0.6 * (1 - Math.min(1, B[startIdx].ratio)) : 0;
    dp[0][startIdx] = introBonus;

    for (let v = 1; v <= V; v++) {
      const expMs = activeDur * expectedFracs[v - 1];
      const minPrev = startIdx + (v - 1);
      const maxEnd = v === V ? M - 1 : M - 1 - (V - v);
      const minEnd = v === V ? M - 1 : minPrev + 1;

      for (let j = minEnd; j <= maxEnd; j++) {
        // Pause quality reward at boundary j (smaller ratio = deeper silence = lower cost)
        const valleyReward = v === V ? 0 : -0.85 * (1 - Math.min(1, B[j].ratio));

        let localBest = Number.POSITIVE_INFINITY;
        let localPrev = -1;

        for (let i = minPrev; i < j; i++) {
          const prevCost = dp[v - 1][i];
          if (!Number.isFinite(prevCost)) continue;
          const segMs = B[j].ms - B[i].ms;
          if (segMs < 450) continue;

          // Asymmetric relative duration prior so genuine pauses dominate over short breath jitter
          const relDiff = (segMs - expMs) / Math.max(expMs, 800);
          const durPenalty = relDiff * relDiff;
          const total = prevCost + durPenalty + valleyReward;
          if (total < localBest) {
            localBest = total;
            localPrev = i;
          }
        }

        dp[v][j] = localBest;
        parent[v][j] = localPrev;
      }
    }

    const finalCost = dp[V][M - 1];
    if (finalCost < bestCost) {
      bestCost = finalCost;
      const indices: number[] = new Array(V + 1);
      let cur = M - 1;
      for (let v = V; v >= 0; v--) {
        indices[v] = cur;
        cur = parent[v][cur];
      }
      bestBoundaries = indices;
    }
  }

  if (!bestBoundaries) return [];

  const segments: AyahTimingSegment[] = [];
  for (let v = 0; v < V; v++) {
    const startMs = v === 0 ? 0 : Math.round(B[bestBoundaries[v]].ms);
    const endMs = Math.round(B[bestBoundaries[v + 1]].ms);
    segments.push({
      ayah: ordered[v].ayah,
      startMs,
      endMs: Math.max(startMs + 1, endMs),
    });
  }

  return segments;
}

/**
 * Matches playback position (audio.currentTime * 1000) + manual syncOffsetSec
 * against sorted AyahTimingSegment intervals to return the exact active Ayah.
 */
export function findAyahAtTimeMs(
  timings: AyahTimingSegment[],
  currentTimeMs: number,
  syncOffsetSec = 0
): number | null {
  if (timings.length === 0 || !Number.isFinite(currentTimeMs)) return null;

  const effectiveMs = Math.max(0, currentTimeMs + syncOffsetSec * 1000);

  if (effectiveMs < timings[0].startMs) {
    return timings[0].ayah;
  }

  const last = timings[timings.length - 1];
  if (effectiveMs >= last.endMs) {
    return last.ayah;
  }

  let lo = 0;
  let hi = timings.length - 1;
  let candidate = timings[0].ayah;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const seg = timings[mid];
    if (effectiveMs >= seg.startMs && effectiveMs < seg.endMs) {
      return seg.ayah;
    }
    if (effectiveMs >= seg.startMs) {
      candidate = seg.ayah;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return candidate;
}

export function getFallbackAyahReciterId(riwayat: 'hafs' | 'warsh'): string {
  return riwayat === 'warsh' ? 'warsh_abdulbasit' : 'hafs_alafasy';
}

export function shouldFallbackToAyahDeck(params: {
  reciterMode: 'ayah' | 'surah';
  timingResolved: boolean;
  hasSegments: boolean;
  hasOfflineChapter: boolean;
}): boolean {
  if (params.reciterMode !== 'surah') return false;
  if (params.hasOfflineChapter) return false;
  if (!params.timingResolved) return false;
  return !params.hasSegments;
}

