self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || 'NACOS Bowen';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard/student/notifications' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = (event.notification.data && event.notification.data.url) || '/';
  const url = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      for (const c of list) {
        if (!('focus' in c)) continue;
        try {
          // focus first: browsers only allow it right after the tap
          await c.focus();
          // then send the already-open app to the specific notification
          await c.navigate(url);
          return;
        } catch {
          // this window can't be navigated; fall through and open a fresh one
        }
      }

      await self.clients.openWindow(url);
    })()
  );
});