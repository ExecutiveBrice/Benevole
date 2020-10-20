
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Config } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-gestionMajConfig',
  templateUrl: './gestionMajConfig.component.html',
  styleUrls: ['./gestionMajConfig.component.css']
})

export class GestionMajConfigComponent implements OnInit {
 
  organumber:number;

  configs: Config[] = [

      {
        "param": "erreur1",
        "value": "Le site est bloqué pour le moment",
        "createdAt": null,
        "updatedAt": null
      },
      {
        "param": "erreur2",
        "value": "Veuillez revenir ultérieurement",
        "createdAt": null,
        "updatedAt": null
      },
      {
        "param": "titleDate",
        "value": "Planning du 29 Juin 2019",
        "createdAt": null,
        "updatedAt": null
      },
      {
        "param": "validation1",
        "value": "Votre participation à bien été prise en compte  <br>\n<br>",
        "createdAt": null,
        "updatedAt": null
      },
      {
        "param": "validation2",
        "value": "<br><br>Vous pouvez revenir à tout moment pour modifier vos choix en vous connectant sur <a href=\"https://ouchedinier.herokuapp.com\">le site d'inscription</a>   à l'aide de votre adresse e-mail.<br><br>\nCordialement,<br>\nL'équipe d'animation",
        "createdAt": null,
        "updatedAt": null
      },
      {
        "param": "titleText",
        "value": "Carnaval de l'Ouche Dinier",
        "createdAt": null,
        "updatedAt": "2020-02-09"
      },
      {
        "param": "rappel2",
        "value": "Vous pouvez revenir à tout moment pour modifier vos choix en vous connectant sur <a href=\"https://ouchedinier.herokuapp.com\">le site d'inscription</a>   à l'aide de votre adresse e-mail. Cordialement,L'équipe d'animation",
        "createdAt": null,
        "updatedAt": "2020-02-09"
      },
      {
        "param": "lock",
        "value": "true",
        "createdAt": null,
        "updatedAt": "2020-10-10"
      },
      {
        "param": "rappel1",
        "value": "Bonjour, \nL'équipe d'animation de l'ALOD vous rappel que :\nCe 29 juin se déroule la fête de l'école de l'Ouche Dinier.\n",
        "createdAt": null,
        "updatedAt": "2019-04-02"
      },
      {
        "param": "dateRappel",
        "value": "3/6/2019 à 16:2",
        "createdAt": null,
        "updatedAt": "2019-07-03"
      }
    ]

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));

    console.log(this.organumber)
    if (!this.organumber || isNaN(this.organumber) || this.organumber < 1) {
      this.router.navigate(['/error']);
    }


    this.getAll();
  }


  getAll(): void {
    console.log("getAll")
    this.configService.getAll().subscribe(data => {
      console.log(data)
      this.configs = data['configs'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(config:Config): void {
    console.log("update")
    this.configService.updateParam(config).subscribe(data => {
      console.log(data)
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

}