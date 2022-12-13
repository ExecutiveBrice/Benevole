
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { ConfigService, ValidationService, TransmissionService, EvenementService, CroisementService, StandService, MailService, ExcelService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Email, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-gestionBenevoles',
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.css']
})

export class GestionBenevolesComponent implements OnInit {
  authorize: boolean = false;
  organumber: number;
  croisements: Croisement[];
  benevoles: Benevole[];
  choix: string;
  params: Map<string, string>
  evenement: Evenement;
  subscription = new Subscription()


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

    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.organumber?true:false;
    if(this.authorize){
      this.transmissionService.dataTransmission(new Evenement());
      this.find();
      this.getCroisement();
    }else{
      this.router.navigate(['/gestion/' + this.organumber]);
    }
  }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(this.benevoles, 'sample');
  }

  find(): void {
    this.benevoleService.getByEvenementId(this.organumber).subscribe(benevoles => {
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

  choixBenevole(email: string) {
    if (this.choix != email) {
      this.choix = email
    } else {
      this.choix = null
    }

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


  getCroisement(): void {
    this.croisementService.getAll(this.organumber).subscribe(data => {
      this.croisements = data
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
      email.text = "Vous nous aviez communiqué que :<br>";

      email.text = email.text + benevole.commentaire + "<br>"

      email.text = email.text + "<br>Notre réponse :<br>"

      email.text = email.text + benevole.reponse + "<br>"

      email.text = email.text + "<br>Vous pourrez bien entendu retrouver cette réponse sur <a href=" + this.params['url'] + "/" + this.evenement.id + ">le site d'inscription</a><br>Cordialement,<br>L'équipe d'animation"
      this.envoiMail(email)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
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