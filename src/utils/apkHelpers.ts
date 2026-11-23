export const DEFAULT_APK_FILENAME = 'najm-quran.apk';
export const DEFAULT_APK_MIME = 'application/vnd.android.package-archive';
export const DEFAULT_APK_SIZE_BYTES = 6139010;
export const APP_VERSION = '2.4.0';
export const DEFAULT_OTA_SERVER_URL = 'https://najmqouran.vercel.app';

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

export function resolveVersionJsonUrl(
  protocol: string,
  otaServerUrl = DEFAULT_OTA_SERVER_URL
): string {
  if (protocol === 'file:' || protocol === 'capacitor:') {
    return `${otaServerUrl.replace(/\/+$/, '')}/version.json`;
  }
  return '/version.json';
}

export function hasNewerBuildVersion(
  localBuildId: string | null,
  remoteBuildId: string | null
): boolean {
  if (!localBuildId || !remoteBuildId) return false;
  return localBuildId.trim() !== remoteBuildId.trim();
}
