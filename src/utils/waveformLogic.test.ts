import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WAVEFORM_BAR_COUNT,
  computePlayedBarCount,
  computeSeekSecondsFromPointer,
  generateWaveformBars,
} from './waveformLogic';

test('generateWaveformBars produces deterministic bounded peaks of length 42', () => {
  const a = generateWaveformBars('1:1:hafs_alafasy');
  const b = generateWaveformBars('1:1:hafs_alafasy');
  const c = generateWaveformBars('18:10:hafs_luhaidan');

  assert.equal(a.length, WAVEFORM_BAR_COUNT);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  for (const h of a) {
    assert.ok(h >= 0.2 && h <= 1.0, `Expected bar height in [0.2, 1.0], got ${h}`);
  }
});

test('computeSeekSecondsFromPointer maps click/drag X positions accurately and clamps bounds', () => {
  assert.equal(computeSeekSecondsFromPointer(100, 100, 200, 120), 0);
  assert.equal(computeSeekSecondsFromPointer(200, 100, 200, 120), 60);
  assert.equal(computeSeekSecondsFromPointer(300, 100, 200, 120), 120);
  assert.equal(computeSeekSecondsFromPointer(50, 100, 200, 120), 0);
  assert.equal(computeSeekSecondsFromPointer(450, 100, 200, 120), 120);
  assert.equal(computeSeekSecondsFromPointer(150, 100, 200, 0), 0);
});

test('computePlayedBarCount returns expected bar count across playback progress', () => {
  assert.equal(computePlayedBarCount(0, 100, 42), 0);
  assert.equal(computePlayedBarCount(50, 100, 42), 21);
  assert.equal(computePlayedBarCount(100, 100, 42), 42);
  assert.equal(computePlayedBarCount(150, 100, 42), 42);
  assert.equal(computePlayedBarCount(10, 0, 42), 0);
});
