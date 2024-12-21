
import { Component, inject, OnInit } from '@angular/core';
import { BenevoleService, ConfigService, ExcelService } from '../../services';
import { CroisementService, StandService, MailService, EvenementService, TransmissionService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { Benevole, Croisement, Evenement, Stand } from '../../models';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalAddBenComponent } from '../../components/modalAddBen/modalAddBen.component';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../components/modal/modal.component';
import { ToastrService } from 'ngx-toastr';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-gestionStands',
  standalone: true,
  templateUrl: './gestionStands.component.html',
  styleUrls: ['./gestionStands.component.scss'],
  imports: [NgClass,
    DatePipe, AsyncPipe,
    ImageCropperComponent,
    RouterModule, MatAutocompleteModule,
    MatStepperModule, MatSidenavModule, MatButtonModule, MatChipsModule,
    ReactiveFormsModule, MatCardModule, MatCheckboxModule, MatSlideToggleModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatDatepickerModule, MatIconModule, MatButtonModule, OrderByPipe, MatExpansionModule],
  providers: [
    EvenementService,
    CroisementService,
    StandService,
    ExcelService,
    BenevoleService,
    ConfigService
  ],
})

export class GestionStandsComponent implements OnInit {
  authorize: boolean = false;
  stands: Stand[] = [];
  evenement: Evenement = new Evenement();
  idEvenement!: number

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    public excelService: ExcelService,
    public evenementService: EvenementService,
    public transmissionService: TransmissionService,
    public benevoleService: BenevoleService,
    public croisementService: CroisementService,
    public standService: StandService,
    public mailService: MailService,
    public sanitizer: DomSanitizer) {

  }


  ngOnInit() {
    this.idEvenement = parseInt(this.route.snapshot.paramMap.get('id')!)

    this.authorize = JSON.parse(localStorage.getItem('isValidAccessForEvent')!) == this.idEvenement ? true : false;
    if (this.authorize) {
      this.getEvenement(this.idEvenement);
      this.getAll();
    } else {
      this.router.navigate([this.idEvenement + '/gestion/']);
    }



  }

  getEvenement(idEvenement: number): void {
    this.evenementService.getById(idEvenement).subscribe(data => {
      this.evenement = data;
      this.transmissionService.dataTransmission(data);
    },
      error => {
        console.log('😢 Oh no!', error);
      });
  }

  benevoles!: Benevole[]
  getAll(): void {

    this.benevoleService.getByEvenementId(this.idEvenement).subscribe({
      next: (benevoles) => {
        this.benevoles = benevoles;

        this.standService.getAll(this.idEvenement).subscribe({
          next: (stands) => {
            this.stands = stands;
            console.log(this.stands);


            stands.forEach(stand => {
              stand.croisements.forEach(croisement => {
                croisement.benevoles.forEach(benevole => {
                  const ben = this.benevoles.find(ben => ben.id == benevole.id)!
                  benevole.telephone = ben.telephone
                  benevole.email = ben.email


                })

              });


            });

          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error(error.message, 'Erreur');
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.message, 'Erreur');
      }
    })


  }


  addBen(croisement: Croisement, stand: Stand) {
    this.dialog.open(ModalAddBenComponent, {
      height: '50%',
      width: '50%',
      hasBackdrop: true, disableClose: true, backdropClass: 'backdropBackground',
      data: {
        title: 'Ajout au stand ' + stand.nom + ' de ' + croisement.creneau.plage,
        benevoles: this.benevoles,
        needtel: this.evenement.needtel
      },
    }).afterClosed().subscribe(benevole => {
      console.log(benevole);
      
      if (benevole.id == 0) {

        benevole.email = benevole.email.toLowerCase();
        benevole.email = benevole.email.trimEnd();
        benevole.email = benevole.email.trimStart();

        this.benevoleService.add(benevole, this.idEvenement).subscribe({
          next: (data) => {
            benevole = data;

            this.updateCroisement(croisement, benevole,stand);
          },
            error: (error: HttpErrorResponse) => {
              console.log(error)
   
                this.toastr.error(error.message, 'Erreur');
              
            }
         
        })

      } else {

        this.updateCroisement(croisement, benevole, stand);
      }
    });
  }


updateCroisement(croisement: Croisement,benevole :Benevole, stand: Stand) {
  
  this.benevoleService.addToCroisement(benevole.id, croisement.id, true).subscribe({
    next: (data) => {
      console.log(data);
      croisement.benevoles.push(data)
      this.toastr.success(benevole.nom + ' ' + benevole.prenom + ' à bien été ajouté à l\'horaire ' + croisement.creneau.plage + ' du stand ' + stand.nom, 'Succès');
    },
    error: (error: HttpErrorResponse) => {
      console.log(error)
      if (error.status == 406) {
        this.toastr.error("Limite atteinte", 'Erreur');
      } else if (error.status == 409) {
        this.toastr.error("Déjà inscrit", 'Erreur');
      }else {
        this.toastr.error(error.message, 'Erreur');
      }

    }
  })
}

  async exportAsXLSX() {
    this.excelService.multiExportAsExcelFile(this.stands, 'Stands');

  }


  dialog = inject(MatDialog);
  delete(benevole: Benevole, croisement: Croisement, stand: Stand): void {
    console.log(croisement);

    this.dialog.open(ModalComponent, {
      data: {
        title: 'Suppression',
        question: 'Souhaitez vous retirer ' + benevole.nom + ' ' + benevole.prenom + ' de l\'horaire ' + croisement.creneau.plage + ' du stand ' + stand.nom,
      },
    }).afterClosed().subscribe(result => {
      if (result !== undefined && result == 'accept') {

        this.benevoleService.removeToCroisement(benevole.id, croisement.id).subscribe({
          next: (data) => {
            console.log(data);
            croisement.benevoles = croisement.benevoles.filter(ben => ben.id != benevole.id);
            this.toastr.success(benevole.nom + ' ' + benevole.prenom + ' à bien été retiré de l\'horaire ' + croisement.creneau.plage + ' du stand ' + stand.nom, 'Succès');
          },
          error: (error: HttpErrorResponse) => {
            console.log(error)
            this.toastr.error(error.message, 'Erreur');
          }
        })
      }
    });
  }






}