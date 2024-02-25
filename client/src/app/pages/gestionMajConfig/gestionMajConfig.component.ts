import { Component, OnInit } from '@angular/core';
import { ValidationService, TransmissionService, EvenementService, FileService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-gestionMajConfig',
  templateUrl: './gestionMajConfig.component.html',
  styleUrls: ['./gestionMajConfig.component.css']
})

export class GestionMajConfigComponent implements OnInit {
  subscription = new Subscription();
  authorize: boolean = false;
  evenement: Evenement = new Evenement();
  idEvenement:number
  logo: string;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public validationService: ValidationService,
    public fileService: FileService,
    public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id'))
    this.getEvenement(this.idEvenement);
    this.getLogo()
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.idEvenement?true:false;
    if(!this.authorize){
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

  update(evenement: Evenement): void {
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


  uploadImage(croppedImage: any) {
    const contentFile = croppedImage.replace("data:image/jpeg;base64,", "")
    this.fileService.update(this.idEvenement, 'logo.jpeg', contentFile).subscribe(data => {
      console.log(data)
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