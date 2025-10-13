import {Component, inject, OnInit} from '@angular/core';
import {BenevoleService, ExcelService} from '../../services';
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
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatStepperModule} from '@angular/material/stepper';

import {MatSelectModule} from '@angular/material/select';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';
import {ModalComponent} from '../../components/modal/modal.component';

@Component({
  selector: 'app-gestionBenevoles',
  standalone: true,
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.scss'],
  imports: [
    FormsModule,
    RouterModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatSelectModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule,
    MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
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
  stands!: Stand[];
  benevoles: Benevole[] = [];


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public excelService: ExcelService,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder) {
  }


  ngOnInit() {
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getEvenement(this.idEvenement);
      this.find();
      this.getStand();
      this.croisements = [];
      this.choix = "";
    } else {
      this.router.navigate([this.idEvenement + '/gestion/']);
    }
  }


  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
        this.evenement = data;
        this.transmissionService.dataTransmission(data);
      },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }


  getStand(): void {
    this.stands = []
    this.standService.getAll(this.idEvenement).subscribe({
      next: (data) => {
        data.forEach(stand => {
          stand.croisements = []
          this.croisementService.getByStand(stand.id).subscribe({
            next: (data) => {
              stand.croisements = data
            },
            error: (error: HttpErrorResponse) => {
              console.log('😢 Oh no!', error);
              this.toastr.error(error.message, 'Erreur');
            }
          });
        })
        this.stands = data
        console.log(this.stands)
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
        if (data != null) {
          this.benevoles = data
          data.forEach(benevole => {

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

          })
        }
      },
      error: (error: HttpErrorResponse) => {
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

  ajoutCroisement(benevole: Benevole, croisement: Croisement) {
    this.benevoleService.addToCroisement(benevole!.id, croisement.id, true).subscribe({
      next: (ben) => {
        benevole.croisements.push(croisement)
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
        benevole.croisements.filter(crois => crois.id != croisement.id)
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
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


  dialog = inject(MatDialog);
}
