import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Evenement } from './models';
import { AuthService, EvenementService, FileService, TransmissionService } from './services';
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
  activeMobileEventPanel = 1;
  connexionHighlight = false;

  constructor(

    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    private authService: AuthService,
    public router: Router,
    public toastService: ToastService,
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {}


  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.applyBodyBackground();
      }
    });

    this.transmissionService.mobileEventPanelStream.subscribe(panel => {
      this.activeMobileEventPanel = panel;
      this.changeDetectorRef.markForCheck();
    });
    this.transmissionService.connexionHighlightStream.subscribe(highlight => {
      this.connexionHighlight = highlight;
      this.changeDetectorRef.markForCheck();
    });
    this.transmissionService.dataStream.subscribe(data => {
      this.evenement = data
      this.applyBodyBackground();
      this.isValidAccessForEvent = JSON.parse(localStorage.getItem('isValidAccessForEvent')!);
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

  isLandingPage(): boolean {
    return /^\/(?:\?.*)?$/.test(this.router.url);
  }

  getHeaderTitleFont(): string | undefined {
    return this.isLandingPage() ? 'PermanentMarker' : this.evenement?.titleFont;
  }

  private applyBodyBackground(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      this.isLandingPage() ? 'grey' : (this.evenement?.couleurFond ?? '');
  }

  isEventPage(): boolean {
    return /^\/\d+(?:\/|\?.*)?$/.test(this.router.url);
  }

  selectMobileEventPanel(panel: number): void {
    this.transmissionService.selectMobileEventPanel(panel);
  }

  logoutFromManagement(): void {
    this.authService.logout();
    this.router.navigate(this.isEventManagementPage() && this.evenement?.id ? ['/', this.evenement.id] : ['/']);
  }

}
