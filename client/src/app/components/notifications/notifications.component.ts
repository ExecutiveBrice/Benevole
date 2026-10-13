import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="card-body border-top">
      <p class="fw-semibold mb-1">Confirmation de vos choix</p>
      <p class="small text-body-secondary mb-2">Recevez une notification sur cet appareil après l’enregistrement de vos choix.</p>
      @if (loading) {
        <p class="small mb-0" role="status">Vérification des notifications…</p>
      } @else if (!push.supported) {
        <p class="small mb-0">Notifications indisponibles ici. Sur iPhone ou iPad, ajoutez l’application à l’écran d’accueil, puis ouvrez-la depuis son icône.</p>
      } @else if (!publicKey) {
        <p class="small mb-0">Les notifications ne sont pas encore disponibles pour cet événement.</p>
      } @else if (!push.authorized) {
        <button class="btn btn-sm btn-outline-primary" type="button" [disabled]="busy" (click)="authorize()">
          {{ busy ? 'Veuillez patienter…' : 'Autoriser les notifications de l’application' }}
        </button>
      } @else {
        <p class="small mb-1" role="status">Notifications autorisées pour toute l’application.</p>
        @if (active) {
          <p class="small mb-0">Vous recevrez la confirmation de vos choix.</p>
        } @else if (!push.hasAccess(eventId, benevoleId)) {
          <p class="small mb-0">Pour recevoir vos confirmations sur cet appareil, ouvrez votre lien personnel fourni par l’organisateur.</p>
        } @else {
          <button class="btn btn-sm btn-outline-primary" type="button" [disabled]="busy" (click)="synchronize()">{{ busy ? 'Veuillez patienter…' : 'Connecter mes inscriptions aux notifications' }}</button>
        }
        <p class="small text-body-secondary mt-2 mb-0">Pour retirer l’autorisation, utilisez les réglages du navigateur.</p>
      }
      @if (message) { <p class="small mt-2 mb-0" role="status">{{ message }}</p> }
    </div>
  `,
})
export class NotificationsComponent implements OnChanges {
  @Input({ required: true }) eventId!: number;
  @Input({ required: true }) benevoleId!: number;
  publicKey = '';
  active = false;
  loading = true;
  busy = false;
  message = '';
  private generation = 0;

  constructor(public push: PushNotificationService, private changes: ChangeDetectorRef) {
    push.changes.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(eventId => {
      if (eventId === this.eventId && !this.busy) void this.ngOnChanges();
    });
    push.permissionChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      if (!this.busy) void this.ngOnChanges();
    });
  }

  async ngOnChanges(): Promise<void> {
    const generation = ++this.generation;
    this.loading = true;
    this.message = '';
    this.active = false;
    try {
      const config = await this.push.config();
      if (generation !== this.generation) return;
      this.publicKey = config.enabled ? config.publicKey : '';
      const active = config.enabled && this.push.supported && await this.push.active(this.eventId, this.benevoleId);
      if (generation !== this.generation) return;
      this.active = active;
    } catch (error) {
      if (generation !== this.generation) return;
      this.message = this.errorMessage(error);
    } finally {
      if (generation === this.generation) {
        this.loading = false;
        this.changes.markForCheck();
      }
    }
  }

  async authorize(): Promise<void> {
    this.busy = true;
    this.message = '';
    try {
      await this.push.prepare(this.publicKey);
      this.active = await this.push.associate(this.eventId, this.benevoleId);
    } catch (error) {
      this.message = this.errorMessage(error);
    } finally {
      this.busy = false;
      this.changes.markForCheck();
    }
  }

  async synchronize(): Promise<void> {
    this.busy = true;
    this.message = '';
    try { this.active = await this.push.associate(this.eventId, this.benevoleId); }
    catch (error) { this.message = this.errorMessage(error); }
    finally { this.busy = false; this.changes.markForCheck(); }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.status === 401 ? 'Votre accès personnel a expiré. Demandez un nouveau lien à l’organisateur.'
        : 'Impossible de contacter le service de notifications. Réessayez.';
    }
    return error instanceof Error ? error.message : 'Impossible d’activer les notifications. Réessayez.';
  }
}
