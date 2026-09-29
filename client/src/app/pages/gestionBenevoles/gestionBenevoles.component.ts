import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {BenevoleService, ExcelService, AuthService} from '../../services';
import {
  ConfigService,
  EvenementService,
  CroisementService,
  StandService,
  MailService,
  TransmissionService
} from '../../services';
import {Benevole, Croisement, Evenement, Stand} from '../../models';
import {Router, ActivatedRoute, RouterModule} from '@angular/router';
import {Subscription} from 'rxjs';

import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrderByPipe} from "../../services/sort.pipe";
import {HttpErrorResponse} from '@angular/common/http';
import { ToastService } from '../../services';
import {ModalComponent} from '../../components/modal/modal.component';
import {ModalAccessGestionComponent} from '../../components/modalAccessGestion/modalAccessGestion.component';
import { BootstrapModalService } from '../../services/bootstrap-modal.service';

@Component({
  selector: 'app-gestionBenevoles',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.scss'],
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule, FormsModule, OrderByPipe, ],
  providers: [
    EvenementService,
    BenevoleService,
    CroisementService,
    StandService,
    MailService,
    ExcelService,
    ConfigService
  ],
})

export class GestionBenevolesComponent implements OnInit {

  authorize: boolean = false;
  croisements!: Croisement[];
  choix!: string;
  evenement: Evenement = new Evenement();
  subscription = new Subscription()
  idEvenement!: number
  stands: Stand[] = [];
  benevoles: Benevole[] = [];
  connexionDialogOpen = false;
  chargement = false;
  erreurChargement = false;


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public excelService: ExcelService,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    private authService: AuthService,
    private toastr: ToastService,
    public formBuilder: FormBuilder) {
  }


  ngOnInit() {
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    if (this.authService.isAuthenticated()) {
      this.authorize = true;
      this.loadPage();
    } else {
      this.authorizeAccess();
    }
  }

  private loadPage(): void {
    this.chargement = true;
    this.erreurChargement = false;
    this.getEvenement(this.idEvenement);
    this.getStand();
    this.croisements = [];
    this.choix = '';
  }

  relancerChargement(): void {
    this.loadPage();
  }

  authorizeAccess(): void {
    if (this.connexionDialogOpen) {
      return;
    }

    this.connexionDialogOpen = true;
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        title: 'Accès mode gestionnaire',
        question: 'Saisissez vos identifiants administrateur :',
      },
    }).afterClosed().subscribe(result => {
      this.connexionDialogOpen = false;
      if (result === true) {
        this.authorize = true;
        this.loadPage();
      }
    });
  }


  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
        if (!data) {
          this.chargement = false;
          this.erreurChargement = true;
          return;
        }
        this.evenement = data;
        this.transmissionService.dataTransmission(data);
        this.find();
      },
      error: (error: HttpErrorResponse) => {
        this.chargement = false;
        this.erreurChargement = true;
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }


  getStand(): void {
    this.stands = []
    this.standService.getAll(this.idEvenement).subscribe({
      next: (data) => {
        const stands = data ?? [];
        stands.forEach(stand => {
          stand.croisements = []
          this.croisementService.getByStand(stand.id).subscribe({
            next: (data) => {
              stand.croisements = data ?? []
            },
            error: (error: HttpErrorResponse) => {
              console.log('😢 Oh no!', error);
              this.toastr.error(error.message, 'Erreur');
            }
          });
        })
        this.stands = stands
      },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }


  find(): void {
    this.benevoleService.getByEvenementId(this.idEvenement).subscribe({
      next: (data) => {
        this.benevoles = (data ?? []).map(benevole => {

            let formulaireBenevole = this.formBuilder.group({
              email: new FormControl(benevole.email, [Validators.required, Validators.minLength(2)]),
              nom: new FormControl(benevole.nom, [Validators.required, Validators.minLength(2)]),
              prenom: new FormControl(benevole.prenom, [Validators.required, Validators.minLength(2)]),
              telephone: new FormControl(benevole.telephone, [Validators.required, Validators.minLength(2)])

            })
            if (!this.evenement.needtel) {
              formulaireBenevole.get('telephone')?.disable()
            }
            benevole.formulaire = formulaireBenevole;
            return benevole;
          });
        this.chargement = false;
      },
      error: (error: HttpErrorResponse) => {
        this.chargement = false;
        this.erreurChargement = true;
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }

  choisir(benevole: Benevole, benecroisement: Croisement | null, croisement: Croisement | null): void {
    console.log(benecroisement);
    console.log(croisement);

    if (benecroisement != null) {

      this.retraitCroisement(benevole, benecroisement);
    }

    if (croisement != null) {
      this.ajoutCroisement(benevole, croisement);
    }

  }

  ajouterCroisementDepuisSelect(benevole: Benevole, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const croisement = this.trouverCroisement(select.value);
    if (croisement) {
      this.choisir(benevole, null, croisement);
    }
    select.value = '';
  }

  private trouverCroisement(croisementId: string): Croisement | null {
    const id = Number(croisementId);
    return this.stands.flatMap(stand => stand.croisements).find(croisement => croisement.id === id) ?? null;
  }

  ajoutCroisement(benevole: Benevole, croisement: Croisement) {
    this.benevoleService.addToCroisement(benevole!.id, croisement.id, true).subscribe({
      next: (benevoleMisAJour) => {
        // L'API renvoie le bénévole avec ses croisements à jour : on remplace
        // la collection pour que la nouvelle ligne soit rendue immédiatement.
        benevole.croisements = benevoleMisAJour.croisements ?? [...benevole.croisements, croisement];
        this.mettreAJourPlacesDisponibles(croisement, benevole, true);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
  }

  retraitCroisement(benevole: Benevole, croisement: Croisement) {
    this.benevoleService.removeToCroisement(benevole!.id, croisement.id).subscribe({
      next: (ben) => {
        benevole.croisements = benevole.croisements.filter(crois => crois.id != croisement.id)
        this.mettreAJourPlacesDisponibles(croisement, benevole, false);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
  }

  private mettreAJourPlacesDisponibles(croisement: Croisement, benevole: Benevole, ajout: boolean): void {
    const croisementDuSelecteur = this.trouverCroisement(String(croisement.id));
    if (!croisementDuSelecteur) {
      return;
    }

    const benevoles = croisementDuSelecteur.benevoles ?? [];
    croisementDuSelecteur.benevoles = ajout
      ? benevoles.some(ben => ben.id === benevole.id) ? benevoles : [...benevoles, benevole]
      : benevoles.filter(ben => ben.id !== benevole.id);
  }


  update(benevole: Benevole): void {
    console.log(benevole)
    if (benevole.formulaire.valid) {

      this.benevoleService.update(Object.assign(benevole, benevole.formulaire.getRawValue())).subscribe({
        next: (benevoleUpdated: Benevole) => {
          console.log(benevoleUpdated)
          this.toastr.success(benevoleUpdated.nom + " à bien été mis à jour", 'Succès');
          benevole.formulaire.markAsPristine()
          benevole.formulaire.markAsUntouched()
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.error, 'Erreur');
        }
      })
    }
  }


  async exportAsXLSX() {
    this.excelService.multiExportAsExcelBenevoles(this.benevoles, 'Benevoles');
  }


  delete(benevole: Benevole) {
    console.log(benevole);

    this.dialog.open(ModalComponent, {
      data: {
        title: 'Suppression',
        question: 'Souhaitez vous supprimer ce bénévole : ' + benevole.formulaire.get('prenom')?.value + ' ' + benevole.formulaire.get('nom')?.value + ' et libérer ses créneaux ?',
      },
    }).afterClosed().subscribe(result => {
      if (result !== undefined && result == 'accept') {

        this.benevoleService.deleteById(benevole.id).subscribe({
          next: (data) => {
            benevole.croisements.forEach(croisement => this.mettreAJourPlacesDisponibles(croisement, benevole, false));
            this.benevoles = this.benevoles.filter(ben => ben.id != benevole.id)
            this.toastr.success(benevole.formulaire.get('prénom')?.value + " à bien été retiré de l'application", 'Succès');
          },
          error: (error: HttpErrorResponse) => {
            console.log(error)
            if (error.status == 409) {
              this.toastr.error("Il reste des bénévoles dans ce stand. Veuillez les déplacer au préalable", 'Erreur');
            } else {
              this.toastr.error(error.message, 'Erreur');
            }

          }
        })
      }
    });
  }


  dialog = inject(BootstrapModalService);
}
