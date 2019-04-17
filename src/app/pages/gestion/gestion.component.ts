
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnChanges {
  rappel: boolean;
  bloque: string;
  rappel1: string;
  rappel2: string;
  benevoles: Benevole[];
  dateRappel: string;

  constructor(public benevoleService: BenevoleService,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;
    this.benevoles = [];
    this.getBlocage();
    this.getText();
    this.find();
    this.getDateRappel();
  }

  ngOnChanges() {

  }

  getDateRappel() {
    this.configService.getParam("dateRappel").subscribe(res => {
      console.log(res['param'].value);
      this.dateRappel = res['param'].value;
    }, err => {
      console.log(err);
    });
  }

  updateDateRappel() {
    let date = new Date();
    this.dateRappel = date.getUTCDate()+"/"+date.getUTCMonth()+"/"+date.getFullYear()+" à "+date.getHours()+":"+date.getMinutes()
    console.log(this.dateRappel)
    this.configService.updateParam('dateRappel', this.dateRappel)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });

  }
  getBlocage() {
    this.configService.getParam("lock").subscribe(res => {
      console.log(res['param'].value);
      this.bloque = res['param'].value;
    }, err => {
      console.log(err);
    });
  }

  updateBlocage(bloque) {
    if (bloque == "true") {
      bloque = "false";
    } else {
      bloque = "true";
    }
    this.bloque = bloque;
    this.configService.updateParam('lock', bloque)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });

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
  getText() {
    this.configService.getParam("rappel1").subscribe(res => {
      console.log(res['param'].value);
      this.rappel1 = res['param'].value;
    }, err => {
      console.log(err);
    });
    this.configService.getParam("rappel2").subscribe(res => {
      console.log(res['param'].value);
      this.rappel2 = res['param'].value;
    }, err => {
      console.log(err);
    });
  }

  envoiRappel() {
    let email: Email = {
      to: "",
      subject: "Rappel de participation",
      text: ""
    }


    this.benevoles.forEach(benevole => {
      console.log(benevole)
      let text = this.rappel1+"<br>"+"<br>";
      benevole.Croisements.sort((a, b) => (a.Creneau.ordre > b.Creneau.ordre) ? 1 : ((b.Creneau.ordre > a.Creneau.ordre) ? -1 : 0));
      benevole.Croisements.forEach(croisement => {
        text = text + (croisement.Stand.nom == "tous"?"N'importe quel stand":croisement.Stand.nom) + " - " + croisement.Creneau.plage + "<br>"
      })
      if(benevole.gateaux){
      text = text + "<br>Vous avez également proposé d'apporter :<br>"
      text = text + benevole.gateaux + "<br>"
      }
      text = text + "<br>" + this.rappel2
      email.text = text
      email.to = benevole.email


      this.mailService.sendMail(email)
        .subscribe(res => {
          console.log("this.api.sendMail");
          console.log(res);
        }, err => {
          console.log(err);
        });
    })
    this.updateDateRappel()

  }



}