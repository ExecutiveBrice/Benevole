import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Benevole, Croisement, Evenement, Stand } from '../../models';
import { BenevoleService, StandService, ToastService, TransmissionService } from '../../services';
import { PlanningComponent } from './planning.component';

describe('Inscription depuis le planning', () => {
  let fixture: ComponentFixture<PlanningComponent>;
  let requests: HttpTestingController;
  let benevole: Benevole;
  let croisement: Croisement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), BenevoleService,
        StandService, TransmissionService, ToastService]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningComponent);
    requests = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('evenement', Object.assign(new Evenement(), {
      id: 1, afficherBenevoles: true, basique: false
    }));
    benevole = Object.assign(new Benevole(), {
      id: 2, prenom: 'Brice', nom: 'Morel', email: 'brice@example.org'
    });
    fixture.componentRef.setInput('benevole', benevole);
    fixture.detectChanges();
    const stand = Object.assign(new Stand(), { id: 3, nom: 'Accueil', type: 2, ordre: 1 });
    croisement = Object.assign(new Croisement(), {
      id: 4, limite: 2, besoin: true, selected: false, stand,
      creneau: { id: 5, plage: '10h - 11h', ordre: 1 },
      benevoles: [Object.assign(new Benevole(), { id: 6, prenom: 'Alice', nom: 'Durand' })]
    });
  });

  afterEach(() => requests.verify());

  function buttons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button.selection'));
  }

  function loadPlanning(croisements: Croisement[] = [croisement]): void {
    requests.expectOne(`${environment.url}stand/getAll?eventId=1`).flush([
      { ...croisement.stand, croisements: croisements.map(crois => ({ ...crois, stand: { ...crois.stand } })) }
    ]);
    fixture.detectChanges();
  }

  for (const benevoleFirst of [true, false]) {
    it(`affiche les couleurs initiales quand le bénévole arrive ${benevoleFirst ? 'avant' : 'après'} les stands`, () => {
      fixture.nativeElement.style.setProperty('--bs-success-bg-subtle', '#d1e7dd');
      fixture.nativeElement.style.setProperty('--bs-secondary-bg', '#e9ecef');
      const connected = { ...benevole, croisements: [
        { ...croisement, id: 4 }, { ...croisement, id: 7 }
      ] };
      const croisements = [
        { ...croisement, id: 4, besoin: false, benevoles: [benevole] },
        { ...croisement, id: 7, besoin: false, benevoles: [...croisement.benevoles, benevole] },
        { ...croisement, id: 8, besoin: false, limite: 1 },
        { ...croisement, id: 9, besoin: false }
      ].map((crois, index) => ({ ...crois, creneau: { ...crois.creneau, ordre: index + 1 } }));
      const transmission = TestBed.inject(TransmissionService);
      if (benevoleFirst) transmission.benevoleTransmission(connected);
      loadPlanning(croisements);
      if (!benevoleFirst) transmission.benevoleTransmission(connected);

      expect(buttons().length).toBe(4);
      const colors = buttons().map(button => getComputedStyle(button).backgroundColor);
      expect(colors).toEqual([
        'rgb(209, 231, 221)', // choisi, encore disponible
        'rgb(209, 231, 221)', // choisi et complet : le vert reste prioritaire
        'rgb(233, 236, 239)', // complet et non choisi
        'rgb(255, 255, 255)'  // disponible et non choisi
      ]);
      expect(buttons().map(button => button.classList.contains('selected')))
        .toEqual([true, true, false, false]);
      expect(buttons().map(button => button.classList.contains('complet')))
        .toEqual([false, true, true, false]);
    });
  }

  it('actualise les deux boutons après chaque réponse HTTP sans refresh ni second clic', () => {
    // Le même créneau est affiché dans « Les stands » et « Les besoins ».
    loadPlanning();
    expect(buttons().length).toBe(2);
    expect(buttons()[0].textContent).toContain('Alice');

    buttons()[0].click();
    // Le cycle du clic a lieu avant que la réponse HTTP arrive.
    fixture.detectChanges();
    requests.expectOne(`${environment.url}benevole/addToCroisement?benevoleId=2&croisementId=4&force=false`)
      .flush({ ...benevole, croisements: [{ ...croisement, benevoles: undefined }] });

    for (const button of buttons()) {
      expect(button.textContent).toContain('Brice');
      expect(button.textContent).toContain('Alice');
      expect(button.querySelector('.selection-capacity')!.textContent).toContain('2 / 2');
      expect(button.classList.contains('selected')).toBeTrue();
      expect(button.classList.contains('complet')).toBeTrue();
    }

    buttons()[0].click();
    fixture.detectChanges();
    requests.expectOne(`${environment.url}benevole/removeToCroisement?benevoleId=2&croisementId=4`)
      .flush({ ...benevole, croisements: [] });

    for (const button of buttons()) {
      expect(button.textContent).not.toContain('Brice');
      expect(button.textContent).toContain('Alice');
      expect(button.querySelector('.selection-capacity')!.textContent).toContain('1 / 2');
      expect(button.classList.contains('selected')).toBeFalse();
      expect(button.classList.contains('complet')).toBeFalse();
    }
  });

  it('demande la connexion avant une inscription sur un créneau', () => {
    fixture.componentRef.setInput('benevole', undefined);
    loadPlanning();
    const toastService = TestBed.inject(ToastService);
    const highlight = jasmine.createSpy('highlight');
    fixture.componentInstance.actionEmitter.subscribe(highlight);

    fixture.componentInstance.choisir(croisement);

    expect(toastService.toasts.at(-1)).toEqual(jasmine.objectContaining({
      message: "La connexion est obligatoire pour s'inscrire sur un créneau",
      type: 'danger'
    }));
    expect(highlight).toHaveBeenCalledOnceWith(true);
  });
});
