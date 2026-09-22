
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BenevoleService, TransmissionService, EvenementService, FileService, ConfigService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnexionComponent } from "../../components/connexion/connexion.component";
import { PlanningComponent } from "../../components/planning/planning.component";
import { InfoComponent } from "../../components/info/info.component";

@Component({
  selector: 'app-evenement',
  standalone: true,
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.scss'],
  
  imports: [ConnexionComponent, PlanningComponent, InfoComponent],
  providers: [
    StandService,
    CroisementService,
    ConfigService,
    BenevoleService
  ],
  encapsulation: ViewEncapsulation.None // <------ This is Important
})

export class EvenementComponent implements OnInit {
  evenement: Evenement | undefined;
  idEvenement!: number
  benevole: Benevole | undefined = undefined;
  isShowing: boolean = false
  clignotage: boolean = false;
  activeMobilePanel = 1;
  
  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    private toastr: ToastService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public transmissionService: TransmissionService,
  
    public sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  showError() {
    this.toastr.error(" Cette plage horaire est déjà complète,<br>Choisissez en une autre", 'Erreur');
  }

  showSuccess() {
    this.toastr.success("Vous pouvez revenir quand vous le souhaitez pour modifier vos choix<br>en vous connectant (<a href=" + "this.using_address" + ">sur le site d'inscription</a>)<br>Vous pouvez fermer cette fenêtre", "<strong>Merci de votre participation</strong>")
  }


  ngOnInit() {

    this.transmissionService.selectMobileEventPanel(1);
    // Ne pas conserver l'alerte d'un autre évènement après une navigation.
    this.transmissionService.setConnexionHighlight(false);
    this.transmissionService.mobileEventPanelStream.subscribe(panel => {
      this.activeMobilePanel = panel;
      this.changeDetectorRef.markForCheck();
    });

    this.route.paramMap.subscribe(params => {
      this.idEvenement = Number(params.get('id'));
      this.evenementService.isOpen(this.idEvenement).subscribe({
        next: () => this.getEvenement(this.idEvenement),
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.toastr.error(error.message, 'Erreur');
        }
      });
    });



  }



  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
       
        this.evenement = data;
        document.getElementsByTagName('html')[0].style.setProperty('--background-color', this.evenement!.couleurFond);
        this.transmissionService.dataTransmission(data);
        this.changeDetectorRef.detectChanges();

      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })
  }







  isBenevoleExiste(clignotage:boolean){
    this.clignotage = clignotage;
    this.transmissionService.setConnexionHighlight(clignotage);
  }




}
