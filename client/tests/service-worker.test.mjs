import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function worker(base = '/', options = {}) {
  const events = {};
  const notifications = [];
  const logs = [];
  const opened = [];
  let windows = [];
  let displayError;
  const self = {
    skipWaiting: async () => {},
    location: { origin: 'https://benevoles.example.test' },
    addEventListener: (name, handler) => events[name] = handler,
    registration: { scope: `https://benevoles.example.test${base}`, showNotification: async (title, options) => {
      if (displayError) throw displayError;
      notifications.push({ title, options });
    } },
    clients: {
      claim: async () => {},
      matchAll: async () => windows,
      openWindow: async url => opened.push(url),
    },
  };
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    fetch: options.fetch ?? (async () => { throw new Error('Offline'); }),
    caches: options.caches ?? { open: async () => ({ match: async url => ({ cachedUrl: url }) }) },
    Request, Response, AbortController,
    setTimeout: options.setTimeout ?? setTimeout, clearTimeout,
    self, URL, URLSearchParams, console: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });
  const dispatch = (name, values) => {
    const waiting = [];
    let response;
    events[name]({ ...values, waitUntil: value => waiting.push(value), respondWith: value => response = value });
    return { response: Promise.resolve(response), done: Promise.all(waiting) };
  };
  const fire = async (name, values) => {
    const event = dispatch(name, values);
    const result = await event.response;
    await event.done;
    return result;
  };
  return { notifications, opened, logs, fire, dispatch, setWindows: value => windows = value, failDisplay: error => displayError = error };
}

test('ouvre le texte complet de la confirmation avant l’événement', async () => {
  const w = worker();
  await w.fire('push', { data: { json: () => ({ title: 'Participation enregistrée', body: 'Vos choix ont été pris en compte.', url: '/7', tag: 'confirmation-1' }) } });
  const notification = w.notifications[0];
  assert.equal(notification.title, 'Participation enregistrée');
  assert.equal(notification.options.tag, 'confirmation-1');
  assert.equal(notification.options.renotify, true);
  let closed = false;
  await w.fire('notificationclick', { notification: { title: notification.title, ...notification.options, close: () => closed = true } });
  assert.equal(closed, true);
  const target = new URL(w.opened[0]);
  assert.equal(target.pathname, '/notification.html');
  assert.equal(target.search, '');
  const message = new URLSearchParams(target.hash.slice(1));
  assert.equal(message.get('title'), notification.title);
  assert.equal(message.get('body'), notification.options.body);
  assert.equal(message.get('url'), 'https://benevoles.example.test/7');
  assert.equal(message.get('at'), notification.options.data.at);
});

function shellFixture() {
  const base = 'https://benevoles.example.test/benevoles/';
  const entries = new Map();
  const fetched = [];
  const html = '<app-root></app-root><script src="main-ABC.js" type="module"></script>'
    + '<script src="polyfills-ABC.js"></script><link rel="modulepreload" href="chunk-ABC.js">'
    + '<link rel="stylesheet" href="styles-ABC.css"><link href="https://fonts.example.test/font.css">';
  let online = true;
  let missingAsset = false;
  const fetch = async input => {
    const url = typeof input === 'string' ? input : input.url;
    fetched.push(url);
    if (!online) throw new Error('Offline');
    if (url.endsWith('index.html') || url === base) return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    return new Response('asset', { status: missingAsset && url.endsWith('main-ABC.js') ? 404 : 200 });
  };
  const cache = {
    match: async input => entries.get(typeof input === 'string' ? input : input.url)?.clone(),
    put: async (input, response) => entries.set(typeof input === 'string' ? input : input.url, response.clone()),
    addAll: async inputs => {
      const responses = await Promise.all(inputs.map(fetch));
      if (responses.some(response => !response.ok)) throw new Error('Asset absent');
      await Promise.all(inputs.map((input, i) => cache.put(input, responses[i])));
    },
  };
  const caches = { open: async name => {
    assert.equal(name, 'benevoles-shell-v7');
    return cache;
  } };
  return { base, entries, fetched, html, fetch, caches, cache,
    offline: () => online = false, missingAsset: () => missingAsset = true };
}

