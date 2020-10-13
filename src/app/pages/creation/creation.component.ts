import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Event } from '../../models';



@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.css']
})

export class CreationComponent implements OnInit{


  evenement: Event;
  new: boolean;
  ok: boolean;

  constructor(
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {

  }


  ngOnInit() {
    this.evenement = new Event();
    this.new = true;
    this.ok = true;

  }


  create(evenement: Event): void {
    console.log("update")
    this.configService.create(evenement).subscribe(data => {
      console.log(data)

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

}