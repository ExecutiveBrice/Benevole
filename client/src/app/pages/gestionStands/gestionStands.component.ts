
import { Component, OnInit } from '@angular/core';
import { BenevoleService, ConfigService } from '../../services';
import { ValidationService, CroisementService, StandService, MailService, EvenementService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement, Stand } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperComponent } from 'ngx-image-cropper';


@Component({
  selector: 'app-gestionStands',
  standalone: true,
  templateUrl: './gestionStands.component.html',
  styleUrls: ['./gestionStands.component.scss'],
  imports: [NgClass,
    DatePipe,
    FormsModule,
    ImageCropperComponent,
    RouterModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatCheckboxModule, MatSlideToggleModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
  providers: [
    EvenementService,
    TransmissionService,
    CroisementService,
    StandService,
    ValidationService,
    BenevoleService,
    ConfigService
  ],
})

export class GestionStandsComponent implements OnInit {
  authorize: boolean = false;
  stands: Stand[] = [];
  evenement: Evenement = new Evenement();
  choix!: string;
  idEvenement!: number

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }


  ngOnInit() {
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    this.getEvenement(this.idEvenement);
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getAll();
    } else {
      this.router.navigate(['/gestion/' + this.idEvenement]);
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

  getAll(): void {
    this.standService.getAll(this.idEvenement).subscribe(stands => {
      this.stands = stands;

      stands.forEach(stand => {
        stand.croisements = []
        this.croisementService.getByStand(stand.id).subscribe(croisements => {
          stand.croisements = croisements
        },
          error => {
            console.log('😢 Oh no!', error);
          });

      });
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  async exportAsXLSX() {
    var promises: any[] = []
    var standsLite: any[] = []

    this.standService.getAll(this.idEvenement).subscribe(stands => {
      stands.forEach(stand => {
        stand.croisements = []
        promises.push(new Promise((resolve, reject) => {
          this.croisementService.getByStand(stand.id).subscribe(croisements => {

            stand.croisements = croisements


            let standLite = {
              nom: stand.nom.slice(0, 30),
              creneaux: []
            };

            /*
                        for (let indexR = 0; indexR < 100; indexR++) {
                          let creneau :  Map<string, string>;
            
                          if (stand.croisements != null && stand.croisements.length > 0) {
                            stand.croisements.sort(function (a, b) { return a.creneau.ordre - b.creneau.ordre; })
                            for (let index = 0; index < stand.croisements.length; index++) {
                              const croisement = stand.croisements[index];
                              creneau.get(croisement.creneau.plage) = "";
                              if (croisement.benevoles[indexR]) {
                                creneau[croisement.creneau.plage] = croisement.benevoles[indexR].nom + " " + croisement.benevoles[indexR].prenom;
                                if( croisement.benevoles[indexR].telephone){
                                  creneau[croisement.creneau.plage] += " "+croisement.benevoles[indexR].telephone;
                                }
                              }
                            }
                            standLite.creneaux.push(creneau);
                          }
                        }
            */
            standsLite.push(standLite)
            resolve("Completed " + standLite.nom)
          },
            error => {
              console.log('😢 Oh no!', error);
              reject()
            })
        }))

      });

      Promise.all(promises)
        .then(data => {
          //this.excelService.multiExportAsExcelFile(standsLite, 'Stands');
        });

    },
      error => {
        console.log('😢 Oh no!', error);
      });

  }


  toggleList: string[] = [];
  toggle(toggleName: string) {
    if (this.toggleList.indexOf(toggleName) > -1) {
      this.toggleList = this.toggleList.filter(elem => elem != toggleName)
    } else {
      this.toggleList.push(toggleName);
    }
  }
}