
import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { BenevoleService, TransmissionService, EvenementService, FileService, ConfigService } from '../../services';
import { CroisementService, StandService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Evenement } from '../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnexionComponent } from "../../components/connexion/connexion.component";
import { PlanningComponent } from "../../components/planning/planning.component";
import { InfoComponent } from "../../components/info/info.component";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-evenement',
  standalone: true,
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.scss'],
  
  imports: [MatTooltipModule,NgClass,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule, ConnexionComponent, PlanningComponent, InfoComponent],
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
  
  constructor(public benevoleService: BenevoleService,
    public evenementService: EvenementService,
    public route: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public transmissionService: TransmissionService,
  
    public sanitizer: DomSanitizer,
  ) { }

  showError() {
    this.toastr.error(" Cette plage horaire est déjà complète,<br>Choisissez en une autre", 'Erreur');
  }

  showSuccess() {
    this.toastr.success("Vous pouvez revenir quand vous le souhaitez pour modifier vos choix<br>en vous connectant (<a href=" + "this.using_address" + ">sur le site d'inscription</a>)<br>Vous pouvez fermer cette fenêtre", "<strong>Merci de votre participation</strong>")
  }


  ngOnInit() {

    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.evenementService.isOpen(this.idEvenement).subscribe({
      next: (data) => {
        this.getEvenement(this.idEvenement);

      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }
    })



  }



  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
        this.evenement = data;
        this.transmissionService.dataTransmission(data);

      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })
  }







  isBenevoleExiste(clignotage:boolean){
    this.clignotage = clignotage;
  }









  public getScreenWidth: any;
  public getScreenHeight: any;
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
}

