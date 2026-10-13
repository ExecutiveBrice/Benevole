import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Benevole, Evenement } from '../../models';
import { TransmissionService } from '../../services/transmission.service';
import { PushNotificationService } from '../../services/push-notification.service';

/** Associe les inscriptions à l'abonnement global ; ne demande aucune permission. */
@Component({
  selector: 'app-event-notification-prompt',
  standalone: true,
  template: `
    @if (message) {
      <div class="alert alert-info mx-3 mt-3" role="status">
        {{ message }}
        @if (benevole && push.hasAccess(event.id, benevole.id)) {
          <button class="btn btn-sm btn-outline-primary ms-2" type="button" [disabled]="binding" (click)="associate()">Réessayer</button>
        }
      </div>
    }
  `,
})
export class EventNotificationPromptComponent implements OnChanges {
  @Input({ required: true }) event!: Evenement;
  benevole: Benevole | undefined;
  message = '';
  binding = false;
  private generation = 0;
  private readonly destroyRef = inject(DestroyRef);

  constructor(public push: PushNotificationService, private transmission: TransmissionService, private changes: ChangeDetectorRef) {
    this.transmission.benevoleStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(benevole => {
      this.benevole = benevole;
      void this.associate();
    });
    push.permissionChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => void this.associate());
    this.destroyRef.onDestroy(() => this.generation++);
  }

  ngOnChanges(): void {
    this.generation++;
    this.benevole = undefined;
    this.message = '';
  }

  async associate(): Promise<void> {
    const event = this.event;
    const benevole = this.benevole;
    if (!event?.notification || !benevole || !this.push.authorized || this.binding) return;
    if (!this.push.hasAccess(event.id, benevole.id)) {
      this.message = 'Notifications autorisées pour l’application. Pour recevoir vos confirmations sur cet appareil, ouvrez votre lien personnel fourni par l’organisateur.';
      this.changes.markForCheck();
      return;
    }
    const generation = this.generation;
    this.binding = true;
    try {
      await this.push.associate(event.id, benevole.id);
      if (generation === this.generation) this.message = '';
    } catch {
      if (generation === this.generation) this.message = 'Impossible de connecter vos inscriptions au service de notifications. Réessayez.';
    } finally {
      this.binding = false;
      this.changes.markForCheck();
    }
  }
}
