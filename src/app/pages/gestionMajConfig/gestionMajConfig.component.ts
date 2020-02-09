
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Config } from '../../models';



@Component({
  selector: 'app-gestionMajConfig',
  templateUrl: './gestionMajConfig.component.html',
  styleUrls: ['./gestionMajConfig.component.css']
})

export class GestionMajConfigComponent implements OnChanges {
  configs: Config[];

  constructor(
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {
    this.configs = [];

    this.getAll();
  }

  ngOnChanges() {

  }


  getAll(): void {
    console.log("getAll")
    this.configService.getAll().subscribe(data => {
      console.log(data)
      this.configs = data['configs'];
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(config:Config): void {
    console.log("update")
    this.configService.updateParam(config).subscribe(data => {
      console.log(data)
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

}