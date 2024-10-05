import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Evenement } from './models';
import { BenevoleService, CroisementService, EvenementService, FileService, TransmissionService } from './services';

import { MatGridListModule } from '@angular/material/grid-list';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    RouterModule,
    MatGridListModule
  ],
  providers: [
    TransmissionService,
    EvenementService,
    FileService,
    Location
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent  implements OnInit{

  subscription = new Subscription()
  evenement?: Evenement;
  isValidAccessForEvent?: number
  logo?: string;

  constructor(
    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public router: Router,
    public fileService: FileService,
    public route: ActivatedRoute) {
  }


  ngOnInit() {
    this.subscription = this.transmissionService.dataStream.subscribe(data => {
      this.evenement = data
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent')!);

      this.getLogo()
    });
  }

  getLogo() {
    this.fileService.get(this.evenement!.id, 'logo.jpeg').subscribe(data => {
      this.logo = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


}


