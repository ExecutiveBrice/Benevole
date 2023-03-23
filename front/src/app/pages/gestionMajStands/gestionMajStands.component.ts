
import { Component, OnInit } from '@angular/core';
import { ValidationService, CroisementService, StandService, CreneauService, EvenementService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Croisement, Stand, Creneau, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-gestionMajStands',
  templateUrl: './gestionMajStands.component.html',
  styleUrls: ['./gestionMajStands.component.css']
})

export class GestionMajStandsComponent implements OnInit {
  authorize: boolean = false;
  stands: Stand[];
  creneaux: Creneau[] = [];
  newStand: Stand = new Stand();
  choix: string;
  ajouterCroisement: number = 0;
  evenement: Evenement = new Evenement();
  modifTypeStand: number = 0;
  idEvenement:number

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public creneauService: CreneauService,
    public croisementService: CroisementService,
    
    public transmissionService: TransmissionService,
    public standService: StandService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id'))
    this.getEvenement(this.idEvenement);
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.idEvenement?true:false;
    if(this.authorize){
      this.getAllStands();
      this.getAllCreneaux();
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

  existInCroisements(croisements: Croisement[], id: number): Croisement {

    var croi = null;
    if(croisements != null && croisements.length > 0){
    croisements.forEach(croisement => {
      if (croisement.creneau.id == id) {
        croi = croisement;
      }
    });
  }
    return croi;
  }

  getAllStands(): void {
    this.standService.getAll(this.idEvenement).subscribe(stands => {
      if(stands != null){
      this.stands = stands
      
      stands.forEach(stand => {
        stand.croisements = []
        this.croisementService.getByStand(stand.id).subscribe(croisements => {
          stand.croisements = croisements
        },
          error => {
            console.log('😢 Oh no!', error);
          });

      });
    }else{
      this.stands = []
    }

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  getAllCreneaux(): void {
    this.creneauService.getAll(this.idEvenement).subscribe(creneaux => {
      this.creneaux = creneaux;
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  update(stand): void {
    this.standService.update(stand).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  updateCroisement(croisement: Croisement, stand: Stand): void {
    croisement.stand = stand
    this.croisementService.update(croisement).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  ajoutCroisement(stand: Stand, creneau: Creneau): void {
    let croisement = new Croisement()
    croisement.stand = new Stand();
    croisement.stand.id = stand.id
    croisement.creneau = creneau
    croisement.besoin = false;
    croisement.selected = false;
    croisement.limite = 0;

    this.croisementService.ajout(croisement).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  deleteCroisement(croisement: Croisement): void {
    this.croisementService.delete(croisement).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  ajout(stand: Stand): void {
    stand.type = 0
    this.standService.ajout(stand, this.idEvenement).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  delete(stand): void {
    this.standService.delete(stand).subscribe(data => {
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}