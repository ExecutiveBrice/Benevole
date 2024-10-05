import { FormGroup } from '@angular/forms';
import { Evenement } from './evenement';



export class Creneau {
  id!: number;
  plage!: string;
  ordre!:number;
  evenement!:Evenement;
  formulaire!:FormGroup;
}