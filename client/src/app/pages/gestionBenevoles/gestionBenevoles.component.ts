
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { ConfigService, ValidationService, EvenementService, CroisementService, StandService, MailService, ExcelService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Email, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { faEnvelope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gestionBenevoles',
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.css']
})

export class GestionBenevolesComponent implements OnInit {
  attention = faExclamationTriangle;
  envelope = faEnvelope;
  authorize: boolean = false;
  croisements: Croisement[];
  benevoles: Benevole[];
  choix: string;
  params: Map<string, string>
  evenement: Evenement = new Evenement();
  subscription = new Subscription()
  idEvenement: number
  stands: Stand[];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public configService: ConfigService,
    public evenementService: EvenementService,

    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public excelService: ExcelService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.params = JSON.parse(localStorage.getItem('allParams'));

    this.benevoles = [];
    this.croisements = [];
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id'))
    console.log(parseInt(this.route.snapshot.paramMap.get('id')))
    this.getEvenement(this.idEvenement);

    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.find();
      this.getStand();
    } else {
      this.router.navigate(['/gestion/' + this.idEvenement]);
    }
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe(data => {
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(this.benevoles, 'benevoles');
  }


  getStand(): void {
    this.stands = []
    this.standService.getAll(this.idEvenement).subscribe(stands => {
      stands.forEach(stand => {
        stand.croisements = []
        this.croisementService.getByStand(stand.id).subscribe(croisements => {
          stand.croisements = croisements
        },
          error => {
            console.log('😢 Oh no!', error);
          });
      })
      this.stands = stands
      console.log(this.stands)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  find(): void {
    this.benevoleService.getByEvenementId(this.idEvenement).subscribe(benevoles => {
      if (benevoles != null) {
        this.benevoles = benevoles;

        benevoles.forEach(benevole => {
          benevole.croisements = []
          this.croisementService.getByBenevole(benevole.id).subscribe(croisements => {
            benevole.croisements = croisements
          },
            error => {
              console.log('😢 Oh no!', error);
            });
        });
      }
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  choisir(benevole: Benevole, benecroisement: Croisement, croisement: Croisement): void {
    if (benecroisement != null) {
      if (benecroisement.id) {
        for (let index = 0; index < benevole.croisements.length; index++) {
          if (benecroisement.id == benevole.croisements[index].id) {
            benevole.croisements.splice(index, 1);
            break;
          }
        }
      }
    }
    if (benevole.croisements == null) {
      benevole.croisements = []
    }
    if (croisement != null) {
      benevole.croisements.push(croisement);
    }

    this.addCroisements(benevole);
  }


  addCroisements(benevole: Benevole): void {
    let croisementsList = []
    benevole.croisements.forEach(croisement => {
      croisementsList.push(croisement.id)
    });
    benevole.email = benevole.email.toLowerCase();
    this.benevoleService.addCroisements(benevole.id, croisementsList).subscribe(data => {
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  modify(benevole: Benevole){
    this.benevoleService.update(benevole).subscribe(data => {
      console.log(data)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
  send(benevole: Benevole) {
    this.benevoleService.update(benevole).subscribe(data => {
      var email = new Email();
      email.to = benevole.email


      email.subject = "Réponse au commentaire de l'évenement " + this.evenement.eventName;

      if (benevole.commentaire) {
        email.text = "Vous nous aviez communiqué que :<br>";
        email.text = email.text + benevole.commentaire + "<br>"
      }
      email.text = email.text + "<br>Notre réponse :<br>"

      email.text = email.text + benevole.reponse + "<br>"

      email.text = email.text + "<br>Vous pourrez bien entendu retrouver cette réponse sur <a href=" + this.params['url'] + "/" + this.idEvenement + ">le site d'inscription</a><br>Cordialement,<br>L'équipe d'animation"

      email.text = email.text + "<br><br>N'oubliez pas que vous vous êtes inscrit en tant que bénévole pour:<br>";
      if (benevole.croisements) {
        benevole.croisements.sort((a, b) => (a.creneau.ordre > b.creneau.ordre) ? 1 : ((b.creneau.ordre > a.creneau.ordre) ? -1 : 0));
        benevole.croisements.forEach(croisement => {
          email.text = email.text + (croisement.stand.nom == "tous" ? "N'importe quel stand" : croisement.stand.nom) + " - " + croisement.creneau.plage + "<br>"
        })
      } else {
        email.text = email.text + "Quoi ?! Vous n'êtes pas inscrit !"
      }




      this.envoiMail(email)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  toggleList = [];
  toggle(toggleName: String) {
    if (this.toggleList.indexOf(toggleName) > -1) {
      this.toggleList = this.toggleList.filter(elem => elem != toggleName)
    } else {
      this.toggleList.push(toggleName);
    }
  }


  envoiMail(email: Email) {
    this.mailService.sendMail(email)
      .subscribe(res => {
      }, err => {
        console.log(err);
      });
  }

  delete(benevoleId: number) {
    this.benevoleService.deleteById(benevoleId)
      .subscribe(res => {
        this.benevoles = this.benevoles.filter(benevole => benevole.id != benevoleId)
      }, err => {
        console.log(err);
      });
  }
}