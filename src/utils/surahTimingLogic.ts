import type {QuranVerse} from '../types/quran';
import {stripTashkeel} from './quranLogic';

export interface AyahTimingSegment {
  ayah: number;
  startMs: number;
  endMs: number;
}

interface RawMp3QuranTimingRow {
  ayah?: number | string;
  start_time?: number | string;
  end_time?: number | string;
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

  if (parsed.length === 0) return [];

  parsed.sort((a, b) => a.ayah - b.ayah || a.startMs - b.startMs);

  // Deduplicate by ayah keeping first segment and ensure contiguous non-overlapping endMs
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
 * Computes acoustic-weighted millisecond intervals per Ayah as a smart fallback
 * when an MP3Quran reciter (e.g. readId 107) has no published ayat_timing table.
 * Accounts for:
 *  - Opening Basmala / silence intro on Surahs 2..114 (except At-Tawbah 9)
 *  - Letter count, vowel elongation (Madd letters), and verse-end Waqf breath pauses
 */
export function buildWeightedSurahTimings(
  surahVerses: QuranVerse[],
  durationMs: number,
  surahId: number
): AyahTimingSegment[] {
  if (surahVerses.length === 0 || !Number.isFinite(durationMs) || durationMs <= 0) {
    return [];
  }

  const ordered = [...surahVerses].sort((a, b) => a.ayah - b.ayah);
  const introOffsetMs =
    surahId !== 1 && surahId !== 9 && durationMs > 25000
      ? Math.min(4000, Math.round(durationMs * 0.06))
      : 0;
  const usableMs = Math.max(1000, durationMs - introOffsetMs);

  const weights = ordered.map((v) => {
    const clean = stripTashkeel(v.text).replace(/\s+/g, '');
    const letterCount = Math.max(2, clean.length);
    const maddBonus = (v.text.match(/[آٱاويىٰ]/g) || []).length * 0.35;
    // Verse-end waqf pause ~equivalent to ~4 base characters
    return letterCount + maddBonus + 4;
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;
  const segments: AyahTimingSegment[] = [];
  let cursorMs = introOffsetMs;

  for (let i = 0; i < ordered.length; i++) {
    const shareMs = (weights[i] / totalWeight) * usableMs;
    const isLast = i === ordered.length - 1;
    const endMs = isLast ? durationMs : Math.round(cursorMs + shareMs);
    segments.push({
      ayah: ordered[i].ayah,
      startMs: i === 0 ? 0 : Math.round(cursorMs),
      endMs: Math.max(Math.round(cursorMs) + 1, endMs),
    });
    cursorMs += shareMs;
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
