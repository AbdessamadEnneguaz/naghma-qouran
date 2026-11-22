export const DEFAULT_APK_FILENAME = 'naghma-quran.apk';
export const DEFAULT_APK_MIME = 'application/vnd.android.package-archive';
export const DEFAULT_APK_SIZE_BYTES = 6830321;
export const APP_VERSION = '2.0.0';

export function formatApkSizeMb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return formatApkSizeMb(DEFAULT_APK_SIZE_BYTES);
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function isLocalApkPath(url: string): boolean {
  return url.startsWith('/');
}

export function hasNewerBuildVersion(
  localBuildId: string | null,
  remoteBuildId: string | null
): boolean {
  if (!localBuildId || !remoteBuildId) return false;
  return localBuildId.trim() !== remoteBuildId.trim();
}
