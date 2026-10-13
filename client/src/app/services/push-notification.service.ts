import { DestroyRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Benevole } from '../models';

export interface PushConfig { enabled: boolean; publicKey: string; }
export interface PushDiagnostic {
  status: 'received' | 'display-requested' | 'display-failed';
  at: string;
  errorName?: string;
}
interface NotificationIdentity { benevole: Benevole; eventId: number; token: string; }

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly api = `${environment.url}notifications`;
  private configRequest?: Promise<PushConfig>;
  private readonly associations = new Map<string, Promise<boolean>>();
  private browserRequest?: Promise<PushSubscription>;
  readonly changes = new Subject<number>();
  readonly permissionChanges = new Subject<void>();
  readonly prompts = new Subject<void>();
  readonly diagnostics = new Subject<PushDiagnostic>();

  constructor(private http: HttpClient, destroyRef: DestroyRef) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type !== 'benevoles.push-status' || typeof data.at !== 'string'
          || !['received', 'display-requested', 'display-failed'].includes(data.status)) return;
      const diagnostic: PushDiagnostic = {
        status: data.status, at: data.at,
        ...(typeof data.errorName === 'string' ? { errorName: data.errorName } : {}),
      };
      if (diagnostic.status === 'display-failed') console.error('[Bénévoles Push]', diagnostic);
      else console.info('[Bénévoles Push]', diagnostic);
      this.diagnostics.next(diagnostic);
    };
    navigator.serviceWorker.addEventListener('message', listener);
    destroyRef.onDestroy(() => navigator.serviceWorker.removeEventListener('message', listener));
  }

  get supported(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext && 'Notification' in window
      && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  config(): Promise<PushConfig> {
    return this.configRequest ??= firstValueFrom(this.http.get<PushConfig>(`${this.api}/config`)).catch(error => {
      this.configRequest = undefined;
      throw error;
    });
  }

  get authorized(): boolean { return this.supported && Notification.permission === 'granted'; }

  promptIfNeeded(): void {
    if (this.supported && !this.authorized) this.prompts.next();
  }

  remember(eventId: number, benevoleId: number, token: string): void {
    try { localStorage.setItem(this.storageKey(eventId, benevoleId), token); }
    catch { throw new Error('Le stockage de cet appareil est désactivé. Autorisez-le pour activer les notifications.'); }
  }

  hasAccess(eventId: number, benevoleId: number): boolean {
    return !!this.token(eventId, benevoleId);
  }

  async consumeInvitation(eventId: number): Promise<Benevole | null> {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('notifications');
    if (!token) return null;
    // Le secret ne doit pas rester dans l'adresse ni être envoyé comme référent.
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
    const identity = await firstValueFrom(this.http.post<NotificationIdentity>(`${this.api}/identity`, {}, {
      headers: new HttpHeaders({ 'X-Notification-Token': token }),
    }));
    if (identity.eventId !== eventId) throw new Error('Ce lien personnel correspond à un autre événement.');
    this.remember(eventId, identity.benevole.id, identity.token);
    return identity.benevole;
  }

  async active(eventId: number, benevoleId: number): Promise<boolean> {
    if (!this.supported || !this.hasAccess(eventId, benevoleId) || Notification.permission !== 'granted') return false;
    const subscription = await (await this.registration()).pushManager.getSubscription();
    if (!subscription) return false;
    try {
      const status = await firstValueFrom(this.http.post<{ active: boolean }>(`${this.api}/subscriptions/status`, {
        endpoint: subscription.endpoint,
      }, { headers: this.headers(eventId, benevoleId) }));
      return status.active;
    } catch (error) {
      if ((error as { status?: number }).status === 401) this.forget(eventId, benevoleId);
      throw error;
    }
  }

  async enable(eventId: number, benevoleId: number, publicKey: string): Promise<void> {
    this.headers(eventId, benevoleId);
    await this.prepare(publicKey);
    await this.associate(eventId, benevoleId);
  }

  /** Le consentement peut précéder l'inscription, mais l'association exige l'accès personnel. */
  async prepare(publicKey: string): Promise<void> {
    if (!this.supported) throw new Error('Les notifications ne sont pas disponibles sur cet appareil.');
    if (Notification.permission === 'denied') throw new Error('Les notifications sont bloquées. Autorisez Bénévoles dans les réglages du navigateur, puis réessayez.');
    // Premier appel depuis le clic : les navigateurs exigent une action de l'utilisateur.
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Autorisez les notifications dans les réglages du navigateur pour les activer.');
    await this.browserSubscription(publicKey);
    this.permissionChanges.next();
  }

  private browserSubscription(publicKey: string): Promise<PushSubscription> {
    return this.browserRequest ??= this.createBrowserSubscription(publicKey).finally(() => this.browserRequest = undefined);
  }

  private async createBrowserSubscription(publicKey: string): Promise<PushSubscription> {
    const registration = await this.registration();
    let subscription = await registration.pushManager.getSubscription();
    const key = this.decodeKey(publicKey);
    if (subscription?.options.applicationServerKey && !this.sameKey(subscription.options.applicationServerKey, key)) {
      throw new Error('La configuration des notifications a changé. Réinitialisez les autorisations du site puis réessayez.');
    }
    subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    return subscription;
  }

  /** Réutilise l'accord global sans demander une permission pour chaque événement. */
  associate(eventId: number, benevoleId: number): Promise<boolean> {
    if (!this.authorized || !this.hasAccess(eventId, benevoleId)) return Promise.resolve(false);
    const key = `${eventId}.${benevoleId}`;
    const existing = this.associations.get(key);
    if (existing) return existing;
    const operation = this.attach(eventId, benevoleId).finally(() => this.associations.delete(key));
    this.associations.set(key, operation);
    return operation;
  }

  private async attach(eventId: number, benevoleId: number): Promise<boolean> {
    const config = await this.config();
    if (!config.enabled || !this.authorized) return false;
    const headers = this.headers(eventId, benevoleId);
    const subscription = await this.browserSubscription(config.publicKey);
    try {
      if (await this.active(eventId, benevoleId)) return true;
      await firstValueFrom(this.http.post<void>(`${this.api}/subscriptions`, subscription.toJSON(), { headers }));
      this.changes.next(eventId);
      return true;
    } catch (error) {
      if ((error as { status?: number }).status === 401) this.forget(eventId, benevoleId);
      throw error;
    }
  }

  async syncKnown(): Promise<void> {
    if (!this.authorized) return;
    const identities: { eventId: number; benevoleId: number }[] = [];
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        const match = key?.match(/^benevole\.push-access\.(\d+)\.(\d+)$/);
        if (match) identities.push({ eventId: Number(match[1]), benevoleId: Number(match[2]) });
      }
    } catch { return; }
    await Promise.all(identities.map(async identity => {
      try { await this.associate(identity.eventId, identity.benevoleId); }
      catch (error) { if ((error as { status?: number }).status !== 401) throw error; }
    }));
  }

  async disable(eventId: number, benevoleId: number): Promise<void> {
    const subscription = await (await this.registration()).pushManager.getSubscription();
    if (subscription) {
      await firstValueFrom(this.http.delete<void>(`${this.api}/subscriptions`, {
        headers: this.headers(eventId, benevoleId), body: { endpoint: subscription.endpoint },
      }));
    }
    // L'abonnement du navigateur peut servir à d'autres événements sur cet appareil.
    this.changes.next(eventId);
  }

  invitation(benevoleId: number): Promise<string> {
    return firstValueFrom(this.http.post<{ url: string }>(`${this.api}/invitations`, {}, {
      params: { benevoleId },
    })).then(result => result.url);
  }

  private async registration(): Promise<ServiceWorkerRegistration> {
    const registration = await navigator.serviceWorker.getRegistration('/')
      ?? await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
    if (registration.active) return registration;
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Le service de notifications ne répond pas. Réessayez.')), 10000)),
    ]);
  }

  private token(eventId: number, benevoleId: number): string | null {
    try { return localStorage.getItem(this.storageKey(eventId, benevoleId)); }
    catch { return null; }
  }

  private forget(eventId: number, benevoleId: number): void {
    try { localStorage.removeItem(this.storageKey(eventId, benevoleId)); } catch { /* stockage désactivé */ }
  }

  private headers(eventId: number, benevoleId: number): HttpHeaders {
    const token = this.token(eventId, benevoleId);
    if (!token) throw new Error('Demandez votre lien personnel à l’organisateur pour activer les notifications.');
    return new HttpHeaders({ 'X-Notification-Token': token });
  }

  private storageKey(eventId: number, benevoleId: number): string {
    return `benevole.push-access.${eventId}.${benevoleId}`;
  }

  private decodeKey(value: string): Uint8Array<ArrayBuffer> {
    const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, char => char.charCodeAt(0));
  }

  private sameKey(stored: ArrayBuffer, expected: Uint8Array): boolean {
    const bytes = new Uint8Array(stored);
    return bytes.length === expected.length && bytes.every((byte, index) => byte === expected[index]);
  }
}
