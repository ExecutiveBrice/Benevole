
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';

@Component({
  selector: 'app-gestionBenevoles',
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.css']
})

export class GestionBenevolesComponent implements OnChanges {

  croisements: Croisement[];
  benevoles: Benevole[];
  choix: string;
  constructor(public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.benevoles = [];
    this.croisements = [];
    this.choix = "";
    this.find();
    this.getCroisement();
  }

  ngOnChanges() {

  }


  find(): void {
    console.log("find")
    console.log(this.benevoles)
    this.benevoleService.getAll().subscribe(data => {
      console.log("data")
      console.log(data)
      this.benevoles = data['benevoles'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  choisir(benevole: Benevole, croisement: Croisement): void {
    let added = false;
    for (let index = 0; index < benevole.Croisements.length; index++) {
      if (croisement.id == benevole.Croisements[index].id) {
        croisement.selected = false;
        benevole.Croisements.splice(index, 1);
        added = true;
        break;
      }
    }

    if (!added) {
      croisement.selected = true;
      benevole.Croisements.push(croisement);
      this.addCroisements(benevole);
    }
  }

  addCroisements(benevole): void {
    console.log("addCroisements")
    console.log(benevole)
    this.benevoleService.addCroisements(benevole).subscribe(data => {
      console.log("data")
      console.log(data)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  getCroisement(): void {
    this.croisementService.getAll().subscribe(data => {
      this.croisements = data['croisements']
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
}