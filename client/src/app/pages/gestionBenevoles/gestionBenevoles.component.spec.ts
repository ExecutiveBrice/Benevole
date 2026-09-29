import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { defer, of, Subject } from 'rxjs';
import { Benevole, Croisement, Evenement } from '../../models';
import {
  AuthService, BenevoleService, CroisementService, EvenementService,
  ExcelService, StandService, ToastService, TransmissionService
} from '../../services';
import { BootstrapModalService } from '../../services/bootstrap-modal.service';
import { GestionBenevolesComponent } from './gestionBenevoles.component';

describe('GestionBenevolesComponent après actualisation', () => {
  it('réaffiche les bénévoles et leurs créneaux après reconstruction de la page', async () => {
    const evenement = Object.assign(new Evenement(), { id: 1, needtel: true });
    const evenementService = jasmine.createSpyObj<EvenementService>('EvenementService', ['getById']);
    const benevoleService = jasmine.createSpyObj<BenevoleService>('BenevoleService', ['getByEvenementId']);
    const standService = jasmine.createSpyObj<StandService>('StandService', ['getAll']);
    const transmissionService = jasmine.createSpyObj<TransmissionService>('TransmissionService', ['dataTransmission']);
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);

    const premiereReponseEvenement = new Subject<Evenement>();
    const secondeReponseEvenement = new Subject<Evenement>();
    evenementService.getById.and.returnValues(premiereReponseEvenement, secondeReponseEvenement);
    benevoleService.getByEvenementId.and.returnValue(defer(() => of([Object.assign(new Benevole(), {
      id: 7,
      nom: 'Durand',
      prenom: 'Alice',
      email: 'alice@example.test',
      telephone: '0102030405',
      croisements: [Object.assign(new Croisement(), {
        id: 12,
        stand: { nom: 'Accueil', ordre: 1 },
        creneau: { plage: 'Matin' }
      })]
    })])));
    standService.getAll.and.returnValue(of([]));
    authService.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [GestionBenevolesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: AuthService, useValue: authService },
        { provide: TransmissionService, useValue: transmissionService },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: BootstrapModalService, useValue: jasmine.createSpyObj('BootstrapModalService', ['open']) }
      ]
    }).overrideComponent(GestionBenevolesComponent, {
      set: {
        providers: [
          { provide: EvenementService, useValue: evenementService },
          { provide: BenevoleService, useValue: benevoleService },
          { provide: StandService, useValue: standService },
          { provide: CroisementService, useValue: {} },
          { provide: ExcelService, useValue: {} }
        ]
      }
    }).compileComponents();

    const premierePage = TestBed.createComponent(GestionBenevolesComponent);
    premierePage.detectChanges();
    expect(benevoleService.getByEvenementId).not.toHaveBeenCalled();
    premiereReponseEvenement.next(evenement);
    premiereReponseEvenement.complete();
    premierePage.detectChanges();
    premierePage.destroy();

    const pageRechargee = TestBed.createComponent(GestionBenevolesComponent);
    pageRechargee.detectChanges();
    expect(benevoleService.getByEvenementId).toHaveBeenCalledTimes(1);
    secondeReponseEvenement.next(evenement);
    secondeReponseEvenement.complete();
    pageRechargee.detectChanges();

    expect(pageRechargee.componentInstance.chargement).toBeFalse();
    expect(pageRechargee.componentInstance.erreurChargement).toBeFalse();
    expect(pageRechargee.nativeElement.textContent).toContain('Alice');
    expect(pageRechargee.nativeElement.textContent).toContain('Durand');
    const fiche = pageRechargee.nativeElement.querySelector('details') as HTMLDetailsElement;
    expect(fiche.open).toBeFalse();
    fiche.querySelector('summary')!.click();
    expect(fiche.open).toBeTrue();
    expect((fiche.querySelector('input[formControlName="nom"]') as HTMLInputElement).value).toBe('Durand');
    expect(pageRechargee.componentInstance.benevoles[0].croisements[0].creneau.plage).toBe('Matin');
    expect(pageRechargee.componentInstance.benevoles[0].formulaire.get('telephone')?.enabled).toBeTrue();
    expect(benevoleService.getByEvenementId).toHaveBeenCalledTimes(2);
  });
});
