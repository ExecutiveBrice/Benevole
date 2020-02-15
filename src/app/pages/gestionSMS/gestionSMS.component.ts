
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


  constructor(
    public smsService: SMSService,
    public sanitizer: DomSanitizer) {

  }

  ngOnChanges() {

  }

  send(sms): void {
    console.log(sms);

    let numeros = sms.numeros.split(";")

    numeros.forEach(num => {


      this.smsService.send(num, sms.message).subscribe(data => {
        console.log(data)

      },
        error => {
          console.log('😢 Oh no!', error);
        });

    });


  }


}