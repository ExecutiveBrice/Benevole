
import { Component, inject, OnInit } from '@angular/core';
import { TransmissionService, CroisementService, EvenementService, StandService, MailService, BenevoleService, FileService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Email, Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode'
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalConnexionComponent } from '../../components/modalConnexion/modalConnexion.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { OrderByPipe } from '../../services/sort.pipe';
import { Params } from '../../models/params';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [NgClass,
    FormsModule,
    ImageCropperComponent,
    RouterModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
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

  authorize: boolean = false
  rappel!: boolean
  password!: string
  affiche!: string;
  benevoles: Benevole[] = [];
  benevolesWithChoice: Benevole[] = []
  benevolesWithoutChoice: Benevole[] = [];
  benevolesToChange: Benevole[] = [];
  dateRappel!: string;
  mail!: boolean;
  sendingProgress!: boolean;
  counter!: number;
  totalCount!: number;
  errorMailingList!: String[];
  theCheckbox: any
  selectedDeviceObj: any
  evenement?: Evenement;
  params!: Params
  idEvenement!: number
  isValidAccessForEvent?: number
  emailInfo: Email = {
    to: "",
    subject: "",
    text: "Bla bla"
  }
  qrcode!: string
  using_address!: string;
  mailingList: Benevole[] = [];
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


  dialog = inject(MatDialog);

  constructor(
    public route: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public evenementService: EvenementService,
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
    this.params = JSON.parse(localStorage.getItem('allParams')!);

    this.rappel = false;
    this.mail = false;

    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)


    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.loadPage()
    } else {
      this.authorizeAccess()
    }




  }



  loadPage() {
    console.log("loadpage");
    
    this.getParams();
    this.getEvenement(this.idEvenement);
    this.getBenevoles();
    this.getAffiche();
  }

  authorizeAccess(): void {
    this.dialog.open(ModalConnexionComponent, {
      hasBackdrop: true, disableClose: true, backdropClass: 'backdropBackground',
      data: {
        title: 'Accès mode gestionnaire',
        question: 'Saisissez le mot de passe de l\'évènement :',
      },
    }).afterClosed().subscribe(result => {
      if (result instanceof FormGroup) {
        this.evenementService.isAuthorize(this.idEvenement, result.get('passwood')?.value).subscribe({
          next: (data) => {
            console.log(data);
            this.authorize = data;
            localStorage.setItem('isValidAccessForEvent', JSON.stringify(this.idEvenement));
            this.loadPage()
          },
          error: (error: HttpErrorResponse) => {
            this.router.navigate(['/' + this.idEvenement]);
            this.toastr.error("Mot de passe incorect", 'Erreur');
          }
        })
      } else {
        this.router.navigate(['/' + this.idEvenement]);
      }
    });
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
    this.evenementService.getById(idEvenement).subscribe(data => {
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  getQRcode(idEvenement: number): void {
    this.using_address = this.params.url+"#/" + idEvenement
    // With promises
    QRCode.toDataURL(this.using_address, { errorCorrectionLevel: 'H', width: 500 })
      .then((qrcode: string) => {
        this.qrcode = qrcode
      })
      .catch((err: any) => {
        console.error(err)
      })

  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    console.log(event)
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    /* show cropper */
  }
  cropperReady() {
    /* cropper ready */
  }
  loadImageFailed() {
    /* show message */
  }

  uploadImage() {
    const contentFile = this.croppedImage.replace("data:image/jpeg;base64,", "")
    this.fileService.update(this.idEvenement, 'affiche.jpeg', contentFile).subscribe(data => {
      console.log(data)
      this.croppedImage = '';
      this.getAffiche()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getAffiche() {
    this.fileService.get(this.idEvenement, 'affiche.jpeg').subscribe(data => {
      this.affiche = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(evenement: Evenement): void {
    this.evenementService.update(evenement).subscribe(data => {
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  updateDateRappel(evenement: Evenement) {

    evenement.rappelDate = new Date()
    this.update(evenement)
  }


  updateBlocage(evenement: Evenement) {

    evenement.lock = !evenement.lock
    this.evenementService.opening(this.idEvenement).subscribe(data => {
      evenement.lock = data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getMailingList(option: { id: number; }): void {
    if (option.id == 1) {
      this.mailingList = this.benevoles
    } else if (option.id == 2) {
      this.mailingList = this.benevolesWithChoice
    } else if (option.id == 3) {
      this.mailingList = this.benevolesWithoutChoice
    }
  }



  getBenevoles(): void {
    this.benevoleService.getByEvenementId(this.idEvenement).subscribe(benevoles => {

      this.benevoles = benevoles;
      benevoles.forEach(benevole => {
        if (benevole.croisements.length > 0) {
          this.benevolesWithChoice.push(benevole);
        }
        if (benevole.croisements.length == 0) {
          this.benevolesWithoutChoice.push(benevole);
        }
        if (benevole.croisements) {
          benevole.croisements.forEach(croisement => {
            if (croisement.stand.type == 1 || croisement.stand.type == 3) {
              this.benevolesToChange.push(benevole);
            }
          });
        }
      });

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  envoiMail(email: Email, evenement:Evenement) {
    this.mail = false;
    this.errorMailingList = []
    this.sendingProgress = true;
    this.counter = 0;
    this.totalCount = this.mailingList.length;
    email.text = email.text.replace(/\n/g, "<br>");

    this.mailingList.forEach(benevole => {
      let emailCopy = JSON.parse(JSON.stringify(email))
      emailCopy.to = benevole.email
      if (this.rappel) {
        emailCopy.text = emailCopy.text + "<br><br>N'oubliez pas que vous vous êtes inscrit en tant que bénévole pour:<br>";
        benevole.croisements.sort((a, b) => (a.creneau.ordre > b.creneau.ordre) ? 1 : ((b.creneau.ordre > a.creneau.ordre) ? -1 : 0));
        benevole.croisements.forEach(croisement => {
          emailCopy.text = emailCopy.text + (croisement.stand.nom == "tous" ? "N'importe quel stand" : croisement.stand.nom) + " - " + croisement.creneau.plage + "<br>"
        })

      }

      emailCopy.text = emailCopy.text + "<br />"
      emailCopy.text = emailCopy.text + "Comme précisé dans l'adresse mail, il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement :<br />";
      emailCopy.text = emailCopy.text + evenement.contact + " - " + evenement.contactEmail + "<br />"

      this.mailService.sendMail(emailCopy)
        .subscribe(res => {
          this.counter++
        }, err => {
          this.errorMailingList.push(benevole.email)
          console.log(err);
        });
    })
    this.rappel = false;
    this.mailingList = [];
    this.updateDateRappel(evenement)
  }


  toggleVisibility(e: { target: { checked: boolean; }; }) {
    this.rappel = e.target.checked;
  }



}