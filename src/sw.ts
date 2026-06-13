/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Workbox: precache + cleanup (manifest injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Navigate fallback — SPA routing
registerRoute(
  new NavigationRoute(
    new NetworkFirst({ networkTimeoutSeconds: 3, cacheName: 'prime-navigation' }),
    { denylist: [/^\/api/] }
  )
);

// ── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const payload = event.data?.json() as { title?: string; body?: string; url?: string } | undefined;
  const title = payload?.title ?? 'PRIME';
  const body  = payload?.body  ?? "Don't let the streak break today.";
  const url   = payload?.url   ?? '/dashboard';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:   '/icons/icon-192.png',
      badge:  '/icons/icon-192.png',
      tag:    'prime-reminder',
      data:   { url },
      requireInteraction: false,
    })
  );
});

// ── Notification click — open or focus the dashboard ────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string })?.url ?? '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(targetUrl));
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});
