
import { Component, OnInit } from '@angular/core';
import { ValidationService, BenevoleService, TransmissionService, EvenementService, FileService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { faQuestionCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})

export class ConnexionComponent implements OnInit {
  evenement: Evenement = new Evenement();
  new!: boolean;
  nouveau!: boolean;
  exist!: boolean;
  benevole!: Benevole;
  idEvenement!:number
  affiche!:string;
  affichageConception: boolean = false;
  faQuestionCircle=faQuestionCircle
  faEnvelope=faEnvelope
  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,

    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public transmissionService: TransmissionService,
    public validationService: ValidationService,
    public fileService: FileService,
    public sanitizer: DomSanitizer) { }

    subscription = new Subscription();


  ngOnInit() {


    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)
    this.getEvenement(this.idEvenement);
    this.getAffiche()
    this.validationService.testCommun(this.idEvenement).then(response => {
      if(!response){
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

  }

  getAffiche() {
    this.fileService.get(this.idEvenement, 'affiche.jpeg').subscribe(data => {
     this.affiche = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
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

  find(): void {
    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevole.email = this.benevole.email.trimEnd();
    this.benevole.email = this.benevole.email.trimStart();

    this.benevoleService.getByMail(this.benevole.email, this.idEvenement).subscribe(benevole => {
      if (benevole == null) {
        this.exist = false
        this.new = false;
      } else {
        localStorage.setItem('user', JSON.stringify(benevole));
        this.router.navigate(['/inscription/' + this.idEvenement]);
      }

    },
      error => {

        console.log('😢 Oh no!', error);
      });
  }


  subscribe(): void {
    this.nouveau = false;

    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevole.email = this.benevole.email.trimEnd();
    this.benevole.email = this.benevole.email.trimStart();
    
    this.benevoleService.add(this.benevole, this.idEvenement).subscribe(data => {

      localStorage.setItem('user', JSON.stringify(data))
      this.router.navigate(['/inscription/' + this.idEvenement]);
    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }


}