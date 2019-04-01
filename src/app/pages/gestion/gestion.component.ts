
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})

export class GestionComponent implements OnChanges {
  rappel: boolean;
  email: Email = {
    to: "",
    subject: "",
    text: ""
  }


  constructor(public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {
    this.rappel = false;
    this.email.text = "Bonjour,\nCe 29 juin se déroule la fête de l'école de l'Ouche Dinier.\nVous vous êtes inscrit en tant que bénévole pour:\n";
  }

  ngOnChanges() {

  }
  bloquage() {

  }

  envoiRappel(benevole:Benevole) {

    this.email.to = benevole.email
    this.email.subject = "Rappel de participation"
    this.email.text = "Bonjour,\nCe 29 juin se déroule la fête de l'école de l'Ouche Dinier.\nVous vous êtes inscrit en tant que bénévole pour:\n";
    benevole.Croisements.forEach(croisement => {
      this.email.text = this.email.text + croisement.Stand.nom + " - " + croisement.Creneau.plage + "\n"
    });
    this.email.text = this.email.text + benevole.gateaux +"\n"
    this.envoiMail(this.email)
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
}