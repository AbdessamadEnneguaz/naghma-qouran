export const DEFAULT_APK_FILENAME = 'mihrab-noor.apk';
export const DEFAULT_APK_MIME = 'application/vnd.android.package-archive';
export const DEFAULT_APK_SIZE_BYTES = 7893650;
export const APP_VERSION = '3.2.0';
export const DEFAULT_OTA_SERVER_URL = 'https://ais-pre-sd7psl2bnxgqgy6mwqyrp5-846997521525.europe-west2.run.app';

const OTA_URL_STORAGE_KEY = 'mihrab_ota_site_url_v1';
const AUTO_OTA_STORAGE_KEY = 'mihrab_auto_ota_sync_v1';

declare const __APP_BUILD_ID__: string | undefined;

export function getBundledBuildId(): string {
  try {
    if (typeof __APP_BUILD_ID__ === 'string' && __APP_BUILD_ID__.length > 0) {
      return __APP_BUILD_ID__;
    }
  } catch {
    // fallback in unit test environments
  }
  return `local-${APP_VERSION}`;
}

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

export function normalizeOtaBaseUrl(url: string | null | undefined): string {
  const trimmed = (url || '').trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_OTA_SERVER_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function loadOtaServerUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_OTA_SERVER_URL;
  try {
    const saved = localStorage.getItem(OTA_URL_STORAGE_KEY);
    if (saved && /^https?:\/\//i.test(saved.trim())) {
      return normalizeOtaBaseUrl(saved);
    }
  } catch {
    // ignore
  }
  return DEFAULT_OTA_SERVER_URL;
}

export function saveOtaServerUrl(url: string): string {
  const normalized = normalizeOtaBaseUrl(url);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(OTA_URL_STORAGE_KEY, normalized);
    } catch {
      // ignore
    }
  }
  return normalized;
}

export function loadAutoOtaSync(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(AUTO_OTA_STORAGE_KEY);
    if (raw === '0') return false;
  } catch {
    // ignore
  }
  return true;
}

export function saveAutoOtaSync(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTO_OTA_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

export function isCapacitorAppOrigin(protocol: string, hostname = ''): boolean {
  if (protocol === 'file:' || protocol === 'capacitor:') return true;
  if (typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.())) {
    return true;
  }
  return protocol === 'https:' && hostname === 'localhost';
}

export function resolveVersionJsonUrl(
  protocol: string,
  otaServerUrl = DEFAULT_OTA_SERVER_URL,
  isNativeCapacitor = false
): string {
  if (isNativeCapacitor || protocol === 'file:' || protocol === 'capacitor:') {
    return `${normalizeOtaBaseUrl(otaServerUrl)}/version.json`;
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

export function hasNativeCapacitorLocalNotifications(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = window.Capacitor as
    | {Plugins?: Record<string, {schedule?: unknown}>}
    | undefined;
  return Boolean(cap?.Plugins?.LocalNotifications && typeof cap.Plugins.LocalNotifications.schedule === 'function');
}

export function isPrebuiltApkMissingNativePlugins(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    isCapacitorAppOrigin(window.location.protocol, window.location.hostname) &&
    !hasNativeCapacitorLocalNotifications()
  );
}

export const DEFAULT_GITHUB_REPO =
  ((typeof import.meta !== 'undefined' &&
    (import.meta as unknown as {env?: Record<string, string | undefined>}).env?.VITE_GITHUB_REPO) ||
    'abdessamad-enneguaz/mihrab-noor').trim();

const GITHUB_REPO_STORAGE_KEY = 'mihrab_github_repo_v1';

export function normalizeGithubRepo(input: string | null | undefined): string {
  const raw = (input || '').trim();
  const stripped = raw
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = stripped.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return DEFAULT_GITHUB_REPO;
}

export function loadGithubRepo(): string {
  if (typeof window === 'undefined') return DEFAULT_GITHUB_REPO;
  try {
    const saved = localStorage.getItem(GITHUB_REPO_STORAGE_KEY);
    if (saved && saved.includes('/')) {
      return normalizeGithubRepo(saved);
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_GITHUB_REPO;
}

export function saveGithubRepo(repo: string): string {
  const normalized = normalizeGithubRepo(repo);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GITHUB_REPO_STORAGE_KEY, normalized);
    } catch {
      // ignore storage errors
    }
  }
  return normalized;
}

export function buildGithubReleaseApkUrl(repo: string): string {
  const normalized = normalizeGithubRepo(repo);
  return `https://github.com/${normalized}/releases/download/latest-apk/mihrab-noor-native.apk`;
}


