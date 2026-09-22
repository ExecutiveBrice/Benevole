import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Evenement } from '../../models';
import { EvenementService, FileService, TransmissionService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../services';
import {OrderByPipe} from "../../services/sort.pipe";



@Component({
  selector: 'app-accueil',
  standalone: true,
  providers: [

  ],
  imports: [FormsModule,
    RouterModule,
    ReactiveFormsModule, FormsModule, OrderByPipe,],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})

export class AccueilComponent implements OnInit {

  authorize: boolean = false;
  evenements: Evenement[] = [];
  choix!: number;
  password!: string;


  constructor(
    public transmissionService: TransmissionService,
    public route: ActivatedRoute,
    public router: Router,
    public fileService: FileService,
    private toastr: ToastService,
    public evenementService: EvenementService,
    private changeDetectorRef: ChangeDetectorRef,
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
      this.evenements.forEach(evenement => this.getAffiche(evenement))
      this.changeDetectorRef.detectChanges();
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
