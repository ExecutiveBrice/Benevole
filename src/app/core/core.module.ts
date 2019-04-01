import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule} from "../app-routing.module";
import { FormsModule} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { OrderByPipe} from "../sort.pipe";
import { UserService, CroisementService, BenevoleService, StandService, MailService} from "../services";
import { LoginComponent} from "../pages/login/login.component";
import { SignupComponent} from "../pages/signup/signup.component";
import { DashboardComponent} from "../pages/dashboard/dashboard.component";
import { GestionComponent} from "../pages/gestion/gestion.component";
import { GestionStandsComponent} from "../pages/gestionStands/gestionStands.component";
import { GestionBenevolesComponent} from "../pages/gestionBenevoles/gestionBenevoles.component";
import { ErrorComponent} from "../pages/error/error.component";



import { Ng2ImgMaxModule } from 'ng2-img-max';

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    Ng2ImgMaxModule
  ],
  exports: [
    AppRoutingModule
  ],
  providers: [
    UserService,
    CroisementService,
    BenevoleService,
    StandService,
    MailService
  ],
  declarations: [
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    GestionComponent,
    GestionStandsComponent,
    GestionBenevolesComponent,
    ErrorComponent,
    OrderByPipe
  ]
})
export class CoreModule { }
