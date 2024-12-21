
import { Component, OnInit } from '@angular/core';
import { BenevoleService, ExcelService } from '../../services';
import { ConfigService, EvenementService, CroisementService, StandService, MailService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import {  FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';

import { MatSelectModule } from '@angular/material/select';
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
    public excelService:ExcelService,
    public configService: ConfigService,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer,
    public formBuilder: FormBuilder) { }


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
      this.router.navigate([ this.idEvenement+'/gestion/']);
    }
  }



  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe(data => {
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  getStand(): void {
    this.stands = []
    this.standService.getAll(this.idEvenement).subscribe(stands => {
      stands.forEach(stand => {
        stand.croisements = []
        this.croisementService.getByStand(stand.id).subscribe(croisements => {
          stand.croisements = croisements
        },
          error => {
            console.log('😢 Oh no!', error);
          });
      })
      this.stands = stands
      console.log(this.stands)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  find(): void {
    this.benevoleService.getByEvenementId(this.idEvenement).subscribe(benevoles => {
      if (benevoles != null) {
        this.benevoles = benevoles
        benevoles.forEach(benevole => {

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
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  choisir(benevole: Benevole, benecroisement: Croisement | null, croisement: Croisement | null): void {
    if (benecroisement != null) {
      if (benecroisement.id) {
        for (let index = 0; index < benevole.croisements.length; index++) {
          if (benecroisement.id == benevole.croisements[index].id) {
            benevole.croisements.splice(index, 1);
            break;
          }
        }
      }
    }
    if (benevole.croisements == null) {
      benevole.croisements = []
    }
    if (croisement != null) {
      benevole.croisements.push(croisement);
    }

    this.addCroisements(benevole);
  }


  addCroisements(benevole: Benevole): void {
    /*
        this.benevoleService.addCroisements(benevole.id, croisementsList).subscribe(data => {
        },
          error => {
            console.log('😢 Oh no!', error);
          });
    */
  }

  modify(benevole: Benevole) {
    this.benevoleService.update(benevole).subscribe(data => {
      console.log(data)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  async exportAsXLSX() {
    //this.excelService.multiExportAsExcelFile(this.benevoles, 'Benevoles');
  }



  delete(benevole: Benevole) {






  }
}