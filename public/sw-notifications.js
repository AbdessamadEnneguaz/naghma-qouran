/* Service Worker Background Scheduler & Notification Dispatcher for Mihrab Noor */
const SCHEDULE_CACHE_KEY = 'mihrab-sw-schedule-v1';
const SCHEDULE_CACHE_REQ = '/__mihrab_notif_schedule.json';

async function saveScheduleToCache(items) {
  try {
    const cache = await caches.open(SCHEDULE_CACHE_KEY);
    await cache.put(
      SCHEDULE_CACHE_REQ,
      new Response(JSON.stringify({updatedAt: Date.now(), items: items || []}), {
        headers: {'Content-Type': 'application/json'},
      })
    );
  } catch {
    // ignore cache errors
  }
}

async function readScheduleFromCache() {
  try {
    const cache = await caches.open(SCHEDULE_CACHE_KEY);
    const res = await cache.match(SCHEDULE_CACHE_REQ);
    if (!res) return [];
    const parsed = await res.json();
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

async function dispatchDueBackgroundNotifications() {
  const items = await readScheduleFromCache();
  if (!items.length) return;

  const now = Date.now();
  const remaining = [];
  for (const item of items) {
    // Fire notifications whose scheduled time arrived within the last 6 hours
    if (item.fireAtMs <= now && now - item.fireAtMs <= 6 * 3600 * 1000 && !item.sent) {
      await self.registration.showNotification(item.title || 'Mihrab Noor · مِحْرَاب النُّور', {
        body: item.body || '',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: item.tag || 'mihrab-daily-reminder',
        renotify: true,
        vibrate: [140, 60, 140],
        data: {
          route: item.route || 'mushaf',
          surahId: item.surahId || null,
        },
      });
      remaining.push({...item, sent: true});
    } else if (item.fireAtMs > now) {
      remaining.push(item);
    }
  }
  await saveScheduleToCache(remaining);
}

self.addEventListener('message', (event) => {
  const data = event?.data;
  if (!data) return;

  if (data.type === 'MIHRAB_SYNC_SCHEDULE') {
    event.waitUntil(saveScheduleToCache(data.items));
    return;
  }

  if (data.type === 'MIHRAB_SHOW_NOTIFICATION') {
    const {title, body, tag, route, surahId} = data;
    event.waitUntil(
      self.registration.showNotification(title || 'Mihrab Noor · مِحْرَاب النُّور', {
        body: body || '',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: tag || 'mihrab-noor-alert',
        renotify: true,
        vibrate: [120, 60, 120],
        data: {
          route: route || 'home',
          surahId: surahId || null,
        },
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mihrab-daily-sync') {
    event.waitUntil(dispatchDueBackgroundNotifications());
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {title: 'Mihrab Noor · مِحْرَاب النُّور', body: event.data?.text?.() || ''};
  }
  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'مِحْرَاب النُّور · حان وقت وردك من القرآن',
      {
        body: payload.body || 'افتح التطبيق الآن لقراءة آيات من القرآن الكريم.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: payload.tag || 'mihrab-push-alert',
        renotify: true,
        data: {route: payload.route || 'mushaf', surahId: payload.surahId || null},
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification?.data || {};
  const route = payload.route || 'home';
  const surahId = payload.surahId || null;

  const targetUrl =
    route === 'home'
      ? '/'
      : `/${route}${surahId ? `?surah=${encodeURIComponent(String(surahId))}` : ''}`;

  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'MIHRAB_NOTIFICATION_NAVIGATE',
            route,
            surahId,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
