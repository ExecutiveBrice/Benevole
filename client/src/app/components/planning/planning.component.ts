import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Benevole, Croisement, Evenement, Stand } from '../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BenevoleService, StandService, TransmissionService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatCardModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatExpansionModule, MatIconModule, OrderByPipe],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss'
})
export class PlanningComponent implements OnInit {

  @Input() evenement!: Evenement;
  @Input() benevole: Benevole | undefined;
@Output() actionEmitter: EventEmitter<boolean> = new EventEmitter;

  constructor(
    public benevoleService: BenevoleService,
    public transmissionService: TransmissionService,
    public standService: StandService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getStand()

    this.transmissionService.benevoleStream.subscribe(benevole => {
      this.fillBenevole(benevole);
    });
  }


  stands: Stand[] = [];
  choix!: String;
  sansChoix: Croisement[] = [];
  activites: Stand[] = [];

  besoins: Croisement[] = [];
  preparatifs: Stand[] = [];
  postparatifs: Stand[] = [];









  occupepreparatifs: number = 0;
  occupeactivites: number = 0;
  occupesansChoix: number = 0;
  occupebesoins: number = 0;
  occupepostparatifs: number = 0;
  totalpreparatifs: number = 0;
  totalactivites: number = 0;
  totalsansChoix: number = 0;
  totalbesoins: number = 0;
  totalpostparatifs: number = 0;





  checkStands(stands: Stand[]): number {
    let nbben = 0;
    stands.forEach(stand => {
      nbben += this.checkCroisements(stand.croisements)
    });
    return nbben;
  }


  checkCroisements(croisements: Croisement[]): number {
    let nbben = 0;
    croisements.forEach(croisement => {
      nbben += croisement.benevoles.length;
      croisement.selected = false;
      this.benevole?.croisements.forEach(crois => {
        if (crois.id == croisement.id) {
          croisement.selected = true;
        }
      })
    })
    return nbben;
  }


  fillBenevole(benevole: Benevole) {
    console.log(benevole);

    if (benevole != null) {
      this.benevole = benevole;

      this.checkStands(this.preparatifs)
      this.checkStands(this.activites)
      this.checkStands(this.postparatifs)
      this.checkCroisements(this.besoins)
      this.checkCroisements(this.sansChoix)
      this.updateSum()
    } else {
      console.log("pas de benevole avec cette email")
    }
  }



  updateSum() {
    this.occupepreparatifs = this.preparatifs.reduce((sum, current) => sum + current.placeOccupe, 0)
    this.occupeactivites = this.activites.reduce((sum, current) => sum + current.placeOccupe, 0)
    this.occupesansChoix = this.sansChoix.reduce((sum, current) => sum + current.benevoles.length, 0)
    this.occupebesoins = this.besoins.reduce((sum, current) => sum + current.benevoles.length, 0)
    this.occupepostparatifs = this.postparatifs.reduce((sum, current) => sum + current.placeOccupe, 0)

    this.totalpreparatifs = this.preparatifs.reduce((sum, current) => sum + current.placeTotal, 0)
    this.totalactivites = this.activites.reduce((sum, current) => sum + current.placeTotal, 0)
    this.totalsansChoix = this.sansChoix.reduce((sum, current) => sum + current.limite, 0)
    this.totalbesoins = this.besoins.reduce((sum, current) => sum + current.limite, 0)
    this.totalpostparatifs = this.postparatifs.reduce((sum, current) => sum + current.placeTotal, 0)

    this.stands.forEach(stand => {
      stand.placeOccupe = 0;
      stand.placeTotal = 0;
      stand.croisements.forEach(croisement => {
        stand.placeOccupe += croisement.benevoles.length;
        stand.placeTotal += croisement.limite;
      })
    })
  }

  updateStand(stand: Stand) {
    stand.placeOccupe = 0
    stand.placeTotal = 0
    stand.croisements.forEach(croisement => {
      if (croisement.besoin == true) {
        this.besoins!.push(croisement);
      }
      stand.placeOccupe += croisement.benevoles.length;
      stand.placeTotal += croisement.limite;
    })
  }

  getStand(): void {
    this.besoins = []
    this.sansChoix = []
    this.preparatifs = []
    this.postparatifs = []
    this.activites = []
    this.standService.getAll(this.evenement.id).subscribe({
      next: (stands) => {
        console.log(stands);

        this.stands = stands;
        stands.forEach(stand => {
          if (stand.croisements != null) {
            if (stand.type == 2) {
              this.updateStand(stand)
              this.activites.push(stand)
            } else if (stand.type == 1) {
              stand.croisements.forEach(croisement => {
                if (croisement.besoin == true) {
                  this.besoins!.push(croisement);
                }

                this.sansChoix!.push(croisement)
              })
            } else if (stand.type == 5) {
              this.updateStand(stand)
              this.preparatifs!.push(stand)

            } else if (stand.type == 6) {
              this.updateStand(stand)
              this.postparatifs!.push(stand)
            }
          }
        })
        this.updateSum()
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
  }

  updateCroisementListe(croisements: Croisement[]): void {
    for (let index = 0; index < croisements.length; index++) {
      for (let indexb = 0; indexb < croisements[index].benevoles.length; indexb++) {
        if (croisements[index].benevoles[indexb].id == this.benevole?.id) {
          croisements[index].selected = true;
          this.benevole?.croisements.push(croisements[index]);
          break;
        } else {
          croisements[index].selected = false;
        }
      }
    }
  }

  removeFromBenevole(croisement: Croisement) {
    this.stands.forEach(stand => {
      const crois = stand.croisements.find(crois => crois.id == croisement.id)
      if (crois) {
        this.choisir(crois)
      }
    })
  }

  choisir(croisement: Croisement): void {
    console.log(this.benevole);

    if (!this.benevole) {
      this.toastr.error("Connectez vous pour choisir un stand", 'Erreur');
      this.actionEmitter.emit(true);
    } else if (croisement.benevoles != undefined && croisement.benevoles.find(benevole => benevole.id == this.benevole?.id) == undefined && croisement.benevoles.length >= croisement.limite) {
      this.toastr.error("Ce créneau est complet, choisisez en un autre", 'Erreur');
    } else {
      if (this.benevole?.croisements.filter(crois => crois.id == croisement.id).length > 0) {
        this.retraitCroisement(croisement);
      } else {
        this.ajoutCroisement(croisement);
      }
    }
  }

  retraitCroisement(croisement: Croisement) {
    this.benevoleService.removeToCroisement(this.benevole!.id, croisement.id).subscribe({
      next: (benevole) => {
        croisement.selected = false;
        croisement.benevoles = croisement.benevoles.filter(benevole => benevole.id != this.benevole?.id)
        this.fillBenevole(benevole);
        this.transmissionService.benevoleTransmission(benevole);
        this.toastr.success("Votre choix à bien été retirée", "Merci,")
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.toastr.error(error.message, 'Erreur');
      }
    })
  }

  ajoutCroisement(croisement: Croisement) {
    if (croisement.benevoles.length < croisement.limite) {
      this.benevoleService.addToCroisement(this.benevole!.id, croisement.id, false).subscribe({
        next: (benevole) => {
          croisement.selected = true;
          croisement.benevoles.push(benevole)
          this.fillBenevole(benevole);
          this.transmissionService.benevoleTransmission(benevole);
          this.toastr.success("Votre choix à bien été ajouté", "Merci,")
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.message, 'Erreur');
        }
      })
    }
  }

}


