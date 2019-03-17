import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import QRCode from 'qrcode'

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.css']
})

export class CreationComponent implements OnInit {

  qrcode: Blob
  using_address
  managing_address
  evenement: Evenement = {
    contactEmail: "machin@truncate.com",
    contact: "Truc BIDUL",
    contactTel: "06 00 00 00",
    endDate: new Date(),
    eventName: "Ma fête à moi",
    id: 0,
    password: "facil",
    startDate: new Date()
  };
  new: boolean;
  ok: boolean;

  constructor(
    public configService: ConfigService,
    public sanitizer: DomSanitizer) { }


  ngOnInit() {

    this.new = true;
    this.ok = true;
  }


  create(evenement: Evenement): void {
    this.new = false
    this.ok = true
    evenement.id = 486
    this.using_address ="https://www.alod.fr/connexion/" + evenement.id
      this.managing_address ="https://www.alod.fr/gestion/" + evenement.id
      // With promises
      QRCode.toDataURL(this.using_address)
        .then(url => {
          this.qrcode = url
          console.log(url)
        })
        .catch(err => {
          console.error(err)
        })

    this.configService.create(evenement).subscribe(data => {
      console.log(data)




    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

}