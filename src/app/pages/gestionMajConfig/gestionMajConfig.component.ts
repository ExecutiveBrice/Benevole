
import { Component, Pipe, PipeTransform, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Config } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-gestionMajConfig',
  templateUrl: './gestionMajConfig.component.html',
  styleUrls: ['./gestionMajConfig.component.css']
})

export class GestionMajConfigComponent implements OnInit {
  configs: Config[];
  organumber:number;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.organumber = parseInt(this.route.snapshot.paramMap.get('id'));

    console.log(this.organumber)
    if (!this.organumber && isNaN(this.organumber) && this.organumber < 1) {
      this.router.navigate(['/error' ]);
    }

    this.configs = [];

    this.getAll();
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