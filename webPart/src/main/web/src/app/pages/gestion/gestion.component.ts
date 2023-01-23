
import { Component, OnInit } from '@angular/core';
import { ValidationService, TransmissionService, CroisementService, EvenementService, StandService, MailService, ExcelService, BenevoleService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Email, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode'
import { ImageCroppedEvent } from 'ngx-image-cropper';



@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnInit {
  subscription = new Subscription()
  authorize: boolean = false;
  rappel;
  benevoles: Benevole[] = [];
  benevolesWithChoice: Benevole[] = [];
  benevolesWithoutChoice: Benevole[] = [];
  benevolesToChange: Benevole[] = [];
  dateRappel: string;
  mail: boolean;
  theCheckbox: any
  selectedDeviceObj: any
  evenement: Evenement
  params: Map<string, string>
  idEvenement: number
  emailInfo: Email = {
    to: "",
    subject: "",
    text: "Bla bla"
  }
  qrcode: Blob
  using_address: String;
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



  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public excelService: ExcelService,
    public mailService: MailService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.params = JSON.parse(localStorage.getItem('allParams'));

    this.rappel = false;
    this.mail = false;

    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id'))

    this.getEvenement(this.idEvenement);
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getQRcode(this.idEvenement)
      this.getBenevoles();
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

  valider(password: string) {

    this.validationService.testGestion(this.idEvenement, password).then(response => {
      console.log(response)
      this.authorize = response;
      if (response) {
        this.getQRcode(this.idEvenement)
        this.getBenevoles();
      } else {
        this.router.navigate(['error']);
      }
    })
      .catch(err => {
        console.error(err)
        this.router.navigate(['error']);
      })
  }

  getQRcode(idEvenement: number): void {

    this.using_address = this.params['url'] + "/" + idEvenement
    // With promises
    QRCode.toDataURL(this.using_address)
      .then(url => {
        this.qrcode = url
      })
      .catch(err => {
        console.error(err)
      })
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
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
  uploadImage(croppedImage: any) {
    this.evenement.affiche = croppedImage

    this.evenementService.updateAffiche(this.idEvenement, croppedImage).subscribe(data => {
      this.evenement = data;
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }




  async exportAsXLSX() {
    var promises = []
    var standsLite = []

    this.standService.getAll(this.idEvenement).subscribe(stands => {
      stands.forEach(stand => {
        stand.croisements = []
        promises.push(new Promise((resolve, reject) => {
          this.croisementService.getByStand(stand.id).subscribe(croisements => {

            stand.croisements = croisements


            let standLite = {
              nom: "",
              creneaux: []
            };
            standLite.nom = stand.nom.slice(0, 30);
            standLite.creneaux = [];

            for (let indexR = 0; indexR < 100; indexR++) {
              let creneau = {};

              if (stand.croisements != null && stand.croisements.length > 0) {
                stand.croisements.sort(function (a, b) { return a.creneau.ordre - b.creneau.ordre; })
                for (let index = 0; index < stand.croisements.length; index++) {
                  const croisement = stand.croisements[index];
                  creneau[croisement.creneau.plage] = "";
                  if (croisement.benevoles[indexR]) {
                    creneau[croisement.creneau.plage] = croisement.benevoles[indexR].nom + " " + croisement.benevoles[indexR].prenom;
                  }
                }
                standLite.creneaux.push(creneau);
              }
            }

            standsLite.push(standLite)
            resolve("Completed " + standLite.nom)
          },
            error => {
              console.log('😢 Oh no!', error);
              reject()
            })
        }))

      });

      Promise.all(promises)
        .then(data => {
          this.excelService.multiExportAsExcelFile(standsLite, 'Stands');
        });

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


  updateDateRappel() {
    this.evenement.rappelDate = new Date()
    this.update(this.evenement)
  }


  updateBlocage() {
    this.evenement.lock = !this.evenement.lock
    this.evenementService.opening(this.idEvenement).subscribe(data => {
      this.evenement.lock = data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getMailingList(option): void {
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
      if (benevoles) {
        this.benevoles = benevoles;

        benevoles.forEach(benevole => {
          benevole.croisements = []
          this.croisementService.getByBenevole(benevole.id).subscribe(croisements => {
            if (croisements != null) {
              benevole.croisements = croisements

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
            } else {
              this.benevolesWithoutChoice.push(benevole);
            }
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



  envoiMail(email: Email) {
    this.mail = false;
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




      this.mailService.sendMail(emailCopy)
        .subscribe(res => {
        }, err => {
          console.log(err);
        });
    })
    this.rappel = false;
    this.mailingList = [];
    this.updateDateRappel()
  }


  toggleVisibility(e) {
    this.rappel = e.target.checked;
  }



}