import { Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Evenement } from './models';
import { EvenementService, FileService, TransmissionService } from './services';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import {HttpErrorResponse} from "@angular/common/http";
import { ToastService } from './services';
import { NgbToast, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap/toast';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    MatTabsModule,
    RouterModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    NgbToast,
    NgbToastHeader
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


  evenement?: Evenement;
  isValidAccessForEvent?: number
  logo?: string;

  constructor(

    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public router: Router,
    public fileService: FileService,
    public toastService: ToastService,
    public route: ActivatedRoute,private elementRef: ElementRef) {}


  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.transmissionService.dataStream.subscribe(data => {
    console.log("transmissionService");

      this.evenement = data
      this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = data.couleurFond;
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent')!);
      this.getLogo()
    });
  }

  getLogo() {
    this.fileService.get(this.evenement!.id, 'logo.jpeg').subscribe({
      next: (data) => {
      this.logo = "data:image/jpeg;base64," + data
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastService.error(error.message, 'Erreur');
      }
    });
  }



  public getScreenWidth: any;
  public getScreenHeight: any;


@HostListener('window:resize', ['$event'])
onWindowResize(_event: Event) {
  this.getScreenWidth = window.innerWidth;
  this.getScreenHeight = window.innerHeight;
}

}
