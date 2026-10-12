import { accesEvenement } from './guards/acces-evenement.guard';
import { Routes } from '@angular/router';
import { AideComponent, EvenementComponent, GestionBenevolesComponent, GestionComponent, GestionEvenementsComponent, GestionMajConfigComponent, GestionMajCreneauxComponent, GestionMajStandsComponent, GestionStandsComponent } from './pages';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { PasswordResetComponent } from './pages/passwordReset/passwordReset.component';
import { redirectToLastEvent } from './guards/dernier-evenement.guard';

export const routes: Routes = [

    // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: ':id/gestion', component: GestionComponent, canActivate: [accesEvenement]},
  { path: ':id/gestion/majconfig', component: GestionMajConfigComponent, canActivate: [accesEvenement]},
  { path: ':id/gestion/majstands', component: GestionMajStandsComponent, canActivate: [accesEvenement]},
  { path: ':id/gestion/majcreneaux', component: GestionMajCreneauxComponent, canActivate: [accesEvenement]},
  { path: ':id/gestion/stands', component: GestionStandsComponent, canActivate: [accesEvenement]},
  { path: ':id/gestion/benevoles', component: GestionBenevolesComponent, canActivate: [accesEvenement]},
  { path: 'evenements/management', component: GestionEvenementsComponent},
  { path: 'aide', component: AideComponent},
  { path: 'mot-de-passe', component: PasswordResetComponent},
  { path: ':id', component: EvenementComponent},
  { path: '', component: AccueilComponent, canActivate: [redirectToLastEvent]},
  { path: '**', redirectTo: ''}
];
