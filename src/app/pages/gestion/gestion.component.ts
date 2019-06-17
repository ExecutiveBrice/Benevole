
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CroisementService, StandService, MailService, ConfigService, ExcelService, BenevoleService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';
import { forEach } from '@angular/router/src/utils/collection';
import { stringify } from 'querystring';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnChanges {
  rappel;
  bloque: string;
  benevoles: Benevole[];
  benevolesWithChoice: Benevole[];
  benevolesWithoutChoice: Benevole[];
  benevolesToChange: Benevole[];
  dateRappel: string;
  mail: boolean;

  emailInfo: Email = {
    to: "",
    subject: "",
    text: "Bla bla"
  }

  mailingList: Benevole[];
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
    public excelService: ExcelService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;
    this.mail = false;
    this.mailingList = [];
    this.benevoles = [];
    this.benevolesWithChoice = [];
    this.benevolesWithoutChoice = [];
    this.benevolesToChange = [];
    this.getBlocage();
    this.getText();
    this.getDateRappel();
    this.getBenevoles();
  }

  ngOnChanges() {

  }


  exportAsXLSX(): void {

    this.standService.getAll().subscribe(data => {
      console.log("data")
      console.log(data)

      let stands = new Array;
      data['stands'].forEach(stand => {
        let standLite = {
          nom: String,
          creneaux: []
        };
        standLite.nom = stand.nom;
        standLite.creneaux = [];

        for (let indexR = 0; indexR < 100; indexR++) {
          let creneau = {};

          stand.Croisements.sort(function (a, b) { return a.Creneau.ordre - b.Creneau.ordre; })
          for (let index = 0; index < stand.Croisements.length; index++) {
            const croisement = stand.Croisements[index];
            creneau[croisement.Creneau.plage] = "";
            if (croisement.Benevoles[indexR]) {
              creneau[croisement.Creneau.plage] = croisement.Benevoles[indexR].nom + " " + croisement.Benevoles[indexR].prenom;
            }
          }
          standLite.creneaux.push(creneau);
        }
        stands.push(standLite)
      });
      console.log('stands')
      console.log(stands)

      this.excelService.multiExportAsExcelFile(stands, 'Stands');

    },
      error => {
        console.log('😢 Oh no!', error);
      });

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

  getMailingList(option): void {
    console.log("getMailingList")
    console.log(option)
    this.benevoles = [];
    if (option.id == 1) {
      this.mailingList = this.benevoles
    } else if (option.id == 2) {
      this.mailingList = this.benevolesWithChoice
    } else if (option.id == 3) {
      this.mailingList = this.benevolesWithoutChoice
    }
  }



  getBenevoles(): void {
    console.log("getBenevoles")

    this.benevoleService.getAll().subscribe(data => {
      console.log("benevoles")
      console.log(data)
      this.benevoles = data['benevoles'];
      this.getBenevolesWithChoice(this.benevoles);
      this.getBenevolesWithoutChoice(this.benevoles);
      this.getBenevolesToChange(this.benevoles);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getBenevolesWithChoice(benevoles: Benevole[]) {

    benevoles.forEach(benevole => {
      if (benevole.Croisements.length > 0) {
        this.benevolesWithChoice.push(benevole);
      }
    });
    console.log("benevolesWithChoice")
    console.log(this.benevolesWithChoice)
  }
  getBenevolesWithoutChoice(benevoles: Benevole[]) {
    benevoles.forEach(benevole => {
      if (benevole.Croisements.length == 0) {
        this.benevolesWithoutChoice.push(benevole);
      }
    });
    console.log("benevolesWithoutChoice")
    console.log(this.benevolesWithoutChoice)
  }
  getBenevolesToChange(benevoles: Benevole[]) {
    benevoles.forEach(benevole => {
      if (benevole.Croisements) {
        benevole.Croisements.forEach(croisement => {
          if (croisement.Stand.etat == 1 || croisement.Stand.id == 8) {
            this.benevolesToChange.push(benevole);
          }
        });
      }
    });
    console.log("benevolesToChange")
    console.log(this.benevolesToChange)
  }

  getText() {
    this.emailInfo.subject = 'Infos pratique';

    this.configService.getParam("rappel1").subscribe(res => {
      console.log(res['param'].value);
      this.emailInfo.text = res['param'].value;

      this.configService.getParam("rappel2").subscribe(res => {
        console.log(res['param'].value);
        this.emailInfo.text = this.emailInfo.text + res['param'].value;
      }, err => {
        console.log(err);
      });

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

    this.mailingList.forEach(benevole => {
        console.log(benevole)
        email.to = benevole.email
        if (this.rappel) {
          email.text = email.text + "<br><br>N'oubliez pas que vous vous êtes inscrit en tant que bénévole pour:<br>";
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
    })
    this.rappel = false;
    this.getText();
    this.mailingList = [];
    this.updateDateRappel()
  }


  toggleVisibility(e) {
    this.rappel = e.target.checked;
  }

}