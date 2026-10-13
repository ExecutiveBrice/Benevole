import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PushNotificationService } from './push-notification.service';

describe('Notifications bénévoles', () => {
  let service: PushNotificationService;
  let requests: HttpTestingController;
  let registration: ServiceWorkerRegistration;
  let subscription: PushSubscription;
  let permission: NotificationPermission;
  const api = `${environment.url}notifications`;
  const token = 'a'.repeat(43);
  const key = btoa(String.fromCharCode(4) + 'a'.repeat(64));
  const originalUrl = location.pathname + location.search + location.hash;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PushNotificationService);
    requests = TestBed.inject(HttpTestingController);
    localStorage.removeItem('benevole.push-access.7.1');
    localStorage.removeItem('benevole.push-access.8.2');
    spyOnProperty(service, 'supported', 'get').and.returnValue(true);
    permission = 'granted';
    spyOnProperty(Notification, 'permission', 'get').and.callFake(() => permission);
    subscription = {
      endpoint: 'https://fcm.googleapis.com/test', options: {},
      toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/test', keys: { p256dh: 'key', auth: 'auth' } }),
      unsubscribe: jasmine.createSpy('unsubscribe').and.resolveTo(true),
    } as unknown as PushSubscription;
    registration = { active: {}, pushManager: {
      getSubscription: jasmine.createSpy('getSubscription').and.resolveTo(subscription),
      subscribe: jasmine.createSpy('subscribe').and.resolveTo(subscription),
    } } as unknown as ServiceWorkerRegistration;
    spyOn(navigator.serviceWorker, 'getRegistration').and.resolveTo(registration);
  });

  afterEach(() => {
    requests.verify();
    localStorage.removeItem('benevole.push-access.7.1');
    localStorage.removeItem('benevole.push-access.8.2');
    history.replaceState(null, '', originalUrl);
  });

  const tick = () => new Promise(resolve => setTimeout(resolve, 0));

  it('relaie les diagnostics du worker dans la console de la page sans exposer le payload', () => {
    const log = spyOn(console, 'info');
    const diagnostics = jasmine.createSpy('diagnostics');
    service.diagnostics.subscribe(diagnostics);
    const at = '2026-10-12T10:00:00.000Z';
    navigator.serviceWorker.dispatchEvent(new MessageEvent('message', {
      data: { type: 'benevoles.push-status', status: 'received', at, body: 'Privé', endpoint: 'Secret' },
    }));
    expect(diagnostics).toHaveBeenCalledOnceWith({ status: 'received', at });
    expect(log).toHaveBeenCalledOnceWith('[Bénévoles Push]', { status: 'received', at });
  });

  it('consigne les erreurs d’affichage et ignore les autres messages du worker', () => {
    const log = spyOn(console, 'error');
    const diagnostics = jasmine.createSpy('diagnostics');
    service.diagnostics.subscribe(diagnostics);
    const at = '2026-10-12T10:00:00.000Z';
    navigator.serviceWorker.dispatchEvent(new MessageEvent('message', {
      data: { type: 'benevoles.push-status', status: 'display-failed', at, errorName: 'NotAllowedError' },
    }));
    for (const data of [null, { type: 'other' }, { type: 'benevoles.push-status', status: 'unknown', at }]) {
      navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data }));
    }
    expect(diagnostics).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledOnceWith('[Bénévoles Push]', { status: 'display-failed', at, errorName: 'NotAllowedError' });
  });

  it('demande la permission au clic puis transmet un abonnement avec l’accès personnel', async () => {
    service.remember(7, 1, token);
    permission = 'default';
    const permissionRequest = spyOn(Notification, 'requestPermission').and.callFake(async () => { permission = 'granted'; return permission; });
    const enabling = service.enable(7, 1, key);
    expect(permissionRequest).toHaveBeenCalled();
    await tick();
    requests.expectOne(`${api}/config`).flush({ enabled: true, publicKey: key });
    await tick();
    requests.expectOne(`${api}/subscriptions/status`).flush({ active: false });
    await tick();
    const request = requests.expectOne(`${api}/subscriptions`);
    expect(request.request.headers.get('X-Notification-Token')).toBe(token);
    expect(request.request.body.endpoint).toBe(subscription.endpoint);
    request.flush(null);
    await enabling;
  });

  it('sans permission ne transmet aucun abonnement', async () => {
    service.remember(7, 1, token);
    permission = 'default';
    spyOn(Notification, 'requestPermission').and.resolveTo('denied');
    await expectAsync(service.enable(7, 1, key)).toBeRejected();
    requests.expectNone(`${api}/subscriptions`);
  });

  it('sans accès personnel ne demande pas la permission', async () => {
    permission = 'default';
    const permissionRequest = spyOn(Notification, 'requestPermission').and.callFake(async () => { permission = 'granted'; return permission; });
    await expectAsync(service.enable(7, 1, key)).toBeRejected();
    expect(permissionRequest).not.toHaveBeenCalled();
  });

  it('crée l’abonnement navigateur avec la clé VAPID lorsque nécessaire', async () => {
    service.remember(7, 1, token);
    (registration.pushManager.getSubscription as jasmine.Spy).and.resolveTo(null);
    (registration.pushManager.subscribe as jasmine.Spy).and.callFake(async () => {
      (registration.pushManager.getSubscription as jasmine.Spy).and.resolveTo(subscription);
      return subscription;
    });
    permission = 'default';
    spyOn(Notification, 'requestPermission').and.callFake(async () => { permission = 'granted'; return permission; });
    const enabling = service.enable(7, 1, key);
    await tick();
    expect(registration.pushManager.subscribe).toHaveBeenCalledWith(jasmine.objectContaining({ userVisibleOnly: true }));
    requests.expectOne(`${api}/config`).flush({ enabled: true, publicKey: key });
    await tick();
    requests.expectOne(`${api}/subscriptions/status`).flush({ active: false });
    await tick();
    requests.expectOne(`${api}/subscriptions`).flush(null);
    await enabling;
  });

  it('désactive seulement l’association serveur sans désabonner les autres événements', async () => {
    service.remember(7, 1, token);
    const disabling = service.disable(7, 1);
    await tick();
    const request = requests.expectOne(`${api}/subscriptions`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body.endpoint).toBe(subscription.endpoint);
    request.flush(null);
    await disabling;
    expect(subscription.unsubscribe).not.toHaveBeenCalled();
  });

  it('retire le lien secret de l’adresse et conserve seulement le nouvel accès appareil', async () => {
    history.replaceState(null, '', `${location.pathname}#notifications=${token}`);
    const identifying = service.consumeInvitation(7);
    expect(location.hash).toBe('');
    const request = requests.expectOne(`${api}/identity`);
    expect(request.request.headers.get('X-Notification-Token')).toBe(token);
    request.flush({ benevole: { id: 1, email: 'alice@example.test' }, eventId: 7, token: 'b'.repeat(43) });
    expect((await identifying)?.id).toBe(1);
    expect(localStorage.getItem('benevole.push-access.7.1')).toBe('b'.repeat(43));
  });

  it('retire un accès expiré après vérification du statut', async () => {
    service.remember(7, 1, token);
    const checking = service.active(7, 1);
    const rejected = expectAsync(checking).toBeRejected();
    await tick();
    requests.expectOne(`${api}/subscriptions/status`).flush({}, { status: 401, statusText: 'Unauthorized' });
    await rejected;
    expect(service.hasAccess(7, 1)).toBeFalse();
  });

  async function associateResponse(config = true, active = false, failed = false): Promise<void> {
    await tick();
    if (config) requests.expectOne(`${api}/config`).flush({ enabled: true, publicKey: key });
    await tick();
    requests.expectOne(`${api}/subscriptions/status`).flush({ active });
    await tick();
    if (!active) {
      const request = requests.expectOne(`${api}/subscriptions`);
      if (failed) request.flush({}, { status: 503, statusText: 'Unavailable' });
      else request.flush(null);
    }
  }

  it('accepte avant inscription puis réutilise l’accord global pour deux événements', async () => {
    permission = 'default';
    const permissionRequest = spyOn(Notification, 'requestPermission').and.callFake(async () => { permission = 'granted'; return permission; });
    await service.prepare(key);
    expect(service.authorized).toBeTrue();
    requests.expectNone(`${api}/subscriptions`);
    service.remember(7, 1, token);
    const first = service.associate(7, 1);
    await associateResponse(); await first;
    service.remember(8, 2, token);
    const second = service.associate(8, 2);
    await associateResponse(false); await second;
    expect(permissionRequest).toHaveBeenCalledTimes(1);
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('ne demande pas à nouveau l’autorisation quand elle est déjà globale', async () => {
    const permissionRequest = spyOn(Notification, 'requestPermission');
    const prompts = jasmine.createSpy('prompt'); service.prompts.subscribe(prompts);
    expect(service.authorized).toBeTrue();
    service.promptIfNeeded(); await service.prepare(key);
    expect(permissionRequest).not.toHaveBeenCalled(); expect(prompts).not.toHaveBeenCalled();
  });

  it('propose à nouveau les notifications pour une autorisation absente ou refusée', () => {
    const prompts = jasmine.createSpy('prompt'); service.prompts.subscribe(prompts);
    permission = 'default'; service.promptIfNeeded();
    permission = 'denied'; service.promptIfNeeded();
    expect(prompts).toHaveBeenCalledTimes(2);
  });

  it('explique un refus navigateur sans tenter une nouvelle demande native bloquée', async () => {
    permission = 'denied';
    const permissionRequest = spyOn(Notification, 'requestPermission');
    await expectAsync(service.prepare(key)).toBeRejectedWithError(/réglages du navigateur/);
    expect(permissionRequest).not.toHaveBeenCalled();
  });

  it('ne réinscrit pas un abonnement actif et ne redemande pas la permission', async () => {
    service.remember(7, 1, token);
    const permissionRequest = spyOn(Notification, 'requestPermission');
    const associating = service.associate(7, 1);
    await associateResponse(true, true);
    expect(await associating).toBeTrue();
    requests.expectNone(`${api}/subscriptions`);
    expect(permissionRequest).not.toHaveBeenCalled();
  });

  it('déduplique l’association simultanée demandée par la page et l’application', async () => {
    service.remember(7, 1, token);
    const first = service.associate(7, 1);
    const second = service.associate(7, 1);
    expect(first).toBe(second);
    await associateResponse(); await Promise.all([first, second]);
  });

  it('conserve l’accord global et permet une reprise après une indisponibilité serveur', async () => {
    service.remember(7, 1, token);
    const completing = service.associate(7, 1);
    const rejected = expectAsync(completing).toBeRejected();
    await associateResponse(true, false, true); await rejected;
    expect(service.authorized).toBeTrue();
    const retry = service.associate(7, 1);
    await associateResponse(false); expect(await retry).toBeTrue();
  });

  it('synchronise deux événements connus avec un seul abonnement navigateur', async () => {
    service.remember(7, 1, token); service.remember(8, 2, 'b'.repeat(43));
    (registration.pushManager.getSubscription as jasmine.Spy).and.resolveTo(null);
    (registration.pushManager.subscribe as jasmine.Spy).and.callFake(async () => {
      (registration.pushManager.getSubscription as jasmine.Spy).and.resolveTo(subscription);
      return subscription;
    });
    const syncing = service.syncKnown();
    await tick(); requests.expectOne(`${api}/config`).flush({ enabled: true, publicKey: key });
    await tick();
    const statuses = requests.match(`${api}/subscriptions/status`);
    expect(statuses.length).toBe(2); statuses.forEach(request => request.flush({ active: false }));
    await tick();
    const subscriptions = requests.match(`${api}/subscriptions`);
    expect(subscriptions.length).toBe(2);
    expect(subscriptions.map(request => request.request.headers.get('X-Notification-Token')).sort())
      .toEqual([token, 'b'.repeat(43)]);
    subscriptions.forEach(request => request.flush(null)); await syncing;
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1);
  });
});
