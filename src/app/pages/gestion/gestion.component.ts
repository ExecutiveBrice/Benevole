
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnChanges {
  rappel: boolean;
  bloque: string;
  emailText: string;

  constructor(public benevoleService: BenevoleService,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;
    this.emailText = "Bonjour,\nCe 29 juin se déroule la fête de l'école de l'Ouche Dinier.\nVous vous êtes inscrit en tant que bénévole pour:\n";
    this.getParam("lock", this.bloque)
  }

  ngOnChanges() {

  }

  getParam(param: string, value: string) {
    this.configService.getParam(param).subscribe(res => {
      console.log(param);
      console.log(res);
      console.log(res['param'].value);
      value = res['param'].value;
    }, err => {
      console.log(err);
   });
  }

  updateBloque() {
    if (this.bloque == "true") {
      console.log("true to false")
      this.bloque = "false";
    } else {
      console.log("false to true")
      this.bloque = "true";
    }
    this.configService.updateParam('lock', this.bloque)
      .subscribe(res => {
        console.log("lock");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  envoiRappel(emailText: string) {
    let email: Email = {
      to: "",
      subject: "Rappel de participation",
      text: emailText
    }

    this.mailService.rappel(email)
      .subscribe(res => {
        console.log("this.api.sendMail");
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
}