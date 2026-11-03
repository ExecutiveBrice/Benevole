const CACHE_NAME = 'benevoles-shell-v6';
const NETWORK_TIMEOUT = 8000;
const APP_BASE = self.registration.scope;
const appUrl = (path) => new URL(path, APP_BASE).href;
const APP_SHELL = ['notification.html', 'notification.js', 'manifest.webmanifest', 'icons/app-icon.svg'].map(appUrl);

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      fetch(request, { signal: controller.signal, cache: 'no-cache' }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('Délai de connexion dépassé'));
        }, NETWORK_TIMEOUT);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function cacheApplication(response) {
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Page de démarrage indisponible');
  }
  const html = await response.clone().text();
  if (!html.includes('<app-root')) throw new Error('Page de démarrage invalide');
  // Le HTML et ses scripts doivent rester disponibles ensemble, notamment
  // après une mise en veille ou un déploiement qui remplace les fichiers hashés.
  const assets = new Set();
  for (const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const source = tag[0].match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i);
    if (!source || !/\.(?:m?js|css)(?:\?|$)/i.test(source[1])) continue;
    const url = new URL(source[1], APP_BASE);
    if (url.href.startsWith(APP_BASE)) assets.add(url.href);
  }
  const cache = await caches.open(CACHE_NAME);
  const missingAssets = [];
  for (const url of assets) {
    const immutable = /-[a-z0-9]{8,}\.(?:m?js|css)$/i.test(new URL(url).pathname);
    if (!immutable || !await cache.match(url)) {
      missingAssets.push(new Request(url, { cache: 'reload' }));
    }
  }
  await cache.addAll(missingAssets);
  // Ne jamais remplacer le HTML utilisable si ses nouveaux scripts sont absents.
  await cache.put(appUrl('index.html'), response);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetchWithTimeout(appUrl('index.html'));
    if (!response.ok) throw new Error('Application indisponible');
    await cacheApplication(response);
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('benevoles-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    const fallback = new URL(event.request.url).pathname === new URL('notification.html', APP_BASE).pathname
      ? appUrl('notification.html') : appUrl('index.html');
    const response = fetchWithTimeout(event.request);
    event.waitUntil(response.then(result => {
      if (fallback === appUrl('index.html')) return cacheApplication(result.clone());
    }).catch(() => { /* conserver la dernière version complète */ }));
    event.respondWith((async () => {
      try {
        const result = await response;
        if (result.ok) return result;
      } catch { /* réseau indisponible ou trop lent */ }
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(fallback) || new Response('Connexion indisponible. Veuillez réessayer.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })());
    return;
  }

  const url = new URL(event.request.url);
  // Les données de l'API et les ressources externes ne sont jamais mises en cache.
  if (!url.href.startsWith(APP_BASE) || url.pathname.startsWith(new URL('api/', APP_BASE).pathname)
      || !/\.(?:m?js|css|woff2?|ttf|svg|png|ico)$/.test(url.pathname)
      || url.href === appUrl('sw.js')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await fetchWithTimeout(event.request);
    if (response.ok) {
      try { await cache.put(event.request, response.clone()); } catch { /* cache saturé */ }
    }
    return response;
  })());
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
  let url = new URL('#/', APP_BASE);
  try {
    const target = new URL(payload.url || '#/', APP_BASE);
    if (target.origin === self.location.origin) url = target;
  } catch { /* conserver l'accueil */ }
  event.waitUntil((async () => {
    await reportPushStatus('received', at);
    try {
      await self.registration.showNotification(payload.title || 'Bénévoles', {
        body: payload.body || 'Vos choix ont bien été pris en compte.',
        icon: appUrl('icons/app-icon-192.png'),
        badge: appUrl('icons/app-icon-192.png'),
        tag: payload.tag || 'confirmation',
        // Une nouvelle confirmation doit alerter même si elle remplace l'ancienne.
        renotify: true,
        data: { url: url.href, at },
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
  let eventUrl;
  try { eventUrl = new URL(event.notification.data?.url || '#/', APP_BASE); }
  catch { return; }
  if (eventUrl.origin !== self.location.origin) return;
  const target = new URL('notification.html', APP_BASE);
  // Le fragment conserve le message reçu sans le transmettre au serveur.
  target.hash = new URLSearchParams({
    title: event.notification.title || 'Bénévoles',
    body: event.notification.body || 'Vos choix ont bien été pris en compte.',
    url: eventUrl.href,
    at: event.notification.data?.at || '',
  }).toString();
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
