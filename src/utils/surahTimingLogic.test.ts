import test from 'node:test';
import assert from 'node:assert/strict';
import {
  alignVersesToAcousticValleys,
  extractAcousticPauseValleys,
  findAyahAtTimeMs,
  parseMp3QuranAyatTiming,
  parseQuranComChapterTimestamps,
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

test('parseQuranComChapterTimestamps parses Quran.com v4 timestamp_from/timestamp_to payloads', () => {
  const payload = {
    audio_file: {
      chapter_id: 1,
      timestamps: [
        {verse_key: '1:1', timestamp_from: 0, timestamp_to: 6090},
        {verse_key: '1:2', timestamp_from: 6090, timestamp_to: 11680},
        {verse_key: '1:3', timestamp_from: 11680, timestamp_to: 16300},
      ],
    },
  };
  assert.deepEqual(parseQuranComChapterTimestamps(payload), [
    {ayah: 1, startMs: 0, endMs: 6090},
    {ayah: 2, startMs: 6090, endMs: 11680},
    {ayah: 3, startMs: 11680, endMs: 16300},
  ]);
  assert.deepEqual(parseQuranComChapterTimestamps({audio_file: {timestamps: []}}), []);
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

test('extractAcousticPauseValleys & alignVersesToAcousticValleys snap strictly to real silence valleys and never guess proportionally', () => {
  const verses: QuranVerse[] = [
    {index: 0, surah: 103, ayah: 1, page: 601, juz: 30, hizbQuarter: 240, sajda: false, text: 'وَٱلْعَصْرِ'},
    {index: 1, surah: 103, ayah: 2, page: 601, juz: 30, hizbQuarter: 240, sajda: false, text: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ'},
    {index: 2, surah: 103, ayah: 3, page: 601, juz: 30, hizbQuarter: 240, sajda: false, text: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ'},
  ];

  // No valleys -> must return [] rather than proportional estimation
  assert.deepEqual(alignVersesToAcousticValleys(verses, 22000, 103, []), []);

  // Synthetic PCM audio at 1000 Hz: Basmala [0..3.6s], pause at 3.8s, Ayah1 [4..6s], pause at 6.2s, Ayah2 [6.4..10s], pause at 10.2s, Ayah3 [10.4..20s]
  const sr = 1000;
  const totalSamples = 20 * sr;
  const pcm = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const tMs = i;
    const inPause =
      (tMs >= 3600 && tMs <= 4000) ||
      (tMs >= 6000 && tMs <= 6400) ||
      (tMs >= 10000 && tMs <= 10400);
    pcm[i] = inPause ? 0.002 : 0.4 * Math.sin(i * 0.25);
  }

  const valleys = extractAcousticPauseValleys(pcm, sr, 40);
  assert.ok(valleys.length >= 3, `Expected >= 3 detected silence valleys, got ${valleys.length}`);

  const segments = alignVersesToAcousticValleys(verses, 20000, 103, valleys);
  assert.equal(segments.length, 3);
  assert.equal(segments[0].startMs, 0);
  assert.ok(segments[1].startMs >= 5600 && segments[1].startMs <= 6600, `Ayah 2 should snap near 6.2s pause, got ${segments[1].startMs}`);
  assert.ok(segments[2].startMs >= 9700 && segments[2].startMs <= 10700, `Ayah 3 should snap near 10.2s pause, got ${segments[2].startMs}`);
  assert.equal(segments[2].endMs, 20000);
});
