import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_APK_SIZE_BYTES,
  formatApkSizeMb,
  isLocalApkPath,
} from './apkHelpers';

test('formatApkSizeMb formats exact byte size cleanly', () => {
  assert.equal(formatApkSizeMb(DEFAULT_APK_SIZE_BYTES), '6.5 MB');
  assert.equal(formatApkSizeMb(10 * 1024 * 1024), '10.0 MB');
  assert.equal(formatApkSizeMb(0), '6.5 MB');
  assert.equal(formatApkSizeMb(-100), '6.5 MB');
});

test('isLocalApkPath distinguishes local bundled APK paths from external URLs', () => {
  assert.equal(isLocalApkPath('/naghma-quran.apk'), true);
  assert.equal(isLocalApkPath('https://example.com/naghma-quran.apk'), false);
});
