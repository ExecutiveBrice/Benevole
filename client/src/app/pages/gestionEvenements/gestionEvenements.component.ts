
import { Component, inject, OnInit } from '@angular/core';
import { EvenementService, ConfigService, AuthService, AdministrateurService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { OrderByPipe } from "../../services/sort.pipe";
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services';
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
  dialog = inject(MatDialog);


  constructor(
    private toastr: ToastService,
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    private authService: AuthService,
    private administrateurService: AdministrateurService,
    public configService: ConfigService,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.evenements = [];
    localStorage.removeItem('isValidAccessForEvent');
    if (this.authService.isAuthenticated()) {
      this.verifierSession();
    } else {
      this.authorizeAccess();
    }
  }

  authorizeAccess(): void {
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true, disableClose: true, backdropClass: 'backdropBackground',
      data: {
        title: 'Accès mode gestionnaire',
        question: 'Saisissez vos identifiants administrateur :',
      },
    }).afterClosed().subscribe(result => {
      if (result instanceof FormGroup) {
        this.authService.login(result.get('username')?.value, result.get('password')?.value);
        this.verifierSession();
      }
    });
  }

  private verifierSession(): void {
    this.administrateurService.moi().subscribe({
      next: () => {
        this.authorize = true;
        this.getAllEvenements();
      },
      error: () => {
        this.authService.logout();
        this.toastr.error("Identifiant ou mot de passe incorrect", 'Erreur');
        this.authorizeAccess();
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
