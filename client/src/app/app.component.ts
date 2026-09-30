import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Evenement } from './models';

import { AuthService,DernierEvenementService, EvenementService, FileService, TransmissionService } from './services';
import { ToastService } from './services';
import { NgbToast, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap/toast';
import { FitHeaderTitleDirective } from './directives/fit-header-title.directive';

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

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
  installPrompt?: BeforeInstallPromptEvent;
  showInstallModal = false;
  isIosInstall = false;

  constructor(

    public transmissionService: TransmissionService,
    public evenementService: EvenementService,
    private authService: AuthService,
    private dernierEvenementService: DernierEvenementService,
    public router: Router,
    public toastService: ToastService,
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {}


  ngOnInit() {
    this.prepareInstallModal();

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

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    const installPromptEvent = event as BeforeInstallPromptEvent;
    installPromptEvent.preventDefault();
    this.installPrompt = installPromptEvent;
    this.openInstallModal();
  }

  @HostListener('window:appinstalled')
  onAppInstalled(): void {
    this.installPrompt = undefined;
    this.showInstallModal = false;
  }

  installApplication(): void {
    if (!this.installPrompt) {
      return;
    }

    void this.installPrompt.prompt().then(() => this.installPrompt?.userChoice).then(() => {
      this.installPrompt = undefined;
      this.showInstallModal = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  closeInstallModal(): void {
    this.showInstallModal = false;
    sessionStorage.setItem('install-modal-dismissed', 'true');
  }

  private prepareInstallModal(): void {
    if (this.isInstalledApplication() || !this.isMobileScreen()) {
      return;
    }

    this.isIosInstall = this.isIosSafari();
    this.openInstallModal();
  }

  private openInstallModal(): void {
    if (!this.isMobileScreen() || this.isInstalledApplication() || sessionStorage.getItem('install-modal-dismissed')) {
      return;
    }

    this.showInstallModal = true;
    this.changeDetectorRef.markForCheck();
  }

  private isMobileScreen(): boolean {
    return window.matchMedia('(max-width: 991.98px)').matches;
  }

  private isInstalledApplication(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  private isIosSafari(): boolean {
    const userAgent = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIos && /Safari/.test(userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(userAgent);
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

  showEventList(): void {
    this.dernierEvenementService.clear();
    this.evenement = undefined;
    window.location.assign('/?liste=1');
  }
}
