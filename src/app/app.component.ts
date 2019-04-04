import { Component } from '@angular/core';
import { User, Benevole } from './models';
import { UserService, StandService,MailService, ConfigService } from './services';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { Email } from './models';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent {
    utilisateur: User = null;
    retour: boolean = false;
    email: Email = {
        to: "",
        subject: "",
        text: ""
      }
      users:any[];
    constructor(
        public mailService:MailService,
        public userService: UserService,
        public router: Router,
        public route: ActivatedRoute,
        private utilisateurService: UserService ) {

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
        this.mailService.sendMail(email)
          .subscribe(res => {
            console.log("this.api.sendMail");
            console.log(res);
          }, err => {
            console.log(err);
          });
      }
    logout() {
        console.log("appcomp logout")
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        this.utilisateur = null;
        this.router.navigate(['/login']);

    }



}