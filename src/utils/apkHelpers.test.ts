import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_APK_SIZE_BYTES,
  DEFAULT_OTA_SERVER_URL,
  formatApkSizeMb,
  hasNewerBuildVersion,
  isLocalApkPath,
  resolveVersionJsonUrl,
} from './apkHelpers';

test('formatApkSizeMb formats exact byte size cleanly', () => {
  assert.equal(formatApkSizeMb(DEFAULT_APK_SIZE_BYTES), '8.6 MB');
  assert.equal(formatApkSizeMb(10 * 1024 * 1024), '10.0 MB');
  assert.equal(formatApkSizeMb(0), '8.6 MB');
  assert.equal(formatApkSizeMb(-100), '8.6 MB');
});

test('isLocalApkPath distinguishes local bundled APK paths from external URLs', () => {
  assert.equal(isLocalApkPath('/mihrab-noor.apk'), true);
  assert.equal(isLocalApkPath('https://example.com/mihrab-noor.apk'), false);
});

test('resolveVersionJsonUrl resolves local /version.json for web and remote OTA URL for bundled Capacitor', () => {
  assert.equal(resolveVersionJsonUrl('https:'), '/version.json');
  assert.equal(
    resolveVersionJsonUrl('file:'),
    `${DEFAULT_OTA_SERVER_URL}/version.json`
  );
  assert.equal(
    resolveVersionJsonUrl('capacitor:', 'https://najmqouran.vercel.app/'),
    'https://najmqouran.vercel.app/version.json'
  );
});

test('hasNewerBuildVersion detects build changes cleanly', () => {
  assert.equal(hasNewerBuildVersion('build-1', 'build-2'), true);
  assert.equal(hasNewerBuildVersion('build-1', 'build-1'), false);
  assert.equal(hasNewerBuildVersion(null, 'build-2'), false);
  assert.equal(hasNewerBuildVersion('build-1', null), false);
});
