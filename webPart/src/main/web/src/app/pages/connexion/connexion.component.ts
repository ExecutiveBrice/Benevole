
import { Component, OnInit } from '@angular/core';
import { TransmissionService, ValidationService, BenevoleService, EvenementService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})

export class ConnexionComponent implements OnInit {
  evenement: Evenement;
  organumber: number;
  new: boolean;
  nouveau: boolean;
  exist: boolean;
  benevole: Benevole;
  affiche:string;

  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    public transmissionService: TransmissionService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public validationService: ValidationService,
    public sanitizer: DomSanitizer) { }

    subscription = new Subscription();
  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
    this.validationService.testCommun(this.organumber).then(response => {
      if(response){
        this.getAffiche(this.organumber);
      }else{
        this.router.navigate(['error']);
      }
    })
    .catch(err => {
      this.router.navigate(['error']);
    })

    this.benevole = new Benevole();
    this.exist = false;
    this.nouveau = false;
    this.new = true;
    console.log("numberTransmission"+this.organumber);
    this.transmissionService.numberTransmission(this.organumber);
  }


  getAffiche(organumber:number): void {
    this.evenementService.getAffiche(organumber).subscribe(affiche => {
      this.affiche = affiche;
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  find(): void {
    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevoleService.getByMail(this.benevole.email, this.organumber).subscribe(benevole => {
      if (benevole == null) {
        this.exist = false
        this.new = false;
      } else {
        localStorage.setItem('user', JSON.stringify(benevole));
        this.router.navigate(['/inscription/' + this.organumber]);
      }

    },
      error => {

        console.log('😢 Oh no!', error);
      });
  }


  subscribe(): void {
    this.nouveau = false;

    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevoleService.add(this.benevole, this.organumber).subscribe(data => {

      localStorage.setItem('user', JSON.stringify(data))
      this.router.navigate(['/inscription/' + this.organumber]);
    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }


}