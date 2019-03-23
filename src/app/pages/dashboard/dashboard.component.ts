import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';

import { DomSanitizer } from '@angular/platform-browser';
import { Benevole } from '../../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnChanges {
  nouveau: boolean;
  exist: boolean;
  choix: String;
  benevole: Benevole = new Benevole;
  constructor(public benevoleService: BenevoleService,
    public sanitizer: DomSanitizer) {

  }

  ngOnChanges() {

  }

  find(benevole: Benevole): void {
    this.benevoleService.getByMail(benevole.email).subscribe(data => {
      console.log(data)
      this.exist = true
      this.benevole = data['benevoles']
      this.nouveau = false;
    },
      error => {
        this.exist = false
        this.nouveau = true;
        console.log('😢 Oh no!', error);
      });
  }


  subscribe(benevole: Benevole): void {
    this.benevoleService.add(benevole).subscribe(data => {
      console.log(data)
      this.benevole.id = data['benevoles']
      this.exist = true;
      this.nouveau = false;
    },
      error => {
        this.exist = false;
        this.nouveau = true;
        console.log('😢 Oh no!', error);
      });
  }

  error(benevole: Benevole): void {
    this.benevoleService.error(benevole).subscribe(data => {
      console.log(data)
      if (data['message'] == "ok") {

      }

    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
}
