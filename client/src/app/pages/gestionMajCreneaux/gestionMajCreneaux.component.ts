
import { Component, OnInit } from '@angular/core';
import { CreneauService, EvenementService, TransmissionService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Creneau, Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperComponent } from 'ngx-image-cropper';


@Component({
  selector: 'app-gestionMajCreneaux',
  standalone: true,
  templateUrl: './gestionMajCreneaux.component.html',
  styleUrls: ['./gestionMajCreneaux.component.scss'],
  imports: [NgClass,
    FormsModule,
    ImageCropperComponent,
    RouterModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatSelectModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],

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
    public sanitizer: DomSanitizer,
    public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.creneaux = [];
    this.choix = "";
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)


    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getEvenement(this.idEvenement);
      this.getAll()
    } else {
      this.router.navigate([this.idEvenement + '/gestion/']);
    }
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe(data => {
      console.log(data)
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  formulaireNewCreneau = this.formBuilder.group(
    {

      ordre: new FormControl("", [Validators.required, Validators.minLength(2)]),
      plage: new FormControl("", [Validators.required, Validators.minLength(2)]),
    }
  )
  getAll(): void {
    this.creneauService.getAll(this.idEvenement).subscribe(creneaux => {
      this.creneaux = creneaux;
      console.log(this.creneaux)
      creneaux.forEach(creneau => {

        let formulaire = this.formBuilder.group({
          id: new FormControl(creneau.id, [Validators.required, Validators.minLength(2)]),
          ordre: new FormControl(creneau.ordre, [Validators.required, Validators.minLength(2)]),
          plage: new FormControl(creneau.plage, [Validators.required, Validators.minLength(2)]),
        })

        creneau.formulaire = formulaire;

      })
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }


  update(formulaire: FormGroup): void {

    if (formulaire.valid) {

      this.creneauService.update(formulaire.getRawValue()).subscribe(data => {
        this.getAll();
      },
        error => {
          console.log('😢 Oh no!', error);
        });
    } else {
      console.log("formulaire invalide")
    }
  }

  ajout(formulaire: FormGroup): void {
    if (formulaire.valid) {
    this.creneauService.ajout(formulaire.getRawValue(), this.idEvenement).subscribe(data => {
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
    }
  }



  delete(creneau: Creneau): void {
    this.creneauService.delete(creneau).subscribe(data => {
      this.getAll();
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }
}