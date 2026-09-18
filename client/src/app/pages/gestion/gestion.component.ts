
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TransmissionService, CroisementService, EvenementService, StandService, MailService, BenevoleService, FileService, ConfigService, AuthService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Email, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import QRCode from 'qrcode'
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderByPipe } from '../../services/sort.pipe';
import { Params } from '../../models/params';
import { ToastService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalStand } from '../../models/local/stand';
import { ModalAccessGestionComponent } from '../../components/modalAccessGestion/modalAccessGestion.component';
import { BootstrapModalService } from '../../services/bootstrap-modal.service';


@Component({
  selector: 'app-gestion',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [
    NgxEditorModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule, FormsModule, ],
  providers: [
    EvenementService,
    BenevoleService,
    CroisementService,
    StandService,
    MailService,

    FileService,
    ConfigService
  ],

  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})

export class GestionComponent implements OnInit {


  editor: Editor = new Editor();
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear'],
  ];



  authorize: boolean = false
  connexionDialogOpen = false;
  private ouvrirConnexionDepuisFooter = false;
  rappel!: boolean

  emailStands: LocalStand[] = []
  benevoles: Benevole[] = [];

  mail!: boolean;
  sendingProgress!: boolean;

  selectedDeviceObj: any
  evenement?: Evenement;
  params!: Params
  idEvenement!: number
  isValidAccessForEvent?: number
  emailInfo: Email = {
    to: [],
    subject: "",
    text: "Bla bla",
    rappel: false
  }
  qrcode!: string
  using_address!: string;



  dialog = inject(BootstrapModalService);

  constructor(
    public route: ActivatedRoute,
    private toastr: ToastService,
    public router: Router,
    public evenementService: EvenementService,
    private authService: AuthService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public configService: ConfigService,
    public mailService: MailService,
    public fileService: FileService,
    public sanitizer: DomSanitizer,
    public formBuilder: FormBuilder) { }


  ngOnInit() {
    this.mail = false;

    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.ouvrirConnexionDepuisFooter = this.route.snapshot.queryParamMap.get('connexion') === '1';

    if (this.authService.isAuthenticated()) {
      this.authorize = true;
      this.loadPage();
    } else if (this.ouvrirConnexionDepuisFooter) {
      this.authorizeAccess();
    } else {
      this.retourEvenement();
    }




  }



  loadPage() {
    console.log("loadpage");

    this.getParams();
    this.getEvenement(this.idEvenement);
    this.getBenevoles();
    this.getAllStands();

  }

  authorizeAccess(): void {
    if (this.connexionDialogOpen) {
      return;
    }
    this.connexionDialogOpen = true;
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true, disableClose: true, backdropClass: 'backdropBackground',
      data: {
        title: 'Accès mode gestionnaire',
        question: 'Saisissez vos identifiants administrateur :',
      },
    }).afterClosed().subscribe(result => {
      this.connexionDialogOpen = false;
      if (result === true) {
        this.authorize = true;
        this.loadPage();
      } else {
        this.router.navigate(['/' + this.idEvenement]);
      }
    });
  }

  private retourEvenement(): void {
    this.router.navigate(['/', this.idEvenement]);
  }

  logout(): void {
    this.authService.logout();
    this.authorize = false;
    this.retourEvenement();
  }


  getAllStands(): void {

    this.standService.getAll(this.idEvenement).subscribe({
      next: (stands: Stand[]) => {
        if (stands != null) {
          stands.forEach(stand => {
            const localStand: LocalStand = new LocalStand;
            localStand.nom = stand.nom
            localStand.benevoles = stand.croisements.flatMap(crois => crois.benevoles).flatMap(ben => ben.id)
            this.emailStands.push(localStand)
          })

          console.log(this.emailStands);


        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.error, 'Erreur');
      }
    })
  }


  getParams() {
    this.configService.getParams().subscribe({
      next: (params) => {
        console.log(params);

        this.params = params;
        this.getQRcode(this.idEvenement)
      },
      error: (error: HttpErrorResponse) => {


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
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }



  getQRcode(idEvenement: number): void {
    this.using_address = this.params.url + "#/" + idEvenement
    // With promises
    QRCode.toDataURL(this.using_address, { errorCorrectionLevel: 'H', width: 500 })
      .then((qrcode: string) => {
        this.qrcode = qrcode
      })
      .catch((err: any) => {
        console.error(err)
      })

  }




  update(evenement: Evenement): void {
    this.evenementService.update(evenement).subscribe({
      next: (data) => {
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }





  updateBlocage(evenement: Evenement) {

    evenement.lock = !evenement.lock
    this.evenementService.opening(this.idEvenement).subscribe({
      next: (data) => {
      evenement.lock = data
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }





  getBenevoles(): void {
    const benevolesWithChoice: LocalStand = new LocalStand;
    benevolesWithChoice.nom = "Les bénévoles AVEC au moins un choix"
    const benevolesWithoutChoice: LocalStand = new LocalStand;
    benevolesWithoutChoice.nom = "Les bénévoles SANS choix"
    const benevolesToChange: LocalStand = new LocalStand;
    benevolesToChange.nom = "Les bénévoles à positionner"
    const allBenevoles: LocalStand = new LocalStand;
    allBenevoles.nom = "Tous les bénévoles"

    this.benevoleService.getByEvenementId(this.idEvenement).subscribe(benevoles => {
      this.benevoles = benevoles;
      benevoles.forEach(benevole => {
        allBenevoles.benevoles.push(benevole.id);
        if (benevole.croisements.length > 0) {
          benevolesWithChoice.benevoles.push(benevole.id);
        }
        if (benevole.croisements.length == 0) {
          benevolesWithoutChoice.benevoles.push(benevole.id);
        }
        if (benevole.croisements) {
          benevole.croisements.forEach(croisement => {
            if (croisement.stand.type == 1 || croisement.stand.type == 3) {
              benevolesToChange.benevoles.push(benevole.id);
            }
          });
        }
      });

      this.emailStands.push(benevolesWithChoice)
      this.emailStands.push(benevolesWithoutChoice)
      this.emailStands.push(benevolesToChange)
      this.emailStands.push(allBenevoles)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  envoiMail() {
    if (this.emailInfo.to.length > 0) {
      this.mailService.sendMail(this.emailInfo)
        .subscribe(res => {
          this.toastr.success("Les " + this.emailInfo.to.length + " emails sont bien partis", 'Bravo');
        }, err => {
          this.toastr.error("Il y a eu un problème lors de l'envoi des mails", 'Erreur');
          console.log(err);
        });
    } else {
      this.toastr.error("Il faut choisir une mailing-liste avec au moins un bénévole", 'Erreur');
    }

  }



}
