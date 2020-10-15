import { Component } from '@angular/core';
import { User } from './models';
import { UserService, MailService, ConfigService } from './services';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { Email, Evenement } from './models';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {

    evenement : Evenement;
    utilisateur: User = null;
    retour: boolean = false;
    email: Email = {
        to: "",
        subject: "",
        text: ""
    }
    users: User[];
    mail: boolean;
    titleText:string;
    titleDate:string;
    planing:boolean;
    organumber: number;


    constructor(
        public configService:ConfigService,
        public mailService: MailService,
        public userService: UserService,
        public router: Router,
        public route: ActivatedRoute,
        private utilisateurService: UserService) {
    
    }

    ngOnInit() {

 

        this.evenement = new Evenement();
        this.mail = false;
        this.planing = false;
        this.users = [];
        this.getTexts();
        console.log('AppComponent')
        this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
        console.log("AppComponent"+this.organumber)
    }

    getEvenement() {
        this.userService.get().subscribe(res => {
            console.log(res['users']);
            this.users = res['users'];
        }, err => {
            console.log(err);
        });
    }


    envoiMail(email: Email) {
        this.users.forEach(user => {
            email.subject = "problème"
            email.to = user.email

            this.mailService.sendMail(email)
                .subscribe(res => {
                    console.log("this.api.sendMail");
                    console.log(res);
                }, err => {
                    console.log(err);
                });
        });

        this.mail = false;
    }

    



    getTexts() {
        this.configService.getParam("titleText").subscribe(res => {
          console.log(res['param'].value);
          this.titleText = res['param'].value;
        }, err => {
          console.log(err);
        });
        this.configService.getParam("titleDate").subscribe(res => {
          console.log(res['param'].value);
          this.titleDate = res['param'].value;
        }, err => {
          console.log(err);
        });
      }
}