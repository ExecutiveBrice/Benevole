import { Component, OnInit } from '@angular/core';
import { ValidationService, TransmissionService, EvenementService } from '../../services';
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
  organumber: number;
  evenement: Evenement;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent'))==this.organumber?true:false;
    if(this.authorize){
      this.getEvenement(this.organumber)
    }else{
      this.router.navigate(['/gestion/' + this.organumber]);
    }
  }

  getEvenement(organumber: number): void {
    this.evenementService.getById(organumber).subscribe(data => {
      this.transmissionService.dataTransmission(data);
      this.evenement = data;
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
    this.evenement.sitepersologo = croppedImage
    this.update(this.evenement)
  }
  
}