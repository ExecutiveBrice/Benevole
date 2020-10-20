
import { Component, OnInit } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Stand } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-gestionStands',
  templateUrl: './gestionStands.component.html',
  styleUrls: ['./gestionStands.component.css']
})

export class GestionStandsComponent implements OnInit {
  stands: Stand[];
  organumber:number;
  choix: string;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {

  }


  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));

    console.log(this.organumber)
    if (!this.organumber || isNaN(this.organumber) || this.organumber < 1) {
      this.router.navigate(['/error']);
    }


    this.stands = [];

    this.choix = "";
    this.getAll();

  }


  getAll(): void {
    console.log("find")
    this.standService.getAll().subscribe(data => {
      console.log(data)

      this.stands = data['stands'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }



  choixstand(nom: string) {
    if (this.choix != nom) {
      this.choix = nom
    } else {
      this.choix = null
    }
  }

}