
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { ValidationService, CroisementService, StandService, MailService, EvenementService, TransmissionService, ExcelService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement, Stand } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-gestionStands',
  templateUrl: './gestionStands.component.html',
  styleUrls: ['./gestionStands.component.css']
})

export class GestionStandsComponent implements OnInit {
  authorize: boolean = false;
  stands: Stand[] = [];
  evenement: Evenement = new Evenement();
  choix: string;
  idEvenement:number
  
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public excelService: ExcelService,
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
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id'))
    this.getEvenement(this.idEvenement);
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.idEvenement?true:false;
    if(this.authorize){
      this.getAll();
    }else{
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
    var promises = []
    var standsLite = []

    this.standService.getAll(this.idEvenement).subscribe(stands => {
      stands.forEach(stand => {
        stand.croisements = []
        promises.push(new Promise((resolve, reject) => {
          this.croisementService.getByStand(stand.id).subscribe(croisements => {

            stand.croisements = croisements


            let standLite = {
              nom: "",
              creneaux: []
            };
            standLite.nom = stand.nom.slice(0, 30);
            standLite.creneaux = [];

            for (let indexR = 0; indexR < 100; indexR++) {
              let creneau = {};

              if (stand.croisements != null && stand.croisements.length > 0) {
                stand.croisements.sort(function (a, b) { return a.creneau.ordre - b.creneau.ordre; })
                for (let index = 0; index < stand.croisements.length; index++) {
                  const croisement = stand.croisements[index];
                  creneau[croisement.creneau.plage] = "";
                  if (croisement.benevoles[indexR]) {
                    creneau[croisement.creneau.plage] = croisement.benevoles[indexR].nom + " " + croisement.benevoles[indexR].prenom;
                  }
                }
                standLite.creneaux.push(creneau);
              }
            }

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
          this.excelService.multiExportAsExcelFile(standsLite, 'Stands');
        });

    },
      error => {
        console.log('😢 Oh no!', error);
      });

  }


  toggleList = [];
  toggle(toggleName: String) {
    if (this.toggleList.indexOf(toggleName) > -1) {
      this.toggleList = this.toggleList.filter(elem => elem != toggleName)
    } else {
      this.toggleList.push(toggleName);
    }
  }
}