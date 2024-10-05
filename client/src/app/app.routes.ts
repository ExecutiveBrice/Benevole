import { Routes } from '@angular/router';
import { ConnexionComponent, CreationComponent, ErrorComponent, GestionBenevolesComponent, GestionComponent, GestionEvenementsComponent, GestionMajConfigComponent, GestionMajCreneauxComponent, GestionMajStandsComponent, GestionStandsComponent } from './pages';

export const routes: Routes = [

    // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'evenements/creation', component: CreationComponent},
  { path: ':id/gestion', component: GestionComponent},
  { path: ':id/gestion/majconfig', component: GestionMajConfigComponent},
  { path: ':id/gestion/majstands', component: GestionMajStandsComponent},
  { path: ':id/gestion/majcreneaux', component: GestionMajCreneauxComponent},
  { path: ':id/gestion/stands', component: GestionStandsComponent},
  { path: ':id/gestion/benevoles', component: GestionBenevolesComponent},
  { path: 'evenements/gestion', component: GestionEvenementsComponent},
  { path: 'error', component: ErrorComponent},
  { path: ':id', component: ConnexionComponent},
  { path: '**', redirectTo: 'error'}
];
