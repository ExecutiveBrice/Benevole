import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Benevole, Evenement } from '../../models';
import { PushNotificationService } from '../../services/push-notification.service';
import { TransmissionService } from '../../services/transmission.service';
import { EventNotificationPromptComponent } from './event-notification-prompt.component';

describe('Association des événements après autorisation globale', () => {
  let fixture: ComponentFixture<EventNotificationPromptComponent>;
  let push: jasmine.SpyObj<PushNotificationService>;
  let identities: Subject<Benevole | undefined>;
  let permissions: Subject<void>;
  const event = { id: 7, notification: true } as Evenement;
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));

  beforeEach(() => {
    permissions = new Subject(); identities = new Subject();
    push = jasmine.createSpyObj('Push', ['hasAccess', 'associate'], { authorized: true, permissionChanges: permissions });
    push.hasAccess.and.returnValue(true); push.associate.and.resolveTo(true);
    TestBed.configureTestingModule({ imports: [EventNotificationPromptComponent], providers: [
      { provide: PushNotificationService, useValue: push },
      { provide: TransmissionService, useValue: { benevoleStream: identities.asObservable() } },
    ] });
    fixture = TestBed.createComponent(EventNotificationPromptComponent);
    fixture.componentRef.setInput('event', event); fixture.detectChanges();
  });

  it('associe automatiquement un bénévole identifié avec un accès personnel', async () => {
    identities.next({ id: 1 } as Benevole); await tick();
    expect(push.associate).toHaveBeenCalledOnceWith(7, 1);
  });

  it('associe après un accord global donné pendant la visite', async () => {
    (Object.getOwnPropertyDescriptor(push, 'authorized')!.get as jasmine.Spy).and.returnValue(false);
    identities.next({ id: 1 } as Benevole); await tick();
    expect(push.associate).not.toHaveBeenCalled();
    (Object.getOwnPropertyDescriptor(push, 'authorized')!.get as jasmine.Spy).and.returnValue(true);
    permissions.next(); await tick();
    expect(push.associate).toHaveBeenCalledOnceWith(7, 1);
  });

  it('ne donne pas accès aux confirmations à partir de la seule identité publique', async () => {
    push.hasAccess.and.returnValue(false);
    identities.next({ id: 1 } as Benevole); await tick();
    expect(push.associate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.message).toContain('lien personnel');
  });

  it('respecte le réglage d’envoi des confirmations de l’événement', async () => {
    fixture.componentRef.setInput('event', { ...event, notification: false }); fixture.detectChanges();
    identities.next({ id: 1 } as Benevole); await tick();
    expect(push.associate).not.toHaveBeenCalled();
  });
});
