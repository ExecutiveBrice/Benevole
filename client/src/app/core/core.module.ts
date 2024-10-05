import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule} from "../app-routing.module";
import { FormsModule} from "@angular/forms";
import { OrderByPipe} from "../sort.pipe";
import { FileService, ConfigService, ValidationService, TransmissionService, CroisementService, EvenementService, BenevoleService, StandService, MailService, ExcelService, CreneauService} from "../services";
import {NgbModal, NgbModalConfig, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { GestionEvenementsComponent, ErrorComponent, InscriptionComponent, ConnexionComponent, GestionComponent, CreationComponent, GestionStandsComponent, GestionMajStandsComponent, GestionMajConfigComponent, GestionBenevolesComponent, GestionMajCreneauxComponent} from "../pages";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalComponent } from '../pages/modal/modal.component';
import { ImageCropperComponent } from 'ngx-image-cropper';


@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    ImageCropperComponent
  ],
  exports: [
    AppRoutingModule
  ],
  providers: [
    FileService,
    CroisementService,
    BenevoleService,
    StandService,
    MailService,
    ExcelService,
    CreneauService,
    EvenementService,
    TransmissionService,
    ValidationService,
    ConfigService,
    NgbModalConfig,
    NgbModal
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
    ModalComponent,
    OrderByPipe
  ]
})
export class CoreModule { }
