import { FormGroup } from "@angular/forms";
import { Croisement } from "./croisement";
import { Evenement } from './evenement';




export class Stand {
  id!:number;
  nom!: string;
  soustitre!: string;
  ordre!:number;
  type!:number;
  placeOccupe!:number;
  placeTotal!:number;
  croisements!: Croisement[];
  evenement!:Evenement;
  formulaire!:FormGroup;
}
