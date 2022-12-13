import { Component } from '@angular/core';
import { EvenementService, MailService, ConfigService } from './services';
import { Router, ActivatedRoute } from '@angular/router';
import { Benevole, Email, Evenement } from './models';
import { Subscription } from 'rxjs';
import { TransmissionService } from './services/transmission.service';

@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  subscription = new Subscription()
  evenement: Evenement
  retour: boolean = false;

  mail: boolean;
  titleText: string;
  titleDate: string;
  planing: boolean;

  isGestion: boolean
  canSendAlerte: boolean
  benevole: Benevole
  params: Map<string, string>


  constructor(
    public transmissionService: TransmissionService,
    public mailService: MailService,
    public evenementService: EvenementService,
    public configService: ConfigService,
    public router: Router,
    public route: ActivatedRoute) {
      this.evenement = new Evenement()
      this.isGestion = false;
  }

  ngOnInit() {
    this.getParams()
    this.mail = false;
    this.planing = false;

    this.router.events.subscribe((url: any) => {

      if (url.routerEvent) {
        if (url.routerEvent.url.indexOf("inscription") > -1) {
          this.canSendAlerte = true
        } else {
          this.canSendAlerte = false
        }
      }
    });

    this.subscription = this.transmissionService.numberStream.subscribe(data => {
      console.log("transmissionService")
      this.getEvenement(data)
      this.isGestion = JSON.parse(localStorage.getItem('isGestion'))?true:false;
      this.benevole = JSON.parse(localStorage.getItem('user'));
    });

  }

  getEvenement(organumber: number): void {

    this.evenementService.getById(organumber).subscribe(data => {
      this.evenement = data;
      console.log(this.evenement)
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
      this.router.navigate(['errror']);
    })
  }

  envoiMail(text: string) {
    var email: Email = {
      to: "",
      subject: "",
      text: ""
    }

    var managing_address = this.params['url'] + "/gestion/" + this.evenement.id
    email.subject = "problème"
    email.to = this.evenement.contactEmail
    email.text = text + "<br /><br />Message venant de " + this.benevole.prenom + " " + this.benevole.nom
    email.text = email.text + "<br />Message venant de " + this.benevole.email

    email.text = email.text + "<br /><br />" + managing_address

    this.mailService.sendMail(email)
      .subscribe(res => {

      }, err => {

      });
    this.mail = false;
    text = ""
  }

  getLogo(organumber:number): void {
    this.evenementService.getLogo(organumber).subscribe(logo => {

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}