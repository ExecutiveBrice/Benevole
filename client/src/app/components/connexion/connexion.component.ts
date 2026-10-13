import {ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {Benevole, Croisement, Evenement} from '../../models';
import {BenevoleService, BenevoleSessionService, TransmissionService} from '../../services';
import { ToastService } from '../../services';
import {HttpErrorResponse} from '@angular/common/http';
import {OrderByPipe} from "../../services/sort.pipe";
import {Router} from "@angular/router";
import { NotificationsComponent } from '../notifications/notifications.component';
import { PushNotificationService } from '../../services/push-notification.service';


@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, OrderByPipe, NotificationsComponent],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.scss'
})
export class ConnexionComponent implements OnInit {

  @Input() evenement!: Evenement;
  @Input() benevole: Benevole | undefined = undefined;
  @Output() actionEmitter: EventEmitter<boolean> = new EventEmitter;
  @ViewChild('firstConnexionField') firstConnexionField?: ElementRef<HTMLInputElement>;

  benevoleEmail!:string;
  constructor(
    public benevoleService: BenevoleService,
    public transmissionService: TransmissionService,
    private benevoleSessionService: BenevoleSessionService,
    private pushNotifications: PushNotificationService,
    private router: Router,
    private toastr: ToastService,
    public formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,) {
  }

  ngOnInit(): void {
    if (this.evenement.needtel) {
      this.formulaireBenevole.get('telephone')?.enable()
    } else {
      this.formulaireBenevole.get('telephone')?.disable()
    }
    if (!this.evenement.basique) {
      this.formulaireBenevole.get('nom')?.enable()
    } else {
      this.formulaireBenevole.get('nom')?.disable()
    }
    this.transmissionService.benevoleStream.subscribe(benevole => {
      this.benevole = benevole;
      // Le bénévole est mis à jour depuis le composant planning. Demander un
      // rendu du panneau « Mes tâches » pour refléter immédiatement ce choix.
      this.changeDetectorRef.markForCheck();
    });
    this.transmissionService.connexionFocusStream.subscribe(() => {
      // Attendre le rendu du changement de panneau avant de donner le focus.
      setTimeout(() => this.firstConnexionField?.nativeElement.focus());
    });

    if (new URLSearchParams(window.location.hash.slice(1)).has('notifications')) {
      this.pushNotifications.consumeInvitation(this.evenement.id).then(benevole => {
        if (!benevole) return;
        this.benevole = benevole;
        this.userExist = true;
        this.formulaireBenevole.patchValue({ nom: benevole.nom, prenom: benevole.prenom, email: benevole.email });
        this.transmissionService.benevoleTransmission(benevole);
        this.actionEmitter.emit(false);
        this.changeDetectorRef.markForCheck();
      }).catch(() => this.toastr.error('Ce lien personnel est invalide, expiré ou déjà utilisé. Demandez un nouveau lien à l’organisateur.', 'Notifications'));
      return;
    }

    this.benevoleEmail = this.benevoleSessionService.getEmail() ?? '';
    if (this.benevoleEmail != null) {
      this.formulaire.get('email')?.setValue( this.benevoleEmail)
      this.find();
    }
  }
  exit(){
    this.benevole = undefined;
    this.userExist = false;
    this.inconnu = false;
    this.benevoleEmail = '';
    this.formulaire.reset();
    this.formulaireBenevole.reset();
    this.transmissionService.deconnexionBenevole();
    this.changeDetectorRef.markForCheck();
    this.router.navigate(['/']);
  }

  formulaire = this.formBuilder.group({
    email: new FormControl(this.benevole?.email, [Validators.required, Validators.email])
  })

  formulaireBenevole = this.formBuilder.group({
    email: new FormControl(this.benevole?.email, [Validators.required, Validators.email]),
    nom: new FormControl(this.benevole?.nom, [Validators.required, Validators.minLength(2)]),
    prenom: new FormControl(this.benevole?.prenom, [Validators.required, Validators.minLength(2)]),
    telephone: new FormControl(this.benevole?.telephone, [Validators.required, Validators.minLength(2)])
  })

  userExist: boolean = false;
  inconnu: boolean = false;

  find(): void {

    if (this.formulaire.valid) {

      this.benevole = this.formulaire.value as Benevole;

      this.benevole.email = this.benevole?.email.toLowerCase();
      this.benevole.email = this.benevole?.email.trimEnd();
      this.benevole.email = this.benevole?.email.trimStart();

      this.benevoleService.getByMail(this.benevole.email, this.evenement?.id).subscribe({
        next: (benevole) => {

          if (benevole == null) {
            this.formulaireBenevole.get("email")?.setValue(this.benevole?.email);
            this.inconnu = true
          } else {
            this.benevole = benevole;
            this.userExist = true
            this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
            this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
            this.transmissionService.benevoleTransmission(benevole);
            this.actionEmitter.emit(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)

          this.toastr.error(error.message, 'Erreur');

        }

      })
    }
  }


  connexionBasique() {
    let email = this.formulaireBenevole.get('prenom')?.value?.toLowerCase().trimEnd().trimStart().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@nomail.com";
    this.formulaireBenevole.get("email")?.setValue(email);
    this.formulaireBenevole.get("nom")?.setValue("");


    this.benevoleService.getByMail(email, this.evenement?.id).subscribe({
      next: (benevole) => {
        console.log(benevole)
        if (benevole == null) {
          this.addBenevole()

        } else {
          this.benevole = benevole;
          this.userExist = true
          this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
          this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
          this.transmissionService.benevoleTransmission(benevole);
          this.actionEmitter.emit(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })


  }


  addBenevole(): void {
    console.log(this.formulaireBenevole)
    if (this.formulaireBenevole.valid) {
      this.benevole = this.formulaireBenevole.value as Benevole;
      this.benevole.email = this.benevole.email.toLowerCase();
      this.benevole.email = this.benevole.email.trimEnd();
      this.benevole.email = this.benevole.email.trimStart();

      this.benevoleService.add(this.benevole, this.evenement?.id).subscribe({
        next: (benevole) => {
          benevole.croisements = [];
          if (benevole.notificationToken) {
            try { this.pushNotifications.remember(this.evenement.id, benevole.id, benevole.notificationToken); }
            catch { this.toastr.error('Le stockage de cet appareil est désactivé. Un lien personnel sera nécessaire pour activer les notifications.', 'Notifications'); }
          }
          this.benevole = benevole;

          this.userExist = true;
          this.transmissionService.benevoleTransmission(benevole);
          this.actionEmitter.emit(false);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)

          this.toastr.error(error.message, 'Erreur');

        }

      })
    }
  }

  retraitCroisement(croisement: Croisement) {
    if (this.benevole) {
      this.benevoleService.removeToCroisement(this.benevole?.id, croisement.id).subscribe({
        next: (benevole) => {
          this.transmissionService.benevoleTransmission(benevole);
          this.toastr.success("Votre choix à bien été retirée", "Merci,")
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.message, 'Erreur');
        }
      })
    }
  }


}
