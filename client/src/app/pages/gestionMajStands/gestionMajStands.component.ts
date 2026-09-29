import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {
  CroisementService,
  StandService,
  CreneauService,
  EvenementService,
  TransmissionService,
  ConfigService,
  AuthService
} from '../../services';
import {DomSanitizer} from '@angular/platform-browser';
import {Croisement, Stand, Creneau, Evenement} from '../../models';
import {Router, ActivatedRoute, RouterModule} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrderObjectByPipe} from "../../services/sortObject.pipe";
import {ModalComponent} from '../../components/modal/modal.component';
import {HttpErrorResponse} from '@angular/common/http';
import { ToastService } from '../../services';
import { BootstrapModalService } from '../../services/bootstrap-modal.service';
import {ListFilterPipe} from "../../services/simpleFilter.pipe";
import {ModalNewStandComponent, NewStandFormValue} from '../../components/modalNewStand/modalNewStand.component';

@Component({
  selector: 'app-gestionMajStands',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  templateUrl: './gestionMajStands.component.html',
  styleUrls: ['./gestionMajStands.component.scss'],
  imports: [
    FormsModule, RouterModule, ReactiveFormsModule, OrderObjectByPipe, ListFilterPipe],
  providers: [
    EvenementService,
    CroisementService,
    StandService,

    CreneauService,
    ConfigService
  ]
})

