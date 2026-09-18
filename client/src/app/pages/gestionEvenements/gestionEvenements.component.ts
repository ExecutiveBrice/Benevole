import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { BootstrapModalService } from '../../services/bootstrap-modal.service';

@Component({
  selector: 'app-gestionEvenements',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  templateUrl: './gestionEvenements.component.html',
  styleUrls: ['./gestionEvenements.component.scss'],
  imports: [FormsModule],
  providers: [EvenementService],
})
export class GestionEvenementsComponent implements OnInit {
  authorize = false;
  verificationEnCours = false;
  connexionDialogOpen = false;
  evenements: Evenement[] = [];
  administrateurs: AdministrateurConnecte[] = [];
  nomNouvelEvenement = '';
  afficherAdministrateurs = false;
  ajouterAdministrateur = false;
  administrateurEnEdition?: AdministrateurConnecte;
  motDePasseEdition = '';
  nouvelAdministrateur: AdministrateurCreation = this.creerNouvelAdministrateur();
  dialog = inject(BootstrapModalService);

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
    if (this.authService.isAuthenticated()) {
      this.verifierSession();
      return;
    }
    if (this.connexionDialogOpen) {
      return;
    }

    this.connexionDialogOpen = true;
    this.dialog.open(ModalAccessGestionComponent, {
      hasBackdrop: true,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        title: 'Accès au paramétrage global',
        question: 'Saisissez vos identifiants super-administrateur :',
      },
    }).afterClosed().subscribe(result => {
      this.connexionDialogOpen = false;
      if (result === true) {
        this.verifierSession();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private verifierSession(): void {
    this.verificationEnCours = true;
    this.administrateurService.moi().subscribe({
      next: administrateur => {
        this.verificationEnCours = false;
        if (!administrateur.superadmin) {
          this.toastr.error('Ce compte ne dispose pas des droits de paramétrage global.', 'Accès refusé');
          this.router.navigate(['/']);
          return;
        }
        this.authorize = true;
        this.getAllEvenements();
      },
      error: (error: HttpErrorResponse) => {
        this.verificationEnCours = false;
        if (error.status === 401) {
          this.toastr.error('La connexion a expiré.', 'Connexion requise');
          this.authorizeAccess();
        } else {
          this.toastr.error('La vérification de votre connexion a échoué. Veuillez réessayer.', 'Erreur');
        }
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

  delete(evenement: Evenement): void {
    this.evenementService.delete(evenement).subscribe({
      next: () => this.getAllEvenements(),
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  ajouterEvenement(): void {
    const eventName = this.nomNouvelEvenement.trim();
    if (!eventName) {
      this.toastr.error('Saisissez le nom de l’évènement.', 'Informations manquantes');
      return;
    }

    const evenement = new Evenement();
    evenement.eventName = eventName;
    this.evenementService.ajout(evenement).subscribe({
      next: () => {
        this.nomNouvelEvenement = '';
        this.toastr.success('Évènement ajouté.', 'Paramétrage global');
        this.getAllEvenements();
      },
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
    if (!this.nouvelAdministrateur.superadmin && this.nouvelAdministrateur.evenementIds.length === 0) {
      this.toastr.error('Sélectionnez au moins un évènement ou accordez le rôle super-administrateur.', 'Informations manquantes');
      return;
    }
    this.administrateurService.creer(this.nouvelAdministrateur).subscribe({
      next: () => {
        this.toastr.success('Administrateur ajouté. Un e-mail lui a été envoyé pour choisir son mot de passe.', 'Paramétrage global');
        this.ajouterAdministrateur = false;
        this.getAllAdministrateurs();
      },
      error: (error: HttpErrorResponse) => this.afficherErreur(error)
    });
  }

  enregistrerAdministrateur(): void {
    const administrateur = this.administrateurEnEdition;
    if (!administrateur) return;
    if (!administrateur.superadmin && administrateur.evenementIds.length === 0) {
      this.toastr.error('Sélectionnez au moins un évènement ou accordez le rôle super-administrateur.', 'Informations manquantes');
      return;
    }
    const request: AdministrateurMiseAJour = {
      username: administrateur.username,
      password: this.motDePasseEdition || null,
      enabled: administrateur.enabled,
      superadmin: administrateur.superadmin,
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
    return { username: '', superadmin: false, evenementIds: [] };
  }

  private afficherErreur(error: HttpErrorResponse): void {
    this.toastr.error(error.error?.message || error.error || error.message, 'Erreur');
  }
}
