/* Service Worker Notification Click & Rich Reminder Dispatcher for Mihrab Noor */
self.addEventListener('message', (event) => {
  const data = event?.data;
  if (!data || data.type !== 'MIHRAB_SHOW_NOTIFICATION') return;

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
