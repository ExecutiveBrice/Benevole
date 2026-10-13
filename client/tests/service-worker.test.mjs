import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function worker() {
  const events = {};
  const notifications = [];
  const logs = [];
  const opened = [];
  let windows = [];
  let displayError;
  const self = {
    location: { origin: 'https://benevoles.example.test' },
    addEventListener: (name, handler) => events[name] = handler,
    registration: { showNotification: async (title, options) => {
      if (displayError) throw displayError;
      notifications.push({ title, options });
    } },
    clients: {
      matchAll: async () => windows,
      openWindow: async url => opened.push(url),
    },
  };
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self, URL, URLSearchParams, console: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });
  const fire = async (name, values) => {
    let waiting;
    events[name]({ ...values, waitUntil: value => waiting = value });
    await waiting;
  };
  return { notifications, opened, logs, fire, setWindows: value => windows = value, failDisplay: error => displayError = error };
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
  assert.equal(w.notifications[0].options.data.url, 'https://benevoles.example.test/');
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
