
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CroisementService, StandService, CreneauService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Croisement, Stand, Creneau } from '../../models';



@Component({
  selector: 'app-gestionMajStands',
  templateUrl: './gestionMajStands.component.html',
  styleUrls: ['./gestionMajStands.component.css']
})

export class GestionMajStandsComponent implements OnChanges {
  stands: Stand[];
  creneaux: Creneau[];
  newStand: Stand = new Stand();
  choix: string;
  ajouterCroisement: number = 0;

  constructor(
    public creneauService: CreneauService,
    public croisementService: CroisementService,
    public standService: StandService,
    public sanitizer: DomSanitizer) {
    this.stands = [];
    this.creneaux = [];
    this.choix = "";
    this.getAllStands();
    this.getAllCrenneaux();
  }

  ngOnChanges() {

  }

  existInCroisements(croisements: Croisement[], id: number): boolean {
    let existe = false;
    croisements.forEach(croisement => {
      if (croisement.Creneau.id == id) {
        existe = true;
      }
    });

    return existe;
  }

  getAllStands(): void {
    console.log("find")
    this.standService.getAll().subscribe(data => {
      console.log(data)
      this.stands = data['stands'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getAllCrenneaux(): void {
    console.log("getAllCrenneaux")
    this.creneauService.getAll().subscribe(data => {
      console.log(data)
      this.creneaux = data['creneaux'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  update(stand): void {
    console.log("update")
    this.standService.update(stand).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  

  updateCroisement(croisement:Croisement): void {
    console.log("update")
    this.croisementService.update(croisement).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  ajoutCroisement(stand: Stand, creneau: Creneau): void {
    console.log("ajoutCroisement")
    let croisement = new Croisement()
    croisement.Stand = stand
    croisement.Creneau = creneau

    this.croisementService.ajout(croisement).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  deleteCroisement(croisement: Croisement): void {
    console.log("deleteCroisement")

    this.croisementService.delete(croisement).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  ajout(stand: Stand): void {
    console.log("ajout")
    stand.Croisements = []
    this.standService.ajout(stand).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  delete(stand): void {
    console.log("delete")
    this.standService.delete(stand).subscribe(data => {
      console.log(data)
      this.getAllStands()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}