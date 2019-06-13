
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { CroisementService, StandService, MailService, ExcelService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';


@Component({
  selector: 'app-gestionBenevoles',
  templateUrl: './gestionBenevoles.component.html',
  styleUrls: ['./gestionBenevoles.component.css']
})

export class GestionBenevolesComponent implements OnChanges {

  croisements: Croisement[];
  benevoles: Benevole[];
  choix: string;
  email: Email = {
    to: "",
    subject: "",
    text: ""
  }


  constructor(public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public excelService: ExcelService,
    public sanitizer: DomSanitizer) {
    this.benevoles = [];
    this.croisements = [];
    this.choix = "";
    this.find();
    this.getCroisement();
  }

  ngOnChanges() {

  }

  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.benevoles, 'sample');
  }

  find(): void {
    console.log("find")
    console.log(this.benevoles)
    this.benevoleService.getAll().subscribe(data => {
      console.log("data")
      console.log(data)
      this.benevoles = data['benevoles'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  choisir(benevole: Benevole, benecroisement: Croisement, croisement: Croisement): void {
    if (benecroisement.id) {
      for (let index = 0; index < benevole.Croisements.length; index++) {
        if (benecroisement.id == benevole.Croisements[index].id) {
          benevole.Croisements.splice(index, 1);
          break;
        }
      }
    }

    benevole.Croisements.push(croisement);
    this.addCroisements(benevole);
  }

  addCroisements(benevole): void {
    console.log("addCroisements")
    console.log(benevole)
    this.benevoleService.addCroisements(benevole).subscribe(data => {
      console.log("data")
      console.log(data)
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  getCroisement(): void {
    this.croisementService.getAll().subscribe(data => {
      this.croisements = data['croisements']
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  send(benevole:Benevole){
      this.benevoleService.updateReponse(benevole).subscribe(data => {
        console.log(data)

        this.email.to = benevole.email
        this.email.subject = "Réponse au commentaire de la fête de l'école"
        this.email.text = "Vous nous aviez communiqué que :<br>";
 
        this.email.text =  this.email.text + benevole.commentaire + "<br>"

        this.email.text =  this.email.text + "<br>Notre réponse :<br>"

        this.email.text =  this.email.text + benevole.reponse + "<br>"

        this.email.text =  this.email.text + "<br>Vous pourrez bien entendu retrouver cette réponse sur <a href='https://ouchedinier.herokuapp.com'>le site d'inscription</a><br>Cordialement,<br>L'équipe d'animation"
        this.envoiMail(this.email)
      },
        error => {
          console.log('😢 Oh no!', error);
        });
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