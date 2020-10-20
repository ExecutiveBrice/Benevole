
import { Component, OnInit } from '@angular/core';
import { CreneauService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-gestionMajCreneaux',
  templateUrl: './gestionMajCreneaux.component.html',
  styleUrls: ['./gestionMajCreneaux.component.css']
})

export class GestionMajCreneauxComponent implements OnInit {
  creneaux: Creneau[];
  newCreneau: Creneau = new Creneau();
  choix: string;
  organumber:number;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public creneauService: CreneauService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));

    console.log(this.organumber)
    if (!this.organumber || isNaN(this.organumber) || this.organumber < 1) {
      this.router.navigate(['/error']);
    }

    this.creneaux = [];

    this.choix = "";
    this.getAll();
  }


  getAll(): void {
    console.log("getAll")
    this.creneauService.getAll().subscribe(data => {
      console.log(data)

      this.creneaux = data['creneaux'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(creneau): void {
    console.log("update")
    this.creneauService.update(creneau).subscribe(data => {
      console.log(data)

      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  ajout(creneau:Creneau): void {
    console.log("ajout")
    creneau.chevauchement = []
    this.creneauService.ajout(creneau).subscribe(data => {
      console.log(data)
     
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  choisir(creneau:Creneau, creneauChevauche:Creneau): void {
    console.log("choisir")
    let existe = false;
    creneau.chevauchement.forEach(element => {
        if(creneauChevauche.id == element){
        existe = true;
      }
    });

    if(existe){
      creneau.chevauchement.splice( creneau.chevauchement.indexOf(creneauChevauche.id), 1 );
      console.log("retrait")
    }else{
      creneau.chevauchement.push(creneauChevauche.id)
      console.log("ajout")
    }
  
    this.update(creneau)
  }

  delete(creneau): void {
    console.log("delete")
    this.creneauService.delete(creneau).subscribe(data => {
      console.log(data)

      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
}