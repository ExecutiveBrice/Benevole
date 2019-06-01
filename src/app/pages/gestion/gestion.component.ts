
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
  rappel;
  bloque: string;
  benevoles: Benevole[];
  dateRappel: string;
  mail: boolean;

  emailInfo: Email = {
    to: "",
    subject: "",
    text: "Bla bla"
  }

  mailingList;
  mailingLists = [{
    id: '1',
    name: 'Tout les inscrits',
  },
  {
    id: '2',
    name: 'Les inscrits AVEC au moins un choix',
  },
  {
    id: '3',
    name: 'Les inscrits SANS choix',
  }]



  constructor(public benevoleService: BenevoleService,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;
    this.mail = false;
    this.benevoles = [];
    this.getBlocage();
    this.getText();
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
    this.dateRappel = date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getFullYear() + " à " + date.getHours() + ":" + date.getMinutes()
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

  getBenevoles(option): void {
    console.log("getBenevoles")
    console.log(option)
    this.benevoles = [];
    if (option.id == 1) {
      this.benevoleService.getAll().subscribe(data => {
        console.log("data")
        console.log(data)
        this.benevoles = data['benevoles'];
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    } else if (option.id == 2) {
      this.benevoleService.getWithChoice().subscribe(data => {
        console.log("data")
        console.log(data)
        this.benevoles = data['benevoles'];
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    } else if (option.id == 3) {
      this.benevoleService.getWithOutChoice().subscribe(data => {
        console.log("data")
        console.log(data)
        this.benevoles = data['benevoles'];
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    }
  }


  getText() {
    this.emailInfo.subject = 'Infos pratique';

    this.configService.getParam("rappel1").subscribe(res => {
      console.log(res['param'].value);
      this.emailInfo.text = res['param'].value;
    }, err => {
      console.log(err);
    });
    this.configService.getParam("rappel2").subscribe(res => {
      console.log(res['param'].value);
      this.emailInfo.text = this.emailInfo.text + res['param'].value;
    }, err => {
      console.log(err);
    });

  }


  envoiMail(email: Email) {
    this.mail = false;
    console.log(email.text)
    email.text = email.text.replace(/\n/g, "<br>");
    console.log(email.text)

    console.log(this.rappel)

    this.benevoles.forEach(benevole => {
      if (benevole.id == 21) {
        console.log(benevole)
        email.to = benevole.email

        if (this.rappel) {
          email.text = email.text + "<br>" + "<br>"
          benevole.Croisements.sort((a, b) => (a.Creneau.ordre > b.Creneau.ordre) ? 1 : ((b.Creneau.ordre > a.Creneau.ordre) ? -1 : 0));
          benevole.Croisements.forEach(croisement => {
            email.text = email.text + (croisement.Stand.nom == "tous" ? "N'importe quel stand" : croisement.Stand.nom) + " - " + croisement.Creneau.plage + "<br>"
          })
          if (benevole.gateaux) {
            email.text = email.text + "<br>Vous avez également proposé d'apporter :<br>"
            email.text = email.text + benevole.gateaux + "<br>"
          }
        }

        this.mailService.sendMail(email)
          .subscribe(res => {
            console.log("this.api.sendMail");
            console.log(res);
          }, err => {
            console.log(err);
          });
      }
    })

    this.getText();
    this.mailingList = null;
    this.updateDateRappel()
  }


  toggleVisibility(e) {
    this.rappel = e.target.checked;
  }

}