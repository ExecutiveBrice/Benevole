
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';



@Component({
  selector: 'app-gestionStands',
  templateUrl: './gestionStands.component.html',
  styleUrls: ['./gestionStands.component.css']
})

export class GestionMajStandsComponent implements OnChanges {
  stands: Stand[];

  choix: string;
  constructor(
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.stands = [];

    this.choix = "";
    this.getAll();
  }

  ngOnChanges() {

  }


  getAll(): void {
    console.log("find")
    console.log(this.stands)
    this.standService.getAll().subscribe(data => {
      console.log("data")
      console.log(data)

      this.stands = data['stands'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  update(stand): void {
    console.log("update")
    stand.bulle = "coucou";
    console.log(stand)
    this.standService.update(stand).subscribe(data => {
      console.log("data")
      console.log(data)

      this.stands = data['stands'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}