import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function startup({ online = true, storage = new Map(), storageBlocked = false } = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  const elements = {
    'app-startup': { remove() { this.removed = true; } },
    'app-startup-message': { textContent: 'Chargement de l’application…' },
    'app-startup-retry': Object.assign(new EventTarget(), { hidden: true }),
  };
  document.baseURI = 'https://benevoles.example.test/benevoles/';
  document.visibilityState = 'visible';
  document.getElementById = id => elements[id];
  let reloads = 0;
  let now = 0;
  let timer;
  let timerCleared = false;
  window.location = { reload: () => reloads++ };
  const navigator = { onLine: online };
  const sessionStorage = {
    getItem: key => {
      if (storageBlocked) throw new Error('SecurityError');
      return storage.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (storageBlocked) throw new Error('SecurityError');
      storage.set(key, value);
    },
    removeItem: key => storage.delete(key),
  };
  vm.runInNewContext(script, {
    window, document, navigator, sessionStorage, Date: { now: () => now },
    setTimeout: (callback, delay) => {
      assert.equal(delay, 20000);
      timer = callback;
      return 1;
    },
    clearTimeout: () => timerCleared = true,
  });
  return {
    elements, storage, navigator, window, document,
    get reloads() { return reloads; },
    get timerCleared() { return timerCleared; },
    timeout: () => { now = 20001; if (!timerCleared) timer(); },
    advance: () => now = 20001,
    fire: name => window.dispatchEvent(new Event(name)),
  };
}

test('une ouverture réussie retire le chargement et désactive la reprise', () => {
  const s = startup({ storage: new Map([['benevoles.startup-reload', '1']]) });
  s.fire('benevoles:startup-ready');
  assert.equal(s.elements['app-startup'].removed, true);
  assert.equal(s.timerCleared, true);
  assert.equal(s.storage.size, 0);
  s.timeout();
  s.fire('benevoles:startup-failed');
  s.fire('pageshow');
  assert.equal(s.reloads, 0);
});

test('une ouverture bloquée est relancée une seule fois, y compris après le rechargement', () => {
  const storage = new Map();
  const first = startup({ storage });
  first.timeout();
  first.fire('benevoles:startup-failed');
  assert.equal(first.reloads, 1);
  const second = startup({ storage });
  second.timeout();
  second.fire('benevoles:startup-failed');
  assert.equal(second.reloads, 0);
  assert.equal(second.elements['app-startup-retry'].hidden, false);
  second.elements['app-startup-retry'].dispatchEvent(new Event('click'));
  assert.equal(second.reloads, 1);
});

test('le mode hors ligne affiche une attente et reprend au retour du réseau', () => {
  const s = startup({ online: false });
  s.timeout();
  assert.equal(s.reloads, 0);
  assert.match(s.elements['app-startup-message'].textContent, /Connexion indisponible/);
  s.navigator.onLine = true;
  s.fire('online');
  assert.equal(s.reloads, 1);
});

test('une erreur de bootstrap déclenche la reprise immédiatement', () => {
  const s = startup();
  s.fire('benevoles:startup-failed');
  assert.equal(s.reloads, 1);
});

test('un script local manquant déclenche la reprise sans attendre Angular', () => {
  const s = startup();
  const event = new Event('error');
  Object.defineProperty(event, 'target', { value: { tagName: 'SCRIPT', src: s.document.baseURI + 'main-OLD.js' } });
  s.window.dispatchEvent(event);
  assert.equal(s.reloads, 1);
});

test('une image ou une ressource externe en erreur ne relance pas la page', () => {
  const s = startup();
  for (const target of [
    { tagName: 'IMG', src: s.document.baseURI + 'photo.png' },
    { tagName: 'SCRIPT', src: 'https://external.example.test/main.js' },
  ]) {
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: target });
    s.window.dispatchEvent(event);
  }
  s.fire('online');
  assert.equal(s.reloads, 0);
});

test('une sortie de veille détecte le démarrage bloqué même si les timers étaient suspendus', () => {
  for (const event of ['pageshow', 'visibilitychange']) {
    const s = startup();
    s.advance();
    (event === 'pageshow' ? s.window : s.document).dispatchEvent(new Event(event));
    assert.equal(s.reloads, 1);
  }
});

test('un stockage interdit conserve une reprise manuelle sans boucle de rechargement', () => {
  const s = startup({ storageBlocked: true });
  s.timeout();
  s.fire('pageshow');
  assert.equal(s.reloads, 0);
  assert.equal(s.elements['app-startup-retry'].hidden, false);
  s.elements['app-startup-retry'].dispatchEvent(new Event('click'));
  assert.equal(s.reloads, 1);
});