test('installe ensemble la page et tous ses scripts et styles locaux', async () => {
  const fixture = shellFixture();
  const w = worker('/benevoles/', fixture);
  await w.fire('install', {});
  for (const file of ['index.html', 'main-ABC.js', 'polyfills-ABC.js', 'chunk-ABC.js', 'styles-ABC.css', 'notification.html']) {
    assert.ok(fixture.entries.has(fixture.base + file), file);
  }
  assert.ok(fixture.fetched.every(url => url.startsWith(fixture.base)));
  fixture.offline();
  const page = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.equal(await page.text(), fixture.html);
  const script = await w.fire('fetch', { request: { method: 'GET', mode: 'cors', url: fixture.base + 'main-ABC.js' } });
  assert.equal(await script.text(), 'asset');
});

test('ne remplace pas le HTML utilisable si un nouveau script est absent', async () => {
  const fixture = shellFixture();
  await fixture.cache.put(fixture.base + 'index.html', new Response('ancienne version complète'));
  fixture.missingAsset();
  const w = worker('/benevoles/', fixture);
  const response = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ancienne version complète');
  assert.equal(await (await fixture.cache.match(fixture.base + 'index.html')).text(), 'ancienne version complète');
  await assert.rejects(w.fire('install', {}), /Ressource de démarrage indisponible/);
});

test('affiche immédiatement la version complète en cache pendant une connexion bloquée', async () => {
  const fixture = shellFixture();
  await fixture.cache.put(fixture.base + 'index.html', new Response('version complète'));
  let finishFetch;
  const w = worker('/benevoles/', {
    ...fixture,
    fetch: () => new Promise(resolve => finishFetch = resolve),
  });
  const event = w.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  try {
    const result = await Promise.race([
      event.response.then(response => response.text()),
      new Promise(resolve => setTimeout(() => resolve('navigation bloquée'), 100)),
    ]);
    assert.equal(result, 'version complète');
  } finally {
    finishFetch(new Response('indisponible', { status: 503 }));
    await event.done;
  }
});

test('prépare les imports directs, transitifs et dynamiques avant de publier le HTML', async () => {
  const fixture = shellFixture();
  const scripts = {
    'main-ABC.js': 'import "./chunk-SIDE.js"; export { x } from "./chunk-SHARED.js"; import("./chunk-LAZY.js");',
    'chunk-SIDE.js': 'import { x } from "./chunk-SHARED.js";',
    'chunk-SHARED.js': 'export const x = 1;',
    'chunk-LAZY.js': 'import { x } from "./chunk-SHARED.js";',
  };
  const w = worker('/benevoles/', {
    ...fixture,
    fetch: async input => {
      const url = typeof input === 'string' ? input : input.url;
      const name = new URL(url).pathname.split('/').pop();
      if (name in scripts) return new Response(scripts[name], { headers: { 'Content-Type': 'text/javascript' } });
      return fixture.fetch(input);
    },
  });
  await w.fire('install', {});
  for (const name of Object.keys(scripts)) assert.ok(fixture.entries.has(fixture.base + name), name);
});

test('refuse la nouvelle page si une dépendance transitive manque', async () => {
  const fixture = shellFixture();
  await fixture.cache.put(fixture.base + 'index.html', new Response('ancienne version complète'));
  const w = worker('/benevoles/', {
    ...fixture,
    fetch: async input => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('main-ABC.js')) return new Response('import "./chunk-MISSING.js";');
      if (url.endsWith('chunk-MISSING.js')) return new Response('absent', { status: 404 });
      return fixture.fetch(input);
    },
  });
  const response = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.equal(await response.text(), 'ancienne version complète');
  assert.equal(await (await fixture.cache.match(fixture.base + 'index.html')).text(), 'ancienne version complète');
});

test('ne sert jamais une page incomplète même si le cache est vide', async () => {
  const fixture = shellFixture();
  fixture.missingAsset();
  const w = worker('/benevoles/', fixture);
  const response = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.equal(response.status, 503);
  assert.equal(await fixture.cache.match(fixture.base + 'index.html'), undefined);
});

test('rejette une page HTML renvoyée à la place d’un script', async () => {
  const fixture = shellFixture();
  const w = worker('/benevoles/', {
    ...fixture,
    fetch: async input => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('main-ABC.js')) return new Response(fixture.html, { headers: { 'Content-Type': 'text/html' } });
      return fixture.fetch(input);
    },
  });
  await assert.rejects(w.fire('install', {}), /Ressource de démarrage indisponible/);
  assert.equal(await fixture.cache.match(fixture.base + 'index.html'), undefined);
});

