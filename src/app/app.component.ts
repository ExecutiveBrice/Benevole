import { Component } from '@angular/core';
import { User, Benevole } from './models';
import { UserService, StandService, MailService, ConfigService } from './services';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { Email } from './models';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {
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
    constructor(
        public configService:ConfigService,
        public mailService: MailService,
        public userService: UserService,
        public router: Router,
        public route: ActivatedRoute,
        private utilisateurService: UserService) {
        this.mail = false;
        this.users = [];
        this.getTexts();
        console.log('AppComponent')
        if (JSON.parse(localStorage.getItem('userId'))) {
            this.utilisateur = {
                name: JSON.parse(localStorage.getItem('userId')),
                email: "",
                password: ''
            };
        }

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                console.log((<NavigationEnd>event).url)
                if ((<NavigationEnd>event).url == '/dashboard' || (<NavigationEnd>event).url == '/') {
                    this.retour = false;
                } else {
                    this.retour = true;
                }
            }
        });

        utilisateurService.utilisateurSource$.subscribe(
            data => {
                if (data != undefined) {
                    this.utilisateur = data;
                }
            });
        this.utilisateurService.sourceUtilisateur(this.utilisateur);

        this.getContacts();
    }

    ngOnInit() {

    }
    getContacts() {
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

    
    logout() {
        console.log("appcomp logout")
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        this.utilisateur = null;
        this.router.navigate(['/login']);

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