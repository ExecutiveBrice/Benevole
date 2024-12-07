import { Component, OnInit } from '@angular/core';
import { TransmissionService, EvenementService, FileService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DatePipe, NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';

import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import 'moment/locale/fr';
import { ColorPickerModule } from 'ngx-color-picker';



@Component({
  selector: 'app-gestionMajConfig',
  standalone: true,
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
    // Moment can be provided globally to your app by adding `provideMomentDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideMomentDateAdapter(),
    EvenementService,
    FileService,
    ConfigService
  ],
  imports: [NgClass,
    DatePipe,
    FormsModule,
    ImageCropperComponent,
    RouterModule,ColorPickerModule ,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatCheckboxModule, MatSlideToggleModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],

  templateUrl: './gestionMajConfig.component.html',
  styleUrls: ['./gestionMajConfig.component.scss']
})

export class GestionMajConfigComponent implements OnInit {
  subscription = new Subscription();
  authorize: boolean = false;
  evenement: Evenement = new Evenement();
  idEvenement!: number
  logo!: string;


  readonly minDate = new Date();
  readonly maxDate = new Date(this.minDate.getFullYear() + 1, 11, 31);



  formulaireEvent = this.formBuilder.group({

    eventName: new FormControl(this.evenement.eventName, [Validators.required, Validators.minLength(2)]),
    contact: new FormControl(this.evenement.contact, [Validators.required, Validators.minLength(2)]),
    contactTel: new FormControl(this.evenement.contactTel, []),
    contactEmail: new FormControl(this.evenement.contactEmail, [Validators.required, Validators.minLength(2)]),
    endDate: new FormControl(this.evenement.endDate, [Validators.required]),
    sitepersourl: new FormControl(this.evenement.sitepersourl, [Validators.required, Validators.minLength(2)]),

    validation: new FormControl(this.evenement.validation, [Validators.required, Validators.minLength(2)]),
    retour: new FormControl(this.evenement.retour, [Validators.required, Validators.minLength(2)]),
    signature: new FormControl(this.evenement.signature, [Validators.required, Validators.minLength(2)]),
    rappel: new FormControl(this.evenement.rappel, [Validators.required, Validators.minLength(2)]),
    afficherMessage: new FormControl(this.evenement.afficherMessage, [Validators.required]),
    message: new FormControl(this.evenement.message, []),
    needtel: new FormControl(this.evenement.needtel, [Validators.required]),

    couleurFond: new FormControl(this.evenement.couleurFond, [Validators.required]),
    couleurBandeau: new FormControl(this.evenement.couleurBandeau, [Validators.required]),
    couleurText: new FormControl(this.evenement.couleurText, [Validators.required]),
    
    couleurTitre: new FormControl(this.evenement.couleurTitre, [Validators.required]),
    couleurBloc: new FormControl(this.evenement.couleurBloc, [Validators.required]),
  })


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public fileService: FileService,
    public sanitizer: DomSanitizer,
    public configService: ConfigService,
    public formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)


    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getEvenement(this.idEvenement);
      this.getLogo()
    }else{
       this.router.navigate([ this.idEvenement+'/gestion/']);
    }
  }



  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe(evenement => {
      this.evenement = evenement;
      this.transmissionService.dataTransmission(evenement);


      this.formulaireEvent.get("eventName")?.setValue(evenement.eventName);
      this.formulaireEvent.get("contact")?.setValue(evenement.contact);

      this.formulaireEvent.get("contactTel")?.setValue(evenement.contactTel);
      this.formulaireEvent.get("contactEmail")?.setValue(evenement.contactEmail);
      this.formulaireEvent.get("endDate")?.setValue(evenement.endDate);
      this.formulaireEvent.get("sitepersourl")?.setValue(evenement.sitepersourl);

      this.formulaireEvent.get("validation")?.setValue(evenement.validation);
      this.formulaireEvent.get("retour")?.setValue(evenement.retour);
      this.formulaireEvent.get("signature")?.setValue(evenement.signature);
      this.formulaireEvent.get("rappel")?.setValue(evenement.rappel);
      this.formulaireEvent.get("afficherMessage")?.setValue(evenement.afficherMessage);
      this.formulaireEvent.get("message")?.setValue(evenement.message);
      this.formulaireEvent.get("needtel")?.setValue(evenement.needtel);

      this.formulaireEvent.get("couleurFond")?.setValue(evenement.couleurFond);
      this.formulaireEvent.get("couleurBandeau")?.setValue(evenement.couleurBandeau);
      this.formulaireEvent.get("couleurText")?.setValue(evenement.couleurText);
      
      this.formulaireEvent.get("couleurTitre")?.setValue(evenement.couleurTitre);
      this.formulaireEvent.get("couleurBloc")?.setValue(evenement.couleurBloc);
      console.log(this.formulaireEvent)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  update(): void {

    let evenement = Object.assign(this.evenement, this.formulaireEvent.value)

    this.evenementService.update(evenement).subscribe(data => {
      this.evenement = data;
    },
      error => {
        console.log('😢 Oh no!', error);
      });
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
    this.fileService.update(this.idEvenement, 'logo.jpeg', contentFile).subscribe(data => {
      console.log(data)
      this.imageChangedEvent = undefined
      this.croppedImage = '';
      this.getLogo()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getLogo() {
    this.fileService.get(this.idEvenement, 'logo.jpeg').subscribe(data => {
      this.logo = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}