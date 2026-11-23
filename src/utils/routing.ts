export type AppRoute =
  | 'home'
  | 'mushaf'
  | 'surahs'
  | 'qibla'
  | 'adhkar'
  | 'khatma'
  | 'download'
  | 'vault'
  | 'privacy';

export const ROUTE_PATHS: Record<AppRoute, string> = {
  home: '/',
  mushaf: '/mushaf',
  surahs: '/surahs',
  qibla: '/qibla',
  adhkar: '/adhkar',
  khatma: '/khatma',
  download: '/download',
  vault: '/vault',
  privacy: '/privacy',
};

const VALID_ROUTES = new Set<AppRoute>([
  'home',
  'mushaf',
  'surahs',
  'qibla',
  'adhkar',
  'khatma',
  'download',
  'vault',
  'privacy',
]);

function normalizeSegment(raw: string): AppRoute | null {
  const clean = raw
    .replace(/^#/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .toLowerCase();

  if (clean === '' || clean === 'index.html') return 'home';
  if (clean === 'reader' || clean === 'quran') return 'mushaf';
  if (clean === 'privacy-policy') return 'privacy';
  if (VALID_ROUTES.has(clean as AppRoute)) {
    return clean as AppRoute;
  }
  return null;
}

export function parseRouteFromLocation(pathname: string, hash = ''): AppRoute {
  if (hash && hash.length > 1) {
    const fromHash = normalizeSegment(hash);
    if (fromHash) return fromHash;
  }
  const fromPath = normalizeSegment(pathname);
  return fromPath ?? 'home';
}

export function routeToPath(route: AppRoute): string {
  return ROUTE_PATHS[route] || '/';
}