export class GestionMajStandsComponent implements OnInit {
  authorize: boolean = false;
  stands!: Stand[];
  creneaux: Creneau[] = [];
  choix!: string;
  evenement: Evenement = new Evenement();
  idEvenement!: number

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public creneauService: CreneauService,
    public croisementService: CroisementService,
    private toastr: ToastService,
    public transmissionService: TransmissionService,
    public standService: StandService,
    private authService: AuthService,
    public fb: FormBuilder) {

  }

  standsFormulaire: FormArray = this.fb.array([])
  nextStandOrder = '1';


  getCroisement(stand: FormGroup) {
    return <FormArray<FormGroup>>stand.get('croisements');
  }

  getCreneauxStand(stand: FormGroup):string[] {
    let creneaux: string[] = [];
   this.getCroisement(stand).controls.forEach(croisement => {
     creneaux.push(croisement.get('plage')?.value)
   })
    return creneaux;
  }

  ngOnInit() {
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    if (this.authService.isAuthenticated()) {
      this.authorize = true;
      this.getEvenement(this.idEvenement);
      this.getAllStands();
      this.getAllCreneaux();
    } else {
      this.router.navigate(['/', this.idEvenement, 'gestion']);
    }
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
        this.evenement = data;
        console.log(data)
        this.transmissionService.dataTransmission(data);
      },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }

  getAllStands(): void {
    this.standService.getAll(this.idEvenement).subscribe({
      next: (stands: Stand[]) => {
        if (stands != null) {
          this.stands = stands
          stands.forEach(stand => {
            this.standsFormulaire.push(this.fillForm(stand));
          });
        } else {
          this.stands = []
        }
        this.updateNewStandOrder();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.error, 'Erreur');
      }
    })
  }

  private updateNewStandOrder(): void {
    const lastOrder = Math.max(0, ...this.standsFormulaire.controls.map(stand => Number(stand.get('ordre')?.value) || 0));
    this.nextStandOrder = String(lastOrder + 1);
  }

  fillForm(stand: Stand): FormGroup {
    const croisementsFormulaire: FormArray = this.fb.array([])
    if (stand.croisements != null) {
      [...stand.croisements].sort((a, b) => a.id - b.id).forEach(croisement => {
        const croisementFormulaire: FormGroup = this.fb.group({
          id: [croisement.id, []],
          plage: [croisement.creneau.plage, [Validators.required]],
          besoin: [croisement.besoin, [Validators.required]],
          limite: [croisement.limite, [Validators.required]],
          benevoles: [null, []],
          creneau: [null, []],
        })
        croisementsFormulaire.push(croisementFormulaire)
      });
    }
    const standFormulaire: FormGroup = this.fb.group({
      id: [stand.id, []],
      ordre: [stand.ordre, [Validators.required, Validators.minLength(1)]],
      nom: [stand.nom, [Validators.required, Validators.minLength(2)]],
      soustitre: [stand.soustitre, []],
      type: [stand.type, [Validators.required]],
      croisements: croisementsFormulaire
    });
    return standFormulaire;
  }

  getAllCreneaux(): void {
    this.creneauService.getAll(this.idEvenement).subscribe({
      next: (creneaux: Creneau[]) => {
        this.creneaux = creneaux;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.error, 'Erreur');
      }
    })
  }

  update(standForm: FormGroup): void {
    if (standForm.valid) {

      this.standService.update(standForm.getRawValue()).subscribe({
        next: (stand: Stand) => {
          this.toastr.success(stand.nom + " à bien été mis à jour", 'Succès');
          standForm.markAsPristine()
          standForm.markAsUntouched()
          this.updateNewStandOrder();
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.error, 'Erreur');
        }
      })
    }
  }


  addCreneauToStand(creneauId: string | number, standForm: FormGroup): void {
    let croisementTemp = new Croisement()
    croisementTemp.stand = new Stand();
    croisementTemp.stand.id = standForm.get('id')?.value
    const creneau = this.creneaux.find(item => item.id === Number(creneauId));
    if (!creneau) {
      return;
    }
    croisementTemp.creneau = creneau;
    croisementTemp.besoin = false;
    croisementTemp.limite = 0;

    const croisements = standForm.get('croisements') as FormArray

    this.croisementService.ajout(croisementTemp).subscribe({
      next: (croisement: Croisement) => {

        const croisementFormulaire: FormGroup = this.fb.group({
          id: [croisement.id, []],
          plage: [croisement.creneau.plage, [Validators.required]],
          besoin: [croisement.besoin, [Validators.required]],
          limite: [croisement.limite, [Validators.required]],
          benevoles: [null, []],
          creneau: [null, []],
        })

        const index = croisements.controls.findIndex(control => Number(control.get('id')?.value) > croisement.id);
        croisements.insert(index === -1 ? croisements.length : index, croisementFormulaire);
        this.toastr.success(croisement.creneau.plage + " à bien été ajouté", 'Succès');
      },
      error: (error: HttpErrorResponse) => {
        if (error.status == 409) {
          this.toastr.error("Il reste des bénévoles dans ce créneaux. Veuillez les déplacer au préalable", 'Erreur');
        } else {
          this.toastr.error(error.message, 'Erreur');
        }

      }
    });
  }


  openNewStandModal(): void {
    this.dialog.open(ModalNewStandComponent, {
      data: {
        title: 'Nouveau stand',
        ordre: this.nextStandOrder
      },
    }).afterClosed().subscribe((value: unknown) => {
      if (!this.isNewStandFormValue(value)) {
        return;
      }

      this.ajout(value);
    });
  }

  private isNewStandFormValue(value: unknown): value is NewStandFormValue {
    return typeof value === 'object'
      && value !== null
      && 'ordre' in value
      && 'nom' in value
      && 'soustitre' in value;
  }

  ajout(standValue: NewStandFormValue): void {
    const newStand = new Stand;
    Object.assign(newStand, standValue);
    newStand.type = 2;
    this.standService.ajout(newStand, this.idEvenement).subscribe({
      next: (stand) => {
        this.standsFormulaire.push(this.fillForm(stand));
        this.standsFormulaire.controls.sort((a, b) => Number(a.get('ordre')?.value) - Number(b.get('ordre')?.value));
        this.updateNewStandOrder();
      },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.error ?? error.message, 'Erreur');
      }
    });
  }


  delete(standForm: FormGroup): void {

    this.dialog.open(ModalComponent, {
      data: {
        title: 'Suppression',
        question: 'Souhaitez vous supprimer ce stand : ' + standForm.get('nom')?.value,
      },
    }).afterClosed().subscribe(result => {
      if (result !== undefined && result == 'accept') {

        this.standService.delete(standForm.get('id')?.value).subscribe({
          next: (data) => {
            const index = this.standsFormulaire.controls.findIndex(image => image.get('id')?.value === standForm.get('id')?.value)
            if (index !== -1) {
              this.standsFormulaire.removeAt(index)
            }
            this.updateNewStandOrder();
            this.toastr.success(standForm.get('nom')?.value + " à bien été supprimé", 'Succès');
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

  dialogDeleteCroisement(croisementForm: FormGroup, standForm: FormGroup, index: number) {

    this.dialog.open(ModalComponent, {
      data: {
        title: 'Suppression',
        question: 'Souhaitez vous supprimer ce créneau : ' + croisementForm.get('plage')?.value,
      },
    }).afterClosed().subscribe(result => {
      if (result !== undefined && result == 'accept') {

        this.croisementService.delete(croisementForm.get('id')?.value).subscribe({
          next: (data) => {
            this.getCroisement(standForm).removeAt(index)

          },
          error: (error: HttpErrorResponse) => {
            console.log(error)
            if (error.status == 409) {
              this.toastr.error("Il reste des bénévoles dans ce créneaux. Veuillez les déplacer au préalable", 'Erreur');
            } else {
              this.toastr.error(error.message, 'Erreur');
            }

          }
        })
      }
    });
  }
}
