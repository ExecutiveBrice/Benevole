import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { jwtAuthenticationInterceptor } from '../../services/auth.interceptor';
import { ModalAccessGestionComponent } from './modalAccessGestion.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('Connexion administrateur par modale', () => {
  let component: ModalAccessGestionComponent;
  let fixture: ComponentFixture<ModalAccessGestionComponent>;
  let requests: HttpTestingController;
  let dialogRef: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('NgbActiveModal', ['close']);
    await TestBed.configureTestingModule({
      imports: [ModalAccessGestionComponent],
      providers: [
        provideHttpClient(withInterceptors([jwtAuthenticationInterceptor])),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: NgbActiveModal, useValue: dialogRef }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAccessGestionComponent);
    component = fixture.componentInstance;
    component.data = { title: 'Connexion' };
    requests = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).logout();
    fixture.detectChanges();
  });

  afterEach(() => {
    requests.verify();
    TestBed.inject(AuthService).logout();
  });

  function submit(): void {
    component.authorizeForm.setValue({ username: 'admin@example.org', password: 'mot-de-passe-fictif' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('envoie le formulaire et attend le JWT avant de fermer la modale', () => {
    submit();
    const request = requests.expectOne(`${environment.url}auth/connexion`);
    expect(request.request.body).toEqual({ username: 'admin@example.org', password: 'mot-de-passe-fictif' });
    expect(dialogRef.close).not.toHaveBeenCalled();
    component.accept();
    requests.expectNone(`${environment.url}auth/connexion`);
    request.flush({ token: 'jeton-fictif', expiresAt: Math.floor(Date.now() / 1000) + 3600 });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBeTrue();
  });

  it('reste ouverte et affiche un message après un refus des identifiants', () => {
    submit();
    requests.expectOne(`${environment.url}auth/connexion`).flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.connexionEnCours).toBeFalse();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Identifiant ou mot de passe incorrect');
    expect(component.authorizeForm.controls.username.value).toBe('admin@example.org');
  });

  it('rafraîchit le message après la réponse HTTP sans nouvelle interaction', () => {
    fixture.autoDetectChanges();
    submit();
    requests.expectOne(`${environment.url}auth/connexion`).flush({}, { status: 401, statusText: 'Unauthorized' });
    TestBed.inject(ApplicationRef).tick();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Identifiant ou mot de passe incorrect');
  });

  it('affiche une erreur serveur sans rouvrir ni vider la modale', () => {
    submit();
    requests.expectOne(`${environment.url}auth/connexion`).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('La connexion au serveur a échoué');
  });

  it('annule la requête si la page détruit la modale pendant la connexion', () => {
    submit();
    const request = requests.expectOne(`${environment.url}auth/connexion`);
    fixture.destroy();
    expect(request.cancelled).toBeTrue();
    expect(TestBed.inject(AuthService).isAuthenticated()).toBeFalse();
  });
});
