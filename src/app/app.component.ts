import { Component } from '@angular/core';
import { User } from './models';
import { UserService, StandService } from './services';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';


@Component({
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent {
    utilisateur: User = null;
    retour: boolean = false;
    constructor(
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

    logout() {
        console.log("appcomp logout")
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        this.utilisateur = null;
        this.router.navigate(['/login']);

    }
}