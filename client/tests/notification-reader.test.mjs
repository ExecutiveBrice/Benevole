import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function reader(values) {
  const elements = Object.fromEntries(['title', 'message', 'received', 'event-link'].map(id => [id, {}]));
  const handlers = {};
  const window = {
    location: { origin: 'https://benevoles.example.test', hash: `#${new URLSearchParams(values)}` },
    addEventListener: (name, handler) => handlers[name] = handler,
  };
  vm.runInNewContext(readFileSync(new URL('../public/notification.js', import.meta.url), 'utf8'), {
    window, document: { getElementById: id => elements[id] }, URL, URLSearchParams,
  });
  return { elements, window, handlers };
}

test('conserve le message intégral, les accents et les sauts de ligne comme texte', () => {
  const body = 'Vos choix pour « Fête & bénévoles » sont enregistrés.\n<script>alert(1)</script>';
  const { elements } = reader({ title: 'Participation enregistrée', body, url: '/7', at: '2026-10-13T12:00:00Z' });
  assert.equal(elements.title.textContent, 'Participation enregistrée');
  assert.equal(elements.message.textContent, body);
  assert.equal(elements.message.innerHTML, undefined);
  assert.equal(elements['event-link'].href, 'https://benevoles.example.test/7');
  assert.equal(elements.received.hidden, false);
  assert.equal(elements.received.dateTime, '2026-10-13T12:00:00.000Z');
});

test('refuse les liens externes et les liens exécutables', () => {
  for (const url of ['https://evil.example.test', 'javascript:alert(1)', 'http://[']) {
    const { elements } = reader({ url, at: 'invalide' });
    assert.equal(elements['event-link'].href, '/');
    assert.equal(elements.received.hidden, true);
  }
});

test('actualise le message quand une autre notification réutilise la page', () => {
  const { elements, window, handlers } = reader({ body: 'Ancien message', url: '/7' });
  window.location.hash = `#${new URLSearchParams({ body: 'Nouveau message', url: '/8' })}`;
  handlers.hashchange();
  assert.equal(elements.message.textContent, 'Nouveau message');
  assert.equal(elements['event-link'].href, 'https://benevoles.example.test/8');
});
