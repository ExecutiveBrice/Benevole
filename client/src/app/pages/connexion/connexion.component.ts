
import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit, input, signal } from '@angular/core';
import { ValidationService, BenevoleService, TransmissionService, EvenementService, FileService, ConfigService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Email, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule, NgClass } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { OrderByPipe } from "../../services/sort.pipe";
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToastrService } from 'ngx-toastr';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-connexion',
  standalone: true,
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [NgClass,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
  providers: [
    StandService,
    ValidationService,
    CroisementService,
    ConfigService,
    BenevoleService
  ],

})

export class ConnexionComponent implements OnInit {
  evenement: Evenement = new Evenement();
  idEvenement!: number
  affiche!: string;


  attentionMessage = "Les mails issus de l'application proviennent de l'adresse benevoles.nepasrepondre@gmail.com<br> Ce sont des mails automatiques et sont tres souvent placés dans votre dossier SPAM<br> Comme précisé dans l'adresse mail, il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement:<br>";


  @Input() public toggleSideNav: boolean = false

  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public transmissionService: TransmissionService,
    public validationService: ValidationService,
    public fileService: FileService,
    public sanitizer: DomSanitizer,
    public formBuilder: FormBuilder) { }

  subscription = new Subscription();
  benevole = new Benevole();


  formulaire = this.formBuilder.group({
    email: new FormControl(this.benevole.email, [Validators.required, Validators.email])

  })

  formulaireBenevole = this.formBuilder.group({

    nom: new FormControl(this.benevole.nom, [Validators.required, Validators.minLength(2)]),
    prenom: new FormControl(this.benevole.prenom, [Validators.required, Validators.minLength(2)]),

    telephone: new FormControl(this.benevole.telephone, [Validators.required, Validators.minLength(2)])
  })


  showError() {
    this.toastr.error(" Cette plage horaire est déjà complète,<br>Choisissez en une autre", 'Erreur');
  }

  showSuccess() {
    this.toastr.success("Vous pouvez revenir quand vous le souhaitez pour modifier vos choix<br>en vous connectant (<a href=" + "this.using_address" + ">sur le site d'inscription</a>)<br>Vous pouvez fermer cette fenêtre", "<strong>Merci de votre participation</strong>")
  }
  isShowing: boolean = false

  ngOnInit() {
    this.formulaireBenevole.get('telephone')?.disable()
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.validationService.testCommun(this.idEvenement).then(response => {
      if (!response) {
        this.getStand();
        this.getEvenement(this.idEvenement);
        this.getAffiche()
      } else {
        // this.router.navigate(['error']);
      }
    })
      .catch(err => {
        //this.router.navigate(['error']);
      })


  }



  getAffiche() {
    this.fileService.get(this.idEvenement, 'affiche.jpeg').subscribe(data => {
      this.affiche = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
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








  userExist: boolean = false;
  wanted: boolean = false;
  find(): void {

    if (this.formulaire.valid) {

      this.benevole = Object.assign(this.benevole, this.formulaire.value)

      this.benevole.email = this.benevole.email.toLowerCase();
      this.benevole.email = this.benevole.email.trimEnd();
      this.benevole.email = this.benevole.email.trimStart();



      this.benevoleService.getByMail(this.benevole.email, this.idEvenement).subscribe(benevole => {

        if (benevole != null) {
          this.benevole = benevole;
          this.userExist = true
          this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
          this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
          this.checkStands(this.preparatifs)
          this.checkStands(this.stands)
          this.checkStands(this.postparatifs)
          this.checkCroisements(this.besoins)
          this.checkCroisements(this.sansChoix)
        } else {
          console.log("pas de benevole à cette email")
          this.userExist = false

        }


        this.wanted = true;
        console.log(this.formulaire)
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    }
  }


  addBenevole(): void {

    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevole.email = this.benevole.email.trimEnd();
    this.benevole.email = this.benevole.email.trimStart();
    this.benevole = Object.assign(this.benevole, this.formulaire.value)
    this.benevoleService.add(this.benevole, this.idEvenement).subscribe(benevole => {
      this.benevole = benevole;
      this.userExist = true;
    },
      error => {

        console.log('😢 Oh no!', error);
      });
  }


  checkStands(stands: Stand[]) {
    stands.forEach(stand => {
      this.checkCroisements(stand.croisements)
    });
  }


  checkCroisements(croisements: Croisement[]) {
    croisements.forEach(croisement => {
      croisement.benevoles.forEach(benevole => {
        if (benevole.id == this.benevole.id) {
          croisement.selected = true;
        }
      })
    })

  }






















  choix!: String;
  sansChoix: Croisement[] = [];
  stands: Stand[] = [];

  besoins: Croisement[] = [];
  preparatifs: Stand[] = [];
  postparatifs: Stand[] = [];
  croisements: Croisement[] = [];


  








  getStand(): void {
    this.besoins = []
    this.sansChoix = []
    this.preparatifs = []
    this.postparatifs = []
    this.stands = []
    this.standService.getAll(this.idEvenement!).subscribe(stands => {
      stands.forEach(stand => {

        if (stand.croisements != null) {

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

        stand.placeRestante = 0
        stand.croisements.forEach(croisement => stand.placeRestante += (croisement.limite - croisement.benevoles.length))

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

  }




  choisir(croisement: Croisement): void {
    if (this.benevole.croisements.filter(crois => crois.id == croisement.id).length > 0) {
      this.retraitCroisement(croisement);
    } else {
      this.ajoutCroisement(croisement);
    }
  }

  retraitCroisement(croisement: Croisement) {
    croisement.benevoles = croisement.benevoles.filter(bene => bene.id != this.benevole.id)
    this.benevole.croisements = this.benevole.croisements.filter(crois => crois.id != croisement.id)
    this.benevoleService.updateCroisement(this.benevole.id, croisement.id).subscribe(data => {
      this.toastr.success("Votre choix à bien été retirée", "Merci,")
    },
      error => {
        console.log('😢 Oh no!', error);
      });


  }

  ajoutCroisement(croisement: Croisement) {
    if (croisement.benevoles.length < croisement.limite) {
      croisement.selected = true;
      this.benevole.croisements.push(croisement);
      croisement.benevoles.push(this.benevole);
      this.benevoleService.updateCroisement(this.benevole.id, croisement.id).subscribe(data => {
        this.toastr.success("Votre choix à bien été ajouté", "Merci,")
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    }
  }

  validate(): void {


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

    this.showSuccess()
  }

  completeTemplate(text: string): string {
    while (text.match("<event_name>")) {
      text = text.replace("<event_name>", this.evenement.eventName)
    }
    while (text.match("<using_address>")) {
      text = text.replace("<using_address>", "this.using_address")
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