test('prépare la mise à jour en arrière-plan pour l’ouverture suivante', async () => {
  const fixture = shellFixture();
  await fixture.cache.put(fixture.base + 'index.html', new Response('ancienne version complète'));
  const w = worker('/benevoles/', fixture);
  const request = { method: 'GET', mode: 'navigate', url: fixture.base };
  const first = await w.fire('fetch', { request });
  assert.equal(await first.text(), 'ancienne version complète');
  assert.ok(fixture.entries.has(fixture.base + 'main-ABC.js'));
  fixture.offline();
  const second = await w.fire('fetch', { request });
  assert.equal(await second.text(), fixture.html);
});

test('sort du blocage réseau et utilise le cache après le délai de connexion', async () => {
  let aborted = false;
  const w = worker('/benevoles/', {
    fetch: (_, { signal }) => {
      signal.addEventListener('abort', () => aborted = true);
      return new Promise(() => {});
    },
    setTimeout: (callback, delay) => {
      assert.equal(delay, 8000);
      return setTimeout(callback, 0);
    },
  });
  const response = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: 'https://benevoles.example.test/benevoles/' } });
  assert.equal(response.cachedUrl, 'https://benevoles.example.test/benevoles/index.html');
  assert.equal(aborted, true);
});

test('réutilise un script hashé après un déploiement sans requête réseau', async () => {
  const fixture = shellFixture();
  await fixture.cache.put(fixture.base + 'main-OLD.js', new Response('ancien script'));
  const w = worker('/benevoles/', fixture);
  const request = { method: 'GET', mode: 'cors', url: fixture.base + 'main-OLD.js' };
  const response = await w.fire('fetch', { request });
  assert.equal(await response.text(), 'ancien script');
  assert.deepEqual(fixture.fetched, []);
});

test('ne retélécharge pas les bundles inchangés à chaque ouverture', async () => {
  const fixture = shellFixture();
  const html = '<app-root></app-root><script src="main-ABC12345.js"></script>';
  const w = worker('/benevoles/', {
    ...fixture,
    fetch: async () => new Response(html, { headers: { 'Content-Type': 'text/html' } }),
  });
  await fixture.cache.put(fixture.base + 'main-ABC12345.js', new Response('déjà présent'));
  await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.deepEqual(fixture.fetched, []);
  assert.equal(await (await fixture.cache.match(fixture.base + 'index.html')).text(), html);
});

test('conserve les ressources chargées au cours de l’utilisation', async () => {
  const fixture = shellFixture();
  const w = worker('/benevoles/', fixture);
  const request = { method: 'GET', mode: 'cors', url: fixture.base + 'chunk-LAZY.js' };
  assert.equal((await w.fire('fetch', { request })).status, 200);
  fixture.offline();
  assert.equal(await (await w.fire('fetch', { request })).text(), 'asset');
});

test('laisse les appels API, externes et non GET au navigateur', async () => {
  const fixture = shellFixture();
  const w = worker('/benevoles/', fixture);
  for (const [method, url] of [
    ['GET', fixture.base + 'api/image.png'], ['POST', fixture.base + 'main-ABC.js'],
    ['GET', 'https://other.example.test/main.js'], ['GET', fixture.base + 'sw.js'],
  ]) {
    assert.equal(await w.fire('fetch', { request: { method, mode: 'cors', url } }), undefined);
  }
  assert.deepEqual(fixture.fetched, []);
  assert.equal(fixture.entries.size, 0);
});

test('renvoie une réponse explicite si le réseau et le cache sont indisponibles', async () => {
  const fixture = shellFixture();
  fixture.offline();
  const w = worker('/benevoles/', fixture);
  const response = await w.fire('fetch', { request: { method: 'GET', mode: 'navigate', url: fixture.base } });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Connexion indisponible/);
});

test('réutilise la page de lecture sans remplacer un événement déjà ouvert', async () => {
  const w = worker();
  let focused = false;
  let navigated;
  w.setWindows([
    { url: 'https://benevoles.example.test/7', navigate: async () => assert.fail('L’événement doit rester ouvert') },
    { url: 'https://benevoles.example.test/notification.html#ancien', navigate: async url => navigated = url, focus: async () => focused = true },
  ]);
  await w.fire('notificationclick', { notification: { data: { url: 'https://benevoles.example.test/7' }, close() {} } });
  assert.equal(new URL(navigated).pathname, '/notification.html');
  assert.equal(new URLSearchParams(new URL(navigated).hash.slice(1)).get('url'), 'https://benevoles.example.test/7');
  assert.equal(focused, true);
  assert.equal(w.opened.length, 0);
});

