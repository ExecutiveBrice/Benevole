import { Routes } from '@angular/router';
import { EvenementComponent, CreationComponent, GestionBenevolesComponent, GestionComponent, GestionEvenementsComponent, GestionMajConfigComponent, GestionMajCreneauxComponent, GestionMajStandsComponent, GestionStandsComponent } from './pages';
import { AccueilComponent } from './pages/accueil/accueil.component';

export const routes: Routes = [

    // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'evenements/creation', component: CreationComponent},
  { path: ':id/gestion', component: GestionComponent},
  { path: ':id/gestion/majconfig', component: GestionMajConfigComponent},
  { path: ':id/gestion/majstands', component: GestionMajStandsComponent},
  { path: ':id/gestion/majcreneaux', component: GestionMajCreneauxComponent},
  { path: ':id/gestion/stands', component: GestionStandsComponent},
  { path: ':id/gestion/benevoles', component: GestionBenevolesComponent},
  { path: 'evenements/management', component: GestionEvenementsComponent},
  { path: ':id', component: EvenementComponent},
  { path: '', component: AccueilComponent},
  { path: '**', redirectTo: ''}
];
