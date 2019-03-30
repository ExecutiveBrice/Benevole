
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';



@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnChanges {

  benevoles: Benevole[];
  choix: string;
  constructor(public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.benevoles = [];
    this.choix = "";


    this.find();
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


}