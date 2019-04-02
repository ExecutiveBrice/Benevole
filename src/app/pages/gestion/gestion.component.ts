
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
  emailText1: string;
  emailText2: string;

  constructor(public benevoleService: BenevoleService,
    public configService: ConfigService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;

    this.getParam("lock",this.bloque)
  }

  ngOnChanges() {

  }

  getParam(param: string, paramvalue: string) {
    return this.configService.getParam(param).subscribe(res => {
      console.log(res)
      paramvalue = res;
    })
  }

  updateBloque(bloque) {
    console.log("updateBloque1");
   
    console.log(bloque);
    if (bloque == "true") {
      bloque = "false";
    } else {
      bloque = "true";
    }
    console.log("updateBloque2");
    console.log(bloque);
    this.configService.updateParam('lock', bloque)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });

  }

  envoiRappel() {
    let email: Email = {
      to: "",
      subject: "Rappel de participation",
      text: ""
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