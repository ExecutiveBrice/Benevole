import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, Renderer2, RendererStyleFlags2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { Evenement } from './models';
import { EvenementService, FileService, TransmissionService } from './services';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    MatTabsModule,
    RouterModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule
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
    this.fileService.get(this.evenement!.id, 'logo.jpeg').subscribe(data => {
      this.logo = "data:image/jpeg;base64," + data
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  
  public getScreenWidth: any;
  public getScreenHeight: any;


@HostListener('window:resize', ['$event'])
onWindowResize() {
  this.getScreenWidth = window.innerWidth;
  this.getScreenHeight = window.innerHeight;
}

}


