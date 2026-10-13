import { ChangeDetectorRef, Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  standalone: true,
  template: `
    <div class="modal-header">
      <h2 class="modal-title fs-5" id="notification-prompt-title">Autoriser les notifications de Bénévoles</h2>
      <button type="button" class="btn-close" aria-label="Fermer" [disabled]="busy" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>Recevez sur cet appareil la confirmation de vos inscriptions aux créneaux.</p>
      <p class="small text-body-secondary">Votre autorisation s’applique à toute l’application et à tous vos événements. Vous pourrez la retirer dans les réglages du navigateur.</p>
      @if (message) { <p class="text-danger mb-0" role="alert">{{ message }}</p> }
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" type="button" [disabled]="busy" (click)="modal.dismiss()">Plus tard</button>
      <button class="btn btn-primary" type="button" [disabled]="busy" (click)="accept()">{{ busy ? 'Activation…' : 'Autoriser les notifications' }}</button>
    </div>
  `,
})
export class ApplicationNotificationDialogComponent {
  publicKey = '';
  busy = false;
  message = '';
  constructor(public modal: NgbActiveModal, private push: PushNotificationService, private changes: ChangeDetectorRef) {}

  async accept(): Promise<void> {
    this.busy = true;
    this.message = '';
    try {
      await this.push.prepare(this.publicKey);
      this.modal.close(true);
    } catch (error) {
      this.message = error instanceof Error ? error.message : 'Activation impossible. Réessayez.';
    } finally {
      this.busy = false;
      this.changes.markForCheck();
    }
  }
}

@Component({
  selector: 'app-application-notification-prompt',
  standalone: true,
  template: `
    @if (message) {
      <div class="alert alert-info mx-3 mt-3" role="status">
        {{ message }}
        <button class="btn btn-sm btn-outline-primary ms-2" type="button" (click)="check()">Réessayer</button>
      </div>
    }
  `,
})
export class ApplicationNotificationPromptComponent implements OnInit, OnDestroy {
  message = '';
  private checking = false;
  private destroyed = false;
  private modal?: NgbModalRef;
  private readonly destroyRef = inject(DestroyRef);

  constructor(public push: PushNotificationService, private modals: NgbModal, private changes: ChangeDetectorRef) {
    push.prompts.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => void this.check());
    push.permissionChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.modal) void this.check();
    });
  }

  ngOnInit(): void { void this.check(); }

  async check(): Promise<void> {
    if (!this.push.supported || this.checking || this.modal || this.destroyed) return;
    this.checking = true;
    this.message = '';
    try {
      const config = await this.push.config();
      if (this.destroyed || !config.enabled) return;
      if (this.push.authorized) { await this.push.syncKnown(); return; }
      const modal = this.modals.open(ApplicationNotificationDialogComponent, {
        centered: true, ariaLabelledBy: 'notification-prompt-title',
      });
      this.modal = modal;
      modal.componentInstance.publicKey = config.publicKey;
      modal.result.then(async () => {
        this.modal = undefined;
        if (this.destroyed) return;
        try { await this.push.syncKnown(); }
        catch { this.message = 'Autorisation reçue. La connexion au service de notifications a échoué. Réessayez.'; }
        this.changes.markForCheck();
      }, () => { this.modal = undefined; });
    } catch {
      if (!this.destroyed) this.message = 'Impossible de contacter le service de notifications. Réessayez.';
    } finally {
      this.checking = false;
      if (!this.destroyed) this.changes.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.modal?.dismiss();
  }
}
