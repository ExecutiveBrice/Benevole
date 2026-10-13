import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';
import { ApplicationNotificationDialogComponent, ApplicationNotificationPromptComponent } from './application-notification-prompt.component';

describe('Autorisation globale à l’ouverture de l’application', () => {
  let fixture: ComponentFixture<ApplicationNotificationPromptComponent>;
  let push: jasmine.SpyObj<PushNotificationService>;
  let modals: jasmine.SpyObj<NgbModal>;
  let prompts: Subject<void>;
  let accept: (value: boolean) => void;
  let refuse: () => void;
  let dismiss: jasmine.Spy;
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));

  beforeEach(() => {
    prompts = new Subject();
    push = jasmine.createSpyObj('Push', ['config', 'syncKnown'], {
      supported: true, authorized: false, prompts, permissionChanges: new Subject<void>(),
    });
    push.config.and.resolveTo({ enabled: true, publicKey: 'public-key' });
    push.syncKnown.and.resolveTo();
    modals = jasmine.createSpyObj('Modal', ['open']);
    dismiss = jasmine.createSpy('dismiss');
    modals.open.and.callFake(() => ({ componentInstance: {}, dismiss,
      result: new Promise<boolean>((resolve, reject) => { accept = resolve; refuse = reject; }),
    } as never));
    TestBed.configureTestingModule({ imports: [ApplicationNotificationPromptComponent], providers: [
      { provide: PushNotificationService, useValue: push }, { provide: NgbModal, useValue: modals },
    ] });
    fixture = TestBed.createComponent(ApplicationNotificationPromptComponent);
  });

  it('ouvre à l’arrivée dans l’application sans événement ni bénévole identifié', async () => {
    fixture.detectChanges(); await tick();
    expect(modals.open).toHaveBeenCalledTimes(1);
    expect(modals.open.calls.mostRecent().returnValue.componentInstance.publicKey).toBe('public-key');
  });

  it('ne redemande rien quand cet appareil autorise déjà l’application', async () => {
    (Object.getOwnPropertyDescriptor(push, 'authorized')!.get as jasmine.Spy).and.returnValue(true);
    fixture.detectChanges(); await tick();
    expect(modals.open).not.toHaveBeenCalled(); expect(push.syncKnown).toHaveBeenCalledTimes(1);
  });

  it('propose à nouveau après une inscription si la première proposition a été fermée', async () => {
    fixture.detectChanges(); await tick(); refuse(); await tick();
    prompts.next(); await tick();
    expect(modals.open).toHaveBeenCalledTimes(2);
  });

  it('évite les popups simultanés pendant une première demande ou sa vérification', async () => {
    fixture.detectChanges(); prompts.next(); prompts.next(); await tick();
    prompts.next(); await tick(); expect(modals.open).toHaveBeenCalledTimes(1);
  });

  it('synchronise tous les événements connus après l’accord', async () => {
    fixture.detectChanges(); await tick(); accept(true); await tick();
    expect(push.syncKnown).toHaveBeenCalledTimes(1);
  });

  it('respecte la disponibilité du serveur et de l’appareil', async () => {
    push.config.and.resolveTo({ enabled: false, publicKey: '' });
    fixture.detectChanges(); await tick(); expect(modals.open).not.toHaveBeenCalled();
    (Object.getOwnPropertyDescriptor(push, 'supported')!.get as jasmine.Spy).and.returnValue(false);
    await fixture.componentInstance.check(); expect(modals.open).not.toHaveBeenCalled();
  });

  it('ferme le popup à la destruction de l’application', async () => {
    fixture.detectChanges(); await tick(); fixture.destroy(); expect(dismiss).toHaveBeenCalled();
  });
});

describe('Consentement dans le popup global', () => {
  it('demande la permission depuis le clic et explique un refus sans fermer le popup', async () => {
    const push = jasmine.createSpyObj('Push', ['prepare']);
    push.prepare.and.rejectWith(new Error('Autorisez Bénévoles dans les réglages du navigateur.'));
    const modal = jasmine.createSpyObj('Modal', ['close', 'dismiss']);
    TestBed.configureTestingModule({ imports: [ApplicationNotificationDialogComponent], providers: [
      { provide: PushNotificationService, useValue: push }, { provide: NgbActiveModal, useValue: modal },
    ] });
    const fixture = TestBed.createComponent(ApplicationNotificationDialogComponent);
    fixture.componentInstance.publicKey = 'public-key'; fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('tous vos événements');
    expect(push.prepare).not.toHaveBeenCalled();
    (fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement).click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(push.prepare).toHaveBeenCalledOnceWith('public-key');
    expect(modal.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('réglages du navigateur');
  });
});
