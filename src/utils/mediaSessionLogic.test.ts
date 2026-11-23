import test from 'node:test';
import assert from 'node:assert/strict';
import {RECITERS} from '../data/reciters';
import {
  buildMediaSessionMetadataPayload,
  canUseWakeLock,
  computeSafePositionState,
} from './mediaSessionLogic';

test('buildMediaSessionMetadataPayload formats Arabic and English titles with artwork', () => {
  const luhaidan = RECITERS.find((r) => r.id === 'hafs_luhaidan') ?? RECITERS[0];
  const ibrahim = {
    id: 14,
    nameAr: 'إبراهيم',
    nameEn: 'Ibrahim',
    transliteration: 'Ibrahim',
    meaningEn: 'Abraham',
    meaningFr: 'Abraham',
    revelationType: 'Meccan' as const,
    totalAyahs: 52,
    startPage: 255,
    endPage: 261,
    juzStart: 13,
  };

  const enPayload = buildMediaSessionMetadataPayload({
    surah: 14,
    ayah: 7,
    surahMeta: ibrahim,
    reciter: luhaidan,
    lang: 'en',
  });
  assert.equal(enPayload.title, 'Surah Ibrahim - Ayah 7');
  assert.equal(enPayload.artist, luhaidan.nameEn);
  assert.equal(enPayload.album, 'Najm Quran · نَغمة القرآن');
  assert.deepEqual(
    enPayload.artwork.map((a) => a.src),
    ['/pwa-192x192.png', '/pwa-512x512.png']
  );

  const arPayload = buildMediaSessionMetadataPayload({
    surah: 14,
    ayah: 7,
    surahMeta: ibrahim,
    reciter: luhaidan,
    lang: 'ar',
  });
  assert.equal(arPayload.title, 'سورة إبراهيم - الآية ٧');
  assert.equal(arPayload.artist, luhaidan.nameAr);
});

test('computeSafePositionState validates duration and clamps position cleanly', () => {
  assert.equal(computeSafePositionState(0, 10, 1), null);
  assert.equal(computeSafePositionState(Number.NaN, 10, 1), null);
  assert.deepEqual(computeSafePositionState(120, -5, 1.25), {
    duration: 120,
    position: 0,
    playbackRate: 1.25,
  });
  assert.deepEqual(computeSafePositionState(120, 200, 0), {
    duration: 120,
    position: 120,
    playbackRate: 1,
  });
});

test('canUseWakeLock checks navigator.wakeLock support safely', () => {
  assert.equal(canUseWakeLock(undefined), false);
  assert.equal(canUseWakeLock({}), false);
  assert.equal(canUseWakeLock({wakeLock: {}}), true);
});
