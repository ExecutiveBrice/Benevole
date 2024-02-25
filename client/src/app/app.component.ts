import { Component, ElementRef, ViewChild } from '@angular/core';
import { EvenementService, MailService, ConfigService, FileService } from './services';
import { Router, ActivatedRoute } from '@angular/router';
import { Benevole, Evenement } from './models';
import { Subscription } from 'rxjs';
import { TransmissionService } from './services/transmission.service';

@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  subscription = new Subscription()
  retour: boolean = false;
  canSendAlerte: boolean
  mail: boolean;
  titleText: string;
  titleDate: string;
  planing: boolean;
  evenement: Evenement;
  isValidAccessForEvent: number
  benevole: Benevole
  params: Map<string, string>
  logo: string;

  @ViewChild('myIdentifier')
  myIdentifier: ElementRef;

  constructor(
    public transmissionService: TransmissionService,
    public mailService: MailService,
    public evenementService: EvenementService,
    public configService: ConfigService,
    public router: Router,
    public fileService: FileService,
    public route: ActivatedRoute) {

  }


  ngAfterViewChecked() {
    var width = this.myIdentifier.nativeElement.offsetWidth;
    var height = this.myIdentifier.nativeElement.offsetHeight;
    //console.log('Width:' + width);
    //console.log('Height: ' + height);
  }


  ngOnInit() {
    this.getParams()
    this.mail = false;
    this.planing = false;

    this.subscription = this.transmissionService.dataStream.subscribe(data => {
      this.evenement = data
      console.log(JSON.parse(localStorage.getItem('isValidAccessForEvent')))
      console.log(data.id == JSON.parse(localStorage.getItem('isValidAccessForEvent')))
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent'));

      console.log(this.evenement.id == this.isValidAccessForEvent)
      this.benevole = JSON.parse(localStorage.getItem('user'));
      this.getLogo()
    });

  }

  getLogo() {
    this.fileService.get(this.evenement.id, 'logo.jpeg').subscribe(data => {
      this.logo = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getParams() {
    this.configService.getParams().subscribe(allParams => {
      this.params = allParams
      localStorage.setItem('allParams', JSON.stringify(allParams))
    }, err => {
      //this.router.navigate(['error']);
    })
  }

}