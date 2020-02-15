import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule} from "../app-routing.module";
import { FormsModule} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { OrderByPipe} from "../sort.pipe";
import { UserService, CroisementService, BenevoleService, StandService, MailService, ConfigService, ExcelService, CreneauService, SMSService} from "../services";
import { LoginComponent} from "../pages/login/login.component";
import { SignupComponent} from "../pages/signup/signup.component";
import { DashboardComponent} from "../pages/dashboard/dashboard.component";
import { GestionComponent} from "../pages/gestion/gestion.component";
import { GestionStandsComponent} from "../pages/gestionStands/gestionStands.component";
import { GestionMajStandsComponent} from "../pages/gestionMajStands/gestionMajStands.component";
import { GestionMajConfigComponent} from "../pages/gestionMajConfig/gestionMajConfig.component";
import { GestionBenevolesComponent} from "../pages/gestionBenevoles/gestionBenevoles.component";
import { GestionMajCreneauxComponent} from "../pages/gestionMajCreneaux/gestionMajCreneaux.component";
import { GestionSMSComponent} from "../pages/gestionSMS/gestionSMS.component";

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
    MailService,
    ConfigService,
    ExcelService,
    CreneauService,
    SMSService
  ],
  declarations: [
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    GestionComponent,
    GestionStandsComponent,
    GestionSMSComponent,
    GestionMajStandsComponent,
    GestionBenevolesComponent,
    GestionMajCreneauxComponent,
    GestionMajConfigComponent,
    ErrorComponent,
    OrderByPipe
  ]
})
export class CoreModule { }
