
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { SMSService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau } from '../../models';



@Component({
  selector: 'app-gestionSMS',
  templateUrl: './gestionSMS.component.html',
  styleUrls: ['./gestionSMS.component.css']
})

export class GestionSMSComponent implements OnChanges {

  sms = {
    numeros: "",
    message: ""
  }
  smsList = []

  constructor(
    public smsService: SMSService,
    public sanitizer: DomSanitizer) {

  }

  ngOnChanges() {

  }

  send(sms): void {
    console.log(sms);
    this.smsList = [];
    let numeros = sms.numeros.split(";")

    numeros.forEach(num => {


      this.smsService.send(num, sms.message).subscribe(data => {
        console.log(data)
        this.smsList.push({numero : num,resultat : "OK"})
        console.log(this.smsList)
      },
        error => {
          this.smsList.push({numero : num,resultat : "ERREUR"})
          console.log('😢 Oh no!', error);
        });

    });


  }


}