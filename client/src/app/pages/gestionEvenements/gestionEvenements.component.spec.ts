import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AdministrateurService, AuthService, DemandeCreationEvenementService, EvenementService, ToastService } from '../../services';
import { GestionEvenementsComponent } from './gestionEvenements.component';
import { jwtAuthenticationInterceptor } from '../../services/auth.interceptor';
import { environment } from '../../../environments/environment';
import { BootstrapModalService } from '../../services/bootstrap-modal.service';

describe('Session sur le paramétrage global', () => {
  let component: GestionEvenementsComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let administrators: jasmine.SpyObj<AdministrateurService>;
  let dialog: jasmine.SpyObj<BootstrapModalService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']);
    auth.isAuthenticated.and.returnValue(true);
    administrators = jasmine.createSpyObj('AdministrateurService', ['moi']);
    dialog = jasmine.createSpyObj('BootstrapModalService', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({ providers: [{ provide: BootstrapModalService, useValue: dialog }] });
    component = TestBed.runInInjectionContext(() => new GestionEvenementsComponent(
      new ToastService(), {} as ActivatedRoute, router, {} as EvenementService, auth, administrators, {} as DemandeCreationEvenementService
    ));
  });

  it('conserve la session d’un administrateur d’événement qui n’a pas les droits globaux', () => {
    administrators.moi.and.returnValue(of({ id: 1, username: 'admin@example.org', superadmin: false, enabled: true, evenementIds: [1] }));
    component.ngOnInit();
    expect(component.authorize).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(auth.logout).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('conserve la session si le serveur est temporairement inaccessible', () => {
    administrators.moi.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.ngOnInit();
    expect(component.verificationEnCours).toBeFalse();
    expect(auth.logout).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
  });
});

describe('Parcours complet de connexion au paramétrage global', () => {
  let requests: HttpTestingController;
  const administrator = { id: 1, username: 'admin@example.org', superadmin: true, enabled: true, evenementIds: [] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEvenementsComponent],
      providers: [
        provideHttpClient(withInterceptors([jwtAuthenticationInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: BootstrapModalService, useValue: { open: () => ({ afterClosed: () => of() }) } }
      ]
    }).overrideComponent(GestionEvenementsComponent, {
      set: { providers: [{ provide: EvenementService, useValue: { getAll: () => of([]) } }] }
    }).compileComponents();
    requests = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).logout();
  });

  afterEach(() => {
    requests.verify();
    TestBed.inject(AuthService).logout();
  });

  it('demande une connexion avant d’afficher la page protégée', () => {
    const fixture = TestBed.createComponent(GestionEvenementsComponent);
    fixture.autoDetectChanges();
    expect(fixture.componentInstance.connexionDialogOpen).toBeTrue();
    fixture.destroy();
  });
});
