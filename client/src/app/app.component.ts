import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Evenement } from './models';
import { AuthService, EvenementService, FileService, TransmissionService } from './services';
import {HttpErrorResponse} from "@angular/common/http";
import { ToastService } from './services';
import { NgbToast, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap/toast';
import { FitHeaderTitleDirective } from './directives/fit-header-title.directive';
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [RouterOutlet,
    RouterModule,
    NgbToast,
    NgbToastHeader,
    FitHeaderTitleDirective,
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
  activeMobileEventPanel = 1;

  constructor(

    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    private authService: AuthService,
    public router: Router,
    public fileService: FileService,
    public toastService: ToastService,
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {}


  ngOnInit() {
    this.transmissionService.mobileEventPanelStream.subscribe(panel => {
      this.activeMobileEventPanel = panel;
      this.changeDetectorRef.markForCheck();
    });
    this.transmissionService.dataStream.subscribe(data => {
      this.evenement = data
      this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = data.couleurFond;
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent')!);
      this.getLogo()
      this.changeDetectorRef.detectChanges();
    });
  }

  isEventManagementPage(): boolean {
    return this.router.url.includes('/gestion');
  }

  isGlobalManagementPage(): boolean {
    return this.router.url.includes('/evenements/management');
  }

  getEventManagementBackLink(): (string | number)[] {
    if (!this.evenement?.id) {
      return ['/'];
    }

    const isSubPage = /\/gestion\/[^/?]+/.test(this.router.url);
    return isSubPage ? ['/', this.evenement.id, 'gestion'] : ['/', this.evenement.id];
  }

  isManagementPage(): boolean {
    return this.isEventManagementPage() || this.isGlobalManagementPage();
  }

  isEventDetailPage(): boolean {
    return /^\/\d+(?:\?.*)?$/.test(this.router.url);
  }

  selectMobileEventPanel(panel: number): void {
    this.transmissionService.selectMobileEventPanel(panel);
  }

  logoutFromManagement(): void {
    this.authService.logout();
    this.router.navigate(this.isEventManagementPage() && this.evenement?.id ? ['/', this.evenement.id] : ['/']);
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
