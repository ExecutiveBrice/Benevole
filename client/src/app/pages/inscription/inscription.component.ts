
import { Component, Input, OnInit, HostListener  } from '@angular/core';
import { ValidationService, BenevoleService, EvenementService, TransmissionService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})

export class InscriptionComponent implements OnInit {

  @Input() valid?: string

  validation: boolean = false;

  choix!: String;
  sansChoix!: Croisement[];
  stands: Stand[] = [];

  besoins!: Croisement[];
  preparatifs!: Stand[];
  postparatifs!: Stand[];
  croisements!: Croisement[];
  benevole: Benevole = new Benevole();
  plein!: boolean;
  emailText1!: string;
  emailText2!: string;
  choixStand!: string;
  evenement: Evenement = new Evenement();
  subscription = new Subscription()
  params!: Map<string, string>
  using_address!: string;
  idEvenement!: number
  faEnvelope=faEnvelope;
  clignotage: boolean = false;
  valider: boolean = false;

  constructor(
    public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    public transmissionService: TransmissionService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.params = JSON.parse(localStorage.getItem('allParams')!);
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    this.getEvenement(this.idEvenement);

    this.validationService.testCommun(this.idEvenement).then(response => {
      if (response) {

        this.using_address = this.params?.get("url") + "/" + this.idEvenement;

        if (localStorage.getItem('user')) {
          this.benevole = JSON.parse(localStorage.getItem('user')!);
          this.actualiseBenevole()
        } else {
          this.router.navigate(['/' + this.idEvenement]);
        }

        this.plein = false;
        this.validation = false;


        this.getStand();

      } else {
        this.router.navigate(['error']);
      }
    })
      .catch(err => {
        this.router.navigate(['error']);
      })


    this.transmissionService.someEvent.subscribe(data => {
      console.log(data)
      if (data == "validation") {
        this.validate();
      }

    })
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

  actualiseBenevole(): void {
    this.benevoleService.getByMail(this.benevole.email, this.idEvenement!).subscribe(benevole => {
      benevole.croisements = []
      this.benevole = benevole;

      this.croisementService.getByBenevole(benevole.id).subscribe(croisements => {
        if (croisements == null) {
          this.benevole.croisements = []
        } else {
          this.benevole.croisements = croisements;
        }
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  getStand(): void {
    this.besoins = []
    this.sansChoix = []
    this.preparatifs = []
    this.postparatifs = []
    this.stands = []
    this.standService.getAll(this.idEvenement!).subscribe(stands => {
      stands.forEach(stand => {

        stand.croisements = []
        this.croisementService.getByStand(stand.id).subscribe(croisements => {
          console.log(croisements)
          if (croisements != null) {
            croisements.forEach(croisement => {
              croisement.benevoles.forEach(benevole => {
                if (benevole.id == this.benevole.id) {
                  croisement.selected = true;
                }
              })

            });
            if (croisements != null) {
              stand.croisements = croisements

              if (stand.type == 2 || stand.type == 3) {
                stand.croisements.forEach(croisement => {
                  if (croisement.besoin == true) {
                    this.besoins!.push(croisement);
                  }
                  croisement.stand = stand
                })
                this.stands.push(stand)

              } else if (stand.type == 1) {
                stand.croisements.forEach(croisement => {
                  if (croisement.besoin == true) {
                    this.besoins!.push(croisement);
                  }
                  croisement.stand = stand
                  this.sansChoix!.push(croisement)
                })
              } else if (stand.type == 5) {
                stand.croisements.forEach(croisement => {
                  if (croisement.besoin == true) {
                    this.besoins!.push(croisement);
                  }
                  croisement.stand = stand
                })
                this.preparatifs!.push(stand)

              } else if (stand.type == 6) {
                stand.croisements.forEach(croisement => {
                  if (croisement.besoin == true) {
                    this.besoins!.push(croisement);
                  }
                  croisement.stand = stand
                })
                this.postparatifs!.push(stand)

              }
            }
          }
          stand.placeRestante = 0
          stand.croisements.forEach(croisement => stand.placeRestante += (croisement.limite - croisement.benevoles.length))
        },
          error => {
            console.log('😢 Oh no!', error);
          });
      })
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  updateCroisementListe(croisements: Croisement[]): void {

    for (let index = 0; index < croisements.length; index++) {
      for (let indexb = 0; indexb < croisements[index].benevoles.length; indexb++) {
        if (croisements[index].benevoles[indexb].id == this.benevole.id) {
          croisements[index].selected = true;
          this.benevole.croisements.push(croisements[index]);
          break;
        } else {
          croisements[index].selected = false;
        }
      }
    }
    this.clignotage = true;
  }


  addCroisements(benevole: Benevole): void {

    let croisementsList: number[] = []
    benevole.croisements.forEach(croisement => {
      croisementsList.push(croisement.id)
    });
    benevole.email = benevole.email.toLowerCase();
    this.benevoleService.addCroisements(benevole.id, croisementsList).subscribe(data => {
    },
      error => {
        console.log('😢 Oh no!', error);
      });
      this.clignotage = true;
  }


  choisir(croisement: Croisement): void {

    let added = false;
    for (let index = 0; index < this.benevole.croisements.length; index++) {
      if (croisement.id == this.benevole.croisements[index].id) {
        for (let indexBenevole = 0; indexBenevole < croisement.benevoles.length; indexBenevole++) {
          if (this.benevole.id == croisement.benevoles[indexBenevole].id) {
            croisement.benevoles.splice(indexBenevole, 1);
          }
        }
        croisement.selected = false;
        this.benevole.croisements.splice(index, 1);
        added = true;
        break;
      }
    }

    if (croisement.benevoles.length < croisement.limite) {
      this.plein = false;
      if (!added) {
        croisement.selected = true;
        this.benevole.croisements.push(croisement);
        croisement.benevoles.push(this.benevole);
        if (croisement.benevoles.length > croisement.limite) {
          this.plein = true;
        }
      }
    } else {
      this.plein = true;
    }
    this.clignotage = true;
  }

  updateBenevoleAttributes(benevole: Benevole) {
    this.benevoleService.update(benevole).subscribe(data => {
    },
      error => {
        console.log('😢 Oh no!', error);
      });
      this.clignotage = true;
  }

  validate(): void {

    this.validation = true;
    this.addCroisements(this.benevole);
    this.updateBenevoleAttributes(this.benevole);
    var email = new Email();
    email.to = this.benevole.email
    email.subject = "Validation de participation pour l'evenement : " + this.evenement.eventName
    email.text = "Bonjour,<br />" + this.evenement.validation + "<br />";

    this.benevole.croisements.sort((a, b) => (a.creneau.ordre > b.creneau.ordre) ? 1 : ((b.creneau.ordre > a.creneau.ordre) ? -1 : 0));
    this.benevole.croisements.forEach(croisement => {
      email.text = email.text + (croisement.stand.nom == "tous" ? "N'importe quel stand" : croisement.stand.nom) + " - " + croisement.creneau.plage + "<br />"
    });
    email.text = email.text + "<br />"
    email.text = email.text + this.evenement.retour;
    email.text = email.text + "<br />"
    email.text = email.text + this.evenement.signature;

    email.text = email.text + "<br />"
    email.text = email.text + "Comme précisé dans l'adresse mail, il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement :<br />";
    email.text = email.text + this.evenement.contact + " - " + this.evenement.contactEmail + "<br />"

    email.text = this.completeTemplate(email.text)
    this.envoiMail(email)
  }

  completeTemplate(text: string): string {
    while (text.match("<event_name>")) {
      text = text.replace("<event_name>", this.evenement.eventName)
    }
    while (text.match("<using_address>")) {
      text = text.replace("<using_address>", this.using_address!)
    }
    return text
  }

  envoiMail(email: Email) {
    this.mailService.sendMail(email)
      .subscribe(res => {
      }, err => {
        console.log(err);
      });
  }



  public getScreenWidth: any;
  public getScreenHeight: any;


  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
}