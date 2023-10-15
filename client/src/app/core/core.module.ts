import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule} from "../app-routing.module";
import { FormsModule} from "@angular/forms";
import { OrderByPipe} from "../sort.pipe";
import { ConfigService, ValidationService, TransmissionService, CroisementService, EvenementService, BenevoleService, StandService, MailService, ExcelService, CreneauService} from "../services";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { GestionEvenementsComponent, ErrorComponent, InscriptionComponent, ConnexionComponent, GestionComponent, CreationComponent, GestionStandsComponent, GestionMajStandsComponent, GestionMajConfigComponent, GestionBenevolesComponent, GestionMajCreneauxComponent} from "../pages";
import { ImageCropperModule } from 'ngx-image-cropper';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ImageCropperModule,
    NgbModule,
    FontAwesomeModule
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
