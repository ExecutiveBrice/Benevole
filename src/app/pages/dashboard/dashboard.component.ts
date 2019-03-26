import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand } from '../../models';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnChanges {
  new: boolean;
  nouveau: boolean;
  exist: boolean;
  choix: String;
  creneaux: Croisement[];
  stands: Stand[];
  croisements: Croisement[];
  benevole: Benevole = new Benevole;
  constructor(public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public sanitizer: DomSanitizer) {
    this.exist = false;
    this.nouveau = false;
    this.new = true;
    this.getCroisements();
    this.getStand();

  }

  ngOnChanges() {

  }

  find(benevole: Benevole): void {
    this.benevoleService.getByMail(benevole.email).subscribe(data => {
      console.log(data)
      this.exist = true
      this.benevole = data['benevoles'][0];
      console.log(this.benevole)
    },
      error => {
        this.exist = false
        this.new = false;
        console.log('😢 Oh no!', error);
      });

  }


  subscribe(benevole: Benevole): void {
    this.benevoleService.add(benevole).subscribe(data => {
      console.log(data)
      this.benevole.id = data['benevoles'];
      this.exist = true;
      console.log(this.benevole)
    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }


  update(benevole: Benevole): void {
    this.benevoleService.update(benevole).subscribe(data => {
      console.log(data)
      this.benevole.id = data['benevoles'];
      this.exist = true;
      console.log(this.benevole)
    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }




  error(benevole: Benevole): void {
    this.benevoleService.error(benevole).subscribe(data => {
      console.log(data)
      if (data['message'] == "ok") {

      }

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }





  getCroisements(): void {
    this.croisementService.getByStand(1).subscribe(data => {
      console.log(data)
      this.creneaux = data['croisements']
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }









  getStand(): void {
    this.standService.getAll().subscribe(data => {
      console.log(data)
      this.stands = data['stands']
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }





  updateCroisementListe() {
    this.croisements.forEach(croisement => {
      this.benevole.Croisements.forEach(croisementbene => {
        if (croisement.id == croisementbene.id) {
          croisement.selected = true;
        } else {
          croisement.selected = false;
        }
      })
    });
  }

  choisir(croisement: Croisement) {
    console.log(this.benevole)

    this.benevole.Croisements.forEach(croisementbene => {
      let index = this.benevole.Croisements.findIndex(x => x.id ===croisementbene.id);
      if (croisement.id == croisementbene.id) {
        croisement.selected = true;
        this.benevole.Croisements.splice(index, 1);
      } else {
        croisement.selected = false;
        this.benevole.Croisements.push(croisement);
      }
    })

    console.log(this.benevole);

  }












}