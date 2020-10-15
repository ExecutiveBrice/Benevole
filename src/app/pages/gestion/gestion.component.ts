
import { Component, OnInit } from '@angular/core';
import { CroisementService, StandService, MailService, ConfigService, ExcelService, BenevoleService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Email, Config } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnInit {
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

  organumber:number;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public benevoleService: BenevoleService,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public excelService: ExcelService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));

    console.log(this.organumber)
    if (!this.organumber || isNaN(this.organumber) || this.organumber < 1) {
      this.router.navigate(['/error']);
    }


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


  exportAsXLSX(): void {

    this.standService.getAll().subscribe(data => {
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

      console.log(stands)

      this.excelService.multiExportAsExcelFile(stands, 'Stands');

    },
      error => {
        console.log('😢 Oh no!', error);
      });

  }

  getDateRappel() {
    this.configService.getParam("dateRappel").subscribe(res => {
      this.dateRappel = res['param'].value;
    }, err => {
      console.log(err);
    });
  }

  updateDateRappel() {
    let date = new Date();
    this.dateRappel = date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getFullYear() + " à " + date.getHours() + ":" + date.getMinutes()
    console.log(this.dateRappel)
    let config = new Config();
    config.param = 'dateRappel'
    config.value = this.dateRappel
    this.configService.updateParam(config)
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
    let config = new Config();
    config.param = 'lock'
    config.value = bloque
    this.configService.updateParam(config)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });

  }

  getMailingList(option): void {
    console.log("getMailingList")
    console.log(option);
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

  }
  getBenevolesWithoutChoice(benevoles: Benevole[]) {
    benevoles.forEach(benevole => {
      if (benevole.Croisements.length == 0) {
        this.benevolesWithoutChoice.push(benevole);
      }
    });

  }
  getBenevolesToChange(benevoles: Benevole[]) {
    benevoles.forEach(benevole => {
      if (benevole.Croisements) {
        benevole.Croisements.forEach(croisement => {
          if (croisement.Stand.etat == 1 || croisement.Stand.etat == 3) {
            this.benevolesToChange.push(benevole);
          }
        });
      }
    });

  }

  getText() {
    this.emailInfo.subject = 'Infos pratique';

    this.configService.getParam("rappel1").subscribe(res => {

      this.emailInfo.text = res['param'].value;

      this.configService.getParam("rappel2").subscribe(res => {

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
      let emailCopy = JSON.parse(JSON.stringify(email))
      console.log(benevole)
      emailCopy.to = benevole.email
      if (this.rappel) {
        emailCopy.text = emailCopy.text + "<br><br>N'oubliez pas que vous vous êtes inscrit en tant que bénévole pour:<br>";
        benevole.Croisements.sort((a, b) => (a.Creneau.ordre > b.Creneau.ordre) ? 1 : ((b.Creneau.ordre > a.Creneau.ordre) ? -1 : 0));
        benevole.Croisements.forEach(croisement => {
          emailCopy.text = emailCopy.text + (croisement.Stand.nom == "tous" ? "N'importe quel stand" : croisement.Stand.nom) + " - " + croisement.Creneau.plage + "<br>"
        })
        if (benevole.gateaux) {
          emailCopy.text = emailCopy.text + "<br>Vous avez également proposé d'apporter :<br>"
          emailCopy.text = emailCopy.text + benevole.gateaux + "<br>"
        }
      }

      this.mailService.sendMail(emailCopy)
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