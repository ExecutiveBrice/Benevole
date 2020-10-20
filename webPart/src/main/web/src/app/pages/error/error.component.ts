
import { Component, OnChanges } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';

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
    this.configService.getParam("erreur1").subscribe(res => {
      console.log(res['param'].value);
      this.text = res['param'].value;
    }, err => {
      console.log(err);
    });
  }
}