test('refuse de diriger une notification vers un autre site', async () => {
  const w = worker();
  await w.fire('push', { data: { json: () => ({ url: 'https://evil.example.test/7' }) } });
  assert.equal(w.notifications[0].options.data.url, 'https://benevoles.example.test/#/');
  await w.fire('notificationclick', { notification: { data: { url: 'https://evil.example.test/7' }, close() {} } });
  assert.equal(w.opened.length, 0);
});

test('affiche un message utile même avec un payload invalide', async () => {
  const w = worker();
  await w.fire('push', { data: { json: () => { throw new SyntaxError(); } } });
  assert.equal(w.notifications[0].options.body, 'Vos choix ont bien été pris en compte.');
  assert.equal(w.notifications[0].options.tag, 'confirmation');
  assert.equal(w.notifications[0].options.renotify, true);
});

test('relaie la réception et la demande d’affichage aux onglets sans exposer le payload', async () => {
  const w = worker();
  const messages = [];
  w.setWindows([{ postMessage: message => messages.push(message) }]);
  await w.fire('push', { data: { json: () => ({ title: 'Privé', body: 'Contenu privé', url: '/7', tag: 'confirmation-1' }) } });
  assert.deepEqual(messages.map(message => message.status), ['received', 'display-requested']);
  assert.equal(messages[0].type, 'benevoles.push-status');
  assert.equal(messages[0].at, messages[1].at);
  assert.ok(Number.isFinite(Date.parse(messages[0].at)));
  assert.equal(JSON.stringify(w.logs).includes('Privé'), false);
  assert.equal(JSON.stringify(messages).includes('confirmation-1'), false);
});

test('signale un refus de création sans le confondre avec une absence de réception', async () => {
  const w = worker();
  const messages = [];
  w.setWindows([{ postMessage: message => messages.push(message) }]);
  const error = new Error('Message interne');
  error.name = 'NotAllowedError';
  w.failDisplay(error);
  await assert.rejects(w.fire('push', {}), { name: 'NotAllowedError' });
  assert.deepEqual(messages.map(message => message.status), ['received', 'display-failed']);
  assert.equal(messages[1].errorName, 'NotAllowedError');
  assert.equal(w.notifications.length, 0);
  assert.equal(JSON.stringify(w.logs).includes('Message interne'), false);
});

test('un onglet fermé ne bloque ni l’affichage ni le diagnostic des autres onglets', async () => {
  const w = worker();
  const messages = [];
  w.setWindows([{ postMessage() { throw new Error('Fermé'); } }, { postMessage: message => messages.push(message) }]);
  await w.fire('push', { data: { json: () => null } });
  assert.equal(w.notifications.length, 1);
  assert.deepEqual(messages.map(message => message.status), ['received', 'display-requested']);
});

test('conserve le préfixe de déploiement pour les icônes et la page de notification', async () => {
  const w = worker('/benevoles/');
  await w.fire('push', { data: { json: () => ({ url: '/benevoles/#/7' }) } });
  const notification = w.notifications[0];
  assert.equal(notification.options.icon, 'https://benevoles.example.test/benevoles/icons/app-icon-192.png');
  assert.equal(notification.options.badge, notification.options.icon);
  await w.fire('notificationclick', { notification: { title: notification.title, ...notification.options, close() {} } });
  const target = new URL(w.opened[0]);
  assert.equal(target.pathname, '/benevoles/notification.html');
  assert.equal(new URLSearchParams(target.hash.slice(1)).get('url'), 'https://benevoles.example.test/benevoles/#/7');
});

test('revient à l’accueil sous le préfixe en cas de lien push invalide', async () => {
  const w = worker('/benevoles/');
  await w.fire('push', { data: { json: () => ({ url: 'https://evil.example.test/' }) } });
  assert.equal(w.notifications[0].options.data.url, 'https://benevoles.example.test/benevoles/#/');
});

test('sert les bonnes pages hors ligne sous le préfixe de déploiement', async () => {
  const w = worker('/benevoles/');
  for (const [path, fallback] of [['#/7', 'index.html'], ['notification.html?lecture=1', 'notification.html']]) {
    const response = await w.fire('fetch', { request: {
      method: 'GET', mode: 'navigate', url: `https://benevoles.example.test/benevoles/${path}`,
    } });
    assert.equal(response.cachedUrl, `https://benevoles.example.test/benevoles/${fallback}`);
  }
});
