import { Croisement } from "./croisement";




export class Stand {
  id:number;
  nom: string;
  description:string;
  bulle:string;
  ordre:number;
  Croisements: Croisement[];
  croisements: Croisement[];
}