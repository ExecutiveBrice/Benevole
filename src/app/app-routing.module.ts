import { NgModule } from '@angular/core';
import {PreloadAllModules, PreloadingStrategy, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {SignupComponent} from "./pages/signup/signup.component";
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {GestionComponent} from './pages/gestion/gestion.component';
import {GestionSMSComponent} from './pages/gestionSMS/gestionSMS.component';
import {GestionStandsComponent} from './pages/gestionStands/gestionStands.component';
import {GestionMajConfigComponent} from './pages/gestionMajConfig/gestionMajConfig.component';
import {GestionMajStandsComponent} from './pages/gestionMajStands/gestionMajStands.component';
import {GestionMajCreneauxComponent} from './pages/gestionMajCreneaux/gestionMajCreneaux.component';
import {GestionBenevolesComponent} from './pages/gestionBenevoles/gestionBenevoles.component';
import { ErrorComponent} from "./pages/error/error.component";


const appRoutes: Routes = [
  { path: '',pathMatch: 'full', redirectTo: 'dashboard'},
  { path: 'signup', component: SignupComponent},
  { path: 'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'gestion', component: GestionComponent},
  { path: 'gestionmajconfig', component: GestionMajConfigComponent},
  { path: 'gestionmajstands', component: GestionMajStandsComponent},
  { path: 'gestionmajcreneaux', component: GestionMajCreneauxComponent},
  { path: 'gestionstands', component: GestionStandsComponent},
  { path: 'gestionsms', component: GestionSMSComponent},  
  { path: 'gestionbenevoles', component: GestionBenevolesComponent},
  { path: '404', component: ErrorComponent},
  { path: '**', redirectTo: '404'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

