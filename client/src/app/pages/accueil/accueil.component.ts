import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderByPipe } from '../../services/sort.pipe';
import { Evenement } from '../../models';
import { EvenementService, FileService, TransmissionService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';
import {ToastrService} from "ngx-toastr";



@Component({
  selector: 'app-accueil',
  standalone: true,
  providers: [

  ],
  imports: [FormsModule,
    RouterModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatSelectModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule,
    MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})

export class AccueilComponent implements OnInit {

  authorize: boolean = false;
  evenements!: Evenement[];
  choix!: number;
  password!: string;


  constructor(
    public transmissionService: TransmissionService,
    public route: ActivatedRoute,
    public router: Router,
    public fileService: FileService,
    private toastr: ToastrService,
    public evenementService: EvenementService,
  ) {

  }


  ngOnInit() {

    this.getEvenement(0);

    this.getAllEvenements()

  }


  getAllEvenements(): void {
    this.evenementService.getAll().subscribe({
      next: (data) => {
      this.evenements = data.filter(evenemet => evenemet.id != 0)
      console.log(data);
      this.evenements.forEach(evenement => this.getAffiche(evenement))
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe({
        next: (data) => {

      this.transmissionService.dataTransmission(data);
    },
        error: (error: HttpErrorResponse) => {
          console.log('😢 Oh no!', error);
          this.toastr.error(error.message, 'Erreur');
        }
      });
  }


  getAffiche(evenement: Evenement) {
    this.fileService.get(evenement.id, 'affiche.jpeg').subscribe({
      next: (data) => {
        evenement.affiche = "data:image/jpeg;base64," + data
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }

    })
  }
}
