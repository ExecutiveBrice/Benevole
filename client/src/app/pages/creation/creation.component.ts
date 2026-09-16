import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigService, EvenementService, TransmissionService, MailService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Evenement, Email } from '../../models';
import QRCode from 'qrcode'
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Params } from '../../models/params';
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-creation',
  standalone: true,
  providers: [ConfigService, provideNativeDateAdapter()],
  imports: [ReactiveFormsModule,
    FormsModule, MatFormFieldModule, MatInputModule,
    MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss']
})

export class CreationComponent implements OnInit {


  qrcode!: string
  header!: string
  using!: string
  managing!: string

  evenement: Evenement = new Evenement();
  new!: boolean;
  ok!: boolean;
  params!: Params
  error!: boolean
  formulaire = this.formBuilder.group({

    eventName: [this.evenement.eventName, [Validators.required]],
    contactEmail: [this.evenement.contactEmail, [Validators.required, Validators.email]],
    contactTel: [this.evenement.contactTel, []],
    contact: [this.evenement.contact, []],
    endDate: [this.evenement.endDate, []]
  })

  constructor(
    public mailService: MailService,
    public configService: ConfigService,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder) {
    console.log(this.formulaire)
  }


  ngOnInit() {
    this.params = JSON.parse(localStorage.getItem('allParams')!);
    console.log(this.params)

    this.new = true;
    this.ok = true;
  }



  create(): void {
    console.log(this.formulaire)



    if (this.formulaire.valid) {



      this.evenementService.ajout(Object.assign(this.evenement, this.formulaire.value)).subscribe({
        next: (data) => {

        this.new = false
        this.ok = true

        var using_address = this.params.url + "/" + data.id
        var managing_address = this.params.url + "/gestion/" + data.id

        this.header = this.configService.completeTemplate(this.params.header, this.evenement.eventName, using_address, managing_address)
        this.using = this.configService.completeTemplate(this.params.using, this.evenement.eventName, using_address, managing_address)
        this.managing = this.configService.completeTemplate(this.params.managing, this.evenement.eventName, using_address, managing_address)


        // With promises
        QRCode.toDataURL(using_address)
          .then(url => {
            this.qrcode = url

          })
          .catch(err => {
            console.error(err)
          })



      },
        error: (error: HttpErrorResponse) => {
          console.log('😢 Oh no!', error);
          this.toastr.error(error.message, 'Erreur');
        }
      });


    }

  }


}
