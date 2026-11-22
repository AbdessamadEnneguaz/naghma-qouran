import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_APK_SIZE_BYTES,
  formatApkSizeMb,
  hasNewerBuildVersion,
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

test('hasNewerBuildVersion detects build changes cleanly', () => {
  assert.equal(hasNewerBuildVersion('build-1', 'build-2'), true);
  assert.equal(hasNewerBuildVersion('build-1', 'build-1'), false);
  assert.equal(hasNewerBuildVersion(null, 'build-2'), false);
  assert.equal(hasNewerBuildVersion('build-1', null), false);
});
