import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule} from "../app-routing.module";
import { FormsModule} from "@angular/forms";
import { OrderByPipe} from "../sort.pipe";
import { ConfigService, ValidationService, TransmissionService, CroisementService, EvenementService, BenevoleService, StandService, MailService, ExcelService, CreneauService, SMSService} from "../services";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { GestionEvenementsComponent, ErrorComponent, InscriptionComponent, ConnexionComponent, GestionComponent, CreationComponent, GestionStandsComponent, GestionMajStandsComponent, GestionMajConfigComponent, GestionBenevolesComponent, GestionMajCreneauxComponent, GestionSMSComponent} from "../pages";
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ImageCropperModule,
    NgbModule
  ],
  exports: [
    AppRoutingModule
  ],
  providers: [
    CroisementService,
    BenevoleService,
    StandService,
    MailService,
    ExcelService,
    CreneauService,
    SMSService,
    EvenementService,
    TransmissionService,
    ValidationService,
    ConfigService
  ],
  declarations: [
    CreationComponent,
    InscriptionComponent, ConnexionComponent,
    GestionComponent,
    GestionStandsComponent,
    GestionSMSComponent,
    GestionMajStandsComponent,
    GestionBenevolesComponent,
    GestionMajCreneauxComponent,
    GestionMajConfigComponent,
    GestionEvenementsComponent,
    ErrorComponent,
    OrderByPipe
  ]
})
export class CoreModule { }
