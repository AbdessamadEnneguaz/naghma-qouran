import test from 'node:test';
import assert from 'node:assert/strict';
import {RECITERS} from '../data/reciters';
import {
  cyclePlaybackSpeed,
  cycleSleepTimer,
  filterReciters,
  getReciterMonogram,
  localizeReciterSubtitle,
} from './reciterPickerLogic';

test('filterReciters filters by riwayat and Arabic/Latin query cleanly', () => {
  const warshOnly = filterReciters(RECITERS, 'warsh', '');
  assert.ok(warshOnly.length >= 6);
  assert.ok(warshOnly.every((r) => r.riwayat === 'warsh'));

  const qazabri = filterReciters(RECITERS, 'all', 'القزابري');
  assert.ok(qazabri.some((r) => r.id === 'warsh_qazabri'));

  const alafasy = filterReciters(RECITERS, 'hafs', 'alafasy');
  assert.ok(alafasy.some((r) => r.id === 'hafs_alafasy'));
});

test('getReciterMonogram extracts clean two-letter initials', () => {
  assert.equal(getReciterMonogram('Omar Al-Qazabri'), 'OQ');
  assert.equal(getReciterMonogram('Mishary Rashid Alafasy'), 'MA');
  assert.equal(getReciterMonogram('Abdul Basit Abdul Samad (Warsh)'), 'BS');
});

test('localizeReciterSubtitle renders trilingual sync and bitrate descriptors', () => {
  const alafasy = RECITERS.find((r) => r.id === 'hafs_alafasy')!;
  const qazabri = RECITERS.find((r) => r.id === 'warsh_qazabri')!;
  assert.ok(localizeReciterSubtitle(alafasy, 'ar').includes('آية بآية'));
  assert.ok(localizeReciterSubtitle(qazabri, 'en').includes('Warsh'));
  assert.ok(localizeReciterSubtitle(qazabri, 'fr').includes('Sourate complète'));
});

test('cyclePlaybackSpeed and cycleSleepTimer advance deterministically', () => {
  assert.equal(cyclePlaybackSpeed(1), 1.25);
  assert.equal(cyclePlaybackSpeed(1.5), 0.75);
  assert.equal(cyclePlaybackSpeed(2), 1);

  assert.equal(cycleSleepTimer(0), 15);
  assert.equal(cycleSleepTimer(60), -1);
  assert.equal(cycleSleepTimer(-1), 0);
});
