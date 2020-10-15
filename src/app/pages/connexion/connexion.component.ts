
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})

export class ConnexionComponent implements OnInit {

  organumber: number;
  new: boolean;
  validation: boolean;
  nouveau: boolean;
  exist: boolean;
  benevole: Benevole;


  constructor(public benevoleService: BenevoleService,
    public route: ActivatedRoute,
    public router: Router,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) { }


  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));
    console.log(this.organumber)
    if (!this.organumber || isNaN(this.organumber) || this.organumber < 1) {
      this.router.navigate(['error']);
    }

    this.benevole = new Benevole();
    this.validation = false;
    this.exist = false;
    this.nouveau = false;
    this.new = true;
    this.bloquage();
  }

  bloquage() {
    this.configService.getParam('lock')
      .subscribe(res => {
        console.log("lock");
        console.log(res['param'].value);
        if (res['param'].value == "true") {
          this.router.navigate(['/404']);
        }
      }, err => {
        console.log(err);
      });
  }


  find(): void {
    console.log("find")
    console.log(this.benevole)
    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevoleService.getByMailLite(this.benevole.email).subscribe(data => {
      console.log("data")
      console.log(data)

      localStorage.setItem('user', JSON.stringify(data));
    },
      error => {
        this.exist = false
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }


  subscribe(): void {
    this.nouveau = false;
    console.log("subscribe")
    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevoleService.add(this.benevole).subscribe(data => {
      console.log("data")
      console.log(data)
      this.benevole.id = data['benevole'];
      this.benevole.Croisements = [];
      this.exist = true;

    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }


  update(): void {
    console.log("update")
    console.log(this.benevole)
    this.benevole.email = this.benevole.email.toLowerCase();
    this.benevoleService.update(this.benevole).subscribe(data => {
      console.log("data")
      console.log(data)
      this.exist = true;

    },
      error => {
        this.exist = false;
        this.new = false;
        console.log('😢 Oh no!', error);
      });
  }

}