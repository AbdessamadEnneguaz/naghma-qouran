import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeightedSurahTimings,
  findAyahAtTimeMs,
  parseMp3QuranAyatTiming,
} from './surahTimingLogic';
import type {QuranVerse} from '../types/quran';

test('parseMp3QuranAyatTiming normalizes MP3Quran millisecond rows and fills boundaries', () => {
  const raw = [
    {ayah: 0, start_time: 0, end_time: 7200},
    {ayah: 2, start_time: 16940, end_time: 21440},
    {ayah: 1, start_time: 11780, end_time: 16940},
    {ayah: 3, start_time: 21440, end_time: 25440},
  ];
  const segments = parseMp3QuranAyatTiming(raw);
  assert.deepEqual(segments, [
    {ayah: 1, startMs: 11780, endMs: 16940},
    {ayah: 2, startMs: 16940, endMs: 21440},
    {ayah: 3, startMs: 21440, endMs: 25440},
  ]);
  assert.deepEqual(parseMp3QuranAyatTiming([]), []);
});

test('findAyahAtTimeMs locks playback position to exact millisecond interval and respects sync offset', () => {
  const segments = [
    {ayah: 1, startMs: 11780, endMs: 16940},
    {ayah: 2, startMs: 16940, endMs: 21440},
    {ayah: 3, startMs: 21440, endMs: 25440},
  ];

  // Intro Basmala before Ayah 1 stays cleanly on Ayah 1
  assert.equal(findAyahAtTimeMs(segments, 4500, 0), 1);
  // Exact boundary transitions
  assert.equal(findAyahAtTimeMs(segments, 16939, 0), 1);
  assert.equal(findAyahAtTimeMs(segments, 16940, 0), 2);
  assert.equal(findAyahAtTimeMs(segments, 22000, 0), 3);

  // Sync offset +1.0s shifts 16000ms into 17000ms -> Ayah 2
  assert.equal(findAyahAtTimeMs(segments, 16000, 1.0), 2);
  // Sync offset -1.0s shifts 17500ms into 16500ms -> Ayah 1
  assert.equal(findAyahAtTimeMs(segments, 17500, -1.0), 1);
});

test('buildWeightedSurahTimings allocates shorter time to short Ayahs (الم) and longer time to dense Ayahs', () => {
  const verses: QuranVerse[] = [
    {index: 7, surah: 2, ayah: 1, page: 2, juz: 1, hizbQuarter: 1, sajda: false, text: 'الٓمٓ'},
    {
      index: 8,
      surah: 2,
      ayah: 2,
      page: 2,
      juz: 1,
      hizbQuarter: 1,
      sajda: false,
      text: 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
    },
  ];

  const segments = buildWeightedSurahTimings(verses, 40000, 2);
  assert.equal(segments.length, 2);
  const dur1 = segments[0].endMs - segments[0].startMs;
  const dur2 = segments[1].endMs - segments[1].startMs;
  assert.ok(dur2 > dur1 * 2, `Expected long verse (${dur2}ms) > 2x short verse (${dur1}ms)`);
  assert.equal(segments[0].startMs, 0);
  assert.equal(segments[1].endMs, 40000);
});
