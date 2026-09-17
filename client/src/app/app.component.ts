import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Evenement } from './models';
import { EvenementService, FileService, TransmissionService } from './services';
import {HttpErrorResponse} from "@angular/common/http";
import { ToastService } from './services';
import { NgbToast, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap/toast';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [RouterOutlet,
    RouterModule,
    NgbToast,
    NgbToastHeader,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
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
  evenements: Evenement[] = [];
  isValidAccessForEvent?: number
  logo?: string;

  constructor(

    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    public router: Router,
    public fileService: FileService,
    public toastService: ToastService,
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {}


  ngOnInit() {
    this.getAllEvenements();
    this.transmissionService.dataStream.subscribe(data => {
      this.evenement = data
      this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = data.couleurFond;
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent')!);
      this.getLogo()
      this.changeDetectorRef.detectChanges();
    });
  }

  getAllEvenements() {
    this.evenementService.getAll().subscribe({
      next: (data) => {
        this.evenements = data.filter(evenement => evenement.id !== 0);
        this.evenements.forEach(evenement => this.getAffiche(evenement));
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => this.toastService.error(error.message, 'Erreur')
    });
  }

  getAffiche(evenement: Evenement) {
    this.fileService.get(evenement.id, 'affiche.jpeg').subscribe({
      next: (data) => evenement.affiche = `data:image/jpeg;base64,${data}`,
      // Une affiche est optionnelle : l'évènement reste sélectionnable sans elle.
      error: () => evenement.affiche = ''
    });
  }

  changeEvenement(evenement: Evenement) {
    this.router.navigate(['/', evenement.id]);
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
}
