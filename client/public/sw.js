const CACHE_NAME = 'benevoles-shell-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/app-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => response.ok ? response : caches.match('/index.html'))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Les traces ne contiennent ni payload, ni endpoint, ni secret d'abonnement.
async function reportPushStatus(status, at, errorName) {
  const diagnostic = { type: 'benevoles.push-status', status, at, ...(errorName ? { errorName } : {}) };
  if (status === 'display-failed') console.error('[Bénévoles Push]', diagnostic);
  else console.info('[Bénévoles Push]', diagnostic);
  try {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      try { client.postMessage(diagnostic); } catch { /* un onglet a pu se fermer */ }
    }
  } catch { /* le diagnostic ne doit pas empêcher la notification native */ }
}

self.addEventListener('push', (event) => {
  const at = new Date().toISOString();
  let payload = {};
  try {
    const data = event.data ? event.data.json() : {};
    if (data && typeof data === 'object' && !Array.isArray(data)) payload = data;
  } catch { /* afficher le message par défaut */ }
  let url = new URL('/', self.location.origin);
  try {
    const target = new URL(payload.url || '/', self.location.origin);
    if (target.origin === self.location.origin) url = target;
  } catch { /* conserver l'accueil */ }
  event.waitUntil((async () => {
    await reportPushStatus('received', at);
    try {
      await self.registration.showNotification(payload.title || 'Bénévoles', {
        body: payload.body || 'Vos choix ont bien été pris en compte.',
        icon: '/icons/app-icon-192.png',
        badge: '/icons/app-icon-192.png',
        tag: payload.tag || 'confirmation',
        // Une nouvelle confirmation doit alerter même si elle remplace l'ancienne.
        renotify: true,
        data: { url: url.href },
      });
    } catch (error) {
      await reportPushStatus('display-failed', at, error?.name || 'Error');
      throw error;
    }
    // La résolution confirme la demande d'affichage, pas la lecture par l'utilisateur.
    await reportPushStatus('display-requested', at);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => new URL(client.url).pathname === target.pathname);
    if (existing) {
      await existing.navigate(target.href);
      return existing.focus();
    }
    return self.clients.openWindow(target.href);
  })());
});
