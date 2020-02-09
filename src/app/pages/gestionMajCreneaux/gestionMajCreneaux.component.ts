
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CreneauService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau } from '../../models';



@Component({
  selector: 'app-gestionMajCreneaux',
  templateUrl: './gestionMajCreneaux.component.html',
  styleUrls: ['./gestionMajCreneaux.component.css']
})

export class GestionMajCreneauxComponent implements OnChanges {
  creneaux: Creneau[];
  newCreneau: Creneau = new Creneau();
  choix: string;

  constructor(
    public creneauService: CreneauService,
    public sanitizer: DomSanitizer) {
    this.creneaux = [];

    this.choix = "";
    this.getAll();
  }

  ngOnChanges() {

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