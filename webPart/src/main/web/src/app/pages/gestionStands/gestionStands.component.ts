
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { ValidationService, CroisementService, StandService, MailService, EvenementService, TransmissionService } from '../../services';
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



  choixstand(nom: string) {
    if (this.choix != nom) {
      this.choix = nom
    } else {
      this.choix = null
    }
  }

}