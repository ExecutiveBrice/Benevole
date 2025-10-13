
import { Component, inject, OnInit } from '@angular/core';
import { EvenementService, ConfigService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { OrderByPipe } from "../../services/sort.pipe";
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ModalAccessGestionComponent } from '../../components/modalAccessGestion/modalAccessGestion.component';

@Component({
  selector: 'app-gestionEvenements',
  standalone: true,
  templateUrl: './gestionEvenements.component.html',
  styleUrls: ['./gestionEvenements.component.scss'],
  imports: [
    FormsModule,
    DatePipe,
    RouterModule, OrderByPipe],
  providers: [
    EvenementService,

    ConfigService
  ],
})

export class GestionEvenementsComponent implements OnInit {

  subscription = new Subscription()
  authorize: boolean = false;
  evenements!: Evenement[];
  choix!: number;
  password!: string;
  dialog = inject(MatDialog);


  constructor(
    private toastr: ToastrService,
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.evenements = [];
    localStorage.removeItem('isValidAccessForEvent');
    this.authorizeAccess()
  }

  authorizeAccess(): void {
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true, disableClose: true, backdropClass: 'backdropBackground',
      data: {
        title: 'Accès mode gestionnaire',
        question: 'Saisissez le mot de passe de l\'évènement :',
      },
    }).afterClosed().subscribe(result => {
      if (result instanceof FormGroup) {
        this.evenementService.isAuthorize(0, result.get('passwood')?.value).subscribe({
          next: (data) => {
            if (data) {
              this.authorize = data;
              localStorage.setItem('isValidAccessForEvent', JSON.stringify(0));
              this.getAllEvenements();
            } else {
              this.toastr.error("Mot de passe incorrect", 'Erreur');
              this.authorizeAccess()
            }
          },
          error: (error: HttpErrorResponse) => {

          }
        })
      }
    });
  }

  goToGestion(evenement: Evenement) {
    this.router.navigate([evenement.id + '/gestion/']);
  }

  choixEvenement(id: number) {
    if (this.choix != id) {
      this.choix = id
    } else {
      this.choix = 0
    }
  }

  update(evenement: Evenement): void {
    this.evenementService.update(evenement).subscribe({
      next: (data) => {
      this.getAllEvenements()
    },
      error: (error: HttpErrorResponse) => {
        console.log('😢 Oh no!', error);
        this.toastr.error(error.message, 'Erreur');
      }
    });
  }

  delete(evenement: Evenement): void {
    this.evenementService.delete(evenement).subscribe({
      next: (data) => {
      this.getAllEvenements()
    },
        error: (error: HttpErrorResponse) => {
          console.log('😢 Oh no!', error);
          this.toastr.error(error.message, 'Erreur');
        }
      });
  }

  getAllEvenements(): void {
    this.evenementService.getAll().subscribe({
      next: (data) => {
      this.evenements = data
    },
        error: (error: HttpErrorResponse) => {
          console.log('😢 Oh no!', error);
          this.toastr.error(error.message, 'Erreur');
        }
      });
  }

}
