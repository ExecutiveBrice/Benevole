
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { BenevoleService } from '../../services';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Stand, Email } from '../../models';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})

export class ErrorComponent implements OnChanges {
  text:string

  constructor(    public configService: ConfigService,
    public sanitizer: DomSanitizer) {
    this.getText()
  }

  ngOnChanges() {

  }
 

  getText() {
    this.configService.getParam("404").subscribe(res => {
      console.log(res['param'].value);
      this.text = res['param'].value;
    }, err => {
      console.log(err);
    });
  }
}