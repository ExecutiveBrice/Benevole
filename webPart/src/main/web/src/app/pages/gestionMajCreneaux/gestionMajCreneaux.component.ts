
import { Component, OnInit } from '@angular/core';
import { ValidationService, CreneauService,EvenementService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-gestionMajCreneaux',
  templateUrl: './gestionMajCreneaux.component.html',
  styleUrls: ['./gestionMajCreneaux.component.css']
})

export class GestionMajCreneauxComponent implements OnInit {
  subscription = new Subscription();
  authorize: boolean = false;
  creneaux: Creneau[];
  newCreneau: Creneau = new Creneau();
  choix: string;
  organumber:number;

  constructor(

    public route: ActivatedRoute,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public router: Router,
    public creneauService: CreneauService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.creneaux = [];
    this.choix = "";

    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.organumber?true:false;
    if(this.authorize){
      this.getAll()
    }else{
      this.router.navigate(['/gestion/' + this.organumber]);
    }
  }

  getAll(): void {
    this.creneauService.getAll(this.organumber).subscribe(data => {
      this.creneaux = data;
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(creneau): void {
    this.creneauService.update(creneau).subscribe(data => {
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  ajout(creneau:Creneau): void {
    creneau.chevauchement = []
    this.creneauService.ajout(creneau, this.organumber).subscribe(data => {
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  choisir(creneau:Creneau, creneauChevauche:Creneau): void {
    let existe = false;
    creneau.chevauchement.forEach(element => {
        if(creneauChevauche.id == element){
        existe = true;
      }
    });

    if(existe){
      creneau.chevauchement.splice( creneau.chevauchement.indexOf(creneauChevauche.id), 1 );
      creneauChevauche.chevauchement.splice( creneauChevauche.chevauchement.indexOf(creneau.id), 1 );
    }else{
      creneau.chevauchement.push(creneauChevauche.id)
      creneauChevauche.chevauchement.push(creneau.id)
    }
  
    this.update(creneau)
    this.update(creneauChevauche)
  }

  delete(creneau): void {
    this.creneauService.delete(creneau).subscribe(data => {
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
}