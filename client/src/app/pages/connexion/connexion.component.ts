
import { Component, HostListener, OnInit } from '@angular/core';
import { BenevoleService, TransmissionService, EvenementService, FileService, ConfigService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Email, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { OrderByPipe } from "../../services/sort.pipe";
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToastrService } from 'ngx-toastr';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-connexion',
  standalone: true,
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [NgClass, MatTooltipModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
  providers: [
    StandService,
    CroisementService,
    ConfigService,
    BenevoleService
  ],

})

export class ConnexionComponent implements OnInit {
  evenement: Evenement = new Evenement();
  idEvenement!: number
  affiche!: string;
  benevole = new Benevole();

  attentionMessage = "Les mails issus de l'application proviennent de l'adresse benevoles.nepasrepondre@gmail.com<br> Ce sont des mails automatiques et sont tres souvent placés dans votre dossier SPAM<br> Comme précisé dans l'adresse mail, il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement:<br>";

  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public transmissionService: TransmissionService,
    public fileService: FileService,
    public sanitizer: DomSanitizer,
    public formBuilder: FormBuilder,
  ) { }


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

    this.evenementService.isOpen(this.idEvenement).subscribe({
      next: (data) => {

        this.getStand();
        this.getEvenement(this.idEvenement);
        this.getAffiche()
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }
    })


  }



  getAffiche() {
    this.fileService.get(this.idEvenement, 'affiche.jpeg').subscribe({
      next: (data) => {
        this.affiche = "data:image/jpeg;base64," + data
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }

    })
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
        this.evenement = data;
        this.transmissionService.dataTransmission(data);

      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })
  }







  userExist: boolean = false;
  wanted: boolean = false;
  find(): void {

    if (this.formulaire.valid) {

      this.benevole = Object.assign(this.benevole, this.formulaire.value)

      this.benevole.email = this.benevole.email.toLowerCase();
      this.benevole.email = this.benevole.email.trimEnd();
      this.benevole.email = this.benevole.email.trimStart();



      this.benevoleService.getByMail(this.benevole.email, this.idEvenement).subscribe({
        next: (benevole) => {
          this.fillBenevole(benevole);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)

          this.toastr.error(error.message, 'Erreur');

        }

      })
    }
  }


  fillBenevole(benevole: Benevole) {
    console.log(benevole);
    
    if (benevole != null) {
      this.benevole = benevole;
      this.userExist = true
      this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
      this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
      this.checkStands(this.preparatifs)
      this.checkStands(this.activites)
      this.checkStands(this.postparatifs)
      this.checkCroisements(this.besoins)
      this.checkCroisements(this.sansChoix)
      this.updateSum()
    } else {
      console.log("pas de benevole avec cette email")
      this.userExist = false

    }
    this.wanted = true;
    console.log(this.formulaire)
  }

  addBenevole(): void {

    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevole.email = this.benevole.email.trimEnd();
    this.benevole.email = this.benevole.email.trimStart();
    this.benevole = Object.assign(this.benevole, this.formulaireBenevole.value)
    this.benevoleService.add(this.benevole, this.idEvenement).subscribe({
      next: (benevole) => {
        this.benevole = benevole;
        this.userExist = true;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })
  }


  checkStands(stands: Stand[]): number {
    let nbben = 0;
    stands.forEach(stand => {
      nbben += this.checkCroisements(stand.croisements)
    });
    return nbben;
  }


  checkCroisements(croisements: Croisement[]): number {
    let nbben = 0;
    croisements.forEach(croisement => {
      nbben += croisement.benevoles.length;
      croisement.benevoles.forEach(benevole => {
        if (benevole.id == this.benevole.id) {
          croisement.selected = true;
        }
      })
    })
    return nbben;
  }





















  stands: Stand[] = [];
  choix!: String;
  sansChoix: Croisement[] = [];
  activites: Stand[] = [];

  besoins: Croisement[] = [];
  preparatifs: Stand[] = [];
  postparatifs: Stand[] = [];









  occupepreparatifs: number = 0;
  occupeactivites: number = 0;
  occupesansChoix: number = 0;
  occupebesoins: number = 0;
  occupepostparatifs: number = 0;
  totalpreparatifs: number = 0;
  totalactivites: number = 0;
  totalsansChoix: number = 0;
  totalbesoins: number = 0;
  totalpostparatifs: number = 0;

  updateSum() {
    this.occupepreparatifs = this.preparatifs.reduce((sum, current) => sum + current.placeOccupe, 0)
    this.occupeactivites = this.activites.reduce((sum, current) => sum + current.placeOccupe, 0)
    this.occupesansChoix = this.sansChoix.reduce((sum, current) => sum + current.benevoles.length, 0)
    this.occupebesoins = this.besoins.reduce((sum, current) => sum + current.benevoles.length, 0)
    this.occupepostparatifs = this.postparatifs.reduce((sum, current) => sum + current.placeOccupe, 0)

    this.totalpreparatifs = this.preparatifs.reduce((sum, current) => sum + current.placeTotal, 0)
    this.totalactivites = this.activites.reduce((sum, current) => sum + current.placeTotal, 0)
    this.totalsansChoix = this.sansChoix.reduce((sum, current) => sum + current.limite, 0)
    this.totalbesoins = this.besoins.reduce((sum, current) => sum + current.limite, 0)
    this.totalpostparatifs = this.postparatifs.reduce((sum, current) => sum + current.placeTotal, 0)

    this.stands.forEach(stand => {
      stand.placeOccupe = 0;
      stand.placeTotal = 0;
      stand.croisements.forEach(croisement => {
        stand.placeOccupe += croisement.benevoles.length;
        stand.placeTotal += croisement.limite;
      })
    })
  }

  updateStand(stand: Stand) {
    stand.placeOccupe = 0
    stand.placeTotal = 0
    stand.croisements.forEach(croisement => {
      if (croisement.besoin == true) {
        this.besoins!.push(croisement);
      }
      stand.placeOccupe += croisement.benevoles.length;
      stand.placeTotal += croisement.limite;
    })
  }

  getStand(): void {
    this.besoins = []
    this.sansChoix = []
    this.preparatifs = []
    this.postparatifs = []
    this.activites = []
    this.standService.getAll(this.idEvenement!).subscribe({
      next: (stands) => {
        console.log(stands);
        
        this.stands = stands;
        stands.forEach(stand => {
          if (stand.croisements != null) {
            if (stand.type == 2) {
              this.updateStand(stand)
              this.activites.push(stand)
            } else if (stand.type == 1) {
              stand.croisements.forEach(croisement => {
                if (croisement.besoin == true) {
                  this.besoins!.push(croisement);
                }

                this.sansChoix!.push(croisement)
              })
            } else if (stand.type == 5) {
              this.updateStand(stand)
              this.preparatifs!.push(stand)

            } else if (stand.type == 6) {
              this.updateStand(stand)
              this.postparatifs!.push(stand)
            }
          }
        })
        this.updateSum()
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
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

  removeFromBenevole(croisement: Croisement) {
    this.stands.forEach(stand => {
      const crois = stand.croisements.find(crois => crois.id == croisement.id)
      if (crois) {
        this.choisir(crois)
      }
    })
  }

  choisir(croisement: Croisement): void {
    if (!this.userExist) {
      this.toastr.error("Connectez vous pour choisir un stand", 'Erreur');
    } else if (croisement.benevoles != undefined && croisement.benevoles.find(benevole => benevole.id == this.benevole.id) == undefined && croisement.benevoles.length >= croisement.limite) {
      this.toastr.error("Ce créneau est complet, choisisez en un autre", 'Erreur');
    } else {
      if (this.benevole.croisements.filter(crois => crois.id == croisement.id).length > 0) {
        this.retraitCroisement(croisement);
      } else {
        this.ajoutCroisement(croisement);
      }
    }
  }

  retraitCroisement(croisement: Croisement) {
    this.benevoleService.removeToCroisement(this.benevole.id, croisement.id).subscribe({
      next: (benevole) => {
        croisement.selected = false;
        croisement.benevoles = croisement.benevoles.filter(benevole => benevole.id != this.benevole.id)
        this.fillBenevole(benevole);
        this.toastr.success("Votre choix à bien été retirée", "Merci,")
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
  }

  ajoutCroisement(croisement: Croisement) {
    if (croisement.benevoles.length < croisement.limite) {
      this.benevoleService.addToCroisement(this.benevole.id, croisement.id, false).subscribe({
        next: (benevole) => {
          croisement.selected = true;
          croisement.benevoles.push(benevole)
          this.fillBenevole(benevole);
          this.toastr.success("Votre choix à bien été ajouté", "Merci,")
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.message, 'Erreur');
        }
      })
    }
  }

  public getScreenWidth: any;
  public getScreenHeight: any;
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
}

