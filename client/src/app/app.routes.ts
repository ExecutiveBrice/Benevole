import { Routes } from '@angular/router';
import { EvenementComponent, GestionBenevolesComponent, GestionComponent, GestionEvenementsComponent, GestionMajConfigComponent, GestionMajCreneauxComponent, GestionMajStandsComponent, GestionStandsComponent } from './pages';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { PasswordResetComponent } from './pages/passwordReset/passwordReset.component';

export const routes: Routes = [

    // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: ':id/gestion', component: GestionComponent},
  { path: ':id/gestion/majconfig', component: GestionMajConfigComponent},
  { path: ':id/gestion/majstands', component: GestionMajStandsComponent},
  { path: ':id/gestion/majcreneaux', component: GestionMajCreneauxComponent},
  { path: ':id/gestion/stands', component: GestionStandsComponent},
  { path: ':id/gestion/benevoles', component: GestionBenevolesComponent},
  { path: 'evenements/management', component: GestionEvenementsComponent},
  { path: 'mot-de-passe', component: PasswordResetComponent},
  { path: ':id', component: EvenementComponent},
  { path: '', component: AccueilComponent},
  { path: '**', redirectTo: ''}
];
