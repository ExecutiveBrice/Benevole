import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Evenement } from '../../models';
import {
  AdministrateurConnecte,
  AdministrateurCreation,
  AdministrateurMiseAJour,
  AdministrateurService,
  AuthService,
  EvenementService,
  ToastService
} from '../../services';
import { ModalAccessGestionComponent } from '../../components/modalAccessGestion/modalAccessGestion.component';

@Component({
  selector: 'app-gestionEvenements',
  standalone: true,
  templateUrl: './gestionEvenements.component.html',
  styleUrls: ['./gestionEvenements.component.scss'],
  imports: [FormsModule, DatePipe, RouterModule],
  providers: [EvenementService],
})
export class GestionEvenementsComponent implements OnInit {
  authorize = false;
  evenements: Evenement[] = [];
  administrateurs: AdministrateurConnecte[] = [];
  choix?: number;
  afficherAdministrateurs = false;
  ajouterAdministrateur = false;
  administrateurEnEdition?: AdministrateurConnecte;
  motDePasseEdition = '';
  nouvelAdministrateur: AdministrateurCreation = this.creerNouvelAdministrateur();
  dialog = inject(MatDialog);

  constructor(
    private toastr: ToastService,
    public route: ActivatedRoute,
    public router: Router,
    public evenementService: EvenementService,
    private authService: AuthService,
    private administrateurService: AdministrateurService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.verifierSession();
    } else {
      this.authorizeAccess();
    }
  }

  authorizeAccess(): void {
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        title: 'Accès au paramétrage global',
        question: 'Saisissez vos identifiants administrateur global :',
      },
    }).afterClosed().subscribe(result => {
      if (result instanceof FormGroup) {
        this.authService.login(result.get('username')?.value, result.get('password')?.value);
        this.verifierSession();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private verifierSession(): void {
    this.administrateurService.moi().subscribe({
      next: administrateur => {
        if (!administrateur.global) {
          this.authService.logout();
          this.toastr.error('Ce compte ne dispose pas des droits de paramétrage global.', 'Accès refusé');
          this.router.navigate(['/']);
          return;
        }
        this.authorize = true;
        this.getAllEvenements();
      },
      error: () => {
        this.authService.logout();
        this.toastr.error('Identifiant ou mot de passe incorrect.', 'Erreur');
        this.authorizeAccess();
      }
    });
  }

  afficherGestionAdministrateurs(): void {
    this.afficherAdministrateurs = true;
    this.ajouterAdministrateur = false;
    this.administrateurEnEdition = undefined;
    this.getAllAdministrateurs();
  }

  retourTableauDeBord(): void {
    this.afficherAdministrateurs = false;
    this.ajouterAdministrateur = false;
    this.administrateurEnEdition = undefined;
  }

  goToGestion(evenement: Evenement): void {
    this.router.navigate([evenement.id + '/gestion/']);
  }

  choixEvenement(id: number): void {
    this.choix = this.choix === id ? undefined : id;
  }

  update(evenement: Evenement): void {
    this.evenementService.update(evenement).subscribe({
      next: () => this.getAllEvenements(),
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  delete(evenement: Evenement): void {
    this.evenementService.delete(evenement).subscribe({
      next: () => this.getAllEvenements(),
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  getAllEvenements(): void {
    this.evenementService.getAll().subscribe({
      next: data => this.evenements = data.filter(evenement => evenement.id !== 0),
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  getAllAdministrateurs(): void {
    this.administrateurService.getAll().subscribe({
      next: administrateurs => this.administrateurs = administrateurs,
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  ouvrirAjoutAdministrateur(): void {
    this.ajouterAdministrateur = true;
    this.administrateurEnEdition = undefined;
    this.nouvelAdministrateur = this.creerNouvelAdministrateur();
  }

  editerAdministrateur(administrateur: AdministrateurConnecte): void {
    this.ajouterAdministrateur = false;
    this.motDePasseEdition = '';
    this.administrateurEnEdition = { ...administrateur, evenementIds: [...administrateur.evenementIds] };
  }

  enregistrerNouvelAdministrateur(): void {
    if (!this.nouvelAdministrateur.global && this.nouvelAdministrateur.evenementIds.length === 0) {
      this.toastr.error('Sélectionnez au moins un évènement ou accordez l’accès global.', 'Informations manquantes');
      return;
    }
    this.administrateurService.creer(this.nouvelAdministrateur).subscribe({
      next: () => {
        this.toastr.success('Administrateur ajouté.', 'Paramétrage global');
        this.ajouterAdministrateur = false;
        this.getAllAdministrateurs();
      },
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  enregistrerAdministrateur(): void {
    const administrateur = this.administrateurEnEdition;
    if (!administrateur) return;
    if (!administrateur.global && administrateur.evenementIds.length === 0) {
      this.toastr.error('Sélectionnez au moins un évènement ou accordez l’accès global.', 'Informations manquantes');
      return;
    }
    const request: AdministrateurMiseAJour = {
      username: administrateur.username,
      password: this.motDePasseEdition || null,
      enabled: administrateur.enabled,
      global: administrateur.global,
      evenementIds: administrateur.evenementIds
    };
    this.administrateurService.mettreAJour(administrateur.id, request).subscribe({
      next: () => {
        this.toastr.success('Administrateur mis à jour.', 'Paramétrage global');
        this.administrateurEnEdition = undefined;
        this.getAllAdministrateurs();
      },
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  basculerEvenement(evenementId: number, administrateur: AdministrateurCreation | AdministrateurConnecte): void {
    const index = administrateur.evenementIds.indexOf(evenementId);
    if (index === -1) administrateur.evenementIds.push(evenementId);
    else administrateur.evenementIds.splice(index, 1);
  }

  evenementSelectionne(evenementId: number, administrateur: AdministrateurCreation | AdministrateurConnecte): boolean {
    return administrateur.evenementIds.includes(evenementId);
  }

  private creerNouvelAdministrateur(): AdministrateurCreation {
    return { username: '', password: '', global: false, evenementIds: [] };
  }

  private afficherErreur(error: HttpErrorResponse): void {
    this.toastr.error(error.error?.message || error.error || error.message, 'Erreur');
  }
}
