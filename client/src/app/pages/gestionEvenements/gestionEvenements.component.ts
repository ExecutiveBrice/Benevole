
import { Component, OnInit } from '@angular/core';
import { ValidationService, EvenementService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderByPipe } from "../../services/sort.pipe";

@Component({
    selector: 'app-gestionEvenements',
    standalone: true,
    templateUrl: './gestionEvenements.component.html',
    styleUrls: ['./gestionEvenements.component.scss'],
    imports: [NgClass,
        FontAwesomeModule,
        FormsModule,
        DatePipe,
        RouterModule, OrderByPipe],
        providers: [
          EvenementService,
          ValidationService,
          ConfigService
        ],
})

export class GestionEvenementsComponent implements OnInit {

  subscription = new Subscription()
  authorize: boolean = false;
  evenements!: Evenement[];
  choix!: number;
  params!: Map<string, string>
  password!: string;


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public configService: ConfigService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.params = JSON.parse(localStorage.getItem('allParams')!);
    this.evenements = [];

    localStorage.removeItem('isGestion');
    localStorage.removeItem('isValidAccessForEvent');

    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!)==0?true:false;
    if(this.authorize){
      this.getAllEvenements();
    }
  }

  valider(password: string) {
    this.validationService.testGestion(0, password).then(response => {
      console.log(response)
      this.authorize = response;
      if(response){
        this.getAllEvenements();
      }
    })
    .catch(err => {
      console.error(err)
    })

  }

  goToGestion(evenement: Evenement) {
    this.router.navigate(['/gestion/' + evenement.id]);
  }

  choixEvenement(id: number) {
    if (this.choix != id) {
      this.choix = id
    } else {
      this.choix = 0
    }
  }

  update(evenement: Evenement): void {
    this.evenementService.update(evenement).subscribe(data => {
      this.getAllEvenements()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  delete(evenement: Evenement): void {
    this.evenementService.delete(evenement).subscribe(data => {
      this.getAllEvenements()
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  getAllEvenements(): void {
    this.evenementService.getAll().subscribe(data => {
      this.evenements = data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

}