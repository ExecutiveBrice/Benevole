
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CreneauService, EvenementService, TransmissionService, ConfigService, AuthService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau, Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderByPipe } from "../../services/sort.pipe";
import { ImageCropperComponent } from 'ngx-image-cropper';
import {HttpErrorResponse} from "@angular/common/http";
import { ToastService } from '../../services';


@Component({
  selector: 'app-gestionMajCreneaux',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  templateUrl: './gestionMajCreneaux.component.html',
  styleUrls: ['./gestionMajCreneaux.component.scss'],
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule, FormsModule, OrderByPipe, ],

  providers: [
    EvenementService,
    CreneauService,
    ConfigService
  ],
})

export class GestionMajCreneauxComponent implements OnInit {
  subscription = new Subscription();
  authorize: boolean = false;
  creneaux!: Creneau[];
  newCreneau: Creneau = new Creneau();
  choix!: string;
  evenement: Evenement = new Evenement();
  idEvenement!: number
  constructor(

    public route: ActivatedRoute,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public router: Router,
    public creneauService: CreneauService,
    private authService: AuthService,
    private toastr: ToastService,
    public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.creneaux = [];
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)


    if (this.authService.isAuthenticated()) {
      this.authorize = true;
      this.getEvenement(this.idEvenement);
      this.getAll();
    } else {
      this.router.navigate(['/', this.idEvenement, 'gestion']);
    }
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
      next: (data) => {
      console.log(data)
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }


  formulaireNewCreneau = this.formBuilder.group(
    {

      ordre: new FormControl("", [Validators.required, Validators.minLength(1)]),
      plage: new FormControl("", [Validators.required, Validators.minLength(2)]),
    }
  )
  getAll(): void {
    this.creneauService.getAll(this.idEvenement).subscribe({
      next: (data) => {
      this.creneaux = data;
      console.log(this.creneaux)
        data.forEach(creneau => {

        let formulaire = this.formBuilder.group({
          id: new FormControl(creneau.id, [Validators.required, Validators.minLength(2)]),
          ordre: new FormControl(creneau.ordre, [Validators.required, Validators.minLength(1)]),
          plage: new FormControl(creneau.plage, [Validators.required, Validators.minLength(2)]),
        })

        creneau.formulaire = formulaire;

      })
    },
      error: (error: HttpErrorResponse) => {
      console.log('😢 Oh no!', error);
      this.toastr.error(error.message, 'Erreur');
    }
  });
  }


  update(formulaire: FormGroup): void {

    if (formulaire.valid) {

      this.creneauService.update(formulaire.getRawValue()).subscribe({
      next: (data) => {
        this.getAll();
      },
        error: (error: HttpErrorResponse) => {
          console.log('😢 Oh no!', error);
          this.toastr.error(error.message, 'Erreur');
        }
      });
    } else {
      console.log("formulaire invalide")
    }
  }

  ajout(formulaire: FormGroup): void {
    if (formulaire.valid) {
    this.creneauService.ajout(formulaire.getRawValue(), this.idEvenement).subscribe({
      next: (data) => {
      this.getAll();
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
    }
  }



  delete(creneau: Creneau): void {
    this.creneauService.delete(creneau).subscribe({
      next: (data) => {
      this.getAll();
    },
    error: (error: HttpErrorResponse) => {
      console.log('😢 Oh no!', error);
      this.toastr.error(error.message, 'Erreur');
    }
  });
  }
}
